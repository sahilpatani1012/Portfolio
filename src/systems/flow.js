/* ═══════════════════════════════════════════════════════════
   FLOW — the backdrop.
   Replaces the old Three.js particle galaxy (~600KB) with a
   2D canvas of packets crossing lanes. Sparse, dim, cheap:
   ~70 objects, no per-frame allocation, pauses when hidden.
   ═══════════════════════════════════════════════════════════ */

import { $, rand, randInt, reduced, throttleRAF } from '../utils/helpers.js';

const LANES = 14;
const PER_LANE = 5;

export function initFlow() {
  const canvas = $('#flow');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Reduced motion: paint one static frame and stop.
  const still = reduced();

  let w = 0, h = 0, dpr = 1;
  let lanes = [];
  let raf = null;
  let paused = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    lanes = [];
    for (let i = 0; i < LANES; i++) {
      const y = (h / (LANES + 1)) * (i + 1) + rand(-14, 14);
      const dir = i % 2 === 0 ? 1 : -1;
      const packets = [];
      for (let p = 0; p < PER_LANE; p++) {
        packets.push({
          x: rand(-w * 0.2, w * 1.2),
          len: rand(14, 70),
          speed: rand(0.18, 0.72) * dir,
          // Only a few packets carry signal colour — the rest are structure.
          hot: Math.random() < 0.09,
          alpha: rand(0.05, 0.2),
        });
      }
      lanes.push({ y, packets });
    }
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[i];
      for (let p = 0; p < lane.packets.length; p++) {
        const k = lane.packets[p];

        if (!still) k.x += k.speed;

        // Wrap
        if (k.speed > 0 && k.x - k.len > w) k.x = -k.len - rand(0, 300);
        if (k.speed < 0 && k.x + k.len < 0) k.x = w + k.len + rand(0, 300);

        ctx.beginPath();
        ctx.moveTo(k.x, lane.y);
        ctx.lineTo(k.x - k.len * Math.sign(k.speed || 1), lane.y);
        ctx.lineWidth = k.hot ? 1.2 : 1;
        ctx.strokeStyle = k.hot
          ? `rgba(212, 255, 63, ${k.alpha * 0.9})`
          : `rgba(231, 233, 236, ${k.alpha * 0.42})`;
        ctx.stroke();
      }
    }

    if (!still && !paused) raf = requestAnimationFrame(frame);
    else raf = null;
  }

  function start() {
    if (raf || still) return;
    paused = false;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    paused = true;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  resize();
  window.addEventListener('resize', throttleRAF(resize), { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  if (still) frame();
  else start();
}
