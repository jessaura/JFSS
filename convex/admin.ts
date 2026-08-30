import { mutation, query } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { checkAdmin, isAdminIdentity } from './adminAuth';

// Admin actions authorize two ways (see convex/adminAuth.ts): a signed-in Clerk
// admin (email in ADMIN_EMAILS) OR the ADMIN_KEY passcode as a fallback.
// checkKey below is the passcode-only check, kept for the verifyKey gate.
function checkKey(adminKey: string) {
  const expected = process.env.ADMIN_KEY;
  if (!expected || adminKey !== expected) {
    throw new Error('Invalid admin key');
  }
}

/** Whether the current Clerk user is an admin — drives the admin UI gate. */
export const isAdmin = query({ args: {}, handler: (ctx) => isAdminIdentity(ctx) });

const orderStatus = v.union(
  v.literal('pending'),
  v.literal('paid'),
  v.literal('shipped'),
  v.literal('delivered'),
  v.literal('cancelled')
);

const productFields = {
  name: v.string(),
  slug: v.string(),
  price: v.number(),
  originalPrice: v.optional(v.number()),
  description: v.string(),
  shortDescription: v.string(),
  category: v.union(v.literal('men'), v.literal('women'), v.literal('kids'), v.literal('unisex')),
  subcategory: v.string(),
  fabric: v.string(),
  colors: v.array(
    v.object({ name: v.string(), hex: v.string(), image: v.string() })
  ),
  sizes: v.array(v.string()),
  images: v.array(v.string()),
  tags: v.array(v.string()),
  featured: v.boolean(),
  new: v.boolean(),
  bestSeller: v.boolean(),
  clearance: v.optional(v.boolean()),
  heroFeatured: v.optional(v.boolean()),
  heroCategory: v.optional(v.string()),
  rating: v.number(),
  reviews: v.number(),
  stock: v.optional(v.number()),
  sold: v.optional(v.number()),
  variants: v.optional(
    v.array(v.object({ size: v.string(), color: v.string(), quantity: v.number() }))
  ),
};

export const verifyKey = query({
  args: { adminKey: v.string() },
  handler: (_ctx, { adminKey }) => {
    checkKey(adminKey);
    return true;
  },
});

/* ---------------- Products ---------------- */

export const createProduct = mutation({
  args: { adminKey: v.string(), product: v.object(productFields) },
  handler: async (ctx, { adminKey, product }) => {
    await checkAdmin(ctx, adminKey);
    const productId = `p${Date.now().toString(36)}`;
    return ctx.db.insert('products', { productId, ...product });
  },
});

/**
 * Save a product by its stable productId: patch it if it already lives in
 * Convex, otherwise insert it. This is what the admin form uses, so the very
 * first edit of a catalogue piece (which until then only exists in the static
 * file) creates its Convex record instead of erroring on an unknown id.
 */
export const upsertProduct = mutation({
  args: { adminKey: v.string(), productId: v.string(), product: v.object(productFields) },
  handler: async (ctx, { adminKey, productId, product }) => {
    await checkAdmin(ctx, adminKey);
    const existing = await ctx.db
      .query('products')
      .withIndex('by_productId', (q) => q.eq('productId', productId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, product);
      return existing._id;
    }
    return ctx.db.insert('products', { productId, ...product });
  },
});

export const updateProduct = mutation({
  args: {
    adminKey: v.string(),
    id: v.id('products'),
    patch: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      price: v.optional(v.number()),
      originalPrice: v.optional(v.number()),
      description: v.optional(v.string()),
      shortDescription: v.optional(v.string()),
      category: v.optional(v.union(v.literal('men'), v.literal('women'), v.literal('kids'), v.literal('unisex'))),
      subcategory: v.optional(v.string()),
      fabric: v.optional(v.string()),
      sizes: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
      featured: v.optional(v.boolean()),
      new: v.optional(v.boolean()),
      bestSeller: v.optional(v.boolean()),
      clearance: v.optional(v.boolean()),
      heroFeatured: v.optional(v.boolean()),
      heroCategory: v.optional(v.string()),
      rating: v.optional(v.number()),
      reviews: v.optional(v.number()),
      stock: v.optional(v.number()),
      // The pieces the product form now edits: colour rows (each with its own
      // uploaded image), the gallery, and the size × colour stock matrix.
      colors: v.optional(
        v.array(v.object({ name: v.string(), hex: v.string(), image: v.string() }))
      ),
      images: v.optional(v.array(v.string())),
      variants: v.optional(
        v.array(v.object({ size: v.string(), color: v.string(), quantity: v.number() }))
      ),
    }),
  },
  handler: async (ctx, { adminKey, id, patch }) => {
    await checkAdmin(ctx, adminKey);
    await ctx.db.patch(id, patch);
  },
});

