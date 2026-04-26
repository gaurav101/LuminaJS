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
 * @param {string} [options.font='24px Arial'] - CSS font string.
 * @param {string} [options.color='rgba(255, 255, 255, 0.5)'] - CSS color string.
 * @param {CanvasTextAlign} [options.align='left'] - Text alignment ('left', 'center', 'right', 'start', 'end').
 * @param {CanvasTextBaseline} [options.baseline='top'] - Text baseline ('top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom').
 * @returns {ImageData} A new `ImageData` object with the watermark applied.
 *
 * @example
 * const watermarked = watermark(imageData, '© LuminaJS', { x: 20, y: 20, color: 'white' });
 */
export function watermark(imageData, text, options = {}) {
  const {
    x = 10,
    y = 10,
    font = '24px Arial',
    color = 'rgba(255, 255, 255, 0.5)',
    align = 'left',
    baseline = 'top'
  } = options;

  // Create a temporary canvas to draw the text
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('LuminaJS [watermark]: Failed to obtain 2D context for temporary canvas.');
  }

  // Draw the original image data onto the canvas
  ctx.putImageData(imageData, 0, 0);

  // Configure text styles
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  // Draw the text
  ctx.fillText(text, x, y);

  // Return the new image data
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
