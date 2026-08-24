/**
 * One-off: append 4 new kids' jeans (with colour/size/quantity variants) to the
 * static catalogue. Images + final names are added later by the owner.
 *   node scripts/add-jeans.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const kebab = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const HEX = {
  'Stone Ash': '#B7ADA1',
  'Stone Blue': '#6C7A8A',
  'Ash Grey': '#8C8F91',
  'Grey Green': '#7C8574',
  'Navy blue': '#1E2A4A',
};

// [name, variants: [size, color, qty]]
const defs = [
  ['Kids Jeans - 96', [
    ['28', 'Stone Ash', 2], ['28', 'Stone Blue', 2], ['30', 'Ash Grey', 2],
    ['26', 'Stone Ash', 2], ['26', 'Stone Blue', 2], ['30', 'Stone Blue', 2],
  ]],
  ['Kids Jeans - Trendy 99', [
    ['28', '', 2], ['30', '', 2], ['26', '', 2],
  ]],
  ['Kids Jeans - Red Stripe', [
    ['28', '', 2], ['30', 'Stone Ash', 1], ['30', 'Grey Green', 1],
    ['26', 'Navy blue', 1], ['22', 'Navy blue', 1],
  ]],
  ['Kids Jeans - RDN', [
    ['28', '', 2],
  ]],
];

let src = readFileSync('src/data/products.ts', 'utf8');
const maxId = Math.max(...[...src.matchAll(/"id":\s*"p(\d+)"/g)].map((m) => Number(m[1])));
let next = maxId + 1;

const products = defs.map(([name, rows]) => {
  const id = `p${String(next++).padStart(3, '0')}`;
  const colorNames = [...new Set(rows.map((r) => r[1]).filter(Boolean))];
  const sizes = [...new Set(rows.map((r) => r[0]))];
  return {
    id, name, slug: `${kebab(name)}-${id}`, price: 0,
    shortDescription: "Kids' Jeans", description: `${name}. Boys' denim jeans.`,
    category: 'kids', subcategory: 'Jeans', fabric: 'Denim',
    colors: colorNames.map((n) => ({ name: n, hex: HEX[n] ?? '#888888', image: '' })),
    sizes, images: [], tags: ['jeans', 'kids', 'denim'],
    featured: false, new: true, bestSeller: false,
    rating: 0, reviews: 0,
    stock: rows.reduce((n, r) => n + r[2], 0),
    variants: rows.map(([size, color, quantity]) => ({ size, color, quantity })),
  };
});

const collectionsIdx = src.indexOf('export const collections');
const close = src.lastIndexOf('];', collectionsIdx);
const before = src.slice(0, close).replace(/\s*$/, '');
const block = products
  .map((p) => JSON.stringify(p, null, 2).split('\n').map((l) => '  ' + l).join('\n'))
  .join(',\n');
src = `${before},\n${block}\n${src.slice(close)}`;
writeFileSync('src/data/products.ts', src);

console.log(`Added ${products.length} jeans: ${products[0].id}–${products[products.length - 1].id}`);
