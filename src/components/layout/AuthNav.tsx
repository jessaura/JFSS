'use client';

import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';

/**
 * Navbar auth controls. Uses the client hook `useUser` (not the <SignedIn>/
 * <SignedOut> control components, which throw when rendered inside a client
 * component during static prerender). Only mounted when Clerk is configured,
 * so the hook always has a ClerkProvider above it.
 */
export default function AuthNav() {
  const { isLoaded, isSignedIn } = useUser();

  // Until Clerk hydrates, render nothing (avoids a signed-in/out flash and
  // any prerender-time auth access).
  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <Link href="/login" className="navbar-link navbar-login">
        Log in
      </Link>
    );
  }

  return (
    <>
      <Link href="/account" className="navbar-icon-btn" aria-label="My account">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </Link>
      <UserButton />
    </>
  );
}
