# LuminaJS

LuminaJS is a modular, lightweight JavaScript utility library for browser-based image processing using the HTML5 Canvas API. It provides a functional approach to image manipulation, focusing on performance and ease of use.

## Features

- **🚀 High Performance**: Optimized `ImageData` loops for fast pixel processing.
- **🧩 Modular**: Only import the filters and utilities you need.
- **🖼️ Canvas-Powered**: Leverages the HTML5 Canvas API for seamless browser integration.
- **📦 Lightweight**: Zero external dependencies (no jQuery, no Lodash).

## Installation

```bash
npm install @gks101/luminajs
```

## Building from Source

If you want to generate the optimized distributable files locally:

```bash
# 1. Install dependencies
npm install

# 2. Run the build command
npm run build
```

The output will be generated in the `dist/` directory.

## Usage

### ES Modules (Modern)

```javascript
import { loadImage, grayscale } from '@gks101/luminajs';
```

### Script Tag (Browser)

```html
<script src="node_modules/@gks101/luminajs/dist/lumina.min.js"></script>
<script>
  const { loadImage, grayscale } = Lumina;
  // ...
</script>
```

## API Documentation

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

## ASCII Art Example

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

```javascript
import { loadImage, resize, crop } from '@gks101/luminajs';

const img = await loadImage('photo.jpg');

// 1. Resize to 800x600
const resizedCanvas = resize(img, 800, 600);

// 2. Crop a 300x300 square from (100, 100)
const croppedCanvas = crop(resizedCanvas, 100, 100, 300, 300);

document.body.appendChild(croppedCanvas);
```

## License

MIT © LuminaJS Team
