/* ═══════════════════════════════════════════════════════════
   GSAP + LENIS
   ═══════════════════════════════════════════════════════════ */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { reduced } from '../utils/helpers.js';

gsap.registerPlugin(ScrollTrigger);

gsap.defaults({ ease: 'power3.out', duration: 0.8 });

let lenis = null;

export function initSmoothScroll() {
  if (reduced()) return null;

  lenis = new Lenis({
    lerp: 0.085,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis() {
  return lenis;
}

export function scrollTo(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  if (lenis) {
    lenis.scrollTo(el, { offset: opts.offset ?? -60, duration: opts.duration ?? 1.1 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? -60);
    window.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' });
  }
}

/** Pause/resume — used while the boot screen is up. */
export function stopScroll() { lenis?.stop(); document.body.style.overflow = 'hidden'; }
export function startScroll() { lenis?.start(); document.body.style.overflow = ''; }

export { gsap, ScrollTrigger };
