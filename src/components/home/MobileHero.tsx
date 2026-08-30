'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { Product, formatPrice } from '@/data/products';
import { getProductImage } from '@/data/images';

const MAIN_CATEGORIES = [
  { id: 'women', label: 'WOMEN' },
  { id: 'men', label: 'MEN' },
  { id: 'kids', label: 'KIDS' },
] as const;

type CategoryId = (typeof MAIN_CATEGORIES)[number]['id'];

export default function MobileHero() {
  const catalogue = useCatalogue();
  const [activeCategory, setActiveCategory] = useState<CategoryId>('women');
  const [activeProductIdx, setActiveProductIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Group products by category: prefer explicitly admin-selected hero products (heroFeatured: true)
  const categoryProductsMap = useMemo(() => {
    const map: Record<CategoryId, Product[]> = {
      women: [],
      men: [],
      kids: [],
    };

    MAIN_CATEGORIES.forEach(({ id }) => {
      // 1. All products explicitly flagged by admin for this hero category
      const adminChosen = catalogue.filter(
        (p) => p.heroFeatured && (p.heroCategory === id || p.category === id)
      );

      if (adminChosen.length > 0) {
        map[id] = adminChosen;
      } else {
        // 2. Fallback to featured / best sellers in this category
        const featuredFallback = catalogue.filter(
          (p) => p.category === id && (p.featured || p.bestSeller)
        );
        map[id] = featuredFallback.length > 0 ? featuredFallback.slice(0, 3) : catalogue.filter((p) => p.category === id).slice(0, 3);
      }
    });

    return map;
  }, [catalogue]);

  const currentProducts = categoryProductsMap[activeCategory] || [];

  // Reset product index when category changes or if out of range
  useEffect(() => {
    if (activeProductIdx >= currentProducts.length) {
      setActiveProductIdx(0);
    }
  }, [activeCategory, currentProducts.length, activeProductIdx]);

  const activeProduct: Product | undefined = currentProducts[activeProductIdx] || currentProducts[0];

  // Auto-advance through products in current category, or advance category if only 1 product
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentProducts.length > 1) {
        setActiveProductIdx((prev) => (prev + 1) % currentProducts.length);
      } else {
        // Cycle to next category
        setActiveCategory((prevCat) => {
          const idx = MAIN_CATEGORIES.findIndex((c) => c.id === prevCat);
          const nextIdx = (idx + 1) % MAIN_CATEGORIES.length;
          return MAIN_CATEGORIES[nextIdx].id;
        });
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [currentProducts.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      // Swiped left -> next product or next category
      if (currentProducts.length > 1 && activeProductIdx < currentProducts.length - 1) {
        setActiveProductIdx((prev) => prev + 1);
      } else {
        const idx = MAIN_CATEGORIES.findIndex((c) => c.id === activeCategory);
        const nextIdx = (idx + 1) % MAIN_CATEGORIES.length;
        setActiveCategory(MAIN_CATEGORIES[nextIdx].id);
        setActiveProductIdx(0);
      }
    } else if (diff < -45) {
      // Swiped right -> prev product or prev category
      if (currentProducts.length > 1 && activeProductIdx > 0) {
        setActiveProductIdx((prev) => prev - 1);
      } else {
        const idx = MAIN_CATEGORIES.findIndex((c) => c.id === activeCategory);
        const prevIdx = (idx - 1 + MAIN_CATEGORIES.length) % MAIN_CATEGORIES.length;
        setActiveCategory(MAIN_CATEGORIES[prevIdx].id);
        setActiveProductIdx(0);
      }
    }
    touchStartX.current = null;
  };

  if (!activeProduct) {
    return null;
  }

  const photoUrl =
    activeProduct.images?.[0] || getProductImage(activeProduct.id);

  return (
    <div className="jf-darveys-mobile-hero">
      {/* 1. Permanent Main Category Subnav (WOMEN | MEN | KIDS) */}
      <nav className="jf-dmh-subnav" aria-label="Hero Category Navigation">
        {MAIN_CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`jf-dmh-subnav-btn ${activeCategory === id ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(id);
              setActiveProductIdx(0);
            }}
          >
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* 2. 100% Unobstructed Full-Bleed Real Product Stage */}
      <div
        className="jf-dmh-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full-Bleed Real Product Image */}
        <div className="jf-dmh-viewport">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProduct.id + photoUrl}
              className="jf-dmh-slide"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src={photoUrl}
                alt={activeProduct.name}
                className="jf-dmh-photo"
              />
            </motion.div>
          </AnimatePresence>

          {/* Dreamy Feathered Gradient Blend into Background */}
          <div className="jf-dmh-gradient-scrim" />
        </div>

        {/* 3. Real Product Metadata & Interactive Controls */}
        <div className="jf-dmh-editorial-dock">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProduct.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="jf-dmh-text-wrap"
            >
              <h1 className="jf-dmh-headline">{activeProduct.name}</h1>

              {activeProduct.fabric && (
                <p className="jf-dmh-subhead">{activeProduct.fabric.toUpperCase()}</p>
              )}

              {activeProduct.price !== undefined && activeProduct.price > 0 && (
                <div className="jf-dmh-price-row">
                  <span className="jf-dmh-now">£{formatPrice(activeProduct.price)}</span>
                  {activeProduct.originalPrice && activeProduct.originalPrice > activeProduct.price && (
                    <span className="jf-dmh-was">£{formatPrice(activeProduct.originalPrice)}</span>
                  )}
                </div>
              )}

              {activeProduct.shortDescription && (
                <p className="jf-dmh-narrative">{activeProduct.shortDescription}</p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots for multi-product showcases in active category */}
          {currentProducts.length > 1 && (
            <div className="jf-dmh-dots" role="tablist" aria-label="Category Products Pagination">
              {currentProducts.map((p, idx) => (
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

          {/* Direct Product CTA */}
          <div className="jf-dmh-cta-wrap">
            <Link
              href={`/product/${activeProduct.id}`}
              className="jf-dmh-cta-btn"
            >
              <span>View {activeProduct.name}</span>
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
