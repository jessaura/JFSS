import { mutation, query } from './_generated/server';
import { v, ConvexError } from 'convex/values';
import { getCurrentUser, getOrCreateUser } from './users';

const item = v.object({
  productId: v.string(),
  color: v.string(),
  size: v.string(),
  quantity: v.number(),
});

/** The signed-in user's saved cart line-item refs (empty when signed out). */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const cart = await ctx.db
      .query('carts')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .unique();
    return cart?.items ?? [];
  },
});

/** Overwrite the saved cart with the given items. */
export const save = mutation({
  args: { items: v.array(item) },
  handler: async (ctx, { items }) => {
    const user = await getOrCreateUser(ctx);
    if (!user) throw new ConvexError('Not authenticated');
    const existing = await ctx.db
      .query('carts')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .unique();
    if (existing) await ctx.db.patch(existing._id, { items, updatedAt: Date.now() });
    else await ctx.db.insert('carts', { userId: user._id, items, updatedAt: Date.now() });
  },
});