export const deleteProduct = mutation({
  args: { adminKey: v.string(), id: v.id('products') },
  handler: async (ctx, { adminKey, id }) => {
    await checkAdmin(ctx, adminKey);
    await ctx.db.delete(id);
  },
});

/* ---------------- Orders ---------------- */

export const listOrders = query({
  args: { adminKey: v.string() },
  handler: async (ctx, { adminKey }) => {
    await checkAdmin(ctx, adminKey);
    return ctx.db.query('orders').withIndex('by_placedAt').order('desc').collect();
  },
});

export const updateOrderStatus = mutation({
  args: { adminKey: v.string(), id: v.id('orders'), status: orderStatus },
  handler: async (ctx, { adminKey, id, status }) => {
    await checkAdmin(ctx, adminKey);
    await ctx.db.patch(id, { status });
  },
});

export const updateOrderNotes = mutation({
  args: { adminKey: v.string(), id: v.id('orders'), notes: v.string() },
  handler: async (ctx, { adminKey, id, notes }) => {
    await checkAdmin(ctx, adminKey);
    await ctx.db.patch(id, { notes });
  },
});

export const deleteOrder = mutation({
  args: { adminKey: v.string(), id: v.id('orders') },
  handler: async (ctx, { adminKey, id }) => {
    await checkAdmin(ctx, adminKey);
    await ctx.db.delete(id);
  },
});

/** Adjust each ordered item's stock/variant + sold tally by `sign` (+1 sell, -1 revert). */
async function applyOrderStock(
  ctx: MutationCtx,
  items: { productId: string; size: string; color: string; quantity: number }[],
  sign: 1 | -1
) {
  for (const item of items) {
    const product = await ctx.db
      .query('products')
      .withIndex('by_productId', (q) => q.eq('productId', item.productId))
      .unique();
    if (!product) continue;
    const patch: Record<string, unknown> = {};
    if (product.variants && product.variants.length) {
      const variants = product.variants.map((v) =>
        v.size === item.size && v.color === item.color
          ? { ...v, quantity: Math.max(0, v.quantity - sign * item.quantity) }
          : v
      );
      patch.variants = variants;
      patch.stock = variants.reduce((n, v) => n + v.quantity, 0);
    } else if (typeof product.stock === 'number') {
      patch.stock = Math.max(0, product.stock - sign * item.quantity);
    }
    patch.sold = Math.max(0, (product.sold ?? 0) + sign * item.quantity);
    await ctx.db.patch(product._id, patch);
  }
}

/** Mark an order Sold: draw its items out of stock once, tally sold, set delivered. */
export const markOrderSold = mutation({
  args: { adminKey: v.string(), id: v.id('orders') },
  handler: async (ctx, { adminKey, id }) => {
    await checkAdmin(ctx, adminKey);
    const order = await ctx.db.get(id);
    if (!order) throw new Error('Order not found');
    if (!order.stockApplied) await applyOrderStock(ctx, order.items, 1);
    await ctx.db.patch(id, { stockApplied: true, status: 'delivered' });
  },
});

/** Mark an order Unsold: restore stock if it had been applied, set cancelled. */
export const markOrderUnsold = mutation({
  args: { adminKey: v.string(), id: v.id('orders') },
  handler: async (ctx, { adminKey, id }) => {
    await checkAdmin(ctx, adminKey);
    const order = await ctx.db.get(id);
    if (!order) throw new Error('Order not found');
    if (order.stockApplied) await applyOrderStock(ctx, order.items, -1);
    await ctx.db.patch(id, { stockApplied: false, status: 'cancelled' });
  },
});

/* ---------------- Customers ---------------- */

