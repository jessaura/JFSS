'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/store';
import { getProductImage } from '@/data/images';
import Link from 'next/link';
import CheckoutForm from './CheckoutForm';
import CheckoutGate from './CheckoutGate';

// When Clerk is on, checkout requires login (CheckoutGate). Without Clerk
// (local/dev before setup) fall back to the original guest form.
const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function CartDrawer() {
  const { cart, cartOpen, closeCart, updateQuantity, removeFromCart, cartTotal, cartCount } = useStore();
  const [checkingOut, setCheckingOut] = useState(false);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="cart-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="cart-drawer-header">
              <h2>Your Bag ({cartCount()})</h2>
              <button className="cart-drawer-close" onClick={closeCart} aria-label="Close cart">
                ✕
              </button>
            </div>

            {checkingOut ? (
              <div className="cart-drawer-items">
                {clerkEnabled ? (
                  <CheckoutGate onClose={() => setCheckingOut(false)} />
                ) : (
                  <CheckoutForm onClose={() => setCheckingOut(false)} />
                )}
              </div>
            ) : (
              <>
            <div className="cart-drawer-items">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon">🛍️</div>
                  <p>Your bag is empty</p>
                  <Link href="/shop" onClick={closeCart}>
                    <button className="btn btn-primary">Continue Shopping</button>
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  {cart.map((item, index) => (
                    <motion.div
                      key={`${item.product.id}-${item.color.name}-${item.size}`}
                      className="cart-item"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div
                        className="cart-item-image"
                        style={{ background: `linear-gradient(135deg, ${item.color.hex}22, ${item.color.hex}44)` }}
                      >
                        <img
                          src={getProductImage(item.product.id)}
                          alt={item.product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      <div className="cart-item-details">
                        <span className="cart-item-name">{item.product.name}</span>
                        <span className="cart-item-meta">
                          {item.color.name} · {item.size}
                        </span>

                        <div className="cart-item-qty">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.color.name, item.size, item.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                          >
                            {item.quantity}
                          </motion.span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.color.name, item.size, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="cart-item-remove"
                          onClick={() => removeFromCart(item.product.id, item.color.name, item.size)}
                        >
                          Remove
                        </button>
                      </div>

                      <span className="cart-item-price">
                        £{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {cart.length > 0 && (
              <motion.div
                className="cart-drawer-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="cart-total">
                  <span>Subtotal</span>
                  <motion.span
                    key={cartTotal()}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                  >
                    £{cartTotal().toFixed(2)}
                  </motion.span>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={() => setCheckingOut(true)}
                >
                  Checkout
                </button>
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--charcoal-muted)',
                    marginTop: 'var(--space-md)',
                  }}
                >
                  Free shipping on orders over £200
                </p>
              </motion.div>
            )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
