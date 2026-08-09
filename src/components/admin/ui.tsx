'use client';

import { ReactNode } from 'react';

/* ---------- formatters ---------- */

export const money = (n: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);

export const shortDate = (ms: number) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(ms);

export const fullDate = (ms: number) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(ms);

/** Build a CSV and hand it to the browser as a download. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- order status ---------- */

export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Status carries an icon glyph as well as colour — never colour alone. */
export function StatusPill({ status }: { status: OrderStatus }) {
  const glyph: Record<OrderStatus, string> = {
    pending: '•',
    paid: '✓',
    shipped: '→',
    delivered: '✓✓',
    cancelled: '✕',
  };
  return (
    <span className={`adm-status adm-status-${status}`}>
      <span aria-hidden="true">{glyph[status]}</span>
      {status}
    </span>
  );
}

/* ---------- small building blocks ---------- */

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="adm-field">
      <span className="adm-label">
        {label}
        {required && <span className="adm-req" aria-hidden="true"> *</span>}
      </span>
      {children}
      {hint && <span className="adm-hint">{hint}</span>}
    </label>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'accent' | 'warn';
}) {
  return (
    <div className={`adm-stat${tone ? ` adm-stat-${tone}` : ''}`}>
      <span className="adm-stat-label">{label}</span>
      <span className="adm-stat-value">{value}</span>
      {sub && <span className="adm-stat-sub">{sub}</span>}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="adm-empty">
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function Skeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="adm-skeleton" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="adm-skeleton-row" />
      ))}
    </div>
  );
}

/* ---------- icons (single family: 1.7px stroke, 24px grid) ---------- */

const ico = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const Icon = {
  dashboard: () => (
    <svg {...ico}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
  ),
  orders: () => (
    <svg {...ico}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></svg>
  ),
  products: () => (
    <svg {...ico}><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a1 1 0 001 1h10a1 1 0 001-1V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" /></svg>
  ),
  customers: () => (
    <svg {...ico}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
  ),
  mail: () => (
    <svg {...ico}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></svg>
  ),
  logout: () => (
    <svg {...ico}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
  ),
  store: () => (
    <svg {...ico}><path d="M3 9l1-5h16l1 5" /><path d="M4 9v11a1 1 0 001 1h14a1 1 0 001-1V9" /><path d="M9 21v-6h6v6" /></svg>
  ),
  menu: () => (
    <svg {...ico}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
  ),
  close: () => (
    <svg {...ico}><path d="M18 6L6 18M6 6l12 12" /></svg>
  ),
  plus: () => (
    <svg {...ico}><path d="M12 5v14M5 12h14" /></svg>
  ),
  search: () => (
    <svg {...ico}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
  ),
  download: () => (
    <svg {...ico}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
  ),
  alert: () => (
    <svg {...ico}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></svg>
  ),
};
