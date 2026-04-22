/**
 * @fileoverview LuminaJS Filters - Grayscale
 * Converts an image to grayscale using the ITU-R BT.601 luminance formula:
 *   Y = 0.299R + 0.587G + 0.114B
 *
 * These weights reflect human perception of color brightness:
 * green channels appear brightest, blue channels the darkest.
 */

/** @constant {number} - Luminance weight for the Red channel */
const LUMA_R = 0.299;

/** @constant {number} - Luminance weight for the Green channel */
const LUMA_G = 0.587;

/** @constant {number} - Luminance weight for the Blue channel */
const LUMA_B = 0.114;

/**
 * Applies a grayscale filter to a cloned copy of the provided `ImageData`.
 *
 * Each pixel's RGB channels are replaced with the luminance value `Y`,
 * computed via the BT.601 formula. The alpha channel is preserved unchanged.
 *
 * Performance notes:
 * - Pixel array length is cached before the loop to avoid repeated property lookups.
 * - The loop increments by 4 on every iteration (one full RGBA pixel per step),
 *   eliminating redundant index arithmetic.
 * - A new `ImageData` is returned; the original is never mutated.
 *
 * @param {ImageData} imageData - The source pixel data, as returned by `getPixelData`.
 * @returns {ImageData} A new `ImageData` object with all pixels converted to grayscale.
 *
 * @example
 * import { loadImage }    from '../core/loader.js';
 * import { getPixelData, putPixelData, canvasToBlob } from '../core/canvas.js';
 * import { grayscale }    from '../filters/grayscale.js';
 *
 * const img              = await loadImage(file);
 * const { imageData, canvas } = getPixelData(img);
 * const grayData         = grayscale(imageData);
 *
 * putPixelData(canvas, grayData);
 * const blob = await canvasToBlob(canvas);
 */
export function grayscale(imageData) {
  // Clone the source data so the original ImageData is never mutated.
  const output = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  const data = output.data;
  const len = data.length; // Cache length — avoids re-evaluation each iteration

  // Iterate in 4-step increments: each group of 4 bytes = [R, G, B, A]
  for (let i = 0; i < len; i += 4) {
    const r = data[i];       // Red
    const g = data[i + 1];   // Green
    const b = data[i + 2];   // Blue
    // data[i + 3] = Alpha   // Untouched

    // BT.601 Luma — result is automatically clamped to [0, 255] by Uint8ClampedArray
    const y = LUMA_R * r + LUMA_G * g + LUMA_B * b;

    data[i]     = y; // R ← Y
    data[i + 1] = y; // G ← Y
    data[i + 2] = y; // B ← Y
  }

  return output;
}
