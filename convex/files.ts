import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { checkAdmin } from './adminAuth';

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
    await checkAdmin(ctx, adminKey);
    return await ctx.storage.generateUploadUrl();
  },
});

export const urlForStorageId = mutation({
  args: { adminKey: v.string(), storageId: v.id('_storage') },
  handler: async (ctx, { adminKey, storageId }) => {
    await checkAdmin(ctx, adminKey);
    return await ctx.storage.getUrl(storageId);
  },
});
