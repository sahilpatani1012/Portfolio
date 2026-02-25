/* ═══════════════════════════════════════════════════════════
   CUSTOM CURSOR — Two-layer cursor with GSAP quickTo
   ═══════════════════════════════════════════════════════════ */

import { gsap } from '../animations/gsapSetup.js';
import { $, $$, hasFineCursor, prefersReducedMotion } from '../utils/helpers.js';

/**
 * Initialize custom cursor
 */
export function initCursor() {
  // Only on devices with a fine pointer
  if (!hasFineCursor() || prefersReducedMotion()) return;

  const outer = $('.cursor-outer');
  const inner = $('.cursor-inner');
  if (!outer || !inner) return;

  // Make cursors visible
  outer.style.opacity = '1';
  inner.style.opacity = '1';

  // GSAP quickTo for smooth following
  const outerX = gsap.quickTo(outer, 'x', { duration: 0.5, ease: 'power3.out' });
  const outerY = gsap.quickTo(outer, 'y', { duration: 0.5, ease: 'power3.out' });
  const innerX = gsap.quickTo(inner, 'x', { duration: 0.15, ease: 'power3.out' });
  const innerY = gsap.quickTo(inner, 'y', { duration: 0.15, ease: 'power3.out' });

  // Track mouse
  document.addEventListener('mousemove', (e) => {
    outerX(e.clientX);
    outerY(e.clientY);
    innerX(e.clientX);
    innerY(e.clientY);
  });

  // Hover state on interactive elements
  const hoverTargets = 'a, button, [data-cursor], input, textarea, .glass-button, .skill-card, .project-card, .social-link, .hamburger';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      outer.classList.add('cursor-hover');
      inner.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      outer.classList.remove('cursor-hover');
      inner.classList.remove('cursor-hover');
    }
  });

  // Click state
  document.addEventListener('mousedown', () => {
    outer.classList.add('cursor-click');
    inner.classList.add('cursor-click');
  });

  document.addEventListener('mouseup', () => {
    outer.classList.remove('cursor-click');
    inner.classList.remove('cursor-click');
  });

  // Hide when cursor leaves viewport
  document.addEventListener('mouseleave', () => {
    gsap.to([outer, inner], { opacity: 0, duration: 0.2 });
  });

  document.addEventListener('mouseenter', () => {
    gsap.to([outer, inner], { opacity: 1, duration: 0.2 });
  });

  // Inject extra cursor styles
  const style = document.createElement('style');
  style.textContent = `
    .cursor-outer.cursor-hover {
      width: 50px;
      height: 50px;
      border-color: var(--accent-primary);
      background: rgba(108, 99, 255, 0.05);
    }
    .cursor-inner.cursor-hover {
      width: 4px;
      height: 4px;
      background: var(--accent-primary);
    }
    .cursor-outer.cursor-click {
      transform: scale(0.8);
    }
    .cursor-inner.cursor-click {
      transform: scale(2);
    }
  `;
  document.head.appendChild(style);
}
