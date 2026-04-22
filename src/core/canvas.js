/**
 * @fileoverview LuminaJS Core - Canvas Bridge
 * Provides the bridge between HTMLImageElement instances and raw pixel data
 * via the HTML5 Canvas API. All canvas operations use offscreen (non-attached)
 * canvas elements to avoid any DOM side-effects.
 */

/**
 * @typedef {Object} CanvasContext
 * @property {HTMLCanvasElement} canvas - The offscreen canvas element.
 * @property {CanvasRenderingContext2D} ctx - The 2D rendering context.
 */

/**
 * Creates an offscreen canvas sized to the given dimensions.
 *
 * @param {number} width  - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @returns {CanvasContext} An object containing the canvas and its 2D context.
 */
function createOffscreenCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', {
    willReadFrequently: true,
  });

  if (!ctx) {
    throw new Error('LuminaJS [canvas]: Failed to create offscreen canvas context.');
  }

  return { canvas, ctx };
}

/**
 * Draws an HTMLImageElement onto an offscreen canvas and returns the raw
 * pixel data as an `ImageData` object.
 *
 * The returned `ImageData.data` is a flat `Uint8ClampedArray` of RGBA values:
 * `[R, G, B, A, R, G, B, A, ...]`, where each channel is in the range [0, 255].
 *
 * @param {HTMLImageElement} image - A fully loaded image element. It must have
 *   non-zero `naturalWidth` and `naturalHeight` properties.
 * @returns {{ imageData: ImageData, canvas: HTMLCanvasElement }} An object
 *   containing the extracted `ImageData` and the offscreen `canvas` used,
 *   which can be passed to `putPixelData` after manipulation.
 * @throws {Error} Throws if the image has zero dimensions or if the canvas
 *   context cannot be obtained (e.g. context already in use).
 *
 * @example
 * const img = await loadImage('photo.jpg');
 * const { imageData, canvas } = getPixelData(img);
 * // imageData.data => Uint8ClampedArray [R, G, B, A, ...]
 */
export function getPixelData(image) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  if (width === 0 || height === 0) {
    throw new Error(
      `LuminaJS [canvas]: Cannot extract pixel data from an image with zero dimensions ` +
        `(${width}x${height}). Ensure the image is fully loaded before calling getPixelData.`
    );
  }

  const { canvas, ctx } = createOffscreenCanvas(width, height);

  ctx.drawImage(image, 0, 0, width, height);

  // getImageData can throw a SecurityError if the canvas is "tainted"
  // by a cross-origin image loaded without CORS headers.
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    return { imageData, canvas };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `LuminaJS [canvas]: Unable to read pixel data — canvas may be tainted by a ` +
        `cross-origin image. Ensure the server sends CORS headers and the image is loaded ` +
        `with crossOrigin="Anonymous". Original error: ${message}`
    );
  }
}

/**
 * Writes an `ImageData` object back onto a canvas element, replacing its
 * current contents. This is the inverse of `getPixelData` and is used to
 * commit mutated pixel data back to a drawable surface.
 *
 * @param {HTMLCanvasElement} canvas   - The target canvas. Typically the one
 *   returned from a prior `getPixelData` call, already sized to match the data.
 * @param {ImageData}         imageData - The pixel data to write. Its `width`
 *   and `height` must not exceed the canvas dimensions.
 * @returns {void}
 * @throws {Error} Throws if a 2D context cannot be obtained from the canvas.
 *
 * @example
 * const { imageData, canvas } = getPixelData(img);
 * // ... mutate imageData.data ...
 * putPixelData(canvas, imageData);
 * const dataURL = canvas.toDataURL('image/png');
 */
export function putPixelData(canvas, imageData) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error(
      `LuminaJS [canvas]: Failed to obtain a 2D context from the provided canvas element. ` +
        `The canvas may already have a context of a different type (e.g. "webgl").`
    );
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Converts a canvas element to a `Blob` asynchronously.
 * A convenience wrapper around the native `canvas.toBlob` callback API.
 *
 * @param {HTMLCanvasElement} canvas   - The source canvas.
 * @param {string}            [mimeType='image/png']  - Output MIME type (e.g. `'image/jpeg'`).
 * @param {number}            [quality=0.92] - Compression quality for lossy formats (0.0–1.0).
 * @returns {Promise<Blob>} Resolves with the encoded image Blob.
 * @throws {Error} Rejects if the browser fails to encode the canvas.
 *
 * @example
 * const blob = await canvasToBlob(canvas, 'image/jpeg', 0.85);
 * const url = URL.createObjectURL(blob);
 */
export function canvasToBlob(canvas, mimeType = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(
            new Error(
              `LuminaJS [canvas]: canvas.toBlob returned null. ` +
                `The canvas may be empty or the MIME type "${mimeType}" is unsupported.`
            )
          );
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Extracts ImageData from an image after resizing it to the specified dimensions.
 * Useful for filters that require downsampling, like ASCII art.
 *
 * @param {HTMLImageElement} image  - The source image.
 * @param {number}           width  - Target width.
 * @param {number}           height - Target height.
 * @returns {ImageData} The extracted pixel data at the new resolution.
 */
export function getResizedImageData(image, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('LuminaJS [canvas]: Failed to obtain a 2D context for resizing.');
  }

  // Use high-quality scaling or discrete sampling
  ctx.drawImage(image, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}
