'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { collections, products } from '@/data/products';
import { IMAGE_PENDING } from '@/data/images';

gsap.registerPlugin(ScrollTrigger);

// Each collection shows a real photographed piece from that category, so the
// tiles reflect actual stock rather than stand-in art.
const collectionImages = collections.map(
  (col) =>
    products.find((p) => p.category === col.id && p.images.length)?.images[0] ??
    IMAGE_PENDING
);

export default function CollectionsGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.jf-col-card', {
        y: 56,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' },
      });

      // Parallax the card backgrounds via background-position (keeps the
      // hover-scale transform on the same element untouched).
      gsap.utils.toArray<HTMLElement>('.jf-col-bg').forEach((bg) => {
        gsap.fromTo(
          bg,
          { backgroundPosition: '50% 22%' },
          {
            backgroundPosition: '50% 78%',
            ease: 'none',
            scrollTrigger: { trigger: bg, scrub: true, start: 'top bottom', end: 'bottom top' },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="jf-collections" ref={sectionRef}>
      <div className="container">
        <div className="jf-collections-head">
          <div className="jf-head">
            <span className="jf-eyebrow">Casual Wardrobe</span>
            <h2 className="jf-h2">
              Four ways to dress <span className="accent">every day</span>
            </h2>
          </div>
          <Link href="/shop" className="jf-collections-viewall">
            View all collections
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="jf-mosaic">
          {collections.map((col, i) => (
            <Link key={col.id} href={`/shop?category=${col.id}`} className={`jf-col-card jf-mosaic-${i}`}>
              <div
                className="jf-col-bg"
                style={{ backgroundImage: `url(${collectionImages[i]})` }}
              />
              <div className="jf-col-content">
                <span className="jf-col-index">{String(i + 1).padStart(2, '0')} / 04</span>
                <span className="jf-col-sub">{col.subtitle}</span>
                <h3 className="jf-col-title">{col.title}</h3>
                <p className="jf-col-desc">{col.description}</p>
                <span className="jf-col-go">
                  Explore
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
