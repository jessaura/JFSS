'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useStore } from '@/store/store';
import Logo from '@/components/common/Logo';

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [fill, setFill] = useState(0);
  const { cartCount, toggleCart, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      // Scroll progress 0 → 1 across the whole page; drives the crimson wave.
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

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/shop?category=women', label: 'Women' },
    { href: '/shop?category=men', label: 'Men' },
  ];

  return (
    <>
      <div className="jf-utility-bar" aria-hidden="true">
        <span>Free shipping over £75</span>
        <span className="jf-utility-dot" />
        <span>Handcrafted in small batches</span>
        <span className="jf-utility-dot" />
        <span>Easy 30-day returns</span>
      </div>
      <nav
        className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
        style={{ '--nav-fill': fill } as React.CSSProperties}
      >
        <Logo onClick={closeMobileMenu} size="md" showText={false} />

        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="navbar-link">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {clerkEnabled && (
            <>
              <SignedOut>
                <Link href="/login" className="navbar-link navbar-login">Log in</Link>
              </SignedOut>
              <SignedIn>
                <Link href="/account" className="navbar-icon-btn" aria-label="My account">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>
                <UserButton />
              </SignedIn>
            </>
          )}
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
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Link
                  href={link.href}
                  className="navbar-link"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
