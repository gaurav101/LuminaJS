/* global global */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getPixelData,
  putPixelData,
  canvasToBlob,
  getResizedImageData,
  resize,
  crop,
} from '../../src/core/canvas.js';

describe('canvas.js', () => {
  let mockCtx;
  let mockCanvas;
  let originalDocument;
  let originalImage;

  beforeEach(() => {
    originalDocument = global.document;
    originalImage = global.Image;

    mockCtx = {
      drawImage: vi.fn(),
      getImageData: vi.fn((x, y, w, h) => {
        if (w === 0 || h === 0) throw new Error('IndexSizeError');
        return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h };
      }),
      putImageData: vi.fn(),
    };

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn((type) => {
        if (type === '2d') return mockCtx;
        return null;
      }),
      toBlob: vi.fn((cb, mime) => {
        if (mime === 'unsupported') {
          cb(null);
        } else {
          cb(new Blob(['mock data'], { type: mime || 'image/png' }));
        }
      }),
    };

    global.document = {
      createElement: vi.fn((tag) => {
        if (tag === 'canvas') {
          return {
            ...mockCanvas,
            getContext: mockCanvas.getContext,
            toBlob: mockCanvas.toBlob,
          };
        }
        return {};
      }),
    };
  });

  afterEach(() => {
    global.document = originalDocument;
    global.Image = originalImage;
    vi.restoreAllMocks();
  });

  describe('getPixelData', () => {
    it('should extract pixel data from a valid image', () => {
      const mockImage = { naturalWidth: 100, naturalHeight: 100 };
      const { imageData, canvas } = getPixelData(mockImage);

      expect(global.document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImage, 0, 0, 100, 100);
      expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 100, 100);
      expect(imageData.width).toBe(100);
      expect(canvas.width).toBe(100);
    });

    it('should fallback to width/height if natural dimensions are missing', () => {
      const mockImage = { width: 50, height: 50 };
      const { imageData, canvas } = getPixelData(mockImage);

      expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImage, 0, 0, 50, 50);
      expect(imageData.width).toBe(50);
      expect(canvas.width).toBe(50);
    });

    it('should throw if image has zero dimensions', () => {
      const mockImage = { width: 0, height: 0 };
      expect(() => getPixelData(mockImage)).toThrow(/zero dimensions/);
    });

    it('should throw if getImageData throws (e.g. tainted canvas)', () => {
      mockCtx.getImageData.mockImplementationOnce(() => {
        throw new Error('SecurityError');
      });
      const mockImage = { naturalWidth: 100, naturalHeight: 100 };
      expect(() => getPixelData(mockImage)).toThrow(/cross-origin image/);
    });
  });

  describe('putPixelData', () => {
    it('should put image data onto a canvas', () => {
      const mockImageData = { data: [], width: 100, height: 100 };
      putPixelData(mockCanvas, mockImageData);

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d', {
        willReadFrequently: true,
      });
      expect(mockCtx.putImageData).toHaveBeenCalledWith(mockImageData, 0, 0);
    });

    it('should throw if 2d context cannot be obtained', () => {
      mockCanvas.getContext.mockReturnValueOnce(null);
      const mockImageData = { data: [], width: 100, height: 100 };
      expect(() => putPixelData(mockCanvas, mockImageData)).toThrow(
        /Failed to obtain a 2D context/,
      );
    });
  });

  describe('canvasToBlob', () => {
    it('should convert canvas to blob with default parameters', async () => {
      const blob = await canvasToBlob(mockCanvas);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
      expect(mockCanvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png',
        0.92,
      );
    });

    it('should reject if toBlob returns null', async () => {
      await expect(canvasToBlob(mockCanvas, 'unsupported')).rejects.toThrow(
        /toBlob returned null/,
      );
    });
  });

  describe('resize', () => {
    it('should resize the source and return a new canvas', () => {
      const source = { naturalWidth: 200, naturalHeight: 200 };
      const resizedCanvas = resize(source, 100, 50);

      expect(global.document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCtx.drawImage).toHaveBeenCalledWith(source, 0, 0, 100, 50);
      expect(resizedCanvas.width).toBe(100);
      expect(resizedCanvas.height).toBe(50);
    });

    it('should throw on zero or negative dimensions', () => {
      const source = {};
      expect(() => resize(source, 0, 50)).toThrow(/positive/);
      expect(() => resize(source, 100, -10)).toThrow(/positive/);
    });
  });

  describe('crop', () => {
    it('should crop the source and return a new canvas', () => {
      const source = { naturalWidth: 200, naturalHeight: 200 };
      const croppedCanvas = crop(source, 10, 20, 100, 50);

      expect(global.document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        source,
        10,
        20,
        100,
        50,
        0,
        0,
        100,
        50,
      );
      expect(croppedCanvas.width).toBe(100);
      expect(croppedCanvas.height).toBe(50);
    });

    it('should throw on zero or negative dimensions', () => {
      const source = {};
      expect(() => crop(source, 0, 0, 0, 50)).toThrow(/positive/);
    });
  });

  describe('getResizedImageData', () => {
    it('should return extracted imagedata after resizing', () => {
      const source = { naturalWidth: 200, naturalHeight: 200 };
      const imageData = getResizedImageData(source, 50, 50);

      expect(mockCtx.drawImage).toHaveBeenCalledWith(source, 0, 0, 50, 50);
      expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 50, 50);
      expect(imageData.width).toBe(50);
    });

    it('should throw if resized canvas context is null', () => {
      mockCanvas.getContext.mockReturnValueOnce(null); // Return null on the context lookup in getResizedImageData
      const source = { naturalWidth: 200, naturalHeight: 200 };
      // It calls createOffscreenCanvas which calls getContext, then it calls getContext again in getResizedImageData
      global.document.createElement = vi.fn(() => ({
        ...mockCanvas,
        getContext: vi
          .fn()
          .mockReturnValueOnce(mockCtx) // For createOffscreenCanvas
          .mockReturnValueOnce(null), // For getResizedImageData
      }));

      expect(() => getResizedImageData(source, 50, 50)).toThrow(
        /Failed to obtain a 2D context/,
      );
    });
  });
});
