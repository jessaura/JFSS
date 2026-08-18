'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { anyApi } from 'convex/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';

const sections = [
  { href: '/account/orders', title: 'Orders', desc: 'Track and reorder past purchases.' },
  { href: '/account/addresses', title: 'Addresses', desc: 'Manage saved delivery addresses.' },
  { href: '/account/wishlist', title: 'Wishlist', desc: 'Pieces you’ve saved for later.' },
  { href: '/account/settings', title: 'Settings', desc: 'Profile, password and preferences.' },
];

export default function AccountPage() {
  const { user } = useUser();
  // Mirror the Clerk identity into Convex on first visit so orders/addresses
  // /wishlist can reference a stable users row.
  const ensureUser = useMutation(anyApi.users.getOrCreateCurrent);
  useEffect(() => {
    if (user) ensureUser().catch(() => {});
  }, [user, ensureUser]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="account">
        <div className="container">
          <header className="account-head">
            <span className="account-eyebrow">My Account</span>
            <h1>Hello{user?.firstName ? `, ${user.firstName}` : ''}.</h1>
            <p>Manage your orders, addresses and saved pieces.</p>
          </header>

          <div className="account-grid">
            {sections.map((s) => (
              <Link key={s.href} href={s.href} className="account-card">
                <h2>{s.title}</h2>
                <p>{s.desc}</p>
                <span className="account-card-go" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
