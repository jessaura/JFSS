/**
 * Renames the p047–p070 products (traditional wear, kids' sets, women's tops)
 * in the LIVE Convex database, from the names decided by image analysis in
 * scripts/traditional-names.json. These products live in Convex (their photos
 * were uploaded via the admin), so a code edit alone won't change the site —
 * this updates the database records directly.
 *
 * Run once, with your Convex URL and admin key in the environment:
 *
 *   NEXT_PUBLIC_CONVEX_URL=https://acoustic-lemur-535.convex.cloud \
 *   ADMIN_KEY=your-admin-key \
 *   node scripts/rename-db.mjs
 *
 * (ADMIN_KEY is the same key set in Convex → Settings → Environment Variables
 * and used to log into /admin. It never leaves your machine.)
 */
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { readFileSync } from 'node:fs';

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const adminKey = process.env.ADMIN_KEY;
if (!url || !adminKey) {
  console.error('Set NEXT_PUBLIC_CONVEX_URL and ADMIN_KEY in the environment.');
  process.exit(1);
}

const kebab = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const names = JSON.parse(readFileSync('scripts/traditional-names.json', 'utf8'));

const client = new ConvexHttpClient(url);
const docs = await client.query(anyApi.products.list, {});
const byPid = new Map(docs.map((d) => [d.productId, d._id]));

let done = 0;
for (const [pid, name] of Object.entries(names)) {
  const id = byPid.get(pid);
  if (!id) { console.warn('not in DB, skipped:', pid); continue; }
  await client.mutation(anyApi.admin.updateProduct, {
    adminKey,
    id,
    patch: { name, slug: `${kebab(name)}-${pid}` },
  });
  console.log('renamed', pid, '→', name);
  done++;
}
console.log(`\nDone — ${done} products renamed in the database.`);
