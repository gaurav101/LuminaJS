/**
 * @fileoverview LuminaJS Utils
 * Shared utility helpers for the LuminaJS library.
 * Populate this module with reusable, stateless helpers as the library grows —
 * e.g. type guards, math helpers, or output format converters.
 */

/**
 * Clamps a numeric value to a given inclusive range [min, max].
 *
 * @param {number} value - The input value.
 * @param {number} min   - Lower bound (inclusive).
 * @param {number} max   - Upper bound (inclusive).
 * @returns {number} The clamped value.
 *
 * @example
 * clamp(300, 0, 255); // → 255
 * clamp(-10, 0, 255); // → 0
 * clamp(128, 0, 255); // → 128
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns `true` if the provided value is a `File` object whose MIME type
 * indicates an image format.
 *
 * @param {unknown} value - Any value to test.
 * @returns {boolean} `true` if `value` is an image `File`, otherwise `false`.
 *
 * @example
 * isImageFile(event.target.files[0]); // → true / false
 */
export function isImageFile(value) {
  return value instanceof File && value.type.startsWith('image/');
}
