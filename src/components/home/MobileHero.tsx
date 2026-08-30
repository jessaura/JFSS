'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { formatPrice } from '@/data/products';
import { getProductImage } from '@/data/images';

export default function MobileHero() {
  const catalogue = useCatalogue();
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // STRICTLY and ONLY products explicitly checked by Admin (heroFeatured === true)
  // ZERO fallback to unchosen products
  const chosenProducts = useMemo(() => {
    return catalogue.filter((p) => Boolean(p.heroFeatured));
  }, [catalogue]);

  // Keep index within bounds
  useEffect(() => {
    if (activeIdx >= chosenProducts.length) {
      setActiveIdx(0);
    }
  }, [chosenProducts.length, activeIdx]);

  // Auto-advance through chosen products every 6 seconds
  useEffect(() => {
    if (chosenProducts.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % chosenProducts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [chosenProducts.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || chosenProducts.length <= 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      // Swiped left -> next
      setActiveIdx((prev) => (prev + 1) % chosenProducts.length);
    } else if (diff < -45) {
      // Swiped right -> prev
      setActiveIdx((prev) => (prev - 1 + chosenProducts.length) % chosenProducts.length);
    }
    touchStartX.current = null;
  };

  // If admin has not selected any products yet, show clean editorial brand banner (0 unchosen products)
  if (chosenProducts.length === 0) {
    return (
      <div className="jf-darveys-mobile-hero">
        <nav className="jf-dmh-subnav" aria-label="Department Links">
          <Link href="/shop?category=women" className="jf-dmh-subnav-btn"><span>WOMEN</span></Link>
          <Link href="/shop?category=men" className="jf-dmh-subnav-btn"><span>MEN</span></Link>
          <Link href="/shop?category=kids" className="jf-dmh-subnav-btn"><span>KIDS</span></Link>
        </nav>
        <div className="jf-dmh-stage">
          <div className="jf-dmh-viewport">
            <div className="jf-dmh-slide">
              <img src="/images/hero-casual.png" alt="Jessaura London Atelier" className="jf-dmh-photo" />
            </div>
            <div className="jf-dmh-gradient-scrim" />
          </div>
          <div className="jf-dmh-editorial-dock">
            <div className="jf-dmh-text-wrap">
              <h1 className="jf-dmh-headline">Dailywear, Thoughtfully Made</h1>
              <p className="jf-dmh-subhead">100% PURE SLUB LINEN &amp; COTTONS</p>
              <p className="jf-dmh-narrative">Where South Asian heritage meets London everyday elegance.</p>
            </div>
            <div className="jf-dmh-cta-wrap">
              <Link href="/shop" className="jf-dmh-cta-btn">
                <span>Shop The Collection</span>
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

  const activeProduct = chosenProducts[activeIdx] || chosenProducts[0];
  const photoUrl = activeProduct.images?.[0] || getProductImage(activeProduct.id);

  // Extract unique categories of the chosen products for the subnav
  const chosenCategories = Array.from(
    new Set(chosenProducts.map((p) => (p.heroCategory || p.category || 'all').toLowerCase()))
  );

  return (
    <div className="jf-darveys-mobile-hero">
      {/* 1. Subnav reflecting the categories of your chosen showcase products */}
      <nav className="jf-dmh-subnav" aria-label="Hero Showcase Categories">
        {chosenCategories.map((catKey) => {
          const firstIdxForCat = chosenProducts.findIndex(
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
                if (firstIdxForCat !== -1) setActiveIdx(firstIdxForCat);
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

          {/* Pagination Dots across all Admin-Selected Products */}
          {chosenProducts.length > 1 && (
            <div className="jf-dmh-dots" role="tablist" aria-label="Hero Product Pagination">
              {chosenProducts.map((p, idx) => (
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
