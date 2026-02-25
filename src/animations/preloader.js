/* ═══════════════════════════════════════════════════════════
   PRELOADER — Loading screen animation
   ═══════════════════════════════════════════════════════════ */

import anime from 'animejs';
import { gsap } from './gsapSetup.js';
import { prefersReducedMotion } from '../utils/helpers.js';

/**
 * Initialize and run the preloader animation
 * @returns {Promise} Resolves when preloader exit is complete
 */
export function initPreloader() {
  return new Promise((resolve) => {
    const preloader = document.getElementById('preloader');
    const nameEl = document.getElementById('preloader-name');
    const counterEl = document.getElementById('preloader-counter');
    const barEl = document.getElementById('preloader-bar');
    const topHalf = document.getElementById('preloader-top');
    const bottomHalf = document.getElementById('preloader-bottom');

    if (!preloader || prefersReducedMotion()) {
      // Skip preloader for reduced motion
      if (preloader) preloader.remove();
      resolve();
      return;
    }

    // Split name into chars
    const nameText = nameEl.textContent;
    nameEl.innerHTML = '';
    const chars = [];
    for (const char of nameText) {
      if (char === ' ') {
        nameEl.appendChild(document.createTextNode(' '));
      } else {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        nameEl.appendChild(span);
        chars.push(span);
      }
    }

    // Counter animation with Anime.js
    const counterObj = { value: 0 };
    anime({
      targets: counterObj,
      value: 100,
      round: 1,
      easing: 'easeOutExpo',
      duration: 2200,
      update: () => {
        counterEl.textContent = counterObj.value;
      },
    });

    // Letter stagger reveal with Anime.js
    anime({
      targets: chars,
      translateY: ['100%', '0%'],
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 800,
      delay: anime.stagger(50, { start: 300 }),
    });

    // Progress bar with GSAP
    gsap.to(barEl, {
      width: '100%',
      duration: 2.2,
      ease: 'power2.inOut',
    });

    // Exit animation after content loads
    const exitDelay = 2600;

    setTimeout(() => {
      // GSAP timeline for split exit
      const exitTl = gsap.timeline({
        onComplete: () => {
          preloader.remove();
          resolve();
        },
      });

      // Fade out content first
      exitTl.to([nameEl, counterEl, barEl.parentElement], {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      });

      // Split halves
      exitTl.to(
        topHalf,
        {
          yPercent: -100,
          duration: 0.8,
          ease: 'power4.inOut',
        },
        '-=0.1'
      );

      exitTl.to(
        bottomHalf,
        {
          yPercent: 100,
          duration: 0.8,
          ease: 'power4.inOut',
        },
        '<'
      );
    }, exitDelay);
  });
}
