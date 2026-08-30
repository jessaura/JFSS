'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { Product, formatPrice } from '@/data/products';
import { getProductImage } from '@/data/images';

export default function MobileHero() {
  const catalogue = useCatalogue();
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // 1. Get ONLY the products explicitly chosen by the admin for hero showcase
  const heroProducts = useMemo(() => {
    const chosen = catalogue.filter((p) => p.heroFeatured);
    if (chosen.length > 0) return chosen;
    // Only if admin has chosen 0 products across the entire store, fallback to general featured pieces
    return catalogue.filter((p) => p.featured).slice(0, 4);
  }, [catalogue]);

  // Keep activeIdx in valid bounds if products list changes
  useEffect(() => {
    if (activeIdx >= heroProducts.length) {
      setActiveIdx(0);
    }
  }, [heroProducts.length, activeIdx]);

  const activeProduct: Product | undefined = heroProducts[activeIdx] || heroProducts[0];

  // Auto-advance through admin-chosen products every 6 seconds
  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % heroProducts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || heroProducts.length <= 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      // Swiped left -> next product
      setActiveIdx((prev) => (prev + 1) % heroProducts.length);
    } else if (diff < -45) {
      // Swiped right -> prev product
      setActiveIdx((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);
    }
    touchStartX.current = null;
  };

  if (!activeProduct) {
    return null;
  }

  const photoUrl =
    activeProduct.images?.[0] || getProductImage(activeProduct.id);

  // Derive unique categories present among admin-selected hero products for the subnav
  const uniqueCategories = Array.from(
    new Set(heroProducts.map((p) => (p.heroCategory || p.category || 'all').toLowerCase()))
  );

  return (
    <div className="jf-darveys-mobile-hero">
      {/* 1. Dynamic Category / Product Switcher Subnav */}
      <nav className="jf-dmh-subnav" aria-label="Hero Showcase Navigation">
        {uniqueCategories.map((catKey) => {
          // Find the first product matching this category
          const targetIdx = heroProducts.findIndex(
            (p) => (p.heroCategory || p.category || '').toLowerCase() === catKey
          );
          const isCurrentCat =
            (activeProduct.heroCategory || activeProduct.category || '').toLowerCase() === catKey;

          return (
            <button
              key={catKey}
              type="button"
              className={`jf-dmh-subnav-btn ${isCurrentCat ? 'active' : ''}`}
              onClick={() => {
                if (targetIdx !== -1) setActiveIdx(targetIdx);
              }}
            >
              <span>{catKey.toUpperCase()}</span>
            </button>
          );
        })}
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

          {/* Minimalist Pagination Dots for all Admin-Selected Products */}
          {heroProducts.length > 1 && (
            <div className="jf-dmh-dots" role="tablist" aria-label="Hero Product Pagination">
              {heroProducts.map((p, idx) => (
                <button
                  key={p.id + idx}
                  type="button"
                  className={`jf-dmh-dot ${activeIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveIdx(idx)}
                  aria-label={`Product ${idx + 1}: ${p.name}`}
                  role="tab"
                  aria-selected={activeIdx === idx}
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
              <span>View Specification</span>
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
