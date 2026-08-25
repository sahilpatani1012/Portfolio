/* ═══════════════════════════════════════════════════════════
   CURSOR — crosshair + trailing ring + contextual label
   ═══════════════════════════════════════════════════════════ */

import { gsap } from '../animations/gsapSetup.js';
import { $, coarse, reduced } from '../utils/helpers.js';

export function initCursor() {
  if (coarse() || reduced()) return;

  const cur = $('#cur');
  const ring = $('#cur-ring');
  const tag = $('#cur-tag');
  if (!cur || !ring) return;

  const setX = gsap.quickSetter(cur, 'x', 'px');
  const setY = gsap.quickSetter(cur, 'y', 'px');
  const setRX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' });
  const setRY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' });

  let visible = false;

  window.addEventListener('mousemove', (e) => {
    if (!visible) {
      visible = true;
      gsap.to([cur, ring], { opacity: 1, duration: 0.25 });
    }
    setX(e.clientX);
    setY(e.clientY);
    setRX(e.clientX);
    setRY(e.clientY);
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    visible = false;
    gsap.to([cur, ring], { opacity: 0, duration: 0.2 });
  });

  gsap.set([cur, ring], { opacity: 0 });

  // Contextual label — any element carrying data-cur, plus all interactives.
  const INTERACTIVE = 'a, button, input, textarea, [data-cur], .node, .inc-head';

  document.addEventListener('pointerover', (e) => {
    const hit = e.target.closest(INTERACTIVE);
    if (!hit) return;
    document.body.classList.add('hot');
    const label = hit.dataset.cur || '';
    tag.textContent = label;
  });

  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(INTERACTIVE) && !e.relatedTarget?.closest?.(INTERACTIVE)) {
      document.body.classList.remove('hot');
      tag.textContent = '';
    }
  });

  document.addEventListener('mousedown', () => gsap.to(ring, { scale: 0.82, duration: 0.14 }));
  document.addEventListener('mouseup',   () => gsap.to(ring, { scale: 1, duration: 0.24 }));
}
