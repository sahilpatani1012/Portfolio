/* ═══════════════════════════════════════════════════════════
   THE CONSOLE — entry point
   sahil-patani · backend engineer · bangalore
   ═══════════════════════════════════════════════════════════ */

import './styles/main.css';

import { initSmoothScroll, stopScroll, startScroll, ScrollTrigger } from './animations/gsapSetup.js';
import { initReveal } from './animations/reveal.js';

import { initBoot } from './components/boot.js';
import { initCursor } from './components/cursor.js';
import { initRail, initClock } from './components/rail.js';
import { initTerminal } from './components/terminal.js';
import { initIncidents, initCopy } from './components/incidents.js';
import { initForm } from './components/form.js';

import { initFlow } from './systems/flow.js';
import { initCounters, initSparklines, initStream } from './systems/telemetry.js';
import { initMesh } from './systems/mesh.js';
import { initTrace } from './systems/trace.js';

async function boot() {
  // Chrome that should exist before and during the boot screen.
  initClock();
  initSmoothScroll();
  stopScroll();

  // Structural work that must be done before first reveal — building the
  // mesh wires and trace diagrams needs stable layout, not a visible page.
  initFlow();
  initSparklines();
  initStream();

  await initBoot();
  startScroll();

  initCursor();
  initRail();
  initReveal();
  initCounters();
  initMesh();
  initTrace();
  initIncidents();
  initCopy();
  initTerminal();
  initForm();

  // Late layout settle: fonts, diagrams and expanded rows all shift heights.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

  console.log(
    '%c sahil-patani %c ready · ap-south-1 ',
    'background:#D4FF3F;color:#08090B;font-weight:700;padding:2px 6px;border-radius:2px 0 0 2px',
    'background:#12151A;color:#8B929C;padding:2px 6px;border-radius:0 2px 2px 0'
  );
  console.log('%cLooking for the source? github.com/sahilpatani1012', 'color:#5A616B');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
