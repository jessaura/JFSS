'use client';

import { useState, useMemo, FormEvent } from 'react';
import { useQuery, useConvex } from 'convex/react';
import { anyApi } from 'convex/server';
import type { Product, ProductColor } from '@/data/products';
import { products as localProducts } from '@/data/products';
import { money, Field, Skeleton, EmptyState, Icon } from './ui';
import { IMAGE_PENDING } from '@/data/images';
import ImageUpload from './ImageUpload';
import {
  getStoredCatalogueOverrides,
  saveStoredCatalogueOverride,
  removeStoredCatalogueOverride,
} from '@/components/providers/CatalogueProvider';

type ProductDoc = Product & { _id: string; productId: string; stock?: number };

const FLAGS = ['featured', 'new', 'bestSeller', 'clearance'] as const;

/** New productId for a piece created in the admin (module scope, not render). */
function freshProductId() {
  return `p${Date.now().toString(36)}`;
}

/** Shape a product into the field set upsertProduct accepts (drops _id etc.). */
function toFields(p: Product & { stock?: number }) {
  return {
    name: p.name,
    slug: p.slug,
    price: p.price,
    ...(p.originalPrice ? { originalPrice: p.originalPrice } : {}),
    description: p.description,
    shortDescription: p.shortDescription,
    category: p.category,
    subcategory: p.subcategory,
    fabric: p.fabric ?? '',
    colors: p.colors ?? [],
    sizes: p.sizes ?? [],
    images: p.images ?? [],
    tags: p.tags ?? [],
    featured: Boolean(p.featured),
    new: Boolean(p.new),
    bestSeller: Boolean(p.bestSeller),
    ...(p.clearance !== undefined ? { clearance: p.clearance } : {}),
    rating: p.rating ?? 0,
    reviews: p.reviews ?? 0,
    ...(p.stock !== undefined ? { stock: p.stock } : {}),
    ...(p.sold !== undefined ? { sold: p.sold } : {}),
    ...(p.variants ? { variants: p.variants } : {}),
  };
}

