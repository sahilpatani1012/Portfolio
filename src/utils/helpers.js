/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const coarse = () =>
  window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900;

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
export const lerp  = (a, b, t) => a + (b - a) * t;
export const rand  = (min, max) => Math.random() * (max - min) + min;
export const randInt = (min, max) => Math.floor(rand(min, max + 1));
export const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** 13412 -> "13,412" */
export const commas = (n) => n.toLocaleString('en-US');

/** Two-digit pad */
export const pad = (n, len = 2) => String(n).padStart(len, '0');

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** rAF-throttled wrapper */
export function throttleRAF(fn) {
  let queued = false;
  let lastArgs;
  return (...args) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...lastArgs);
    });
  };
}

/** Fires cb once when el first enters the viewport. */
export function onceVisible(el, cb, rootMargin = '0px 0px -12% 0px') {
  if (!('IntersectionObserver' in window)) { cb(); return () => {}; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { cb(e.target); io.unobserve(e.target); }
    }
  }, { rootMargin, threshold: 0.15 });
  io.observe(el);
  return () => io.disconnect();
}

/** Deterministic pseudo-random from a string seed — stable sparklines per key. */
export function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Toast — returns immediately, hides itself. */
let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  const txt = document.getElementById('toast-msg');
  if (!el || !txt) return;
  txt.textContent = msg;
  el.classList.add('up');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('up'), 2200);
}

/** Clipboard with a graceful fallback for non-secure contexts. */
export async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
