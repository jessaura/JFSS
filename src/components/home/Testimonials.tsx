'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonials } from '@/data/products';

export default function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Nothing to show until real customer reviews exist.
  if (testimonials.length === 0) return null;

  const t = testimonials[active];

  return (
    <section className="jf-quotes">
      <div className="container jf-quotes-inner">
        <span className="jf-eyebrow">Worn &amp; loved</span>

        <AnimatePresence mode="wait">
          <motion.figure
            key={active}
            className="jf-quote"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <blockquote className="jf-quote-text">{t.text}</blockquote>
            <figcaption className="jf-quote-author">
              <span className="jf-quote-name">{t.name}</span>
              <span className="jf-quote-meta">{t.location} · {t.product}</span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>

        <div className="jf-quote-dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View testimonial ${i + 1}`}
              className={`jf-quote-dot ${i === active ? 'on' : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
