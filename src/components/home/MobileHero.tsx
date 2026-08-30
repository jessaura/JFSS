'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { Product, formatPrice } from '@/data/products';
import { getProductImage } from '@/data/images';

const HERO_TABS = [
  {
    id: 'women',
    label: 'WOMEN',
    fallbackTitle: "Women's Atelier",
    fallbackFabric: '100% PURE SLUB LINEN & COTTONS',
    fallbackDesc: 'Hand-dyed midis, artisan kurtis, breathable blouses & flowing silhouettes.',
    fallbackImage: '/images/womens-collection.png',
    href: '/shop?category=women',
  },
  {
    id: 'men',
    label: 'MEN',
    fallbackTitle: "Men's Everyday Line",
    fallbackFabric: 'ORGANIC HANDLOOM WEAVES',
    fallbackDesc: 'Relaxed linen shirts, breathable kurtas & lightweight layering.',
    fallbackImage: '/images/mens-collection.png',
    href: '/shop?category=men',
  },
  {
    id: 'kids',
    label: 'KIDS',
    fallbackTitle: 'Kids & Juniors Edit',
    fallbackFabric: 'BREATHABLE GENTLE COTTONS',
    fallbackDesc: 'Featherweight organic cottons, playful sets & comfortable dailywear for little ones.',
    fallbackImage: '/images/kids-collection.jpg',
    href: '/shop?category=kids',
  },
] as const;

type TabId = (typeof HERO_TABS)[number]['id'];

