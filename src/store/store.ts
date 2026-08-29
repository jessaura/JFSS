import { create } from 'zustand';
import { Product, ProductColor } from '@/data/products';

export interface CartItem {
  product: Product;
  color: ProductColor;
  size: string;
  quantity: number;
}

interface StoreState {
  /* Cart */
  cart: CartItem[];
  cartOpen: boolean;
  addToCart: (product: Product, color: ProductColor, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  /* Wishlist */
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  setWishlist: (productIds: string[]) => void;

  /* Cart/wishlist hydration from the signed-in user's saved data (see AccountSync) */
  setCart: (items: CartItem[]) => void;

  /* UI */
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  /* Quick View Modal */
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  /* Filters */
  activeCategory: string;
  activeType: string;
  activeFabric: string;
  priceRange: [number, number];
  setActiveCategory: (cat: string) => void;
  setActiveType: (type: string) => void;
  setActiveFabric: (fabric: string) => void;
  setPriceRange: (range: [number, number]) => void;
  resetFilters: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  /* Cart */
  cart: [],
  cartOpen: false,

  addToCart: (product, color, size, quantity = 1) => {
    const { cart } = get();
    const existing = cart.find(
      (item) => item.product.id === product.id && item.color.name === color.name && item.size === size
    );

    if (existing) {
      set({
        cart: cart.map((item) =>
          item.product.id === product.id && item.color.name === color.name && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({ cart: [...cart, { product, color, size, quantity }] });
    }
    set({ cartOpen: true });
  },

  removeFromCart: (productId, color, size) => {
    set({ cart: get().cart.filter((item) => !(item.product.id === productId && item.color.name === color && item.size === size)) });
  },

  updateQuantity: (productId, color, size, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, color, size);
      return;
    }
    set({
      cart: get().cart.map((item) =>
        item.product.id === productId && item.color.name === color && item.size === size
          ? { ...item, quantity }
          : item
      ),
    });
  },

  clearCart: () => set({ cart: [] }),
  toggleCart: () => set({ cartOpen: !get().cartOpen }),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),

  cartTotal: () => get().cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  cartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

  /* Wishlist */
  wishlist: [],
  toggleWishlist: (productId) => {
    const { wishlist } = get();
    set({
      wishlist: wishlist.includes(productId)
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId],
    });
  },
  isWishlisted: (productId) => get().wishlist.includes(productId),
  setWishlist: (productIds) => set({ wishlist: productIds }),

  setCart: (items) => set({ cart: items }),

  /* UI */
  mobileMenuOpen: false,
  toggleMobileMenu: () => set({ mobileMenuOpen: !get().mobileMenuOpen }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),

  /* Quick View Modal */
  quickViewProduct: null,
  openQuickView: (product) => set({ quickViewProduct: product }),
  closeQuickView: () => set({ quickViewProduct: null }),

  /* Filters */
  activeCategory: 'all',
  activeType: 'all',
  activeFabric: 'all',
  priceRange: [0, 999],
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setActiveType: (type) => set({ activeType: type }),
  setActiveFabric: (fabric) => set({ activeFabric: fabric }),
  setPriceRange: (range) => set({ priceRange: range }),
  resetFilters: () =>
    set({ activeCategory: 'all', activeType: 'all', activeFabric: 'all', priceRange: [0, 999] }),
}));
