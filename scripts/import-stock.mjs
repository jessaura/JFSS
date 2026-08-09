/**
 * Regenerates src/data/products.ts and public/products/ from the stock export.
 *
 *   node scripts/import-stock.mjs <unzipped-export-dir>
 *
 * The export dir holds clothing_stock_<date>.xlsx plus an images/ folder.
 * Images are matched to products by cloth name (the sheet's image column is
 * empty), and copied out under clean kebab-case names so no URL escaping is
 * needed.
 *
 * Nothing is invented here. Missing prices stay 0 (the UI shows "price on
 * request"), missing images produce an empty array, and rating/reviews are 0
 * because no reviews exist yet.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, rmSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { execFileSync } from 'node:child_process';

const exportDir = process.argv[2];
if (!exportDir) {
  console.error('usage: node scripts/import-stock.mjs <unzipped-export-dir>');
  process.exit(1);
}

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const kebab = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/* ---------- read the workbook via python/openpyxl ---------- */
const py = `
import json, sys, openpyxl, glob, os
d = sys.argv[1]
path = glob.glob(os.path.join(d, '*.xlsx'))[0]
wb = openpyxl.load_workbook(path, data_only=True)
def rows(ws):
    it = ws.iter_rows(values_only=True)
    hdr = list(next(it))
    return [dict(zip(hdr, r)) for r in it if any(v is not None for v in r)]
json.dump({'products': rows(wb['Products']), 'variants': rows(wb['Variants'])}, sys.stdout, default=str)
`;
const { products: rawProducts, variants: rawVariants } = JSON.parse(
  execFileSync('python', ['-c', py, exportDir], { encoding: 'utf-8', maxBuffer: 32 * 1024 * 1024 })
);

