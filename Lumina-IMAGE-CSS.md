# Lumina Image CSS

`lumina-image.css` is the CSS-only layer in LuminaJS. Use it when you want rich image UI behavior without pixel mutation.

> Runtime scope: LuminaJS is browser-first and client-side. Node.js/server-side image processing is out of scope for this package.  
> For server-side transformations, use Sharp/Jimp/ImageMagick.

## When To Use It

Use Lumina Image CSS for:

- non-destructive image styling
- reusable utility classes (filters, transforms, motion, overlays)
- responsive image grids and framed media cards
- loading skeletons and interaction states with minimal custom CSS

Use the JavaScript API when you need pixel-level processing (`ImageData`, crop pipelines, blur kernels, blob export, etc.).

## Install and Import

```bash
npm install @gks101/luminajs
```

```js
// Vite / Webpack / Next / React / Vue / Svelte
import '@gks101/luminajs/lumina-image.css';
```

```html
<!-- static HTML -->
<link
  rel="stylesheet"
  href="node_modules/@gks101/luminajs/dist/lumina-image.css"
/>
```

## Core Markup Pattern

```html
<img
  class="lum-img lum-fit-cover lum-hover-zoom"
  src="photo.jpg"
  alt="Preview"
/>
```

```html
<div class="lum-frame lum-aspect-video lum-frame-glass">
  <img
    class="lum-img lum-fit-cover lum-animate-kenburns"
    src="cover.jpg"
    alt="Cover"
  />
  <div class="lum-overlay lum-overlay-bottom lum-overlay-brand">
    Overlay Content
  </div>
</div>
```

## Utility Catalog

### 1) Filters

- Blur: `.lum-blur-xs`, `.lum-blur-sm`, `.lum-blur`, `.lum-blur-lg`, `.lum-blur-xl`
- Tone: `.lum-grayscale`, `.lum-sepia`, `.lum-invert`
- Brightness: `.lum-bright-50`, `-75`, `-110`, `-125`, `-150`, `-200`
- Contrast: `.lum-contrast-50`, `-75`, `-125`, `-150`, `-200`
- Saturation: `.lum-saturate-0`, `-50`, `-125`, `-150`, `-200`
- Hue: `.lum-hue-30`, `-60`, `-90`, `-180`, `-270`
- Opacity: `.lum-opacity-0`, `-25`, `-50`, `-75`, `-90`
- Shadow: `.lum-shadow-sm`, `.lum-shadow`, `.lum-shadow-lg`, `.lum-shadow-xl`, `.lum-shadow-glow`

### 2) Transforms

- Scale: `.lum-scale-50`, `-75`, `-90`, `-95`, `-105`, `-110`, `-120`, `-150`
- Rotate: `.lum-rotate-*` and `.lum-rotate-n*`
- Flip: `.lum-flip-h`, `.lum-flip-v`, `.lum-flip-both`
- Skew: `.lum-skew-x-*`, `.lum-skew-y-*`
- 3D tilt: `.lum-tilt-l`, `.lum-tilt-r`, `.lum-tilt-u`, `.lum-tilt-d`

### 3) Hover Effects

- Scale/rotate: `.lum-hover-zoom`, `.lum-hover-shrink`, `.lum-hover-rotate-l`, `.lum-hover-rotate-r`
- 3D interaction: `.lum-hover-tilt-*`, `.lum-hover-rotate-3d`, `.lum-hover-flip-h`, `.lum-hover-flip-v`
- Filter toggles: `.lum-hover-grayscale-off`, `.lum-hover-grayscale-on`, `.lum-hover-blur-off`, `.lum-hover-blur-on`, `.lum-hover-sepia-on`, `.lum-hover-invert-on`, `.lum-hover-bright-on`, `.lum-hover-bright-off`

### 4) Motion / Animation Utilities

- Animation presets: `.lum-animate-float`, `.lum-animate-pulse`, `.lum-animate-breathe`, `.lum-animate-kenburns`, `.lum-animate-spin-slow`
- Timing controls: `.lum-anim-fast`, `.lum-anim-slow`, `.lum-anim-delay-1`, `.lum-anim-delay-2`
- Playback controls: `.lum-anim-once`, `.lum-anim-loop`, `.lum-anim-paused`

