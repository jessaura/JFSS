import { mutation, query } from './_generated/server';
import { v, ConvexError } from 'convex/values';
import { getCurrentUser, getOrCreateUser } from './users';

/** Product ids in the signed-in user's wishlist (empty when signed out). */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const rows = await ctx.db
      .query('wishlist')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    return rows.map((r) => r.productId);
  },
});

/**
 * Replace the wishlist with the given product ids (add new, drop removed). The
 * client sends the full desired set, so this stays a simple diff.
 */
export const save = mutation({
  args: { productIds: v.array(v.string()) },
  handler: async (ctx, { productIds }) => {
    const user = await getOrCreateUser(ctx);
    if (!user) throw new ConvexError('Not authenticated');
    const existing = await ctx.db
      .query('wishlist')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    const have = new Set(existing.map((r) => r.productId));
    const want = new Set(productIds);
    for (const r of existing) if (!want.has(r.productId)) await ctx.db.delete(r._id);
    for (const id of productIds) {
      if (!have.has(id)) await ctx.db.insert('wishlist', { userId: user._id, productId: id, addedAt: Date.now() });
    }
  },
});
