'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import { Product, discountPercent, isUnpriced, colorAt, formatPrice } from '@/data/products';
import { getProductImage, hasPhoto } from '@/data/images';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { useStore } from '@/store/store';

/* ---------- Primary Category Definitions ---------- */

interface PrimaryCategory {
  id: string;
  label: string;
  eyebrow: string;
  subtitle: string;
  image: string;
}

const PRIMARY_CATEGORIES: PrimaryCategory[] = [
  {
    id: 'women',
    label: "Women's Atelier",
    eyebrow: 'PURE SLUB LINEN · HAND-PAINTED FLORALS',
    subtitle: 'Flowing linen midi dresses, artisanal kurtis, breathable blouses, and festive Kerala set mundu.',
    image: '/images/womens-collection.png',
  },
  {
    id: 'men',
    label: "Men's Everyday",
    eyebrow: 'TAILORED CUTS · ARTISANAL WEAVES',
    subtitle: 'Breathable linen kurtas, tailored casual shirts, and classic polos designed for all-day comfort.',
    image: '/images/mens-collection.png',
  },
  {
    id: 'kids',
    label: 'Kids & Juniors',
    eyebrow: 'GENTLE ON SKIN · 100% ORGANIC COTTON',
    subtitle: 'Soft, playful dailywear, easy cotton kurtas, and comfortable sets crafted for boys and girls.',
    image: '/images/kids-collection.jpg',
  },
  {
    id: 'clearance',
    label: 'Clearance Archive',
    eyebrow: '🔥 FINAL REDUCTIONS · UP TO 60% OFF',
    subtitle: 'Limited-stock archive pieces and end-of-season markdowns. Final chance before archive retirement.',
    image: '/clearance-sale.jpg',
  },
  {
    id: 'all',
    label: 'All Curated Pieces',
    eyebrow: 'THE JESSAURA CATALOGUE · LONDON',
    subtitle: 'Explore the complete South Asian everyday elegance collection in pure linens and handlooms.',
    image: '/images/hero-casual.png',
  },
];

/* ---------- Luxury Product Card Component ---------- */

function LuxuryShopCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted, addToCart, openQuickView } = useStore();
  const [added, setAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const disc = discountPercent(product);
  const unpriced = isUnpriced(product);
  const selectedColor = colorAt(product);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    openQuickView(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.sizes.length > 1) {
      openQuickView(product);
    } else {
      addToCart(product, selectedColor, product.sizes[0] ?? 'One size', 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="jf-staples-card"
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && openQuickView(product)}
      aria-label={`View ${product.name}`}
    >
      <div className="jf-staples-media">
        <img
          src={product.images[0] || getProductImage(product.id)}
          alt={product.name}
          loading="lazy"
          className="jf-staples-img"
        />

        {/* Top Badges */}
        <div className="jf-staples-badges">
          {disc > 0 ? (
            <span className="jf-staples-disc-pill">−{disc}% OFF</span>
          ) : product.fabric ? (
            <span className="jf-staples-fabric-pill">{product.fabric.replace('100% ', '')}</span>
          ) : (
            <span className="jf-staples-fabric-pill">Artisan Weave</span>
          )}
          {product.new && <span className="jf-staples-new-pill">New In</span>}
          {product.bestSeller && <span className="jf-staples-best-pill">★ Bestseller</span>}
          {!product.images.length && !hasPhoto(product.id) && (
            <span className="jf-staples-fabric-pill">Photo Soon</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className={`jf-staples-fav ${wishlisted ? 'wishlisted' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={wishlisted ? 'var(--gold, #C5A880)' : 'none'}
            stroke={wishlisted ? 'var(--gold, #C5A880)' : 'currentColor'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        {/* Hover Action Bar */}
        <div className="jf-staples-hover-actions">
          <button
            type="button"
            className="jf-staples-quickview-btn"
            onClick={handleOpen}
          >
            <span>Quick View</span>
          </button>
          {!unpriced && (
            <button
              type="button"
              className="jf-staples-quickadd-btn"
              onClick={handleQuickAdd}
              title={added ? 'Added to bag' : 'Add to Bag'}
              aria-label="Add to bag"
            >
              {added ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2E6B4F" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="jf-staples-body">
        <div className="jf-staples-meta-row">
          <span className="jf-staples-category">{product.subcategory || product.category}</span>
          {product.colors.length > 1 && (
            <div className="jf-staples-swatches" aria-hidden="true">
              {product.colors.map((c) => (
                <span key={c.name} className="jf-staples-dot" style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          )}
        </div>

        <h3 className="jf-staples-title">{product.name}</h3>

        {product.sizes.length > 0 && (
          <div className="jf-staples-sizes">
            <span className="jf-staples-size-label">Sizes:</span>
            <span className="jf-staples-size-list">{product.sizes.join(' · ')}</span>
          </div>
        )}

        <div className="jf-staples-price-row">
          {unpriced ? (
            <span className="jf-staples-poa">Price on request</span>
          ) : (
            <>
              <span className="jf-staples-price">£{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="jf-staples-original-price">£{formatPrice(product.originalPrice)}</span>
              )}
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ---------- Inner Shop Component with Search Params ---------- */

function ShopContent() {
  const catalogue = useCatalogue();
  const searchParams = useSearchParams();

  // Read URL params
  const paramCategory = searchParams.get('category') || 'women';
  const paramSubcat = searchParams.get('subcat') || 'all';

  const [activeCategory, setActiveCategory] = useState<string>(paramCategory);
  const [activeSubcat, setActiveSubcat] = useState<string>(paramSubcat);
  const [search, setSearch] = useState('');
  const [onlySale, setOnlySale] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [gridCols, setGridCols] = useState<number>(4);
  const [fabricFilter, setFabricFilter] = useState<string>('all');

  const headerRef = useRef<HTMLDivElement>(null);

  // Sync state if URL changes
  useEffect(() => {
    if (searchParams.get('category')) {
      setActiveCategory(searchParams.get('category')!);
    }
    if (searchParams.get('subcat')) {
      setActiveSubcat(searchParams.get('subcat')!);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!headerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.jf-shop-masthead-copy > *', { y: 16, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' });
    }, headerRef);
    return () => ctx.revert();
  }, [activeCategory]);

  const activeMeta = useMemo(() => {
    return PRIMARY_CATEGORIES.find((c) => c.id === activeCategory) ?? PRIMARY_CATEGORIES[0];
  }, [activeCategory]);

  // Subcategories available for active primary category
  const availableSubcategories = useMemo(() => {
    let source = catalogue;
    if (activeCategory === 'women') {
      source = catalogue.filter((p) => p.category === 'women' || p.tags?.includes('women'));
    } else if (activeCategory === 'men') {
      source = catalogue.filter((p) => p.category === 'men' || p.tags?.includes('men'));
    } else if (activeCategory === 'kids') {
      source = catalogue.filter((p) => p.category === 'kids' || p.tags?.includes('kids'));
    } else if (activeCategory === 'dresses') {
      source = catalogue.filter(
        (p) =>
          p.id.startsWith('d') ||
          p.subcategory?.toLowerCase().includes('dress') ||
          p.tags?.some((t) => t.toLowerCase().includes('dress'))
      );
    } else if (activeCategory === 'clearance') {
      source = catalogue.filter((p) => p.clearance || discountPercent(p) > 0);
    }

    const subs = Array.from(new Set(source.map((p) => p.subcategory).filter(Boolean))).sort();
    return ['all', ...subs];
  }, [activeCategory, catalogue]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let list = catalogue;

    // 1. Primary Category Filter
    if (activeCategory === 'women') {
      list = catalogue.filter((p) => p.category === 'women' || p.tags?.includes('women'));
    } else if (activeCategory === 'men') {
      list = catalogue.filter((p) => p.category === 'men' || p.tags?.includes('men'));
    } else if (activeCategory === 'kids') {
      list = catalogue.filter((p) => p.category === 'kids' || p.tags?.includes('kids'));
    } else if (activeCategory === 'dresses') {
      list = catalogue.filter(
        (p) =>
          p.id.startsWith('d') ||
          p.subcategory?.toLowerCase().includes('dress') ||
          p.tags?.some((t) => t.toLowerCase().includes('dress'))
      );
    } else if (activeCategory === 'clearance') {
      list = catalogue.filter((p) => p.clearance || discountPercent(p) > 0);
    }

    // 2. Subcategory Filter
    if (activeSubcat !== 'all') {
      list = list.filter((p) => p.subcategory === activeSubcat);
    }

    // 3. Fabric Filter
    if (fabricFilter !== 'all') {
      list = list.filter((p) => p.fabric?.toLowerCase().includes(fabricFilter.toLowerCase()));
    }

    // 4. Sale Only
    if (onlySale && activeCategory !== 'clearance') {
      list = list.filter((p) => p.clearance || discountPercent(p) > 0);
    }

    // 5. Search Filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 6. Sorting
    const byPrice = (dir: 1 | -1) => (a: Product, b: Product) => {
      if (isUnpriced(a) !== isUnpriced(b)) return isUnpriced(a) ? 1 : -1;
      return (a.price - b.price) * dir;
    };

    const byDiscount = (a: Product, b: Product) => {
      return discountPercent(b) - discountPercent(a);
    };

    switch (sortBy) {
      case 'discount':
        list = [...list].sort(byDiscount);
        break;
      case 'price-low':
        list = [...list].sort(byPrice(1));
        break;
      case 'price-high':
        list = [...list].sort(byPrice(-1));
        break;
      case 'newest':
        list = [...list].sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0));
        break;
      default:
        list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [catalogue, activeCategory, activeSubcat, fabricFilter, onlySale, search, sortBy]);

  const resetFilters = () => {
    setActiveSubcat('all');
    setFabricFilter('all');
    setOnlySale(false);
    setSearch('');
    setSortBy('featured');
  };

  return (
    <main className="jf-luxury-shop">
      {/* 1. Primary Category Nav Bar */}
      <section className="jf-shop-primary-tabs-bar">
        <div className="container">
          <div className="jf-shop-category-switcher" role="tablist" aria-label="Shop categories">
            {PRIMARY_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const isClearance = cat.id === 'clearance';
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`jf-primary-cat-btn ${isActive ? 'active' : ''} ${isClearance ? 'is-clearance-btn' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setActiveSubcat('all');
                  }}
                >
                  <span className="jf-primary-cat-name">{cat.label}</span>
                  {isClearance && <span className="jf-cat-badge-flame">−60%</span>}
                  {isActive && (
                    <motion.div
                      layoutId="activePrimaryCategory"
                      className="jf-primary-cat-indicator"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Department Masthead */}
      <section className="jf-shop-dept-masthead" ref={headerRef}>
        <div className="container">
          <div className="jf-shop-masthead-inner">
            <div className="jf-shop-masthead-copy">
              <span className="jf-shop-masthead-eyebrow">{activeMeta.eyebrow}</span>
              <h1 className="jf-shop-masthead-title">
                {activeMeta.label}
                <span className="jf-shop-masthead-count">{filteredProducts.length} pieces</span>
              </h1>
              <p className="jf-shop-masthead-desc">{activeMeta.subtitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Floating Sticky Toolbar & Subcategory Pills */}
      <div className="jf-shop-toolbar-sticky">
        <div className="container">
          <div className="jf-shop-toolbar-inner">
            {/* Search input */}
            <div className="jf-shop-search-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={`Search in ${activeMeta.label}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search products"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="jf-search-clear">
                  ×
                </button>
              )}
            </div>

            {/* Subcategory Filter Pills */}
            {availableSubcategories.length > 2 && (
              <div className="jf-subcat-pills" role="tablist" aria-label="Filter by subcategory">
                {availableSubcategories.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    className={`jf-subcat-pill ${activeSubcat === sub ? 'active' : ''}`}
                    onClick={() => setActiveSubcat(sub)}
                  >
                    {sub === 'all' ? 'All Pieces' : sub}
                  </button>
                ))}
              </div>
            )}

            {/* Toolbar Right Filters & Controls */}
            <div className="jf-toolbar-right-group">
              {/* Fabric Filter */}
              <div className="jf-toolbar-select">
                <span>Fabric:</span>
                <select value={fabricFilter} onChange={(e) => setFabricFilter(e.target.value)}>
                  <option value="all">All Fabrics</option>
                  <option value="linen">Slub Linen</option>
                  <option value="cotton">Organic Cotton</option>
                  <option value="silk">Chanderi Silk</option>
                </select>
              </div>

              {/* Sort dropdown */}
              <div className="jf-toolbar-select">
                <span>Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {activeCategory === 'clearance' && <option value="discount">Biggest Discount</option>}
                  <option value="featured">Featured Picks</option>
                  <option value="newest">New Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Sale Toggle */}
              {activeCategory !== 'clearance' && (
                <button
                  type="button"
                  className={`jf-sale-toggle-pill ${onlySale ? 'active' : ''}`}
                  onClick={() => setOnlySale(!onlySale)}
                >
                  <span className="jf-sale-dot" />
                  <span>Sale Items</span>
                </button>
              )}

              {/* Grid Column Selector */}
              <div className="jf-grid-view-ctrls">
                {[2, 3, 4].map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    className={`jf-grid-view-btn ${gridCols === cols ? 'active' : ''}`}
                    onClick={() => setGridCols(cols)}
                    title={`${cols} Columns View`}
                    aria-label={`${cols} columns`}
                  >
                    {cols === 2 ? 'II' : cols === 3 ? 'III' : 'IIII'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Luxury Product Grid Area */}
      <div className="container jf-shop-grid-section">
        {/* Reset Filter Banner (if active) */}
        {(search || fabricFilter !== 'all' || onlySale || activeSubcat !== 'all') && (
          <div className="jf-active-filters-banner">
            <span>Showing filtered results in {activeMeta.label}</span>
            <button type="button" className="jf-reset-all-btn" onClick={resetFilters}>
              <span>Clear active filters</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="jf-shop-empty-state">
            <div className="jf-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h3>No pieces match your selected filters</h3>
            <p>Try resetting your search query or selecting a different subcategory.</p>
            <button type="button" className="jf-staples-viewall-btn" onClick={resetFilters}>
              Reset all filters
            </button>
          </div>
        ) : (
          <motion.div className={`jf-luxury-grid cols-${gridCols}`} layout>
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <LuxuryShopCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <Suspense fallback={<div style={{ minHeight: '80vh' }} />}>
        <ShopContent />
      </Suspense>
      <Footer />
    </>
  );
}
