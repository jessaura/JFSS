import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignupPage() {
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
      <SignUp signInUrl="/login" />
    </div>
  );
}
