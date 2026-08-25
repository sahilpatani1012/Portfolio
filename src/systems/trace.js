/* ═══════════════════════════════════════════════════════════
   TRACE — every deployment draws its own architecture, then
   fires a real request through it. The packet moves along the
   actual path geometry, lighting each hop as it arrives.
   ═══════════════════════════════════════════════════════════ */

import { $, $$, reduced, onceVisible } from '../utils/helpers.js';

const NS = 'http://www.w3.org/2000/svg';
export const W = 84;
export const H = 30;

/* ─────────── DIAGRAMS ───────────
   coords are top-left of each box inside a 400 × 190 viewBox   */

export const DIAGRAMS = {
  loop: {
    nodes: {
      client: { x: 8,   y: 26,  label: 'Client',  sub: 'reschedule' },
      api:    { x: 109, y: 26,  label: 'API',     sub: 'validate' },
      sqs:    { x: 210, y: 26,  label: 'SQS',     sub: 'enqueue', acc: true },
      worker: { x: 311, y: 26,  label: 'Worker',  sub: 'consume' },
      ledger: { x: 210, y: 126, label: 'Ledger',  sub: 'defer cancel', acc: true },
      db:     { x: 109, y: 126, label: 'MongoDB', sub: 'settle once' },
    },
    edges: [
      ['client', 'api',    '6ms'],
      ['api',    'sqs',    '4ms'],
      ['sqs',    'worker', '2ms'],
      ['worker', 'ledger', '11ms'],
      ['ledger', 'db',     '3ms'],
    ],
  },

  crm: {
    nodes: {
      svc:     { x: 10,  y: 76,  label: 'Service',  sub: 'single write' },
      adapter: { x: 148, y: 76,  label: 'Adapter',  sub: 'config-driven', acc: true },
      cratio:  { x: 300, y: 26,  label: 'Cratio',   sub: 'legacy' },
      arali:   { x: 300, y: 126, label: 'Arali',    sub: 'target', acc: true },
    },
    edges: [
      ['svc',     'adapter', '2ms'],
      ['adapter', 'cratio',  'dual'],
      ['adapter', 'arali',   'write'],
    ],
  },

  billing: {
    nodes: {
      core:    { x: 8,   y: 76,  label: 'Billing',  sub: 'interval' },
      stripe:  { x: 140, y: 14,  label: 'Stripe',   sub: 'gateway' },
      paypal:  { x: 140, y: 76,  label: 'PayPal',   sub: 'multi-month' },
      inhouse: { x: 140, y: 138, label: 'In-house', sub: 'gateway' },
      ledger:  { x: 300, y: 76,  label: 'Ledger',   sub: 'idempotent', acc: true },
    },
    edges: [
      ['core',    'stripe',  ''],
      ['core',    'paypal',  ''],
      ['core',    'inhouse', ''],
      ['stripe',  'ledger',  'reserve'],
      ['paypal',  'ledger',  'then'],
      ['inhouse', 'ledger',  'write'],
    ],
  },

  lms: {
    nodes: {
      ui:      { x: 8,   y: 76,  label: 'Angular', sub: 'admin' },
      gw:      { x: 106, y: 76,  label: 'API GW',  sub: 'RBAC' },
      node:    { x: 204, y: 22,  label: 'Node.js', sub: 'express' },
      fastapi: { x: 204, y: 130, label: 'FastAPI', sub: 'async' },
      redis:   { x: 302, y: 22,  label: 'Redis',   sub: 'TTL cache', acc: true },
      mongo:   { x: 302, y: 130, label: 'MongoDB', sub: 'indexed' },
    },
    edges: [
      ['ui',      'gw',      '3ms'],
      ['gw',      'node',    '2ms'],
      ['gw',      'fastapi', '2ms'],
      ['node',    'redis',   'hit 1ms'],
      ['fastapi', 'mongo',   '12ms'],
    ],
  },

  kanban: {
    nodes: {
      a:   { x: 8,   y: 14,  label: 'Client A', sub: 'edits' },
      b:   { x: 8,   y: 76,  label: 'Client B', sub: 'observes' },
      c:   { x: 8,   y: 138, label: 'Client C', sub: 'observes' },
      io:  { x: 152, y: 76,  label: 'Socket.io', sub: 'fan-out', acc: true },
      db:  { x: 300, y: 76,  label: 'MongoDB',  sub: 'optim. lock' },
    },
    edges: [
      ['a',  'io', '4ms'],
      ['io', 'db', '9ms'],
      ['io', 'b',  '<100ms'],
      ['io', 'c',  '<100ms'],
    ],
  },
};

/* ─────────── GEOMETRY ─────────── */

const cx = (n) => n.x + W / 2;
const cy = (n) => n.y + H / 2;

export function edgePath(a, b) {
  const ax = cx(a), ay = cy(a);
  const bx = cx(b), by = cy(b);

  // Same row → straight horizontal between facing edges.
  if (Math.abs(ay - by) < 2) {
    const from = bx > ax ? a.x + W : a.x;
    const to   = bx > ax ? b.x : b.x + W;
    return `M${from},${ay} L${to},${by}`;
  }

  // Different rows → leave horizontally, arrive horizontally.
  const goingRight = bx >= ax;
  const fx = goingRight ? a.x + W : a.x;
  const tx = goingRight ? b.x : b.x + W;
  const dx = Math.max(20, Math.abs(tx - fx) * 0.5);
  const c1 = goingRight ? fx + dx : fx - dx;
  const c2 = goingRight ? tx - dx : tx + dx;
  return `M${fx},${ay} C${c1},${ay} ${c2},${by} ${tx},${by}`;
}

