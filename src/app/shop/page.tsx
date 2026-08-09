'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import ClearanceRail from '@/components/home/ClearanceRail';
import { products, Product, discountPercent } from '@/data/products';
import { getProductImage } from '@/data/images';
import { useStore } from '@/store/store';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
];

const types = [
  { value: 'all', label: 'All Types' },
  { value: 'ready-to-wear', label: 'Ready-to-Wear' },
  { value: 'semi-stitched', label: 'Semi-Stitched' },
];

function ShopProductCard({ product, index }: { product: Product; index: number }) {
  const { toggleWishlist, isWishlisted, addToCart } = useStore();
  const [activeColor, setActiveColor] = useState(0);
  const [added, setAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const disc = discountPercent(product);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, product.colors[activeColor], product.sizes[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      className="jf-pcard"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.04 }}
    >
      <div className="jf-pcard-media">
        <Link href={`/product/${product.id}`}>
          <img src={getProductImage(product.id)} alt={product.name} loading="lazy" />
        </Link>

        {product.new ? (
          <span className="jf-rcard-badge jf-badge-new">New</span>
        ) : product.bestSeller ? (
          <span className="jf-rcard-badge jf-badge-best">★ Bestseller</span>
        ) : disc > 0 ? (
          <span className="jf-rcard-badge jf-badge-sale">−{disc}%</span>
        ) : null}

        <button
          className="jf-pcard-fav"
          onClick={() => toggleWishlist(product.id)}
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

        <button className={`jf-pcard-add ${added ? 'added' : ''}`} onClick={handleAdd}>
          {added ? '✓ Added to bag' : 'Add to bag'}
        </button>
      </div>

      <div className="jf-pcard-info">
        <p className="jf-pcard-cat">{product.subcategory} · {product.type}</p>
        <Link href={`/product/${product.id}`}>
          <h3 className="jf-pcard-name">{product.name}</h3>
        </Link>
        <div className="jf-pcard-price">
          <span className="now">${product.price}</span>
          {product.originalPrice && <span className="was">${product.originalPrice}</span>}
        </div>
        <div className="jf-pcard-colors">
          {product.colors.map((color, i) => (
            <button
              key={color.name}
              className={`dot ${i === activeColor ? 'active' : ''}`}
              style={{ background: color.hex }}
              onClick={() => setActiveColor(i)}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.jf-shop-head > *', {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (activeCategory !== 'all') filtered = filtered.filter((p) => p.category === activeCategory);
    if (activeType !== 'all') filtered = filtered.filter((p) => p.type === activeType);

    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
      case 'newest': filtered.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0)); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      default: filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return filtered;
  }, [activeCategory, activeType, sortBy]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        <div className="jf-shop-head" ref={headerRef}>
          <div className="container">
            <span className="jf-eyebrow">Casual & Dailywear</span>
            <h1 className="jf-h2">Shop <span className="accent">JessAura</span></h1>
            <p className="jf-lede jf-shop-lede">
              Breathable cotton kurtis, short linen kurtas, casual palazzo sets and comfortable dailywear.
            </p>
          </div>
        </div>

        {/* Clearance Sale */}
        <div className="container" style={{ marginBottom: 'var(--space-3xl)' }}>
          <ClearanceRail />
        </div>

        <div className="container" style={{ paddingBottom: 'var(--space-4xl)' }}>
          <div className="jf-shop-bar">
            <div className="jf-shop-filters">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  className={`jf-fchip ${activeCategory === cat.value ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
              <span className="jf-fdivider" />
              {types.map((type) => (
                <button
                  key={type.value}
                  className={`jf-fchip ${activeType === type.value ? 'active' : ''}`}
                  onClick={() => setActiveType(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="jf-shop-sort">
              <span className="jf-shop-count">{filteredProducts.length} pieces</span>
              <select className="jf-shop-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          <motion.div className="jf-shop-grid" layout>
            <AnimatePresence>
              {filteredProducts.map((product, i) => (
                <ShopProductCard key={product.id} product={product} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredProducts.length === 0 && (
            <div className="jf-shop-empty">
              <p>No pieces match your filters.</p>
              <button
                className="jf-btn jf-btn-ghost"
                onClick={() => { setActiveCategory('all'); setActiveType('all'); }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
