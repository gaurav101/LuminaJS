/* global global */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { gaussianBlur } from '../../src/filters/gaussianBlur.js';
import { setupDOMMocks, createTestImageData } from '../utils/testHelpers.js';

describe('gaussianBlur filter', () => {
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
    const output = gaussianBlur(input, 0);
    expect(output.data).toEqual(input.data);
    expect(output).not.toBe(input);
  });

  it('should apply gaussian blur', () => {
    const input = createTestImageData(3, 3);
    const mid = (1 * 3 + 1) * 4;
    input.data[mid] = 255;

    const output = gaussianBlur(input, 1);

    expect(output.data[mid]).toBeLessThan(255);
    expect(output.data[mid]).toBeGreaterThan(10);
  });
});
