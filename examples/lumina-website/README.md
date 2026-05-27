# Lumina Website

Marketing website for the LuminaJS examples bundle.

## Structure

- `index.html` is the Vite entry shell.
- `src/main.js` mounts the page.
- `src/data/siteContent.js` owns page copy, links, cards, workflow steps, and code snippets.
- `src/components/sections.js` renders page sections from data.
- `src/components/ui.js` contains small shared rendering helpers.
- `src/styles.css` imports Tailwind CSS and defines project-level component classes.
- `public/` contains static assets copied to the build root.

## Commands

```bash
npm run dev
npm run build
npm run preview
```

The repository-level `npm run build:examples-docs` builds this project first and copies `dist/` to the root of `build-artifacts`.
