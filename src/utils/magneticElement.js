/* ═══════════════════════════════════════════════════════════
   MAGNETIC ELEMENT — Reusable magnetic hover effect
   ═══════════════════════════════════════════════════════════ */

import gsap from 'gsap';
import { hasFineCursor } from './helpers.js';

/**
 * Apply magnetic hover effect to an element
 * Element subtly follows cursor within its bounds
 * @param {HTMLElement} el - Target element
 * @param {Object} options - Configuration
 * @param {number} options.strength - Movement strength (0-1), default 0.3
 * @param {number} options.duration - Return duration, default 0.4
 */
export function createMagneticElement(el, options = {}) {
  if (!hasFineCursor()) return;

  const { strength = 0.3, duration = 0.4 } = options;

  const handleMouseMove = (e) => {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    gsap.to(el, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration,
      ease: 'elastic.out(1, 0.3)',
    });
  };

  el.addEventListener('mousemove', handleMouseMove);
  el.addEventListener('mouseleave', handleMouseLeave);

  // Return cleanup function
  return () => {
    el.removeEventListener('mousemove', handleMouseMove);
    el.removeEventListener('mouseleave', handleMouseLeave);
  };
}

/**
 * Apply magnetic effect to all elements with [data-magnetic]
 */
export function initMagneticElements() {
  if (!hasFineCursor()) return;

  const elements = document.querySelectorAll('[data-magnetic]');
  const cleanups = [];

  elements.forEach(el => {
    const cleanup = createMagneticElement(el);
    if (cleanup) cleanups.push(cleanup);
  });

  return cleanups;
}
