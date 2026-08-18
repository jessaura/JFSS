/**
 * One-off: rename the original p001–p046 stubs (the randomly-named men's shirts/
 * sweaters and women's kurtis) from image analysis. Only name + slug change;
 * categories are already correct. p003 and p047–p070 have no images and are left
 * as-is.
 *   node scripts/rename-existing.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const kebab = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const names = {
  p001: 'Brown Corduroy Half-Zip Sweater',
  p002: 'Brown Graphic Half-Zip Sweatshirt',
  p004: 'Cream Motif-Print Shirt',
  p005: 'Black Palm-Print Shirt',
  p006: 'Olive Green Linen Shirt',
  p007: 'Khaki Abstract-Print Shirt',
  p008: 'Sage Green Oxford Shirt',
  p009: 'Chocolate Brown Oxford Shirt',
  p010: 'Wine Pinstripe Shirt',
  p011: 'Navy Geometric Print Shirt',
  p012: 'Sky Blue Oxford Shirt',
  p013: 'Teal Textured Weave Shirt',
  p014: 'Yellow Windowpane Check Shirt',
  p015: 'Grey Checked Mandarin Shirt',
  p016: 'Ash Green Linen Shirt',
  p017: 'Camel Brown Linen Shirt',
  p018: 'Grey Floral-Embroidered Shirt',
  p019: 'Espresso Brown Linen Shirt',
  p020: 'Sand Beige Linen Shirt',
  p021: 'Black Gold-Motif Shirt',
  p022: 'Taupe Floral-Embroidered Linen Shirt',
  p023: 'Coffee Brown Button-Down Shirt',
  p024: 'Chambray Blue Shirt',
  p025: 'Cornflower Blue Oxford Shirt',
  p026: 'Maroon Floral Print Shirt',
  p027: 'Charcoal Linen Shirt',
  p028: 'Grey Pinstripe Shirt',
  p029: 'Blue Striped Oxford Shirt',
  p030: 'Olive Abstract Print Shirt',
  p031: 'Navy Floral-Embroidered Shirt',
  p032: 'Brown Animal-Print Shirt',
  p033: 'Military Green Shirt',
  p034: 'Classic Black Shirt',
  p035: 'Black Rose Print Shirt',
  p036: 'Black Leaf-Motif Shirt',
  p037: 'Green Ditsy Print Shirt',
  p038: 'Sage Green Embroidered Kurti',
  p039: 'Mustard Embroidered Velvet Kurti',
  p040: 'Ivory Printed Collared Tunic',
  p041: 'Mustard Ombre Floral Kurti',
  p042: 'Ivory Deer-Motif Embroidered Kurti',
  p043: 'Purple Gold-Yoke Anarkali Kurti',
  p044: 'Pista Green Embroidered Kurti',
  p045: 'Mehendi Green Pintuck Kurti',
  p046: 'Onion Pink Anarkali Kurti',
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
  src = src.slice(0, start) + block + src.slice(end);
  count++;
}

writeFileSync('src/data/products.ts', src);
console.log(`Renamed ${count} products.`);
