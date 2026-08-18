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
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { useStore } from '@/store/store';

/* ---------- Facets built from catalogue ---------- */

const CATEGORY_LABELS: Record<string, string> = {
  men: 'Menwear',
  women: 'Womenwear',
  kids: 'Kids',
  unisex: 'Unisex',
};

const MAIN_TABS = [
  { id: 'all', label: 'All Collection' },
  { id: 'women', label: 'Womenwear' },
  { id: 'men', label: 'Menwear' },
  { id: 'Dresses', label: 'Dresses', subcategory: true },
  { id: 'Jewellery', label: 'Jewellery', subcategory: true },
  { id: 'Kurtis', label: 'Kurtis', subcategory: true },
  { id: 'Saris', label: 'Saris', subcategory: true },
  { id: 'Sweater', label: 'Sweaters', subcategory: true },
  { id: 'Tops', label: 'Tops', subcategory: true },
  { id: 'Shirts', label: 'Shirts', subcategory: true },
  { id: 'kids', label: 'Kids' },
];

const categoryFacets = (['women', 'men', 'kids', 'unisex'] as const)
  .map((value) => ({ value, label: CATEGORY_LABELS[value], count: products.filter((p) => p.category === value).length }))
  .filter((f) => f.count > 0);

const typeFacets = [...new Set(products.map((p) => p.subcategory).filter(Boolean))]
  .sort()
  .map((value) => ({ value, count: products.filter((p) => p.subcategory === value).length }));

const pricedProducts = products.filter((p) => !isUnpriced(p));
const PRICE_MAX = pricedProducts.length ? Math.max(...pricedProducts.map((p) => p.price)) : 0;

