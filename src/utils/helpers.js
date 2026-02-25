/* ═══════════════════════════════════════════════════════════
   HELPERS — Utility functions
   ═══════════════════════════════════════════════════════════ */

/** Linear interpolation */
export function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/** Clamp value between min and max */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Map value from one range to another */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/** Debounce function calls */
export function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Throttle function calls */
export function throttle(fn, limit = 16) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

/** Check if prefers-reduced-motion is enabled */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Check if device has fine pointer (mouse) */
export function hasFineCursor() {
  return window.matchMedia('(pointer: fine)').matches;
}

/** Check if mobile viewport */
export function isMobile() {
  return window.innerWidth <= 768;
}

/** Get element's center coordinates */
export function getCenter(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

/** Random float between min and max */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/** Random integer between min and max (inclusive) */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Select single element */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/** Select all elements */
export function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}
