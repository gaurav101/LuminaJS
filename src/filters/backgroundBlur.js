import { gaussianBlur } from './gaussianBlur.js';

/**
 * @fileoverview LuminaJS Filters - Background Blur
 * Applies a selective blur to the background while keeping a focus area sharp.
 * Mimics the "Portrait" or "Bokeh" effect.
 */

/**
 * Applies a background blur effect to a copy of the provided `ImageData`.
 *
 * @param {ImageData} imageData - The source pixel data.
 * @param {Object} [options={}] - Customization options.
 * @param {number} [options.sigma=5] - Blur intensity for the background.
 * @param {number} [options.centerX] - X coordinate of the focus center (default: center).
 * @param {number} [options.centerY] - Y coordinate of the focus center (default: center).
 * @param {number} [options.focusRadius] - Radius of the perfectly sharp area (default: 20% of min dimension).
 * @param {number} [options.falloff] - Distance over which the blur reaches maximum (default: 40% of min dimension).
 * @returns {ImageData} A new `ImageData` object with the selective blur applied.
 *
 * @example
 * const portrait = backgroundBlur(imageData, { sigma: 8, focusRadius: 100 });
 */
export function backgroundBlur(imageData, options = {}) {
  const { width, height } = imageData;
  const minDim = Math.min(width, height);

  const {
    sigma = 5,
    centerX = width / 2,
    centerY = height / 2,
    focusRadius = minDim * 0.2,
    falloff = minDim * 0.4
  } = options;

  // 1. Get a fully blurred version of the image
  const blurredData = gaussianBlur(imageData, sigma);
  
  const original = imageData.data;
  const blurred = blurredData.data;
  const output = new Uint8ClampedArray(original.length);

  // 2. Composite the two based on distance from focus point
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Calculate weight for blurred image (0 = sharp, 1 = fully blurred)
      let weight = 0;
      if (distance > focusRadius) {
        weight = Math.min(1, (distance - focusRadius) / falloff);
      }

      const offset = (y * width + x) * 4;
      const invWeight = 1 - weight;

      output[offset]     = original[offset]     * invWeight + blurred[offset]     * weight;
      output[offset + 1] = original[offset + 1] * invWeight + blurred[offset + 1] * weight;
      output[offset + 2] = original[offset + 2] * invWeight + blurred[offset + 2] * weight;
      output[offset + 3] = original[offset + 3]; // Keep original alpha
    }
  }

  return new ImageData(output, width, height);
}
