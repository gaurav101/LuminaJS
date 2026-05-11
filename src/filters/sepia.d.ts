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
export function sepia(imageData: ImageData): ImageData;
