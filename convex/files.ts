import { mutation } from './_generated/server';
import { v } from 'convex/values';

// Same admin gate as admin.ts — checked against the ADMIN_KEY env var set in
// the Convex dashboard. Duplicated (3 lines) rather than shared, since Convex
// bundles each function module on its own.
function checkKey(adminKey: string) {
  const expected = process.env.ADMIN_KEY;
  if (!expected || adminKey !== expected) throw new Error('Invalid admin key');
}

/**
 * Image upload, two steps:
 *   1. admin calls generateUploadUrl → gets a one-time POST target
 *   2. browser POSTs the file there → Convex returns { storageId }
 *   3. admin calls urlForStorageId(storageId) → gets a stable served URL
 * The URL string is what we store in a product's images / colour.image, so the
 * rest of the app keeps treating images as plain URL strings.
 */
export const generateUploadUrl = mutation({
  args: { adminKey: v.string() },
  handler: async (ctx, { adminKey }) => {
    checkKey(adminKey);
    return await ctx.storage.generateUploadUrl();
  },
});

export const urlForStorageId = mutation({
  args: { adminKey: v.string(), storageId: v.id('_storage') },
  handler: async (ctx, { adminKey, storageId }) => {
    checkKey(adminKey);
    return await ctx.storage.getUrl(storageId);
  },
});
