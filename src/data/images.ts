import { products } from './products';

/**
 * Neutral stand-in for pieces whose photography hasn't been shot yet.
 * Deliberately not another product's photo — showing an unrelated garment
 * would misrepresent the item.
 */
export const IMAGE_PENDING =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
      <rect width="400" height="500" fill="#F1ECE3"/>
      <g fill="none" stroke="#C9C0B2" stroke-width="2">
        <rect x="0.5" y="0.5" width="399" height="499"/>
        <path d="M150 210h100v120H150z"/>
        <path d="M150 290l30-30 25 25 25-35 20 25"/>
        <circle cx="180" cy="238" r="10"/>
      </g>
      <text x="200" y="374" text-anchor="middle" font-family="system-ui,sans-serif"
        font-size="17" fill="#9A9083">Photography coming soon</text>
    </svg>`
  );

const imageByProductId: Record<string, string> = Object.fromEntries(
  products.map((p) => [p.id, p.images[0] ?? IMAGE_PENDING])
);

export function getProductImage(productId: string): string {
  return imageByProductId[productId] ?? IMAGE_PENDING;
}

/** True when the piece is still waiting on photography. */
export function hasPhoto(productId: string): boolean {
  return Boolean(imageByProductId[productId] && imageByProductId[productId] !== IMAGE_PENDING);
}
