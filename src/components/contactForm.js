/* ═══════════════════════════════════════════════════════════
   CONTACT FORM — Validation, Netlify Forms, Toast
   ═══════════════════════════════════════════════════════════ */

import { $, $$ } from '../utils/helpers.js';

/**
 * Initialize contact form handling
 */
export function initContactForm() {
  initFormValidation();
  initFormSubmission();
  initEmailCopy();
  initFloatingLabels();
}

/* ─── Floating Labels ─── */
function initFloatingLabels() {
  $$('.form-group input, .form-group textarea').forEach((input) => {
    // Check initial state
    if (input.value) input.classList.add('has-value');

    input.addEventListener('focus', () => input.classList.add('focused'));
    input.addEventListener('blur', () => {
      input.classList.remove('focused');
      input.classList.toggle('has-value', !!input.value);
    });
  });
}

/* ─── Live Validation ─── */
function initFormValidation() {
  const form = $('#contact-form');
  if (!form) return;

  const inputs = form.querySelectorAll('input[required], textarea[required]');

  inputs.forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) {
        validateField(input);
      }
    });
  });
}

function validateField(field) {
  let isValid = true;
  let message = '';

  if (!field.value.trim()) {
    isValid = false;
    message = 'This field is required';
  } else if (field.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value)) {
      isValid = false;
      message = 'Please enter a valid email';
    }
  }

  field.classList.toggle('invalid', !isValid);
  field.classList.toggle('valid', isValid);

  // Show/hide error message
  let errorEl = field.parentElement.querySelector('.field-error');
  if (!isValid) {
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      field.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
  } else if (errorEl) {
    errorEl.remove();
  }

  return isValid;
}

/* ─── Form Submission (Netlify) ─── */
function initFormSubmission() {
  const form = $('#contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let allValid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) allValid = false;
    });

    if (!allValid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const formData = new FormData(form);

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });

      if (response.ok) {
        showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
        form.reset();
        $$('.form-group input, .form-group textarea').forEach((input) => {
          input.classList.remove('valid', 'invalid', 'has-value');
        });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      showToast('Something went wrong. Please try again or email directly.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

/* ─── Email Click to Copy ─── */
function initEmailCopy() {
  const emailLink = $('[data-email]');
  if (!emailLink) return;

  emailLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailLink.dataset.email || emailLink.textContent;

    navigator.clipboard.writeText(email).then(() => {
      showToast('Email copied to clipboard!', 'success');
    }).catch(() => {
      // Fallback
      window.location.href = `mailto:${email}`;
    });
  });
}

/* ─── Toast Notification ─── */
function showToast(message, type = 'success') {
  const toast = $('#toast') || createToast();
  toast.textContent = message;
  toast.className = `toast ${type} visible`;

  // Inject field error styles
  if (!document.querySelector('#contact-form-styles')) {
    const style = document.createElement('style');
    style.id = 'contact-form-styles';
    style.textContent = `
      .field-error {
        display: block;
        color: var(--accent-tertiary);
        font-size: var(--text-xs);
        margin-top: 4px;
      }
      .glass-input.invalid {
        border-color: var(--accent-tertiary);
      }
      .glass-input.valid {
        border-color: var(--accent-secondary);
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    toast.classList.remove('visible');
  }, 4000);
}

function createToast() {
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'toast';
  document.body.appendChild(toast);
  return toast;
}
