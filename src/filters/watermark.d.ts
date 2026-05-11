/**
 * @fileoverview LuminaJS Filters - Watermark
 * Overlays text on top of an image.
 */
/**
 * Applies a text watermark to a copy of the provided `ImageData`.
 *
 * @param {ImageData} imageData - The source pixel data.
 * @param {string} text - The watermark text to overlay.
 * @param {Object} [options={}] - Customization options.
 * @param {number} [options.x=10] - X coordinate for the text.
 * @param {number} [options.y=10] - Y coordinate for the text.
 * @param {number} [options.fontSize=24] - Font size in pixels.
 * @param {string} [options.fontFace='Arial'] - Font family name.
 * @param {string} [options.font='24px Arial'] - CSS font string (overrides fontSize/fontFace).
 * @param {string} [options.color='rgba(255, 255, 255, 0.5)'] - CSS color string.
 * @param {CanvasTextAlign} [options.align='left'] - Text alignment ('left', 'center', 'right', 'start', 'end').
 * @param {CanvasTextBaseline} [options.baseline='top'] - Text baseline ('top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom').
 * @returns {ImageData} A new `ImageData` object with the watermark applied.
 *
 * @example
 * const watermarked = watermark(imageData, '© LuminaJS', { x: 20, y: 20, color: 'white' });
 */
export function watermark(
  imageData: ImageData,
  text: string,
  options?: {
    x?: number | undefined;
    y?: number | undefined;
    fontSize?: number | undefined;
    fontFace?: string | undefined;
    font?: string | undefined;
    color?: string | undefined;
    align?: CanvasTextAlign | undefined;
    baseline?: CanvasTextBaseline | undefined;
  },
): ImageData;
