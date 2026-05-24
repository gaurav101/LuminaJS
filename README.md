# LuminaJS

[![bundle size](https://badgen.net/bundlephobia/minzip/%40gks101%2Fluminajs)](https://bundlephobia.com/package/@gks101/luminajs) [![license](https://img.shields.io/badge/license-MIT-green)](LICENSE) [![tree shaking](https://badgen.net/bundlephobia/tree-shaking/%40gks101%2Fluminajs)](https://bundlephobia.com/package/@gks101/luminajs) [![dependency count](https://badgen.net/bundlephobia/dependency-count/%40gks101%2Fluminajs)](https://bundlephobia.com/package/@gks101/luminajs)

LuminaJS is a modular, chainable, lightweight, zero-dependency **browser-first** JavaScript utility library for image processing with the HTML5 Canvas and `ImageData` APIs.

> Scope: LuminaJS is for browser/client runtimes. It is not a universal JS image processor and is not designed for Node.js server-side image pipelines.  
> For server-side image processing, use tools like **Sharp**, **Jimp**, or **ImageMagick**.

## What LuminaJS Is / Is Not

- **LuminaJS is:** a browser-first Canvas + `ImageData` library for interactive client-side image workflows.
- **LuminaJS is:** optimized for modern ESM bundlers with modular imports.
- **LuminaJS is not:** a Node.js/server-side image processing engine.
- **LuminaJS is not:** a GPU shader/WebGL pipeline; pixel filters run in JavaScript on `ImageData`.

## Demo, Examples, Code and Docs

- [Demo-react](https://gaurav101.github.io/LuminaJS/examples/react)
- [Demo-react-storybook](https://gaurav101.github.io/LuminaJS/examples/react/storybook/)
- [Demo-vanila-js](https://gaurav101.github.io/LuminaJS/)
- [Code](https://github.com/gaurav101/LuminaJS)
- [NPM](https://www.npmjs.com/package/@gks101/luminajs)
- [Documentation](https://gaurav101.github.io/LuminaJS/docs/)
- [Lumina Image CSS Guide](./Lumina-IMAGE-CSS.md)
- [Performance Guide](./PERFORMANCE.md)

## Features

- **🚀 High Performance**: Optimized `ImageData` loops for fast pixel processing.
- **🧩 Modular**: Only import the filters and utilities you need.
- **🖼️ Canvas-Powered**: Leverages the HTML5 Canvas API for seamless browser integration.
- **📦 Lightweight**: Zero external dependencies (no jQuery, no Lodash).

### Performance Notes

- Heavy filters (`blur`, `gaussianBlur`, `backgroundBlur`, convolution-based filters) can block the main thread on large images.
- Resize first for previews/interactions, then process full resolution only for final export.
- Use Web Workers for expensive operations to keep UI interactions responsive.
- See [Performance Guide](./PERFORMANCE.md) for benchmark harness and worker examples.

### Why Choose LuminaJS?

While libraries like **Jimp** are built for heavy-duty server-side processing, **[LuminaJS](https://www.npmjs.com/package/@gks101/luminajs)** is a surgical tool optimized for the modern web. It trades massive dependency trees for raw browser performance.

---

### 🚀 Key Advantages

- **Low-Latency UX:** Canvas rendering/compositing paths can be browser-optimized, while filters run in JavaScript over `ImageData`.
- **Ultra-Lightweight:** At just **~3.5 KB**, it preserves your bundle size and [Core Web Vitals](https://web.dev/vitals/), whereas Jimp can add several megabytes to your frontend.
- **Privacy-Centric:** All processing happens on the client’s machine. Sensitive user data never leaves the browser.
- **Modern DX:** Native **TypeScript** support and a clean, chainable API designed for ESM workflows.

---

### 🎯 Best Use Cases

| Scenario            | [LuminaJS](https://www.npmjs.com/package/@gks101/luminajs) | Jimp/Other                                |
| ------------------- | ---------------------------------------------------------- | ----------------------------------------- |
| **Interactive UI**  | **Best.** Real-time filters & previews.                    | Slow; often requires loaders.             |
| **Edge Cases**      | **Best.** Works in Web Workers.                            | High memory overhead.                     |
| **Marketing Tools** | **Best.** Dynamic watermarks & social overlays.            | Overkill; increases bounce rates.         |
| **Server-Side**     | Out of scope (use Sharp/Jimp/ImageMagick)                  | **Best.** Built for Node.js environments. |

---

### ⚡ At a Glance

| Feature          | [LuminaJS](https://www.npmjs.com/package/@gks101/luminajs) | Jimp/Other          |
| ---------------- | ---------------------------------------------------------- | ------------------- |
| **Bundle Size**  | **~3.5 KB**                                                | ~Megabytes          |
| **Execution**    | JS pixel filters on `ImageData` + Canvas rendering         | Mostly JS pipelines |
| **Environment**  | Browser / OffscreenCanvas (client-side)                    | Node.js / Browser   |
| **Dependencies** | **Zero**                                                   | Multiple            |
| **API Style**    | Chainable & Functional                                     | Chainable           |

**Positioning:** Use **[LuminaJS](https://www.npmjs.com/package/@gks101/luminajs)** when you need high-performance image effects without sacrificing your application's load speed.

```bash
# npm
npm install @gks101/luminajs

# pnpm
pnpm add @gks101/luminajs

# yarn
yarn add @gks101/luminajs
```

### React Support

LuminaJS includes first-class React support via hooks and components. See the [React Integration](#react-integration) section for full examples.

> SSR/Next.js: LuminaJS React components and hooks depend on browser APIs (`window`, `<canvas>`, `ImageData`). Use them only on the client side (`'use client'`, `next/dynamic(..., { ssr: false })`, or equivalent).

#### React Accessibility Notes

- `ImageCropper` / `ImageAreaSelector` support keyboard movement (arrow keys), larger movement (`Shift + Arrow`), and resize (`Alt + Arrow`) once the crop region exists.
- Apply/Reset controls expose ARIA labels and can be themed via class/style hooks.
- Current limitation: drag-selection and resize handles are still pointer-first interactions. Screen-reader narration for geometric crop state (x/y/width/height) is limited.
- For strict WCAG workflows, pair crop interactions with explicit numeric inputs for crop coordinates and dimensions in your surrounding UI.

```bash
# npm
npm install @gks101/luminajs

# pnpm
pnpm add @gks101/luminajs

# yarn
yarn add @gks101/luminajs
```

```jsx
import { useLumina, LuminaCanvas, ImageCropper } from '@gks101/luminajs/react';
```

### Lumina Image CSS (CSS-Only Mode)

Need polished image UI without rewriting pixels? Use [`lumina-image.css`](./Lumina-IMAGE-CSS.md) for CSS-only image effects and non-destructive image styling (filters, hover effects, overlays, layout utilities).

CSS effects are presentation-only: they do not crop pixels, mutate source image data, or export transformed pixel output.

| Capability                           | Lumina Image CSS     | LuminaJS (JS API)                            |
| ------------------------------------ | -------------------- | -------------------------------------------- |
| Filters / hover effects / transforms | Yes                  | Yes                                          |
| Overlays / layout utilities          | Yes                  | Limited (handled in your UI/CSS)             |
| Pixel crop/resize                    | No                   | Yes (`crop`, `resize`)                       |
| Blob/data URL export                 | No                   | Yes (`toBlob`, `toDataURL`)                  |
| Permanent pixel changes              | No (non-destructive) | Yes (`ImageData` processing + export/render) |

```js
import '@gks101/luminajs/lumina-image.css';
```

## Building from Source

If you want to generate the optimized distributable files locally:

```bash
# 1. Install dependencies
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# 2. Run the build command
npm run build
```

The output will be generated in the `dist/` directory.

## Usage

### 💎 Premium Chainable API (Recommended)

The easiest way to use LuminaJS is via the fluent chainable API. It handles image loading, canvas management, and filter sequencing automatically.

```javascript
import { lumina } from '@gks101/luminajs';

// Process an image from a URL, apply filters, and draw to a canvas
await lumina('photo.jpg')
  .brightness(20)
  .contrast(10)
  .grayscale()
  .sharpen()
  .toCanvas(document.getElementById('myCanvas'));

// Quick display in an <img> tag using an ID
await lumina('photo.jpg').sepia().toHtmlElement('myImageElement');

// Or get the result as a Blob for uploading
const blob = await lumina(fileInput.files[0])
  .resize(800, 600)
  .sepia()
  .toBlob('image/jpeg', 0.8);
```

### ES Modules (Functional)

```javascript
import { loadImage, grayscale } from '@gks101/luminajs';
```

### Script Tag (Browser)

```html
<script type="module">
  import { lumina } from '/node_modules/@gks101/luminajs/dist/lumina.min.js';

  await lumina('photo.jpg')
    .grayscale()
    .toCanvas(document.getElementById('preview'));
</script>
```

## API Documentation

### Chainable API (`lumina`)

- **`lumina(source)`**: Initiates a processing chain. `source` can be a URL string, `File` object, `HTMLImageElement`, `HTMLCanvasElement`, or `ImageData`.
  - **`.grayscale()`**: Applies grayscale.
  - **`.brightness(level)`**: Adjusts brightness.
  - **`.contrast(level)`**: Adjusts contrast.
  - **`.sepia()`**: Applies sepia.
  - **`.blur(radius)`**: Applies box blur.
  - **`.gaussianBlur(sigma)`**: Applies Gaussian blur.
  - **`.watermark(text, options)`**: Adds text watermark.
  - **`.sharpen()` / `.emboss()` / `.edgeDetection()`**: Convolution filters.
  - **`.resize(w, h)` / `.crop(x, y, w, h)`**: Transformations.
  - **`.render()`**: Returns `Promise<ImageData>`.
  - `.toCanvas(canvas)`: Draws to canvas and returns `Promise<HTMLCanvasElement>`.
  - `.toHtmlElement(elementOrId)`: Displays result in an `<img>` (src) or `<canvas>` element.
  - `.toBlob(mime, quality)`: Returns `Promise<Blob>`.
  - **`.toDataURL(mime, quality)`**: Returns `Promise<string>`.

### Core Utilities (`@gks101/luminajs/core`)

- **`loadImage(source)`**: Returns a `Promise` resolving to an `HTMLImageElement`. Supports URL strings and `File` objects.
- **`getPixelData(image)`**: Extracts `ImageData` from an image using an offscreen canvas.
- **`putPixelData(canvas, imageData)`**: Writes `ImageData` back to a canvas element.
- **`canvasToBlob(canvas, mimeType, quality)`**: Async conversion of a canvas to a `Blob`.
- **`resize(source, width, height)`**: Resizes an image or canvas. Returns a new `HTMLCanvasElement`.
- **`crop(source, x, y, width, height)`**: Crops an image or canvas. Returns a new `HTMLCanvasElement`.

### Filters (`@gks101/luminajs/filters`)

- **`grayscale(imageData)`**: Converts image to grayscale using ITU-R BT.601.
- **`brightness(imageData, level)`**: Adjusts brightness [-255, 255].
- **`contrast(imageData, level)`**: Adjusts contrast [-100, 100].
- **`sepia(imageData)`**: Applies a classic antique sepia tone.
- **`ascii(imageData, options)`**: Transforms an image into an ASCII text string. Recommended to use with `getResizedImageData`.
- **`blur(imageData, radius)`**: Applies a box blur effect. `radius` is the blur intensity (default: 1).
- **`gaussianBlur(imageData, sigma)`**: Applies a smooth Gaussian blur effect. `sigma` is the standard deviation (default: 2).
- **`watermark(imageData, text, options)`**: Overlays text on the image. Options include `x`, `y`, `font`, `color`.
- **`backgroundBlur(imageData, options)`**: Selectively blurs the background. Options include `sigma`, `centerX`, `centerY`, `focusRadius`, `falloff`.
- **`applyConvolution(data, width, height, kernel)`**: Generic convolution engine for custom matrix operations (e.g., 3x3 kernel).
- **`sharpen(imageData)`**: Sharpens the image using a convolution kernel.
- **`emboss(imageData)`**: Applies an emboss effect using a convolution kernel.
- **`edgeDetection(imageData)`**: Highlights edges using a convolution kernel.

## ASCII Art Example

### 💎 Chainable API (Recommended)

```javascript
import { lumina } from '@gks101/luminajs';

// 100 characters wide, auto-calculated height
const text = await lumina('photo.jpg').resize(100, 50).ascii().render();

console.log(text);
```

### Functional Approach

```javascript
import { loadImage, getResizedImageData, ascii } from '@gks101/luminajs';

const img = await loadImage('photo.jpg');

// 1. Downsample for text (e.g., 100 characters wide)
const smallData = getResizedImageData(img, 100, 50);

// 2. Convert to ASCII
const text = ascii(smallData);

// 3. Display
console.log(text);
```

## Resize and Crop Example

### 💎 Chainable API (Recommended)

```javascript
import { lumina } from '@gks101/luminajs';

// Resize and then crop in one go
await lumina('photo.jpg')
  .resize(800, 600)
  .crop(100, 100, 300, 300)
  .toCanvas(document.getElementById('myCanvas'));
```

### Functional Approach

```javascript
import { loadImage, resize, crop } from '@gks101/luminajs';

const img = await loadImage('photo.jpg');

// 1. Resize to 800x600
const resizedCanvas = resize(img, 800, 600);

// 2. Crop a 300x300 square from (100, 100)
const croppedCanvas = crop(resizedCanvas, 100, 100, 300, 300);

document.body.appendChild(croppedCanvas);
```

## Blur Filter Example

```javascript
import { loadImage, getPixelData, putPixelData, blur } from '@gks101/luminajs';

const img = await loadImage('photo.jpg');
const { imageData } = getPixelData(img);

// Apply blur with radius 5
const blurredData = blur(imageData, 5);

// Render back to canvas
const canvas = document.getElementById('myCanvas');
putPixelData(canvas, blurredData);
```

## Gaussian Blur Example

```javascript
import {
  loadImage,
  getPixelData,
  putPixelData,
  gaussianBlur,
} from '@gks101/luminajs';

const img = await loadImage('photo.jpg');
const { imageData } = getPixelData(img);

// Apply smooth Gaussian blur with sigma 3.5
const blurredData = gaussianBlur(imageData, 3.5);

// Render back to canvas
const canvas = document.getElementById('myCanvas');
putPixelData(canvas, blurredData);
```

## Watermark Example

```javascript
import {
  loadImage,
  getPixelData,
  putPixelData,
  watermark,
} from '@gks101/luminajs';

const img = await loadImage('photo.jpg');
const { imageData } = getPixelData(img);

// Add a semi-transparent watermark at (20, 20)
const watermarkedData = watermark(imageData, '© 2024 LuminaJS', {
  x: 20,
  y: 20,
  font: '32px Arial',
  color: 'rgba(255, 255, 255, 0.5)',
});

const canvas = document.getElementById('myCanvas');
putPixelData(canvas, watermarkedData);
```

## Background Blur (Portrait) Example

```javascript
import {
  loadImage,
  getPixelData,
  putPixelData,
  backgroundBlur,
} from '@gks101/luminajs';

const img = await loadImage('portrait.jpg');
const { imageData } = getPixelData(img);

// Apply a portrait blur effect (sharp center, blurred background)
const portraitData = backgroundBlur(imageData, {
  sigma: 6,
  focusRadius: 150,
  falloff: 200,
});

const canvas = document.getElementById('myCanvas');
putPixelData(canvas, portraitData);
```

## Convolution Filters Example (Sharpen, Emboss, Edge Detection)

LuminaJS provides a generic convolution engine (`applyConvolution`) along with pre-built convolution filters such as `sharpen`, `emboss`, and `edgeDetection`. These filters modify pixels based on the values of their neighbors using a 3x3 matrix.

### Using Built-in Convolution Filters

```javascript
import {
  loadImage,
  getPixelData,
  putPixelData,
  sharpen,
  emboss,
  edgeDetection,
} from '@gks101/luminajs';

const img = await loadImage('photo.jpg');
const { imageData } = getPixelData(img);

// Apply a built-in sharpen filter
const sharpenedData = sharpen(imageData);

// Or apply emboss or edge detection
// const embossedData = emboss(imageData);
// const edgeData = edgeDetection(imageData);

const canvas = document.getElementById('myCanvas');
putPixelData(canvas, sharpenedData);
```

### Using the Generic Convolution Engine

You can also pass your own custom 3x3 kernel (as an array of 9 numbers) to `applyConvolution`.

```javascript
import {
  loadImage,
  getPixelData,
  putPixelData,
  applyConvolution,
} from '@gks101/luminajs';

const img = await loadImage('photo.jpg');
const { imageData } = getPixelData(img);

// Define a custom 3x3 kernel (e.g., an exaggerated edge detection kernel)
const customKernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1];

// applyConvolution mutates the array data in place
applyConvolution(
  imageData.data,
  imageData.width,
  imageData.height,
  customKernel,
);

const canvas = document.getElementById('myCanvas');
putPixelData(canvas, imageData);
```

## React Integration

LuminaJS provides a dedicated React entry point with hooks and components.

> Client-only warning: `useLumina`, `LuminaCanvas`, `ImageAreaSelector`, and `ImageCropper` are browser-side features. Do not run them during server rendering.

### `useLumina` Hook

The `useLumina` hook manages the image processing lifecycle, providing `result`, `loading`, and `error` states. You can pass image editing props directly, or use the `operations` function for advanced chaining. It also returns a `getImage()` function which you can call to generate the image on demand.

```jsx
import { useLumina } from '@gks101/luminajs/react';

function ImagePreview({ file }) {
  const { result, loading, error, getImage } = useLumina({
    source: file,
    grayscale: true,
    brightness: 20,
    sharpen: true,
    outputType: 'dataUrl', // 'imageData' | 'dataUrl' | 'blob'
    deps: [file],
  });

  const handleUpload = async () => {
    // Generate the blob on demand
    const blob = await getImage('blob');
    // await myUploadFunction(blob);
  };

  if (loading) return <div>Processing image...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <img src={result} alt="Processed preview" />
      <button onClick={handleUpload}>Upload Processed Image</button>
    </div>
  );
}
```

### `LuminaCanvas` Component

A declarative way to render processed images directly onto a canvas element. It accepts image editing options directly as props!

```jsx
import { LuminaCanvas } from '@gks101/luminajs/react';

function App() {
  const handleImageGenerated = (dataUrl) => {
    console.log('Got the generated image data URL:', dataUrl);
  };

  return (
    <LuminaCanvas
      source="portrait.jpg"
      gaussianBlur={3}
      sepia={true}
      resize={{ width: 800, height: 600 }}
      width={800} // HTML attribute
      height={600} // HTML attribute
      className="my-custom-canvas"
      outputType="dataUrl"
      getImage={handleImageGenerated}
      onProcessError={(err) => console.error(err)}
    />
  );
}
```

### `ImageCropper` Component

`ImageCropper` provides a complete drag-to-crop workflow. Draw a crop area, drag inside it to move it, or drag any handle to resize it before clicking Apply Crop. The same component swaps from the original image selector to the cropped `LuminaCanvas` result. The Reset button reloads the original image for another crop. It natively supports mobile touch interactions, including pinch-to-resize for two-finger gestures.

```jsx
import { useState } from 'react';
import { ImageCropper } from '@gks101/luminajs/react';

function AvatarEditor() {
  const [avatarPreview, setAvatarPreview] = useState('');

  return (
    <>
      <ImageCropper
        src="portrait.jpg"
        aspectRatio={1}
        outputFormat="dataUrl"
        maxWidth={500}
        maxHeight={500}
        allowResize={true}
        onCropComplete={(result) => {
          if (typeof result === 'string') setAvatarPreview(result);
        }}
        onError={(error) => console.error(error.message)}
      />

      {avatarPreview && <img src={avatarPreview} alt="Cropped avatar" />}
    </>
  );
}
```

For uploads, use `outputFormat="blob"`:

```jsx
<ImageCropper
  src={file}
  aspectRatio={16 / 9}
  outputFormat="blob"
  onCropComplete={async (result) => {
    if (!(result instanceof Blob)) return;

    const body = new FormData();
    body.append('image', result, 'banner.png');
    await fetch('/api/upload', { method: 'POST', body });
  }}
/>
```

### Available React Props

Both `useLumina` and `LuminaCanvas` accept these explicit props to make image processing incredibly simple without writing chained operations manually:

| Prop             | Type                                                      | Description                                    |
| :--------------- | :-------------------------------------------------------- | :--------------------------------------------- |
| `grayscale`      | `boolean`                                                 | Applies a grayscale filter.                    |
| `brightness`     | `number`                                                  | Adjusts brightness [-255, 255].                |
| `contrast`       | `number`                                                  | Adjusts contrast [-100, 100].                  |
| `sepia`          | `boolean`                                                 | Applies a classic antique sepia tone.          |
| `blur`           | `number`                                                  | Applies a box blur effect.                     |
| `gaussianBlur`   | `number`                                                  | Applies a smooth Gaussian blur effect.         |
| `sharpen`        | `boolean`                                                 | Sharpens the image.                            |
| `emboss`         | `boolean`                                                 | Applies an emboss effect.                      |
| `edgeDetection`  | `boolean`                                                 | Highlights edges.                              |
| `resize`         | `{ width: number, height: number }`                       | Resizes the image to the specified dimensions. |
| `crop`           | `{ x: number, y: number, width: number, height: number }` | Crops the image.                               |
| `watermark`      | `{ text: string, options?: any }`                         | Overlays text on the image.                    |
| `backgroundBlur` | `any`                                                     | Selectively blurs the background.              |
| `ascii`          | `boolean \| Record<string, any>`                          | Transforms the image into ASCII text.          |

### Getting the Processed Image (`getImage`)

A common requirement is to retrieve the processed image data so you can upload it to a server or pass it to another component. Both the hook and the component provide an easy way to do this via `getImage`.

#### Using `useLumina`

The hook returns a `getImage` asynchronous function. This allows you to generate the image on demand (e.g. when a user clicks a "Save" button), using the latest props applied.

```jsx
const handleUpload = async () => {
  // You can override the outputType when calling getImage
  const finalBlob = await getImage('blob');
  await uploadToServer(finalBlob);
};
```

#### Using `LuminaCanvas`

The component accepts a `getImage` prop. This is a callback that will be triggered automatically as soon as the canvas finishes rendering the processed image.

```jsx
<LuminaCanvas
  source="photo.jpg"
  outputType="dataUrl" // format passed to getImage (dataUrl, blob, imageData, canvas)
  getImage={(dataUrl) => {
    // Save to state, send to a parent component, etc.
    setProcessedImage(dataUrl);
  }}
/>
```

## ImageCropper - Props

This repository includes the ImageCropper component. New props were added to allow customizing the Apply Crop and Reset buttons:

- allowResize: boolean (optional) - Shows resize handles on the crop area so users can adjust an existing selection before applying. Default: true.
- applyButtonClassName: string (optional) - CSS class for the Apply button.
- applyButtonStyle: CSSProperties (optional) - Inline style object for the Apply button.
- resetButtonClassName: string (optional) - CSS class for the Reset button.
- resetButtonStyle: CSSProperties (optional) - Inline style object for the Reset button.
- buttonPosition: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-center' | 'bottom-right' (optional) - Position of the Apply/Reset button container. Default: 'top-left'.
- zIndex: number (internal) - The button container uses a high z-index (1001) to ensure the buttons render above the image selection overlay.
- onApply: (crop) => boolean | void | Promise<boolean | void> (optional) - Callback invoked when the Apply button is clicked. Returning `false` (or a Promise resolving to `false`) will abort the component's default apply behavior.
- onReset: () => boolean | void | Promise<boolean | void> (optional) - Callback invoked when Reset is clicked. Returning `false` will abort the default reset.

These props are optional and backward-compatible.

---

## License

MIT © LuminaJS Team
