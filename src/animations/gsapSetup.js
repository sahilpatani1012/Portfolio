/* ═══════════════════════════════════════════════════════════
   GSAP SETUP — GSAP + ScrollTrigger + Lenis Initialization
   ═══════════════════════════════════════════════════════════ */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { prefersReducedMotion } from '../utils/helpers.js';

gsap.registerPlugin(ScrollTrigger);

// GSAP defaults
gsap.defaults({
  ease: 'power3.out',
  duration: 0.8,
});

let lenis = null;

/**
 * Initialize Lenis smooth scroll + GSAP sync
 */
export function initSmoothScroll() {
  if (prefersReducedMotion()) {
    // Use native scroll for reduced motion
    return null;
  }

  lenis = new Lenis({
    lerp: 0.06,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.5,
    infinite: false,
  });

  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/**
 * Get the Lenis instance
 */
export function getLenis() {
  return lenis;
}

/**
 * Scroll to a target element smoothly
 */
export function scrollTo(target, options = {}) {
  if (lenis) {
    lenis.scrollTo(target, {
      offset: options.offset || 0,
      duration: options.duration || 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options,
    });
  } else {
    // Fallback for no Lenis
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/**
 * Create GSAP matchMedia context for responsive animations
 */
export function createResponsiveContext() {
  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: '(min-width: 769px)',
      isMobile: '(max-width: 768px)',
      reducedMotion: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const { isDesktop, isMobile, reducedMotion } = context.conditions;
      return { isDesktop, isMobile, reducedMotion };
    }
  );

  return mm;
}

export { gsap, ScrollTrigger };
