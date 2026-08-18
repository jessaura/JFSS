'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { anyApi } from 'convex/server';
import { useStore, CartItem } from '@/store/store';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { colorAt } from '@/data/products';

type CartRef = { productId: string; color: string; size: string; quantity: number };

/**
 * Keeps the signed-in customer's wishlist and cart in Convex so they persist
 * and sync across devices. Design (loop-free):
 *   1. On sign-in, once the saved data has loaded, MERGE it with whatever the
 *      guest had this session (union) and write that into the store — guarded by
 *      a ref so it runs exactly once per sign-in.
 *   2. After that merge, WRITE THROUGH every store change back to Convex.
 * Because hydration happens once, the reactive query echo from our own saves is
 * ignored (no ping-pong). Signed-out users are untouched (in-memory only).
 * Only mounted when Clerk is configured.
 */
export default function AccountSync() {
  const { isSignedIn } = useUser();
  const catalogue = useCatalogue();

  const dbWishlist = useQuery(anyApi.wishlist.get) as string[] | undefined;
  const dbCart = useQuery(anyApi.carts.get) as CartRef[] | undefined;
  const saveWishlist = useMutation(anyApi.wishlist.save);
  const saveCart = useMutation(anyApi.carts.save);

  const wishlist = useStore((s) => s.wishlist);
  const cart = useStore((s) => s.cart);
  const setWishlist = useStore((s) => s.setWishlist);
  const setCart = useStore((s) => s.setCart);

  const wishHydrated = useRef(false);
  const cartHydrated = useRef(false);

  /* ---- Wishlist: merge once, then write through ---- */
  useEffect(() => {
    if (!isSignedIn) {
      wishHydrated.current = false;
      return;
    }
    if (wishHydrated.current || dbWishlist === undefined) return;
    wishHydrated.current = true;
    const local = useStore.getState().wishlist;
    setWishlist(Array.from(new Set([...local, ...dbWishlist])));
  }, [isSignedIn, dbWishlist, setWishlist]);

  useEffect(() => {
    if (isSignedIn && wishHydrated.current) {
      saveWishlist({ productIds: wishlist }).catch(() => {});
    }
  }, [wishlist, isSignedIn, saveWishlist]);

  /* ---- Cart: merge once, then write through ---- */
  useEffect(() => {
    if (!isSignedIn) {
      cartHydrated.current = false;
      return;
    }
    if (cartHydrated.current || dbCart === undefined) return;
    cartHydrated.current = true;

    // Re-hydrate saved refs into full CartItems via the catalogue.
    const saved: CartItem[] = [];
    for (const ref of dbCart) {
      const product = catalogue.find((p) => p.id === ref.productId);
      if (!product) continue; // piece no longer in the catalogue
      const color = product.colors.find((c) => c.name === ref.color) ?? colorAt(product);
      saved.push({ product, color, size: ref.size, quantity: ref.quantity });
    }

    // Union with the guest cart (sum quantities for the same product/colour/size).
    const local = useStore.getState().cart;
    const merged: CartItem[] = [...saved];
    for (const li of local) {
      const match = merged.find(
        (m) => m.product.id === li.product.id && m.color.name === li.color.name && m.size === li.size
      );
      if (match) match.quantity += li.quantity;
      else merged.push(li);
    }
    setCart(merged);
  }, [isSignedIn, dbCart, catalogue, setCart]);

  useEffect(() => {
    if (isSignedIn && cartHydrated.current) {
      const items: CartRef[] = cart.map((i) => ({
        productId: i.product.id,
        color: i.color.name,
        size: i.size,
        quantity: i.quantity,
      }));
      saveCart({ items }).catch(() => {});
    }
  }, [cart, isSignedIn, saveCart]);

  return null;
}
