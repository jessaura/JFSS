'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { anyApi } from 'convex/server';
import CheckoutForm, { CheckoutInitial } from './CheckoutForm';

type Address = {
  isDefault: boolean;
  line1: string;
  city: string;
  postcode: string;
  country: string;
};

/**
 * Checkout is login-only. This wraps the delivery form: signed-out shoppers get
 * a login prompt; signed-in ones get the form pre-filled from their Clerk
 * profile and default saved address. Only mounted when Clerk is configured, so
 * useUser always has a provider above it.
 */
export default function CheckoutGate({ onClose }: { onClose: () => void }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const addresses = useQuery(anyApi.addresses.list) as Address[] | undefined;
  const profile = useQuery(anyApi.users.getCurrent) as { phone?: string } | null | undefined;
  const ensureUser = useMutation(anyApi.users.getOrCreateCurrent);

  // Mirror the Clerk identity into Convex so the order links to a users row.
  useEffect(() => {
    if (isSignedIn) ensureUser().catch(() => {});
  }, [isSignedIn, ensureUser]);

  if (!isLoaded) {
    return (
      <div className="jf-checkout">
        <p className="jf-checkout-note">Loading…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="jf-checkout jf-checkout-gate">
        <h3>Log in to check out</h3>
        <p className="jf-checkout-note">
          Sign in or create an account to place your order, track it, and save your details.
        </p>
        <Link href="/login" className="jf-btn jf-btn-primary jf-checkout-submit">Log in</Link>
        <Link href="/signup" className="jf-btn jf-btn-ghost">Create account</Link>
        <button type="button" className="jf-btn jf-btn-ghost" onClick={onClose}>Back to bag</button>
      </div>
    );
  }

  // Wait for the account data before rendering the form so the pre-fill is
  // captured in the form's initial state (it seeds once).
  if (addresses === undefined || profile === undefined) {
    return (
      <div className="jf-checkout">
        <p className="jf-checkout-note">Loading your details…</p>
      </div>
    );
  }

  const def = addresses.find((a) => a.isDefault) ?? addresses[0];
  const initial: CheckoutInitial = {
    name: user?.fullName ?? '',
    email: user?.primaryEmailAddress?.emailAddress ?? '',
    phone: profile?.phone ?? '',
    line1: def?.line1 ?? '',
    city: def?.city ?? '',
    postcode: def?.postcode ?? '',
    country: def?.country ?? 'United Kingdom',
  };

  return <CheckoutForm onClose={onClose} initial={initial} />;
}
