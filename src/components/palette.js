/* ═══════════════════════════════════════════════════════════
   COMMAND PALETTE — ⌘K / Ctrl-K
   The registry is read out of the DOM (rail links, deployment
   panels, incident rows) so it cannot drift out of sync with
   the page; only true actions are hard-coded.
   ═══════════════════════════════════════════════════════════ */

import { gsap, scrollTo, stopScroll, startScroll } from '../animations/gsapSetup.js';
import { $, $$, copy, toast, reduced } from '../utils/helpers.js';
import { openIncident } from './incidents.js';

const RESUME = '/resume.pdf';

const isMac = /mac|iphone|ipad|ipod/i.test(
  navigator.userAgentData?.platform || navigator.platform || navigator.userAgent
);

const esc = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ─────────── fuzzy match ───────────
   Subsequence match with bonuses for word starts and runs, so
   "crm" beats "c…r…m" scattered across a label.                */

export function fuzzy(query, text) {
  if (!query) return { score: 0, hits: [] };

  const t = text.toLowerCase();
  const q = query.toLowerCase();
  const hits = [];
  let at = 0;
  let score = 0;
  let run = 0;

  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    const found = t.indexOf(ch, at);
    if (found === -1) return null;

    let bonus = 1;
    if (found === 0) bonus += 10;
    else if (/[\s\-_/·.()]/.test(t[found - 1])) bonus += 7;

    if (found === at && qi > 0) { run += 1; bonus += 3 + run; }
    else run = 0;

    score += bonus;
    hits.push(found);
    at = found + 1;
  }

  // Shorter labels win ties — "Stack" should beat "Billing Mesh — 3 Gateways".
  return { score: score - t.length * 0.06, hits };
}

export function mark(text, hits) {
  if (!hits.length) return esc(text);
  const set = new Set(hits);
  let out = '';
  let open = false;
  for (let i = 0; i < text.length; i++) {
    const on = set.has(i);
    if (on && !open) { out += '<mark>'; open = true; }
    if (!on && open) { out += '</mark>'; open = false; }
    out += esc(text[i]);
  }
  return open ? out + '</mark>' : out;
}


/* Kind icons are inline SVG, not glyphs — the shipped font subset is latin
   only, so anything above U+2100 would silently fall back to a system face. */
const ICONS = {
  section:  '<path d="M2.5 3h7M2.5 6h7M2.5 9h4"/>',
  deploy:   '<rect x="2.5" y="2.5" width="7" height="7" rx="1"/>',
  incident: '<path d="M6 2.5v3.6"/><circle cx="6" cy="9" r=".7" fill="currentColor" stroke="none"/>',
  download: '<path d="M6 2v5.4M3.9 5.6 6 7.7l2.1-2.1M2.5 10h7"/>',
  copy:     '<rect x="4.2" y="4.2" width="5.3" height="5.3" rx="1"/><path d="M7.4 2.5H2.5v4.9"/>',
  mail:     '<rect x="2" y="3.2" width="8" height="5.6" rx="1"/><path d="m2.5 3.8 3.5 2.5 3.5-2.5"/>',
  link:     '<path d="M4 8 8.2 3.8M5.2 3.8h3v3"/>',
  term:     '<path d="m3 4 2 2-2 2M6.6 8.6h3"/>',
};

export const icon = (name) =>
  `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.section}</svg>`;

/* ─────────── registry ─────────── */

