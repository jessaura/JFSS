import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { checkAdmin } from './adminAuth';

/**
 * Public store settings — currently just the WhatsApp order number, which is
 * customer-facing anyway (checkout opens a chat to it). Returns null until the
 * owner sets one.
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('settings').first();
  },
});

/** Admin: set the WhatsApp number. Single-row upsert. */
export const update = mutation({
  args: { adminKey: v.string(), whatsappNumber: v.string() },
  handler: async (ctx, { adminKey, whatsappNumber }) => {
    await checkAdmin(ctx, adminKey);
    const existing = await ctx.db.query('settings').first();
    if (existing) {
      await ctx.db.patch(existing._id, { whatsappNumber, updatedAt: Date.now() });
      return existing._id;
    }
    return ctx.db.insert('settings', { whatsappNumber, updatedAt: Date.now() });
  },
});
