import type { QueryCtx, MutationCtx } from './_generated/server';

/**
 * Admin authorization, two accepted paths:
 *   1. Clerk login — the signed-in user's verified email is in ADMIN_EMAILS
 *      (comma-separated env var set in the Convex dashboard).
 *   2. Passcode fallback — adminKey matches the ADMIN_KEY env var.
 * Either passes; neither throws "Not authorized". Keeping the passcode means a
 * misconfigured allow-list can never lock the owner out.
 */

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** True when the signed-in Clerk identity is an allow-listed admin. */
export async function isAdminIdentity(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) return false;
  if (identity.emailVerified === false) return false;
  return adminEmails().includes(identity.email.toLowerCase());
}

/** Authorize an admin action via Clerk admin email OR the passcode. */
export async function checkAdmin(ctx: QueryCtx | MutationCtx, adminKey: string): Promise<void> {
  const expected = process.env.ADMIN_KEY;
  if (adminKey && expected && adminKey === expected) return;
  if (await isAdminIdentity(ctx)) return;
  throw new Error('Not authorized');
}
