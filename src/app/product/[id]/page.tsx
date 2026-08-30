'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import { Product, ProductColor, discountPercent, isUnpriced, colorAt, formatPrice, DEFAULT_COLOR } from '@/data/products';
import { getProductImage } from '@/data/images';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { useStore } from '@/store/store';

export default function ProductSpecificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const catalogue = useCatalogue();
  const { addToCart, toggleWishlist, isWishlisted, toggleCart } = useStore();

  const product = useMemo(() => {
    return catalogue.find((p) => p.id === id || p.slug === id);
  }, [id, catalogue]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('fabric');
  const [added, setAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const activeColorObj = useMemo<ProductColor>(() => {
    if (!product) return DEFAULT_COLOR;
    if (selectedColor) {
      const match = product.colors.find((c) => c.name === selectedColor);
      if (match) return match;
    }
    return colorAt(product);
  }, [product, selectedColor]);

  const currentColor = activeColorObj.name;

  const currentSize = useMemo(() => {
    if (!product) return '';
    return selectedSize || (product.sizes.length > 0 ? product.sizes[0] : 'One Size');
  }, [product, selectedSize]);

  const wishlisted = product ? isWishlisted(product.id) : false;
  const disc = product ? discountPercent(product) : 0;
  const unpriced = product ? isUnpriced(product) : false;

  // Related items
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return catalogue
      .filter((p) => p.id !== product.id && (p.category === product.category || p.subcategory === product.subcategory))
      .slice(0, 4);
  }, [product, catalogue]);

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="jf-product-spec-page">
          <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Piece Not Found</h2>
            <p style={{ color: 'var(--text-secondary)' }}>The requested garment could not be located in our atelier catalog.</p>
            <Link href="/shop" className="jf-btn jf-btn-primary">
              Return to Shop Collection
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const images = product.images.length > 0 ? product.images : [getProductImage(product.id)];

  const handleAddToCart = () => {
    if (unpriced) return;
    addToCart(product, activeColorObj, currentSize, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      toggleCart();
    }, 600);
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="jf-product-spec-page">
        {/* Breadcrumb Navigation */}
        <div className="container jf-spec-breadcrumb-wrap">
          <nav className="jf-spec-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="jf-spec-breadcrumb-sep">/</span>
            <Link href="/shop">Shop</Link>
            <span className="jf-spec-breadcrumb-sep">/</span>
            <Link href={`/shop?category=${product.category}`}>
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Link>
            <span className="jf-spec-breadcrumb-sep">/</span>
            <span className="jf-spec-breadcrumb-current">{product.name}</span>
          </nav>
          <button type="button" className="jf-spec-back-btn" onClick={() => router.back()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
        </div>

        {/* Product Hero Split Showcase */}
        <div className="container jf-spec-main-grid">
          {/* Left: Multi-Image Showcase Gallery */}
          <div className="jf-spec-gallery">
            <div className="jf-spec-main-image-wrap">
              <img
                src={images[activeImageIdx] || images[0]}
                alt={product.name}
                className="jf-spec-main-img"
              />

              {/* Badges */}
              <div className="jf-spec-image-badges">
                {disc > 0 && <span className="jf-spec-badge-disc">−{disc}% OFF</span>}
                {product.new && <span className="jf-spec-badge-new">New Arrival</span>}
                {product.fabric && (
                  <span className="jf-spec-badge-fabric">{product.fabric}</span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                className={`jf-spec-fav-btn ${wishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill={wishlisted ? 'var(--gold, #C5A880)' : 'none'}
                  stroke={wishlisted ? 'var(--gold, #C5A880)' : 'currentColor'}
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>

            {/* Thumbnail Strip (if multiple images) */}
            {images.length > 1 && (
              <div className="jf-spec-thumbs-track">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    className={`jf-spec-thumb-btn ${activeImageIdx === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIdx(idx)}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Specification Details */}
          <div className="jf-spec-details">
            {/* Category & Collection */}
            <div className="jf-spec-meta-top">
              <span className="jf-spec-dept-tag">
                {product.subcategory || product.category} · Atelier Collection
              </span>
              <span className="jf-spec-sku">Item #{product.id.toUpperCase()}</span>
            </div>

            {/* Title */}
            <h1 className="jf-spec-title">{product.name}</h1>

            {/* Price Row */}
            <div className="jf-spec-price-wrap">
              {unpriced ? (
                <span className="jf-spec-poa">Price on Request</span>
              ) : (
                <>
                  <span className="jf-spec-now-price">£{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="jf-spec-was-price">£{formatPrice(product.originalPrice)}</span>
                  )}
                  {disc > 0 && <span className="jf-spec-save-tag">Save {disc}%</span>}
                </>
              )}
            </div>

            {/* Short Narrative Description */}
            {product.description && (
              <p className="jf-spec-description">{product.description}</p>
            )}

            {/* Color Swatch Selector */}
            {product.colors.length > 0 && (
              <div className="jf-spec-option-section">
                <div className="jf-spec-option-header">
                  <span className="jf-spec-option-label">Color:</span>
                  <span className="jf-spec-option-val">{currentColor}</span>
                </div>
                <div className="jf-spec-swatches-row">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      className={`jf-spec-swatch-btn ${currentColor === c.name ? 'active' : ''}`}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      aria-label={`Select color ${c.name}`}
                    >
                      <span className="jf-spec-swatch-dot" style={{ backgroundColor: c.hex }} />
                      <span className="jf-spec-swatch-name">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div className="jf-spec-option-section">
                <div className="jf-spec-option-header">
                  <span className="jf-spec-option-label">Select Size:</span>
                  <button
                    type="button"
                    className="jf-spec-size-guide-btn"
                    onClick={() => setSizeGuideOpen(true)}
                  >
                    Size &amp; Fit Guide
                  </button>
                </div>
                <div className="jf-spec-sizes-row">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={`jf-spec-size-btn ${currentSize === sz ? 'active' : ''}`}
                      onClick={() => setSelectedSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Primary Add to Bag Action */}
            <div className="jf-spec-action-row">
              <div className="jf-spec-qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className={`jf-spec-add-btn ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={unpriced}
              >
                {added ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                    <span>Add to Bag · £{formatPrice(product.price * quantity)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Maison Assurance Strip */}
            <div className="jf-spec-assurance-bar">
              <div className="jf-spec-assurance-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span>Complimentary UK Delivery over £50</span>
              </div>
              <div className="jf-spec-assurance-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>14-Day Effortless UK Returns</span>
              </div>
              <div className="jf-spec-assurance-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
                <span>100% Artisan South Asian Handloom</span>
              </div>
            </div>

            {/* Expandable Specifications Accordions */}
            <div className="jf-spec-accordions">
              {/* Accordion 1: Fabric & Artisan Craft */}
              <div className="jf-spec-accordion-item">
                <button
                  type="button"
                  className="jf-spec-accordion-header"
                  onClick={() => toggleAccordion('fabric')}
                  aria-expanded={activeAccordion === 'fabric'}
                >
                  <span>🌿 Fabric &amp; Artisan Craftsmanship</span>
                  <span className="jf-spec-accordion-icon">{activeAccordion === 'fabric' ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {activeAccordion === 'fabric' && (
                    <motion.div
                      className="jf-spec-accordion-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p>
                        Woven from <strong>{product.fabric || '100% Pure Slub Linen & Organic Cotton'}</strong>, chosen for its featherlight breathability, rich natural texture, and enduring drape. Each piece is crafted in limited ethical artisanal runs in Kerala and London.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 2: Care Instructions */}
              <div className="jf-spec-accordion-item">
                <button
                  type="button"
                  className="jf-spec-accordion-header"
                  onClick={() => toggleAccordion('care')}
                  aria-expanded={activeAccordion === 'care'}
                >
                  <span>🧼 Care &amp; Longevity Instructions</span>
                  <span className="jf-spec-accordion-icon">{activeAccordion === 'care' ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {activeAccordion === 'care' && (
                    <motion.div
                      className="jf-spec-accordion-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ul>
                        <li>Machine wash on gentle 30°C cycle or gentle handwash.</li>
                        <li>Use mild eco-friendly liquid detergent; avoid bleach.</li>
                        <li>Line dry in gentle shade to preserve artisan dye intensity.</li>
                        <li>Warm iron on reverse while slightly damp for crisp linen drape.</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 3: Delivery & Returns */}
              <div className="jf-spec-accordion-item">
                <button
                  type="button"
                  className="jf-spec-accordion-header"
                  onClick={() => toggleAccordion('shipping')}
                  aria-expanded={activeAccordion === 'shipping'}
                >
                  <span>🚚 UK Delivery &amp; Returns Policy</span>
                  <span className="jf-spec-accordion-icon">{activeAccordion === 'shipping' ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {activeAccordion === 'shipping' && (
                    <motion.div
                      className="jf-spec-accordion-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p>
                        <strong>Standard UK Tracked (2–4 working days):</strong> Free on orders over £50 (£3.99 under £50).<br />
                        <strong>Next-Day Dispatch:</strong> Available at checkout.<br />
                        <strong>14-Day Returns:</strong> Unworn items with tags can be returned within 14 days of delivery.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Curated "You May Also Adore" Section */}
        {relatedProducts.length > 0 && (
          <section className="jf-spec-related-section">
            <div className="container">
              <div className="jf-spec-related-head">
                <span className="jf-spec-related-eyebrow">COMPLETE YOUR WARDROBE</span>
                <h2 className="jf-spec-related-title">You May Also Adore</h2>
              </div>

              <div className="jf-luxury-grid cols-4">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/product/${rel.id}`}
                    className="jf-staples-card"
                  >
                    <div className="jf-staples-media">
                      <img
                        src={rel.images[0] || getProductImage(rel.id)}
                        alt={rel.name}
                        loading="lazy"
                        className="jf-staples-img"
                      />
                      <div className="jf-staples-badges">
                        {rel.fabric && (
                          <span className="jf-staples-fabric-pill">{rel.fabric.replace('100% ', '')}</span>
                        )}
                        {discountPercent(rel) > 0 && (
                          <span className="jf-staples-disc-pill">−{discountPercent(rel)}% OFF</span>
                        )}
                      </div>
                    </div>
                    <div className="jf-staples-body">
                      <span className="jf-staples-category">{rel.subcategory || rel.category}</span>
                      <h3 className="jf-staples-title">{rel.name}</h3>
                      <div className="jf-staples-price-row">
                        <span className="jf-staples-price">£{formatPrice(rel.price)}</span>
                        {rel.originalPrice && rel.originalPrice > rel.price && (
                          <span className="jf-staples-original-price">£{formatPrice(rel.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Mobile Sticky Add-To-Bag Action Bar */}
        <div className="jf-spec-mobile-sticky-bar">
          <div className="jf-spec-sticky-price">
            <span className="label">Total Price</span>
            <span className="val">£{formatPrice(product.price * quantity)}</span>
          </div>
          <button
            type="button"
            className={`jf-spec-sticky-btn ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={unpriced}
          >
            {added ? 'Added to Bag ✓' : 'Add to Bag'}
          </button>
        </div>

        {/* Size Guide Modal */}
        <AnimatePresence>
          {sizeGuideOpen && (
            <motion.div
              className="jf-size-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSizeGuideOpen(false)}
            >
              <motion.div
                className="jf-size-modal-card"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="jf-size-modal-head">
                  <h3>Garment Size &amp; Measurements</h3>
                  <button type="button" onClick={() => setSizeGuideOpen(false)}>×</button>
                </div>
                <div className="jf-size-modal-table-wrap">
                  <table className="jf-size-table">
                    <thead>
                      <tr>
                        <th>Size (UK)</th>
                        <th>Bust (in)</th>
                        <th>Waist (in)</th>
                        <th>Length (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>S (8–10)</strong></td>
                        <td>34–36&quot;</td>
                        <td>28–30&quot;</td>
                        <td>46&quot;</td>
                      </tr>
                      <tr>
                        <td><strong>M (12–14)</strong></td>
                        <td>38–40&quot;</td>
                        <td>32–34&quot;</td>
                        <td>47&quot;</td>
                      </tr>
                      <tr>
                        <td><strong>L (16–18)</strong></td>
                        <td>42–44&quot;</td>
                        <td>36–38&quot;</td>
                        <td>48&quot;</td>
                      </tr>
                      <tr>
                        <td><strong>XL (20)</strong></td>
                        <td>46–48&quot;</td>
                        <td>40–42&quot;</td>
                        <td>49&quot;</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="jf-size-modal-note">
                  All Jessaura linen garments are tailored in relaxed, breathable South Asian silhouettes. If you prefer a closer fit, we recommend selecting one size down.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </>
  );
}
