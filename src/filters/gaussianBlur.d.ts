/**
 * @fileoverview LuminaJS Filters - Gaussian Blur
 * Applies a smooth Gaussian blur effect to an image.
 */
/**
 * Applies a Gaussian blur filter to a copy of the provided `ImageData`.
 * This implementation uses a two-pass separable convolution for better performance.
 *
 * @param {ImageData} imageData - The source pixel data.
 * @param {number} sigma - The standard deviation of the Gaussian distribution.
 *   Larger values result in more blurring. Default is 2.
 * @returns {ImageData} A new `ImageData` object with Gaussian blur applied.
 *
 * @example
 * const blurredData = gaussianBlur(imageData, 3.5);
 */
export function gaussianBlur(imageData: ImageData, sigma?: number): ImageData;
