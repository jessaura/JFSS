'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import { Product, discountPercent, isUnpriced, colorAt, formatPrice } from '@/data/products';
import { getProductImage, hasPhoto } from '@/data/images';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { useStore } from '@/store/store';

/* ---------- Department Navigation Tabs ---------- */

interface DepartmentTab {
  id: string;
  label: string;
  subtitle: string;
  tag: string;
  image: string;
}

const DEPARTMENTS: DepartmentTab[] = [
  {
    id: 'all',
    label: 'All Curated Salons',
    subtitle: 'Full Store Catalog',
    tag: 'All Departments',
    image: '/images/hero-casual.png',
  },
  {
    id: 'dresses',
    label: 'Linen Dresses',
    subtitle: 'Hand-Painted Botanicals',
    tag: '100% Slub Linen',
    image: '/dresses/dress_1.jpg',
  },
  {
    id: 'women',
    label: "Women's Collection",
    subtitle: 'Kurtis, Tops & Sets',
    tag: 'Dailywear & Occasion',
    image: '/images/womens-collection.png',
  },
  {
    id: 'men',
    label: "Men's Everyday",
    subtitle: 'Linen Shirts & Kurtas',
    tag: 'Artisanal Kurtas',
    image: '/images/mens-collection.png',
  },
  {
    id: 'festive',
    label: 'Festive Kerala Edit',
    subtitle: 'Kasavu Gold & Sarees',
    tag: 'Celebration Weaves',
    image: '/images/festive-collection.png',
  },
  {
    id: 'kids',
    label: 'Kids & Juniors',
    subtitle: 'Soft Cotton Dailywear',
    tag: 'Boys & Girls',
    image: '/images/kids-collection.jpg',
  },
  {
    id: 'clearance',
    label: 'Clearance Archive',
    subtitle: 'Last Chance Pieces',
    tag: 'Up to 60% Off',
    image: '/clearance-sale.jpg',
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
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
          {product.fabric ? (
            <span className="jf-staples-fabric-pill">{product.fabric.replace('100% ', '')}</span>
          ) : (
            <span className="jf-staples-fabric-pill">Artisan Weave</span>
          )}
          {product.new && <span className="jf-staples-new-pill">New In</span>}
          {product.bestSeller && <span className="jf-staples-best-pill">★ Bestseller</span>}
          {disc > 0 && <span className="jf-staples-disc-pill">−{disc}%</span>}
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

/* ---------- Department Salon Section Component ---------- */

function DepartmentSalon({
  eyebrow,
  title,
  description,
  count,
  products,
  onViewDepartment,
}: {
  eyebrow: string;
  title: string;
  description: string;
  count: number;
  products: Product[];
  onViewDepartment: () => void;
}) {
  if (products.length === 0) return null;

  return (
    <section className="jf-salon-section">
      <div className="jf-salon-head">
        <div className="jf-salon-copy">
          <span className="jf-salon-eyebrow">{eyebrow}</span>
          <h2 className="jf-salon-title">{title}</h2>
          <p className="jf-salon-desc">{description}</p>
        </div>
        <button type="button" className="jf-salon-view-btn" onClick={onViewDepartment}>
          <span>View all in {title}</span>
          <span className="jf-salon-count-badge">{count}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="jf-salon-grid">
        {products.slice(0, 4).map((product) => (
          <LuxuryShopCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

/* ---------- Main Shop Page Component ---------- */

export default function ShopPage() {
  const catalogue = useCatalogue();
  const [activeDept, setActiveDept] = useState<string>('all');
  const [activeSubcat, setActiveSubcat] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [onlySale, setOnlySale] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [gridCols, setGridCols] = useState<number>(4);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fabricFilter, setFabricFilter] = useState<string>('all');

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.jf-shop-hero-copy > *', { y: 20, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // Department Collections Splitting
  const dressesList = useMemo(() => {
    return catalogue.filter(
      (p) =>
        p.id.startsWith('d') ||
        p.subcategory?.toLowerCase().includes('dress') ||
        p.tags?.some((t) => t.toLowerCase().includes('dress'))
    );
  }, [catalogue]);

  const womenList = useMemo(() => {
    return catalogue.filter(
      (p) =>
        (p.category === 'women' || p.tags?.includes('women')) &&
        !p.id.startsWith('d') &&
        !p.subcategory?.toLowerCase().includes('dress')
    );
  }, [catalogue]);

  const menList = useMemo(() => {
    return catalogue.filter((p) => p.category === 'men' || p.tags?.includes('men'));
  }, [catalogue]);

  const festiveList = useMemo(() => {
    return catalogue.filter(
      (p) =>
        p.subcategory?.toLowerCase().includes('sari') ||
        p.subcategory?.toLowerCase().includes('set mundu') ||
        p.tags?.some((t) => t.toLowerCase().includes('festive') || t.toLowerCase().includes('onam'))
    );
  }, [catalogue]);

  const kidsList = useMemo(() => {
    return catalogue.filter((p) => p.category === 'kids' || p.tags?.includes('kids'));
  }, [catalogue]);

  const clearanceList = useMemo(() => {
    return catalogue.filter((p) => p.clearance || discountPercent(p) > 0);
  }, [catalogue]);

  // Subcategories available for active department
  const subcategoriesForDept = useMemo(() => {
    let source = catalogue;
    if (activeDept === 'dresses') source = dressesList;
    else if (activeDept === 'women') source = catalogue.filter((p) => p.category === 'women');
    else if (activeDept === 'men') source = menList;
    else if (activeDept === 'festive') source = festiveList;
    else if (activeDept === 'kids') source = kidsList;
    else if (activeDept === 'clearance') source = clearanceList;

    const subs = Array.from(new Set(source.map((p) => p.subcategory).filter(Boolean))).sort();
    return ['all', ...subs];
  }, [activeDept, catalogue, dressesList, menList, festiveList, kidsList, clearanceList]);

  // Filtered Products for Focused View
  const filteredProducts = useMemo(() => {
    let list = catalogue;

    // 1. Department Filter
    if (activeDept === 'dresses') list = dressesList;
    else if (activeDept === 'women') list = catalogue.filter((p) => p.category === 'women');
    else if (activeDept === 'men') list = menList;
    else if (activeDept === 'festive') list = festiveList;
    else if (activeDept === 'kids') list = kidsList;
    else if (activeDept === 'clearance') list = clearanceList;

    // 2. Subcategory Filter
    if (activeSubcat !== 'all') {
      list = list.filter((p) => p.subcategory === activeSubcat);
    }

    // 3. Fabric Filter
    if (fabricFilter !== 'all') {
      list = list.filter((p) => p.fabric?.toLowerCase().includes(fabricFilter.toLowerCase()));
    }

    // 4. Sale Only
    if (onlySale) {
      list = list.filter((p) => p.clearance || discountPercent(p) > 0);
    }

    // 5. Search
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

    // 6. Sort
    const byPrice = (dir: 1 | -1) => (a: Product, b: Product) => {
      if (isUnpriced(a) !== isUnpriced(b)) return isUnpriced(a) ? 1 : -1;
      return (a.price - b.price) * dir;
    };

    switch (sortBy) {
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
  }, [catalogue, activeDept, activeSubcat, fabricFilter, onlySale, search, sortBy, dressesList, menList, festiveList, kidsList, clearanceList]);

  const activeDepartmentMeta = useMemo(() => {
    return DEPARTMENTS.find((d) => d.id === activeDept) ?? DEPARTMENTS[0];
  }, [activeDept]);

  const isSalonsMode = activeDept === 'all' && !search.trim() && fabricFilter === 'all' && !onlySale;

  const resetFilters = () => {
    setActiveDept('all');
    setActiveSubcat('all');
    setFabricFilter('all');
    setOnlySale(false);
    setSearch('');
    setSortBy('featured');
  };

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="jf-luxury-shop">
        {/* Editorial Shop Header */}
        <section className="jf-shop-hero" ref={headerRef}>
          <div className="container">
            <div className="jf-shop-hero-copy">
              <span className="jf-shop-hero-eyebrow">THE ATELIER COLLECTION · LONDON</span>
              <h1 className="jf-shop-hero-title">
                {activeDept === 'all' ? (
                  <>
                    The Curated <span className="accent-gold">Wardrobe</span>
                  </>
                ) : (
                  <>
                    {activeDepartmentMeta.label.split(' ')[0]}{' '}
                    <span className="accent-gold">{activeDepartmentMeta.label.split(' ').slice(1).join(' ') || 'Edit'}</span>
                  </>
                )}
              </h1>
              <p className="jf-shop-hero-desc">
                {activeDept === 'all'
                  ? 'Pure slub linens, breathable cottons, and timeless South Asian everyday elegance, organized into curated department salons.'
                  : activeDepartmentMeta.subtitle}
              </p>
            </div>

            {/* Department Navigation Cards Bar */}
            <div className="jf-dept-cards-wrap" role="tablist" aria-label="Browse by department">
              <div className="jf-dept-cards-track">
                {DEPARTMENTS.map((dept) => {
                  const isActive = activeDept === dept.id;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`jf-dept-nav-card ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setActiveDept(dept.id);
                        setActiveSubcat('all');
                      }}
                    >
                      <div
                        className="jf-dept-nav-bg"
                        style={{ backgroundImage: `url("${dept.image}")` }}
                      />
                      <div className="jf-dept-nav-overlay" />
                      <div className="jf-dept-nav-content">
                        <span className="jf-dept-nav-tag">{dept.tag}</span>
                        <h4 className="jf-dept-nav-title">{dept.label}</h4>
                      </div>
                      {isActive && <div className="jf-dept-nav-active-bar" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Global Toolbar & Quick Filter Bar */}
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
                  placeholder="Search fabric, cut, or piece…"
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

              {/* Subcategories (Visible when inside a specific department) */}
              {activeDept !== 'all' && subcategoriesForDept.length > 2 && (
                <div className="jf-subcat-pills" role="tablist" aria-label="Filter by subcategory">
                  {subcategoriesForDept.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      className={`jf-subcat-pill ${activeSubcat === sub ? 'active' : ''}`}
                      onClick={() => setActiveSubcat(sub)}
                    >
                      {sub === 'all' ? `All ${activeDepartmentMeta.label}` : sub}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions & Filters Toggle */}
              <div className="jf-toolbar-right-group">
                {/* Fabric Quick Filter */}
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
                    <option value="featured">Featured Picks</option>
                    <option value="newest">New Arrivals</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                {/* Sale Toggle */}
                <button
                  type="button"
                  className={`jf-sale-toggle-pill ${onlySale ? 'active' : ''}`}
                  onClick={() => setOnlySale(!onlySale)}
                >
                  <span className="jf-sale-dot" />
                  <span>Sale Items</span>
                </button>

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

        {/* Main Content Area */}
        <div className="container jf-shop-main-content">
          {/* MODE A: Curated Department Salons Mode (When "All" is active and not searching) */}
          {isSalonsMode ? (
            <div className="jf-salons-container">
              {/* Department 1: The Linen Dress Atelier */}
              <DepartmentSalon
                eyebrow="100% PURE SLUB LINEN · HAND-PAINTED"
                title="The Linen Dress Atelier"
                description="Breathable midi silhouettes with artisan botanical floral artwork. Cut for effortless summer grace."
                count={dressesList.length}
                products={dressesList}
                onViewDepartment={() => setActiveDept('dresses')}
              />

              {/* Department 2: Women's Tops & Kurtis Salon */}
              <DepartmentSalon
                eyebrow="DAILYWEAR SILHOUETTES · BREATHABLE COTTONS"
                title="Women's Tops & Kurtis"
                description="Everyday blouses, casual tunics, and comfortable dailywear crafted with delicate block details."
                count={womenList.length}
                products={womenList}
                onViewDepartment={() => setActiveDept('women')}
              />

              {/* Department 3: Men's Everyday & Kurtas */}
              <DepartmentSalon
                eyebrow="REFINED TAILORING · ARTISANAL WEAVES"
                title="Men's Everyday Collection"
                description="Breathable linen kurtas, tailored casual shirts, and classic polos designed for all-day comfort."
                count={menList.length}
                products={menList}
                onViewDepartment={() => setActiveDept('men')}
              />

              {/* Department 4: Festive Kerala Weaves */}
              <DepartmentSalon
                eyebrow="KASAVU GOLD BORDERS · CELEBRATION"
                title="Festive Kerala Edit"
                description="Traditional handloom set sarees, Kasavu borders, and heritage occasionwear."
                count={festiveList.length}
                products={festiveList}
                onViewDepartment={() => setActiveDept('festive')}
              />

              {/* Department 5: Kids Capsule */}
              {kidsList.length > 0 && (
                <DepartmentSalon
                  eyebrow="GENTLE ON SKIN · ORGANIC COTTON"
                  title="Kids & Juniors Capsule"
                  description="Soft breathable cotton sets and playful kurtas for boys and girls."
                  count={kidsList.length}
                  products={kidsList}
                  onViewDepartment={() => setActiveDept('kids')}
                />
              )}

              {/* Department 6: Clearance Rail */}
              {clearanceList.length > 0 && (
                <DepartmentSalon
                  eyebrow="LAST CHANCE ARCHIVE · SPECIAL OFFERS"
                  title="Clearance Archive"
                  description="End-of-season markdown favorites and last chance stock."
                  count={clearanceList.length}
                  products={clearanceList}
                  onViewDepartment={() => setActiveDept('clearance')}
                />
              )}
            </div>
          ) : (
            /* MODE B: Focused Department Grid View */
            <div className="jf-focused-department-view">
              <div className="jf-focused-header">
                <div className="jf-focused-title-wrap">
                  <h2 className="jf-focused-title">
                    {activeDept === 'all' ? 'Filtered Search Results' : activeDepartmentMeta.label}
                  </h2>
                  <span className="jf-focused-count-pill">{filteredProducts.length} pieces</span>
                </div>
                {(search || fabricFilter !== 'all' || onlySale || activeSubcat !== 'all') && (
                  <button type="button" className="jf-reset-all-btn" onClick={resetFilters}>
                    <span>Clear all filters</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="jf-shop-empty-state">
                  <div className="jf-empty-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <h3>No pieces match your selected filters</h3>
                  <p>Try resetting your search query or selecting a different department.</p>
                  <button type="button" className="jf-staples-viewall-btn" onClick={resetFilters}>
                    Reset all filters
                  </button>
                </div>
              ) : (
                <motion.div className={`jf-luxury-grid cols-${gridCols}`} layout>
                  <AnimatePresence>
                    {filteredProducts.map((product) => (
                      <LuxuryShopCard key={product.id} product={product} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