function buildRegistry() {
  const items = [];

  // Sections — straight off the rail, so adding a section adds a command.
  $$('[data-rail]').forEach((link) => {
    const id = link.getAttribute('href');
    const label = link.querySelector('.lbl')?.textContent?.trim();
    const num = link.querySelector('span')?.textContent?.trim();
    if (!id || !label) return;
    items.push({
      group: 'Go to',
      icon: 'section',
      label,
      hint: num,
      terms: `section ${id.slice(1)}`,
      run: () => scrollTo(id, { offset: -52 }),
    });
  });

  // Deployments — read the name off each panel header.
  $$('.dep').forEach((dep) => {
    const name = dep.querySelector('.dep-head .nm')?.textContent?.trim();
    const idx = dep.querySelector('.dep-head .idx')?.textContent?.trim();
    const org = dep.querySelector('.dep-head .org')?.textContent?.trim() || '';
    if (!name || !dep.id) return;
    items.push({
      group: 'Deployments',
      icon: 'deploy',
      label: name.replace(/\s*—\s*/g, ' — '),
      hint: idx,
      terms: `${org} deployment project ${dep.id}`,
      run: () => scrollTo(dep, { offset: -70 }),
    });
  });

  // Incidents — open the report, not just scroll near it.
  $$('[data-inc]').forEach((inc) => {
    const id = inc.id;
    const name = inc.querySelector('.inc-name')?.textContent?.trim();
    const sev = inc.querySelector('.pill')?.textContent?.trim();
    if (!id || !name) return;
    items.push({
      group: 'Incidents',
      icon: 'incident',
      label: name,
      hint: `${id.toUpperCase()} · ${sev}`,
      terms: `incident rca postmortem ${id} ${sev}`,
      run: () => openIncident(id),
    });
  });

  // Actions.
  items.push(
    {
      group: 'Actions',
      icon: 'download',
      label: 'Download CV (PDF)',
      hint: '1 page',
      terms: 'resume cv pdf download hire',
      run: () => {
        const a = document.createElement('a');
        a.href = RESUME;
        a.download = 'Sahil-Patani-Backend-Engineer.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast('Downloading CV');
      },
    },
    {
      group: 'Actions',
      icon: 'copy',
      label: 'Copy email address',
      hint: 'spatani9@gmail.com',
      terms: 'mail contact reach clipboard',
      run: async () => {
        const ok = await copy('spatani9@gmail.com');
        toast(ok ? 'Email copied' : 'Copy blocked by browser');
      },
    },
    {
      group: 'Actions',
      icon: 'copy',
      label: 'Copy phone number',
      hint: '+91 93095 50866',
      terms: 'call mobile clipboard',
      run: async () => {
        const ok = await copy('+919309550866');
        toast(ok ? 'Number copied' : 'Copy blocked by browser');
      },
    },
    {
      group: 'Actions',
      icon: 'term',
      label: 'Focus the console',
      hint: 'terminal',
      terms: 'terminal shell type command repl',
      run: () => {
        scrollTo('#connect', { offset: -52 });
        setTimeout(() => $('#term-input')?.focus(), reduced() ? 0 : 700);
      },
    },
    {
      group: 'Actions',
      icon: 'mail',
      label: 'Write a message',
      hint: 'form',
      terms: 'contact email transmit send hire',
      run: () => {
        scrollTo('#connect', { offset: -52 });
        setTimeout(() => $('#f-name')?.focus(), reduced() ? 0 : 700);
      },
    },
    {
      group: 'Links',
      icon: 'link',
      label: 'GitHub',
      hint: 'sahilpatani1012',
      terms: 'code repos source',
      run: () => window.open('https://github.com/sahilpatani1012', '_blank', 'noopener,noreferrer'),
    },
    {
      group: 'Links',
      icon: 'link',
      label: 'LinkedIn',
      hint: 'sahil-patani',
      terms: 'profile network hire',
      run: () => window.open('https://www.linkedin.com/in/sahil-patani-2721231b8/', '_blank', 'noopener,noreferrer'),
    },
    {
      group: 'Links',
      icon: 'link',
      label: 'LeetCode',
      hint: '300+ solved',
      terms: 'dsa algorithms problems',
      run: () => window.open('https://leetcode.com/u/spatani9/', '_blank', 'noopener,noreferrer'),
    }
  );

  return items.map((it, i) => ({ ...it, uid: `pal-opt-${i}` }));
}

/* ─────────── ranking ───────────
   Pure, so it can be exercised without a DOM. Label matches always
   outrank hidden-term matches, and only label matches highlight.   */

export function rank(query, registry) {
  const q = query.trim();
  if (!q) return registry.map((item) => ({ item, hits: [], score: 0 }));

  const scored = [];
  for (const item of registry) {
    const onLabel = fuzzy(q, item.label);
    if (onLabel) {
      scored.push({ item, hits: onLabel.hits, score: onLabel.score + 20 });
      continue;
    }
    const alt = fuzzy(q, `${item.terms || ''} ${item.hint || ''}`);
    if (alt) scored.push({ item, hits: [], score: alt.score });
  }
  return scored.sort((a, b) => b.score - a.score);
}

/* ─────────── component ─────────── */

