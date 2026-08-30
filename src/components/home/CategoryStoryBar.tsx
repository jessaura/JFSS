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
    id: 'onam-traditional',
    name: 'Onam Traditional',
    badge: '🥻 KASAVU GOLD',
    tagline: 'Kerala Sarees & Festive Weaves',
    image: '/images/festive-collection.png',
    href: '/shop?category=onam',
    isSpecial: true,
  },
  {
    id: 'jewellery',
    name: 'Jewellery',
    badge: '💎 FINE ACCENTS',
    tagline: 'Statement Necklaces & Sets',
    image: '/jewellery/j_1.png',
    href: '/shop?category=jewellery',
  },
  {
    id: 'blouses',
    name: 'Blouses',
    badge: '✨ EMBROIDERED',
    tagline: 'Silk, Kasavu & Tailored Blouses',
    image: '/new prod/photo_2026-08-18_21-55-44.jpg',
    href: '/shop?category=blouses',
  },
  {
    id: 'kurti',
    name: 'Kurti',
    badge: '🌿 PURE LINEN',
    tagline: 'Artisan Tunics & Hand-Painted Midis',
    image: '/dresses/dress_1.jpg',
    href: '/shop?category=kurti',
  },
  {
    id: 'shirts',
    name: 'Shirts',
    badge: '👔 HANDLOOM',
    tagline: 'Breathable Linen & Tailored Shirts',
    image: '/products/rl-polo-blue-white-stripe.jpg',
    href: '/shop?category=shirts',
  },
  {
    id: 'sweatshirt',
    name: 'Sweatshirt',
    badge: '🧥 PREMIUM KNIT',
    tagline: 'Winter Knits & Casual Layers',
    image: '/products/fable-grey.jpg',
    href: '/shop?category=sweatshirt',
  },
  {
    id: 'kids-clothes',
    name: 'Kids Clothes',
    badge: '🧒 100% COTTON',
    tagline: 'Gentle Playwear & Festive Sets',
    image: '/images/kids-collection.jpg',
    href: '/shop?category=kids',
  },
];

export default function CategoryStoryBar() {
  return (
    <section className="jf-story-bar-section" aria-label="Explore All Atelier Departments">
      <div className="jf-story-bar-header">
        <div className="jf-sb-copy">
          <span className="jf-sb-eyebrow">Atelier Wardrobe</span>
          <h2 className="jf-sb-title">
            Explore All Atelier <span className="accent">Departments</span>
          </h2>
        </div>
        <Link href="/shop" className="jf-sb-viewall">
          <span>View All Pieces</span>
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
              transition={{ duration: 0.35, delay: idx * 0.04 }}
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
