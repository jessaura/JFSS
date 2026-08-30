'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface DepartmentStory {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  image: string;
  href: string;
  isSpecial?: boolean;
}

const DEPARTMENT_STORIES: DepartmentStory[] = [
  {
    id: 'sarees',
    name: 'Sarees & Drapes',
    badge: '🥻 HANDLOOM',
    tagline: 'Kerala Kasavu & Pure Silks',
    image: '/images/festive-collection.png',
    href: '/shop?q=saree',
  },
  {
    id: 'blouses',
    name: 'Artisan Blouses',
    badge: '✨ TAILORED',
    tagline: 'Embroidered Cuts & Rich Silks',
    image: '/images/hero-casual.png',
    href: '/shop?q=blouse',
  },
  {
    id: 'jewellery',
    name: 'Heritage Jewellery',
    badge: '💎 KUNDAN',
    tagline: 'Statement Necklaces & Accents',
    image: '/images/festive-collection.png',
    href: '/shop?q=jewellery',
  },
  {
    id: 'dresses',
    name: 'Linen Dresses',
    badge: '🌿 100% LINEN',
    tagline: 'Hand-Painted Floral Midis',
    image: '/images/womens-collection.png',
    href: '/shop?category=women',
  },
  {
    id: 'men',
    name: "Men's Kurtas & Shirts",
    badge: '👔 ORGANIC',
    tagline: 'Breathable Casual Handlooms',
    image: '/images/mens-collection.png',
    href: '/shop?category=men',
  },
  {
    id: 'kids',
    name: 'Kids & Juniors',
    badge: '🧒 COTTONS',
    tagline: 'Gentle Playwear & Occasion Sets',
    image: '/images/kids-collection.jpg',
    href: '/shop?category=kids',
  },
  {
    id: 'dupattas',
    name: 'Dupattas & Shawls',
    badge: '🧣 ZARI WEAVES',
    tagline: 'Artisan Borders & Lightweight Drapes',
    image: '/images/hero-casual.png',
    href: '/shop?q=dupatta',
  },
  {
    id: 'clearance',
    name: 'Clearance Vault',
    badge: '🔥 UP TO 60% OFF',
    tagline: 'Final Seasonal Reductions',
    image: '/clearance-sale.jpg',
    href: '/shop?category=clearance',
    isSpecial: true,
  },
];

export default function CategoryStoryBar() {
  return (
    <section className="jf-story-bar-section" aria-label="Explore All Atelier Departments">
      <div className="jf-story-bar-header">
        <div className="jf-sb-copy">
          <span className="jf-sb-eyebrow">Discover The Full Collection</span>
          <h2 className="jf-sb-title">
            Explore All Atelier <span className="accent">Departments</span>
          </h2>
        </div>
        <Link href="/shop" className="jf-sb-viewall">
          <span>View Complete Catalogue</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Horizontal Smooth Scrollable Visual Story Rail */}
      <div className="jf-story-rail-container">
        <div className="jf-story-rail">
          {DEPARTMENT_STORIES.map((dept, idx) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Link
                href={dept.href}
                className={`jf-story-disc-card ${dept.isSpecial ? 'is-special' : ''}`}
                aria-label={`Explore ${dept.name}: ${dept.tagline}`}
              >
                <div className="jf-story-avatar-wrap">
                  <div className="jf-story-ring-outer">
                    <div className="jf-story-avatar">
                      <img src={dept.image} alt={dept.name} className="jf-story-img" />
                    </div>
                  </div>
                  <span className={`jf-story-badge ${dept.isSpecial ? 'badge-special' : ''}`}>
                    {dept.badge}
                  </span>
                </div>

                <div className="jf-story-meta">
                  <h3 className="jf-story-name">{dept.name}</h3>
                  <p className="jf-story-tagline">{dept.tagline}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
