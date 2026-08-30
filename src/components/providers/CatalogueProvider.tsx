'use client';

import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { anyApi } from 'convex/server';
import { products as staticProducts, Product } from '@/data/products';

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
    heroFeatured: Boolean(d.heroFeatured),
    heroCategory: d.heroCategory,
    rating: d.rating ?? 0,
    reviews: d.reviews ?? 0,
    stock: d.stock,
    variants: d.variants,
  };
}

export function getStoredCatalogueOverrides(): Record<string, Partial<Product> & { _deleted?: boolean }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('jf_catalogue_overrides');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredCatalogueOverride(id: string, patch: Partial<Product>) {
  if (typeof window === 'undefined') return;
  try {
    const prev = getStoredCatalogueOverrides();
    const next = { ...prev, [id]: { ...(prev[id] || {}), ...patch } };
    localStorage.setItem('jf_catalogue_overrides', JSON.stringify(next));
    window.dispatchEvent(new Event('jf_catalogue_updated'));
  } catch {}
}

export function removeStoredCatalogueOverride(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const prev = getStoredCatalogueOverrides();
    prev[id] = { ...(prev[id] || {}), _deleted: true };
    localStorage.setItem('jf_catalogue_overrides', JSON.stringify(prev));
    window.dispatchEvent(new Event('jf_catalogue_updated'));
  } catch {}
}

function LiveCatalogue({ children }: { children: ReactNode }) {
  const docs = useQuery(anyApi.products.list) as Doc[] | undefined;
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<Product> & { _deleted?: boolean }>>({});

  useEffect(() => {
    setLocalOverrides(getStoredCatalogueOverrides());
    const handler = () => setLocalOverrides(getStoredCatalogueOverrides());
    window.addEventListener('jf_catalogue_updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('jf_catalogue_updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const list = useMemo(() => {
    const byId = new Map<string, Product>();
    staticProducts.forEach((p) => byId.set(p.id, p));

    if (docs && docs.length > 0) {
      for (const d of docs) byId.set(d.productId, toProduct(d));
    }

    for (const [id, patch] of Object.entries(localOverrides)) {
      if (patch._deleted) {
        byId.delete(id);
      } else {
        const existing = byId.get(id);
        if (existing) {
          byId.set(id, { ...existing, ...patch });
        }
      }
    }

    return [...byId.values()];
  }, [docs, localOverrides]);

  return <CatalogueContext.Provider value={list}>{children}</CatalogueContext.Provider>;
}

export default function CatalogueProvider({ children }: { children: ReactNode }) {
  return <LiveCatalogue>{children}</LiveCatalogue>;
}

