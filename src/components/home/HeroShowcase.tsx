'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export interface LookbookItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  fabric: string;
  price: number;
  image: string;
  detailImage: string;
  colorHex: string;
  accentHex: string;
  productId: string;
  tags: string[];
}

export const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'look-1',
    title: 'Aanya Cotton Printed Kurti',
    subtitle: 'Everyday Comfort Collection',
    category: 'Dailywear Kurti',
    fabric: '100% Organic Cotton',
    price: 49,
    image: '/images/hero-casual.png',
    detailImage: '/images/hero-casual.png',
    colorHex: '#7A9E6A',
    accentHex: '#5B7C4F',
    productId: 'p001',
    tags: ['Organic Cotton', 'Hand Block Print', 'Breathable'],
  },
  {
    id: 'look-2',
    title: 'Breezy Linen Short Kurta',
    subtitle: 'Contemporary Mens Everyday',
    category: 'Men Casual',
    fabric: '100% Pure Linen',
    price: 59,
    image: '/images/product-kurta.png',
    detailImage: '/images/mens-collection.png',
    colorHex: '#8BA5B5',
    accentHex: '#2C2C2C',
    productId: 'p002',
    tags: ['Pure Linen', 'Short Cut', 'Relaxed Fit'],
  },
  {
    id: 'look-3',
    title: 'Chikankari Daily Set',
    subtitle: 'Airy Summer Essentials',
    category: 'Chikankari Suit',
    fabric: 'Soft Cotton & Embroidery',
    price: 69,
    image: '/images/womens-collection.png',
    detailImage: '/images/product-saree.png',
    colorHex: '#FAFAFA',
    accentHex: '#D4A0A0',
    productId: 'p003',
    tags: ['Chikankari Work', 'Lightweight', 'Work & Home'],
  },
  {
    id: 'look-4',
    title: 'Linen Palazzo Co-Ord',
    subtitle: 'Effortless Two-Piece Set',
    category: 'Relaxed Co-Ord',
    fabric: 'Slub Linen Blend',
    price: 79,
    image: '/images/hero-casual.png',
    detailImage: '/images/hero-casual.png',
    colorHex: '#D4A0A0',
    accentHex: '#C9A96E',
    productId: 'p004',
    tags: ['Wide Leg', 'Side Pockets', 'Everyday Luxe'],
  },
];

export default function HeroShowcase({
  activeLookIndex,
  onSelectLook,
}: {
  activeLookIndex: number;
  onSelectLook: (index: number) => void;
}) {
  const currentLook = LOOKBOOK_ITEMS[activeLookIndex] || LOOKBOOK_ITEMS[0];
  const [hoveringMain, setHoveringMain] = useState(false);

  return (
    <div className="hero-showcase-container">
      {/* Background Soft Glow Aura */}
      <div
        className="hero-glow-aura"
        style={{
          background: `radial-gradient(circle, ${currentLook.colorHex}44 0%, transparent 70%)`,
        }}
      />

      {/* Main Image Frame Card */}
      <div
        className="hero-main-card glass-card"
        onMouseEnter={() => setHoveringMain(true)}
        onMouseLeave={() => setHoveringMain(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLook.id}
            className="hero-card-img-wrapper"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <img
              src={currentLook.image}
              alt={currentLook.title}
              className="hero-card-img"
              style={{
                transform: hoveringMain ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay Dark Gradient */}
        <div className="hero-card-overlay" />

        {/* Top Floating Badge */}
        <div className="hero-card-top-tag">
          <span className="filigree-diamond">◆</span>
          <span>{currentLook.category}</span>
        </div>

        {/* Bottom Card Info Overlay */}
        <div className="hero-card-bottom-info">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLook.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <span className="card-subtitle">{currentLook.subtitle}</span>
              <h3 className="card-title">{currentLook.title}</h3>
              <p className="card-fabric">{currentLook.fabric}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Quick View Link */}
        <Link href={`/product/${currentLook.productId}`} className="hero-card-cta-btn">
          <span>Shop Dailywear &bull; £{currentLook.price}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Secondary Overlapping Floating Mini Card */}
      <motion.div
        className="hero-mini-card glass-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="mini-card-header">
          <span className="mini-dot" style={{ background: currentLook.colorHex }} />
          <span>Cotton Weave &bull; Detail</span>
        </div>
        <div className="mini-card-img-box">
          <img src={currentLook.detailImage} alt={`${currentLook.title} detail`} />
        </div>
        <div className="mini-card-tags">
          {currentLook.tags.map((tag) => (
            <span key={tag} className="mini-tag-pill">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Lookbook Navigation Tabs */}
      <div className="hero-lookbook-tabs">
        {LOOKBOOK_ITEMS.map((item, index) => (
          <button
            key={item.id}
            className={`lookbook-tab-btn ${activeLookIndex === index ? 'active' : ''}`}
            onClick={() => onSelectLook(index)}
          >
            <span
              className="tab-indicator-bar"
              style={{
                background: activeLookIndex === index ? item.colorHex : 'transparent',
              }}
            />
            <span className="tab-number">0{index + 1}</span>
            <span className="tab-name">{item.category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
