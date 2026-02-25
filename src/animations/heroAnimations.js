/* ═══════════════════════════════════════════════════════════
   HERO ANIMATIONS — Hero entrance timeline
   ═══════════════════════════════════════════════════════════ */

import { gsap, ScrollTrigger } from './gsapSetup.js';
import { splitHeroTitle } from '../utils/splitText.js';
import { prefersReducedMotion } from '../utils/helpers.js';

/**
 * Initialize hero entrance animations
 * Called after preloader completes
 */
export function initHeroAnimations() {
  const canvas = document.getElementById('hero-canvas');
  const tagline = document.getElementById('hero-tagline');
  const title = document.getElementById('hero-title');
  const subtitle = document.getElementById('hero-subtitle');
  const ctas = document.getElementById('hero-ctas');
  const scrollIndicator = document.getElementById('scroll-indicator');

  if (prefersReducedMotion()) {
    // Simple fade in for reduced motion
    gsap.set([tagline, subtitle, ctas, scrollIndicator], { opacity: 1 });
    return;
  }

  // Split hero title into chars
  const chars = splitHeroTitle(title);

  // Create GSAP timeline
  const tl = gsap.timeline({ delay: 0.2 });

  // 1. Canvas fade in
  if (canvas) {
    tl.fromTo(
      canvas,
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: 'power2.out' },
      0
    );
  }

  // 2. Tagline text scramble/reveal
  tl.to(
    tagline,
    {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    },
    0.3
  );

  // 3. Hero title chars stagger in
  tl.fromTo(
    chars,
    {
      y: '120%',
      rotateX: -90,
    },
    {
      y: '0%',
      rotateX: 0,
      duration: 0.8,
      stagger: 0.03,
      ease: 'power3.out',
    },
    0.6
  );

  // 4. Subtitle fade up
  tl.to(
    subtitle,
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    },
    1.2
  );

  // Set initial state for subtitle
  gsap.set(subtitle, { y: 30 });

  // 5. CTA buttons slide up
  tl.to(
    ctas,
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
    },
    1.5
  );
  gsap.set(ctas, { y: 20 });

  // 6. Scroll indicator fade in + bounce
  tl.to(
    scrollIndicator,
    {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    },
    2.0
  );

  // Infinite bounce on scroll indicator arrow
  gsap.to('.scroll-indicator-arrow', {
    y: 8,
    repeat: -1,
    yoyo: true,
    duration: 0.8,
    ease: 'power1.inOut',
    delay: 2.5,
  });

  // Hide scroll indicator on first scroll
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    onLeave: () => {
      gsap.to(scrollIndicator, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      });
    },
    onEnterBack: () => {
      gsap.to(scrollIndicator, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    },
  });
}
