export function sectionHeader(title, body) {
  return `
    <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <h2 class="max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">${title}</h2>
      <p class="max-w-xl leading-7 text-slate-600">${body}</p>
    </div>
  `;
}