/* ---------- Elevated Product Card ---------- */

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
      className="jf-shop-card"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/product/${product.id}`} className="jf-shop-media">
        <img
          src={product.images[0] || getProductImage(product.id)}
          alt={product.name}
          loading="lazy"
        />

        {/* Wishlist Floating Button */}
        <button
          className={`jf-card-wish-btn ${wishlisted ? 'on' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        {/* Badges */}
        {product.bestSeller ? (
          <span className="jf-card-badge jf-badge-best">Bestseller</span>
        ) : disc > 0 ? (
          <span className="jf-card-badge jf-badge-sale">−{disc}%</span>
        ) : !product.images.length && !hasPhoto(product.id) ? (
          <span className="jf-card-badge jf-badge-soft">Photo soon</span>
        ) : null}
      </Link>

      <div className="jf-shop-body">
        <div className="jf-shop-meta">
          <span className="jf-shop-cat">{product.subcategory || product.category}</span>
        </div>

        <Link href={`/product/${product.id}`} className="jf-shop-name">
          {product.name}
        </Link>

        {product.shortDescription && (
          <p className="jf-shop-desc">{product.shortDescription}</p>
        )}

        <div className="jf-shop-foot">
          <span className={`jf-shop-price ${unpriced ? 'poa' : ''}`}>
            {unpriced ? 'Price on request' : `£${product.price}`}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="jf-shop-was">£{product.originalPrice}</span>
            )}
          </span>

          {!unpriced && (
            <button
              className={`jf-quick-add-btn ${added ? 'added' : ''}`}
              onClick={handleAdd}
              aria-label={`Add ${product.name} to bag`}
            >
              {added ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                  Added
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></svg>
                  Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ---------- Main Shop Page Component ---------- */

export default function ShopPage() {
  const catalogue = useCatalogue();
  const [activeTab, setActiveTab] = useState('all');
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [selTypes, setSelTypes] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [search, setSearch] = useState('');
  const [onlySale, setOnlySale] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [itemsPerPage, setItemsPerPage] = useState<number>(1000);
  const [gridCols, setGridCols] = useState<number>(4);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.jf-shop-head-copy > *', { y: 15, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // Handle Tab Switch
  function handleTabClick(tab: typeof MAIN_TABS[number]) {
    setActiveTab(tab.id);
    if (tab.id === 'all') {
      setCats(new Set());
      setSelTypes(new Set());
    } else if (tab.subcategory) {
      setCats(new Set());
      setSelTypes(new Set([tab.id]));
    } else {
      setCats(new Set([tab.id]));
      setSelTypes(new Set());
    }
  }

  function toggleSet(set: Set<string>, setter: (s: Set<string>) => void, value: string) {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  }

  const priceActive = maxPrice < PRICE_MAX;
  const anyFilter = cats.size > 0 || selTypes.size > 0 || priceActive || search.trim() !== '' || onlySale;

  function resetAll() {
    setActiveTab('all');
    setCats(new Set());
    setSelTypes(new Set());
    setMaxPrice(PRICE_MAX);
    setSearch('');
    setOnlySale(false);
  }

  // Active Category Name for Display
  const currentTitle = useMemo(() => {
    if (activeTab !== 'all') {
      const found = MAIN_TABS.find((t) => t.id === activeTab);
      if (found) return found.label;
    }
    if (cats.size === 1) {
      const cat = Array.from(cats)[0];
      return CATEGORY_LABELS[cat] || cat;
    }
    if (selTypes.size === 1) {
      return Array.from(selTypes)[0];
    }
    return 'Collection';
  }, [activeTab, cats, selTypes]);

  // Breadcrumb Trail
  const breadcrumbItems = useMemo(() => {
    const trail = [{ label: 'Home', href: '/' }];
    if (cats.size === 1) {
      const catVal = Array.from(cats)[0];
      trail.push({ label: CATEGORY_LABELS[catVal] || catVal, href: '#' });
    } else {
      trail.push({ label: 'Womenwear', href: '#' });
    }

    if (selTypes.size === 1) {
      trail.push({ label: Array.from(selTypes)[0], href: '#' });
    } else if (currentTitle !== 'Collection' && currentTitle !== 'Womenwear') {
      trail.push({ label: currentTitle, href: '#' });
    }

    return trail;
  }, [cats, selTypes, currentTitle]);

  // Filtered Products
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = catalogue.filter((p) => {
      if (cats.size && !cats.has(p.category)) return false;
      if (selTypes.size && !selTypes.has(p.subcategory)) return false;
      if (priceActive && (isUnpriced(p) || p.price > maxPrice)) return false;
      if (onlySale && discountPercent(p) <= 0 && !p.clearance) return false;
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

    if (itemsPerPage > 0) {
      out = out.slice(0, itemsPerPage);
    }
    return out;
  }, [catalogue, cats, selTypes, priceActive, maxPrice, search, onlySale, sortBy, itemsPerPage]);

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="jf-shop-page">
        {/* Top Clearance Sale Highlight Section */}
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <ClearanceRail />
        </div>

        <div className="container" ref={headerRef}>
          {/* Breadcrumb Trail */}
          <nav className="jf-shop-breadcrumb" aria-label="Breadcrumb">
            {breadcrumbItems.map((item, idx) => (
              <span key={idx} className="jf-crumb-item">
                {idx > 0 && <span className="jf-crumb-sep">&rsaquo;</span>}
                {item.href !== '#' ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span className="jf-crumb-active">{item.label}</span>
                )}
              </span>
            ))}
          </nav>

          {/* Main Title + Show Filters Button Row */}
          <header className="jf-shop-head-row">
            <div className="jf-shop-head-copy">
              <h1 className="jf-shop-title">
                {currentTitle}
                <span className="jf-shop-count-tag">{filtered.length}</span>
              </h1>
            </div>

            <button
              className={`jf-show-filters-btn ${filtersOpen ? 'active' : ''}`}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span>{filtersOpen ? 'Hide filters' : 'Show filters'}</span>
            </button>
          </header>

          {/* Category Tabs Bar */}
          <nav className="jf-shop-tabs-bar" aria-label="Collection categories">
            <div className="jf-shop-tabs-scroll">
              {MAIN_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`jf-shop-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Toolbar Controls Row (Grid Switcher, Sale Toggle, Sorting, Per Page) */}
          <div className="jf-shop-toolbar">
            {/* Grid Column Switcher (2, 3, 4, 5 cols) */}
            <div className="jf-grid-switcher" aria-label="Grid layout switcher">
              {[2, 3, 4, 5].map((cols) => (
                <button
                  key={cols}
                  className={`jf-grid-btn grid-${cols} ${gridCols === cols ? 'active' : ''}`}
                  onClick={() => setGridCols(cols)}
                  title={`${cols} Columns View`}
                >
                  <GridIcon cols={cols} />
                </button>
              ))}
            </div>

            <div className="jf-toolbar-actions">
              {/* Show Only Sale Checkbox */}
              <label className="jf-toolbar-check">
                <input
                  type="checkbox"
                  checked={onlySale}
                  onChange={(e) => setOnlySale(e.target.checked)}
                />
                <span className="jf-check-box" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span>Show only products on sale</span>
              </label>

              {/* Sort Dropdown */}
              <div className="jf-toolbar-select-wrap">
                <span className="jf-select-label">Sort by</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Default sorting</option>
                  <option value="newest">Newest pieces</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Show Items Per Page */}
              <div className="jf-toolbar-select-wrap">
                <span className="jf-select-label">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={1000}>All</option>
                  <option value={20}>20</option>
                  <option value={40}>40</option>
                </select>
              </div>
            </div>
          </div>

          {/* Collapsible Filter Panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                className="jf-filter-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <div className="jf-filter-panel-inner">
                  <div className="jf-filter-search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
                    <input
                      placeholder="Search collection by keyword..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="jf-filter-grid">
                    {/* Category Filter */}
                    <div className="jf-facet-col">
                      <h3>Category</h3>
                      {categoryFacets.map((f) => (
                        <CheckRow
                          key={f.value}
                          label={f.label}
                          count={f.count}
                          checked={cats.has(f.value)}
                          onChange={() => toggleSet(cats, setCats, f.value)}
                        />
                      ))}
                    </div>

                    {/* Garment Type Filter */}
                    <div className="jf-facet-col">
                      <h3>Garment</h3>
                      {typeFacets.map((f) => (
                        <CheckRow
                          key={f.value}
                          label={f.value}
                          count={f.count}
                          checked={selTypes.has(f.value)}
                          onChange={() => toggleSet(selTypes, setSelTypes, f.value)}
                        />
                      ))}
                    </div>

                    {/* Price Slider */}
                    {PRICE_MAX > 0 && (
                      <div className="jf-facet-col">
                        <h3>Maximum Price</h3>
                        <div className="jf-price-range">
                          <input
                            type="range"
                            min={0}
                            max={PRICE_MAX}
                            step={1}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                          />
                          <div className="jf-price-range-labels">
                            <span>£0</span>
                            <span>{priceActive ? `up to £${maxPrice}` : `£${PRICE_MAX}`}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {anyFilter && (
                    <div className="jf-filter-reset-row">
                      <button className="jf-btn-reset-all" onClick={resetAll}>
                        Reset all filters
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid Area */}
          <section className="jf-shop-results">
            {filtered.length === 0 ? (
              <div className="jf-shop-empty">
                <p>No pieces match your selected filters.</p>
                <button className="jf-btn jf-btn-ghost" onClick={resetAll}>
                  Reset filters
                </button>
              </div>
            ) : (
              <motion.div className={`jf-shop-grid cols-${gridCols}`} layout>
                <AnimatePresence>
                  {filtered.map((p) => (
                    <ShopProductCard key={p.id} product={p} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ---------- Building Blocks & Icons ---------- */

function CheckRow({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="jf-check-row">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="jf-check-box" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"><path d="M20 6L9 17l-5-5" /></svg>
      </span>
      <span className="jf-check-label">{label}</span>
      <span className="jf-check-count">{count}</span>
    </label>
  );
}

function GridIcon({ cols }: { cols: number }) {
  if (cols === 2) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="4" width="9" height="16" rx="1.5" />
        <rect x="13" y="4" width="9" height="16" rx="1.5" />
      </svg>
    );
  }
  if (cols === 3) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="4" width="5.5" height="16" rx="1" />
        <rect x="9.25" y="4" width="5.5" height="16" rx="1" />
        <rect x="16.5" y="4" width="5.5" height="16" rx="1" />
      </svg>
    );
  }
  if (cols === 4) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="4" width="4" height="16" rx="1" />
        <rect x="7.33" y="4" width="4" height="16" rx="1" />
        <rect x="12.66" y="4" width="4" height="16" rx="1" />
        <rect x="18" y="4" width="4" height="16" rx="1" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="4" width="3" height="16" rx="0.5" />
      <rect x="6.2" y="4" width="3" height="16" rx="0.5" />
      <rect x="10.4" y="4" width="3" height="16" rx="0.5" />
      <rect x="14.6" y="4" width="3" height="16" rx="0.5" />
      <rect x="18.8" y="4" width="3" height="16" rx="0.5" />
    </svg>
  );
}
