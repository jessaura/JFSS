'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="jf-luxury-footer" aria-label="Site footer">
      {/* 1. Maison Assurance & Value Proposition Bar */}
      <div className="jf-footer-assurance">
        <div className="container">
          <div className="jf-assurance-grid">
            <div className="jf-assurance-item">
              <div className="jf-assurance-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
                  <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
                  <circle cx="7" cy="18" r="2" />
                  <circle cx="17" cy="18" r="2" />
                </svg>
              </div>
              <div className="jf-assurance-text">
                <h4 className="jf-assurance-title">Complimentary Delivery</h4>
                <p className="jf-assurance-desc">On all UK orders over £50 via tracked courier</p>
              </div>
            </div>

            <div className="jf-assurance-item">
              <div className="jf-assurance-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div className="jf-assurance-text">
                <h4 className="jf-assurance-title">100% Artisan Linen</h4>
                <p className="jf-assurance-desc">Ethically woven pure slub linen & breathable cottons</p>
              </div>
            </div>

            <div className="jf-assurance-item">
              <div className="jf-assurance-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 12a9 9 0 0115.5-6.4L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 01-15.5 6.4L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </div>
              <div className="jf-assurance-text">
                <h4 className="jf-assurance-title">14-Day Effortless Returns</h4>
                <p className="jf-assurance-desc">Prepaid labels & prompt store credit or refunds</p>
              </div>
            </div>

            <div className="jf-assurance-item">
              <div className="jf-assurance-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </div>
              <div className="jf-assurance-text">
                <h4 className="jf-assurance-title">WhatsApp Concierge</h4>
                <p className="jf-assurance-desc">Direct styling, size queries & dispatch support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Newsletter & VIP Drop Invitation Strip */}
      <div className="jf-footer-newsletter-wrap">
        <div className="container">
          <div className="jf-footer-newsletter">
            <div className="jf-newsletter-copy">
              <span className="jf-newsletter-eyebrow">THE JESSAURA ATELIER</span>
              <h3 className="jf-newsletter-heading">Receive Private Drop Invitations</h3>
              <p className="jf-newsletter-desc">
                Subscribe for private collection previews, seasonal Kerala edit drops, and artisanal fabric stories.
              </p>
            </div>

            <div className="jf-newsletter-action">
              {subscribed ? (
                <div className="jf-newsletter-success">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>Welcome to the Atelier. We have reserved your VIP access.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="jf-newsletter-form">
                  <input
                    type="email"
                    placeholder="Enter your email address…"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Email for private invitations"
                    className="jf-newsletter-input"
                  />
                  <button type="submit" className="jf-newsletter-btn">
                    <span>Subscribe</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Footer Links & Navigation Grid */}
      <div className="container">
        <div className="jf-footer-main-grid">
          {/* Brand Column */}
          <div className="jf-footer-brand-col">
            <Link href="/" className="jf-footer-brandmark">
              JESS<span className="gold-accent">AURA</span>
            </Link>
            <p className="jf-footer-brand-desc">
              Modern South Asian everyday elegance. Crafted from pure slub linens, breathable cottons, and botanical
              florals for effortless comfort.
            </p>
            <div className="jf-footer-badges-strip">
              <span className="jf-footer-meta-pill">🇬🇧 London, United Kingdom</span>
              <span className="jf-footer-meta-pill">🌴 Handcrafted in Kerala</span>
            </div>
          </div>

          {/* Column 1: The Collections */}
          <div className="jf-footer-col">
            <h4 className="jf-footer-col-title">The Collections</h4>
            <ul className="jf-footer-links">
              <li><Link href="/shop">All Curated Pieces</Link></li>
              <li><Link href="/shop?category=women">Linen Dresses</Link></li>
              <li><Link href="/shop?category=men">Men&apos;s Everyday Kurtas</Link></li>
              <li><Link href="/shop?type=ready-to-wear">Co-ords &amp; Sets</Link></li>
              <li><Link href="/shop?type=festive">Festive Kerala Edit</Link></li>
              <li><Link href="/shop?type=clearance">Clearance Rail</Link></li>
            </ul>
          </div>

          {/* Column 2: The Maison */}
          <div className="jf-footer-col">
            <h4 className="jf-footer-col-title">The Maison</h4>
            <ul className="jf-footer-links">
              <li><Link href="/#story">Our Brand Story</Link></li>
              <li><Link href="/shop">Artisanal Slub Weave</Link></li>
              <li><Link href="/shop">Hand-Painted Botanicals</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') window.dispatchEvent(new Event('jf_open_onboarding'));
                  }}
                  className="jf-footer-btn-link"
                >
                  Maison Welcome Guide
                </button>
              </li>
              <li><Link href="/admin">Atelier Admin Portal</Link></li>
            </ul>
          </div>

          {/* Column 3: Client Care */}
          <div className="jf-footer-col">
            <h4 className="jf-footer-col-title">Client Care</h4>
            <ul className="jf-footer-links">
              <li><Link href="/account/orders">Track My Order</Link></li>
              <li><Link href="/privacy">Privacy &amp; Data Rights</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/account">Account Dashboard</Link></li>
              <li><Link href="/account/wishlist">Saved Wishlist</Link></li>
              <li><Link href="/account/addresses">Shipping &amp; Delivery</Link></li>
              <li><a href="https://wa.me/" target="_blank" rel="noopener noreferrer">WhatsApp Concierge</a></li>
            </ul>
          </div>
        </div>

        {/* 4. Giant Sculptural Watermark */}
        <div className="jf-footer-giant-watermark" aria-hidden="true">
          <span>JESSAURA</span>
        </div>

        {/* 5. Bottom Legal & Payment Row */}
        <div className="jf-footer-bottom-row">
          <div className="jf-footer-copyright">
            <p>© {new Date().getFullYear()} JessAura London. All rights reserved.</p>
            <div className="jf-footer-legal-links">
              <Link href="/privacy">Privacy Policy</Link>
              <span>·</span>
              <Link href="/terms">Terms of Service</Link>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') window.dispatchEvent(new Event('jf_open_cookie_preferences'));
                }}
                className="jf-footer-legal-btn"
              >
                Cookie Preferences
              </button>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="jf-footer-payments" aria-label="Accepted payment methods">
            <span className="jf-payment-pill">Apple Pay</span>
            <span className="jf-payment-pill">Google Pay</span>
            <span className="jf-payment-pill">Visa</span>
            <span className="jf-payment-pill">Mastercard</span>
            <span className="jf-payment-pill">Amex</span>
            <span className="jf-payment-pill">PayPal</span>
          </div>

          {/* Social Icons */}
          <div className="jf-footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="jf-social-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="jf-social-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)" className="jf-social-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
