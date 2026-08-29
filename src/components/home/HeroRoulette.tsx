'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getFeaturedProducts } from '@/data/products';
import { getProductImage } from '@/data/images';
import { useCatalogue } from '@/components/providers/CatalogueProvider';

/**
 * Hero carousel — one shot at a time, sliding sideways (translateX track)
 * with a 5s auto-advance. Pauses on hover; prev/next for manual control.
 * Auto-advance and the slide transition are disabled under
 * prefers-reduced-motion.
 *
 * Image-only by design: no name, price or badge overlay. Currently runs on
 * the placeholder catalogue art; point `shots` at the real photography once
 * it lands with its product data.
 */
export default function HeroRoulette() {
  const catalogue = useCatalogue();
  const featured = getFeaturedProducts(catalogue);
  const shots = (featured.length > 0 ? featured : catalogue.slice(0, 6)).map((p) => ({
    id: p.id,
    src: p.images[0] || getProductImage(p.id),
  }));
  const total = Math.max(shots.length, 1);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

  // Auto-advance every 5s (paused on hover / under reduced motion)
  useEffect(() => {
    if (paused || reduce.current) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  return (
    <div
      className="jf-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="jf-carousel-viewport">
        <div className="jf-carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {shots.map((shot, i) => (
            <div className="jf-cc-slide" key={shot.id} aria-hidden={i !== index}>
              <img
                src={shot.src}
                alt=""
                className="jf-cc-photo"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="jf-carousel-nav">
        <button className="jf-cn-btn" onClick={prev} aria-label="Previous photo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="jf-cn-progress" aria-hidden="true">
          <span style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>

        <button className="jf-cn-btn" onClick={next} aria-label="Next photo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
