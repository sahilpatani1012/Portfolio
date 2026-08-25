/* ═══════════════════════════════════════════════════════════
   RAIL — section nav, scrollspy, status-bar clock
   ═══════════════════════════════════════════════════════════ */

import { ScrollTrigger, scrollTo } from '../animations/gsapSetup.js';
import { $, $$, pad } from '../utils/helpers.js';

export function initRail() {
  const links = $$('[data-rail]');

  // Anchor navigation through Lenis
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      scrollTo(target, { offset: -52 });
      history.replaceState(null, '', id);
    });
  });

  // Scrollspy
  links.forEach((link) => {
    const id = link.getAttribute('href');
    const section = document.querySelector(id);
    if (!section) return;

    const activate = () => {
      links.forEach((l) => l.classList.toggle('on', l === link));
    };

    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onEnter: activate,
      onEnterBack: activate,
    });
  });
}

export function initClock() {
  const el = $('#bar-clock');
  if (!el) return;

  const tick = () => {
    // Always render Sahil's local time (IST), not the visitor's.
    const now = new Date();
    const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
    el.textContent = `${pad(ist.getHours())}:${pad(ist.getMinutes())}:${pad(ist.getSeconds())}`;
  };

  tick();
  setInterval(tick, 1000);
}
