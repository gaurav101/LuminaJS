/* global global */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { blur } from '../../src/filters/blur.js';
import { setupDOMMocks, createTestImageData } from '../utils/testHelpers.js';

describe('blur filter', () => {
  let originalDocument;

  beforeEach(() => {
    originalDocument = global.document;
    setupDOMMocks();
  });

  afterEach(() => {
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  it('should return original image if radius is 0', () => {
    const input = createTestImageData(2, 2);
    const output = blur(input, 0);
    expect(output.data).toEqual(input.data);
    expect(output).not.toBe(input);
  });

  it('should apply box blur', () => {
    const input = createTestImageData(3, 3);
    // Set middle pixel to white
    const mid = (1 * 3 + 1) * 4;
    input.data[mid] = 255;
    input.data[mid + 1] = 255;
    input.data[mid + 2] = 255;

    const output = blur(input, 1);

    // Middle pixel should be blurred (averaged with neighbors)
    expect(output.data[mid]).toBeLessThan(255);
    expect(output.data[mid]).toBeGreaterThan(10);
  });
});
