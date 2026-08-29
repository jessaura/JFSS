'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getFeaturedProducts, Product, isUnpriced, formatPrice, discountPercent, colorAt } from '@/data/products';
import { getProductImage } from '@/data/images';
import { useStore } from '@/store/store';
import { useCatalogue } from '@/components/providers/CatalogueProvider';

gsap.registerPlugin(ScrollTrigger);

const TABS = [
  { id: 'all', label: 'All Curated Pieces' },
  { id: 'dresses', label: 'Linen Dresses' },
  { id: 'kurtas', label: 'Kurtas & Tops' },
  { id: 'sets', label: 'Co-ords & Sets' },
] as const;

function LuxuryProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted, openQuickView, addToCart } = useStore();
  const wishlisted = isWishlisted(product.id);
  const disc = discountPercent(product);
  const unpriced = isUnpriced(product);
  const selectedColor = colorAt(product);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    openQuickView(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (product.sizes.length > 1) {
      openQuickView(product);
    } else {
      addToCart(product, selectedColor, product.sizes[0] ?? 'One size', 1);
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

        {/* Top badges */}
        <div className="jf-staples-badges">
          {product.fabric ? (
            <span className="jf-staples-fabric-pill">{product.fabric.replace('100% ', '')}</span>
          ) : (
            <span className="jf-staples-fabric-pill">Artisan Linen</span>
          )}
          {product.new && <span className="jf-staples-new-pill">New In</span>}
          {product.bestSeller && <span className="jf-staples-best-pill">★ Bestseller</span>}
          {disc > 0 && <span className="jf-staples-disc-pill">−{disc}%</span>}
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
              title="Add to Bag"
              aria-label="Add to bag"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="jf-staples-body">
        <div className="jf-staples-meta-row">
          <span className="jf-staples-category">{product.subcategory || product.category}</span>
          {/* Color swatches preview */}
          {product.colors.length > 1 && (
            <div className="jf-staples-swatches" aria-hidden="true">
              {product.colors.map((c) => (
                <span key={c.name} className="jf-staples-dot" style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          )}
        </div>

        <h3 className="jf-staples-title">{product.name}</h3>

        {/* Sizes Bar */}
        {product.sizes.length > 0 && (
          <div className="jf-staples-sizes">
            <span className="jf-staples-size-label">Sizes:</span>
            <span className="jf-staples-size-list">{product.sizes.join(' · ')}</span>
          </div>
        )}

        {/* Price Row */}
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

export default function FeaturedProducts() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const catalogue = useCatalogue();
  const [activeTab, setActiveTab] = useState<string>('all');

  const featured = useMemo(() => {
    return getFeaturedProducts(catalogue);
  }, [catalogue]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return featured;
    if (activeTab === 'dresses') {
      return featured.filter(
        (p) =>
          p.id.startsWith('d') ||
          p.subcategory?.toLowerCase().includes('dress') ||
          p.tags?.some((t) => t.toLowerCase().includes('dress'))
      );
    }
    if (activeTab === 'kurtas') {
      return featured.filter(
        (p) =>
          p.subcategory?.toLowerCase().includes('kurta') ||
          p.category === 'men' ||
          p.tags?.some((t) => t.toLowerCase().includes('kurta'))
      );
    }
    if (activeTab === 'sets') {
      return featured.filter(
        (p) =>
          p.subcategory?.toLowerCase().includes('set') ||
          p.tags?.some((t) => t.toLowerCase().includes('set') || t.toLowerCase().includes('co-ord'))
      );
    }
    return featured;
  }, [featured, activeTab]);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.jf-staples-head', {
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollTrack = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = 340;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="jf-luxury-staples" ref={sectionRef} aria-label="Everyday staples featured collection">
      <div className="container">
        {/* Luxury Masthead */}
        <div className="jf-staples-masthead">
          <div className="jf-staples-head">
            <span className="jf-staples-eyebrow">CURATED CASUAL ESSENTIALS · ARTISANAL WEAVES</span>
            <h2 className="jf-staples-heading">
              Everyday <span className="accent-gold">Staples</span>
            </h2>
            <p className="jf-staples-lede">
              Pure slub linens, hand-painted botanicals, and effortless South Asian dailywear cut for all-day comfort.
            </p>
          </div>

          {/* Navigation Arrows & Full Link */}
          <div className="jf-staples-ctrl-group">
            <div className="jf-staples-nav-arrows">
              <button
                type="button"
                className="jf-staples-arrow-btn"
                onClick={() => scrollTrack('left')}
                aria-label="Scroll previous items"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                className="jf-staples-arrow-btn"
                onClick={() => scrollTrack('right')}
                aria-label="Scroll next items"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
            <Link href="/shop" className="jf-staples-viewall-btn">
              <span>View all pieces</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Interactive Category Filter Pills */}
        <div className="jf-staples-tabs-bar" role="tablist" aria-label="Filter staples by category">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`jf-staples-tab-pill ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.span
                  layoutId="staplesActiveTab"
                  className="jf-staples-tab-active-bg"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Luxury Carousel Track */}
        <div className="jf-staples-track-wrap">
          <div className="jf-staples-track" ref={trackRef}>
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <LuxuryProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
