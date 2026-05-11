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
export function backgroundBlur(
  imageData: ImageData,
  options?: {
    sigma?: number | undefined;
    centerX?: number | undefined;
    centerY?: number | undefined;
    focusRadius?: number | undefined;
    falloff?: number | undefined;
  },
): ImageData;
