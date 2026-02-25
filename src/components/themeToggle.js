/* ═══════════════════════════════════════════════════════════
   THEME TOGGLE — Dark / Light mode switch
   ═══════════════════════════════════════════════════════════ */

import { $ } from '../utils/helpers.js';

const STORAGE_KEY = 'portfolio-theme';
const DARK = 'dark';
const LIGHT = 'light';

/**
 * Initialize theme toggle
 */
export function initThemeToggle() {
  const toggle = $('#theme-toggle');
  if (!toggle) return;

  const sunIcon = toggle.querySelector('.icon-sun');
  const moonIcon = toggle.querySelector('.icon-moon');

  // Determine initial theme
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? DARK : LIGHT);

  applyTheme(initialTheme, sunIcon, moonIcon);

  // Toggle handler
  toggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || DARK;
    const next = current === DARK ? LIGHT : DARK;
    applyTheme(next, sunIcon, moonIcon);
    localStorage.setItem(STORAGE_KEY, next);
  });

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? DARK : LIGHT, sunIcon, moonIcon);
    }
  });
}

function applyTheme(theme, sunIcon, moonIcon) {
  document.documentElement.dataset.theme = theme;

  if (sunIcon && moonIcon) {
    if (theme === DARK) {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  }
}
