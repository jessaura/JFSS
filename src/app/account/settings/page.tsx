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

type Profile = { phone?: string; marketingOptIn?: boolean };

export default function SettingsPage() {
  const profile = useQuery(anyApi.users.getCurrent) as Profile | null | undefined;
  const ensureUser = useMutation(anyApi.users.getOrCreateCurrent);
  const updateProfile = useMutation(anyApi.users.updateProfile);

  const [phone, setPhone] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seeded, setSeeded] = useState(false);

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

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="account">
        <div className="container">
          <nav className="wk-crumb" aria-label="Breadcrumb">
            <Link href="/account">Account</Link><span aria-hidden="true">/</span><span>Settings</span>
          </nav>

          <header className="account-head">
            <span className="account-eyebrow">Settings</span>
            <h1>Account settings</h1>
            <p>Your contact preferences, plus login &amp; security.</p>
          </header>

          <form className="set-card" onSubmit={save}>
            <h2>Contact &amp; preferences</h2>
            <label className="jf-field">
              <span>Phone</span>
              <input className="jf-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            </label>
            <label className="set-check">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
              <span>Email me about new arrivals and offers</span>
            </label>
            <div className="set-actions">
              <button className="jf-btn jf-btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
              {saved && <span className="set-saved">Saved ✓</span>}
            </div>
          </form>

          <div className="set-clerk">
            <UserProfile routing="hash" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
