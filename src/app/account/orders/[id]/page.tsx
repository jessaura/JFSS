'use client';

export const dynamic = 'force-dynamic';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { anyApi } from 'convex/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { colorAt } from '@/data/products';
import { useStore } from '@/store/store';

type OrderItem = {
  productId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
};
type Order = {
  orderNumber: string;
  status: string;
  placedAt: number;
  customerName: string;
  address: { line1: string; city: string; postcode: string; country: string };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string;
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = useQuery(anyApi.orders.getMine, { id }) as Order | null | undefined;
  const catalogue = useCatalogue();
  const { addToCart, openCart } = useStore();

  function reorder() {
    if (!order) return;
    let added = 0;
    for (const it of order.items) {
      const product = catalogue.find((p) => p.id === it.productId);
      if (!product) continue; // piece no longer in the catalogue
      const color = product.colors.find((c) => c.name === it.color) ?? colorAt(product);
      addToCart(product, color, it.size, it.quantity);
      added++;
    }
    if (added > 0) openCart();
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="account">
        <div className="container">
          <nav className="wk-crumb" aria-label="Breadcrumb">
            <Link href="/account">Account</Link><span aria-hidden="true">/</span>
            <Link href="/account/orders">Orders</Link><span aria-hidden="true">/</span>
            <span>{order?.orderNumber ?? 'Order'}</span>
          </nav>

          {order === undefined ? (
            <p className="jf-checkout-note">Loading…</p>
          ) : order === null ? (
            <div className="ord-empty">
              <p>We couldn’t find that order on your account.</p>
              <Link href="/account/orders" className="jf-btn jf-btn-ghost">Back to orders</Link>
            </div>
          ) : (
            <>
              <header className="account-head ord-detail-head">
                <div>
                  <span className="account-eyebrow">{order.orderNumber}</span>
                  <h1>Order details</h1>
                  <p>
                    Placed {new Date(order.placedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}<span className={`ord-status ord-status-${order.status}`}>{order.status}</span>
                  </p>
                </div>
                <button className="jf-btn jf-btn-primary" onClick={reorder}>Reorder</button>
              </header>

              <div className="ord-items">
                {order.items.map((it, i) => (
                  <div key={i} className="ord-item">
                    <img src={it.image} alt={it.name} loading="lazy" />
                    <div className="ord-item-body">
                      <strong>{it.name}</strong>
                      <span>{it.color !== '' ? `${it.color} · ` : ''}{it.size} · ×{it.quantity}</span>
                    </div>
                    <span className="ord-item-price">£{(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="ord-summary">
                <div className="ord-summary-block">
                  <h3>Delivery</h3>
                  <p>{order.customerName}<br />{order.address.line1}<br />{order.address.city}, {order.address.postcode}<br />{order.address.country}</p>
                  {order.notes && <p className="ord-notes">“{order.notes}”</p>}
                </div>
                <div className="ord-summary-block ord-totals">
                  <div><span>Subtotal</span><span>£{order.subtotal.toFixed(2)}</span></div>
                  <div><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : `£${order.shipping.toFixed(2)}`}</span></div>
                  <div className="ord-grand"><span>Total</span><span>£{order.total.toFixed(2)}</span></div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
