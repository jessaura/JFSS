'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/store';
import { isUnpriced, colorAt, variantStock, discountPercent, formatPrice } from '@/data/products';
import { getProductImage } from '@/data/images';

export default function ProductModal() {
  const { quickViewProduct, closeQuickView, addToCart, toggleWishlist, isWishlisted, openCart } = useStore();
  const product = quickViewProduct;

  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Reset local state when opened product changes
  useEffect(() => {
    if (product) {
      setActiveColor(0);
      setActiveSize(product.sizes.length > 0 ? product.sizes[0] : '');
      setQuantity(1);
      setAddedToCart(false);
      setShowSizeGuide(false);
    }
  }, [product]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSizeGuide) {
          setShowSizeGuide(false);
        } else {
          closeQuickView();
        }
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, showSizeGuide, closeQuickView]);

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);
  const disc = discountPercent(product);
  const selectedColor = colorAt(product, activeColor);
  const variantColorKey = product.colors.length ? selectedColor.name : '';
  const sizeQty = (size: string) => variantStock(product, size, variantColorKey);
  const activeSizeOut = Boolean(activeSize) && sizeQty(activeSize) <= 0;
  const shownImage = selectedColor.image || product.images[0] || getProductImage(product.id);
  const colorThumbs = product.colors.filter((c) => c.image);

  const handleAddToCart = () => {
    if (!activeSize || activeSizeOut || isUnpriced(product)) return;
    addToCart(product, selectedColor, activeSize, quantity);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      closeQuickView();
      openCart();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="jf-modal-wrapper" role="dialog" aria-modal="true" aria-labelledby="jf-modal-title">
        {/* Backdrop */}
        <motion.div
          className="jf-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeQuickView}
        />

        {/* Modal Dialog */}
        <motion.div
          className="jf-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        >
          {/* Close Button */}
          <button
            className="jf-modal-close"
            onClick={closeQuickView}
            aria-label="Close product view"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="jf-modal-grid">
            {/* Left: Product Media Gallery */}
            <div className="jf-modal-media">
              <div className="jf-modal-main-image">
                <img
                  src={shownImage}
                  alt={product.name}
                  loading="eager"
                />

                {/* Badges */}
                <div className="jf-modal-badges">
                  {disc > 0 && <span className="jf-badge-sale">-{disc}% OFF</span>}
                  {product.new && <span className="jf-badge-new">New In</span>}
                  {product.bestSeller && <span className="jf-badge-best">★ Bestseller</span>}
                </div>
              </div>

              {/* Color thumbnails if multi-color */}
              {colorThumbs.length > 1 && (
                <div className="jf-modal-thumbs">
                  {product.colors.map((c, idx) => (
                    <button
                      key={c.name}
                      type="button"
                      className={`jf-modal-thumb-btn ${idx === activeColor ? 'active' : ''}`}
                      onClick={() => setActiveColor(idx)}
                      title={c.name}
                    >
                      <img src={c.image || shownImage} alt={c.name} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details & Controls */}
            <div className="jf-modal-content">
              {/* Category & Tags */}
              <div className="jf-modal-meta">
                <span className="jf-modal-category">{product.subcategory || product.category}</span>
                {product.stock !== undefined && product.stock <= 4 && product.stock > 0 && (
                  <span className="jf-modal-stock-warn">⚡ Only {product.stock} left in stock</span>
                )}
              </div>

              {/* Title */}
              <h2 id="jf-modal-title" className="jf-modal-title">{product.name}</h2>

              {/* Rating */}
              <div className="jf-modal-rating">
                <div className="jf-stars" aria-label={`Rated ${product.rating || 5} out of 5`}>
                  {'★'.repeat(Math.round(product.rating || 5))}
                  {'☆'.repeat(5 - Math.round(product.rating || 5))}
                </div>
                <span className="jf-review-count">({product.reviews || 12} reviews)</span>
              </div>

              {/* Price */}
              <div className="jf-modal-price-row">
                {isUnpriced(product) ? (
                  <span className="jf-modal-poa">Price on request</span>
                ) : (
                  <>
                    <span className="jf-modal-price">£{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="jf-modal-original-price">£{formatPrice(product.originalPrice)}</span>
                    )}
                    {disc > 0 && <span className="jf-modal-saving">Save £{(product.originalPrice! - product.price).toFixed(2)}</span>}
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="jf-modal-desc">
                {product.shortDescription || product.description}
              </p>

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="jf-modal-option-group">
                  <div className="jf-modal-option-header">
                    <span className="jf-modal-option-label">Colour:</span>
                    <span className="jf-modal-option-val">{selectedColor.name}</span>
                  </div>
                  <div className="jf-modal-swatches">
                    {product.colors.map((c, idx) => (
                      <button
                        key={c.name}
                        type="button"
                        className={`jf-modal-swatch ${idx === activeColor ? 'active' : ''}`}
                        style={{ backgroundColor: c.hex }}
                        onClick={() => setActiveColor(idx)}
                        title={c.name}
                        aria-label={`Select ${c.name} color`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="jf-modal-option-group">
                  <div className="jf-modal-option-header">
                    <span className="jf-modal-option-label">Size:</span>
                    <button
                      type="button"
                      className="jf-modal-size-guide-btn"
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                    >
                      📏 Size Guide
                    </button>
                  </div>
                  <div className="jf-modal-sizes">
                    {product.sizes.map((s) => {
                      const qty = sizeQty(s);
                      const isOut = qty <= 0;
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={isOut}
                          className={`jf-modal-size-btn ${activeSize === s ? 'active' : ''} ${isOut ? 'disabled' : ''}`}
                          onClick={() => setActiveSize(s)}
                        >
                          {s}
                          {isOut && <span className="jf-size-strike" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="jf-modal-actions-row">
                <div className="jf-modal-qty">
                  <button
                    type="button"
                    className="jf-qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="jf-qty-val">{quantity}</span>
                  <button
                    type="button"
                    className="jf-qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className={`jf-modal-add-btn ${addedToCart ? 'added' : ''}`}
                  disabled={activeSizeOut || (!activeSize && product.sizes.length > 0) || isUnpriced(product)}
                  onClick={handleAddToCart}
                >
                  {addedToCart ? (
                    '✓ Added to Bag'
                  ) : activeSizeOut ? (
                    'Out of Stock'
                  ) : isUnpriced(product) ? (
                    'Price on Request'
                  ) : (
                    'Add to Bag · £' + formatPrice(product.price * quantity)
                  )}
                </button>

                <button
                  type="button"
                  className={`jf-modal-fav-btn ${wishlisted ? 'wishlisted' : ''}`}
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={wishlisted ? 'var(--gold, #C5A880)' : 'none'}
                    stroke={wishlisted ? 'var(--gold, #C5A880)' : 'currentColor'}
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Size Guide Drawer (inline collapse) */}
              <AnimatePresence>
                {showSizeGuide && (
                  <motion.div
                    className="jf-modal-size-guide-box"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <h4>Size Guide (Inches)</h4>
                    <table className="jf-modal-size-table">
                      <thead>
                        <tr>
                          <th>Size</th>
                          <th>Bust / Chest</th>
                          <th>Waist</th>
                          <th>Hip</th>
                          <th>Length</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>S</td><td>34" - 36"</td><td>28" - 30"</td><td>37"</td><td>40"</td></tr>
                        <tr><td>M</td><td>36" - 38"</td><td>30" - 32"</td><td>39"</td><td>41"</td></tr>
                        <tr><td>L</td><td>38" - 40"</td><td>32" - 34"</td><td>41"</td><td>42"</td></tr>
                        <tr><td>XL</td><td>40" - 42"</td><td>34" - 36"</td><td>43"</td><td>42"</td></tr>
                        <tr><td>XXL</td><td>42" - 44"</td><td>36" - 38"</td><td>45"</td><td>43"</td></tr>
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Extra Highlights */}
              <div className="jf-modal-features">
                <div className="jf-feature-item">
                  <span className="jf-feat-icon">🧵</span>
                  <span><strong>Fabric:</strong> {product.fabric || '100% Premium Pure Slub Linen & Cotton'}</span>
                </div>
                <div className="jf-feature-item">
                  <span className="jf-feat-icon">📦</span>
                  <span><strong>Delivery:</strong> Free UK shipping on orders over £50</span>
                </div>
                <div className="jf-feature-item">
                  <span className="jf-feat-icon">🔄</span>
                  <span><strong>Returns:</strong> 14-day hassle-free returns & exchanges</span>
                </div>
              </div>

              {/* Full Page Link */}
              <div className="jf-modal-footer-link">
                <Link
                  href={`/product/${product.id}`}
                  onClick={closeQuickView}
                  className="jf-link-full-page"
                >
                  View full product specification page →
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
