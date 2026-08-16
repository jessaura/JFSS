'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling, driven by the GSAP ticker and synced to ScrollTrigger
 * so the site's scroll-reveal animations stay in step. Disabled under
 * prefers-reduced-motion, and off in the admin — a dense dashboard wants plain
 * native scrolling, and Lenis otherwise hijacks the wheel over its edit modals.
 * Renders nothing.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (pathname?.startsWith('/admin')) return;

    // Feel is tuned for an editorial glide. These are the knobs to turn:
    // lower lerp = smoother/weightier, higher = snappier.
    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
