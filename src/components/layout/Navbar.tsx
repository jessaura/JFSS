'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/store';
import Logo from '@/components/common/Logo';
import AuthNav from '@/components/layout/AuthNav';

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [fill, setFill] = useState(0);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { cartCount, toggleCart, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setFill(max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleMouseEnter = () => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setMegaOpen(true);
  };

  const handleMouseLeave = () => {
    megaTimeoutRef.current = setTimeout(() => {
      setMegaOpen(false);
    }, 200);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop', hasMega: true },
    { href: '/shop?category=women', label: 'Women' },
    { href: '/shop?category=men', label: 'Men' },
    { href: '/shop?category=kids', label: 'Kids' },
    { href: '/shop?category=clearance', label: 'Clearance', isSpecial: true },
  ];

  return (
    <>
      <div className="jf-utility-bar" aria-hidden="true">
        <span>Free shipping over £50</span>
        <span className="jf-utility-dot" />
        <span>100% Pure Slub Linen &amp; Handlooms</span>
        <span className="jf-utility-dot" />
        <span>14-Day Effortless Returns</span>
      </div>

      <nav
        className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
        style={{ '--nav-fill': fill } as React.CSSProperties}
      >
        <Logo onClick={closeMobileMenu} size="md" showText={false} />

        <div className="navbar-links">
          {navLinks.map((link) => (
            <div
              key={link.href}
              className="navbar-link-wrap"
              onMouseEnter={link.hasMega ? handleMouseEnter : undefined}
              onMouseLeave={link.hasMega ? handleMouseLeave : undefined}
            >
              <Link
                href={link.href}
                className={`navbar-link ${link.isSpecial ? 'navbar-link-clearance' : ''}`}
                onClick={closeMobileMenu}
              >
                {link.label}
                {link.hasMega && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="jf-nav-chevron">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </Link>

              {/* Luxury Mega-Dropdown Menu */}
              {link.hasMega && (
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      className="jf-mega-menu"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="jf-mega-grid">
                        {/* Column 1: Women */}
                        <div className="jf-mega-col">
                          <Link href="/shop?category=women" className="jf-mega-col-title" onClick={() => setMegaOpen(false)}>
                            Women&apos;s Atelier
                          </Link>
                          <ul className="jf-mega-list">
                            <li><Link href="/shop?category=dresses" onClick={() => setMegaOpen(false)}>Linen Dresses (Hand-Painted)</Link></li>
                            <li><Link href="/shop?category=women&subcat=Tops" onClick={() => setMegaOpen(false)}>Tops &amp; Blouses</Link></li>
                            <li><Link href="/shop?category=women&subcat=Kurtis" onClick={() => setMegaOpen(false)}>Artisanal Kurtis</Link></li>
                            <li><Link href="/shop?category=festive" onClick={() => setMegaOpen(false)}>Kerala Saris &amp; Set Mundu</Link></li>
                            <li><Link href="/shop?category=women" className="jf-mega-viewall" onClick={() => setMegaOpen(false)}>View All Women &rarr;</Link></li>
                          </ul>
                        </div>

                        {/* Column 2: Men */}
                        <div className="jf-mega-col">
                          <Link href="/shop?category=men" className="jf-mega-col-title" onClick={() => setMegaOpen(false)}>
                            Men&apos;s Everyday
                          </Link>
                          <ul className="jf-mega-list">
                            <li><Link href="/shop?category=men&subcat=Kurtas" onClick={() => setMegaOpen(false)}>Artisanal Kurtas</Link></li>
                            <li><Link href="/shop?category=men&subcat=Shirts" onClick={() => setMegaOpen(false)}>Linen Shirts &amp; Polos</Link></li>
                            <li><Link href="/shop?category=men&subcat=Sweaters" onClick={() => setMegaOpen(false)}>Knitwear &amp; Layers</Link></li>
                            <li><Link href="/shop?category=men" className="jf-mega-viewall" onClick={() => setMegaOpen(false)}>View All Men &rarr;</Link></li>
                          </ul>
                        </div>

                        {/* Column 3: Kids */}
                        <div className="jf-mega-col">
                          <Link href="/shop?category=kids" className="jf-mega-col-title" onClick={() => setMegaOpen(false)}>
                            Kids &amp; Juniors
                          </Link>
                          <ul className="jf-mega-list">
                            <li><Link href="/shop?category=kids" onClick={() => setMegaOpen(false)}>Boys Cotton Dailywear</Link></li>
                            <li><Link href="/shop?category=kids" onClick={() => setMegaOpen(false)}>Girls Playful Kurtas</Link></li>
                            <li><Link href="/shop?category=kids" onClick={() => setMegaOpen(false)}>Organic Breathable Sets</Link></li>
                            <li><Link href="/shop?category=kids" className="jf-mega-viewall" onClick={() => setMegaOpen(false)}>View All Kids &rarr;</Link></li>
                          </ul>
                        </div>

                        {/* Column 4: Promo Cards */}
                        <div className="jf-mega-col jf-mega-promo-col">
                          <Link href="/shop?category=clearance" className="jf-mega-promo-card" onClick={() => setMegaOpen(false)}>
                            <div className="jf-mega-promo-bg" style={{ backgroundImage: 'url("/clearance-sale.jpg")' }} />
                            <div className="jf-mega-promo-overlay" />
                            <div className="jf-mega-promo-text">
                              <span className="jf-mega-promo-badge">🔥 Final Markdowns</span>
                              <h4>Clearance Vault</h4>
                              <p>Up to 60% off limited sizes &amp; archive styles.</p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>

        <div className="navbar-actions">
          {clerkEnabled && <AuthNav />}
          <button className="navbar-icon-btn" onClick={toggleCart} aria-label="Open cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount() > 0 && (
              <motion.span
                className="cart-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={cartCount()}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                {cartCount()}
              </motion.span>
            )}
          </button>

          <button
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="jf-mobile-nav-links">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className={`jf-mobile-link ${link.isSpecial ? 'mobile-clearance' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                    {link.isSpecial && <span className="mobile-pill-sale">−60%</span>}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
