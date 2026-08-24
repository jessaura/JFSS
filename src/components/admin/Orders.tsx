'use client';

import { useState, useMemo } from 'react';
import { useQuery, useConvex } from 'convex/react';
import { anyApi } from 'convex/server';
import {
  money, fullDate, shortDate, StatusPill, Skeleton, EmptyState, Icon,
  ORDER_STATUSES, OrderStatus,
} from './ui';

type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address: { line1: string; city: string; postcode: string; country: string };
  items: {
    productId: string; name: string; image: string; color: string;
    size: string; price: number; quantity: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  placedAt: number;
  stockApplied?: boolean;
};

export default function Orders({
  adminKey,
  notify,
}: {
  adminKey: string;
  notify: (msg: string) => void;
}) {
  const orders = useQuery(anyApi.admin.listOrders, { adminKey }) as Order[] | undefined;
  const convex = useConvex();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<Order | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders?.length ?? 0 };
    for (const s of ORDER_STATUSES) c[s] = orders?.filter((o) => o.status === s).length ?? 0;
    return c;
  }, [orders]);

  const rows = useMemo(() => {
    if (!orders) return [];
    const q = search.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === 'all' || o.status === filter) &&
        (!q ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q))
    );
  }, [orders, filter, search]);

  async function setStatus(order: Order, status: OrderStatus) {
    await convex.mutation(anyApi.admin.updateOrderStatus, { adminKey, id: order._id, status });
    setOpen((o) => (o && o._id === order._id ? { ...o, status } : o));
    notify(`${order.orderNumber} marked ${status}`);
  }

  async function markSold(order: Order) {
    await convex.mutation(anyApi.admin.markOrderSold, { adminKey, id: order._id });
    setOpen((o) => (o && o._id === order._id ? { ...o, stockApplied: true, status: 'delivered' } : o));
    notify(`${order.orderNumber} marked sold — stock updated`);
  }

  async function markUnsold(order: Order) {
    await convex.mutation(anyApi.admin.markOrderUnsold, { adminKey, id: order._id });
    setOpen((o) => (o && o._id === order._id ? { ...o, stockApplied: false, status: 'cancelled' } : o));
    notify(`${order.orderNumber} marked unsold — stock restored`);
  }

  async function remove(order: Order) {
    if (!confirm(`Delete order ${order.orderNumber}? This cannot be undone.`)) return;
    await convex.mutation(anyApi.admin.deleteOrder, { adminKey, id: order._id });
    setOpen(null);
    notify(`Deleted ${order.orderNumber}`);
  }

  if (!orders) return <Skeleton rows={6} />;

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label="Filter orders by status">
          {(['all', ...ORDER_STATUSES] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={filter === s}
              className={`adm-tab ${filter === s ? 'on' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s}
              <span className="adm-tab-count">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="adm-search">
          <span className="adm-search-icon"><Icon.search /></span>
          <label htmlFor="adm-order-search" className="adm-sr">Search orders</label>
          <input
            id="adm-order-search"
            className="adm-input"
            placeholder="Order no, name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={orders.length === 0 ? 'No orders yet' : 'No orders match'}
          body={
            orders.length === 0
              ? 'Orders placed through the storefront checkout land here instantly.'
              : 'Try a different status filter or clear the search.'
          }
          action={
            orders.length > 0 ? (
              <button className="adm-btn adm-btn-ghost" onClick={() => { setFilter('all'); setSearch(''); }}>
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th className="adm-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o._id}>
                  <td><span className="adm-mono">{o.orderNumber}</span></td>
                  <td>
                    <span className="adm-name">{o.customerName}</span>
                    <span className="adm-muted">{o.customerEmail}</span>
                  </td>
                  <td>{shortDate(o.placedAt)}</td>
                  <td className="adm-num">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td className="adm-num">{money(o.total)}</td>
                  <td><StatusPill status={o.status} /></td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-btn adm-btn-sm" onClick={() => setOpen(o)}>Open</button>
                      <button
                        className={`adm-btn adm-btn-sm adm-btn-sold ${o.stockApplied ? 'on' : ''}`}
                        onClick={() => markSold(o)}
                        disabled={o.stockApplied}
                        title="Mark sold — reduces the ordered items from stock"
                      >
                        {o.stockApplied ? '✓ Sold' : 'Sold'}
                      </button>
                      <button
                        className="adm-btn adm-btn-sm"
                        onClick={() => markUnsold(o)}
                        disabled={!o.stockApplied}
                        title="Mark unsold — restores stock"
                      >
                        Unsold
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <OrderDetail
          order={open}
          onClose={() => setOpen(null)}
          onStatus={(s) => setStatus(open, s)}
          onDelete={() => remove(open)}
          onSaveNotes={async (notes) => {
            await convex.mutation(anyApi.admin.updateOrderNotes, { adminKey, id: open._id, notes });
            setOpen({ ...open, notes });
            notify('Notes saved');
          }}
        />
      )}
    </div>
  );
}

function OrderDetail({
  order,
  onClose,
  onStatus,
  onDelete,
  onSaveNotes,
}: {
  order: Order;
  onClose: () => void;
  onStatus: (s: OrderStatus) => void;
  onDelete: () => void;
  onSaveNotes: (notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(order.notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);

  return (
    <div className="adm-drawer-overlay" onClick={onClose}>
      <aside
        className="adm-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Order ${order.orderNumber}`}
      >
        <header className="adm-drawer-head">
          <div>
            <span className="adm-mono adm-drawer-num">{order.orderNumber}</span>
            <span className="adm-muted">{fullDate(order.placedAt)}</span>
          </div>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close order">
            <Icon.close />
          </button>
        </header>

        <div className="adm-drawer-body">
          <section>
            <h3 className="adm-section-title">Status</h3>
            <div className="adm-status-row">
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  className={`adm-chip ${order.status === s ? 'on' : ''}`}
                  onClick={() => onStatus(s)}
                  aria-pressed={order.status === s}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="adm-section-title">Customer</h3>
            <dl className="adm-deflist">
              <div><dt>Name</dt><dd>{order.customerName}</dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a></dd></div>
              {order.customerPhone && <div><dt>Phone</dt><dd>{order.customerPhone}</dd></div>}
              <div>
                <dt>Ship to</dt>
                <dd>
                  {order.address.line1}<br />
                  {order.address.city}, {order.address.postcode}<br />
                  {order.address.country}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="adm-section-title">Items</h3>
            <ul className="adm-order-items">
              {order.items.map((it, i) => (
                <li key={i}>
                  <img src={it.image} alt="" className="adm-thumb" />
                  <div className="adm-list-main">
                    <span className="adm-name">{it.name}</span>
                    <span className="adm-muted">{it.color} · {it.size} · ×{it.quantity}</span>
                  </div>
                  <span className="adm-num">{money(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="adm-totals">
              <div><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
              <div><dt>Shipping</dt><dd>{order.shipping === 0 ? 'Free' : money(order.shipping)}</dd></div>
              <div className="adm-totals-grand"><dt>Total</dt><dd>{money(order.total)}</dd></div>
            </dl>
          </section>

          <section>
            <h3 className="adm-section-title">Internal notes</h3>
            <textarea
              className="adm-input adm-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              aria-label="Internal notes"
            />
            <button
              className="adm-btn adm-btn-ghost"
              disabled={savingNotes || notes === (order.notes ?? '')}
              onClick={async () => {
                setSavingNotes(true);
                await onSaveNotes(notes);
                setSavingNotes(false);
              }}
            >
              {savingNotes ? 'Saving…' : 'Save notes'}
            </button>
          </section>
        </div>

        <footer className="adm-drawer-foot">
          <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={onDelete}>Delete order</button>
          <button className="adm-btn adm-btn-primary" onClick={onClose}>Done</button>
        </footer>
      </aside>
    </div>
  );
}
