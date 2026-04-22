/**
 * @fileoverview LuminaJS Filters - ASCII Art
 * Converts an image to a string of ASCII characters based on pixel luminance.
 */

/**
 * Standard character set ordered from densest (darkest) to sparsest (lightest).
 * @constant {string}
 */
const DEFAULT_CHARSET = '@%#*+=-:. ';

/**
 * Converts the provided ImageData into an ASCII string representation.
 * 
 * Note: For best results, the input ImageData should be relatively low resolution 
 * (e.g., 50-100 pixels wide), as each pixel maps to a single character.
 *
 * @param {ImageData} imageData - The source pixel data. 
 * @param {Object} [options={}] - Transformation options.
 * @param {string} [options.charSet='@%#*+=-:. '] - A string of characters ordered from dark to light.
 * @param {boolean} [options.invert=false] - If true, treats the first character as the lightest.
 * @returns {string} A string containing the ASCII representation of the image, including newlines.
 *
 * @example
 * const { getResizedImageData } = Lumina;
 * const smallData = getResizedImageData(image, 80, 40);
 * const textOutput = ascii(smallData);
 * console.log(textOutput);
 */
export function ascii(imageData, options = {}) {
  const {
    charSet = DEFAULT_CHARSET,
    invert = false
  } = options;

  const chars = invert ? charSet.split('').reverse().join('') : charSet;
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  let result = '';

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      // data[offset + 3] is Alpha (ignored in basic ASCII)

      // BT.601 Luminance
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Map luma [0-255] to charIndex [0, chars.length - 1]
      // Use (1 - charIndex) logic implicitly by charSet ordering (dark to light)
      const charIndex = Math.floor((luma / 255) * (chars.length - 1));
      
      result += chars[charIndex];
    }
    result += '\n'; // Row transition
  }

  return result;
}
