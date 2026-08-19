/**
 * Set catalogue prices: shirts (men/unisex) = 29.90, sweaters = 28.90.
 * Kids' shirt-sets are excluded (different product), and only the static
 * catalogue is touched — those pieces aren't overridden in Convex.
 *   node scripts/update-prices.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('src/data/products.ts', 'utf8');
const ms = [...src.matchAll(/"id": "p\d+"/g)];

let out = src.slice(0, ms[0].index);
let shirts = 0;
let sweaters = 0;

for (let i = 0; i < ms.length; i++) {
  const start = ms[i].index;
  const end = i + 1 < ms.length ? ms[i + 1].index : src.length;
  let block = src.slice(start, end);
  const sub = (block.match(/"subcategory": "([^"]*)"/) || [])[1];
  const cat = (block.match(/"category": "([^"]*)"/) || [])[1];

  let price = null;
  if (sub === 'Sweater') { price = 28.9; sweaters++; }
  else if (sub === 'Shirts' && cat !== 'kids') { price = 29.9; shirts++; }

  if (price !== null) block = block.replace(/("price":\s*)[\d.]+/, `$1${price}`);
  out += block;
}

writeFileSync('src/data/products.ts', out);
console.log(`Priced ${shirts} shirts at 29.90 and ${sweaters} sweaters at 28.90.`);
