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
      <div className="container">
        <div className="jf-clear-head">
          <div>
            <span className="jf-clear-eyebrow">Final Markdowns</span>
            <h2>
              Clearance <span className="accent">Sale</span>
            </h2>
          </div>
          <p className="jf-clear-note">
            Last-chance pieces at their lowest price — limited sizes, while stock lasts.
          </p>
        </div>

        <div className="jf-clear-rail">
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
      </div>
    </section>
  );
}
