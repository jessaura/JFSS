'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { anyApi } from 'convex/server';
import MobileHero from './MobileHero';
import HeroLoopingLogo from './HeroLoopingLogo';
import HeroRoulette from './HeroRoulette';
import { getFeaturedProducts, isUnpriced, formatPrice } from '@/data/products';
import { getProductImage } from '@/data/images';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { useStore } from '@/store/store';

const CONVEX_READY = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

const FLOAT_SPOTS = [
  { top: '4%', left: '-13%' },
  { top: '20%', right: '4%' },
  { top: '56%', left: '-17%' },
  { top: '74%', right: '8%' },
];

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const catalogue = useCatalogue();
  const { openQuickView } = useStore();
  const floats = getFeaturedProducts(catalogue).slice(0, 4);

  useEffect(() => {
    if (!heroRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.jf-hero-desktop .jf-logo-stage', { y: 16, opacity: 0, duration: 0.7, delay: 0.3 })
        .from('.jf-hero-desktop .jf-hero-title', { y: 30, opacity: 0, duration: 0.9 }, '-=0.2')
        .from('.jf-hero-desktop .jf-hero-sub', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.jf-hero-desktop .jf-hero-cta', { y: 18, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.jf-hero-desktop .jf-hero-proof', { y: 14, opacity: 0, duration: 0.5 }, '-=0.35')
        .from('.jf-hero-desktop .jf-hero-stage', { x: 44, opacity: 0, duration: 1 }, '-=0.7')
        .from('.jf-hero-desktop .jf-hero-float', { opacity: 0, duration: 0.55, stagger: 0.09 }, '-=0.55');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="jf-hero" ref={heroRef}>
      {/* Desktop Hero Experience (>= 901px) */}
      <div className="jf-hero-desktop">
        <div className="jf-hero-split">
          {/* Left: animated logo + the sentence content */}
          <div className="jf-hero-copy">
            <HeroLoopingLogo />

            <h1 className="jf-hero-title">
              Dailywear, <span className="accent">thoughtfully made.</span>
            </h1>

            <p className="jf-hero-sub">
              Breathable organic cottons, slub linens and relaxed silhouettes —
              South Asian essentials, designed for everyday wear.
            </p>

            <div className="jf-hero-cta">
              <Link href="/shop" className="jf-btn jf-btn-primary">
                Shop the collection
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/shop?category=women" className="jf-btn jf-btn-ghost">
                Browse womenswear
              </Link>
            </div>

            {CONVEX_READY && <SocialProof />}
          </div>

          {/* Right: auto-rotating photo carousel with floating product cards */}
          <div className="jf-hero-stage">
            <HeroRoulette />

            {floats.map((product, i) => (
              <div
                key={product.id}
                onClick={() => openQuickView(product)}
                className="jf-hero-float"
                style={{ ...FLOAT_SPOTS[i], cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openQuickView(product)}
              >
                <img src={getProductImage(product.id)} alt="" loading="lazy" />
                <span className="jf-hero-float-text">
                  <span className="jf-hero-float-name">{product.name}</span>
                  <span className="jf-hero-float-price">
                    {isUnpriced(product) ? 'Price on request' : `£${formatPrice(product.price)}`}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dedicated Luxury Mobile Hero Experience (< 900px) */}
      <div className="jf-hero-mobile">
        <MobileHero />
      </div>

      <div className="jf-hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}

/**
 * Customer proof, from real data only. Renders nothing until the store has
 * actually taken orders — no invented "loved by 50,000+" claim. Avatars are
 * neutral monograms because we hold no customer imagery.
 */
function SocialProof() {
  const count = useQuery(anyApi.orders.customerCount, {}) as number | undefined;

  if (!count || count < 1) return null;

  return (
    <div className="jf-hero-proof">
      <span className="jf-proof-avatars" aria-hidden="true">
        {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
          <span key={i} className="jf-proof-avatar" />
        ))}
      </span>
      <span className="jf-proof-text">
        Loved by <b>{count.toLocaleString()}</b>{' '}
        {count === 1 ? 'customer' : 'customers'}
      </span>
    </div>
  );
}
