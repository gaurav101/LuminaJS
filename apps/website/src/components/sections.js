import { renderHero } from './sections/hero.js';
import { renderNavigation, renderFooter } from './sections/navigation.js';
import { renderPlayground } from './sections/playground.js';
import {
  renderApiSurface,
  renderDemos,
  renderFeatures,
  renderFinalCta,
  renderInstall,
  renderMediaShowcase,
  renderUseCases,
  renderWorkflow,
} from './sections/content.js';

export function renderPage() {
  return `
    <div class="site-shell relative">
      ${renderNavigation()}
      <main>
        ${renderHero()}
        ${renderPlayground()}
        ${renderMediaShowcase()}
        ${renderUseCases()}
        ${renderFeatures()}
        ${renderApiSurface()}
        ${renderDemos()}
        ${renderInstall()}
        ${renderWorkflow()}
        ${renderFinalCta()}
      </main>
      ${renderFooter()}
    </div>
  `;
}
