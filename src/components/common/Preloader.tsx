'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  // The brand intro is a landing moment — it plays on the home page only.
  // On sub-pages (shop, product, admin) it would just be a full-screen
  // overlay gating the content and swallowing trackpad/scroll events.
  const isHome = usePathname() === '/';

  useEffect(() => {
    // Hide loader after 2.6 seconds (ink reveal + shimmer)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  if (!isHome) return null;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          <div className="preloader-content">
            {/* Peacock J+A monogram: ink paint-in, then gold shimmer sweep */}
            <motion.div
              className="preloader-logo"
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="/images/JA logo.png"
                alt=""
                className="preloader-logo-img"
              />
              <div className="preloader-logo-shimmer" />
            </motion.div>

            {/* Brand Title Stagger (JessAura) */}
            <motion.div
              className="preloader-text-group"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <h1 className="preloader-title">JESSAURA</h1>
              <span className="preloader-subtitle">MODERN SOUTH ASIAN DAILYWEAR</span>
            </motion.div>

            {/* Progress Line */}
            <div className="preloader-progress-track">
              <motion.div
                className="preloader-progress-fill"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1] }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
