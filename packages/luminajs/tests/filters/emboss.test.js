/* global global */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { emboss } from '../../src/filters/emboss.js';
import { setupDOMMocks, createTestImageData } from '../utils/testHelpers.js';
import * as convolution from '../../src/filters/convolution.js';

describe('emboss filter', () => {
  let originalDocument;

  beforeEach(() => {
    originalDocument = global.document;
    setupDOMMocks();
  });

  afterEach(() => {
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  it('should apply emboss kernel via applyConvolution', () => {
    const input = createTestImageData(3, 3);
    const applyConvolutionSpy = vi.spyOn(convolution, 'applyConvolution');

    const output = emboss(input);
    expect(applyConvolutionSpy).toHaveBeenCalledWith(
      input.data,
      input.width,
      input.height,
      [-2, -1, 0, -1, 1, 1, 0, 1, 2],
    );
    expect(output).toBe(input);
  });
});
