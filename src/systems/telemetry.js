/* ═══════════════════════════════════════════════════════════
   TELEMETRY — counters, sparklines, live ingress stream
   ═══════════════════════════════════════════════════════════ */

import { gsap } from '../animations/gsapSetup.js';
import { $, $$, commas, pad, rand, randInt, pick, reduced, seeded, onceVisible } from '../utils/helpers.js';

/* ─────────── COUNTERS ─────────── */

export function initCounters() {
  $$('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';

    if (reduced()) {
      el.textContent = commas(target) + suffix;
      return;
    }

    el.textContent = '0' + suffix;

    onceVisible(el, () => {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.9,
        ease: 'power3.out',
        onUpdate: () => { el.textContent = commas(Math.round(obj.v)) + suffix; },
      });
    });
  });
}

/* ─────────── SPARKLINES ─────────── */

const SERIES = {
  up:  { trend: 0.55, noise: 0.30, hot: false },
  req: { trend: 0.80, noise: 0.35, hot: true },
  usr: { trend: 0.70, noise: 0.22, hot: false },
};

function buildPath(points, w, h) {
  return points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - p * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

export function initSparklines() {
  $$('[data-spark]').forEach((svg) => {
    const key = svg.dataset.spark;
    const cfg = SERIES[key] || SERIES.up;
    const rng = seeded(key);
    const N = 26;
    const W = 100;
    const H = 22;

    // Rising series with noise — reads as real telemetry, not a sine wave.
    const pts = [];
    for (let i = 0; i < N; i++) {
      const base = 0.18 + (i / (N - 1)) * cfg.trend;
      const jitter = (rng() - 0.5) * cfg.noise;
      pts.push(Math.min(0.96, Math.max(0.06, base + jitter)));
    }

    const d = buildPath(pts, W, H);
    const area = `${d} L${W},${H} L0,${H} Z`;

    svg.innerHTML =
      `<path class="area" d="${area}" />` +
      `<path class="${cfg.hot ? 'hot' : ''}" d="${d}" />`;

    const line = svg.querySelector('path:last-child');
    const fill = svg.querySelector('.area');

    if (reduced()) return;

    const len = line.getTotalLength?.() || 0;
    if (len) {
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(fill, { opacity: 0 });
      onceVisible(svg, () => {
        gsap.to(line, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.out' });
        gsap.to(fill, { opacity: 1, duration: 1.1, delay: 0.35 });
      });
    }
  });
}

/* ─────────── LIVE INGRESS STREAM ─────────── */

const ROUTES = [
  ['GET',  '/v1/schedule/requests'],
  ['POST', '/v1/schedule/reschedule'],
  ['POST', '/v1/mentor/substitute'],
  ['GET',  '/v1/mentor/eligibility'],
  ['POST', '/v1/billing/interval'],
  ['POST', '/webhooks/stripe'],
  ['POST', '/webhooks/paypal'],
  ['GET',  '/v1/crm/sync/status'],
  ['PUT',  '/v1/crm/adapter/write'],
  ['GET',  '/v1/lms/enrollments'],
  ['POST', '/v1/lms/roles/assign'],
  ['GET',  '/v1/lms/skills/map'],
  ['POST', '/v1/reminders/dispatch'],
  ['GET',  '/v1/ledger/reconcile'],
  ['POST', '/v1/ingest/csv'],
  ['GET',  '/health'],
];

export function initStream() {
  const box = $('#stream');
  const rateEl = $('#stream-rate');
  if (!box) return;

  const MAX = 9;
  let paused = false;

  const row = () => {
    const [method, route] = pick(ROUTES);
    const now = new Date();
    // Occasional 4xx keeps it honest — a log with only 200s reads fake.
    const err = Math.random() < 0.06;
    const status = err ? pick([401, 404, 409, 429]) : 200;
    const ms = err ? randInt(4, 22) : (route === '/health' ? randInt(1, 3) : randInt(6, 96));

    const el = document.createElement('div');
    el.className = 'stream-row new';
    el.innerHTML =
      `<span class="ts">${pad(now.getMinutes())}:${pad(now.getSeconds())}</span>` +
      `<span class="mth">${method}</span>` +
      `<span class="rt">${route}</span>` +
      `<span class="st${err ? ' e' : ''}">${status}</span>` +
      `<span class="ms">${ms}ms</span>`;
    return el;
  };

  const push = () => {
    if (paused) return;
    const el = row();
    box.appendChild(el);

    if (!reduced()) {
      gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' });
    }

    // Demote the previous row out of "new" styling.
    const rows = box.children;
    if (rows.length > 1) rows[rows.length - 2].classList.remove('new');
    while (rows.length > MAX) rows[0].remove();

    if (rateEl) rateEl.textContent = `${(rand(3.2, 9.4)).toFixed(1)} rps`;
  };

  // Prefill so the panel is never empty on first paint.
  for (let i = 0; i < MAX; i++) {
    const el = row();
    el.classList.remove('new');
    box.appendChild(el);
  }

  if (reduced()) {
    if (rateEl) rateEl.textContent = '6.1 rps';
    return;
  }

  let timer;
  const loop = () => {
    push();
    timer = setTimeout(loop, randInt(700, 2100));
  };
  timer = setTimeout(loop, 900);

  // Stop burning frames when the tab is hidden or the panel scrolls away.
  document.addEventListener('visibilitychange', () => { paused = document.hidden; });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      ([e]) => { paused = !e.isIntersecting || document.hidden; },
      { threshold: 0 }
    );
    io.observe(box);
  }
}
