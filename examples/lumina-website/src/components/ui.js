const buttonVariants = {
  primary:
    'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-700/20 hover:bg-teal-700',
  secondary:
    'bg-white text-slate-950 border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50',
  accent:
    'bg-amber-100 text-amber-900 border-amber-200 shadow-sm hover:border-amber-300 hover:bg-amber-50',
};

export function buttonLink({
  label,
  href,
  variant = 'secondary',
  icon: iconName,
}) {
  return `
    <a class="btn ${buttonVariants[variant]}" href="${href}">
      ${icon(iconName ?? buttonIcons[variant] ?? 'arrowRight', 'size-4')}
      ${label}
    </a>
  `;
}

export function eyebrow(text) {
  return `<span class="eyebrow">${text}</span>`;
}

export function codeBlock(code, className = '') {
  return `
    <pre class="code-block ${className}"><code>${highlightCode(code)}</code></pre>
  `;
}

const buttonIcons = {
  primary: 'play',
  secondary: 'book',
  accent: 'sparkles',
};

const iconPaths = {
  arrowRight: '<path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"></path>',
  boxes:
    '<path d="m7.5 4.3 4.5 2.6 4.5-2.6"></path><path d="M7.5 9.7 12 12.3l4.5-2.6"></path><path d="M3 7l9-5 9 5v10l-9 5-9-5Z"></path>',
  brush:
    '<path d="M9.5 16.5c-1.7 0-3 1.3-3 3 0 .8-.7 1.5-1.5 1.5 2.8.9 6-.5 6-4.5a1.5 1.5 0 0 0-1.5-1.5Z"></path><path d="m16 3 5 5-9.5 9.5-5-5Z"></path>',
  canvas:
    '<rect x="3" y="4" width="18" height="14" rx="2"></rect><path d="M8 22h8"></path><path d="M12 18v4"></path>',
  clipboard:
    '<rect x="8" y="2" width="8" height="4" rx="1"></rect><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"></path>',
  code: '<path d="m16 18 6-6-6-6"></path><path d="m8 6-6 6 6 6"></path>',
  crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path>',
  download:
    '<path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path>',
  fileImage:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><path d="m9 15 2-2 4 4"></path><circle cx="9" cy="10" r="1"></circle>',
  filter: '<path d="M22 3H2l8 9.5V20l4 2v-9.5Z"></path>',
  gauge:
    '<path d="M12 14 16 8"></path><path d="M4.3 19a9 9 0 1 1 15.4 0"></path>',
  github:
    '<path d="M15 22v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.6 0-1.5-.5-2.7-1.4-3.7.1-.4.6-1.9-.2-3.6 0 0-1.2-.4-3.8 1.4a13.2 13.2 0 0 0-6.8 0C5.4.2 4.2.6 4.2.6c-.8 1.7-.3 3.2-.2 3.6A5.1 5.1 0 0 0 2.6 8c0 5.1 3.1 6.3 6.1 6.6a3 3 0 0 0-.9 2.1V22"></path><path d="M9 18c-3.1 1-3.1-1.5-4.3-1.8"></path>',
  image:
    '<rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="8.5" cy="10.5" r="1.5"></circle><path d="m21 15-5-5L5 19"></path>',
  layers:
    '<path d="m12 2 9 5-9 5-9-5Z"></path><path d="m3 12 9 5 9-5"></path><path d="m3 17 9 5 9-5"></path>',
  play: '<path d="m8 5 11 7-11 7Z"></path>',
  react:
    '<ellipse cx="12" cy="12" rx="9" ry="3.8"></ellipse><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(120 12 12)"></ellipse><circle cx="12" cy="12" r="1.5"></circle>',
  rocket:
    '<path d="M4.5 16.5c-1 1-1.5 3-1.5 4.5 1.5 0 3.5-.5 4.5-1.5"></path><path d="M9 15 4 10l4-2 8-5 5 5-5 8-2 4Z"></path><circle cx="15" cy="9" r="1.5"></circle>',
  sliders:
    '<path d="M4 21v-7"></path><path d="M4 10V3"></path><path d="M12 21v-9"></path><path d="M12 8V3"></path><path d="M20 21v-5"></path><path d="M20 12V3"></path><path d="M2 14h4"></path><path d="M10 8h4"></path><path d="M18 16h4"></path>',
  sparkles:
    '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"></path><path d="m5 3 .7 2.3L8 6l-2.3.7L5 9l-.7-2.3L2 6l2.3-.7Z"></path><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z"></path>',
  upload:
    '<path d="M12 15V3"></path><path d="m7 8 5-5 5 5"></path><path d="M5 21h14"></path>',
  wand: '<path d="m15 4 5 5"></path><path d="m14 5 5 5L7 22l-5-5Z"></path><path d="M9 4V2"></path><path d="M4 9H2"></path><path d="M17 20v2"></path><path d="M22 15h-2"></path>',
};

export function icon(name, className = 'size-5') {
  const paths = iconPaths[name] ?? iconPaths.sparkles;

  return `
    <svg class="${className} shrink-0" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      ${paths}
    </svg>
  `;
}

export function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightCode(code) {
  const strings = [];
  const escapedCode = escapeHtml(code).replace(
    /(`(?:\\.|[^`])*`|'(?:\\.|[^'])*'|"(?:\\.|[^"])*")/g,
    (match) => {
      const token = `LUMINASTRINGTOKEN${toLetters(strings.length)}`;
      strings.push({ token, value: match });
      return token;
    },
  );

  return strings.reduce(
    (highlightedCode, string) =>
      highlightedCode.replace(
        string.token,
        `<span class="code-string">${string.value}</span>`,
      ),
    escapedCode
      .replace(
        /\b(import|from|await|const|return|async|function)\b/g,
        '<span class="code-keyword">$1</span>',
      )
      .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>')
      .replace(/(\.[a-zA-Z_$][\w$]*)/g, '<span class="code-method">$1</span>'),
  );
}

function toLetters(index) {
  let value = '';
  let current = index;

  do {
    value = String.fromCharCode(65 + (current % 26)) + value;
    current = Math.floor(current / 26) - 1;
  } while (current >= 0);

  return value;
}
