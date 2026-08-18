/**
 * One-off importer for the drop in public/new prod/.
 * - Optimises each image into public/products/ (jpeg, width<=1400).
 * - Groups named pairs (skin_1/skin_2, emerald_1/2, red_sl_1/2, green_d, green_plant)
 *   into single multi-image products; every photo_* file is its own product.
 * - Appends stub products (price 0 -> "price on request", category unisex, no
 *   details) to src/data/products.ts so they show on the shop and are editable
 *   in the admin. Details are filled in later.
 *
 *   node scripts/import-new-prod.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const SRC = join('public', 'new prod');
const DST = join('public', 'products');
const DATA = join('src', 'data', 'products.ts');

const kebab = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const title = (s) =>
  s.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();

/* ---------- group the source files ---------- */
const files = readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

const named = new Map(); // base -> [file, ...]
const photos = []; // singletons
for (const f of files) {
  const stem = basename(f, extname(f));
  if (/^photo_/i.test(stem)) { photos.push(f); continue; }
  let base = stem.replace(/_\d+$/, '');
  if (base === 'gree_d') base = 'green_d';
  if (base === 'gree_plant') base = 'green_plant';
  if (!named.has(base)) named.set(base, []);
  named.get(base).push(f);
}
// stable order within a named group: by trailing number
for (const arr of named.values()) {
  arr.sort((a, b) => {
    const n = (x) => Number((basename(x, extname(x)).match(/_(\d+)$/) || [])[1] || 0);
    return n(a) - n(b);
  });
}

/* ---------- assign ids after the current max ---------- */
let src = readFileSync(DATA, 'utf-8');
const maxId = Math.max(...[...src.matchAll(/"id":\s*"p(\d+)"/g)].map((m) => Number(m[1])));
let next = maxId + 1;
const pid = () => `p${String(next++).padStart(3, '0')}`;

/* ---------- build products (named first, then photos) ---------- */
const products = [];
let arrivalN = 0;

async function optimise(srcFile, outName) {
  await sharp(join(SRC, srcFile)).resize({ width: 1400, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true }).toFile(join(DST, outName));
}

for (const [base, groupFiles] of [...named.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const id = pid();
  const name = title(base);
  const images = [];
  for (let i = 0; i < groupFiles.length; i++) {
    const out = groupFiles.length > 1 ? `${id}-${i + 1}.jpg` : `${id}.jpg`;
    await optimise(groupFiles[i], out);
    images.push(`/products/${out}`);
  }
  products.push(stub(id, name, images));
}

for (const f of photos.sort()) {
  const id = pid();
  arrivalN += 1;
  await optimise(f, `${id}.jpg`);
  products.push(stub(id, `New Arrival ${arrivalN}`, [`/products/${id}.jpg`]));
}

function stub(id, name, images) {
  return {
    id, name, slug: `${kebab(name)}-${id}`, price: 0,
    shortDescription: '', description: '',
    category: 'unisex', subcategory: '', fabric: '',
    colors: [], sizes: [], images, tags: ['new'],
    featured: false, new: true, bestSeller: false,
    rating: 0, reviews: 0, stock: 10,
  };
}

/* ---------- splice into the products array ---------- */
const collectionsIdx = src.indexOf('export const collections');
const close = src.lastIndexOf('];', collectionsIdx);
const before = src.slice(0, close).replace(/\s*$/, '');
const after = src.slice(close);
const block = products
  .map((p) => JSON.stringify(p, null, 2).split('\n').map((l) => '  ' + l).join('\n'))
  .join(',\n');
src = `${before},\n${block}\n${after}`;
writeFileSync(DATA, src);

console.log(`Imported ${products.length} products (${named.size} named + ${photos.length} photos) as p${String(maxId + 1).padStart(3, '0')}–${String(next - 1).padStart(3, '0')}.`);
