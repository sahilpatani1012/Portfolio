/* ═══════════════════════════════════════════════════════════
   INCIDENTS — expandable report rows
   ═══════════════════════════════════════════════════════════ */

import { $$, copy, toast } from '../utils/helpers.js';
import { ScrollTrigger } from '../animations/gsapSetup.js';

export function initIncidents() {
  $$('[data-inc]').forEach((inc) => {
    const head = inc.querySelector('.inc-head');
    if (!head) return;

    head.addEventListener('click', () => {
      const open = inc.classList.toggle('open');
      head.setAttribute('aria-expanded', String(open));
      // Row height changed — keep every downstream trigger honest.
      setTimeout(() => ScrollTrigger.refresh(), 320);
    });
  });
}

/** Click-to-copy on anything carrying data-copy. */
export function initCopy() {
  document.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-copy]');
    if (!el) return;
    e.preventDefault();
    const ok = await copy(el.dataset.copy);
    toast(ok ? `Copied ${el.dataset.copy}` : 'Copy blocked by browser');
  });
}
