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
export function grayscale(imageData: ImageData): ImageData;
