import { clamp } from '../utils/helpers.js';

/**
 * @fileoverview LuminaJS Filters - Contrast
 * Adjusts the contrast of an image using a non-linear scaling factor.
 */

/**
 * Applies a contrast filter to a copy of the provided `ImageData`.
 *
 * @param {ImageData} imageData - The source pixel data.
 * @param {number} level - Contrast adjustment level.
 *   - `level > 0`: Increases contrast.
 *   - `level < 0`: Decreases contrast.
 *   - Range: [-100, 100].
 * @returns {ImageData} A new `ImageData` object with adjusted contrast.
 *
 * @example
 * const highContrastData = contrast(imageData, 30);
 */
export function contrast(imageData, level = 0) {
  const output = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  const data = output.data;
  const len = data.length;

  // Factor calculation formula
  const factor = (259 * (level + 255)) / (255 * (259 - level));

  for (let i = 0; i < len; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128, 0, 255); // R
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128, 0, 255); // G
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128, 0, 255); // B
  }

  return output;
}
