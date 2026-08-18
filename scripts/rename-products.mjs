/**
 * One-off: rename the p071–p109 blouse stubs from image analysis, and set
 * category/subcategory/shortDescription (they're all women's saree blouses).
 *   node scripts/rename-products.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const kebab = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const names = {
  p071: 'Emerald Green Embroidered Blouse',
  p072: 'Bottle Green Stone-Work Blouse',
  p073: 'Green Floral Buti Blouse',
  p074: 'Red Net-Sleeve Blouse',
  p075: 'Gold Shimmer Blouse',
  p076: 'White Sequin Buti Blouse',
  p077: 'Red Bandhani Mirror-Work Blouse',
  p078: 'Black Bandhani Stone-Work Blouse',
  p079: 'Lavender Bandhani Blouse',
  p080: 'Orange Bandhani Buti Blouse',
  p081: 'Mehendi Green Stone-Work Blouse',
  p082: 'Teal Blue Bandhani Blouse',
  p083: 'Red Textured Full-Sleeve Blouse',
  p084: 'Rama Green Textured Blouse',
  p085: 'Navy Blue Stone-Work Blouse',
  p086: 'Charcoal Stone-Work Blouse',
  p087: 'Mustard Stone-Work Blouse',
  p088: 'Grey Stone-Work Blouse',
  p089: 'Peach Stone-Work Blouse',
  p090: 'Teal Stone-Work Blouse',
  p091: 'Rose Stone-Work Blouse',
  p092: 'Red Stone-Work Blouse',
  p093: 'Black Stone-Work Blouse',
  p094: 'Rani Pink Stone-Work Blouse',
  p095: 'Onion Pink Shimmer Blouse',
  p096: 'Berry Net-Sleeve Blouse',
  p097: 'Bottle Green Textured Blouse',
  p098: 'Black Net-Sleeve Blouse',
  p099: 'Floral Brocade Sleeveless Blouse',
  p100: 'White Embroidered Floral Blouse',
  p101: 'Wine Peacock-Sleeve Blouse',
  p102: 'Red Peacock-Sleeve Blouse',
  p103: 'Mehendi Green Peacock-Sleeve Blouse',
  p104: 'Rani Pink Bandhani Blouse',
  p105: 'Gold Crushed Blouse',
  p106: 'Onion Pink Bandhani Blouse',
  p107: 'Navy Blue Bandhani Blouse',
  p108: 'Teal Green Bandhani Blouse',
  p109: 'Mauve Bandhani Blouse',
};

let src = readFileSync('src/data/products.ts', 'utf8');
let count = 0;

for (const [id, name] of Object.entries(names)) {
  const startTag = `"id": "${id}"`;
  const start = src.indexOf(startTag);
  if (start < 0) { console.warn('missing', id); continue; }
  const nextIdx = src.indexOf('"id": "p', start + startTag.length);
  const end = nextIdx < 0 ? src.length : nextIdx;
  let block = src.slice(start, end);

  block = block.replace(/("name":\s*)"[^"]*"/, `$1${JSON.stringify(name)}`);
  block = block.replace(/("slug":\s*)"[^"]*"/, `$1${JSON.stringify(`${kebab(name)}-${id}`)}`);
  block = block.replace(/("shortDescription":\s*)"[^"]*"/, `$1"Saree Blouse"`);
  block = block.replace(/("description":\s*)"[^"]*"/, `$1${JSON.stringify(`${name}. Readymade saree blouse.`)}`);
  block = block.replace(/("category":\s*)"[^"]*"/, `$1"women"`);
  block = block.replace(/("subcategory":\s*)"[^"]*"/, `$1"Blouses"`);

  src = src.slice(0, start) + block + src.slice(end);
  count++;
}

writeFileSync('src/data/products.ts', src);
console.log(`Renamed ${count} products.`);
