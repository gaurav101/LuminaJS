import { navigation } from '../../data/siteContent.js';

export function renderNavigation() {
  return `
    <nav class="sticky top-0 z-20 flex flex-col gap-4 border-b border-slate-200/70 bg-white/75 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between" aria-label="Primary navigation">
      <a class="inline-flex items-center gap-3 text-lg font-black no-underline" href="./index.html" aria-label="LuminaJS home">
        <span class="grid size-10 place-items-center rounded-lg bg-slate-950 text-white shadow-lg shadow-slate-900/20">L</span>
        <span class="tracking-tight">LuminaJS</span>
      </a>
      <div class="flex flex-wrap gap-2">
        ${navigation
          .map(
            (item) => `
              <a class="rounded-lg border border-transparent px-3.5 py-2 text-sm font-bold text-slate-600 hover:border-slate-200 hover:bg-white/80 hover:text-slate-950" href="${item.href}">
                ${item.label}
              </a>
            `,
          )
          .join('')}
      </div>
    </nav>
  `;
}

export function renderFooter() {
  return `
    <footer class="flex flex-col gap-3 border-t border-slate-200 py-10 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p>LuminaJS is built for browser-first image processing, React image UI, and CSS-only visual image effects.</p>
      <a class="font-bold text-slate-900 hover:text-teal-700" href="./docs">API reference</a>
    </footer>
  `;
}
