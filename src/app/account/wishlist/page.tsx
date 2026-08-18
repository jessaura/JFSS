'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import { useStore } from '@/store/store';
import { useCatalogue } from '@/components/providers/CatalogueProvider';
import { colorAt, isUnpriced } from '@/data/products';
import { getProductImage } from '@/data/images';

export default function WishlistPage() {
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToCart = useStore((s) => s.addToCart);
  const catalogue = useCatalogue();

  const items = wishlist
    .map((id) => catalogue.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="account">
        <div className="container">
          <nav className="wk-crumb" aria-label="Breadcrumb">
            <Link href="/account">Account</Link><span aria-hidden="true">/</span><span>Wishlist</span>
          </nav>

          <header className="account-head">
            <span className="account-eyebrow">Wishlist</span>
            <h1>Saved pieces</h1>
            <p>Your saved favourites, synced to your account.</p>
          </header>

          {items.length === 0 ? (
            <div className="ord-empty">
              <p>Your wishlist is empty.</p>
              <Link href="/shop" className="jf-btn jf-btn-primary">Browse the collection</Link>
            </div>
          ) : (
            <div className="wish-grid">
              {items.map((product) => (
                <div key={product.id} className="wish-card">
                  <Link href={`/product/${product.id}`} className="wish-media">
                    <img src={product.images[0] || getProductImage(product.id)} alt={product.name} loading="lazy" />
                  </Link>
                  <div className="wish-body">
                    <Link href={`/product/${product.id}`} className="wish-name">{product.name}</Link>
                    <span className="wish-price">{isUnpriced(product) ? 'Price on request' : `£${product.price}`}</span>
                    <div className="wish-actions">
                      {!isUnpriced(product) && (
                        <button
                          className="jf-btn jf-btn-primary"
                          onClick={() => addToCart(product, colorAt(product), product.sizes[0] ?? 'One size')}
                        >
                          Add to bag
                        </button>
                      )}
                      <button className="jf-btn jf-btn-ghost" onClick={() => toggleWishlist(product.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
