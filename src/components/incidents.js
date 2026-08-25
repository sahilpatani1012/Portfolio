/* ═══════════════════════════════════════════════════════════
   INCIDENTS — expandable, deep-linkable report rows
   ═══════════════════════════════════════════════════════════ */

import { $, $$, copy, toast, reduced } from '../utils/helpers.js';
import { ScrollTrigger, scrollTo } from '../animations/gsapSetup.js';

const isIncidentId = (id) => /^inc-\d{3}$/.test(id);

function setOpen(inc, open) {
  const head = inc.querySelector('.inc-head');
  inc.classList.toggle('open', open);
  head?.setAttribute('aria-expanded', String(open));
  // The row's height just changed — every trigger below it is now stale.
  setTimeout(() => ScrollTrigger.refresh(), 340);
}

/** Open one incident (closing nothing else) and bring it into view. */
export function openIncident(id, { scroll = true } = {}) {
  const inc = document.getElementById(id);
  if (!inc || !inc.hasAttribute('data-inc')) return false;

  setOpen(inc, true);
  if (scroll) {
    // Wait for the expand transition to commit so we scroll to the final position.
    setTimeout(() => scrollTo(inc, { offset: -80 }), reduced() ? 0 : 220);
  }
  return true;
}

export function initIncidents() {
  const incs = $$('[data-inc]');

  incs.forEach((inc) => {
    const head = inc.querySelector('.inc-head');
    if (!head) return;

    head.addEventListener('click', () => {
      const open = !inc.classList.contains('open');
      setOpen(inc, open);

      // Reflect state in the URL so the row is linkable, without adding
      // history entries for every toggle.
      if (open && inc.id) {
        history.replaceState(null, '', `#${inc.id}`);
      } else if (!open && location.hash === `#${inc.id}`) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    });
  });

  // Permalink buttons inside each report.
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-permalink]');
    if (!btn) return;
    e.preventDefault();
    const url = `${location.origin}${location.pathname}#${btn.dataset.permalink}`;
    const ok = await copy(url);
    toast(ok ? 'Link copied' : url);
  });

  // Arriving with #inc-00N in the URL opens that report directly.
  const fromHash = () => {
    const id = location.hash.slice(1);
    if (isIncidentId(id)) openIncident(id);
  };

  window.addEventListener('hashchange', fromHash);

  if (isIncidentId(location.hash.slice(1))) {
    // Let layout and the reveal timeline settle before scrolling.
    setTimeout(fromHash, 260);
  }
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