export default function MobileHero() {
  const catalogue = useCatalogue();
  const [activeTab, setActiveTab] = useState<TabId>('women');
  const [activeProductIdx, setActiveProductIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Group ONLY explicitly admin-selected hero products (heroFeatured === true) by category
  const adminChosenByCategory = useMemo(() => {
    const map: Record<TabId, Product[]> = {
      women: [],
      men: [],
      kids: [],
    };

    HERO_TABS.forEach(({ id }) => {
      // Find ONLY products checked by admin for this category
      const chosen = catalogue.filter(
        (p) => Boolean(p.heroFeatured) && (p.heroCategory === id || p.category === id)
      );
      map[id] = chosen;
    });

    return map;
  }, [catalogue]);

  const activeTabConfig = HERO_TABS.find((t) => t.id === activeTab) || HERO_TABS[0];
  const chosenProductsInTab = adminChosenByCategory[activeTab] || [];
  const hasChosenProducts = chosenProductsInTab.length > 0;
  const currentProduct: Product | undefined = hasChosenProducts
    ? chosenProductsInTab[activeProductIdx] || chosenProductsInTab[0]
    : undefined;

  // Reset product index when tab changes
  useEffect(() => {
    if (activeProductIdx >= chosenProductsInTab.length) {
      setActiveProductIdx(0);
    }
  }, [activeTab, chosenProductsInTab.length, activeProductIdx]);

  // Auto-advance through products in active category, or cycle tabs if 1 or 0 products
  useEffect(() => {
    const timer = setInterval(() => {
      if (chosenProductsInTab.length > 1) {
        setActiveProductIdx((prev) => (prev + 1) % chosenProductsInTab.length);
      } else {
        // Cycle to next tab
        setActiveTab((prevTab) => {
          const idx = HERO_TABS.findIndex((t) => t.id === prevTab);
          const nextIdx = (idx + 1) % HERO_TABS.length;
          return HERO_TABS[nextIdx].id;
        });
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [chosenProductsInTab.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      // Swiped left -> next product or next tab
      if (chosenProductsInTab.length > 1 && activeProductIdx < chosenProductsInTab.length - 1) {
        setActiveProductIdx((prev) => prev + 1);
      } else {
        const idx = HERO_TABS.findIndex((t) => t.id === activeTab);
        const nextIdx = (idx + 1) % HERO_TABS.length;
        setActiveTab(HERO_TABS[nextIdx].id);
        setActiveProductIdx(0);
      }
    } else if (diff < -45) {
      // Swiped right -> prev product or prev tab
      if (chosenProductsInTab.length > 1 && activeProductIdx > 0) {
        setActiveProductIdx((prev) => prev - 1);
      } else {
        const idx = HERO_TABS.findIndex((t) => t.id === activeTab);
        const prevIdx = (idx - 1 + HERO_TABS.length) % HERO_TABS.length;
        setActiveTab(HERO_TABS[prevIdx].id);
        setActiveProductIdx(0);
      }
    }
    touchStartX.current = null;
  };

  // Resolve display data: either chosen product or the clean collection overview card (0 unchosen random products)
  const displayTitle = currentProduct ? currentProduct.name : activeTabConfig.fallbackTitle;
  const displayFabric = currentProduct
    ? (currentProduct.fabric || '').toUpperCase()
    : activeTabConfig.fallbackFabric;
  const displayDesc = currentProduct
    ? currentProduct.shortDescription || currentProduct.description
    : activeTabConfig.fallbackDesc;
  const displayImage = currentProduct
    ? currentProduct.images?.[0] || getProductImage(currentProduct.id)
    : activeTabConfig.fallbackImage;
  const displayHref = currentProduct
    ? `/product/${currentProduct.id}`
    : activeTabConfig.href;
  const displayBtnLabel = currentProduct
    ? `View ${currentProduct.name}`
    : `Explore ${activeTabConfig.label} Collection`;

  return (
    <div className="jf-darveys-mobile-hero">
      {/* 1. Permanent Main Category Subnav: WOMEN | MEN | KIDS (Always Present) */}
      <nav className="jf-dmh-subnav" aria-label="Hero Category Navigation">
        {HERO_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`jf-dmh-subnav-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(id);
              setActiveProductIdx(0);
            }}
          >
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* 2. 100% Unobstructed Full-Bleed Real Showcase Stage */}
      <div
        className="jf-dmh-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full-Bleed Photo */}
        <div className="jf-dmh-viewport">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (currentProduct?.id || 'collection')}
              className="jf-dmh-slide"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src={displayImage}
                alt={displayTitle}
                className="jf-dmh-photo"
              />
            </motion.div>
          </AnimatePresence>

          {/* Dreamy Feathered Gradient Blend into Background */}
          <div className="jf-dmh-gradient-scrim" />
        </div>

        {/* 3. Real Metadata & Interactive Controls */}
        <div className="jf-dmh-editorial-dock">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (currentProduct?.id || 'collection')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="jf-dmh-text-wrap"
            >
              <h1 className="jf-dmh-headline">{displayTitle}</h1>

              {displayFabric && (
                <p className="jf-dmh-subhead">{displayFabric}</p>
              )}

              {currentProduct && currentProduct.price > 0 && (
                <div className="jf-dmh-price-row">
                  <span className="jf-dmh-now">£{formatPrice(currentProduct.price)}</span>
                  {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                    <span className="jf-dmh-was">£{formatPrice(currentProduct.originalPrice)}</span>
                  )}
                </div>
              )}

              {displayDesc && (
                <p className="jf-dmh-narrative">{displayDesc}</p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots for multi-product showcases in active category */}
          {chosenProductsInTab.length > 1 && (
            <div className="jf-dmh-dots" role="tablist" aria-label="Category Products Pagination">
              {chosenProductsInTab.map((p, idx) => (
                <button
                  key={p.id + idx}
                  type="button"
                  className={`jf-dmh-dot ${activeProductIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveProductIdx(idx)}
                  aria-label={`Product ${idx + 1}: ${p.name}`}
                  role="tab"
                  aria-selected={activeProductIdx === idx}
                />
              ))}
            </div>
          )}

          {/* Direct Product or Collection CTA */}
          <div className="jf-dmh-cta-wrap">
            <Link
              href={displayHref}
              className="jf-dmh-cta-btn"
            >
              <span>{displayBtnLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