/* ---------- match images by cloth name ---------- */
const imgDir = join(exportDir, 'images');
const imgFiles = readdirSync(imgDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const byNorm = new Map(imgFiles.map((f) => [norm(basename(f, extname(f))), f]));

function findImage(clothName) {
  const n = norm(clothName);
  if (byNorm.has(n)) return byNorm.get(n);
  // Filenames sometimes append the colour: "rl brown" -> "rl brown brown.jpg"
  const prefixed = [...byNorm.entries()]
    .filter(([k]) => k.startsWith(n + ' '))
    .sort((a, b) => a[0].length - b[0].length);
  return prefixed.length ? prefixed[0][1] : null;
}

/* ---------- colour name -> swatch hex ----------
   Only literal colour words are mapped; anything unrecognised falls back to a
   neutral chip rather than a guessed shade. */
const COLOR_HEX = {
  black: '#1C1917', white: '#FAFAFA', grey: '#8A8580', gray: '#8A8580',
  red: '#B42318', green: '#4F7A4A', blue: '#2E4A8A', 'navy blue': '#1E2A4A',
  navy: '#1E2A4A', pink: '#D48BA0', orange: '#D8792F', yellow: '#E2B23C',
  golden: '#C9922E', gold: '#C9922E', 'golden yellow': '#D9A82E',
  brown: '#7A5A42', skin: '#E3C4A8', olive: '#6B6B3A', 'olive green': '#6B6B3A',
  'light green': '#8FB07A', 'sky blue': '#8BB8D8', 'parrot green': '#5FA84B',
  'cherry red': '#9B2335', 'peacock blue': '#1F6F84', maroon: '#6B0F1A',
  'blueish grey': '#7A8A99', 'dark blue': '#1E3A6E',
};
const swatch = (name) => COLOR_HEX[norm(name)] ?? '#B8B2A8';

/* ---------- group variants ---------- */
const variantsByCloth = new Map();
for (const v of rawVariants) {
  const key = v['Cloth Name'];
  if (!variantsByCloth.has(key)) variantsByCloth.set(key, []);
  variantsByCloth.get(key).push(v);
}

/* ---------- build products ---------- */
const outImgDir = join('public', 'products');
rmSync(outImgDir, { recursive: true, force: true });
mkdirSync(outImgDir, { recursive: true });

const seenSlug = new Set();
let matched = 0;

const products = rawProducts.map((p, i) => {
  const name = String(p['Cloth Name']).replace(/\s+/g, ' ').trim();
  let slug = kebab(name);
  while (seenSlug.has(slug)) slug = `${slug}-${i}`;
  seenSlug.add(slug);

  const vs = variantsByCloth.get(p['Cloth Name']) ?? [];
  const sizes = [...new Set(vs.map((v) => v.Size).filter(Boolean).map(String))];
  const colorNames = [...new Set(vs.map((v) => v.Color).filter(Boolean).map(String))];

  const file = findImage(p['Cloth Name']);
  let images = [];
  if (file) {
    const dest = `${slug}${extname(file).toLowerCase()}`;
    copyFileSync(join(imgDir, file), join(outImgDir, dest));
    images = [`/products/${dest}`];
    matched++;
  }

  const gender = norm(p.Gender);
  const category = ['men', 'women', 'kids', 'unisex'].includes(gender) ? gender : 'unisex';
  const garment = String(p.Category ?? '').trim();
  const age = p.Age ? String(p.Age).trim() : null;

  return {
    id: `p${String(i + 1).padStart(3, '0')}`,
    name,
    slug,
    price: Number(p.Price) || 0,
    // Factual, derived from the sheet — no marketing copy invented.
    shortDescription: [garment, age ? `Age ${age}` : null].filter(Boolean).join(' · '),
    description: [
      garment && `${garment}.`,
      sizes.length ? `Available in ${sizes.join(', ')}.` : null,
      colorNames.length ? `Colours: ${colorNames.join(', ')}.` : null,
      age ? `Suggested age: ${age}.` : null,
    ]
      .filter(Boolean)
      .join(' '),
    category,
    subcategory: garment,
    fabric: '',
    colors: colorNames.map((c) => ({ name: c, hex: swatch(c), image: images[0] ?? '' })),
    sizes,
    images,
    tags: [garment, category, ...(age ? [age] : [])].filter(Boolean).map((t) => t.toLowerCase()),
    featured: false,
    new: true,
    bestSeller: false,
    rating: 0,
    reviews: 0,
    stock: Number(p['Total Quantity']) || 0,
  };
});

// Front the homepage rail with real, photographed, in-stock pieces.
products
  .filter((p) => p.images.length && p.stock > 0)
  .slice(0, 8)
  .forEach((p) => {
    p.featured = true;
  });

/* ---------- emit products.ts ---------- */
const header = `// AUTO-GENERATED by scripts/import-stock.mjs — do not edit by hand.
// Source: stock export (${new Date().toISOString().slice(0, 10)}).
// Prices of 0 mean "not yet priced"; the UI shows price-on-request and
// blocks add-to-cart. rating/reviews are 0 because no reviews exist yet.
`;

const body = `${header}
export interface ProductColor {
  name: string;
  hex: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  shortDescription: string;
  category: 'men' | 'women' | 'kids' | 'unisex';
  subcategory: string;
  fabric: string;
  colors: ProductColor[];
  sizes: string[];
  images: string[];
  tags: string[];
  featured: boolean;
  new: boolean;
  bestSeller: boolean;
  clearance?: boolean;
  rating: number;
  reviews: number;
  stock?: number;
}

export const products: Product[] = ${JSON.stringify(products, null, 2)};

export const collections = [
  { id: 'men',    title: "Men's",   subtitle: 'Shirts & sweaters', description: 'Shirts, polos and knitwear for every day.', image: '' },
  { id: 'women',  title: "Women's", subtitle: 'Tops & occasion',   description: 'Tops, blouses, sarees and set mundu.',      image: '' },
  { id: 'kids',   title: 'Kids',    subtitle: 'Everyday wear',     description: 'Shirts, crop tops and denim for children.', image: '' },
  { id: 'unisex', title: 'Unisex',  subtitle: 'Shared styles',     description: 'Pieces cut to suit everyone.',              image: '' },
];

/**
 * Stand-in colourway. Most pieces in the export have no colour recorded, so
 * anything reading colors[0] must fall back rather than crash.
 */
export const DEFAULT_COLOR: ProductColor = { name: 'As shown', hex: '#B8B2A8', image: '' };

/** The chosen colourway, or the stand-in when none are recorded. */
export function colorAt(p: Product, index = 0): ProductColor {
  return p.colors[index] ?? p.colors[0] ?? DEFAULT_COLOR;
}

/** True when the piece has no price set yet — show price-on-request. */
export function isUnpriced(p: Product): boolean {
  return !p.price || p.price <= 0;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(category: Product['category']): Product[] {
  return products.filter((p) => p.category === category);
}

export function getClearanceProducts(): Product[] {
  return products
    .filter((p) => p.clearance && p.originalPrice && p.originalPrice > p.price)
    .sort((a, b) => discountPercent(b) - discountPercent(a));
}

export function discountPercent(p: Product): number {
  if (!p.originalPrice || p.originalPrice <= p.price) return 0;
  return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
}

export const testimonials: {
  id: string; name: string; location: string; text: string; rating: number; product: string;
}[] = [];
`;

writeFileSync(join('src', 'data', 'products.ts'), body, 'utf-8');

const unpriced = products.filter((p) => !p.price).length;
console.log(
  `products ${products.length} | images matched ${matched} | without image ${products.length - matched} | unpriced ${unpriced} | featured ${products.filter((p) => p.featured).length}`
);
