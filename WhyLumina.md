# 🚀 Transform Images in the Browser with LuminaJS: Lightweight, Zero-Dependency, and Fast

Image processing in the browser has traditionally been a choice between two frustrating extremes:

1.  **The "Heavyweights":** Large libraries that offer every feature imaginable but bloat your bundle size, hurting your Core Web Vitals and SEO.
2.  **The "Manual Labor":** Using the native **HTML5 Canvas API**, which is powerful but notoriously verbose, requiring dozens of lines of code just to perform a simple grayscale or resize.

Most existing libraries are also built for Node.js first, requiring complex polyfills or heavy dependencies just to run in a client's browser. [LuminaJS](https://www.npmjs.com/package/@gks101/luminajs) was built to solve this "complexity vs. weight" trade-off.

---

## Why LuminaJS?

[@gks101/luminajs](https://www.npmjs.com/package/@gks101/luminajs) is a modular, functional utility library optimized specifically for the modern browser environment.

- **Tiny Footprint:** A minzipped size of only **2.8 KB**.
- **Zero Dependencies:** Pure, optimized JavaScript—no jQuery, no Lodash.
- **Chainable API:** A modern, fluent syntax that makes complex transformations readable.
- **Performance First:** Optimized `ImageData` loops for fast pixel-level processing.

---

## 🖼️ Supported Image Formats

Since [LuminaJS](https://www.npmjs.com/package/@gks101/luminajs) leverages the native Canvas API, it supports any format your browser can natively render:

| Type       | Formats                                                |
| :--------- | :----------------------------------------------------- |
| **Input**  | PNG, JPEG/JPG, WebP, GIF (static frame), SVG, BMP, ICO |
| **Output** | PNG, JPEG (with quality control), WebP                 |

---

## Getting Started

Install via **npm**:

```bash
npm install @gks101/luminajs
```

Or use a **script tag** for quick prototyping:

```html
<script src="node_modules/@gks101/luminajs/dist/lumina.min.js"></script>
```

---

## 💎 The Power of the Chainable API

[LuminaJS](https://github.com/gaurav101/LuminaJS) handles the tedious parts of canvas management—loading, offscreen buffers, and sequencing—automatically.

### Example: Basic Transformation

Take a raw image and turn it into a sharpened, grayscale thumbnail in seconds:

```javascript
import { lumina } from '@gks101/luminajs';

async function processImage() {
  await lumina('photo.jpg')
    .brightness(20)
    .contrast(10)
    .grayscale()
    .sharpen()
    .resize(300, 300)
    .toCanvas(document.getElementById('myCanvas'));

  console.log('Image processed and rendered!');
}
```

---

## 🎨 Feature Highlights

### 1. ASCII Art Generation

Transform images into text strings for creative console logs or retro UI elements.

```javascript
const text = await lumina('logo.png').resize(100, 50).ascii().render();

console.log(text);
```

### 2. Background Blur (Portrait Mode)

Simulate depth-of-field by keeping the subject sharp while blurring the surroundings.

```javascript
await lumina('portrait.jpg')
  .backgroundBlur({ sigma: 6, focusRadius: 150, falloff: 200 })
  .toHtmlElement('myImageElement');
```

### 3. Watermarking

Protect your content by adding branding on the fly before the image is even uploaded to your server.

```javascript
await lumina('product.jpg')
  .watermark('© 2024 LuminaJS', {
    x: 20,
    y: 20,
    font: '24px Arial',
    color: 'rgba(255,255,255,0.5)',
  })
  .toBlob('image/jpeg', 0.9);
```

---

## 🛠️ Advanced: Custom Convolution

If the built-in filters like `sharpen` or `edgeDetection` aren't enough, you can pass your own 3x3 matrix to the convolution engine:

```javascript
// Example: Custom 3x3 Sharpen Kernel
const customKernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1];

// Apply directly to pixel data using the core engine
applyConvolution(
  imageData.data,
  imageData.width,
  imageData.height,
  customKernel,
);
```

---

## Conclusion

Whether you need a simple client-side resizer to save upload bandwidth or a tool for creative filters, [LuminaJS](https://www.npmjs.com/package/@gks101/luminajs) provides a professional toolset without the architectural overhead.

- **GitHub:** [gaurav101/LuminaJS](https://github.com/gaurav101/LuminaJS)
- **NPM:** [@gks101/luminajs](https://www.npmjs.com/package/@gks101/luminajs)
- **Live Demo:** [Check out the official Demo Page](https://gaurav101.github.io/LuminaJS/)
