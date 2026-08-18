'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { anyApi } from 'convex/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';

type Address = {
  _id: string;
  label: string;
  line1: string;
  city: string;
  postcode: string;
  country: string;
  isDefault: boolean;
};

const empty = { label: '', line1: '', city: '', postcode: '', country: 'United Kingdom' };

export default function AddressesPage() {
  const addresses = useQuery(anyApi.addresses.list) as Address[] | undefined;
  const addAddress = useMutation(anyApi.addresses.add);
  const removeAddress = useMutation(anyApi.addresses.remove);
  const setDefault = useMutation(anyApi.addresses.setDefault);

  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);

  function set<K extends keyof typeof empty>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await addAddress(form);
      setForm(empty);
      setAdding(false);
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
            <Link href="/account">Account</Link><span aria-hidden="true">/</span><span>Addresses</span>
          </nav>

          <header className="account-head">
            <span className="account-eyebrow">Addresses</span>
            <h1>Delivery addresses</h1>
            <p>Save addresses for faster checkout. Your default is used automatically.</p>
          </header>

          {addresses === undefined ? (
            <p className="jf-checkout-note">Loading…</p>
          ) : (
            <div className="addr-list">
              {addresses.map((a) => (
                <div key={a._id} className={`addr-card ${a.isDefault ? 'is-default' : ''}`}>
                  {a.isDefault && <span className="addr-default-tag">Default</span>}
                  <h3>{a.label || 'Address'}</h3>
                  <p>{a.line1}<br />{a.city}, {a.postcode}<br />{a.country}</p>
                  <div className="addr-actions">
                    {!a.isDefault && (
                      <button className="jf-btn jf-btn-ghost" onClick={() => setDefault({ id: a._id })}>
                        Set as default
                      </button>
                    )}
                    <button className="jf-btn jf-btn-ghost addr-remove" onClick={() => removeAddress({ id: a._id })}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {adding ? (
                <form className="addr-card addr-form" onSubmit={submit}>
                  <label className="jf-field">
                    <span>Label (e.g. Home)</span>
                    <input className="jf-input" value={form.label} onChange={(e) => set('label', e.target.value)} />
                  </label>
                  <label className="jf-field">
                    <span>Address *</span>
                    <input className="jf-input" value={form.line1} onChange={(e) => set('line1', e.target.value)} autoComplete="address-line1" required />
                  </label>
                  <div className="jf-field-row">
                    <label className="jf-field">
                      <span>City *</span>
                      <input className="jf-input" value={form.city} onChange={(e) => set('city', e.target.value)} required />
                    </label>
                    <label className="jf-field">
                      <span>Postcode *</span>
                      <input className="jf-input" value={form.postcode} onChange={(e) => set('postcode', e.target.value)} required />
                    </label>
                  </div>
                  <label className="jf-field">
                    <span>Country *</span>
                    <input className="jf-input" value={form.country} onChange={(e) => set('country', e.target.value)} required />
                  </label>
                  <div className="addr-actions">
                    <button className="jf-btn jf-btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save address'}</button>
                    <button type="button" className="jf-btn jf-btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <button className="addr-card addr-add" onClick={() => setAdding(true)}>
                  <span aria-hidden="true">＋</span> Add an address
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
