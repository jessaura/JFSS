'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import { Product, isUnpriced, colorAt, variantStock, formatPrice } from '@/data/products';
import { getProductImage } from '@/data/images';
import { useProduct, useCatalogue } from '@/components/providers/CatalogueProvider';
import { useStore } from '@/store/store';

/* ---------- Size Guide Panel ---------- */
function SizeGuide({ open, onClose, category }: { open: boolean; onClose: () => void; category: string }) {
  const menSizes = [
    { size: 'S', chest: '36"', waist: '30"', hip: '37"', length: '28"' },
    { size: 'M', chest: '38"', waist: '32"', hip: '39"', length: '29"' },
    { size: 'L', chest: '40"', waist: '34"', hip: '41"', length: '30"' },
    { size: 'XL', chest: '42"', waist: '36"', hip: '43"', length: '31"' },
    { size: 'XXL', chest: '44"', waist: '38"', hip: '45"', length: '32"' },
  ];

  const womenSizes = [
    { size: 'XS', bust: '32"', waist: '26"', hip: '35"', length: '38"' },
    { size: 'S', bust: '34"', waist: '28"', hip: '37"', length: '39"' },
    { size: 'M', bust: '36"', waist: '30"', hip: '39"', length: '40"' },
    { size: 'L', bust: '38"', waist: '32"', hip: '41"', length: '41"' },
    { size: 'XL', bust: '40"', waist: '34"', hip: '43"', length: '42"' },
  ];

  const sizes = category === 'men' ? menSizes : womenSizes;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="cart-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="size-guide-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
              <h2 className="font-display">Size Guide</h2>
              <button className="cart-drawer-close" onClick={onClose}>✕</button>
            </div>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--charcoal-muted)', marginBottom: 'var(--space-xl)' }}>
              All measurements are in inches. For the best fit, measure yourself and compare with our size chart below.
            </p>

            <table className="size-guide-table">
              <thead>
                <tr>
                  <th>Size</th>
                  {category === 'men' ? (
                    <>
                      <th>Chest</th>
                      <th>Waist</th>
                      <th>Hip</th>
                      <th>Length</th>
                    </>
                  ) : (
                    <>
                      <th>Bust</th>
                      <th>Waist</th>
                      <th>Hip</th>
                      <th>Length</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {sizes.map((s) => (
                  <tr key={s.size}>
                    <td style={{ fontWeight: 600 }}>{s.size}</td>
                    <td>{category === 'men' ? (s as typeof menSizes[0]).chest : (s as typeof womenSizes[0]).bust}</td>
                    <td>{s.waist}</td>
                    <td>{s.hip}</td>
                    <td>{s.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: 'var(--space-xl)', background: 'var(--ivory)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-xl)' }}>
              <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>How to Measure</h4>
              <ul style={{ fontSize: 'var(--text-sm)', color: 'var(--charcoal-muted)', lineHeight: 1.8 }}>
                <li>• <strong>Chest/Bust:</strong> Measure around the fullest part</li>
                <li>• <strong>Waist:</strong> Measure around your natural waistline</li>
                <li>• <strong>Hip:</strong> Measure around the widest part</li>
                <li>• <strong>Length:</strong> Measure from shoulder to desired length</li>
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- Product Detail Page ---------- */
export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const catalogue = useCatalogue();
  const product = useProduct(id);
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!infoRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.product-info > *', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.2,
      });
    }, infoRef);

    return () => ctx.revert();
  }, [id]);

  if (!product) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 className="font-display" style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-xl)' }}>
              Product Not Found
            </h1>
            <Link href="/shop" className="btn btn-primary">
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const selectedColor = colorAt(product, activeColor);
  // Variants key colour by name in colors[], or '' for colourless pieces.
  const variantColorKey = product.colors.length ? selectedColor.name : '';
  const sizeQty = (size: string) => variantStock(product, size, variantColorKey);
  const activeSizeOut = Boolean(activeSize) && sizeQty(activeSize) <= 0;
  // The main photo follows the chosen colour when that colour has its own image.
  const shownImage = selectedColor.image || getProductImage(product.id);
  // Thumbnails = colours that carry a photo; clicking one selects that colour.
  const colorThumbs = product.colors.filter((c) => c.image);

  const handleAddToCart = () => {
    if (!activeSize || activeSizeOut || isUnpriced(product)) return;
    addToCart(product, selectedColor, activeSize, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const relatedProducts = catalogue
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <SizeGuide
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={product.category}
      />

      <main className="product-detail">
        <div className="container">
          {/* Breadcrumb */}
          <div style={{ marginBottom: 'var(--space-xl)', fontSize: 'var(--text-sm)', color: 'var(--charcoal-muted)' }}>
            <Link href="/" style={{ transition: 'color 0.2s' }}>Home</Link>
            {' / '}
            <Link href="/shop" style={{ transition: 'color 0.2s' }}>Shop</Link>
            {' / '}
            <span style={{ color: 'var(--charcoal)' }}>{product.name}</span>
          </div>

          <div className="product-detail-grid">
            {/* Gallery */}
            <div className="product-gallery">
              <motion.div
                className="product-gallery-main"
                style={{
                  background: `linear-gradient(135deg, ${selectedColor.hex}15, ${selectedColor.hex}40)`,
                }}
                key={shownImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={shownImage}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </motion.div>

              {/* Thumbnails = each colour that has a photo. */}
              {colorThumbs.length > 1 && (
                <div className="product-gallery-thumbs">
                  {colorThumbs.map((c) => {
                    const i = product.colors.indexOf(c);
                    return (
                      <button
                        key={c.name}
                        className={`product-gallery-thumb ${i === activeColor ? 'active' : ''}`}
                        onClick={() => setActiveColor(i)}
                        aria-label={c.name}
                      >
                        <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info" ref={infoRef}>
              <p className="product-info-overline">
                {[product.subcategory, product.category].filter(Boolean).join(' · ')}
              </p>

              <h1>{product.name}</h1>

              {/* Stars only once real reviews exist — no phantom ratings. */}
              {product.reviews > 0 && (
                <div className="product-info-rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ opacity: i < Math.round(product.rating) ? 1 : 0.3 }}>
                      ★
                    </span>
                  ))}
                  <span>{product.rating} ({product.reviews} reviews)</span>
                </div>
              )}

              <div className="product-info-price">
                {isUnpriced(product) ? (
                  <span className="current product-poa">Price on request</span>
                ) : (
                  <span className="current">£{formatPrice(product.price)}</span>
                )}
                {!isUnpriced(product) && product.originalPrice && (
                  <>
                    <span className="original">£{product.originalPrice}</span>
                    <span className="discount">{discount}% OFF</span>
                  </>
                )}
              </div>

              <p className="product-info-description">{product.description}</p>

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <>
                  <div className="product-option-label">
                    Color: <span>{selectedColor.name}</span>
                  </div>
                  <div className="product-colors">
                    {product.colors.map((color, i) => (
                      <motion.div
                        key={color.name}
                        className={`product-color-swatch ${i === activeColor ? 'active' : ''}`}
                        style={{ background: color.hex }}
                        onClick={() => { setActiveColor(i); setActiveSize(''); }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Size Selection — out-of-stock sizes for the chosen colour disable. */}
              {product.sizes.length > 0 && (
                <>
                  <div className="product-option-label">
                    Size: <span>{activeSize || 'Select a size'}</span>
                  </div>
                  <div className="product-sizes">
                    {product.sizes.map((size) => {
                      const out = sizeQty(size) <= 0;
                      return (
                        <motion.button
                          key={size}
                          className={`product-size-btn ${size === activeSize ? 'active' : ''} ${out ? 'out' : ''}`}
                          onClick={() => !out && setActiveSize(size)}
                          disabled={out}
                          title={out ? 'Out of stock in this colour' : undefined}
                          whileHover={out ? undefined : { scale: 1.05 }}
                          whileTap={out ? undefined : { scale: 0.95 }}
                        >
                          {size}
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              )}
              <button
                className="size-guide-link"
                onClick={() => setSizeGuideOpen(true)}
              >
                View Size Guide →
              </button>

              {/* Quantity */}
              <div className="product-option-label">Quantity</div>
              <div className="product-quantity">
                <div className="product-quantity-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <motion.span key={quantity} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
                    {quantity}
                  </motion.span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="product-actions">
                <motion.button
                  className={`product-add-to-cart ${addedToCart ? 'added' : ''}`}
                  onClick={handleAddToCart}
                  // No price → no cart; and can't buy a size that's out of stock.
                  disabled={isUnpriced(product) || activeSizeOut}
                  title={isUnpriced(product) ? 'This piece is not priced yet' : undefined}
                  whileHover={isUnpriced(product) || activeSizeOut ? undefined : { scale: 1.02 }}
                  whileTap={isUnpriced(product) || activeSizeOut ? undefined : { scale: 0.98 }}
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span
                        key="added"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                      >
                        ✓ Added to Bag
                      </motion.span>
                    ) : activeSizeOut ? (
                      <motion.span key="out" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                        Out of stock
                      </motion.span>
                    ) : isUnpriced(product) ? (
                      <motion.span
                        key="poa"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                      >
                        Price on request
                      </motion.span>
                    ) : !activeSize ? (
                      <motion.span
                        key="select"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                      >
                        Select a Size
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                      >
                        Add to Bag — ${(product.price * quantity).toFixed(2)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  className={`product-wishlist-btn ${wishlisted ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {wishlisted ? '❤️' : '🤍'}
                </motion.button>
              </div>

              {/* Meta */}
              <div className="product-meta">
                {product.fabric && (
                  <div className="product-meta-item">
                    <strong>Fabric</strong>
                    <span>{product.fabric}</span>
                  </div>
                )}
                <div className="product-meta-item">
                  <strong>Category</strong>
                  <span>{product.subcategory || '—'}</span>
                </div>
                {typeof product.stock === 'number' && (
                  <div className="product-meta-item">
                    <strong>Availability</strong>
                    <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                  </div>
                )}
                <div className="product-meta-item">
                  <strong>Shipping</strong>
                  <span>Free shipping on orders over $75</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="section">
              <div className="section-header filigree-border" style={{ paddingTop: 'var(--space-2xl)' }}>
                <span className="text-overline">You May Also Like</span>
                <h2>Related Pieces</h2>
              </div>

              <div className="featured-scroll">
                {relatedProducts.map((p, i) => (
                  <RelatedCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function RelatedCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/product/${product.id}`}>
        <div className="product-card-image">
          <div
            className="product-card-image-inner"
            style={{
              background: `linear-gradient(135deg, ${colorAt(product).hex}22, ${colorAt(product).hex}55)`,
            }}
          >
            <img
              src={getProductImage(product.id)}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
        <div className="product-card-info">
          <p className="product-card-category">{product.subcategory}</p>
          <h3 className="product-card-name">{product.name}</h3>
          <div className="product-card-price">
            {isUnpriced(product) ? (
              <span className="current product-poa">Price on request</span>
            ) : (
              <>
                <span className="current">£{formatPrice(product.price)}</span>
                {product.originalPrice && <span className="was">£{product.originalPrice}</span>}
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
