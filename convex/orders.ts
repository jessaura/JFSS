import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getCurrentUser, getOrCreateUser } from './users';

/**
 * Public checkout endpoint — called by the storefront cart drawer.
 * Creates the order and decrements stock for each line item.
 * No admin key: anyone can place an order, nobody can read them back
 * (all order reads live in admin.ts behind the admin key).
 */
export const place = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    address: v.object({
      line1: v.string(),
      city: v.string(),
      postcode: v.string(),
      country: v.string(),
    }),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        image: v.string(),
        color: v.string(),
        size: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0) throw new Error('Cannot place an empty order');

    // Link the order to the signed-in customer when present. The storefront
    // gates checkout behind login, so this is normally set; guests/legacy stay
    // unlinked.
    const user = await getOrCreateUser(ctx);

    const subtotal = args.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal >= 75 ? 0 : 6;
    const orderNumber = `JA-${Date.now().toString(36).toUpperCase()}`;

    const id = await ctx.db.insert('orders', {
      ...args,
      orderNumber,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: 'pending',
      placedAt: Date.now(),
      ...(user ? { userId: user._id } : {}),
    });

    // Stock is NOT drawn down here — a checkout is a WhatsApp enquiry, not a
    // confirmed sale. The admin decides via "Sold" / "Unsold" in the Orders
    // panel (see convex/admin.ts markOrderSold / markOrderUnsold).

    return { orderNumber, id };
  },
});

/** The signed-in customer's orders, newest first. Empty when signed out. */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const orders = await ctx.db
      .query('orders')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    return orders.sort((a, b) => b.placedAt - a.placedAt);
  },
});

/** One of the current customer's orders, or null if not theirs / signed out. */
export const getMine = query({
  args: { id: v.id('orders') },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const order = await ctx.db.get(id);
    if (!order || order.userId !== user._id) return null;
    return order;
  },
});

/**
 * Attach past guest orders placed with the customer's (Clerk-verified) email to
 * their account. Called once when they land on their orders page. Safe because
 * the email on the token is verified.
 */
export const linkMyGuestOrders = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateUser(ctx);
    if (!user || !user.email) return 0;
    const orders = await ctx.db
      .query('orders')
      .withIndex('by_email', (q) => q.eq('customerEmail', user.email))
      .collect();
    let linked = 0;
    for (const o of orders) {
      if (!o.userId) {
        await ctx.db.patch(o._id, { userId: user._id });
        linked++;
      }
    }
    return linked;
  },
});

/**
 * Public: how many distinct people have ordered. Count only — no names or
 * emails, since this renders on the public storefront. Returns 0 when the
 * store has no orders yet, and the hero hides its proof row on 0.
 * ponytail: full scan; fine at small-store volume.
 */
export const customerCount = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query('orders').collect();
    const emails = new Set(
      orders.filter((o) => o.status !== 'cancelled').map((o) => o.customerEmail)
    );
    return emails.size;
  },
});

/** Public newsletter signup. Idempotent on email. */
export const subscribe = mutation({
  args: { email: v.string(), source: v.optional(v.string()) },
  handler: async (ctx, { email, source }) => {
    const normalized = email.trim().toLowerCase();
    const existing = await ctx.db
      .query('subscribers')
      .withIndex('by_email', (q) => q.eq('email', normalized))
      .unique();
    if (existing) return 'already subscribed';

    await ctx.db.insert('subscribers', {
      email: normalized,
      source: source ?? 'footer',
      createdAt: Date.now(),
    });
    return 'subscribed';
  },
});
