/* ═══════════════════════════════════════════════════════════
   TERMINAL — an actually interactive contact console
   ═══════════════════════════════════════════════════════════ */

import { $, copy, toast, reduced, wait } from '../utils/helpers.js';
import { scrollTo } from '../animations/gsapSetup.js';

const HINTS = ['help', 'whoami', 'stack', 'incidents', 'email', 'resume', 'uptime'];

const LINKS = {
  github:   'https://github.com/sahilpatani1012',
  linkedin: 'https://www.linkedin.com/in/sahil-patani-2721231b8/',
  leetcode: 'https://leetcode.com/u/spatani9/',
};

export function initTerminal() {
  const term = $('#term');
  const out = $('#term-out');
  const input = $('#term-input');
  const hints = $('#term-hints');
  if (!term || !out || !input) return;

  const history = [];
  let cursor = -1;

  /* ─── output ─── */
  const line = (html = '', cls = '') => {
    const el = document.createElement('span');
    el.className = `ln ${cls}`.trim();
    el.innerHTML = html;
    out.appendChild(el);
    out.scrollTop = out.scrollHeight;
    return el;
  };

  const print = async (lines, cls = '') => {
    for (const l of lines) {
      line(l, cls);
      if (!reduced()) await wait(26);
    }
  };

  /* ─── commands ─── */
  const COMMANDS = {
    help: {
      desc: 'list available commands',
      run: () => print([
        'AVAILABLE COMMANDS',
        '',
        ...Object.entries(COMMANDS).map(
          ([name, c]) => `  <span class="hot">${name.padEnd(11, ' ')}</span> ${c.desc}`
        ),
        '',
        '<span class="dimmed">tip: ↑ / ↓ walks history · tab completes</span>',
      ]),
    },

    whoami: {
      desc: 'operator identity',
      run: () => print([
        'sahil patani',
        '',
        '  role      backend engineer @ CodeYoung',
        '  base      bangalore, india · UTC+5:30',
        '  uptime    2 yrs 6 mos',
        '  focus     payments · scheduling · migrations · RCA',
        '  prior     thriving springs — 200k+ user LMS platform',
        '  degree    B.Tech IT, Manipal University Jaipur — 8.9/10',
        '',
        '<span class="ok">status: open to opportunities</span>',
      ]),
    },

    stack: {
      desc: 'print the technical stack',
      run: () => print([
        'RUNTIME     Node.js · Express · Spring Boot · FastAPI',
        'LANGUAGES   TypeScript · JavaScript · Java · SQL',
        '            <span class="dimmed">working knowledge: Python · C++</span>',
        'DATA        MongoDB · PostgreSQL · MySQL · Redis',
        'ORM         Sequelize · JPA / Hibernate',
        'ASYNC       AWS SQS · WebSockets · cron pipelines',
        'CLOUD       AWS (EC2 · S3 · SQS · IAM · RDS) · Docker · Kubernetes',
        'OBSERVE     Sentry · Winston · Loggly · Jest',
        'INTEGRATE   Stripe · PayPal · Zoom · WhatsApp Business API',
        'FRONTEND    React · Redux Toolkit · Angular',
      ]),
    },

    projects: {
      desc: 'jump to deployments',
      run: async () => {
        await print(['routing to /deployments …'], 'ok');
        scrollTo('#deployments');
      },
    },

    incidents: {
      desc: 'summary of resolved incidents',
      run: () => print([
        'INC-001  <span class="err">SEV-1</span>  webhook race → double charge   22 cases / 3 gateways',
        'INC-002  <span class="err">SEV-1</span>  cancellation billed twice       deferred ledger',
        'INC-003  SEV-2  40% of AI calls never fired     atomic reservation',
        'INC-004  SEV-2  95 sessions marked unattended   timeline reconcile',
        '',
        '<span class="ok">all resolved · 0 open · 0 regressions</span>',
        '<span class="dimmed">run `open incidents` for the full reports</span>',
      ]),
    },

    experience: {
      desc: 'work history',
      run: () => print([
        'v2.0.0  CodeYoung · Bangalore            mar 2026 → present',
        '        CRM migration lead · Loop scheduling · billing across 3 gateways',
        '',
        'v1.0.0  Thriving Springs · Hyderabad     feb 2024 → feb 2026',
        '        LMS backend for 200k+ users · enterprise POC (Uber, HDFC Ergo, InCred)',
        '',
        'v0.1.0  Manipal University Jaipur        oct 2020 → jul 2024',
        '        B.Tech Information Technology · CGPA 8.9 · 300+ LeetCode',
      ]),
    },

    uptime: {
      desc: 'time in production',
      run: () => {
        const start = new Date('2024-02-01T00:00:00+05:30');
        const days = Math.floor((Date.now() - start) / 86400000);
        const y = Math.floor(days / 365);
        const m = Math.floor((days % 365) / 30);
        return print([
          `up ${days} days  (${y}y ${m}mo)`,
          'load average: 0.42, 0.61, 0.55',
          '<span class="ok">0 unplanned outages</span>',
        ]);
      },
    },

    email: {
      desc: 'copy email to clipboard',
      run: async () => {
        const ok = await copy('spatani9@gmail.com');
        toast(ok ? 'Email copied' : 'Copy blocked — select it manually');
        return print([
          `spatani9@gmail.com  ${ok ? '<span class="ok">[copied]</span>' : '<span class="err">[copy blocked]</span>'}`,
        ]);
      },
    },

    phone: {
      desc: 'copy phone number',
      run: async () => {
        const ok = await copy('+919309550866');
        toast(ok ? 'Number copied' : 'Copy blocked');
        return print([`+91 93095 50866  ${ok ? '<span class="ok">[copied]</span>' : ''}`]);
      },
    },

    github:   { desc: 'open github profile',   run: () => go('github') },
    linkedin: { desc: 'open linkedin profile', run: () => go('linkedin') },
    leetcode: { desc: 'open leetcode profile', run: () => go('leetcode') },

    resume: {
      desc: 'where to get the CV',
      run: () => print([
        'The full CV is a PDF — ask and it lands in your inbox the same day.',
        '',
        `  <a href="mailto:spatani9@gmail.com?subject=Resume%20request">spatani9@gmail.com</a>`,
        `  <a href="${LINKS.linkedin}" target="_blank" rel="noopener noreferrer">linkedin.com/in/sahil-patani</a>`,
      ]),
    },

    contact: {
      desc: 'jump to the contact form',
      run: async () => {
        await print(['focusing transmit form …'], 'ok');
        $('#f-name')?.focus();
      },
    },

    clear: { desc: 'clear the console', run: () => { out.innerHTML = ''; } },

    sudo: {
      desc: 'elevate privileges',
      run: () => print([
        'sahil is not in the sudoers file.',
        '<span class="dimmed">This incident will be reported. (INC-005, probably.)</span>',
      ], 'err'),
    },
  };

  function go(key) {
    window.open(LINKS[key], '_blank', 'noopener,noreferrer');
    return print([`opening ${LINKS[key]} …`], 'ok');
  }

  // Aliases
  const ALIAS = { exp: 'experience', cv: 'resume', ls: 'help', '?': 'help', mail: 'email', about: 'whoami' };

  /* ─── execute ─── */
  async function exec(raw) {
    const text = raw.trim();
    line(`<span class="p">›</span> ${escapeHtml(text)}`, 'cmd');
    if (!text) return;

    history.push(text);
    cursor = history.length;

    const [head, ...rest] = text.toLowerCase().split(/\s+/);
    const name = ALIAS[head] || head;

    // `open <section>` scrolls the page
    if (name === 'open' && rest[0]) {
      const id = `#${rest[0].replace(/^#/, '')}`;
      if (document.querySelector(id)) {
        await print([`scrolling to ${id} …`], 'ok');
        scrollTo(id);
      } else {
        await print([`open: no such section: ${escapeHtml(rest[0])}`], 'err');
      }
      return;
    }

    const cmd = COMMANDS[name];
    if (!cmd) {
      await print([
        `command not found: ${escapeHtml(head)}`,
        `<span class="dimmed">try <span class="hot">help</span></span>`,
      ], 'err');
      return;
    }

    await cmd.run();
  }

  const escapeHtml = (s) =>
    s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ─── input handling ─── */
  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = input.value;
      input.value = '';
      await exec(v);
      out.scrollTop = out.scrollHeight;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      cursor = Math.max(0, cursor - 1);
      input.value = history[cursor] ?? '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!history.length) return;
      cursor = Math.min(history.length, cursor + 1);
      input.value = history[cursor] ?? '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const part = input.value.trim().toLowerCase();
      if (!part) return;
      const hit = Object.keys(COMMANDS).find((c) => c.startsWith(part));
      if (hit) input.value = hit;
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      out.innerHTML = '';
    }
  });

  term.addEventListener('click', (e) => {
    if (!e.target.closest('a')) input.focus();
  });
  input.addEventListener('focus', () => term.classList.add('focus'));
  input.addEventListener('blur', () => term.classList.remove('focus'));

  /* ─── hint chips ─── */
  if (hints) {
    hints.removeAttribute('aria-hidden');
    HINTS.forEach((h) => {
      const b = document.createElement('button');
      b.className = 'term-hint';
      b.type = 'button';
      b.textContent = h;
      b.dataset.cur = 'RUN';
      b.addEventListener('click', async () => {
        input.focus();
        await exec(h);
      });
      hints.appendChild(b);
    });
  }

  /* ─── greeting ─── */
  print([
    '<span class="dimmed">sahil-console 2.5.0 — connected to ap-south-1</span>',
    '',
    'Hey. This console is real — try <span class="hot">help</span>.',
    '',
  ]);
}
