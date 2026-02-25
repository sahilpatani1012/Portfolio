/* ═══════════════════════════════════════════════════════════
   HOVER EFFECTS — Interactive micro-interactions
   ═══════════════════════════════════════════════════════════ */

import { gsap } from './gsapSetup.js';
import { prefersReducedMotion, $, $$ } from '../utils/helpers.js';

/**
 * Initialize all hover-based effects
 */
export function initHoverEffects() {
  if (prefersReducedMotion()) return;

  initCardHoverLift();
  initProjectImageHover();
  initButtonRipple();
  initLinkUnderline();
}

/* ─── Card Hover Lift ─── */
function initCardHoverLift() {
  $$('.glass-card, .skill-card, .stat-card, .timeline-card').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -8,
        duration: 0.4,
        ease: 'power3.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        duration: 0.4,
        ease: 'power3.out',
      });
    });
  });
}

/* ─── Project Image Hover Scale ─── */
function initProjectImageHover() {
  $$('.project-image-wrap').forEach((wrap) => {
    const img = wrap.querySelector('.project-image');
    if (!img) return;

    wrap.addEventListener('mouseenter', () => {
      gsap.to(img, {
        scale: 1.05,
        duration: 0.6,
        ease: 'power3.out',
      });
    });

    wrap.addEventListener('mouseleave', () => {
      gsap.to(img, {
        scale: 1,
        duration: 0.6,
        ease: 'power3.out',
      });
    });
  });
}

/* ─── Button Ripple Effect ─── */
function initButtonRipple() {
  $$('.glass-button, .btn-primary, .btn-outline').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      btn.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          width: 0,
          height: 0,
          opacity: 0.5,
        },
        {
          width: 200,
          height: 200,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
          onComplete: () => ripple.remove(),
        }
      );
    });
  });

  // Inject ripple styles
  const style = document.createElement('style');
  style.textContent = `
    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

/* ─── Nav Link Underline Hover ─── */
function initLinkUnderline() {
  $$('.nav-link').forEach((link) => {
    const underline = document.createElement('span');
    underline.className = 'nav-link-underline';
    link.appendChild(underline);

    gsap.set(underline, { scaleX: 0, transformOrigin: 'left center' });

    link.addEventListener('mouseenter', () => {
      gsap.to(underline, {
        scaleX: 1,
        duration: 0.3,
        ease: 'power3.out',
        transformOrigin: 'left center',
      });
    });

    link.addEventListener('mouseleave', () => {
      gsap.to(underline, {
        scaleX: 0,
        duration: 0.3,
        ease: 'power3.in',
        transformOrigin: 'right center',
      });
    });
  });

  const style = document.createElement('style');
  style.textContent = `
    .nav-link { position: relative; }
    .nav-link-underline {
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--accent-primary);
      display: block;
    }
  `;
  document.head.appendChild(style);
}
