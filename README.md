# LuminaJS
LuminaJS is a modular, lightweight JavaScript utility library for browser-based image processing using the HTML5 Canvas API. It provides a functional approach to image manipulation, focusing on performance and ease of use.

## Features

<a href="https://gaurav101.github.io/LuminaJS/" target="_blank">Live Demo</a>
<a href="https://github.com/gaurav101/LuminaJS" target="_blank">Code</a>

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
- **`blur(imageData, radius)`**: Applies a box blur effect. `radius` is the blur intensity (default: 1).
- **`gaussianBlur(imageData, sigma)`**: Applies a smooth Gaussian blur effect. `sigma` is the standard deviation (default: 2).
- **`watermark(imageData, text, options)`**: Overlays text on the image. Options include `x`, `y`, `font`, `color`.
- **`backgroundBlur(imageData, options)`**: Selectively blurs the background. Options include `sigma`, `centerX`, `centerY`, `focusRadius`, `falloff`.
- **`applyConvolution(data, width, height, kernel)`**: Generic convolution engine for custom matrix operations (e.g., 3x3 kernel).
- **`sharpen(imageData)`**: Sharpens the image using a convolution kernel.
- **`emboss(imageData)`**: Applies an emboss effect using a convolution kernel.
- **`edgeDetection(imageData)`**: Highlights edges using a convolution kernel.
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
import { loadImage, getPixelData, putPixelData, gaussianBlur } from '@gks101/luminajs';

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
import { loadImage, getPixelData, putPixelData, watermark } from '@gks101/luminajs';

const img = await loadImage('photo.jpg');
const { imageData } = getPixelData(img);

// Add a semi-transparent watermark at (20, 20)
const watermarkedData = watermark(imageData, '© 2024 LuminaJS', {
  x: 20,
  y: 20,
  font: '32px Arial',
  color: 'rgba(255, 255, 255, 0.5)'
});

const canvas = document.getElementById('myCanvas');
putPixelData(canvas, watermarkedData);
```

## Background Blur (Portrait) Example

```javascript
import { loadImage, getPixelData, putPixelData, backgroundBlur } from '@gks101/luminajs';

const img = await loadImage('portrait.jpg');
const { imageData } = getPixelData(img);

// Apply a portrait blur effect (sharp center, blurred background)
const portraitData = backgroundBlur(imageData, {
  sigma: 6,
  focusRadius: 150,
  falloff: 200
});

const canvas = document.getElementById('myCanvas');
putPixelData(canvas, portraitData);
```

## Convolution Filters Example (Sharpen, Emboss, Edge Detection)

LuminaJS provides a generic convolution engine (`applyConvolution`) along with pre-built convolution filters such as `sharpen`, `emboss`, and `edgeDetection`. These filters modify pixels based on the values of their neighbors using a 3x3 matrix.

### Using Built-in Convolution Filters

```javascript
import { loadImage, getPixelData, putPixelData, sharpen, emboss, edgeDetection } from '@gks101/luminajs';

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
import { loadImage, getPixelData, putPixelData, applyConvolution } from '@gks101/luminajs';

const img = await loadImage('photo.jpg');
const { imageData } = getPixelData(img);

// Define a custom 3x3 kernel (e.g., an exaggerated edge detection kernel)
const customKernel = [
  -1, -1, -1,
  -1,  9, -1,
  -1, -1, -1
];

// applyConvolution mutates the array data in place
applyConvolution(imageData.data, imageData.width, imageData.height, customKernel);

const canvas = document.getElementById('myCanvas');
putPixelData(canvas, imageData);
```

## License

MIT © LuminaJS Team


