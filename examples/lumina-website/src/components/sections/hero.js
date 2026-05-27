import {
  announcement,
  hero,
  heroCodeTabs,
  installCommandOptions,
} from '../../data/siteContent.js';
import { buttonLink, codeBlock, eyebrow, icon } from '../ui.js';

export function renderHero() {
  return `
    <section class="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 px-5 py-9 text-slate-950 shadow-2xl shadow-slate-900/10 sm:px-8 lg:px-10 lg:py-12">
      <div class="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-500 via-amber-400 to-rose-500"></div>
      <div class="mx-auto flex max-w-5xl flex-col items-center text-center">
        ${renderAnnouncement()}
        <span class="inline-flex min-h-8 w-fit items-center rounded-full border border-teal-200 bg-teal-50 px-3 text-xs font-extrabold uppercase tracking-wide text-teal-700">
          ${hero.eyebrow}
        </span>
        <h1 class="mt-5 max-w-5xl text-5xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl xl:text-7xl">
          ${hero.title}
        </h1>
        <p class="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          ${hero.body}
        </p>
        <div class="cta-row mt-7 justify-center">
          ${hero.actions.map(buttonLink).join('')}
        </div>
        <div class="mt-4 flex w-full flex-col justify-center gap-2 sm:flex-row sm:flex-wrap">
          ${hero.badges
            .map(
              (badge) => `
                <span class="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-extrabold text-teal-900">
                  ${icon(badge.icon, 'size-4')}
                  <strong>${badge.value}</strong>
                  <span class="hidden font-bold text-teal-700 sm:inline">${badge.label}</span>
                </span>
              `,
            )
            .join('')}
        </div>
        <div class="mt-5 grid w-full gap-3 sm:grid-cols-2">
          ${hero.metrics
            .map(
              (metric) => `
                <div class="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 text-left">
                  <span class="mb-3 grid size-9 place-items-center rounded-xl bg-white text-teal-700 shadow-sm shadow-slate-900/10">
                    ${icon(metric.icon, 'size-4')}
                  </span>
                  <strong class="block text-base text-slate-950">${metric.value}</strong>
                  <span class="mt-1 block text-sm leading-6 text-slate-600">${metric.label}</span>
                </div>
              `,
            )
            .join('')}
        </div>
      </div>
      ${renderHeroInstall()}
      ${renderHeroCodeTabs()}
    </section>
  `;
}

function renderAnnouncement() {
  return `
    <a class="mb-5 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-bold leading-6 text-teal-900 no-underline hover:border-teal-300 hover:bg-teal-100 sm:rounded-full" href="${announcement.href}">
      <span class="shrink-0 whitespace-nowrap rounded-full bg-teal-700 px-2 py-0.5 text-xs uppercase tracking-wide text-white">${announcement.label}</span>
      <span class="min-w-0 whitespace-normal break-words text-left">${announcement.text}</span>
    </a>
  `;
}

function renderHeroInstall() {
  return `
    <div class="mx-auto mt-9 max-w-5xl rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl shadow-slate-900/20">
      <div class="grid min-w-0 gap-3 xl:grid-cols-3">
        ${installCommandOptions
          .map(
            (option) => `
              <div class="overflow-hidden rounded-xl border border-teal-300/30 bg-white/[0.07] shadow-lg shadow-slate-950/20">
                <div class="flex items-center justify-between border-b border-white/10 px-3 py-2">
                  <span class="text-xs font-black uppercase tracking-wide text-teal-200">${option.label}</span>
                  <button class="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-teal-100 transition hover:border-teal-300 hover:bg-teal-300/15" type="button" data-copy-command="${option.command}" aria-label="Copy ${option.label} install command">
                    ${icon('clipboard', 'size-4')}
                  </button>
                </div>
                <pre class="overflow-x-auto p-4 text-sm font-black leading-6"><code><span class="text-slate-500">$</span> <span class="text-amber-200">${option.command.split(' ')[0]}</span> <span class="text-teal-200">${option.command.split(' ').slice(1).join(' ')}</span></code></pre>
              </div>
            `,
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderHeroCodeTabs() {
  return `
    <div class="mx-auto mt-9 max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5" data-code-tabs>
      <div class="grid gap-0 lg:grid-cols-[0.72fr_1.28fr]">
        <div class="border-b border-slate-200 bg-slate-50/80 p-5 lg:border-b-0 lg:border-r">
          ${eyebrow('Compare implementation')}
          <h2 class="mt-4 text-2xl font-black leading-tight text-slate-950">Same image workflow, three front-end surfaces.</h2>
          <p class="mt-3 leading-7 text-slate-600">Switch between Vanilla JS, React, and CSS utilities to see how LuminaJS fits the stack you are shipping.</p>
          <div class="mt-5 grid gap-2" role="tablist" aria-label="Hero code examples">
            ${heroCodeTabs
              .map(
                (tab, index) => `
                  <button class="code-tab-button ${index === 0 ? 'is-active' : ''}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="hero-code-${tab.id}" data-code-tab="${tab.id}">
                    ${icon(tab.icon, 'size-4')}
                    ${tab.label}
                  </button>
                `,
              )
              .join('')}
          </div>
        </div>
        <div class="min-w-0 bg-slate-950">
          ${heroCodeTabs
            .map(
              (tab, index) => `
                <div id="hero-code-${tab.id}" class="code-tab-panel ${index === 0 ? '' : 'hidden'}" role="tabpanel" data-code-panel="${tab.id}">
                  ${codeBlock(tab.code, 'min-h-[360px] rounded-none border-0')}
                </div>
              `,
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}