// Derived from orders rather than stored separately — one source of truth,
// nothing to keep in sync.
// ponytail: full scan per call; add a customers table if orders pass ~10k.
export const listCustomers = query({
  args: { adminKey: v.string() },
  handler: async (ctx, { adminKey }) => {
    await checkAdmin(ctx, adminKey);
    const orders = await ctx.db.query('orders').collect();

    const byEmail = new Map<
      string,
      {
        email: string;
        name: string;
        phone?: string;
        city: string;
        country: string;
        orders: number;
        spent: number;
        firstOrder: number;
        lastOrder: number;
      }
    >();

    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      const existing = byEmail.get(o.customerEmail);
      if (existing) {
        existing.orders += 1;
        existing.spent += o.total;
        existing.firstOrder = Math.min(existing.firstOrder, o.placedAt);
        if (o.placedAt > existing.lastOrder) {
          existing.lastOrder = o.placedAt;
          existing.name = o.customerName;
          existing.city = o.address.city;
          existing.country = o.address.country;
          existing.phone = o.customerPhone;
        }
      } else {
        byEmail.set(o.customerEmail, {
          email: o.customerEmail,
          name: o.customerName,
          phone: o.customerPhone,
          city: o.address.city,
          country: o.address.country,
          orders: 1,
          spent: o.total,
          firstOrder: o.placedAt,
          lastOrder: o.placedAt,
        });
      }
    }

    return [...byEmail.values()].sort((a, b) => b.spent - a.spent);
  },
});

/* ---------------- Subscribers ---------------- */

export const listSubscribers = query({
  args: { adminKey: v.string() },
  handler: async (ctx, { adminKey }) => {
    await checkAdmin(ctx, adminKey);
    const subs = await ctx.db.query('subscribers').collect();
    return subs.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const deleteSubscriber = mutation({
  args: { adminKey: v.string(), id: v.id('subscribers') },
  handler: async (ctx, { adminKey, id }) => {
    await checkAdmin(ctx, adminKey);
    await ctx.db.delete(id);
  },
});

/* ---------------- Dashboard ---------------- */

export const dashboard = query({
  args: { adminKey: v.string() },
  handler: async (ctx, { adminKey }) => {
    await checkAdmin(ctx, adminKey);
    const [orders, products, subscribers] = await Promise.all([
      ctx.db.query('orders').collect(),
      ctx.db.query('products').collect(),
      ctx.db.query('subscribers').collect(),
    ]);

    const live = orders.filter((o) => o.status !== 'cancelled');
    const revenue = live.reduce((s, o) => s + o.total, 0);
    const units = live.reduce(
      (s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0),
      0
    );

    // Revenue for each of the last 14 days (oldest first) — drives the chart.
    const DAY = 86_400_000;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const series = Array.from({ length: 14 }, (_, i) => {
      const from = startOfToday.getTime() - (13 - i) * DAY;
      const dayOrders = live.filter(
        (o) => o.placedAt >= from && o.placedAt < from + DAY
      );
      return {
        date: from,
        revenue: dayOrders.reduce((s, o) => s + o.total, 0),
        orders: dayOrders.length,
      };
    });

    // Units sold per product across all live orders.
    const soldByProduct = new Map<string, { name: string; units: number; revenue: number }>();
    for (const o of live) {
      for (const item of o.items) {
        const row = soldByProduct.get(item.productId);
        if (row) {
          row.units += item.quantity;
          row.revenue += item.price * item.quantity;
        } else {
          soldByProduct.set(item.productId, {
            name: item.name,
            units: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
      }
    }

    return {
      revenue,
      orderCount: live.length,
      avgOrder: live.length ? revenue / live.length : 0,
      units,
      pending: orders.filter((o) => o.status === 'pending').length,
      toShip: orders.filter((o) => o.status === 'paid').length,
      productCount: products.length,
      featuredCount: products.filter((p) => p.featured).length,
      subscriberCount: subscribers.length,
      lowStock: products
        .filter((p) => typeof p.stock === 'number' && p.stock <= 5)
        .map((p) => ({ name: p.name, stock: p.stock ?? 0 }))
        .sort((a, b) => a.stock - b.stock),
      series,
      topProducts: [...soldByProduct.values()]
        .sort((a, b) => b.units - a.units)
        .slice(0, 5),
      recentOrders: [...live]
        .sort((a, b) => b.placedAt - a.placedAt)
        .slice(0, 5)
        .map((o) => ({
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          total: o.total,
          status: o.status,
          placedAt: o.placedAt,
        })),
    };
  },
});
