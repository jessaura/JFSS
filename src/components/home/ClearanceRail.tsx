'use client';

import Link from 'next/link';
import { getClearanceProducts, discountPercent, formatPrice } from '@/data/products';
import { getProductImage } from '@/data/images';
import { useCatalogue } from '@/components/providers/CatalogueProvider';

/**
 * Clearance Sale band for the Shop page — a dark, loud strip highlighting
 * genuine markdowns. Discount % is computed from real price vs. originalPrice
 * (see getClearanceProducts / discountPercent); nothing is invented.
 *
 * The products auto-scroll as a seamless marquee (cards rendered twice, the
 * track slides -50% via the shared jf-slide keyframe). Pauses on hover; under
 * prefers-reduced-motion it falls back to a static scroll row.
 */
export default function ClearanceRail() {
  const catalogue = useCatalogue();
  const items = getClearanceProducts(catalogue);
  if (items.length === 0) return null;

  const card = (product: (typeof items)[number], clone: boolean) => (
    <Link
      key={`${product.id}${clone ? '-c' : ''}`}
      href={`/product/${product.id}`}
      className="jf-clear-card"
      aria-hidden={clone || undefined}
      tabIndex={clone ? -1 : undefined}
    >
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
          <span className="now">£{formatPrice(product.price)}</span>
          {product.originalPrice && <span className="was">£{formatPrice(product.originalPrice)}</span>}
        </div>
      </div>
    </Link>
  );

  return (
    <section className="jf-clear" aria-label="Clearance sale">
      <div className="container jf-clear-inner">
        <div className="jf-clear-head">
          <div>
            <span className="jf-clear-eyebrow">🔥 Limited Time Markdowns · Final Reductions</span>
            <h2>
              Clearance <span className="accent">Sale</span>
            </h2>
          </div>
          <p className="jf-clear-note">
            Exclusive markdowns on premium South Asian wear. Limited sizes &amp; quantities available — grab yours before they sell out!
          </p>
        </div>

        <div className="jf-clear-rail">
          <div className="jf-clear-track">
            {items.map((p) => card(p, false))}
            {items.map((p) => card(p, true))}
          </div>
        </div>
      </div>
    </section>
  );
}
