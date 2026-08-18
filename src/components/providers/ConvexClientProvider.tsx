'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ClerkProvider, useAuth } from '@clerk/nextjs';

// NEXT_PUBLIC_CONVEX_URL is injected by `convex deploy` at build time (Vercel).
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY comes from the Clerk dashboard.
// Both are guarded so the app still renders before either is provisioned:
//   - no Convex        → plain children (static catalogue, no backend)
//   - Convex, no Clerk → bare ConvexProvider (current behaviour, no auth)
//   - Convex + Clerk    → Clerk-authenticated Convex client (accounts on)
const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = url ? new ConvexReactClient(url) : null;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!convex) return <>{children}</>;
  if (!clerkKey) return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  return (
    <ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
