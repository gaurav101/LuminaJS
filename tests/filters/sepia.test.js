/* global global */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sepia } from '../../src/filters/sepia.js';
import { setupDOMMocks, createTestImageData } from '../utils/testHelpers.js';

describe('sepia filter', () => {
  let originalDocument;

  beforeEach(() => {
    originalDocument = global.document;
    setupDOMMocks();
  });

  afterEach(() => {
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  it('should apply sepia algorithm', () => {
    const input = createTestImageData(1, 1);
    // input is R=10, G=20, B=30
    const output = sepia(input);

    // Sepia formulas:
    // tr = (R * .393) + (G *.769) + (B * .189)
    // tg = (R * .349) + (G *.686) + (B * .168)
    // tb = (R * .272) + (G *.534) + (B * .131)

    // tr = 3.93 + 15.38 + 5.67 = 24.98 => 24
    // tg = 3.49 + 13.72 + 5.04 = 22.25 => 22
    // Uint8ClampedArray rounds to nearest integer
    // 24.98 -> 25
    // 22.25 -> 22
    // 17.33 -> 17

    expect(output.data[0]).toBe(25);
    expect(output.data[1]).toBe(22);
    expect(output.data[2]).toBe(17);
    expect(output.data[3]).toBe(255);
  });

  it('should return a new ImageData object', () => {
    const input = createTestImageData(1, 1);
    const output = sepia(input);
    expect(output).not.toBe(input);
    expect(output.data).not.toBe(input.data);
  });
});
