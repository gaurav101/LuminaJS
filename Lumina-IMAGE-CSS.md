# Lumina Image CSS

`lumina-image.css` is the CSS-only side of LuminaJS. Use it when you want visual effects and interaction states, but do not want to modify underlying image pixels.

## When to Use It

Use Lumina Image CSS when you need:

- non-destructive styling (filters/transforms/hover effects)
- responsive image layouts and aspect-ratio utilities
- overlays/captions with zero canvas pipeline code

If you need pixel-level editing (crop, blur kernels, export blobs, image data pipelines), use the JavaScript API instead.

## Install and Import

```bash
npm install @gks101/luminajs
```

```js
// bundlers (Vite, Webpack, Next.js, React, etc.)
import '@gks101/luminajs/lumina-image.css';
```

```html
<!-- static HTML usage -->
<link
  rel="stylesheet"
  href="node_modules/@gks101/luminajs/dist/lumina-image.css"
/>
```

## Markup Contract

- Add `.lum-img` to any `<img>` you want Lumina CSS behavior on.
- Wrap with `.lum-frame` when you want overlays, captions, clipping, or aspect locking.

```html
<img
  class="lum-img lum-grayscale lum-hover-grayscale-off"
  src="photo.jpg"
  alt="Profile"
/>
```

```html
<div class="lum-frame lum-aspect-video">
  <img
    class="lum-img lum-fit-cover lum-hover-zoom"
    src="cover.jpg"
    alt="Cover"
  />
  <div class="lum-overlay lum-overlay-blur">Overlay Content</div>
</div>
```

## Utility Groups

- Filters: `.lum-blur-*`, `.lum-grayscale`, `.lum-sepia`, `.lum-invert`, `.lum-bright-*`, `.lum-contrast-*`, `.lum-saturate-*`, `.lum-hue-*`, `.lum-shadow-*`
- Transforms: `.lum-scale-*`, `.lum-rotate-*`, `.lum-flip-*`, `.lum-skew-*`, `.lum-tilt-*`
- Hover states: `.lum-hover-*` (zoom, rotate, grayscale toggle, blur toggle, 3D flip/tilt)
- Layout: `.lum-frame`, `.lum-overlay`, `.lum-caption-*`, `.lum-aspect-*`, `.lum-fit-*`, `.lum-grid`

All classes are composable because Lumina Image CSS is built on custom properties.

## Developer Notes

### 1) Runtime tuning through CSS variables

```js
const image = document.querySelector('.lum-img');
image.style.setProperty('--lum-scale', '1.08');
image.style.setProperty('--lum-rotate', '8deg');
image.style.setProperty('--lum-blur', 'blur(4px)');
image.style.setProperty('--lum-grayscale', 'grayscale(35%)');
```

### 2) Touch interaction support

Hover classes also respond to `:active` and `.lum-touch-active`. For mobile toggles, apply/remove `.lum-touch-active` on tap.

### 3) Accessibility and performance behavior (built in)

- `:focus-visible` outline for keyboard focus
- reduced motion support via `@media (prefers-reduced-motion: reduce)`
- mobile safety fallback (`max-width: 768px`) disables expensive blur/3D transforms

### 4) Design token overrides

Override these on a container or per-image:

- `--lum-trans-duration`
- `--lum-trans-timing`
- `--lum-focus-color`
- `--lum-border-radius`
- `--lum-frame-bg`
- `--lum-overlay-bg`
- `--lum-caption-bg`
- `--lum-grid-gap`
- `--lum-col-min`

## Framework Integration

React/Vue/Svelte usage is class-based, same as HTML:

```jsx
<div className="lum-frame lum-aspect-square">
  <img
    className="lum-img lum-fit-cover lum-hover-zoom lum-shadow"
    src={src}
    alt="Avatar"
  />
</div>
```

## Related Docs

- [Main README](./README.md)
- [ImageCropper Guide](./IMAGE_CROPPER_GUIDE.md)
- [LuminaCanvas Guide](./LuminaCanvas.md)
