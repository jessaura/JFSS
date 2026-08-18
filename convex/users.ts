import { mutation, query } from './_generated/server';
import type { QueryCtx, MutationCtx } from './_generated/server';
import { v } from 'convex/values';

/**
 * Resolves the Convex `users` row for the currently signed-in Clerk user.
 * Returns null when unauthenticated. Shared by every account-scoped query.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
    .unique();
}

/** Current user's profile row, or null if signed out. */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => getCurrentUser(ctx),
});

/**
 * Upsert the signed-in Clerk identity into `users` and return its id.
 * Call once right after sign-in (client mirrors identity → Convex). Keeps
 * email/name fresh on repeat calls. Requires the Clerk JWT to carry `email`
 * and `name` claims (add them to the `convex` JWT template in Clerk).
 */
export const getOrCreateCurrent = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();

    const email = identity.email ?? '';
    const name = (identity.name as string | undefined) ?? '';

    if (existing) {
      const patch: { email?: string; name?: string } = {};
      if (email && email !== existing.email) patch.email = email;
      if (name && name !== existing.name) patch.name = name;
      if (Object.keys(patch).length) await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert('users', {
      clerkId: identity.subject,
      email,
      name,
      marketingOptIn: false,
      createdAt: Date.now(),
    });
  },
});

/** Update the profile fields Convex owns (Clerk owns name/email/password). */
export const updateProfile = mutation({
  args: { phone: v.optional(v.string()), marketingOptIn: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const patch: { phone?: string; marketingOptIn?: boolean } = {};
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.marketingOptIn !== undefined) patch.marketingOptIn = args.marketingOptIn;
    await ctx.db.patch(user._id, patch);
    return user._id;
  },
});
