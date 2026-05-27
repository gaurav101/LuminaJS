import {
  playgroundCodeTabs,
  playgroundDemos,
  playgroundFilters,
} from '../../data/siteContent.js';
import { buttonLink, codeBlock, eyebrow, icon } from '../ui.js';

export function renderPlayground() {
  return `
    <section class="section" id="playground">
      <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 shadow-2xl shadow-slate-900/10" data-playground>
        <div class="grid gap-0 lg:grid-cols-[0.88fr_1.12fr]">
          <div class="border-b border-slate-200 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-6 lg:border-b-0 lg:border-r lg:p-7">
            ${eyebrow('Live canvas playground')}
            <h2 class="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">Drop a photo. Tune it on the page.</h2>
            <p class="mt-4 leading-8 text-slate-600">
              Try the same browser-side workflow LuminaJS is built for: load local media, adjust pixels, crop the frame, and preview the result without uploading the file.
            </p>

            <label class="mt-6 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-300 bg-white/80 p-5 text-center transition hover:border-teal-500 hover:bg-teal-50" data-drop-zone>
              <input class="sr-only" type="file" accept="image/*" data-image-input />
              <span class="grid size-12 place-items-center rounded-2xl bg-teal-100 text-teal-800">${icon('upload')}</span>
              <strong class="mt-3 text-base text-slate-950">Drop an image or browse</strong>
              <span class="mt-1 text-sm leading-6 text-slate-600" data-playground-status>Using the sample image until you choose a local file.</span>
            </label>

            <div class="mt-6 grid gap-4">
              ${renderRangeControl('Brightness', 'brightness', -80, 80, 0)}
              ${renderRangeControl('Contrast', 'contrast', -80, 80, 18)}
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <button class="btn bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-900/20 hover:bg-slate-800" type="button" data-apply-crop>
                ${icon('crop', 'size-4')}
                Apply crop
              </button>
              <button class="btn bg-white text-slate-950 border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50" type="button" data-reset-crop>
                ${icon('image', 'size-4')}
                Reset image
              </button>
            </div>

            <p class="mt-5 rounded-2xl border border-teal-200 bg-white/75 p-4 text-sm font-bold leading-6 text-slate-700">
              This embedded playground is a lightweight preview of the LuminaJS workflow. For the complete feature demos, open the full examples below.
            </p>

            <div class="playground-demo-actions mt-5">
              ${playgroundDemos.map(buttonLink).join('')}
            </div>
          </div>

          <div class="bg-slate-950 p-4 sm:p-6">
            <div class="flex items-center justify-between rounded-t-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-slate-200">
              <span class="inline-flex items-center gap-2">${icon('canvas', 'size-4')} Canvas preview</span>
              <span data-playground-timing>Ready</span>
            </div>
            <div class="relative overflow-hidden rounded-b-2xl border-x border-b border-white/10 bg-slate-900" data-crop-stage>
              <canvas class="aspect-video h-full min-h-[320px] w-full bg-slate-900 object-contain" width="960" height="540" data-playground-canvas></canvas>
              <div class="absolute hidden cursor-move border-2 border-teal-300 bg-teal-300/15 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]" data-crop-box>
                ${['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
                  .map(
                    (handle) =>
                      `<span class="crop-handle crop-handle-${handle}" data-crop-handle="${handle}"></span>`,
                  )
                  .join('')}
              </div>
              <div class="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl bg-slate-950/75 px-3 py-2 text-sm font-bold text-white backdrop-blur" data-crop-help>Drag on the image to select a crop area.</div>
            </div>
            <div class="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <div class="mb-3 flex items-center justify-between gap-3 text-sm font-bold text-slate-200">
                <span>Filter previews</span>
                <span class="text-xs uppercase tracking-wide text-slate-400">LuminaJS API</span>
              </div>
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                ${playgroundFilters
                  .map(
                    (filter, index) => `
                      <button class="filter-preset ${index === 0 ? 'is-active' : ''}" type="button" data-filter="${filter.id}">
                        <canvas class="h-16 w-full rounded-lg bg-slate-800 object-cover" width="160" height="90" data-filter-preview="${filter.id}"></canvas>
                        <span>${filter.label}</span>
                      </button>
                    `,
                  )
                  .join('')}
              </div>
            </div>
            ${renderPlaygroundCodeTabs()}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderPlaygroundCodeTabs() {
  return `
    <div class="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950" data-code-tabs>
      <div class="flex flex-col gap-3 border-b border-white/10 bg-white/[0.06] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap gap-2" role="tablist" aria-label="Playground code examples">
          ${playgroundCodeTabs
            .map(
              (tab, index) => `
                <button class="playground-code-tab ${index === 0 ? 'is-active' : ''}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="playground-code-${tab.id}" data-code-tab="${tab.id}">
                  ${icon(tab.icon, 'size-4')}
                  ${tab.label}
                </button>
              `,
            )
            .join('')}
        </div>
        <button class="copy-button" type="button" data-copy-code>
          ${icon('clipboard', 'size-4')}
          <span data-copy-label>Copy</span>
        </button>
      </div>
      ${playgroundCodeTabs
        .map(
          (tab, index) => `
            <div id="playground-code-${tab.id}" class="code-tab-panel ${index === 0 ? '' : 'hidden'}" role="tabpanel" data-code-panel="${tab.id}">
              ${codeBlock(tab.code, 'max-h-[420px] rounded-none border-0 text-xs')}
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderRangeControl(label, name, min, max, value) {
  return `
    <label class="grid gap-2 rounded-2xl border border-slate-200 bg-white/75 p-4">
      <span class="flex items-center justify-between gap-3 text-sm font-black text-slate-800">
        <span>${label}</span>
        <output class="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700" data-control-value="${name}">${value}</output>
      </span>
      <input class="accent-teal-600" type="range" min="${min}" max="${max}" value="${value}" data-control="${name}" />
    </label>
  `;
}
