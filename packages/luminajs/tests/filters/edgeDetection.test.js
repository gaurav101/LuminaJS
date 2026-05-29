/* global global */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { edgeDetection } from '../../src/filters/edgeDetection.js';
import { setupDOMMocks, createTestImageData } from '../utils/testHelpers.js';
import * as convolution from '../../src/filters/convolution.js';

describe('edgeDetection filter', () => {
  let originalDocument;

  beforeEach(() => {
    originalDocument = global.document;
    setupDOMMocks();
  });

  afterEach(() => {
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  it('should apply edge detection kernel via applyConvolution', () => {
    const input = createTestImageData(3, 3);
    const applyConvolutionSpy = vi.spyOn(convolution, 'applyConvolution');

    const output = edgeDetection(input);
    expect(applyConvolutionSpy).toHaveBeenCalledWith(
      input.data,
      input.width,
      input.height,
      [-1, -1, -1, -1, 8, -1, -1, -1, -1],
    );
    expect(output).toBe(input);
  });
});
