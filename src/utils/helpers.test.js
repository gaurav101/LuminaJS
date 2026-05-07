import { describe, it, expect } from 'vitest';
import { clamp, isImageFile } from './helpers.js';

describe('helpers', () => {
  describe('clamp', () => {
    it('should clamp a value above the maximum', () => {
      expect(clamp(300, 0, 255)).toBe(255);
    });

    it('should clamp a value below the minimum', () => {
      expect(clamp(-10, 0, 255)).toBe(0);
    });

    it('should not clamp a value within the range', () => {
      expect(clamp(128, 0, 255)).toBe(128);
    });

    it('should handle range where min equals max', () => {
      expect(clamp(100, 50, 50)).toBe(50);
    });
  });

  describe('isImageFile', () => {
    it('should return false for non-File objects', () => {
      expect(isImageFile({})).toBe(false);
      expect(isImageFile(null)).toBe(false);
    });

    // Note: Testing with real File objects might require a browser environment or more complex mocking,
    // but we can test the logic if we mock the instance check or use a plain object that mimics a File if Vitest/jsdom allows.
    // For now, we've tested the negative case which is safe in this environment.
  });
});
