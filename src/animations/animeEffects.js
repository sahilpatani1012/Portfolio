/* ═══════════════════════════════════════════════════════════
   ANIME EFFECTS — Anime.js micro-interactions & SVG
   ═══════════════════════════════════════════════════════════ */

import anime from 'animejs';
import { prefersReducedMotion, $, $$ } from '../utils/helpers.js';

/**
 * Initialize anime.js driven effects
 */
export function initAnimeEffects() {
  if (prefersReducedMotion()) return;

  initTextScramble();
  initSkillIconGlow();
  initTimelineDotPulse();
  initSocialIconHover();
}

/* ─── Text Scramble ─── */
function initTextScramble() {
  const tagline = document.querySelector('.hero-tagline');
  if (!tagline) return;

  const original = tagline.textContent;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
  let hasPlayed = false;

  // Observe when hero becomes visible (after preloader)
  const observer = new MutationObserver((mutations) => {
    if (hasPlayed) return;

    // Check if preloader is removed / hero is visible
    if (!document.getElementById('preloader') || document.querySelector('.hero-content')?.style.opacity === '1') {
      hasPlayed = true;
      observer.disconnect();

      // Wait a beat after hero entrance
      setTimeout(() => scrambleText(tagline, original, chars), 2000);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true, attributes: true });

  // Fallback: play after 5s regardless
  setTimeout(() => {
    if (!hasPlayed) {
      hasPlayed = true;
      observer.disconnect();
      scrambleText(tagline, original, chars);
    }
  }, 5000);
}

function scrambleText(el, target, chars) {
  const len = target.length;
  let currentText = '';

  anime({
    targets: { progress: 0 },
    progress: 1,
    duration: 1200,
    easing: 'easeOutQuad',
    update: function (anim) {
      const progress = anim.progress / 100;
      const resolved = Math.floor(progress * len);

      let text = '';
      for (let i = 0; i < len; i++) {
        if (i < resolved) {
          text += target[i];
        } else if (target[i] === ' ') {
          text += ' ';
        } else {
          text += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      el.textContent = text;
    },
    complete: () => {
      el.textContent = target;
    },
  });
}

/* ─── Skill Icon Glow on Hover ─── */
function initSkillIconGlow() {
  $$('.skill-card').forEach((card) => {
    const icon = card.querySelector('.skill-icon svg, .skill-icon');
    if (!icon) return;

    card.addEventListener('mouseenter', () => {
      anime({
        targets: icon,
        filter: [
          'drop-shadow(0 0 0px var(--accent-primary))',
          'drop-shadow(0 0 12px var(--accent-primary))',
        ],
        scale: [1, 1.1],
        duration: 400,
        easing: 'easeOutQuad',
      });
    });

    card.addEventListener('mouseleave', () => {
      anime({
        targets: icon,
        filter: 'drop-shadow(0 0 0px var(--accent-primary))',
        scale: 1,
        duration: 300,
        easing: 'easeOutQuad',
      });
    });
  });
}

/* ─── Timeline Dot Pulse ─── */
function initTimelineDotPulse() {
  $$('.timeline-dot').forEach((dot) => {
    // Create pulse ring
    const pulse = document.createElement('span');
    pulse.className = 'timeline-dot-pulse';
    dot.appendChild(pulse);

    anime({
      targets: pulse,
      scale: [1, 2.5],
      opacity: [0.6, 0],
      duration: 2000,
      easing: 'easeOutQuad',
      loop: true,
      delay: Math.random() * 1000,
    });
  });

  // Inject pulse styles
  const style = document.createElement('style');
  style.textContent = `
    .timeline-dot { position: relative; }
    .timeline-dot-pulse {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid var(--accent-primary);
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

/* ─── Social Icon Hover Micro ─── */
function initSocialIconHover() {
  $$('.social-link').forEach((link) => {
    const icon = link.querySelector('svg') || link;

    link.addEventListener('mouseenter', () => {
      anime({
        targets: icon,
        translateY: [0, -4, 0],
        duration: 500,
        easing: 'easeOutElastic(1, .5)',
      });
    });
  });
}
