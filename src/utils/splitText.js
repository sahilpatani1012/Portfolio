/* ═══════════════════════════════════════════════════════════
   SPLIT TEXT — Utility to split text into animated spans
   ═══════════════════════════════════════════════════════════ */

/**
 * Split text content of an element into individual spans
 * @param {HTMLElement} element - Element whose text to split
 * @param {'chars'|'words'|'lines'} type - Split type
 * @returns {HTMLElement[]} Array of created span elements
 */
export function splitText(element, type = 'chars') {
  const text = element.textContent;
  element.setAttribute('aria-label', text);

  if (type === 'chars') {
    return splitIntoChars(element, text);
  } else if (type === 'words') {
    return splitIntoWords(element, text);
  } else if (type === 'lines') {
    return splitIntoLines(element);
  }

  return [];
}

function splitIntoChars(element, text) {
  element.innerHTML = '';
  const chars = [];

  // Preserve existing HTML (like <span class="gradient-text">)
  const template = document.createElement('div');
  template.innerHTML = element.getAttribute('data-original-html') || text;

  // Simple approach: split the raw text
  for (const char of text) {
    if (char === ' ') {
      const space = document.createTextNode(' ');
      element.appendChild(space);
    } else {
      const wrapper = document.createElement('span');
      wrapper.className = 'char-wrap';
      const inner = document.createElement('span');
      inner.className = 'char';
      inner.textContent = char;
      wrapper.appendChild(inner);
      element.appendChild(wrapper);
      chars.push(inner);
    }
  }

  return chars;
}

function splitIntoWords(element, text) {
  element.innerHTML = '';
  const words = text.split(/\s+/);
  const spans = [];

  words.forEach((word, i) => {
    const wrapper = document.createElement('span');
    wrapper.className = 'word-wrap';
    const inner = document.createElement('span');
    inner.className = 'word';
    inner.textContent = word;
    wrapper.appendChild(inner);
    element.appendChild(wrapper);
    spans.push(inner);

    if (i < words.length - 1) {
      element.appendChild(document.createTextNode(' '));
    }
  });

  return spans;
}

function splitIntoLines(element) {
  const text = element.innerHTML;
  const words = text.split(/\s+/);
  const lines = [];

  // Temporarily render words to detect line breaks
  element.innerHTML = '';
  const testSpans = [];

  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.textContent = word + (i < words.length - 1 ? ' ' : '');
    span.style.display = 'inline';
    element.appendChild(span);
    testSpans.push(span);
  });

  // Detect lines by comparing offsetTop
  let currentLineTop = testSpans[0]?.offsetTop;
  let currentLineWords = [];
  const lineGroups = [];

  testSpans.forEach(span => {
    if (span.offsetTop !== currentLineTop) {
      lineGroups.push(currentLineWords.join(' '));
      currentLineWords = [span.textContent.trim()];
      currentLineTop = span.offsetTop;
    } else {
      currentLineWords.push(span.textContent.trim());
    }
  });
  if (currentLineWords.length) {
    lineGroups.push(currentLineWords.join(' '));
  }

  // Rebuild with line wrappers
  element.innerHTML = '';
  lineGroups.forEach(lineText => {
    const wrapper = document.createElement('span');
    wrapper.className = 'line-wrap';
    const inner = document.createElement('span');
    inner.className = 'line';
    inner.textContent = lineText;
    wrapper.appendChild(inner);
    element.appendChild(wrapper);
    lines.push(inner);
  });

  return lines;
}

/**
 * Split hero title preserving the gradient-text span
 */
export function splitHeroTitle(element) {
  const chars = [];
  const nodes = [...element.childNodes];

  element.innerHTML = '';

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      for (const char of text) {
        if (char === ' ') {
          element.appendChild(document.createTextNode(' '));
        } else {
          const wrapper = document.createElement('span');
          wrapper.className = 'char-wrap';
          const inner = document.createElement('span');
          inner.className = 'char';
          inner.textContent = char;
          wrapper.appendChild(inner);
          element.appendChild(wrapper);
          chars.push(inner);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // It's an element like <span class="gradient-text">
      const text = node.textContent;
      const outerSpan = document.createElement('span');
      outerSpan.className = node.className;

      for (const char of text) {
        if (char === ' ') {
          outerSpan.appendChild(document.createTextNode(' '));
        } else {
          const wrapper = document.createElement('span');
          wrapper.className = 'char-wrap';
          const inner = document.createElement('span');
          inner.className = 'char';
          inner.textContent = char;
          wrapper.appendChild(inner);
          outerSpan.appendChild(wrapper);
          chars.push(inner);
        }
      }

      element.appendChild(outerSpan);
    }
  });

  return chars;
}
