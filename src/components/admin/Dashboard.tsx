'use client';

import { useQuery } from 'convex/react';
import { anyApi } from 'convex/server';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { totalStock } from '@/data/products';
import { money, shortDate, Stat, StatusPill, Skeleton, EmptyState, Icon, OrderStatus } from './ui';

type DashboardData = {
  revenue: number;
  orderCount: number;
  avgOrder: number;
  units: number;
  pending: number;
  toShip: number;
  productCount: number;
  featuredCount: number;
  subscriberCount: number;
  lowStock: { name: string; stock: number }[];
  series: { date: number; revenue: number; orders: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  recentOrders: {
    orderNumber: string;
    customerName: string;
    total: number;
    status: OrderStatus;
    placedAt: number;
  }[];
};

export default function Dashboard({
  adminKey,
  onGoToOrders,
}: {
  adminKey: string;
  onGoToOrders: () => void;
}) {
  const data = useQuery(anyApi.admin.dashboard, { adminKey }) as DashboardData | undefined;

  // Product totals come from the FULL catalogue (static + Convex overlay), not
  // just the Convex rows — otherwise the count only reflects edited products.
  const catalogue = useCatalogue();
  const productCount = catalogue.length;
  const featuredCount = catalogue.filter((p) => p.featured).length;
  const manualSold = catalogue.reduce((n, p) => n + (p.sold ?? 0), 0);
  const lowStock = catalogue
    .map((p) => ({ name: p.name, stock: totalStock(p) }))
    .filter((x) => x.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 12);

  if (!data) return <Skeleton rows={6} />;

  return (
    <div className="adm-stack">
      <div className="adm-stats">
        <Stat label="Revenue" value={money(data.revenue)} sub="all time, excl. cancelled" />
        <Stat label="Orders" value={data.orderCount} sub={`${data.units} units sold`} />
        <Stat label="Avg order" value={money(data.avgOrder)} />
        <Stat
          label="Awaiting action"
          value={data.pending + data.toShip}
          sub={`${data.pending} new · ${data.toShip} to ship`}
          tone={data.pending + data.toShip > 0 ? 'accent' : undefined}
        />
        <Stat label="Products" value={productCount} sub={`${featuredCount} featured`} />
        <Stat label="Units sold (manual)" value={manualSold} sub="recorded in Products" />
        <Stat label="Subscribers" value={data.subscriberCount} />
      </div>

      <RevenueChart series={data.series} />

      <div className="adm-cols">
        <section className="adm-card">
          <header className="adm-card-head">
            <h2>Recent orders</h2>
            <button className="adm-link" onClick={onGoToOrders}>View all</button>
          </header>
          {data.recentOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              body="Orders placed through the storefront checkout appear here in real time."
            />
          ) : (
            <ul className="adm-list">
              {data.recentOrders.map((o) => (
                <li key={o.orderNumber} className="adm-list-row">
                  <div className="adm-list-main">
                    <span className="adm-mono">{o.orderNumber}</span>
                    <span className="adm-muted">{o.customerName}</span>
                  </div>
                  <StatusPill status={o.status} />
                  <span className="adm-num">{money(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="adm-card">
          <header className="adm-card-head">
            <h2>Best sellers</h2>
          </header>
          {data.topProducts.length === 0 ? (
            <EmptyState title="No sales data" body="Best sellers rank once orders start coming in." />
          ) : (
            <ul className="adm-list">
              {data.topProducts.map((p, i) => (
                <li key={p.name} className="adm-list-row">
                  <span className="adm-rank">{i + 1}</span>
                  <div className="adm-list-main">
                    <span>{p.name}</span>
                    <span className="adm-muted">{p.units} sold</span>
                  </div>
                  <span className="adm-num">{money(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {lowStock.length > 0 && (
        <section className="adm-card adm-card-warn">
          <header className="adm-card-head">
            <h2><span className="adm-card-icon"><Icon.alert /></span> Low stock</h2>
          </header>
          <ul className="adm-list">
            {lowStock.map((p) => (
              <li key={p.name} className="adm-list-row">
                <div className="adm-list-main"><span>{p.name}</span></div>
                <span className={`adm-num ${p.stock === 0 ? 'adm-num-danger' : ''}`}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * Hand-built SVG bar chart — 14-day revenue. No chart library for one
 * sparkline; bars carry <title> tooltips and the section ships a table
 * alternative for screen readers.
 */
function RevenueChart({ series }: { series: DashboardData['series'] }) {
  const max = Math.max(...series.map((d) => d.revenue), 1);
  const total = series.reduce((s, d) => s + d.revenue, 0);
  const W = 100;
  const H = 34;
  const gap = 1.4;
  const barW = (W - gap * (series.length - 1)) / series.length;

  return (
    <section className="adm-card">
      <header className="adm-card-head">
        <h2>Revenue · last 14 days</h2>
        <span className="adm-num">{money(total)}</span>
      </header>

      {total === 0 ? (
        <EmptyState
          title="No revenue in this window"
          body="The chart fills in as orders are placed over the next two weeks."
        />
      ) : (
        <>
          <svg
            className="adm-chart"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Daily revenue for the last 14 days, totalling ${money(total)}. Peak day ${money(max)}.`}
          >
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} className="adm-chart-grid" />
            ))}
            {series.map((d, i) => {
              const h = (d.revenue / max) * (H - 2);
              return (
                <rect
                  key={d.date}
                  x={i * (barW + gap)}
                  y={H - h}
                  width={barW}
                  height={Math.max(h, d.revenue > 0 ? 0.6 : 0)}
                  rx="0.6"
                  className="adm-chart-bar"
                >
                  <title>{`${shortDate(d.date)} — ${money(d.revenue)} (${d.orders} orders)`}</title>
                </rect>
              );
            })}
          </svg>
          <div className="adm-chart-axis" aria-hidden="true">
            <span>{shortDate(series[0].date)}</span>
            <span>{shortDate(series[series.length - 1].date)}</span>
          </div>
          <details className="adm-chart-table">
            <summary>View as table</summary>
            <table className="adm-table">
              <thead><tr><th>Day</th><th>Orders</th><th>Revenue</th></tr></thead>
              <tbody>
                {series.map((d) => (
                  <tr key={d.date}>
                    <td>{shortDate(d.date)}</td>
                    <td>{d.orders}</td>
                    <td>{money(d.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </section>
  );
}
