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
export function ascii(
  imageData: ImageData,
  options?: {
    charSet?: string | undefined;
    invert?: boolean | undefined;
  },
): string;
