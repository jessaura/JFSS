'use client';

export const dynamic = 'force-dynamic';

import { useState, FormEvent, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useConvex, useQuery } from 'convex/react';
import { anyApi } from 'convex/server';
import { useUser, useClerk } from '@clerk/nextjs';
import { Icon } from '@/components/admin/ui';
import Dashboard from '@/components/admin/Dashboard';
import Orders from '@/components/admin/Orders';
import Products from '@/components/admin/Products';
import Customers from '@/components/admin/Customers';
import Subscribers from '@/components/admin/Subscribers';
import Settings from '@/components/admin/Settings';

const CONVEX_READY = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: Icon.dashboard },
  { id: 'orders', label: 'Orders', icon: Icon.orders },
  { id: 'products', label: 'Products', icon: Icon.products },
  { id: 'customers', label: 'Customers', icon: Icon.customers },
  { id: 'subscribers', label: 'Subscribers', icon: Icon.mail },
  { id: 'settings', label: 'Settings', icon: Icon.settings },
] as const;

type ViewId = (typeof NAV)[number]['id'];

/**
 * The admin key lives in sessionStorage (cleared when the tab closes).
 * Exposed as an external store so React can read it without a
 * setState-in-effect round trip, and without a hydration mismatch —
 * the server snapshot is always null, so SSR renders the gate.
 */
const KEY = 'jessaura-admin-key';
const keyStore = {
  listeners: new Set<() => void>(),
  get: () => (typeof window === 'undefined' ? null : sessionStorage.getItem(KEY)),
  set(value: string | null) {
    if (value === null) sessionStorage.removeItem(KEY);
    else sessionStorage.setItem(KEY, value);
    keyStore.listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    keyStore.listeners.add(l);
    return () => keyStore.listeners.delete(l);
  },
};

export default function AdminPage() {
  const adminKey = useSyncExternalStore(
    keyStore.subscribe,
    keyStore.get,
    () => null
  );

  if (!CONVEX_READY) {
    return (
      <div className="adm-shell adm-center">
        <div className="adm-panel">
          <h1 className="adm-brand">JessAura Admin</h1>
          <p className="adm-note">
            Backend not connected. Set <code>NEXT_PUBLIC_CONVEX_URL</code> in{' '}
            <code>.env.local</code> (your Convex deployment URL) to use the admin
            panel locally. It works automatically on the deployed site.
          </p>
          <Link href="/" className="adm-btn adm-btn-ghost">Back to store</Link>
        </div>
      </div>
    );
  }

  // Passcode fallback still works even with Clerk on.
  if (adminKey) return <Console adminKey={adminKey} onLogout={() => keyStore.set(null)} />;
  if (CLERK_ENABLED) return <ClerkAdmin />;
  return <Gate onAuthed={(key) => keyStore.set(key)} />;
}

/* ---------- Clerk-admin path (log in once with your account) ---------- */

function ClerkAdmin() {
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const isAdmin = useQuery(anyApi.admin.isAdmin) as boolean | undefined;

  // A signed-in admin gets straight in — the empty adminKey is authorized by
  // the Clerk token server-side (see convex/adminAuth.ts).
  if (isSignedIn && isAdmin === true) {
    return <Console adminKey="" onLogout={() => signOut({ redirectUrl: '/' })} />;
  }
  if (!isLoaded || (isSignedIn && isAdmin === undefined)) {
    return (
      <div className="adm-shell adm-center">
        <div className="adm-panel"><p className="adm-note">Checking access…</p></div>
      </div>
    );
  }
  return <Gate onAuthed={(key) => keyStore.set(key)} signedInNotAdmin={Boolean(isSignedIn)} />;
}

/* ---------- Passcode gate (+ Clerk login button when enabled) ---------- */

