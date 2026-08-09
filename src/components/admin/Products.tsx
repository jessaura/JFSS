'use client';

import { useState, useMemo, FormEvent } from 'react';
import { useQuery, useConvex } from 'convex/react';
import { anyApi } from 'convex/server';
import type { Product } from '@/data/products';
import { money, Field, Skeleton, EmptyState, Icon } from './ui';
import { IMAGE_PENDING } from '@/data/images';

type ProductDoc = Product & { _id: string; productId: string; stock?: number };

const FLAGS = ['featured', 'new', 'bestSeller', 'clearance'] as const;

export default function Products({
  adminKey,
  notify,
}: {
  adminKey: string;
  notify: (msg: string) => void;
}) {
  const products = useQuery(anyApi.products.list) as ProductDoc[] | undefined;
  const convex = useConvex();
  const [editing, setEditing] = useState<ProductDoc | 'new' | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | ProductDoc['category']>('all');

  const rows = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q))
    );
  }, [products, search, category]);

  async function toggle(p: ProductDoc, flag: (typeof FLAGS)[number]) {
    await convex.mutation(anyApi.admin.updateProduct, {
      adminKey,
      id: p._id,
      patch: { [flag]: !p[flag] },
    });
  }

  async function setStock(p: ProductDoc, stock: number) {
    await convex.mutation(anyApi.admin.updateProduct, {
      adminKey,
      id: p._id,
      patch: { stock: Math.max(0, stock) },
    });
  }

  async function remove(p: ProductDoc) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await convex.mutation(anyApi.admin.deleteProduct, { adminKey, id: p._id });
    notify(`Deleted ${p.name}`);
  }

  if (!products) return <Skeleton rows={6} />;

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
                {c === 'all' ? products.length : products.filter((p) => p.category === c).length}
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
          title={products.length === 0 ? 'No products yet' : 'No products match'}
          body={
            products.length === 0
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
                        <span className="adm-muted">{p.subcategory} · {p.fabric}</span>
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
          onSaved={(name) => {
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
  onSaved: (name: string) => void;
}) {
  const convex = useConvex();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: product?.name ?? '',
    price: product?.price ?? 0,
    originalPrice: product?.originalPrice ?? 0,
    stock: product?.stock ?? 10,
    category: product?.category ?? 'women',
    subcategory: product?.subcategory ?? '',
    fabric: product?.fabric ?? '',
    shortDescription: product?.shortDescription ?? '',
    description: product?.description ?? '',
    sizes: (product?.sizes ?? ['XS', 'S', 'M', 'L', 'XL']).join(', '),
    tags: (product?.tags ?? []).join(', '),
    image: product?.images[0] ?? '/images/hero-casual.png',
    featured: product?.featured ?? false,
    isNew: product?.new ?? true,
    bestSeller: product?.bestSeller ?? false,
    clearance: product?.clearance ?? false,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const shared = {
      name: form.name,
      price: Number(form.price),
      ...(Number(form.originalPrice) > 0 ? { originalPrice: Number(form.originalPrice) } : {}),
      stock: Number(form.stock),
      category: form.category as ProductDoc['category'],
      subcategory: form.subcategory,
      fabric: form.fabric,
      shortDescription: form.shortDescription,
      description: form.description,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      featured: form.featured,
      new: form.isNew,
      bestSeller: form.bestSeller,
      clearance: form.clearance,
    };
    try {
      if (product) {
        await convex.mutation(anyApi.admin.updateProduct, { adminKey, id: product._id, patch: shared });
      } else {
        const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await convex.mutation(anyApi.admin.createProduct, {
          adminKey,
          product: {
            ...shared,
            slug,
            colors: [{ name: 'Default', hex: '#9B0000', image: form.image }],
            images: [form.image],
            rating: 4.5,
            reviews: 0,
          },
        });
      }
      onSaved(form.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed — check the fields and try again.');
    } finally {
      setBusy(false);
    }
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
            {!product && (
              <Field label="Image path" hint="A file in /public/images">
                <input className="adm-input" value={form.image} onChange={(e) => set('image', e.target.value)} />
              </Field>
            )}
          </div>
        </fieldset>

        <fieldset className="adm-fieldset">
          <legend>Pricing &amp; stock</legend>
          <div className="adm-grid">
            <Field label="Price (£)" required>
              <input className="adm-input" type="number" min="0" step="1" value={form.price} onChange={(e) => set('price', Number(e.target.value))} required />
            </Field>
            <Field label="Original price (£)" hint="0 = no markdown">
              <input className="adm-input" type="number" min="0" step="1" value={form.originalPrice} onChange={(e) => set('originalPrice', Number(e.target.value))} />
            </Field>
            <Field label="Stock" hint="Decrements on each order">
              <input className="adm-input" type="number" min="0" step="1" value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} />
            </Field>
          </div>
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

        <fieldset className="adm-fieldset">
          <legend>Merchandising</legend>
          <div className="adm-checks">
            {([
              ['featured', 'Featured'],
              ['isNew', 'New'],
              ['bestSeller', 'Best seller'],
              ['clearance', 'Clearance'],
            ] as const).map(([key, label]) => (
              <label key={key} className="adm-check">
                <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>
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
