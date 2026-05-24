# LuminaJS Performance Guide

LuminaJS runs pixel filters in JavaScript over `ImageData`. This is fast for many UI flows, but heavy filters on large images can still block the main thread.

## Expensive Filters

These are typically the most expensive operations:

- `blur(imageData, radius)`
- `gaussianBlur(imageData, sigma)`
- `backgroundBlur(imageData, options)` (includes a full blur pass + compositing)
- `applyConvolution(data, width, height, kernel)` (cost scales with full-pixel traversal)

## Main-Thread Impact

Large images (e.g. DSLR photos, 4K assets) can cause visible UI stalls when heavy filters run on the main thread. This is expected for CPU-bound `ImageData` processing.

Recommended defaults:

1. Resize early for preview/editing workflows.
2. Apply heavy filters to the resized image first.
3. Only process full resolution on explicit final actions (export/download/upload).
4. Move heavy processing into a Web Worker when possible.

## Benchmark Example (Common Sizes)

Use this benchmark harness in a browser context to measure your target devices.

```js
import {
  loadImage,
  getResizedImageData,
  blur,
  gaussianBlur,
  backgroundBlur,
  applyConvolution,
} from '@gks101/luminajs';

const SIZES = [
  [256, 256],
  [512, 512],
  [1024, 1024],
  [1920, 1080],
];

function time(label, fn) {
  const start = performance.now();
  fn();
  const end = performance.now();
  return { label, ms: +(end - start).toFixed(2) };
}

async function runBenchmarks(source) {
  const image = await loadImage(source);
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (const [w, h] of SIZES) {
    const img = getResizedImageData(image, w, h);
    const rows = [
      time('blur r=4', () => blur(img, 4)),
      time('gaussian sigma=3', () => gaussianBlur(img, 3)),
      time('backgroundBlur sigma=6', () =>
        backgroundBlur(img, { sigma: 6, focusRadius: Math.min(w, h) * 0.2 }),
      ),
      time('convolution sharpen kernel', () =>
        applyConvolution(new Uint8ClampedArray(img.data), w, h, kernel),
      ),
    ];

    console.table(
      rows.map((r) => ({ size: `${w}x${h}`, filter: r.label, ms: r.ms })),
    );
  }
}
```

### Expected Output Shape

| Size        | Filter                   | Time (ms) |
| ----------- | ------------------------ | --------- |
| `256x256`   | `blur r=4`               | (device)  |
| `512x512`   | `gaussian sigma=3`       | (device)  |
| `1024x1024` | `backgroundBlur sigma=6` | (device)  |
| `1920x1080` | `convolution sharpen`    | (device)  |

Use these measurements to define product thresholds (for example: target `<16ms` for live slider interactions, defer anything slower).

## Resize-First Pattern (Preview Then Final)

For responsive editors, process a smaller preview first:

```js
import { lumina } from '@gks101/luminajs';

// Fast interactive preview
await lumina(file).resize(960, 540).gaussianBlur(2.5).toCanvas(previewCanvas);

// Full-resolution final render only when user confirms
const fullResBlob = await lumina(file)
  .gaussianBlur(2.5)
  .toBlob('image/jpeg', 0.9);
```

## Web Worker Guidance

Move expensive filters off the main thread to keep UI responsive.

### `image-worker.js`

```js
import { gaussianBlur, backgroundBlur } from '@gks101/luminajs/filters';

self.onmessage = (event) => {
  const { id, op, imageData, options } = event.data;

  try {
    let result;
    if (op === 'gaussian')
      result = gaussianBlur(imageData, options?.sigma ?? 3);
    else if (op === 'background')
      result = backgroundBlur(imageData, options ?? {});
    else throw new Error(`Unknown op: ${op}`);

    self.postMessage({ id, ok: true, result }, [result.data.buffer]);
  } catch (error) {
    self.postMessage({ id, ok: false, error: String(error) });
  }
};
```

### Main thread

```js
const worker = new Worker(new URL('./image-worker.js', import.meta.url), {
  type: 'module',
});

function runWorkerFilter(op, imageData, options = {}) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();

    const onMessage = (event) => {
      if (event.data?.id !== id) return;
      worker.removeEventListener('message', onMessage);
      if (event.data.ok) resolve(event.data.result);
      else reject(new Error(event.data.error));
    };

    worker.addEventListener('message', onMessage);
    worker.postMessage({ id, op, imageData, options }, [imageData.data.buffer]);
  });
}
```

Notes:

- Transfer buffers (`postMessage(..., [buffer])`) to reduce copy overhead.
- Keep preview dimensions smaller for live controls.
- Throttle rapid slider updates to avoid queue backlogs.
