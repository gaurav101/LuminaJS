/**
 * @fileoverview LuminaJS Filters - Blur
 * Applies a box blur effect to an image.
 */
/**
 * Applies a box blur filter to a copy of the provided `ImageData`.
 * This implementation uses a two-pass box blur algorithm (horizontal then vertical)
 * for better performance.
 *
 * @param {ImageData} imageData - The source pixel data.
 * @param {number} radius - The blur radius (integer). Default is 1.
 * @returns {ImageData} A new `ImageData` object with blur applied.
 *
 * @example
 * const blurredData = blur(imageData, 3);
 */
export function blur(imageData: ImageData, radius?: number): ImageData;
