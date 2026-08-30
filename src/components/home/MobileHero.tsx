'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import HeroLoopingLogo from './HeroLoopingLogo';

interface HeroSlide {
  id: string;
  category: string;
  tagline: string;
  description: string;
  image: string;
  href: string;
  badge: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'women',
    category: "Women's Atelier",
    tagline: 'Linen Midis & Hand-Dyed Silhouettes',
    description: '100% Pure Slub Linen · Featherlight Drape · Artisan Weaves',
    image: '/images/womens-collection.png',
    href: '/shop?category=women',
    badge: '🌿 PURE SLUB LINEN',
  },
  {
    id: 'men',
    category: "Men's Everyday",
    tagline: 'Breathable Kurtas & Relaxed Linen Shirts',
    description: 'Organic Handloom Cottons · Relaxed Modern Fits',
    image: '/images/mens-collection.png',
    href: '/shop?category=men',
    badge: '👔 ARTISANAL WEAVE',
  },
  {
    id: 'kids',
    category: 'Kids & Juniors',
    tagline: 'Gentle Everyday Cottons for Little Ones',
    description: 'Featherweight Breathable Fabrics for Play & Occasion',
    image: '/images/kids-collection.jpg',
    href: '/shop?category=kids',
    badge: '🧒 ORGANIC COTTON',
  },
  {
    id: 'clearance',
    category: 'Clearance Archive',
    tagline: 'Final End-of-Season Reductions',
    description: 'Up to 60% Off Limited Sizes & Archive Classics',
    image: '/clearance-sale.jpg',
    href: '/shop?category=clearance',
    badge: '🔥 UP TO 60% OFF',
  },
];

export default function MobileHero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeSlide = HERO_SLIDES[activeIdx];

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="jf-mobile-hero-exclusive">
      {/* Background Ambience Layer */}
      <div className="jf-mh-bg-ambient" />

      {/* Top Centerpiece: Animated Peacock Monogram Crown */}
      <div className="jf-mh-logo-crown">
        <HeroLoopingLogo />
      </div>

      {/* Full-Bleed Editorial Stage Card */}
      <div className="jf-mh-stage-card">
        {/* Dynamic Fashion Photography with Fade Transition */}
        <div className="jf-mh-photo-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              className="jf-mh-photo-slide"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src={activeSlide.image}
                alt={activeSlide.category}
                className="jf-mh-img"
              />
            </motion.div>
          </AnimatePresence>

          {/* Luxury Editorial Vignettes & Scrim */}
          <div className="jf-mh-vignette-top" />
          <div className="jf-mh-vignette-bottom" />

          {/* Floating Slide Badge */}
          <div className="jf-mh-float-badge">
            <span>{activeSlide.badge}</span>
          </div>

          {/* Interactive Floating Look Selector Tabs */}
          <div className="jf-mh-look-tabs">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`jf-mh-tab-pill ${activeIdx === idx ? 'active' : ''}`}
                onClick={() => setActiveIdx(idx)}
                aria-label={`View ${slide.category}`}
              >
                <span>{slide.id.charAt(0).toUpperCase() + slide.id.slice(1)}</span>
                {activeIdx === idx && (
                  <motion.div
                    className="jf-mh-tab-active-indicator"
                    layoutId="activeTabIndicator"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Editorial Story Content (Floating at base of card) */}
        <div className="jf-mh-content-dock">
          <div className="jf-mh-eyebrow">
            <span>THE ATELIER COLLECTION · LONDON</span>
          </div>

          <h1 className="jf-mh-title">
            Dailywear, <span className="accent">thoughtfully made.</span>
          </h1>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="jf-mh-slide-meta"
            >
              <p className="jf-mh-tagline">{activeSlide.tagline}</p>
              <p className="jf-mh-desc">{activeSlide.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Dual Action Suite */}
          <div className="jf-mh-actions">
            <Link href="/shop" className="jf-mh-btn-primary">
              <span>Shop All Curated Pieces</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <Link href={activeSlide.href} className="jf-mh-btn-secondary">
              <span>Explore {activeSlide.category} →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Archival Maison Trust Strip */}
      <div className="jf-mh-trust-strip">
        <div className="jf-mh-trust-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <span>Free UK Delivery &gt; £50</span>
        </div>
        <div className="jf-mh-trust-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span>14-Day Easy Returns</span>
        </div>
        <div className="jf-mh-trust-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          <span>100% Artisan Linen</span>
        </div>
      </div>
    </div>
  );
}
