/* global global */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { watermark } from '../../src/filters/watermark.js';
import { setupDOMMocks, createTestImageData } from '../utils/testHelpers.js';

describe('watermark filter', () => {
  let originalDocument;
  let mockCtx;

  beforeEach(() => {
    originalDocument = global.document;
    const mocks = setupDOMMocks();
    mockCtx = mocks.mockCtx;
  });

  afterEach(() => {
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  it('should draw text on canvas and return new ImageData', () => {
    const input = createTestImageData(100, 100);
    const output = watermark(input, 'Test Text', {
      x: 50,
      y: 50,
      color: 'red',
    });

    expect(global.document.createElement).toHaveBeenCalledWith('canvas');
    expect(mockCtx.putImageData).toHaveBeenCalledWith(input, 0, 0);
    expect(mockCtx.fillText).toHaveBeenCalledWith('Test Text', 50, 50);
    expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 100, 100);
    expect(output).toBeDefined();
  });

  it('should use default options if not provided', () => {
    const input = createTestImageData(100, 100);
    watermark(input, 'Default');

    expect(mockCtx.fillText).toHaveBeenCalledWith('Default', 10, 10);
    expect(mockCtx.fillStyle).toBe('rgba(255, 255, 255, 0.5)');
  });

  it('should throw error if canvas context cannot be obtained', () => {
    global.document.createElement.mockReturnValueOnce({
      width: 100,
      height: 100,
      getContext: () => null,
    });
    const input = createTestImageData(100, 100);
    expect(() => watermark(input, 'text')).toThrow(
      /Failed to obtain 2D context/,
    );
  });
});
