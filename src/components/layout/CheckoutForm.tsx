'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useConvex } from 'convex/react';
import { anyApi } from 'convex/server';
import { useStore } from '@/store/store';
import { getProductImage } from '@/data/images';

const CONVEX_READY = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

/**
 * Checkout sheet inside the cart drawer. Collects delivery details and
 * writes a real order to Convex, then clears the cart. Payment is handled
 * offline for now — orders land as "pending" for the shop to confirm.
 */
export default function CheckoutForm({ onClose }: { onClose: () => void }) {
  const convex = useConvex();
  const { cart, cartTotal, clearCart } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    line1: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    notes: '',
  });

  const subtotal = cartTotal();
  const shipping = subtotal >= 75 ? 0 : 6;

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await convex.mutation(anyApi.orders.place, {
        customerName: form.name,
        customerEmail: form.email.trim().toLowerCase(),
        ...(form.phone ? { customerPhone: form.phone } : {}),
        address: {
          line1: form.line1,
          city: form.city,
          postcode: form.postcode,
          country: form.country,
        },
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          image: getProductImage(item.product.id),
          color: item.color.name,
          size: item.size,
          price: item.product.price,
          quantity: item.quantity,
        })),
        ...(form.notes ? { notes: form.notes } : {}),
      });
      setPlaced(res.orderNumber);
      clearCart();
    } catch {
      setError('Could not place the order. Please check your details and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (!CONVEX_READY) {
    return (
      <div className="jf-checkout">
        <p className="jf-checkout-note">
          Checkout is unavailable until the store backend is connected.
        </p>
        <button className="jf-btn jf-btn-ghost" onClick={onClose}>Back to bag</button>
      </div>
    );
  }

  if (placed) {
    return (
      <motion.div
        className="jf-checkout jf-checkout-done"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--crimson)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <path d="M22 4L12 14.01l-3-3" />
        </svg>
        <h3>Order placed</h3>
        <p className="jf-checkout-note">
          Your reference is <strong>{placed}</strong>. We&apos;ll email confirmation
          and delivery details shortly.
        </p>
        <button className="jf-btn jf-btn-primary" onClick={onClose}>Done</button>
      </motion.div>
    );
  }

  return (
    <form className="jf-checkout" onSubmit={submit}>
      <div className="jf-checkout-head">
        <button type="button" className="jf-checkout-back" onClick={onClose} aria-label="Back to bag">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h3>Delivery details</h3>
      </div>

      <label className="jf-field">
        <span>Full name *</span>
        <input className="jf-input" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" required />
      </label>
      <label className="jf-field">
        <span>Email *</span>
        <input className="jf-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" required />
      </label>
      <label className="jf-field">
        <span>Phone</span>
        <input className="jf-input" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
      </label>
      <label className="jf-field">
        <span>Address *</span>
        <input className="jf-input" value={form.line1} onChange={(e) => set('line1', e.target.value)} autoComplete="address-line1" required />
      </label>
      <div className="jf-field-row">
        <label className="jf-field">
          <span>City *</span>
          <input className="jf-input" value={form.city} onChange={(e) => set('city', e.target.value)} autoComplete="address-level2" required />
        </label>
        <label className="jf-field">
          <span>Postcode *</span>
          <input className="jf-input" value={form.postcode} onChange={(e) => set('postcode', e.target.value)} autoComplete="postal-code" required />
        </label>
      </div>
      <label className="jf-field">
        <span>Country *</span>
        <input className="jf-input" value={form.country} onChange={(e) => set('country', e.target.value)} autoComplete="country-name" required />
      </label>
      <label className="jf-field">
        <span>Order notes</span>
        <textarea className="jf-input jf-textarea" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} />
      </label>

      <div className="jf-checkout-totals">
        <div><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
        <div><span>Shipping</span><span>{shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`}</span></div>
        <div className="jf-checkout-grand"><span>Total</span><span>£{(subtotal + shipping).toFixed(2)}</span></div>
      </div>

      {error && <p className="jf-checkout-error" role="alert">{error}</p>}

      <button className="jf-btn jf-btn-primary jf-checkout-submit" disabled={busy || cart.length === 0}>
        {busy ? 'Placing order…' : 'Place order'}
      </button>
      <p className="jf-checkout-note">
        We&apos;ll confirm by email — no payment is taken on this screen.
      </p>
    </form>
  );
}
