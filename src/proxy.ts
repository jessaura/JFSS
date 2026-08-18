// Next.js 16 renamed the `middleware` file convention to `proxy` (the function
// must be named `proxy` or be the default export). This runs Clerk's auth on
// every request and gates the account + checkout routes behind sign-in.
//
// Guarded: with no Clerk publishable key the whole thing is a passthrough, so
// the site keeps working before Clerk is configured.
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtected = createRouteMatcher(['/account(.*)', '/checkout(.*)']);

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const proxy = clerkEnabled
  ? clerkMiddleware(async (auth, req) => {
      if (isProtected(req)) await auth.protect();
    })
  : () => NextResponse.next();

export default proxy;

export const config = {
  // Run on everything except Next internals and static files; always on API routes.
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
};
