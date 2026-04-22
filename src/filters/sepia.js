import { clamp } from '../utils/helpers.js';

/**
 * @fileoverview LuminaJS Filters - Sepia
 * Applies a classic sepia (antique) tone using standard weighting factors.
 */

/**
 * Applies a sepia filter to a copy of the provided `ImageData`.
 *
 * @param {ImageData} imageData - The source pixel data.
 * @returns {ImageData} A new `ImageData` object with sepia tones applied.
 *
 * @example
 * const sepiaData = sepia(imageData);
 */
export function sepia(imageData) {
  const output = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  const data = output.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Standard Sepia formula
    data[i]     = clamp((r * 0.393) + (g * 0.769) + (b * 0.189), 0, 255); // New R
    data[i + 1] = clamp((r * 0.349) + (g * 0.686) + (b * 0.168), 0, 255); // New G
    data[i + 2] = clamp((r * 0.272) + (g * 0.534) + (b * 0.131), 0, 255); // New B
  }

  return output;
}
