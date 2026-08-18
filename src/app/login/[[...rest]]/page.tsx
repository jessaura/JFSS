import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

// Catch-all route ([[...rest]]) is required by Clerk's <SignIn/> so its internal
// steps (verification, factor-two, reset) get their own sub-paths.
export default function LoginPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="auth-shell">
        <p className="auth-fallback">
          Accounts aren’t switched on yet. <Link href="/shop">Continue shopping →</Link>
        </p>
      </div>
    );
  }
  return (
    <div className="auth-shell">
      <SignIn signUpUrl="/signup" />
    </div>
  );
}
