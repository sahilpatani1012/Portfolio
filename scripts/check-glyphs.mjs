/* check-glyphs — run with `npm run check:glyphs`
 *
 * The fonts in public/fonts are subset to latin only. Any character the
 * site renders outside that range silently falls back to a system font,
 * which shows up as mismatched weight/metrics mid-line (or tofu in any
 * renderer without fallbacks). This scans the markup and the JS string
 * literals against the unicode-range actually shipped in _fonts.css.
 *
 * If this fails: either pick an in-range character, or draw it as inline
 * SVG (see ICONS in src/components/palette.js).
 */

import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* Parse the ranges straight out of the generated @font-face sheet. */
const sheet = fs.readFileSync(`${ROOT}/src/styles/_fonts.css`, 'utf8');
const rangeText = sheet.match(/unicode-range:\s*([^;]+);/)[1];
const ranges = rangeText.split(',').map((r) => {
  const t = r.trim().replace(/^U\+/i, '');
  const [a, b] = t.split('-');
  return [parseInt(a, 16), parseInt(b ?? a, 16)];
});
const covered = (cp) => ranges.some(([a, b]) => cp >= a && cp <= b);

/* Collect rendered text. */
const html = fs.readFileSync(`${ROOT}/index.html`, 'utf8');

// Strip script/style, then tags, then decode the entities we actually use.
let visible = html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ');

const ENT = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&nbsp;': ' ',
  '&middot;': '\u00B7', '&mdash;': '\u2014', '&ndash;': '\u2013', '&rsquo;': '\u2019',
  '&lsquo;': '\u2018', '&ldquo;': '\u201C', '&rdquo;': '\u201D', '&copy;': '\u00A9',
  '&rarr;': '\u2192', '&larr;': '\u2190', '&uarr;': '\u2191', '&darr;': '\u2193',
  '&minus;': '\u2212', '&rsaquo;': '\u203A', '&lsaquo;': '\u2039', '&hellip;': '\u2026',
  '&times;': '\u00D7', '&eacute;': '\u00E9',
};
visible = visible.replace(/&[a-z]+;/g, (e) => ENT[e] ?? e);
visible = visible.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d));
visible = visible.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));

/* JS string literals that end up on screen. */
const jsFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.js')) jsFiles.push(p);
  }
})(path.join(ROOT, 'src'));

let jsText = '';
for (const f of jsFiles) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`\\]*)`/g)) {
    jsText += (m[1] ?? m[2] ?? m[3] ?? '') + ' ';
  }
}

/* Report. */
// U+2318 is deliberate: it only renders on macOS, where the mono fallback
// chain (ui-monospace / SF Mono) is guaranteed to carry it.
const ALLOWED = new Set([0x2318]);

const found = new Map();
const scan = (text, where) => {
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp < 32 || covered(cp) || ALLOWED.has(cp)) continue;
    const key = ch;
    if (!found.has(key)) found.set(key, { cp, where: new Set() });
    found.get(key).where.add(where);
  }
};

scan(visible, 'index.html');
scan(jsText, 'js');

console.log(`shipped coverage: ${ranges.length} unicode ranges\n`);

if (!found.size) {
  console.log('Every rendered glyph is inside the shipped subset.');
  process.exit(0);
}

console.log(`${found.size} glyph(s) OUTSIDE the shipped subset — these fall back to a system font:\n`);
for (const [ch, info] of [...found].sort((a, b) => a[1].cp - b[1].cp)) {
  console.log(`  ${ch}   U+${info.cp.toString(16).toUpperCase().padStart(4, '0')}   ${[...info.where].join(', ')}`);
}
process.exit(1);
