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
export function contrast(imageData: ImageData, level?: number): ImageData;
