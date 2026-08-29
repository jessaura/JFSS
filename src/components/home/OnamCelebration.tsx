'use client';

import Link from 'next/link';
import { getOnamProducts, isUnpriced, colorAt, formatPrice } from '@/data/products';
import { getProductImage } from '@/data/images';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { useStore } from '@/store/store';

/**
 * Onam Celebration — a festive band for authentic traditional Kerala festival
 * wear (set mundu, pattupavada, sarees, dhavani) drawn from real stock via
 * getOnamProducts. Kasavu cream-and-gold framing with a pookalam flower motif.
 */
export default function OnamCelebration() {
  const catalogue = useCatalogue();
  const { openQuickView } = useStore();
  const items = getOnamProducts(catalogue);
  if (items.length === 0) return null;

  return (
    <section className="jf-onam" aria-label="Onam festive collection">
      <div className="container">
        <div className="jf-onam-head">
          <div>
            <span className="jf-onam-eyebrow">🌾 Kerala Special · Festive Season</span>
            <h2>
              The <span className="accent">Onam</span> Edit
            </h2>
          </div>
          <p className="jf-onam-note">
            Wrap the harvest festival in gold-bordered kasavu — authentic set mundu,
            pattupavada, sarees and dhavani, handpicked for Thiruvonam.
          </p>
        </div>

        <div className="jf-onam-rail">
          {items.map((product) => {
            const swatch = colorAt(product).hex;
            return (
              <div
                key={product.id}
                onClick={() => openQuickView(product)}
                className="jf-onam-card"
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openQuickView(product)}
              >
                <div className="jf-onam-media">
                  <img src={product.images[0] || getProductImage(product.id)} alt={product.name} loading="lazy" />
                  <span className="jf-onam-tag" style={{ background: swatch }}>Onam</span>
                </div>
                <div className="jf-onam-body">
                  <p className="jf-onam-cat">{product.subcategory}</p>
                  <h3 className="jf-onam-name">{product.name}</h3>
                  <span className="jf-onam-price">
                    {isUnpriced(product) ? 'Price on request' : `£${formatPrice(product.price)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <Link href="/shop" className="jf-onam-cta">Shop the Onam collection</Link>
      </div>
    </section>
  );
}
