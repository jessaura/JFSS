'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CategoryTile {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  bgPosition: string;
  tag: string;
  link: string;
}

const CATEGORY_TILES: CategoryTile[] = [
  {
    id: 'women',
    title: "Women's Edit",
    subtitle: 'Linen Dresses & Occasion',
    description: 'Slub linen midis, botanical floral prints, and flowing sarees crafted for effortless grace.',
    image: '/images/womens-collection.png',
    bgPosition: 'center 18%',
    tag: 'Slub Linen & Midis',
    link: '/shop?category=women',
  },
  {
    id: 'men',
    title: "Men's Everyday",
    subtitle: 'Shirts, Polos & Kurtas',
    description: 'Breathable linen kurtas, Nehru jackets, and tailored everyday silhouettes.',
    image: '/images/mens-collection.png',
    bgPosition: 'center 22%',
    tag: 'Artisanal Kurtas',
    link: '/shop?category=men',
  },
  {
    id: 'kids',
    title: 'Kids & Juniors',
    subtitle: 'Breathable Cotton Sets',
    description: 'Soft organic cottons, gentle playful kurtas, and easy dailywear for boys and girls.',
    image: '/images/kids-collection.jpg',
    bgPosition: 'center 15%',
    tag: 'Pure Cotton Dailywear',
    link: '/shop?category=kids',
  },
  {
    id: 'unisex',
    title: 'Festive & Shared Weaves',
    subtitle: 'Artisanal Kerala Edits',
    description: 'Celebration sets, Kasavu gold borders, and heritage handcrafted textiles.',
    image: '/images/festive-collection.png',
    bgPosition: 'center 20%',
    tag: 'Kasavu Gold & Handlooms',
    link: '/shop?type=festive',
  },
];

export default function CollectionsGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.jf-col-card', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="jf-collections" ref={sectionRef} aria-label="Casual Wardrobe Collections">
      <div className="container">
        <div className="jf-collections-head">
          <div className="jf-head">
            <span className="jf-eyebrow">Casual Wardrobe</span>
            <h2 className="jf-h2">
              Four ways to dress <span className="accent">every day</span>
            </h2>
            <p className="jf-lede">
              Explore thoughtfully curated edits across pure slub linens, breathable cottons, and timeless South Asian cuts.
            </p>
          </div>
          <Link href="/shop" className="jf-collections-viewall">
            <span>View all collections</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="jf-mosaic">
          {CATEGORY_TILES.map((col, i) => (
            <Link
              key={col.id}
              href={col.link}
              className={`jf-col-card jf-mosaic-${i}`}
              aria-label={`Explore ${col.title}`}
            >
              <div
                className="jf-col-bg"
                style={{
                  backgroundImage: `url("${col.image}")`,
                  backgroundPosition: col.bgPosition,
                }}
              />
              <div className="jf-col-scrim" />
              
              <div className="jf-col-content">
                <div className="jf-col-top">
                  <span className="jf-col-index">{String(i + 1).padStart(2, '0')} / 04</span>
                  <span className="jf-col-pill">{col.tag}</span>
                </div>
                <div className="jf-col-bottom">
                  <span className="jf-col-sub">{col.subtitle}</span>
                  <h3 className="jf-col-title">{col.title}</h3>
                  <p className="jf-col-desc">{col.description}</p>
                  <span className="jf-col-go">
                    <span>Explore Collection</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
