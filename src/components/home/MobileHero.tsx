'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { Product, formatPrice, discountPercent } from '@/data/products';
import { getProductImage } from '@/data/images';

interface CategoryTab {
  id: 'women' | 'men' | 'kids' | 'bestseller';
  label: string;
  defaultHeadline: string;
  defaultSubhead: string;
  defaultImage: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  {
    id: 'women',
    label: 'WOMEN',
    defaultHeadline: "Women's Atelier",
    defaultSubhead: '100% PURE SLUB LINEN & COTTONS',
    defaultImage: '/images/womens-collection.png',
  },
  {
    id: 'men',
    label: 'MEN',
    defaultHeadline: "Men's Everyday Line",
    defaultSubhead: 'ORGANIC HANDLOOM WEAVES',
    defaultImage: '/images/mens-collection.png',
  },
  {
    id: 'kids',
    label: 'KIDS',
    defaultHeadline: 'Kids & Juniors Edit',
    defaultSubhead: 'BREATHABLE GENTLE COTTONS',
    defaultImage: '/images/kids-collection.jpg',
  },
];

export default function MobileHero() {
  const catalogue = useCatalogue();
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Dynamically resolve real admin-selected or featured products for each category
  const slides = useMemo(() => {
    return CATEGORY_TABS.map((tab) => {
      // 1. Look for admin-selected hero product
      const heroProduct = catalogue.find(
        (p) => p.heroFeatured && (p.heroCategory === tab.id || p.category === tab.id)
      );

      // 2. Or fallback to top featured product in that category
      const fallbackProduct = catalogue.find(
        (p) => p.category === tab.id && (p.featured || p.bestSeller)
      ) || catalogue.find((p) => p.category === tab.id);

      const product: Product | undefined = heroProduct || fallbackProduct;

      return {
        tabId: tab.id,
        label: tab.label,
        productId: product?.id,
        name: product?.name || tab.defaultHeadline,
        fabric: product?.fabric ? product.fabric.toUpperCase() : tab.defaultSubhead,
        description:
          product?.shortDescription ||
          product?.description ||
          'Where South Asian heritage meets London everyday elegance.',
        image: product?.images?.[0] || (product ? getProductImage(product.id) : tab.defaultImage),
        price: product?.price,
        originalPrice: product?.originalPrice,
        href: product ? `/product/${product.id}` : `/shop?category=${tab.id}`,
      };
    });
  }, [catalogue]);

  const activeSlide = slides[activeTabIdx] || slides[0];

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTabIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      // Swiped left -> next
      setActiveTabIdx((prev) => (prev + 1) % slides.length);
    } else if (diff < -45) {
      // Swiped right -> prev
      setActiveTabIdx((prev) => (prev - 1 + slides.length) % slides.length);
    }
    touchStartX.current = null;
  };

  return (
    <div className="jf-darveys-mobile-hero">
      {/* 1. Category Quick Subnav (WOMEN | MEN | KIDS) - Tapping switches active hero look */}
      <nav className="jf-dmh-subnav" aria-label="Mobile Hero Category Navigation">
        {slides.map((slide, idx) => (
          <button
            key={slide.tabId}
            type="button"
            className={`jf-dmh-subnav-btn ${activeTabIdx === idx ? 'active' : ''}`}
            onClick={() => setActiveTabIdx(idx)}
          >
            <span>{slide.label}</span>
          </button>
        ))}
      </nav>

      {/* 2. 100% Unobstructed Full-Bleed Product Stage */}
      <div
        className="jf-dmh-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full-Bleed Real Product Photo Carousel */}
        <div className="jf-dmh-viewport">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.tabId + activeSlide.image}
              className="jf-dmh-slide"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src={activeSlide.image}
                alt={activeSlide.name}
                className="jf-dmh-photo"
              />
            </motion.div>
          </AnimatePresence>

          {/* Dreamy Feathered Gradient Blend into Background */}
          <div className="jf-dmh-gradient-scrim" />
        </div>

        {/* 3. Editorial Lower Typography & Interactive Product Controls */}
        <div className="jf-dmh-editorial-dock">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.tabId + activeSlide.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="jf-dmh-text-wrap"
            >
              <h1 className="jf-dmh-headline">{activeSlide.name}</h1>
              <p className="jf-dmh-subhead">{activeSlide.fabric}</p>

              {activeSlide.price !== undefined && activeSlide.price > 0 && (
                <div className="jf-dmh-price-row">
                  <span className="jf-dmh-now">£{formatPrice(activeSlide.price)}</span>
                  {activeSlide.originalPrice && activeSlide.originalPrice > activeSlide.price && (
                    <span className="jf-dmh-was">£{formatPrice(activeSlide.originalPrice)}</span>
                  )}
                </div>
              )}

              <p className="jf-dmh-narrative">{activeSlide.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Minimalist Pagination Dots */}
          <div className="jf-dmh-dots" role="tablist" aria-label="Hero Slide Navigation">
            {slides.map((slide, idx) => (
              <button
                key={slide.tabId}
                type="button"
                className={`jf-dmh-dot ${activeTabIdx === idx ? 'active' : ''}`}
                onClick={() => setActiveTabIdx(idx)}
                aria-label={`Slide ${idx + 1}: ${slide.name}`}
                role="tab"
                aria-selected={activeTabIdx === idx}
              />
            ))}
          </div>

          {/* Explore Product CTA */}
          <div className="jf-dmh-cta-wrap">
            <Link href={activeSlide.href} className="jf-dmh-cta-btn">
              <span>View {activeSlide.name}</span>
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
