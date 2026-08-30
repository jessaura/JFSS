'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import HeroLoopingLogo from './HeroLoopingLogo';

interface HeroSlide {
  id: string;
  category: string;
  headline: string;
  subhead: string;
  narrative: string;
  image: string;
  href: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'bestseller',
    category: 'Best Seller Edit',
    headline: 'Best Seller Edit',
    subhead: 'DAILYWEAR · THOUGHTFULLY MADE',
    narrative: 'Where South Asian heritage meets London everyday elegance',
    image: '/images/hero-casual.png',
    href: '/shop',
  },
  {
    id: 'women',
    category: "Women's Atelier",
    headline: "Women's Atelier",
    subhead: '100% PURE SLUB LINEN & COTTONS',
    narrative: 'Hand-dyed midis, artisanal kurtis & featherweight drape',
    image: '/images/womens-collection.png',
    href: '/shop?category=women',
  },
  {
    id: 'men',
    category: "Men's Everyday",
    headline: "Men's Everyday Line",
    subhead: 'ORGANIC HANDLOOM WEAVES',
    narrative: 'Relaxed linen shirts, breathable kurtas & lightweight layers',
    image: '/images/mens-collection.png',
    href: '/shop?category=men',
  },
  {
    id: 'festive',
    category: 'Festive & Occasion',
    headline: 'The Heritage Edit',
    subhead: 'KERALA KASAVU & HANDLOOMS',
    narrative: 'Artisan gold borders, pure cotton sarees & statement sets',
    image: '/images/festive-collection.png',
    href: '/shop?category=festive',
  },
  {
    id: 'clearance',
    category: 'Clearance Archive',
    headline: 'The Clearance Vault',
    subhead: 'UP TO 60% OFF ARCHIVE STYLES',
    narrative: 'Final end-of-season markdowns on limited archive sizes',
    image: '/clearance-sale.jpg',
    href: '/shop?category=clearance',
  },
];

export default function MobileHero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const activeSlide = HERO_SLIDES[activeIdx];

  // Auto-advance every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      // Swiped left -> next
      setActiveIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    } else if (diff < -45) {
      // Swiped right -> prev
      setActiveIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    }
    touchStartX.current = null;
  };

  return (
    <div className="jf-darveys-mobile-hero">
      {/* 1. Sub-Navigation Category Bar (MEN | WOMEN | KIDS | CLEARANCE) */}
      <nav className="jf-dmh-subnav" aria-label="Quick Category Navigation">
        <Link href="/shop?category=women" className="jf-dmh-subnav-link">WOMEN</Link>
        <span className="jf-dmh-subnav-sep">|</span>
        <Link href="/shop?category=men" className="jf-dmh-subnav-link">MEN</Link>
        <span className="jf-dmh-subnav-sep">|</span>
        <Link href="/shop?category=kids" className="jf-dmh-subnav-link">KIDS</Link>
        <span className="jf-dmh-subnav-sep">|</span>
        <Link href="/shop?category=clearance" className="jf-dmh-subnav-link is-sale">CLEARANCE</Link>
      </nav>

      {/* 2. Full-Bleed Editorial Stage with Touch-Swipe */}
      <div
        className="jf-dmh-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Animated Looping Peacock Monogram Medallion */}
        <div className="jf-dmh-logo-overlay">
          <HeroLoopingLogo />
        </div>

        {/* Full-Bleed Photo Carousel */}
        <div className="jf-dmh-viewport">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              className="jf-dmh-slide"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src={activeSlide.image}
                alt={activeSlide.headline}
                className="jf-dmh-photo"
              />
            </motion.div>
          </AnimatePresence>

          {/* Dreamy Feathered Gradient Blend into Background */}
          <div className="jf-dmh-gradient-scrim" />
        </div>

        {/* 3. Editorial Lower Typography & Interactive Controls */}
        <div className="jf-dmh-editorial-dock">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="jf-dmh-text-wrap"
            >
              <h1 className="jf-dmh-headline">{activeSlide.headline}</h1>
              <p className="jf-dmh-subhead">{activeSlide.subhead}</p>
              <p className="jf-dmh-narrative">{activeSlide.narrative}</p>
            </motion.div>
          </AnimatePresence>

          {/* Minimalist Pagination Dots */}
          <div className="jf-dmh-dots" role="tablist" aria-label="Hero Slide Navigation">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`jf-dmh-dot ${activeIdx === idx ? 'active' : ''}`}
                onClick={() => setActiveIdx(idx)}
                aria-label={`Slide ${idx + 1}: ${slide.headline}`}
                role="tab"
                aria-selected={activeIdx === idx}
              />
            ))}
          </div>

          {/* Explore Button */}
          <div className="jf-dmh-cta-wrap">
            <Link href={activeSlide.href} className="jf-dmh-cta-btn">
              <span>Explore {activeSlide.category}</span>
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
