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
export type CheckoutInitial = {
  name?: string;
  email?: string;
  phone?: string;
  line1?: string;
  city?: string;
  postcode?: string;
  country?: string;
};

export default function CheckoutForm({
  onClose,
  initial,
}: {
  onClose: () => void;
  initial?: CheckoutInitial;
}) {
  const convex = useConvex();
  const { cart, cartTotal, clearCart } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState<string | null>(null);
  // wa.me link built from the order, or '' when no WhatsApp number is configured.
  const [waUrl, setWaUrl] = useState('');
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    line1: initial?.line1 ?? '',
    city: initial?.city ?? '',
    postcode: initial?.postcode ?? '',
    country: initial?.country ?? 'United Kingdom',
    notes: '',
  });

  const subtotal = cartTotal();
  const shipping = subtotal >= 75 ? 0 : 6;

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildWaUrl(orderNumber: string, number: string) {
    const digits = number.replace(/[^0-9]/g, '');
    if (!digits) return '';
    const lines = cart.map(
      (i) => `• ${i.product.name} — ${i.color.name} / ${i.size} ×${i.quantity} — £${(i.product.price * i.quantity).toFixed(2)}`
    );
    const msg = [
      `Hi JessAura! I'd like to confirm my order.`,
      ``,
      `Order: ${orderNumber}`,
      ...lines,
      ``,
      `Subtotal: £${subtotal.toFixed(2)}`,
      `Shipping: ${shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`}`,
      `Total: £${(subtotal + shipping).toFixed(2)}`,
      ``,
      `Name: ${form.name}`,
      ...(form.phone ? [`Phone: ${form.phone}`] : []),
      `Address: ${form.line1}, ${form.city}, ${form.postcode}, ${form.country}`,
      ...(form.notes ? [`Notes: ${form.notes}`] : []),
    ].join('\n');
    return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
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
      // Order is recorded regardless; if a WhatsApp number is set, offer the chat.
      const settings = (await convex.query(anyApi.settings.get, {})) as
        | { whatsappNumber?: string }
        | null;
      setWaUrl(buildWaUrl(res.orderNumber, settings?.whatsappNumber ?? ''));
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
        <h3>Order saved</h3>
        {waUrl ? (
          <>
            <p className="jf-checkout-note">
              Your reference is <strong>{placed}</strong>. Tap below to confirm it
              on WhatsApp — we&apos;ll sort payment &amp; delivery there.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="jf-btn jf-btn-whatsapp jf-checkout-submit"
              onClick={onClose}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.25-8.24 8.25zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
              </svg>
              Confirm order on WhatsApp
            </a>
            <button className="jf-btn jf-btn-ghost" onClick={onClose}>Not now</button>
          </>
        ) : (
          <>
            <p className="jf-checkout-note">
              Your reference is <strong>{placed}</strong>. We&apos;ll be in touch to
              confirm payment and delivery shortly.
            </p>
            <button className="jf-btn jf-btn-primary" onClick={onClose}>Done</button>
          </>
        )}
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
        {busy ? 'Placing order…' : 'Place order & message on WhatsApp'}
      </button>
      <p className="jf-checkout-note">
        No payment is taken here — you&apos;ll confirm payment &amp; delivery with
        us on WhatsApp.
      </p>
    </form>
  );
}
