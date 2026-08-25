/* ═══════════════════════════════════════════════════════════
   CONTACT FORM — inline validation + Netlify Forms submit
   ═══════════════════════════════════════════════════════════ */

import { $, $$, toast } from '../utils/helpers.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initForm() {
  const form = $('#form');
  if (!form) return;

  const btn = form.querySelector('button[type="submit"]');
  const label = btn?.querySelector('span');
  const original = label?.textContent || 'Transmit';

  const setError = (field, msg) => {
    field.classList.toggle('bad', Boolean(msg));
    const slot = field.querySelector('[data-err]');
    if (slot) slot.textContent = msg || '';
    return !msg;
  };

  const validate = (input) => {
    const field = input.closest('.field');
    if (!field) return true;
    const v = input.value.trim();

    if (!v) return setError(field, `${input.name} is required`);
    if (input.type === 'email' && !EMAIL_RE.test(v)) return setError(field, 'that address looks malformed');
    if (input.name === 'message' && v.length < 10) return setError(field, 'a little more detail helps');
    return setError(field, '');
  };

  $$('input, textarea', form).forEach((input) => {
    if (input.type === 'hidden' || input.name === 'company') return;
    input.addEventListener('blur', () => validate(input));
    input.addEventListener('input', () => {
      if (input.closest('.field')?.classList.contains('bad')) validate(input);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields = $$('input, textarea', form).filter(
      (i) => i.type !== 'hidden' && i.name !== 'company'
    );
    const ok = fields.map(validate).every(Boolean);
    if (!ok) {
      toast('Fix the highlighted fields');
      fields.find((f) => f.closest('.field')?.classList.contains('bad'))?.focus();
      return;
    }

    if (btn) { btn.disabled = true; if (label) label.textContent = 'Transmitting…'; }

    try {
      const data = new FormData(form);
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      });

      if (!res.ok) throw new Error(String(res.status));

      form.reset();
      toast('Message delivered — I usually reply same day');
      if (label) label.textContent = 'Delivered';
      setTimeout(() => { if (label) label.textContent = original; }, 3200);
    } catch {
      // Netlify's handler only exists on the deployed site, so local dev
      // always lands here. Fall back to the visitor's mail client.
      toast('Form endpoint unreachable — opening your mail client');
      const d = new FormData(form);
      const subject = encodeURIComponent(`Portfolio — ${d.get('name') || 'hello'}`);
      const body = encodeURIComponent(`${d.get('message') || ''}\n\n— ${d.get('name') || ''} (${d.get('email') || ''})`);
      window.location.href = `mailto:spatani9@gmail.com?subject=${subject}&body=${body}`;
      if (label) label.textContent = original;
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}
