/* ═══════════════════════════════════════════════════════════
   BOOT SEQUENCE
   Tied to real readiness (fonts + document), not a fake timer.
   Floor 520ms so it doesn't flash; ceiling 1500ms so it never stalls.
   ═══════════════════════════════════════════════════════════ */

import { gsap } from '../animations/gsapSetup.js';
import { $, reduced, pad } from '../utils/helpers.js';

const FLOOR = 520;
const CEIL  = 1500;

const LINES = [
  ['boot', 'kernel handshake', 'ok'],
  ['net',  'resolving ap-south-1', 'ok'],
  ['db',   'mongo · postgres · redis', 'ok'],
  ['queue', 'sqs consumers attached', 'ok'],
  ['pay',  'stripe · paypal · in-house', 'ok'],
  ['obs',  'sentry · winston online', 'ok'],
  ['svc',  'sahil-patani ready', 'hot'],
];

function stamp(i) {
  const ms = 40 + i * 37;
  return `+${pad(Math.floor(ms / 1000))}.${pad(ms % 1000, 3)}`;
}

export function initBoot() {
  const boot = $('#boot');
  const log = $('#boot-log');
  const meter = $('#boot-meter');

  if (!boot) return Promise.resolve();

  // Reduced motion: skip entirely.
  if (reduced()) {
    boot.remove();
    return Promise.resolve();
  }

  const t0 = performance.now();

  // Real readiness: fonts loaded (so the serif doesn't pop) + window load.
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((r) => window.addEventListener('load', r, { once: true }));

  const ready = Promise.all([fonts, loaded]);

  // Paint the log lines on a fast cadence.
  LINES.forEach(([tag, msg, state], i) => {
    setTimeout(() => {
      if (!log.isConnected) return;
      const line = document.createElement('span');
      line.className = 'l';
      line.innerHTML =
        `<span class="t">${stamp(i)}</span>  ` +
        `${tag.padEnd(6, ' ')}  ${msg}  ` +
        `<span class="${state}">[${state === 'hot' ? 'live' : 'ok'}]</span>`;
      log.appendChild(line);
      gsap.fromTo(line, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' });
    }, 60 + i * 52);
  });

  gsap.to(meter, { width: '100%', duration: CEIL / 1000, ease: 'power1.inOut' });

  return new Promise((resolve) => {
    const finish = () => {
      const elapsed = performance.now() - t0;
      const hold = Math.max(0, FLOOR - elapsed);

      setTimeout(() => {
        gsap.timeline({
          onComplete: () => { boot.remove(); resolve(); },
        })
          .to(meter, { width: '100%', duration: 0.18, ease: 'power2.out' }, 0)
          .to([log, '.boot-brand'], { opacity: 0, duration: 0.18, ease: 'power2.in' }, 0)
          .to(boot, { yPercent: -100, duration: 0.62, ease: 'expo.inOut' }, 0.1);
      }, hold);
    };

    let done = false;
    const once = () => { if (!done) { done = true; finish(); } };

    ready.then(once);
    setTimeout(once, CEIL);
  });
}
