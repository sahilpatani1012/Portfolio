/* ═══════════════════════════════════════════════════════════
   SCROLL ANIMATIONS — All ScrollTrigger-driven animations
   ═══════════════════════════════════════════════════════════ */

import { gsap, ScrollTrigger } from './gsapSetup.js';
import { prefersReducedMotion, $$ } from '../utils/helpers.js';

/**
 * Initialize all scroll-triggered animations
 */
export function initScrollAnimations() {
  const reduced = prefersReducedMotion();

  initSectionHeadings(reduced);
  initAboutSection(reduced);
  initSkillsSection(reduced);
  initProjectsSection(reduced);
  initTimelineSection(reduced);
  initContactSection(reduced);
  initFooterSection(reduced);
  initMarquee();
}

/* ─── Section Headings ─── */
function initSectionHeadings(reduced) {
  $$('[data-animate="heading"]').forEach((heading) => {
    // Animate the line after
    gsap.to(heading, {
      scrollTrigger: {
        trigger: heading,
        start: 'top 85%',
        toggleActions: reduced ? 'play none none none' : 'play none none reverse',
      },
      '--line-scale': 1,
      duration: 1,
      ease: 'power3.out',
    });

    // The ::after line
    const afterStyle = heading.querySelector('::after');
    ScrollTrigger.create({
      trigger: heading,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(heading, {
          onStart: () => {
            heading.style.setProperty('--line-visible', '1');
          },
        });
        gsap.fromTo(
          heading,
          { '--after-scale': 0 },
          {
            '--after-scale': 1,
            duration: 1,
            ease: 'power3.out',
          }
        );
      },
    });

    // Animate heading text
    gsap.from(heading, {
      scrollTrigger: {
        trigger: heading,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      y: reduced ? 0 : 40,
      opacity: 0,
      duration: 0.8,
    });

    // Directly animate the pseudo-element via scaleX
    gsap.fromTo(heading,
      { '--heading-line-scale': 0 },
      {
        '--heading-line-scale': 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
        },
      }
    );
  });

  // Add CSS variable to control line animation
  const style = document.createElement('style');
  style.textContent = `
    .section-heading::after {
      transform: scaleX(var(--heading-line-scale, 0));
    }
  `;
  document.head.appendChild(style);
}

/* ─── About Section ─── */
function initAboutSection(reduced) {
  // Bio text progressive reveal
  const aboutText = document.getElementById('about-text');
  if (aboutText) {
    const paragraphs = aboutText.querySelectorAll('p');

    if (reduced) {
      // Simple fade in for reduced motion
      gsap.from(paragraphs, {
        scrollTrigger: {
          trigger: aboutText,
          start: 'top 80%',
        },
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
      });
    } else {
      paragraphs.forEach((p) => {
        gsap.from(p, {
          scrollTrigger: {
            trigger: p,
            start: 'top 85%',
            end: 'top 40%',
            scrub: true,
          },
          opacity: 0.15,
          y: 20,
        });
      });
    }
  }

  // Stat cards — floating animation + count up
  const statCards = $$('[data-animate="stat"]');
  statCards.forEach((card, i) => {
    // Entrance
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
      y: reduced ? 0 : 40,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.15,
    });

    // Float animation (idle)
    if (!reduced) {
      gsap.to(card, {
        y: '+=8',
        duration: 2 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3,
      });
    }

    // Number count-up
    const numEl = card.querySelector('.stat-number');
    if (numEl) {
      const target = parseInt(numEl.dataset.count, 10);
      const suffix = numEl.dataset.suffix || '';

      ScrollTrigger.create({
        trigger: card,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(
            { val: 0 },
            {
              val: target,
              duration: 1.5,
              ease: 'power2.out',
              snap: { val: 1 },
              onUpdate: function () {
                numEl.textContent = Math.round(this.targets()[0].val) + suffix;
              },
            }
          );
        },
      });
    }
  });

  // Avatar entrance
  const avatar = document.querySelector('.about-avatar');
  if (avatar) {
    gsap.from(avatar, {
      scrollTrigger: {
        trigger: avatar,
        start: 'top 80%',
      },
      scale: reduced ? 1 : 0.8,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });
  }
}

/* ─── Skills Section ─── */
function initSkillsSection(reduced) {
  const skillCards = $$('[data-animate="skill"]');

  skillCards.forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      },
      scale: reduced ? 1 : 0.85,
      opacity: 0,
      duration: 0.6,
      delay: reduced ? 0 : Math.random() * 0.3,
      ease: 'power3.out',
    });

    // Cursor-following gradient effect on skills cards
    if (!reduced) {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    }
  });
}

