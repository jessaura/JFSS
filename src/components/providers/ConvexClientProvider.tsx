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
const url = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://placeholder.convex.cloud';
const convex = new ConvexReactClient(url);
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k';

export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