### 5) Layout and Framing

- Frame container: `.lum-frame`
- Frame variants: `.lum-frame-soft`, `.lum-frame-sharp`, `.lum-frame-flat`, `.lum-frame-border`, `.lum-frame-border-strong`, `.lum-frame-glass`
- Aspect ratio: `.lum-aspect-square`, `.lum-aspect-video`, `.lum-aspect-standard`, `.lum-aspect-portrait`, `.lum-aspect-cinematic`, `.lum-aspect-golden`
- Fit and position: `.lum-fit-cover`, `.lum-fit-contain`, `.lum-fit-fill`, `.lum-pos-*`
- Grid: `.lum-grid`, `.lum-grid-cols-2`, `.lum-grid-cols-3`, `.lum-grid-cols-4`, `.lum-grid-gap-sm`, `.lum-grid-gap-lg`

### 6) Overlays and Captions

- Overlay base: `.lum-overlay`, optional `.lum-overlay-blur`
- Overlay placement: `.lum-overlay-top`, `.lum-overlay-bottom`, `.lum-overlay-left`, `.lum-overlay-right`
- Overlay themes: `.lum-overlay-dark`, `.lum-overlay-brand`, `.lum-overlay-warm`
- Caption transitions: `.lum-caption-slide-up`, `-slide-down`, `-slide-left`, `-slide-right`, `-fade`, `-scale`

### 7) Loading State

- Placeholder shimmer: `.lum-loading`
- Completion state: `.lum-loaded`

```html
<div class="lum-frame lum-aspect-video lum-loading" id="heroMedia">
  <img class="lum-img lum-fit-cover" src="hero.jpg" alt="Hero" />
</div>

<script>
  const img = document.querySelector('#heroMedia img');
  const frame = document.getElementById('heroMedia');
  img.addEventListener('load', () => {
    frame.classList.remove('lum-loading');
    frame.classList.add('lum-loaded');
  });
</script>
```

## Developer Notes

### Runtime variable overrides

```js
const image = document.querySelector('.lum-img');
image.style.setProperty('--lum-scale', '1.08');
image.style.setProperty('--lum-rotate', '6deg');
image.style.setProperty('--lum-blur', 'blur(3px)');
image.style.setProperty('--lum-grayscale', 'grayscale(25%)');
image.style.setProperty('--lum-anim-duration', '7s');
```

### Key tokens you can override

- Transition: `--lum-trans-duration`, `--lum-trans-timing`
- Focus: `--lum-focus-color`
- Frame: `--lum-border-radius`, `--lum-frame-bg`, `--lum-frame-border-width`, `--lum-frame-border-color`
- Overlay/caption: `--lum-overlay-bg`, `--lum-caption-bg`
- Grid: `--lum-grid-gap`, `--lum-col-min`
- Animation: `--lum-anim-name`, `--lum-anim-duration`, `--lum-anim-timing`, `--lum-anim-delay`, `--lum-anim-iteration`, `--lum-anim-play-state`

### Accessibility and platform behavior

- keyboard focus ring via `:focus-visible`
- reduced motion support via `@media (prefers-reduced-motion: reduce)`
- mobile performance fallback disables heavy blur/3D transforms under `768px`
- hover classes also respond to `:active` and `.lum-touch-active` for touch devices

## Framework Example (React)

```jsx
<div className="lum-frame lum-aspect-video lum-frame-glass">
  <img
    className="lum-img lum-fit-cover lum-animate-kenburns lum-hover-bright-on"
    src={src}
    alt="Hero"
  />
  <div className="lum-overlay lum-overlay-bottom lum-overlay-dark">
    <p>Open Gallery</p>
  </div>
</div>
```

## Related Docs

- [Main README](./README.md)
- [ImageCropper Guide](./IMAGE_CROPPER_GUIDE.md)
- [LuminaCanvas Guide](./LuminaCanvas.md)