export function initPalette() {
  const back = $('#pal-back');
  const pal = $('#pal');
  const input = $('#pal-input');
  const list = $('#pal-list');
  const count = $('#pal-count');
  if (!back || !pal || !input || !list) return;

  // Platform-correct shortcut label.
  const kbd = $('#pal-kbd');
  if (kbd) kbd.textContent = isMac ? '⌘K' : 'Ctrl K';

  const behind = [$('.bar'), $('#rail'), $('.shell')].filter(Boolean);
  const setInert = (on) => behind.forEach((el) => { el.inert = on; });

  const registry = buildRegistry();
  let results = [];
  let sel = 0;
  let open = false;
  let lastFocus = null;

  /* ── render ── */
  function render() {
    if (!results.length) {
      list.innerHTML =
        `<div class="pal-empty">No match for <b>${esc(input.value.trim())}</b></div>`;
      if (count) count.textContent = '0 results';
      input.removeAttribute('aria-activedescendant');
      return;
    }

    const ordered = input.value.trim()
      ? [{ group: null, rows: results }]
      : groupRows(results);

    let html = '';
    let flat = 0;
    for (const bucket of ordered) {
      if (bucket.group) html += `<div class="pal-group" role="presentation">${esc(bucket.group)}</div>`;
      for (const r of bucket.rows) {
        const on = flat === sel;
        html +=
          `<div class="pal-row" role="option" id="${r.item.uid}" data-i="${flat}" aria-selected="${on}">` +
          `<span class="k">${icon(r.item.icon)}</span>` +
          `<span class="l">${mark(r.item.label, r.hits)}</span>` +
          (r.item.hint ? `<span class="h">${esc(r.item.hint)}</span>` : '') +
          `</div>`;
        flat++;
      }
    }

    list.innerHTML = html;
    if (count) count.textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;
    input.setAttribute('aria-activedescendant', results[sel]?.item.uid || '');
  }

  function groupRows(rows) {
    const out = [];
    let current = null;
    for (const r of rows) {
      if (!current || current.group !== r.item.group) {
        current = { group: r.item.group, rows: [] };
        out.push(current);
      }
      current.rows.push(r);
    }
    return out;
  }

  function move(delta) {
    if (!results.length) return;
    sel = (sel + delta + results.length) % results.length;
    render();
    list.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: 'nearest' });
  }

  function refresh() {
    results = rank(input.value, registry);
    sel = 0;
    render();
    list.scrollTop = 0;
  }

  /* ── open / close ── */
  function show() {
    if (open) return;
    open = true;
    lastFocus = document.activeElement;
    document.body.classList.add('pal-on');
    setInert(true);
    pal.setAttribute('aria-hidden', 'false');

    input.value = '';
    refresh();
    stopScroll();

    const d = reduced() ? 0 : 0.18;
    gsap.to(back, { opacity: 1, duration: d, ease: 'power2.out' });
    gsap.to(pal, { opacity: 1, y: 0, duration: d, ease: 'power3.out' });

    input.focus();
  }

  function hide() {
    if (!open) return;
    open = false;
    document.body.classList.remove('pal-on');
    setInert(false);
    pal.setAttribute('aria-hidden', 'true');
    startScroll();

    const d = reduced() ? 0 : 0.14;
    gsap.to(back, { opacity: 0, duration: d, ease: 'power2.in' });
    gsap.to(pal, { opacity: 0, y: -8, duration: d, ease: 'power2.in' });

    // Send focus back where it came from, unless that element is gone.
    if (lastFocus?.isConnected) lastFocus.focus();
    else document.body.focus?.();
  }

  function runSelected() {
    const chosen = results[sel];
    if (!chosen) return;
    hide();
    // Let the close animation commit before scrolling, or the two fight.
    setTimeout(() => chosen.item.run(), reduced() ? 0 : 120);
  }

  // xPercent (not a CSS translate) so GSAP keeps the horizontal centring
  // correct once it takes ownership of the transform.
  gsap.set(pal, { xPercent: -50, x: 0, y: -8 });

  /* ── wiring ── */
  input.addEventListener('input', refresh);

  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); move(1); break;
      case 'ArrowUp':   e.preventDefault(); move(-1); break;
      case 'Tab':       e.preventDefault(); move(e.shiftKey ? -1 : 1); break;
      case 'Home':      if (results.length) { e.preventDefault(); sel = 0; render(); } break;
      case 'End':       if (results.length) { e.preventDefault(); sel = results.length - 1; render(); } break;
      case 'Enter':     e.preventDefault(); runSelected(); break;
      case 'Escape':    e.preventDefault(); hide(); break;
      default: break;
    }
  });

  list.addEventListener('mousemove', (e) => {
    const row = e.target.closest('[data-i]');
    if (!row) return;
    const i = Number(row.dataset.i);
    if (i !== sel) { sel = i; render(); }
  });

  list.addEventListener('click', (e) => {
    const row = e.target.closest('[data-i]');
    if (!row) return;
    sel = Number(row.dataset.i);
    runSelected();
  });

  back.addEventListener('click', hide);
  $('#pal-open')?.addEventListener('click', show);

  // Global shortcut. Cmd/Ctrl-K everywhere; "/" only when not already typing.
  window.addEventListener('keydown', (e) => {
    const mod = isMac ? e.metaKey : e.ctrlKey;

    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      open ? hide() : show();
      return;
    }

    if (open && e.key === 'Escape') { e.preventDefault(); hide(); return; }

    if (e.key === '/' && !open && !mod && !e.altKey) {
      const el = document.activeElement;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      show();
    }
  });
}
