import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getCurrentUser, getOrCreateUser } from './users';

/** Current user's saved addresses (empty when signed out). */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query('addresses')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
  },
});

const fields = {
  label: v.string(),
  line1: v.string(),
  city: v.string(),
  postcode: v.string(),
  country: v.string(),
};

export const add = mutation({
  args: { ...fields, isDefault: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const existing = await ctx.db
      .query('addresses')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    // First address is always the default; otherwise honour the flag.
    const makeDefault = args.isDefault || existing.length === 0;
    if (makeDefault) {
      for (const a of existing) if (a.isDefault) await ctx.db.patch(a._id, { isDefault: false });
    }
    return await ctx.db.insert('addresses', {
      userId: user._id,
      label: args.label,
      line1: args.line1,
      city: args.city,
      postcode: args.postcode,
      country: args.country,
      isDefault: makeDefault,
    });
  },
});

export const update = mutation({
  args: { id: v.id('addresses'), ...fields },
  handler: async (ctx, { id, ...rest }) => {
    const user = await getOrCreateUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const addr = await ctx.db.get(id);
    if (!addr || addr.userId !== user._id) throw new Error('Address not found');
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id('addresses') },
  handler: async (ctx, { id }) => {
    const user = await getOrCreateUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const addr = await ctx.db.get(id);
    if (!addr || addr.userId !== user._id) throw new Error('Address not found');
    await ctx.db.delete(id);
    // Promote another address to default if we removed the default one.
    if (addr.isDefault) {
      const rest = await ctx.db
        .query('addresses')
        .withIndex('by_userId', (q) => q.eq('userId', user._id))
        .collect();
      if (rest.length) await ctx.db.patch(rest[0]._id, { isDefault: true });
    }
  },
});

export const setDefault = mutation({
  args: { id: v.id('addresses') },
  handler: async (ctx, { id }) => {
    const user = await getOrCreateUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const target = await ctx.db.get(id);
    if (!target || target.userId !== user._id) throw new Error('Address not found');
    const all = await ctx.db
      .query('addresses')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    for (const a of all) await ctx.db.patch(a._id, { isDefault: a._id === id });
  },
});
