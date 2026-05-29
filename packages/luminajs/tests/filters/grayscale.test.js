/* global global */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { grayscale } from '../../src/filters/grayscale.js';
import { setupDOMMocks, createTestImageData } from '../utils/testHelpers.js';

describe('grayscale filter', () => {
  let originalDocument;

  beforeEach(() => {
    originalDocument = global.document;
    setupDOMMocks();
  });

  afterEach(() => {
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  it('should apply grayscale algorithm', () => {
    const input = createTestImageData(1, 1);
    // input is R=10, G=20, B=30
    const output = grayscale(input);

    // Grayscale formula: 0.299 * R + 0.587 * G + 0.114 * B
    // 0.299*10 + 0.587*20 + 0.114*30 = 2.99 + 11.74 + 3.42 = 18.15 => 18
    expect(output.data[0]).toBe(18); // R
    expect(output.data[1]).toBe(18); // G
    expect(output.data[2]).toBe(18); // B
    expect(output.data[3]).toBe(255); // Alpha untouched
  });

  it('should return a new ImageData object', () => {
    const input = createTestImageData(1, 1);
    const output = grayscale(input);
    expect(output).not.toBe(input);
    expect(output.data).not.toBe(input.data);
  });
});
