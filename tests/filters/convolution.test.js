import { describe, it, expect } from 'vitest';
import { applyConvolution } from '../../src/filters/convolution.js';

describe('convolution', () => {
  it('should apply a convolution kernel', () => {
    // 3x3 image
    const data = new Uint8ClampedArray(3 * 3 * 4);
    data.fill(255); // White image

    // Set middle pixel to somewhat grey
    const mid = (1 * 3 + 1) * 4;
    data[mid] = 100;
    data[mid + 1] = 100;
    data[mid + 2] = 100;
    data[mid + 3] = 255;

    // Identity kernel (returns the original)
    const kernel = [0, 0, 0, 0, 1, 0, 0, 0, 0];

    applyConvolution(data, 3, 3, kernel);
    expect(data[mid]).toBe(100);
    expect(data[mid + 1]).toBe(100);
    expect(data[mid + 2]).toBe(100);
  });
});
