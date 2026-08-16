import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Same admin gate as admin.ts / files.ts.
function checkKey(adminKey: string) {
  const expected = process.env.ADMIN_KEY;
  if (!expected || adminKey !== expected) throw new Error('Invalid admin key');
}

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
    checkKey(adminKey);
    const existing = await ctx.db.query('settings').first();
    if (existing) {
      await ctx.db.patch(existing._id, { whatsappNumber, updatedAt: Date.now() });
      return existing._id;
    }
    return ctx.db.insert('settings', { whatsappNumber, updatedAt: Date.now() });
  },
});
