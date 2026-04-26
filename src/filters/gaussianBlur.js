/**
 * @fileoverview LuminaJS Filters - Gaussian Blur
 * Applies a smooth Gaussian blur effect to an image.
 */

/**
 * Applies a Gaussian blur filter to a copy of the provided `ImageData`.
 * This implementation uses a two-pass separable convolution for better performance.
 *
 * @param {ImageData} imageData - The source pixel data.
 * @param {number} sigma - The standard deviation of the Gaussian distribution.
 *   Larger values result in more blurring. Default is 2.
 * @returns {ImageData} A new `ImageData` object with Gaussian blur applied.
 *
 * @example
 * const blurredData = gaussianBlur(imageData, 3.5);
 */
export function gaussianBlur(imageData, sigma = 2) {
  const width = imageData.width;
  const height = imageData.height;
  const input = imageData.data;
  const output = new Uint8ClampedArray(input.length);
  const temp = new Uint8ClampedArray(input.length);

  if (sigma <= 0) {
    return new ImageData(new Uint8ClampedArray(input), width, height);
  }

  // Calculate kernel radius (3 * sigma is standard for Gaussian)
  const radius = Math.ceil(sigma * 3);
  const size = radius * 2 + 1;
  const kernel = new Float32Array(size);
  
  // Pre-calculate Gaussian kernel
  let sum = 0;
  for (let i = 0; i < size; i++) {
    const x = i - radius;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    sum += kernel[i];
  }
  // Normalize kernel
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let k = 0; k < size; k++) {
        const nx = x + (k - radius);
        // Edge handling: clamping to nearest pixel
        const ix = Math.max(0, Math.min(width - 1, nx));
        const offset = (y * width + ix) * 4;
        const weight = kernel[k];
        
        r += input[offset] * weight;
        g += input[offset + 1] * weight;
        b += input[offset + 2] * weight;
        a += input[offset + 3] * weight;
      }
      const offset = (y * width + x) * 4;
      temp[offset]     = r;
      temp[offset + 1] = g;
      temp[offset + 2] = b;
      temp[offset + 3] = a;
    }
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let k = 0; k < size; k++) {
        const ny = y + (k - radius);
        const iy = Math.max(0, Math.min(height - 1, ny));
        const offset = (iy * width + x) * 4;
        const weight = kernel[k];
        
        r += temp[offset] * weight;
        g += temp[offset + 1] * weight;
        b += temp[offset + 2] * weight;
        a += temp[offset + 3] * weight;
      }
      const offset = (y * width + x) * 4;
      output[offset]     = r;
      output[offset + 1] = g;
      output[offset + 2] = b;
      output[offset + 3] = a;
    }
  }

  return new ImageData(output, width, height);
}
