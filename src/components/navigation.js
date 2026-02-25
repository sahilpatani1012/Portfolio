/* ═══════════════════════════════════════════════════════════
   NAVIGATION — Scroll spy, hide/show, mobile menu
   ═══════════════════════════════════════════════════════════ */

import { gsap, ScrollTrigger, scrollTo } from '../animations/gsapSetup.js';
import { $, $$, prefersReducedMotion } from '../utils/helpers.js';

let lastScrollY = 0;
let isNavHidden = false;

/**
 * Initialize navigation system
 */
export function initNavigation() {
  initScrollSpy();
  initScrollDirection();
  initMobileMenu();
  initNavLinks();
  initBackToTop();
}

/* ─── Scroll Spy — highlight active nav link ─── */
function initScrollSpy() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link[href^="#"]');

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 40%',
      end: 'bottom 40%',
      onToggle: (self) => {
        if (self.isActive) {
          const id = section.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      },
    });
  });
}

/* ─── Hide on Scroll Down / Show on Scroll Up ─── */
function initScrollDirection() {
  const nav = $('.glass-nav');
  if (!nav) return;

  // Add scrolled class for glass background
  ScrollTrigger.create({
    start: 'top -100',
    onUpdate: (self) => {
      nav.classList.toggle('scrolled', self.progress > 0);
    },
  });

  // Hide/show on scroll direction
  let lastDirection = 0;

  ScrollTrigger.create({
    start: 'top top',
    end: 'max',
    onUpdate: (self) => {
      const direction = self.direction; // 1 = down, -1 = up
      if (direction !== lastDirection) {
        lastDirection = direction;
        if (direction === 1 && self.scroll() > 200) {
          // Scrolling down
          gsap.to(nav, {
            yPercent: -100,
            duration: 0.3,
            ease: 'power3.out',
          });
          isNavHidden = true;
        } else {
          // Scrolling up
          gsap.to(nav, {
            yPercent: 0,
            duration: 0.3,
            ease: 'power3.out',
          });
          isNavHidden = false;
        }
      }
    },
  });
}

/* ─── Mobile Menu ─── */
function initMobileMenu() {
  const hamburger = $('.hamburger');
  const mobileMenu = $('.mobile-menu');
  const mobileLinks = $$('.mobile-nav-link');

  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  hamburger.addEventListener('click', () => {
    isOpen = !isOpen;
    hamburger.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';

    if (isOpen) {
      // Stagger mobile links in
      gsap.fromTo(
        mobileLinks,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.2,
        }
      );
    }
  });

  // Close on link click
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      isOpen = false;
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ─── Smooth Scroll on Nav Links ─── */
function initNavLinks() {
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href');
      if (target && target !== '#') {
        e.preventDefault();
        scrollTo(target);
      }
    });
  });
}

/* ─── Back to Top ─── */
function initBackToTop() {
  const btn = $('.back-to-top');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    scrollTo('#hero');
  });
}
