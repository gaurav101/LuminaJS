/* global global */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { brightness } from '../../src/filters/brightness.js';
import { setupDOMMocks, createTestImageData } from '../utils/testHelpers.js';

describe('brightness filter', () => {
  let originalDocument;

  beforeEach(() => {
    originalDocument = global.document;
    setupDOMMocks();
  });

  afterEach(() => {
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  it('should increase brightness by the specified level', () => {
    const input = createTestImageData(1, 1);
    // input is R=10, G=20, B=30, A=255
    const output = brightness(input, 50);

    expect(output.data[0]).toBe(60); // 10 + 50
    expect(output.data[1]).toBe(70); // 20 + 50
    expect(output.data[2]).toBe(80); // 30 + 50
    expect(output.data[3]).toBe(255); // Alpha untouched
  });

  it('should decrease brightness for negative levels', () => {
    const input = createTestImageData(1, 1);
    const output = brightness(input, -5);

    expect(output.data[0]).toBe(5);
    expect(output.data[1]).toBe(15);
    expect(output.data[2]).toBe(25);
    expect(output.data[3]).toBe(255);
  });

  it('should clamp values between 0 and 255', () => {
    const input = createTestImageData(1, 1);
    const output = brightness(input, 300);

    expect(output.data[0]).toBe(255);
    expect(output.data[1]).toBe(255);
    expect(output.data[2]).toBe(255);
    expect(output.data[3]).toBe(255);

    const outputDark = brightness(input, -500);
    expect(outputDark.data[0]).toBe(0);
    expect(outputDark.data[1]).toBe(0);
    expect(outputDark.data[2]).toBe(0);
    expect(outputDark.data[3]).toBe(255);
  });

  it('should return a new ImageData object', () => {
    const input = createTestImageData(1, 1);
    const output = brightness(input, 10);
    expect(output).not.toBe(input);
    expect(output.data).not.toBe(input.data);
  });
});
