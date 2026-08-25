/* ═══════════════════════════════════════════════════════════
   REVEAL — scroll-linked entrances
   Deliberately restrained: masks and short rises. Nothing spins.
   ═══════════════════════════════════════════════════════════ */

import { gsap, ScrollTrigger } from './gsapSetup.js';
import { $$, reduced } from '../utils/helpers.js';

export function initReveal() {
  if (reduced()) {
    // CSS already neutralises the primitives under reduced-motion; this just
    // guarantees it if the query flips after load.
    gsap.set('[data-mask] > *, [data-fade], [data-rise]', { opacity: 1, y: 0 });
    return;
  }

  // ── Hero: runs immediately after boot, not on scroll ──
  const hero = document.getElementById('status');
  if (hero) {
    const tl = gsap.timeline({ delay: 0.12 });

    tl.to(hero.querySelectorAll('[data-mask] > *'), {
      y: '0%', duration: 1.0, stagger: 0.07, ease: 'expo.out',
    }, 0);

    tl.to(hero.querySelectorAll('[data-rise]'), {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
    }, 0.28);

    tl.to(hero.querySelectorAll('[data-fade]'), {
      opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out',
    }, 0.42);

    tl.from(hero.querySelector('.hero-slug .rule'), {
      scaleX: 0, transformOrigin: 'left center', duration: 0.9, ease: 'expo.out',
    }, 0.1);
  }

  // ── Everything below the fold ──
  const scope = (sel) => $$(sel).filter((el) => !hero?.contains(el));

  scope('[data-mask]').forEach((el) => {
    gsap.to(el.children, {
      y: '0%', duration: 0.95, stagger: 0.06, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  scope('[data-rise]').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  scope('[data-fade]').forEach((el) => {
    gsap.to(el, {
      opacity: 1, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // ── Section headers: wipe in from the left ──
  $$('.sec-head').forEach((head) => {
    gsap.fromTo(head,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: head, start: 'top 88%' },
      });
  });

  // ── Deployment panels: lift in ──
  $$('.dep').forEach((dep) => {
    gsap.from(dep, {
      opacity: 0, y: 24, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: dep, start: 'top 86%' },
    });
  });

  // ── Incident rows: quick cascade ──
  const incs = $$('.inc');
  if (incs.length) {
    gsap.from(incs, {
      opacity: 0, y: 14, duration: 0.55, stagger: 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: incs[0], start: 'top 86%' },
    });
  }

  // ── Changelog lines ──
  $$('.log-lines').forEach((box) => {
    gsap.from(box.children, {
      opacity: 0, x: -10, duration: 0.55, stagger: 0.05, ease: 'power3.out',
      scrollTrigger: { trigger: box, start: 'top 85%' },
    });
  });

  // ── Shipped table rows ──
  $$('.ship tr').forEach((row, i) => {
    gsap.from(row, {
      opacity: 0, y: 10, duration: 0.5, delay: (i % 3) * 0.04, ease: 'power3.out',
      scrollTrigger: { trigger: row, start: 'top 92%' },
    });
  });

  ScrollTrigger.refresh();
}
