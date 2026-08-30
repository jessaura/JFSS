'use client';

import { motion } from 'framer-motion';

/**
 * Hero animated logo showpiece — the signature peacock J+A monogram inks itself in
 * with radiant champagne aura, paired with the JESSAURA LONDON ATELIER wordmark.
 */
export default function HeroLoopingLogo() {
  return (
    <div className="jf-logo-stage">
      <div className="jf-logo-aura-glow" aria-hidden="true" />
      <motion.div
        className="jf-logo-mark"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ rotate: 2, scale: 1.04 }}
      >
        <img
          src="/images/JA logo.png"
          alt="Jessaura London Atelier Peacock Monogram"
          className="jf-logo-peacock"
        />
      </motion.div>

      <motion.div
        className="jf-logo-wordmark-wrap"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="jf-logo-wordmark">
          JESS<span className="accent">AURA</span>
        </span>
        <span className="jf-logo-submark">LONDON · ATELIER</span>
      </motion.div>
    </div>
  );
}
