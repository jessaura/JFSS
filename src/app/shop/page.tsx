'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import ClearanceRail from '@/components/home/ClearanceRail';
import { products, Product, discountPercent, isUnpriced, colorAt } from '@/data/products';
import { getProductImage, hasPhoto } from '@/data/images';
import { useStore } from '@/store/store';

/* ---------- facets, built from the real catalogue ---------- */

const CATEGORY_LABELS: Record<string, string> = {
  men: 'Men', women: 'Women', kids: 'Kids', unisex: 'Unisex',
};

const categoryFacets = (['women', 'men', 'kids', 'unisex'] as const)
  .map((value) => ({ value, label: CATEGORY_LABELS[value], count: products.filter((p) => p.category === value).length }))
  .filter((f) => f.count > 0);

const typeFacets = [...new Set(products.map((p) => p.subcategory).filter(Boolean))]
  .sort()
  .map((value) => ({ value, count: products.filter((p) => p.subcategory === value).length }));

const pricedProducts = products.filter((p) => !isUnpriced(p));
const PRICE_MAX = pricedProducts.length ? Math.max(...pricedProducts.map((p) => p.price)) : 0;

const bannerImage = products.find((p) => p.images.length)?.images[0] ?? '';

/* ---------- product card (Wink style) ---------- */

function ShopProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted, addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const disc = discountPercent(product);
  const unpriced = isUnpriced(product);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, colorAt(product), product.sizes[0] ?? 'One size');
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.article
      className="wk-card"
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
    >
      <Link href={`/product/${product.id}`} className="wk-card-media">
        <img src={getProductImage(product.id)} alt={product.name} loading="lazy" />
        {product.bestSeller ? (
          <span className="wk-badge">Bestseller</span>
        ) : disc > 0 ? (
          <span className="wk-badge wk-badge-sale">−{disc}%</span>
        ) : !hasPhoto(product.id) ? (
          <span className="wk-badge wk-badge-soft">Photo soon</span>
        ) : null}
      </Link>

      <div className="wk-card-body">
        <Link href={`/product/${product.id}`} className="wk-card-name">
          {product.name}
        </Link>
        {product.shortDescription && (
          <p className="wk-card-desc">{product.shortDescription}</p>
        )}

        <div className="wk-card-foot">
          <span className={`wk-price ${unpriced ? 'wk-price-poa' : ''}`}>
            {unpriced ? 'Price on request' : `£${product.price}`}
          </span>

          <div className="wk-card-actions">
            <button
              className={`wk-icon-btn ${wishlisted ? 'on' : ''}`}
              onClick={() => toggleWishlist(product.id)}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>

            {unpriced ? (
              <Link href={`/product/${product.id}`} className="wk-icon-btn wk-icon-bag" aria-label={`Enquire about ${product.name}`}>
                <BagIcon />
              </Link>
            ) : (
              <button
                className={`wk-icon-btn wk-icon-bag ${added ? 'on' : ''}`}
                onClick={handleAdd}
                aria-label={`Add ${product.name} to bag`}
              >
                {added ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                ) : (
                  <BagIcon />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function BagIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

/* ---------- page ---------- */

export default function ShopPage() {
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [selTypes, setSelTypes] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.wk-banner > *', { y: 20, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, value: string) {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  }

  const priceActive = maxPrice < PRICE_MAX;
  const anyFilter = cats.size > 0 || selTypes.size > 0 || priceActive || search.trim() !== '';

  function resetAll() {
    setCats(new Set());
    setSelTypes(new Set());
    setMaxPrice(PRICE_MAX);
    setSearch('');
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = products.filter((p) => {
      if (cats.size && !cats.has(p.category)) return false;
      if (selTypes.size && !selTypes.has(p.subcategory)) return false;
      // A lowered price cap only makes sense for priced pieces — hide unpriced then.
      if (priceActive && (isUnpriced(p) || p.price > maxPrice)) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.subcategory.toLowerCase().includes(q)) return false;
      return true;
    });

    const byPrice = (dir: 1 | -1) => (a: Product, b: Product) => {
      if (isUnpriced(a) !== isUnpriced(b)) return isUnpriced(a) ? 1 : -1;
      return (a.price - b.price) * dir;
    };
    switch (sortBy) {
      case 'price-low': out = out.sort(byPrice(1)); break;
      case 'price-high': out = out.sort(byPrice(-1)); break;
      case 'newest': out = out.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0)); break;
      default: out = out.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return out;
  }, [cats, selTypes, priceActive, maxPrice, search, sortBy]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="wk">
        <div className="container" ref={headerRef}>
          {/* Collection banner */}
          <section className="wk-banner">
            <div className="wk-banner-media" style={bannerImage ? { backgroundImage: `url(${bannerImage})` } : undefined} />
            <div className="wk-banner-copy">
              <span className="wk-banner-eyebrow">— Collection</span>
              <h1 className="wk-banner-title">Explore the full JessAura collection</h1>
              <p className="wk-banner-sub">
                Shirts, tops, knitwear and occasion wear — {products.length} pieces across
                men&apos;s, women&apos;s and kids&apos;.
              </p>
            </div>
          </section>

          {/* Clearance Sale band — genuine markdowns, dark contrast section */}
          <div style={{ margin: 'var(--space-2xl) 0' }}>
            <ClearanceRail />
          </div>

          {/* Search + category quick-pills + sort */}
          <div className="wk-toolbar">
            <div className="wk-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
              <label htmlFor="wk-search" className="wk-sr">Search products</label>
              <input id="wk-search" placeholder="Search the collection…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="wk-quickpills">
              {categoryFacets.map((f) => (
                <button
                  key={f.value}
                  className={`wk-pill ${cats.has(f.value) ? 'on' : ''}`}
                  onClick={() => toggle(cats, setCats, f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Breadcrumb + title */}
          <nav className="wk-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Collection</span>
          </nav>

          <div className="wk-layout">
            {/* Sidebar filters */}
            <aside className={`wk-side ${filtersOpen ? 'open' : ''}`}>
              <button className="wk-side-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">Done</button>

              <FacetGroup title="Category" onReset={cats.size ? () => setCats(new Set()) : undefined}>
                {categoryFacets.map((f) => (
                  <Check key={f.value} label={f.label} count={f.count} checked={cats.has(f.value)} onChange={() => toggle(cats, setCats, f.value)} />
                ))}
              </FacetGroup>

              <FacetGroup title="Garment" onReset={selTypes.size ? () => setSelTypes(new Set()) : undefined}>
                {typeFacets.map((f) => (
                  <Check key={f.value} label={f.value} count={f.count} checked={selTypes.has(f.value)} onChange={() => toggle(selTypes, setSelTypes, f.value)} />
                ))}
              </FacetGroup>

              {PRICE_MAX > 0 && (
                <FacetGroup title="Price" onReset={priceActive ? () => setMaxPrice(PRICE_MAX) : undefined}>
                  <div className="wk-price-filter">
                    <input type="range" min={0} max={PRICE_MAX} step={1} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} aria-label="Maximum price" />
                    <div className="wk-price-labels">
                      <span>£0</span>
                      <span>{priceActive ? `up to £${maxPrice}` : `£${PRICE_MAX}`}</span>
                    </div>
                  </div>
                </FacetGroup>
              )}

              {anyFilter && (
                <button className="wk-reset-all" onClick={resetAll}>Clear all filters</button>
              )}
            </aside>

            {/* Results */}
            <section className="wk-results">
              <div className="wk-results-head">
                <button className="wk-filter-toggle" onClick={() => setFiltersOpen(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
                  Filters
                </button>
                <span className="wk-count">{filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}</span>
                <label className="wk-sort">
                  <span className="wk-sr">Sort by</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </label>
              </div>

              {filtered.length === 0 ? (
                <div className="wk-empty">
                  <p>No pieces match your filters.</p>
                  <button className="jf-btn jf-btn-ghost" onClick={resetAll}>Clear all filters</button>
                </div>
              ) : (
                <motion.div className="wk-grid" layout>
                  <AnimatePresence>
                    {filtered.map((p) => (
                      <ShopProductCard key={p.id} product={p} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ---------- sidebar building blocks ---------- */

function FacetGroup({ title, onReset, children }: { title: string; onReset?: () => void; children: React.ReactNode }) {
  return (
    <div className="wk-facet">
      <div className="wk-facet-head">
        <h2>{title}</h2>
        {onReset && <button className="wk-facet-reset" onClick={onReset}>Reset</button>}
      </div>
      <div className="wk-facet-body">{children}</div>
    </div>
  );
}

function Check({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="wk-check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="wk-check-box" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
      </span>
      <span className="wk-check-label">{label}</span>
      <span className="wk-check-count">{count}</span>
    </label>
  );
}
