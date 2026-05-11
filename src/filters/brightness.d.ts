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
export function brightness(imageData: ImageData, level?: number): ImageData;