export default function Products({
  adminKey,
  notify,
}: {
  adminKey: string;
  notify: (msg: string) => void;
}) {
  const dbProducts = useQuery(anyApi.products.list) as ProductDoc[] | undefined;
  const convex = useConvex();
  const [editing, setEditing] = useState<ProductDoc | 'new' | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | ProductDoc['category']>('all');

  // Local overrides with localStorage persistence & broadcast
  type Override = Partial<ProductDoc> & { _deleted?: boolean };
  const [localOverrides, setLocalOverrides] = useState<Record<string, Override>>(() => getStoredCatalogueOverrides());

  const allProducts: ProductDoc[] = useMemo(() => {
    // Always start from the full static catalogue, keyed by productId, then
    // overlay any product that exists in Convex (real _id + edits). This is why
    // saving one product no longer hides the other 69: Convex is an overlay on
    // the 70, not a replacement for them.
    const byId = new Map<string, ProductDoc>();
    localProducts.forEach((p, i) => {
      const pid = p.id || `p${i}`;
      byId.set(pid, { _id: pid, productId: pid, ...p, stock: p.stock ?? 10 });
    });
    (dbProducts ?? []).forEach((d) => byId.set(d.productId, d));

    return [...byId.values()]
      .map((p) => {
        const patch = localOverrides[p.productId] || localOverrides[p.id] || localOverrides[p._id];
        return patch ? { ...p, ...patch } : p;
      })
      .filter((p) => !(p as Override)._deleted);
  }, [dbProducts, localOverrides]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allProducts.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q))
    );
  }, [allProducts, search, category]);

  // upsert by productId so a change persists to Convex even for a piece that
  // until now only lived in the static catalogue (unknown Convex id).
  async function persist(p: ProductDoc, patch: Partial<ProductDoc>) {
    saveStoredCatalogueOverride(p.productId || p.id, patch);
    await convex.mutation(anyApi.admin.upsertProduct, {
      adminKey,
      productId: p.productId,
      product: toFields({ ...p, ...patch }),
    });
  }

  async function toggle(p: ProductDoc, flag: (typeof FLAGS)[number]) {
    const newValue = !p[flag];
    saveStoredCatalogueOverride(p.productId || p.id, { [flag]: newValue });
    setLocalOverrides((prev) => ({
      ...prev,
      [p.productId || p.id]: { ...(prev[p.productId || p.id] || {}), [flag]: newValue },
      [p._id]: { ...(prev[p._id] || {}), [flag]: newValue },
    }));
    notify(`Updated ${p.name} (${flag}: ${newValue ? 'ON' : 'OFF'})`);
    try {
      await persist(p, { [flag]: newValue });
    } catch {
      // Local broadcast already stored
    }
  }

  async function setStock(p: ProductDoc, stock: number) {
    const newStock = Math.max(0, stock);
    saveStoredCatalogueOverride(p.productId || p.id, { stock: newStock });
    setLocalOverrides((prev) => ({
      ...prev,
      [p.productId || p.id]: { ...(prev[p.productId || p.id] || {}), stock: newStock },
      [p._id]: { ...(prev[p._id] || {}), stock: newStock },
    }));
    try {
      await persist(p, { stock: newStock });
    } catch {}
  }

  // Record a manual (WhatsApp/offline) sale: reduce stock — drawing down a
  // variant when the piece has a size×colour matrix — and tally units sold.
  async function recordSale(p: ProductDoc, qty = 1) {
    let variants = p.variants;
    let stock = p.stock ?? 0;
    if (variants && variants.length) {
      let remaining = qty;
      variants = variants.map((v) => {
        if (remaining > 0 && v.quantity > 0) {
          const take = Math.min(remaining, v.quantity);
          remaining -= take;
          return { ...v, quantity: v.quantity - take };
        }
        return v;
      });
      stock = variants.reduce((n, v) => n + v.quantity, 0);
    } else {
      stock = Math.max(0, stock - qty);
    }
    const sold = (p.sold ?? 0) + qty;
    const patch: Partial<ProductDoc> = { stock, sold, ...(p.variants ? { variants } : {}) };
    saveStoredCatalogueOverride(p.productId || p.id, patch);
    setLocalOverrides((prev) => ({
      ...prev,
      [p.productId || p.id]: { ...(prev[p.productId || p.id] || {}), ...patch },
      [p._id]: { ...(prev[p._id] || {}), ...patch },
    }));
    notify(`Recorded ${qty} sold — ${p.name}`);
    try {
      await persist(p, patch);
    } catch {}
  }

  async function remove(p: ProductDoc) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    removeStoredCatalogueOverride(p.productId || p.id);
    removeStoredCatalogueOverride(p._id);
    setLocalOverrides((prev) => ({
      ...prev,
      [p.productId || p.id]: { ...(prev[p.productId || p.id] || {}), _deleted: true },
      [p._id]: { ...(prev[p._id] || {}), _deleted: true },
    }));
    notify(`Deleted ${p.name}`);
    try {
      await convex.mutation(anyApi.admin.deleteProduct, { adminKey, id: p._id });
    } catch {}
  }

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label="Filter products by category">
          {(['all', 'women', 'men', 'kids', 'unisex'] as const).map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              className={`adm-tab ${category === c ? 'on' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
              <span className="adm-tab-count">
                {c === 'all' ? allProducts.length : allProducts.filter((p) => p.category === c).length}
              </span>
            </button>
          ))}
        </div>
        <div className="adm-toolbar-right">
          <div className="adm-search">
            <span className="adm-search-icon"><Icon.search /></span>
            <label htmlFor="adm-prod-search" className="adm-sr">Search products</label>
            <input
              id="adm-prod-search"
              className="adm-input"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="adm-btn adm-btn-primary" onClick={() => setEditing('new')}>
            <Icon.plus /> Add product
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={allProducts.length === 0 ? 'No products yet' : 'No products match'}
          body={
            allProducts.length === 0
              ? 'Run the seed:seed function in the Convex dashboard to import the starter catalogue, or add a product here.'
              : 'Try a different category or clear the search.'
          }
          action={
            <button className="adm-btn adm-btn-primary" onClick={() => setEditing('new')}>
              <Icon.plus /> Add product
            </button>
          }
        />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Flags</th>
                <th className="adm-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="adm-cell-product">
                      <img src={p.images[0] || IMAGE_PENDING} alt="" className="adm-thumb" />
                      <div className="adm-list-main">
                        <span className="adm-name">{p.name}</span>
                        <span className="adm-muted">
                          <code className="adm-pid">{p.productId}</code>
                          {p.subcategory ? ` · ${p.subcategory}` : ''}
                          {p.fabric ? ` · ${p.fabric}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="adm-cap">{p.category}</td>
                  <td>
                    <span className="adm-num">{p.price > 0 ? money(p.price) : <em className="adm-muted">Not priced</em>}</span>
                    {p.originalPrice && <span className="adm-strike">{money(p.originalPrice)}</span>}
                  </td>
                  <td>
                    <label className="adm-sr" htmlFor={`stock-${p._id}`}>Stock for {p.name}</label>
                    <input
                      id={`stock-${p._id}`}
                      type="number"
                      min="0"
                      className={`adm-stock-input ${typeof p.stock === 'number' && p.stock <= 5 ? 'low' : ''}`}
                      value={p.stock ?? 0}
                      onChange={(e) => setStock(p, Number(e.target.value))}
                    />
                    {(p.sold ?? 0) > 0 && <span className="adm-sold">{p.sold} sold</span>}
                  </td>
                  <td>
                    <div className="adm-flags">
                      {FLAGS.map((f) => (
                        <button
                          key={f}
                          className={`adm-chip ${p[f] ? 'on' : ''}`}
                          onClick={() => toggle(p, f)}
                          aria-pressed={Boolean(p[f])}
                          title={`Toggle ${f}`}
                        >
                          {f === 'bestSeller' ? 'best' : f}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button
                        className="adm-btn adm-btn-sm adm-btn-sold"
                        onClick={() => recordSale(p, 1)}
                        disabled={(p.stock ?? 0) <= 0}
                        title="Record one sold — reduces stock"
                      >
                        + Sold
                      </button>
                      <button className="adm-btn adm-btn-sm" onClick={() => setEditing(p)}>Edit</button>
                      <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => remove(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductForm
          adminKey={adminKey}
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(name, updatedFields, savedPid) => {
            if (updatedFields && savedPid) {
              setLocalOverrides((prev) => ({
                ...prev,
                [savedPid]: { ...(prev[savedPid] || {}), ...updatedFields },
              }));
            }
            setEditing(null);
            notify(`Saved ${name}`);
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  adminKey,
  product,
  onClose,
  onSaved,
}: {
  adminKey: string;
  product: ProductDoc | null;
  onClose: () => void;
  onSaved: (name: string, updated?: Partial<ProductDoc>, pid?: string) => void;
}) {
  const convex = useConvex();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: product?.name ?? '',
    price: product?.price !== undefined ? String(product.price) : '0',
    originalPrice: product?.originalPrice !== undefined ? String(product.originalPrice) : '0',
    category: product?.category ?? 'women',
    subcategory: product?.subcategory ?? '',
    fabric: product?.fabric ?? '',
    shortDescription: product?.shortDescription ?? '',
    description: product?.description ?? '',
    sizes: (product?.sizes ?? []).join(', '),
    tags: (product?.tags ?? []).join(', '),
    featured: product?.featured ?? false,
    isNew: product?.new ?? true,
    bestSeller: product?.bestSeller ?? false,
    clearance: product?.clearance ?? false,
    heroFeatured: product?.heroFeatured ?? false,
    heroCategory: product?.heroCategory ?? product?.category ?? 'women',
  });

  const [colors, setColors] = useState<ProductColor[]>(product?.colors ?? []);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [manualStock, setManualStock] = useState(product?.stock ?? 0);
  // Stock matrix quantities keyed "size|||colour". Reconciled against the
  // current sizes × colours on every render, so adding a size or colour just
  // grows the grid and quantities for existing cells are kept.
  const [variantQty, setVariantQty] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    (product?.variants ?? []).forEach((v) => { m[`${v.size}|||${v.color}`] = v.quantity; });
    return m;
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const sizeList = form.sizes.split(',').map((s) => s.trim()).filter(Boolean);
  const colorCols = colors.length ? colors.map((c) => c.name) : ['']; // '' = colourless column
  const hasMatrix = sizeList.length > 0;
  const qk = (size: string, color: string) => `${size}|||${color}`;
  const getQty = (size: string, color: string) => variantQty[qk(size, color)] ?? 0;
  const setQty = (size: string, color: string, n: number) =>
    setVariantQty((m) => ({ ...m, [qk(size, color)]: Math.max(0, n || 0) }));

  const matrixVariants = hasMatrix
    ? sizeList.flatMap((size) => colorCols.map((color) => ({ size, color, quantity: getQty(size, color) })))
    : [];
  const matrixTotal = matrixVariants.reduce((n, v) => n + v.quantity, 0);

  function updateColor(i: number, patch: Partial<ProductColor>) {
    setColors((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function addColor() {
    setColors((cs) => [...cs, { name: `Colour ${cs.length + 1}`, hex: '#1C1917', image: '' }]);
  }
  function removeColor(i: number) {
    setColors((cs) => cs.filter((_, idx) => idx !== i));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const shared = {
      name: form.name,
      price: Number(form.price),
      ...(Number(form.originalPrice) > 0 ? { originalPrice: Number(form.originalPrice) } : {}),
      category: form.category as ProductDoc['category'],
      subcategory: form.subcategory,
      fabric: form.fabric,
      shortDescription: form.shortDescription,
      description: form.description,
      sizes: sizeList,
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      featured: form.featured,
      new: form.isNew,
      bestSeller: form.bestSeller,
      clearance: form.clearance,
      heroFeatured: form.heroFeatured,
      heroCategory: form.heroCategory,
      // Colour rows (each with its own uploaded image), the gallery, and the
      // stock matrix — the pieces this form now owns.
      colors: colors.map((c) => ({ name: c.name.trim(), hex: c.hex, image: c.image })),
      images: images.filter(Boolean),
      variants: matrixVariants,
      // When a matrix exists it is the source of truth for stock; otherwise the
      // manual number stands in for a variant-less piece.
      stock: hasMatrix ? matrixTotal : Number(manualStock),
    };
    // Upsert by productId: patches the Convex record if it exists, otherwise
    // creates it — so editing a piece that only lived in the static catalogue
    // just works instead of erroring on an unknown id.
    const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const productId = product?.productId || freshProductId();
    const full = {
      ...shared,
      slug: product?.slug || slugify(form.name),
      rating: product?.rating ?? 0,
      reviews: product?.reviews ?? 0,
    };
    saveStoredCatalogueOverride(productId, full);
    try {
      await convex.mutation(anyApi.admin.upsertProduct, { adminKey, productId, product: full });
    } catch {}
    onSaved(form.name, full, productId);
    setBusy(false);
  }

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <form
        className="adm-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label={product ? `Edit ${product.name}` : 'New product'}
      >
        <header className="adm-modal-head">
          <h2 className="adm-modal-title">{product ? `Edit — ${product.name}` : 'New product'}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close">
            <Icon.close />
          </button>
        </header>

        <fieldset className="adm-fieldset">
          <legend>Basics</legend>
          <div className="adm-grid">
            <Field label="Name" required>
              <input className="adm-input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </Field>
            <Field label="Fabric">
              <input className="adm-input" value={form.fabric} onChange={(e) => set('fabric', e.target.value)} />
            </Field>
            <Field label="Category">
              <select
                className="adm-input"
                value={form.category}
                onChange={(e) => set('category', e.target.value as ProductDoc['category'])}
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </select>
            </Field>
            <Field label="Subcategory">
              <input className="adm-input" value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="adm-fieldset">
          <legend>Pricing</legend>
          <div className="adm-grid">
            <Field label="Price (£)" hint="0 = price on request">
              <input
                className="adm-input"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 32.90"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
              />
            </Field>
            <Field label="Original price (£)" hint="0 = no markdown">
              <input
                className="adm-input"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 45.00"
                value={form.originalPrice}
                onChange={(e) => set('originalPrice', e.target.value)}
              />
            </Field>
          </div>
        </fieldset>

        {/* Gallery — uploaded to Convex storage. First image is the main photo. */}
        <fieldset className="adm-fieldset">
          <legend>Photos</legend>
          <p className="adm-hint">The first photo is the main image. Upload from your computer — no file names or redeploys needed.</p>
          <div className="adm-gallery">
            {images.map((img, i) => (
              <div className="adm-gallery-item" key={i}>
                <ImageUpload
                  adminKey={adminKey}
                  value={img}
                  onChange={(url) => setImages((arr) => arr.map((x, idx) => (idx === i ? url : x)))}
                  onClear={() => setImages((arr) => arr.filter((_, idx) => idx !== i))}
                />
                {i === 0 && <span className="adm-gallery-main">Main</span>}
              </div>
            ))}
            <ImageUpload adminKey={adminKey} value="" onChange={(url) => setImages((arr) => [...arr, url])} />
          </div>
        </fieldset>

        {/* Colours — each with its own uploaded image. This is the flaw fix. */}
        <fieldset className="adm-fieldset">
          <legend>Colours</legend>
          <p className="adm-hint">Add each colourway with its own swatch and photo. Shoppers see the matching photo when they pick a colour.</p>
          <div className="adm-colors">
            {colors.map((c, i) => (
              <div className="adm-color-row" key={i}>
                <ImageUpload
                  adminKey={adminKey}
                  value={c.image}
                  onChange={(url) => updateColor(i, { image: url })}
                  onClear={() => updateColor(i, { image: '' })}
                  size="sm"
                />
                <div className="adm-color-fields">
                  <input
                    className="adm-input"
                    placeholder="Colour name"
                    value={c.name}
                    onChange={(e) => updateColor(i, { name: e.target.value })}
                    aria-label={`Colour ${i + 1} name`}
                  />
                  <input
                    type="color"
                    className="adm-color-swatch"
                    value={c.hex}
                    onChange={(e) => updateColor(i, { hex: e.target.value })}
                    aria-label={`Colour ${i + 1} swatch`}
                  />
                </div>
                <button type="button" className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => removeColor(i)}>Remove</button>
              </div>
            ))}
          </div>
          <button type="button" className="adm-btn adm-btn-ghost" onClick={addColor}>
            <Icon.plus /> Add colour
          </button>
        </fieldset>

        <fieldset className="adm-fieldset">
          <legend>Copy</legend>
          <Field label="Short description">
            <input className="adm-input" value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className="adm-input adm-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
          </Field>
          <div className="adm-grid">
            <Field label="Sizes" hint="Comma separated">
              <input className="adm-input" value={form.sizes} onChange={(e) => set('sizes', e.target.value)} />
            </Field>
            <Field label="Tags" hint="Comma separated">
              <input className="adm-input" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
            </Field>
          </div>
        </fieldset>

        {/* Stock matrix — one quantity per size × colour. */}
        <fieldset className="adm-fieldset">
          <legend>Stock {hasMatrix && <span className="adm-legend-total">· {matrixTotal} units</span>}</legend>
          {hasMatrix ? (
            <>
              <p className="adm-hint">A quantity for every size and colour. Total stock is their sum, and each order draws down the exact size &amp; colour bought.</p>
              <div className="adm-matrix-wrap">
                <table className="adm-matrix">
                  <thead>
                    <tr>
                      <th>Size</th>
                      {colorCols.map((c) => (
                        <th key={c || '—'}>{c || '—'}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeList.map((size) => (
                      <tr key={size}>
                        <th scope="row">{size}</th>
                        {colorCols.map((color) => (
                          <td key={color || '—'}>
                            <label className="adm-sr">{size} {color || 'no colour'} quantity</label>
                            <input
                              type="number"
                              min="0"
                              className="adm-matrix-input"
                              value={getQty(size, color)}
                              onChange={(e) => setQty(size, color, Number(e.target.value))}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <Field label="Stock" hint="Add sizes above for a per-size/colour matrix. Decrements on each order.">
              <input className="adm-input" type="number" min="0" step="1" value={manualStock} onChange={(e) => setManualStock(Number(e.target.value))} />
            </Field>
          )}
        </fieldset>

        <fieldset className="adm-fieldset">
          <legend>Merchandising &amp; Mobile Hero Placement</legend>
          <div className="adm-checks">
            {([
              ['featured', 'Featured'],
              ['isNew', 'New'],
              ['bestSeller', 'Best seller'],
              ['clearance', 'Clearance'],
              ['heroFeatured', '✨ Showcase in Mobile Hero Carousel'],
            ] as const).map(([key, label]) => (
              <label key={key} className="adm-check">
                <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>

          {form.heroFeatured && (
            <div style={{ marginTop: 12 }}>
              <Field label="Hero Showcase Category" hint="Which category this product headlines in the mobile hero carousel">
                <select
                  className="adm-input"
                  value={form.heroCategory}
                  onChange={(e) => set('heroCategory', e.target.value)}
                >
                  <option value="women">Women's Atelier</option>
                  <option value="men">Men's Everyday</option>
                  <option value="kids">Kids &amp; Juniors</option>
                  <option value="bestseller">Best Seller Edit</option>
                  <option value="festive">The Heritage / Festive Edit</option>
                </select>
              </Field>
            </div>
          )}
        </fieldset>

        {error && <p className="adm-error" role="alert">{error}</p>}

        <div className="adm-modal-actions">
          <button type="button" className="adm-btn adm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn adm-btn-primary" disabled={busy}>
            {busy ? 'Saving…' : product ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </div>
  );
}
