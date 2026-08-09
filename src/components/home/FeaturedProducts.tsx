'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getFeaturedProducts, Product, isUnpriced } from '@/data/products';
import { getProductImage } from '@/data/images';
import { useStore } from '@/store/store';

gsap.registerPlugin(ScrollTrigger);

function EditCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="jf-edit-card">
      <Link href={`/product/${product.id}`}>
        <div className="jf-edit-media">
          <img src={getProductImage(product.id)} alt={product.name} loading="lazy" />
          {product.new ? (
            <span className="jf-rcard-badge jf-badge-new">New</span>
          ) : product.bestSeller ? (
            <span className="jf-rcard-badge jf-badge-best">★ Bestseller</span>
          ) : null}
        </div>
      </Link>
      <button
        className="jf-edit-fav"
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={wishlisted ? 'var(--gold)' : 'none'}
          stroke={wishlisted ? 'var(--gold)' : 'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>
      <Link href={`/product/${product.id}`}>
        <p className="jf-edit-cat">{product.subcategory}</p>
        <h3 className="jf-edit-name">{product.name}</h3>
        <div className="jf-edit-price">
          {isUnpriced(product) ? (
            <span className="poa">Price on request</span>
          ) : (
            <>
              <span className="now">${product.price}</span>
              {product.originalPrice && <span className="was">${product.originalPrice}</span>}
            </>
          )}
        </div>
      </Link>
    </div>
  );
}

export default function FeaturedProducts() {
  const sectionRef = useRef<HTMLElement>(null);
  const featured = getFeaturedProducts();

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.jf-edit .jf-head', {
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="jf-edit" ref={sectionRef}>
      <div className="container">
        <div className="jf-collections-head">
          <div className="jf-head">
            <span className="jf-eyebrow">Everyday Staples</span>
            <h2 className="jf-h2">
              The <span className="accent">Edit</span>
            </h2>
            <p className="jf-lede">Handpicked cottons and breezy linens, ready to wear straight from the rail.</p>
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Link href="/shop" className="jf-btn jf-btn-ghost">View all pieces</Link>
          </motion.div>
        </div>

        <div className="jf-edit-rail">
          {featured.map((product) => (
            <EditCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
