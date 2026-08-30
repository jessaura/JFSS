'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { Product, formatPrice } from '@/data/products';
import { getProductImage } from '@/data/images';

const CATEGORIES = [
  { id: 'women', label: 'WOMEN' },
  { id: 'men', label: 'MEN' },
  { id: 'kids', label: 'KIDS' },
] as const;

export default function MobileHero() {
  const catalogue = useCatalogue();
  const [activeTab, setActiveTab] = useState<'women' | 'men' | 'kids'>('women');
  const touchStartX = useRef<number | null>(null);

  // 100% dynamic resolution of real products from the live catalogue
  const categoryProducts = useMemo(() => {
    const map: Record<'women' | 'men' | 'kids', Product | undefined> = {
      women: undefined,
      men: undefined,
      kids: undefined,
    };

    CATEGORIES.forEach(({ id }) => {
      // Find explicitly admin-flagged hero product for this category
      const heroChosen = catalogue.find(
        (p) => p.heroFeatured && (p.heroCategory === id || p.category === id)
      );

      // Or fallback to top featured / best seller product in this category
      const featuredFallback =
        catalogue.find((p) => p.category === id && (p.featured || p.bestSeller)) ||
        catalogue.find((p) => p.category === id);

      map[id] = heroChosen || featuredFallback;
    });

    return map;
  }, [catalogue]);

  const activeProduct = categoryProducts[activeTab];

  // Auto-advance through categories every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        const idx = CATEGORIES.findIndex((c) => c.id === prev);
        const nextIdx = (idx + 1) % CATEGORIES.length;
        return CATEGORIES[nextIdx].id;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const currentIdx = CATEGORIES.findIndex((c) => c.id === activeTab);
    if (diff > 45) {
      // Swiped left -> next
      const nextIdx = (currentIdx + 1) % CATEGORIES.length;
      setActiveTab(CATEGORIES[nextIdx].id);
    } else if (diff < -45) {
      // Swiped right -> prev
      const prevIdx = (currentIdx - 1 + CATEGORIES.length) % CATEGORIES.length;
      setActiveTab(CATEGORIES[prevIdx].id);
    }
    touchStartX.current = null;
  };

  // If no product exists yet in this category, provide clean link to category
  const photoUrl =
    activeProduct?.images?.[0] ||
    (activeProduct?.id ? getProductImage(activeProduct.id) : '/images/hero-casual.png');

  return (
    <div className="jf-darveys-mobile-hero">
      {/* 1. Category Subnav (WOMEN | MEN | KIDS) */}
      <nav className="jf-dmh-subnav" aria-label="Quick Category Switcher">
        {CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`jf-dmh-subnav-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
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
              key={activeTab + (activeProduct?.id || '')}
              className="jf-dmh-slide"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src={photoUrl}
                alt={activeProduct?.name || `${activeTab} collection`}
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
              key={activeTab + (activeProduct?.id || '')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="jf-dmh-text-wrap"
            >
              <h1 className="jf-dmh-headline">
                {activeProduct?.name || `${activeTab.toUpperCase()} COLLECTION`}
              </h1>

              {activeProduct?.fabric && (
                <p className="jf-dmh-subhead">{activeProduct.fabric.toUpperCase()}</p>
              )}

              {activeProduct?.price !== undefined && activeProduct.price > 0 && (
                <div className="jf-dmh-price-row">
                  <span className="jf-dmh-now">£{formatPrice(activeProduct.price)}</span>
                  {activeProduct.originalPrice && activeProduct.originalPrice > activeProduct.price && (
                    <span className="jf-dmh-was">£{formatPrice(activeProduct.originalPrice)}</span>
                  )}
                </div>
              )}

              {activeProduct?.shortDescription && (
                <p className="jf-dmh-narrative">{activeProduct.shortDescription}</p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Minimalist Pagination Dots */}
          <div className="jf-dmh-dots" role="tablist" aria-label="Hero Category Tabs">
            {CATEGORIES.map(({ id }, idx) => (
              <button
                key={id}
                type="button"
                className={`jf-dmh-dot ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
                aria-label={`Category ${idx + 1}: ${id}`}
                role="tab"
                aria-selected={activeTab === id}
              />
            ))}
          </div>

          {/* Direct Product CTA */}
          <div className="jf-dmh-cta-wrap">
            <Link
              href={activeProduct ? `/product/${activeProduct.id}` : `/shop?category=${activeTab}`}
              className="jf-dmh-cta-btn"
            >
              <span>{activeProduct ? `View ${activeProduct.name}` : `Explore ${activeTab}`}</span>
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
