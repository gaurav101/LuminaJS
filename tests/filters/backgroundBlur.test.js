/* global global */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { backgroundBlur } from '../../src/filters/backgroundBlur.js';
import { createTestImageData, setupDOMMocks } from '../utils/testHelpers.js';
import * as gaussianBlurMod from '../../src/filters/gaussianBlur.js';

describe('backgroundBlur filter', () => {
  let originalDocument;

  beforeEach(() => {
    originalDocument = global.document;
    setupDOMMocks();
  });

  afterEach(() => {
    global.document = originalDocument;
    vi.restoreAllMocks();
  });
  it('should apply background blur by mixing original and gaussianBlur', () => {
    const input = createTestImageData(4, 4);

    // Set up a spy on gaussianBlur
    const blurSpy = vi
      .spyOn(gaussianBlurMod, 'gaussianBlur')
      .mockImplementation((img) => img);

    const output = backgroundBlur(input);

    expect(blurSpy).toHaveBeenCalledWith(input, 5); // Default sigma is 5
    expect(output).toBeDefined();
    expect(output.data.length).toBe(input.data.length);

    blurSpy.mockRestore();
  });
});