function Gate({
  onAuthed,
  signedInNotAdmin,
}: {
  onAuthed: (key: string) => void;
  signedInNotAdmin?: boolean;
}) {
  const convex = useConvex();
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await convex.query(anyApi.admin.verifyKey, { adminKey: key });
      onAuthed(key);
    } catch {
      setError('Wrong passcode. Check the ADMIN_KEY set in your Convex dashboard.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-shell adm-center">
      <form className="adm-panel" onSubmit={submit}>
        <img src="/images/JA logo.png" alt="" className="adm-gate-logo" />
        <h1 className="adm-brand">JessAura Admin</h1>
        <p className="adm-note">Sign in to manage orders, products and customers.</p>

        {CLERK_ENABLED && (
          <div className="adm-clerk">
            {signedInNotAdmin ? (
              <p className="adm-error" role="alert">
                You’re signed in, but this account isn’t an admin. Ask the owner to add your
                email to <code>ADMIN_EMAILS</code>, or use the passcode below.
              </p>
            ) : (
              <Link href="/login?redirect_url=/admin" className="adm-btn adm-btn-primary adm-clerk-btn">
                Log in with your account
              </Link>
            )}
            <p className="adm-or">or use the admin passcode</p>
          </div>
        )}

        <label className="adm-field">
          <span className="adm-label">Admin passcode</span>
          <div className="adm-input-affix">
            <input
              type={show ? 'text' : 'password'}
              className="adm-input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoComplete="current-password"
              autoFocus
            />
            <button
              type="button"
              className="adm-affix-btn"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide passcode' : 'Show passcode'}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        {error && <p className="adm-error" role="alert">{error}</p>}

        <button className="adm-btn adm-btn-primary" disabled={busy || !key}>
          {busy ? 'Checking…' : 'Enter'}
        </button>
        <Link href="/" className="adm-link adm-center-text">Back to store</Link>
      </form>
    </div>
  );
}

/* ---------- Console shell ---------- */

function Console({ adminKey, onLogout }: { adminKey: string; onLogout: () => void }) {
  const [view, setView] = useState<ViewId>('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Badge the Orders tab with work that still needs doing.
  const stats = useQuery(anyApi.admin.dashboard, { adminKey }) as
    | { pending: number; toShip: number }
    | undefined;
  const todo = stats ? stats.pending + stats.toShip : 0;

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }, []);

  const current = NAV.find((n) => n.id === view)!;

  return (
    <div className="adm-shell adm-console">
      <aside className={`adm-side ${navOpen ? 'open' : ''}`}>
        <div className="adm-side-brand">
          <img src="/images/JA logo.png" alt="" className="adm-side-logo" />
          <div>
            <span className="adm-side-name">JessAura</span>
            <span className="adm-side-sub">Admin</span>
          </div>
        </div>

        <nav className="adm-nav" aria-label="Admin sections">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`adm-nav-item ${view === item.id ? 'on' : ''}`}
              onClick={() => {
                setView(item.id);
                setNavOpen(false);
              }}
              aria-current={view === item.id ? 'page' : undefined}
            >
              <item.icon />
              {item.label}
              {item.id === 'orders' && todo > 0 && <span className="adm-badge">{todo}</span>}
            </button>
          ))}
        </nav>

        <div className="adm-side-foot">
          <Link href="/" className="adm-nav-item"><Icon.store /> View store</Link>
          <button className="adm-nav-item adm-nav-danger" onClick={onLogout}>
            <Icon.logout /> Log out
          </button>
        </div>
      </aside>

      {navOpen && <div className="adm-side-scrim" onClick={() => setNavOpen(false)} />}

      <div className="adm-main">
        <header className="adm-topbar">
          <button
            className="adm-icon-btn adm-nav-toggle"
            onClick={() => setNavOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
          >
            {navOpen ? <Icon.close /> : <Icon.menu />}
          </button>
          <h1 className="adm-title">{current.label}</h1>
        </header>

        <main className="adm-content">
          {view === 'dashboard' && (
            <Dashboard adminKey={adminKey} onGoToOrders={() => setView('orders')} />
          )}
          {view === 'orders' && <Orders adminKey={adminKey} notify={notify} />}
          {view === 'products' && <Products adminKey={adminKey} notify={notify} />}
          {view === 'customers' && <Customers adminKey={adminKey} />}
          {view === 'subscribers' && <Subscribers adminKey={adminKey} notify={notify} />}
          {view === 'settings' && <Settings adminKey={adminKey} notify={notify} />}
        </main>
      </div>

      {toast && <div className="adm-toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}
