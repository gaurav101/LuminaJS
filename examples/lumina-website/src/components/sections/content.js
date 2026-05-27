import {
  apiExamples,
  demos,
  features,
  finalCta,
  installCode,
  installCommands,
  mediaShowcase,
  packageHighlights,
  projectLinks,
  reactDemoSpotlight,
  useCases,
  workflow,
} from '../../data/siteContent.js';
import { buttonLink, codeBlock, eyebrow, icon } from '../ui.js';
import { sectionHeader } from './shared.js';

const toneClasses = {
  teal: 'bg-teal-600',
  blue: 'bg-blue-600',
  amber: 'bg-amber-500',
  rose: 'bg-rose-600',
  green: 'bg-green-700',
  violet: 'bg-violet-600',
};

export function renderMediaShowcase() {
  return `
    <section class="section">
      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          ${eyebrow('Media workflows')}
          <h2 class="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">Show the image journey from input to polished output.</h2>
        </div>
        <p class="max-w-xl leading-7 text-slate-600">Use the same asset across editing states, CSS treatments, and export previews so product teams can see how LuminaJS fits real UI flows.</p>
      </div>
      <div class="grid gap-4 lg:grid-cols-3">
        ${mediaShowcase
          .map(
            (item) => `
              <article class="group overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg shadow-slate-900/5">
                <div class="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img class="h-full w-full object-cover transition duration-500 group-hover:scale-105 ${item.imageClass}" src="./sample.png" alt="${item.title} preview created with LuminaJS" />
                  <span class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-slate-800 shadow-lg shadow-slate-900/10">
                    ${icon(item.icon, 'size-3.5')}
                    ${item.label}
                  </span>
                </div>
                <div class="p-5">
                  <h3 class="text-xl font-black text-slate-950">${item.title}</h3>
                  <p class="mt-2 leading-7 text-slate-600">${item.body}</p>
                </div>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

export function renderUseCases() {
  return `
    <section class="section" id="use-cases">
      ${sectionHeader('Built for product teams shipping real image workflows.', 'Use LuminaJS where image handling is part of the user experience, not a separate media-processing service.')}
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        ${useCases
          .map(
            (item) => `
              <article class="rounded-2xl border ${item.accent} p-5">
                <span class="mb-4 grid size-11 place-items-center rounded-xl bg-white/80 shadow-sm shadow-slate-900/10">
                  ${icon(item.icon)}
                </span>
                <h3 class="text-lg font-black">${item.title}</h3>
                <p class="mt-3 leading-7 text-slate-700">${item.body}</p>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

export function renderFeatures() {
  return `
    <section class="section" id="features">
      ${sectionHeader('Everything needed for browser image tooling.', 'Compose low-level filters, use React abstractions when the UI gets complex, or reach for CSS utilities when the job is presentation only.')}
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        ${features
          .map(
            (feature) => `
              <article class="card hover-card">
                <div class="mb-4 flex items-center justify-between">
                  <span class="grid size-11 place-items-center rounded-xl bg-slate-50 text-slate-900">
                    ${icon(feature.icon)}
                  </span>
                  <span class="h-1 w-11 rounded-full ${toneClasses[feature.tone]}"></span>
                </div>
                <h3 class="text-lg font-extrabold text-slate-950">${feature.title}</h3>
                <p class="mt-3 leading-7 text-slate-600">${feature.body}</p>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

export function renderApiSurface() {
  return `
    <section class="section" id="api">
      ${sectionHeader('One library surface, three implementation modes.', 'Pick the level that matches the feature you are building: framework-agnostic JavaScript, React UI, or CSS-only image presentation.')}
      <div class="grid gap-5">
        <div class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              ${eyebrow('Package contents')}
              <h3 class="mt-4 text-3xl font-black leading-tight text-slate-950">What ships in the package</h3>
              <p class="mt-3 max-w-3xl leading-7 text-slate-600">
                Install one package and use only the surface your application needs: core JavaScript, React components, CSS utilities, or export helpers.
              </p>
            </div>
            <a class="btn bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-900/20 hover:bg-slate-800" href="${projectLinks.github}">
              ${icon('github', 'size-4')}
              GitHub repository
            </a>
          </div>
          <div class="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            ${packageHighlights
              .map(
                (item) => `
                  <article class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <span class="grid size-10 place-items-center rounded-xl bg-white text-teal-700 shadow-sm shadow-slate-900/10">
                      ${icon(item.icon)}
                    </span>
                    <h4 class="mt-4 text-base font-black text-slate-950">${item.title}</h4>
                    <p class="mt-2 text-sm leading-6 text-slate-600">${item.body}</p>
                  </article>
                `,
              )
              .join('')}
          </div>
        </div>
        <div class="grid gap-4 lg:grid-cols-3">
          ${apiExamples
            .map(
              (example) => `
                <article class="overflow-hidden rounded-2xl border border-slate-200 bg-white/90">
                  <div class="p-5">
                    <span class="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-slate-700">${example.label}</span>
                    <h3 class="mt-4 text-xl font-black text-slate-950">${example.title}</h3>
                    <p class="mt-2 leading-7 text-slate-600">${example.body}</p>
                  </div>
                  ${codeBlock(example.code, 'min-h-64 rounded-none border-0 text-xs md:text-sm')}
                </article>
              `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

export function renderDemos() {
  return `
    <section class="section" id="demos">
      ${sectionHeader('Explore the working demos.', 'Each demo is built from the example projects and can be opened directly from this generated artifact folder.')}
      ${renderReactDemoSpotlight()}
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        ${demos
          .map(
            (demo) => `
              <a class="card hover-card group min-h-44 no-underline" href="${demo.href}">
                <span class="mb-4 grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-700 transition duration-200 group-hover:bg-blue-600 group-hover:text-white">
                  ${icon(demo.icon)}
                </span>
                <span class="inline-flex w-fit rounded-lg bg-blue-50 px-2 py-1 text-xs font-black uppercase tracking-wide text-blue-700">${demo.label}</span>
                <strong class="mt-3 block text-base text-slate-950">${demo.title}</strong>
                <span class="mt-3 block leading-6 text-slate-600">${demo.body}</span>
              </a>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderReactDemoSpotlight() {
  return `
    <article class="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-xl shadow-slate-900/5 lg:grid lg:grid-cols-[0.82fr_1.18fr]">
      <div class="p-6 lg:p-7">
        ${eyebrow(reactDemoSpotlight.eyebrow)}
        <h3 class="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">${reactDemoSpotlight.title}</h3>
        <p class="mt-4 leading-8 text-slate-600">${reactDemoSpotlight.body}</p>
        <div class="cta-row mt-6">
          ${buttonLink({ label: 'Open React Demo', href: reactDemoSpotlight.href, variant: 'primary', icon: 'react' })}
        </div>
      </div>
      <div class="bg-slate-950 p-3">
        <video class="aspect-video h-full w-full rounded-xl bg-slate-900 object-cover shadow-2xl shadow-slate-950/30" src="${reactDemoSpotlight.video}" controls muted playsinline preload="metadata" aria-label="React demo walkthrough video"></video>
      </div>
    </article>
  `;
}

export function renderInstall() {
  return `
    <section class="section" id="install">
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-xl shadow-slate-900/5 lg:grid lg:grid-cols-[0.82fr_1.18fr]">
        <div class="bg-gradient-to-br from-amber-50 via-white to-teal-50 p-7">
          ${eyebrow('Developer quick start')}
          <h2 class="mt-4 text-3xl font-black leading-tight text-slate-950">Install once. Use only what you need.</h2>
          <p class="mt-4 leading-8 text-slate-600">
            LuminaJS exposes core modules, filter helpers, React exports, and CSS utilities so applications can stay focused and avoid pulling in a full image editor stack.
          </p>
          <dl class="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-white/75 p-3">
              <dt class="font-black text-slate-950">Package</dt>
              <dd class="mt-1">@gks101/luminajs</dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white/75 p-3">
              <dt class="font-black text-slate-950">Code</dt>
              <dd class="mt-2">
                <a class="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 font-bold text-white hover:bg-slate-800" href="${projectLinks.github}">
                  ${icon('github', 'size-4')}
                  GitHub repository
                </a>
              </dd>
            </div>
          </dl>
          <div class="cta-row mt-6">
            ${buttonLink({ label: 'Read API Docs', href: './docs', variant: 'primary' })}
            ${buttonLink({ label: 'View GitHub', href: projectLinks.github, variant: 'secondary', icon: 'github' })}
          </div>
        </div>
        <div class="grid gap-px bg-slate-200 lg:grid-cols-2">
          <div class="bg-white">
            <div class="border-b border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-600">Install</div>
            ${codeBlock(installCommands, 'h-full min-h-72 rounded-none border-0')}
          </div>
          <div class="bg-white">
            <div class="border-b border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-600">Usage</div>
            ${codeBlock(installCode, 'h-full min-h-72 rounded-none border-0')}
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderWorkflow() {
  return `
    <section class="section">
      ${sectionHeader('A practical image workflow model.', 'The API follows the way browser image tools are usually built: load, preview, compose, and export.')}
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        ${workflow
          .map(
            (step, index) => `
              <article class="card hover-card p-6">
                <div class="flex items-center justify-between">
                  <b class="grid size-8 place-items-center rounded-lg bg-teal-50 text-teal-700">${index + 1}</b>
                  <span class="grid size-11 place-items-center rounded-xl bg-slate-50 text-slate-900">
                    ${icon(step.icon)}
                  </span>
                </div>
                <h3 class="mt-4 text-lg font-extrabold text-slate-950">${step.title}</h3>
                <p class="mt-2 leading-7 text-slate-600">${step.body}</p>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

export function renderFinalCta() {
  return `
    <section class="section">
      <div class="rounded-[2rem] border border-slate-800 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/25 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8">
        <div>
          <h2 class="max-w-2xl text-3xl font-black leading-tight sm:text-4xl">${finalCta.title}</h2>
          <p class="mt-3 max-w-2xl leading-8 text-slate-300">${finalCta.body}</p>
        </div>
        <div class="cta-row mt-6 sm:flex-nowrap lg:mt-0 lg:justify-end">
          ${finalCta.actions.map(buttonLink).join('')}
        </div>
      </div>
    </section>
  `;
}
