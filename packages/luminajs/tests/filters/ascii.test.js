import { describe, it, expect } from 'vitest';
import { ascii } from '../../src/filters/ascii.js';
import { createTestImageData } from '../utils/testHelpers.js';

describe('ascii filter', () => {
  it('should generate ascii art string from ImageData', () => {
    const input = createTestImageData(2, 2);
    const output = ascii(input);

    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
    expect(output).toContain('\n');
  });

  it('should invert the character set if invert option is true', () => {
    const input = createTestImageData(2, 2);
    // Dummy image data is R=10, G=20, B=30 (very dark)
    // Dark pixels map to the beginning of the charset (default '@')
    const normalOutput = ascii(input);
    const invertedOutput = ascii(input, { invert: true });

    expect(normalOutput).not.toBe(invertedOutput);
  });
});
