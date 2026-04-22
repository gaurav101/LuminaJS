import { clamp } from '../utils/helpers.js';

/**
 * @fileoverview LuminaJS Filters - Brightness
 * Adjusts the brightness of an image by adding a fixed level to each color channel.
 */

/**
 * Applies a brightness filter to a copy of the provided `ImageData`.
 *
 * @param {ImageData} imageData - The source pixel data.
 * @param {number} level - Brightness adjustment level.
 *   - `level > 0`: Increases brightness.
 *   - `level < 0`: Decreases brightness (darker).
 *   - Recommended range: [-255, 255].
 * @returns {ImageData} A new `ImageData` object with adjusted brightness.
 *
 * @example
 * const brightData = brightness(imageData, 50);
 */
export function brightness(imageData, level = 0) {
  const output = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  const data = output.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    data[i]     = clamp(data[i]     + level, 0, 255); // R
    data[i + 1] = clamp(data[i + 1] + level, 0, 255); // G
    data[i + 2] = clamp(data[i + 2] + level, 0, 255); // B
    // Alpha remains untouched
  }

  return output;
}
