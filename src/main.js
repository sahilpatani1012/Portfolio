/* ═══════════════════════════════════════════════════════════
   MAIN ENTRY POINT — Portfolio initialization
   ═══════════════════════════════════════════════════════════ */

// Styles
import './styles/main.css';

// Core setup
import { initSmoothScroll } from './animations/gsapSetup.js';
import { initPreloader } from './animations/preloader.js';
import { initHeroAnimations } from './animations/heroAnimations.js';
import { initScrollAnimations } from './animations/scrollAnimations.js';
import { initHoverEffects } from './animations/hoverEffects.js';
import { initAnimeEffects } from './animations/animeEffects.js';

// Three.js
import { initParticleScene } from './three/particleScene.js';

// Components
import { initCursor } from './components/cursor.js';
import { initNavigation } from './components/navigation.js';
import { initContactForm } from './components/contactForm.js';
import { initThemeToggle } from './components/themeToggle.js';

// Utilities
import { initMagneticElements } from './utils/magneticElement.js';

/* ─── Boot Sequence ─── */
async function boot() {
  // Theme toggle can init immediately (before preloader)
  initThemeToggle();

  // Smooth scroll setup
  initSmoothScroll();

  // Wait for preloader to complete
  await initPreloader();

  // Initialize everything after preloader
  initHeroAnimations();
  initParticleScene();
  initCursor();
  initNavigation();
  initScrollAnimations();
  initHoverEffects();
  initAnimeEffects();
  initContactForm();
  initMagneticElements();

  // Log boot complete
  console.log(
    '%c★ Portfolio loaded successfully',
    'color: #6c63ff; font-size: 14px; font-weight: bold;'
  );
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
