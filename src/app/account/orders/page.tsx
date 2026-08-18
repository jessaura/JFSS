'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { anyApi } from 'convex/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';

type Order = {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  placedAt: number;
  items: { quantity: number }[];
};

function StatusTag({ status }: { status: string }) {
  return <span className={`ord-status ord-status-${status}`}>{status}</span>;
}

export default function OrdersPage() {
  const orders = useQuery(anyApi.orders.listMine) as Order[] | undefined;
  const linkGuest = useMutation(anyApi.orders.linkMyGuestOrders);

  // Pull in any past guest orders placed with this (verified) email.
  useEffect(() => {
    linkGuest().catch(() => {});
  }, [linkGuest]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="account">
        <div className="container">
          <nav className="wk-crumb" aria-label="Breadcrumb">
            <Link href="/account">Account</Link><span aria-hidden="true">/</span><span>Orders</span>
          </nav>

          <header className="account-head">
            <span className="account-eyebrow">Orders</span>
            <h1>Your orders</h1>
            <p>Track what you’ve ordered and reorder your favourites.</p>
          </header>

          {orders === undefined ? (
            <p className="jf-checkout-note">Loading…</p>
          ) : orders.length === 0 ? (
            <div className="ord-empty">
              <p>You haven’t placed any orders yet.</p>
              <Link href="/shop" className="jf-btn jf-btn-primary">Start shopping</Link>
            </div>
          ) : (
            <div className="ord-list">
              {orders.map((o) => {
                const count = o.items.reduce((n, i) => n + i.quantity, 0);
                return (
                  <Link key={o._id} href={`/account/orders/${o._id}`} className="ord-row">
                    <div className="ord-row-main">
                      <strong>{o.orderNumber}</strong>
                      <span className="ord-row-meta">
                        {new Date(o.placedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}{count} {count === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <StatusTag status={o.status} />
                    <span className="ord-row-total">£{o.total.toFixed(2)}</span>
                    <span className="ord-row-go" aria-hidden="true">→</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
