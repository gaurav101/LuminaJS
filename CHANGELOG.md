# Changelog

All notable changes to this project are documented in this file.

## 2.0.5-beta - 2026-05-24

### Browser-Only Positioning

- Clarified package scope across docs: LuminaJS is browser-first/client-side and not intended for server-side Node.js image processing.
- Added explicit guidance to use Sharp/Jimp/ImageMagick for server-side pipelines.
- Added SSR/client-only guidance for React usage.

### Packaging and Exports

- Finalized strict ESM-first package exports and removed CommonJS `require` export paths.
- Updated the React example to consume the local package directory instead of a generated tarball, so fresh clones can build the example without a release artifact.
- Kept stable public subpath exports:
  - `@gks101/luminajs`
  - `@gks101/luminajs/core`
  - `@gks101/luminajs/filters`
  - `@gks101/luminajs/react`
  - `@gks101/luminajs/lumina-image.css`
- Added/validated package export smoke tests (`npm run test:exports`).
- Added a React example build check script (`npm run test:examples:react`) for release verification.
- Verified release footprint with `npm pack --dry-run`.

### React API Polish

- Made `ImageCropper`'s `showPreview` prop explicit and functional. It now controls whether the applied crop result is rendered inside the cropper after Apply.
- Hardened `ImageCropper` file/object URL handling so server render evaluation does not reference browser-only globals directly.

### Documentation Accuracy

- Replaced loose performance and bundle-size claims with scoped language around Canvas rendering, JavaScript `ImageData` filters, ESM entry points, and zero runtime dependencies.
- Added a golden-path upload workflow example: select image, render preview, export final blob, and upload.
- Added browser compatibility notes, including Safari/iOS memory cautions for large images.

### Lumina Image CSS Positioning

- Repositioned Lumina Image CSS as:
  - CSS-only image effects
  - non-destructive image styling
- Explicitly documented limitations:
  - CSS cannot crop/mutate/export image pixels.
- Added CSS vs JS capability comparison docs in `README.md` and `Lumina-IMAGE-CSS.md`.
- Documented CSS distribution policy:
  - keep subpath import `@gks101/luminajs/lumina-image.css`
  - no standalone `@gks101/lumina-image-css` package for now (future option)
- Added static HTML usage examples (CDN + local package path).
- Enforced CSS size target (<= 18 KB minified) in build-time CSS minification.
