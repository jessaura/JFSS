'use client';

import Link from 'next/link';
import { getClearanceProducts, discountPercent } from '@/data/products';
import { getProductImage } from '@/data/images';

/**
 * Clearance Sale band for the Shop page — a dark, loud strip highlighting
 * genuine markdowns. Discount % is computed from real price vs. originalPrice
 * (see getClearanceProducts / discountPercent); nothing is invented.
 */
export default function ClearanceRail() {
  const items = getClearanceProducts();
  if (items.length === 0) return null;

  return (
    <section className="jf-clear" aria-label="Clearance sale">
      <div className="container jf-clear-inner">
        {/* The banner artwork carries the "Clearance Sale" messaging; products
            stay hidden behind it and reveal as the shopper swipes the rail. */}
        <div className="jf-clear-rail">
          {/* transparent lead spacer → banner shows first, first card peeks */}
          <div className="jf-clear-spacer" aria-hidden="true" />
          {items.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="jf-clear-card">
              <div className="jf-clear-media">
                <img src={getProductImage(product.id)} alt={product.name} loading="lazy" />
                <div className="jf-clear-disc">
                  <strong>−{discountPercent(product)}%</strong>
                  <span>Off</span>
                </div>
              </div>
              <div className="jf-clear-body">
                <p className="jf-clear-cat">{product.subcategory}</p>
                <h3 className="jf-clear-name">{product.name}</h3>
                <div className="jf-clear-price">
                  <span className="now">£{product.price}</span>
                  {product.originalPrice && <span className="was">£{product.originalPrice}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <span className="jf-clear-swipe" aria-hidden="true">
          Swipe to shop the sale
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </section>
  );
}
