/**
 * @fileoverview LuminaJS Filters - Blur
 * Applies a box blur effect to an image.
 */

/**
 * Applies a box blur filter to a copy of the provided `ImageData`.
 * This implementation uses a two-pass box blur algorithm (horizontal then vertical)
 * for better performance.
 *
 * @param {ImageData} imageData - The source pixel data.
 * @param {number} radius - The blur radius (integer). Default is 1.
 * @returns {ImageData} A new `ImageData` object with blur applied.
 *
 * @example
 * const blurredData = blur(imageData, 3);
 */
export function blur(imageData, radius = 1) {
  const width = imageData.width;
  const height = imageData.height;
  const input = imageData.data;
  const output = new Uint8ClampedArray(input.length);
  const temp = new Uint8ClampedArray(input.length);

  radius = Math.max(0, Math.floor(radius));
  if (radius === 0) {
    return new ImageData(new Uint8ClampedArray(input), width, height);
  }

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < width) {
          const offset = (y * width + nx) * 4;
          r += input[offset];
          g += input[offset + 1];
          b += input[offset + 2];
          a += input[offset + 3];
          count++;
        }
      }
      const offset = (y * width + x) * 4;
      temp[offset]     = r / count;
      temp[offset + 1] = g / count;
      temp[offset + 2] = b / count;
      temp[offset + 3] = a / count;
    }
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < height) {
          const offset = (ny * width + x) * 4;
          r += temp[offset];
          g += temp[offset + 1];
          b += temp[offset + 2];
          a += temp[offset + 3];
          count++;
        }
      }
      const offset = (y * width + x) * 4;
      output[offset]     = r / count;
      output[offset + 1] = g / count;
      output[offset + 2] = b / count;
      output[offset + 3] = a / count;
    }
  }

  return new ImageData(output, width, height);
}
