'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { anyApi } from 'convex/server';
import { products as staticProducts, Product } from '@/data/products';

/**
 * The storefront's live product list. It starts from the static catalogue —
 * so all 70 pieces always render even if Convex is empty — and overlays any
 * product that exists in Convex, so admin edits (uploaded colour photos, the
 * stock matrix, price changes) and newly-created products show to shoppers.
 *
 * `useQuery` needs ConvexProvider in the tree, which the guarded
 * ConvexClientProvider only mounts when NEXT_PUBLIC_CONVEX_URL is set. So the
 * branch below is on a module constant: when there's no backend we never call
 * the hook and just serve the static list.
 */
const CONVEX_READY = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

const CatalogueContext = createContext<Product[]>(staticProducts);

export function useCatalogue(): Product[] {
  return useContext(CatalogueContext);
}

export function useProduct(id: string): Product | undefined {
  return useCatalogue().find((p) => p.id === id);
}

type Doc = Partial<Product> & { productId: string };

function toProduct(d: Doc): Product {
  return {
    id: d.productId,
    name: d.name ?? '',
    slug: d.slug ?? '',
    price: d.price ?? 0,
    originalPrice: d.originalPrice,
    description: d.description ?? '',
    shortDescription: d.shortDescription ?? '',
    category: d.category ?? 'unisex',
    subcategory: d.subcategory ?? '',
    fabric: d.fabric ?? '',
    colors: d.colors ?? [],
    sizes: d.sizes ?? [],
    images: d.images ?? [],
    tags: d.tags ?? [],
    featured: Boolean(d.featured),
    new: Boolean(d.new),
    bestSeller: Boolean(d.bestSeller),
    clearance: d.clearance,
    rating: d.rating ?? 0,
    reviews: d.reviews ?? 0,
    stock: d.stock,
    variants: d.variants,
  };
}

function LiveCatalogue({ children }: { children: ReactNode }) {
  const docs = useQuery(anyApi.products.list) as Doc[] | undefined;

  const list = useMemo(() => {
    if (!docs || docs.length === 0) return staticProducts;
    const byId = new Map(staticProducts.map((p) => [p.id, p]));
    for (const d of docs) byId.set(d.productId, toProduct(d));
    return [...byId.values()];
  }, [docs]);

  return <CatalogueContext.Provider value={list}>{children}</CatalogueContext.Provider>;
}

export default function CatalogueProvider({ children }: { children: ReactNode }) {
  if (!CONVEX_READY) return <>{children}</>; // context default = static list
  return <LiveCatalogue>{children}</LiveCatalogue>;
}
