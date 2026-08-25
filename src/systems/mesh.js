/* ═══════════════════════════════════════════════════════════
   MESH — the stack drawn as a real service topology.
   Wires are computed from live DOM geometry, so the diagram
   stays correct at any width without hard-coded coordinates.
   ═══════════════════════════════════════════════════════════ */

import { $, $$, throttleRAF, reduced } from '../utils/helpers.js';

const NS = 'http://www.w3.org/2000/svg';

export function initMesh() {
  const mesh = $('#mesh');
  const svg = $('#mesh-wires');
  const keyEl = $('#mesh-key');
  const valEl = $('#mesh-val');
  if (!mesh || !svg) return;

  const nodes = $$('.node', mesh);
  const byId = new Map(nodes.map((n) => [n.dataset.node, n]));

  const DEFAULT_KEY = 'mesh';
  const DEFAULT_VAL = valEl?.textContent || '';

  /* ─── Draw ─── */
  function draw() {
    const box = mesh.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.setAttribute('width', box.width);
    svg.setAttribute('height', box.height);
    svg.innerHTML = '';

    nodes.forEach((from) => {
      const targets = (from.dataset.to || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (!targets.length) return;

      const a = from.getBoundingClientRect();
      const ax = a.right - box.left;
      const ay = a.top + a.height / 2 - box.top;

      targets.forEach((id) => {
        const to = byId.get(id);
        if (!to) return;

        const b = to.getBoundingClientRect();
        const bx = b.left - box.left;
        const by = b.top + b.height / 2 - box.top;

        // Horizontal-ease bezier — reads like a routed wire, not a swoosh.
        const dx = Math.max(24, (bx - ax) * 0.55);
        const d = `M${ax},${ay} C${ax + dx},${ay} ${bx - dx},${by} ${bx},${by}`;

        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', d);
        path.dataset.from = from.dataset.node;
        path.dataset.to = id;
        svg.appendChild(path);
      });
    });
  }

  /* ─── Light a node's path ─── */
  function light(node) {
    const id = node.dataset.node;
    const targets = (node.dataset.to || '').split(',').map((s) => s.trim()).filter(Boolean);

    // Walk downstream so hovering React lights the whole path to Mongo.
    const reach = new Set([id]);
    const queue = [...targets];
    while (queue.length) {
      const next = queue.shift();
      if (reach.has(next)) continue;
      reach.add(next);
      const el = byId.get(next);
      if (el?.dataset.to) {
        queue.push(...el.dataset.to.split(',').map((s) => s.trim()).filter(Boolean));
      }
    }

    nodes.forEach((n) => {
      const on = reach.has(n.dataset.node);
      n.classList.toggle('lit', on);
      n.classList.toggle('dim', !on);
    });

    $$('path', svg).forEach((p) => {
      const on = reach.has(p.dataset.from) && reach.has(p.dataset.to);
      p.classList.toggle('lit', on);
      p.classList.toggle('dim', !on);
    });

    if (keyEl && valEl) {
      keyEl.textContent = node.textContent.trim();
      valEl.textContent = node.dataset.info || '';
    }
  }

  function clear() {
    nodes.forEach((n) => n.classList.remove('lit', 'dim'));
    $$('path', svg).forEach((p) => p.classList.remove('lit', 'dim'));
    if (keyEl && valEl) {
      keyEl.textContent = DEFAULT_KEY;
      valEl.textContent = DEFAULT_VAL;
    }
  }

  nodes.forEach((n) => {
    n.addEventListener('pointerenter', () => light(n));
    n.addEventListener('focus', () => light(n));
    n.addEventListener('click', (e) => { e.preventDefault(); light(n); });
  });

  mesh.addEventListener('pointerleave', clear);
  mesh.addEventListener('focusout', (e) => {
    if (!mesh.contains(e.relatedTarget)) clear();
  });

  /* ─── Keep geometry honest ─── */
  draw();

  const redraw = throttleRAF(draw);
  window.addEventListener('resize', redraw, { passive: true });

  if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(mesh);

  // Fonts land after first paint and shift node widths — redraw once settled.
  document.fonts?.ready.then(redraw);

  // Horizontal scroll on narrow screens moves nodes relative to the SVG.
  $('.mesh-scroll')?.addEventListener('scroll', redraw, { passive: true });

  if (!reduced()) {
    // Draw the wires in the first time the section is reached.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      redraw();
      $$('path', svg).forEach((p, i) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        p.animate(
          [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
          { duration: 900, delay: i * 26, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' }
        );
        setTimeout(() => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }, 900 + i * 26 + 40);
      });
    }, { threshold: 0.2 });
    io.observe(mesh);
  }
}