/** Where an edge's latency label sits. Same-row edges lift above the boxes. */
export function labelY(a, b, mid) {
  const sameRow = Math.abs(cy(a) - cy(b)) < 2;
  return sameRow ? Math.min(a.y, b.y) - 5 : mid.y - 5;
}

/* ─────────── RENDER ─────────── */

function render(svg, spec) {
  svg.innerHTML = '';

  const gWires = document.createElementNS(NS, 'g');
  const gBoxes = document.createElementNS(NS, 'g');
  svg.append(gWires, gBoxes);

  // Wires first so boxes sit on top.
  spec.edges.forEach(([from, to, label], i) => {
    const a = spec.nodes[from];
    const b = spec.nodes[to];
    if (!a || !b) return;

    const p = document.createElementNS(NS, 'path');
    p.setAttribute('class', 'wire');
    p.setAttribute('d', edgePath(a, b));
    p.dataset.edge = i;
    gWires.appendChild(p);

    if (label) {
      const mid = p.getPointAtLength(p.getTotalLength() / 2);
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('class', 'lat');
      t.setAttribute('x', mid.x);
      // Boxes paint over wires, so a same-row label sitting at wire height
      // gets clipped wherever the column gap is narrower than the text.
      // Lift those clear of the box instead of squeezing them into the gap.
      t.setAttribute('y', labelY(a, b, mid));
      t.textContent = label;
      t.dataset.edge = i;
      gWires.appendChild(t);
    }
  });

  Object.entries(spec.nodes).forEach(([id, n]) => {
    const g = document.createElementNS(NS, 'g');
    g.dataset.box = id;

    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('class', `box${n.acc ? ' acc' : ''}`);
    r.setAttribute('x', n.x);
    r.setAttribute('y', n.y);
    r.setAttribute('width', W);
    r.setAttribute('height', H);
    r.setAttribute('rx', 2);

    const l = document.createElementNS(NS, 'text');
    l.setAttribute('class', 'lbl');
    l.setAttribute('x', cx(n));
    l.setAttribute('y', n.y + 13);
    l.textContent = n.label;

    const s = document.createElementNS(NS, 'text');
    s.setAttribute('class', 'sub');
    s.setAttribute('x', cx(n));
    s.setAttribute('y', n.y + 23);
    s.textContent = n.sub;

    g.append(r, l, s);
    gBoxes.appendChild(g);
  });

  return { gWires, gBoxes };
}

/* ─────────── PACKET ─────────── */

function movePacket(svg, path, ms) {
  return new Promise((resolve) => {
    const len = path.getTotalLength();
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('class', 'pkt');
    dot.setAttribute('r', 3);
    svg.appendChild(dot);

    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      // Ease-in-out so hops feel like transfer, not linear crawl.
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const p = path.getPointAtLength(e * len);
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      if (t < 1) requestAnimationFrame(step);
      else { dot.remove(); resolve(); }
    };
    requestAnimationFrame(step);
  });
}

/* ─────────── RUN ─────────── */

const running = new WeakMap();

async function run(svg, spec, btn) {
  if (running.get(svg)) return;
  running.set(svg, true);

  const dot = btn?.querySelector('.dot');
  const headDot = btn?.closest('.dg-head')?.querySelector('[data-dg-dot]');
  btn?.setAttribute('data-busy', '1');
  dot?.classList.remove('idle');
  dot?.classList.add('warn');
  headDot?.classList.remove('idle');
  headDot?.classList.add('warn', 'pulse');

  const boxes = new Map($$('[data-box]', svg).map((g) => [g.dataset.box, g]));

  const lightBox = (id, on) => {
    const g = boxes.get(id);
    if (!g) return;
    g.querySelector('rect')?.classList.toggle('pulse-box', on);
    g.querySelector('.lbl')?.classList.toggle('pulse-lbl', on);
  };

  // Reset
  boxes.forEach((_, id) => lightBox(id, false));

  lightBox(spec.edges[0][0], true);

  for (let i = 0; i < spec.edges.length; i++) {
    const [from, to] = spec.edges[i];
    const path = svg.querySelector(`path[data-edge="${i}"]`);
    if (!path) continue;

    path.classList.add('pulse-box');
    await movePacket(svg, path, 420);
    lightBox(to, true);
    // Keep the source lit only while it is still fanning out.
    const stillSending = spec.edges.slice(i + 1).some(([f]) => f === from);
    if (!stillSending) lightBox(from, false);
    path.classList.remove('pulse-box');
  }

  await new Promise((r) => setTimeout(r, 520));
  boxes.forEach((_, id) => lightBox(id, false));

  dot?.classList.remove('warn');
  dot?.classList.add('ok');
  headDot?.classList.remove('warn', 'pulse');
  headDot?.classList.add('ok');
  btn?.removeAttribute('data-busy');
  running.set(svg, false);
}

/* ─────────── INIT ─────────── */

export function initTrace() {
  $$('[data-dg]').forEach((svg) => {
    const spec = DIAGRAMS[svg.dataset.dg];
    if (!spec) return;

    render(svg, spec);

    const card = svg.closest('.dep');
    const btn = card?.querySelector('[data-trace]');

    if (reduced()) {
      btn?.remove();
      return;
    }

    btn?.addEventListener('click', () => run(svg, spec, btn));

    // Fire once automatically the first time it's seen — the moment
    // that makes the section land without the visitor having to hunt.
    onceVisible(svg, () => setTimeout(() => run(svg, spec, btn), 380), '0px 0px -20% 0px');
  });
}
