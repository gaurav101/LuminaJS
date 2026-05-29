# LuminaJS Project Structure

This repository is an npm workspaces monorepo orchestrated by Nx. Nx owns task
execution and caching; each package or app keeps the build tool that fits it
best.

## Top-Level Layout

```text
.
├── apps/
│   ├── css-demo/          # Vite app demonstrating lumina-image.css utilities
│   ├── react-demo/        # Vite + React app and Storybook stories
│   ├── vanilla-demo/      # Plain JavaScript Vite demo
│   └── website/           # Marketing/docs website built with Vite
├── packages/
│   └── luminajs/          # Publishable @gks101/luminajs package
│       ├── src/           # Core, filters, React bindings, and CSS source
│       ├── tests/         # Vitest unit tests for the package
│       ├── dist/          # Generated package output, not source of truth
│       ├── package.json   # npm publish metadata and package-local scripts
│       ├── project.json   # Nx targets for this package
│       ├── rollup.config.js
│       ├── tsconfig.json
│       └── jsdoc.json
├── tools/
│   └── scripts/           # Workspace automation scripts
├── docs/                  # Generated JSDoc site output
├── build-artifacts/       # Generated GitHub Pages bundle output
├── nx.json                # Nx workspace defaults and cache inputs
├── package.json           # Root workspace scripts and shared dev tooling
└── package-lock.json      # Single lockfile for all workspaces
```

## Where To Work

- Library core and chain API: `packages/luminajs/src/core/`
- Individual pixel filters: `packages/luminajs/src/filters/`
- React exports: `packages/luminajs/src/react/`
- CSS utility source: `packages/luminajs/src/lumina-image.css`
- Package tests: `packages/luminajs/tests/`
- React integration demo: `apps/react-demo/`
- Public website content: `apps/website/src/data/siteContent.js`
- Release/docs automation: `tools/scripts/`

## Nx Projects

```bash
npx nx show projects
```

Current projects:

- `@gks101/luminajs` - publishable library package
- `react-demo` - React example app and Storybook
- `website` - website/docs landing app
- `vanilla-demo` - plain JavaScript example app
- `css-demo` - CSS utilities example app

## Common Commands

```bash
npm run build          # build all Nx projects
npm run build:lib      # build only packages/luminajs
npm run build:apps     # build all apps
npm run test           # run package tests through Nx
npm run test:exports   # verify published package exports
npm run lint           # run lint targets
npm run format:check   # verify Prettier formatting
```

## Generated Output

- Package build output: `packages/luminajs/dist/`
- React demo output: `apps/react-demo/dist/`
- Website output: `apps/website/dist/`
- Vanilla demo output: `apps/vanilla-demo/dist/`
- CSS demo output: `apps/css-demo/dist/`
- JSDoc output: `docs/`
- Combined deploy artifact output: `build-artifacts/`

Do not edit generated output by hand. Change source files, then rerun the
relevant Nx target.
