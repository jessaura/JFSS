'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { UserProfile } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { anyApi } from 'convex/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';

type Profile = { phone?: string; marketingOptIn?: boolean; name?: string; email?: string };

export default function SettingsPage() {
  const profile = useQuery(anyApi.users.getCurrent) as Profile | null | undefined;
  const addresses = useQuery(anyApi.addresses.listCurrent) as any[] | undefined;
  const orders = useQuery(anyApi.orders.listMine) as any[] | undefined;
  const ensureUser = useMutation(anyApi.users.getOrCreateCurrent);
  const updateProfile = useMutation(anyApi.users.updateProfile);

  const [phone, setPhone] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Make sure the Convex users row exists so getCurrent/updateProfile resolve.
  useEffect(() => {
    ensureUser().catch(() => {});
  }, [ensureUser]);

  // Seed the form from the saved profile once it loads.
  useEffect(() => {
    if (profile && !seeded) {
      setPhone(profile.phone ?? '');
      setMarketing(Boolean(profile.marketingOptIn));
      setSeeded(true);
    }
  }, [profile, seeded]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    try {
      await updateProfile({ phone, marketingOptIn: marketing });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  const handleExportData = () => {
    setExporting(true);
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        profile: profile || {},
        addresses: addresses || [],
        ordersSummary: (orders || []).map((o) => ({
          orderNumber: o.orderNumber,
          placedAt: new Date(o.placedAt).toISOString(),
          status: o.status,
          total: o.total,
          itemsCount: (o.items || []).length,
        })),
        gdprStatement: 'Exported under UK GDPR Article 20 (Right to Data Portability) by JessAura London.',
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jessaura_account_data_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setExporting(false), 1200);
    }
  };

  const openCookiePreferences = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('jf_open_cookie_preferences'));
    }
  };

  const openOnboarding = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('jf_open_onboarding'));
    }
  };

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="account">
        <div className="container">
          <nav className="wk-crumb" aria-label="Breadcrumb">
            <Link href="/account">Account</Link>
            <span aria-hidden="true">/</span>
            <span>Settings</span>
          </nav>

          <header className="account-head">
            <span className="account-eyebrow">Settings</span>
            <h1>Account settings</h1>
            <p>Your contact preferences, privacy controls, and login &amp; security.</p>
          </header>

          <div className="set-grid-layout">
            {/* Contact & Preferences Form */}
            <form className="set-card" onSubmit={save}>
              <h2>Contact &amp; preferences</h2>
              <label className="jf-field">
                <span>Phone</span>
                <input
                  className="jf-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+44 7123 456789"
                />
              </label>
              <label className="set-check">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                <span>Email me about new arrivals, private drops, and seasonal Kerala edits</span>
              </label>
              <div className="set-actions">
                <button className="jf-btn jf-btn-primary" disabled={busy}>
                  {busy ? 'Saving…' : 'Save changes'}
                </button>
                {saved && <span className="set-saved">Saved ✓</span>}
              </div>
            </form>

            {/* Privacy & Legal Data Rights (GDPR) Card */}
            <div className="set-card set-legal-card">
              <h2>Privacy, Legal &amp; Data Rights (GDPR)</h2>
              <p className="set-legal-desc">
                Manage your data privacy rights, cookie consent, and review your legal terms with JessAura London.
              </p>

              <div className="set-legal-actions-list">
                <div className="set-legal-row">
                  <div>
                    <strong>Cookie Preferences</strong>
                    <p>Update your tracking, performance, and personalization cookie consents.</p>
                  </div>
                  <button type="button" onClick={openCookiePreferences} className="jf-btn-sm jf-btn-secondary">
                    Manage Cookies
                  </button>
                </div>

                <div className="set-legal-row">
                  <div>
                    <strong>Data Portability (GDPR Art. 20)</strong>
                    <p>Download a secure copy of your account profile and order records.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    disabled={exporting}
                    className="jf-btn-sm jf-btn-secondary"
                  >
                    {exporting ? 'Exporting…' : 'Download My Data'}
                  </button>
                </div>

                <div className="set-legal-row">
                  <div>
                    <strong>Maison Welcome Guide</strong>
                    <p>Re-launch the interactive onboarding guide and boutique overview.</p>
                  </div>
                  <button type="button" onClick={openOnboarding} className="jf-btn-sm jf-btn-secondary">
                    Open Guide
                  </button>
                </div>

                <div className="set-legal-row">
                  <div>
                    <strong>Legal Policies</strong>
                    <p>Review our official terms and UK data protection frameworks.</p>
                  </div>
                  <div className="set-legal-links-wrap">
                    <Link href="/privacy" className="jf-btn-sm jf-btn-secondary">
                      Privacy Policy
                    </Link>
                    <Link href="/terms" className="jf-btn-sm jf-btn-secondary">
                      Terms of Service
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clerk User Profile for Login & Security / Account Deletion */}
          <div className="set-clerk" style={{ marginTop: '32px' }}>
            <UserProfile routing="hash" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
