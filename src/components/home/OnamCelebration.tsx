'use client';

import Link from 'next/link';
import { getOnamProducts, isUnpriced, colorAt } from '@/data/products';
import { getProductImage } from '@/data/images';
import { useCatalogue } from '@/components/providers/CatalogueProvider';

/**
 * Onam Celebration — a festive band for authentic traditional Kerala festival
 * wear (set mundu, pattupavada, sarees, dhavani) drawn from real stock via
 * getOnamProducts. Kasavu cream-and-gold framing with a pookalam flower motif.
 */
export default function OnamCelebration() {
  const items = getOnamProducts(useCatalogue());
  if (items.length === 0) return null;

  return (
    <section className="jf-onam" aria-label="Onam celebration collection">
      <span className="jf-onam-pookalam" aria-hidden="true" />
      <span className="jf-onam-pookalam alt" aria-hidden="true" />

      <div className="container jf-onam-inner">
        <div className="jf-onam-head">
          <span className="jf-onam-eyebrow">Onam Special · Kerala Tradition</span>
          <h2>
            Onam <span className="accent">Celebration</span>
          </h2>
          <p className="jf-onam-note">
            Wrap the harvest festival in gold-bordered kasavu — authentic set mundu,
            pattupavada, sarees and dhavani, handpicked for Thiruvonam.
          </p>
        </div>

        <div className="jf-onam-rail">
          {items.map((product) => {
            const swatch = colorAt(product).hex;
            return (
              <Link key={product.id} href={`/product/${product.id}`} className="jf-onam-card">
                <div className="jf-onam-media">
                  <img src={product.images[0] || getProductImage(product.id)} alt={product.name} loading="lazy" />
                  <span className="jf-onam-tag" style={{ background: swatch }}>Onam</span>
                </div>
                <div className="jf-onam-body">
                  <p className="jf-onam-cat">{product.subcategory}</p>
                  <h3 className="jf-onam-name">{product.name}</h3>
                  <span className="jf-onam-price">
                    {isUnpriced(product) ? 'Price on request' : `£${product.price}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <Link href="/shop" className="jf-onam-cta">Shop the Onam edit</Link>
      </div>
    </section>
  );
}
