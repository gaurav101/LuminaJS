/* global global */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sharpen } from '../../src/filters/sharpen.js';
import { setupDOMMocks, createTestImageData } from '../utils/testHelpers.js';
import * as convolution from '../../src/filters/convolution.js';

describe('sharpen filter', () => {
  let originalDocument;

  beforeEach(() => {
    originalDocument = global.document;
    setupDOMMocks();
  });

  afterEach(() => {
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  it('should apply sharpen kernel via applyConvolution', () => {
    const input = createTestImageData(3, 3);
    const applyConvolutionSpy = vi.spyOn(convolution, 'applyConvolution');

    const output = sharpen(input);
    expect(applyConvolutionSpy).toHaveBeenCalledWith(
      input.data,
      input.width,
      input.height,
      [0, -1, 0, -1, 5, -1, 0, -1, 0],
    );
    expect(output).toBe(input);
  });
});