/* ─── Projects Section (Stacked Card Reveal) ─── */
function initProjectsSection(reduced) {
  const cards = $$('.project-card');
  if (!cards.length) return;

  cards.forEach((card, i) => {
    const inner = card.querySelector('.project-card-inner');
    const title = card.querySelector('.project-title');
    const desc = card.querySelector('.project-description');
    const tags = card.querySelectorAll('.glass-tag');
    const curtain = card.querySelector('.project-curtain');
    const links = card.querySelector('.project-links');

    // Set z-index for stacking
    card.style.zIndex = i + 1;

    if (reduced) {
      gsap.set([title, desc, links], { opacity: 1, clipPath: 'none' });
      gsap.set(curtain, { scaleX: 0 });
      return;
    }

    // Stacked card effect: as you scroll, current card scales down
    if (i < cards.length - 1) {
      ScrollTrigger.create({
        trigger: card,
        start: 'top top',
        end: 'bottom top',
        pin: false,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(inner, {
            scale: 1 - progress * 0.08,
            opacity: 1 - progress * 0.4,
          });
        },
      });
    }

    // Content reveal on scroll into view
    const contentTl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    });

    // Curtain reveal
    contentTl.fromTo(
      curtain,
      { scaleX: 1 },
      { scaleX: 0, duration: 0.8, ease: 'power3.inOut' }
    );

    // Title clip path reveal
    contentTl.fromTo(
      title,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    );

    // Description fade up
    contentTl.fromTo(
      desc,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      '-=0.3'
    );

    // Tags stagger in
    contentTl.fromTo(
      tags,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out' },
      '-=0.2'
    );

    // Links fade in
    if (links) {
      contentTl.fromTo(
        links,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
        '-=0.2'
      );
    }
  });
}

/* ─── Timeline Section ─── */
function initTimelineSection(reduced) {
  // Timeline line draw animation
  const linePath = document.querySelector('.timeline-line-path');
  if (linePath) {
    // Use stroke-dasharray/offset for SVG line draw effect
    const length = 1000;
    gsap.set(linePath, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    gsap.to(linePath, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: true,
      },
    });
  }

  // Timeline cards
  $$('[data-animate="timeline"]').forEach((entry, i) => {
    const card = entry.querySelector('.timeline-card');
    const dot = entry.querySelector('.timeline-dot');

    if (card) {
      gsap.to(card, {
        scrollTrigger: {
          trigger: entry,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
        opacity: 1,
        x: 0,
        duration: reduced ? 0.3 : 0.8,
        ease: 'power3.out',
      });
    }

    // Dot pulse animation
    if (dot && !reduced) {
      ScrollTrigger.create({
        trigger: entry,
        start: 'top 70%',
        onEnter: () => {
          gsap.fromTo(
            dot,
            { scale: 0 },
            { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' }
          );
        },
      });
    }
  });
}

/* ─── Contact Section ─── */
function initContactSection(reduced) {
  const heading = document.getElementById('contact-heading');
  if (heading) {
    gsap.from(heading, {
      scrollTrigger: {
        trigger: heading,
        start: 'top 80%',
      },
      y: reduced ? 0 : 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });
  }

  // Form groups stagger
  const formGroups = $$('#contact-form .form-group');
  if (formGroups.length) {
    gsap.from(formGroups, {
      scrollTrigger: {
        trigger: '#contact-form',
        start: 'top 80%',
      },
      y: reduced ? 0 : 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
    });
  }

  // Social links
  const socialLinks = $$('.social-link');
  gsap.from(socialLinks, {
    scrollTrigger: {
      trigger: '.social-links',
      start: 'top 85%',
    },
    y: reduced ? 0 : 20,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power3.out',
  });
}

/* ─── Footer ─── */
function initFooterSection(reduced) {
  const largeText = document.getElementById('footer-large-text');
  if (largeText && !reduced) {
    gsap.from(largeText, {
      scrollTrigger: {
        trigger: '#footer',
        start: 'top 90%',
        end: 'bottom bottom',
        scrub: true,
      },
      yPercent: 30,
      ease: 'none',
    });
  }

  // Footer content fade up
  const footerContent = document.querySelector('.footer-content');
  if (footerContent) {
    gsap.from(footerContent, {
      scrollTrigger: {
        trigger: footerContent,
        start: 'top 90%',
      },
      y: reduced ? 0 : 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    });
  }
}

/* ─── Tech Marquee ─── */
function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;

  const trackWidth = track.scrollWidth / 2; // Half because content is duplicated

  gsap.to(track, {
    x: -trackWidth,
    duration: 30,
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize((x) => parseFloat(x) % trackWidth),
    },
  });
}
