import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// Mirrors the Product interface in src/data/products.ts.
// productId preserves the original 'p001' string id so cart matching and
// the /product/[id] route keep working when consumers migrate to Convex.
export default defineSchema({
  products: defineTable({
    productId: v.string(),
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
    rating: v.number(),
    reviews: v.number(),
    // Inventory. Optional so pre-existing seeded docs stay valid.
    stock: v.optional(v.number()),
    // Size × colour stock matrix. `color` references a ProductColor.name
    // ('' for colourless pieces). When present, it is the source of truth for
    // availability; total stock is the sum of quantities.
    variants: v.optional(
      v.array(
        v.object({
          size: v.string(),
          color: v.string(),
          quantity: v.number(),
        })
      )
    ),
  })
    .index('by_slug', ['slug'])
    .index('by_productId', ['productId'])
    .index('by_category', ['category'])
    .index('by_featured', ['featured']),

  orders: defineTable({
    orderNumber: v.string(),
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
    subtotal: v.number(),
    shipping: v.number(),
    total: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('paid'),
      v.literal('shipped'),
      v.literal('delivered'),
      v.literal('cancelled')
    ),
    notes: v.optional(v.string()),
    placedAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_email', ['customerEmail'])
    .index('by_placedAt', ['placedAt']),

  subscribers: defineTable({
    email: v.string(),
    source: v.string(),
    createdAt: v.number(),
  }).index('by_email', ['email']),
});
