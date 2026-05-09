import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadImage } from '../../src/core/loader.js';

// Mock File globally
global.File = class File {
  constructor(parts, name, options = {}) {
    this.name = name;
    this.type = options.type || '';
  }
};

describe('loader.js', () => {
  let originalImage;
  let originalURL;

  beforeEach(() => {
    originalImage = global.Image;
    originalURL = global.URL;

    global.Image = class {
      constructor() {
        this.src = '';
        this.onload = null;
        this.onerror = null;
        this.crossOrigin = '';
        
        // Mock async load behavior based on setting src
        Object.defineProperty(this, 'src', {
          get: function() { return this._src; },
          set: function(val) {
            this._src = val;
            setTimeout(() => {
              if (val && val.includes('error')) {
                if (this.onerror) this.onerror(new Error('Mock load error'));
              } else {
                if (this.onload) this.onload();
              }
            }, 0);
          }
        });
      }
    };

    global.URL = {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    };
  });

  afterEach(() => {
    global.Image = originalImage;
    global.URL = originalURL;
  });

  it('should load an image from a valid URL string', async () => {
    const img = await loadImage('http://example.com/image.png');
    expect(img).toBeInstanceOf(global.Image);
    expect(img.src).toBe('http://example.com/image.png');
    expect(img.crossOrigin).toBe('Anonymous');
  });

  it('should reject when URL loading fails', async () => {
    await expect(loadImage('http://example.com/error.png')).rejects.toThrow(/Failed to load image from URL/);
  });

  it('should load an image from a valid File object', async () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const img = await loadImage(mockFile);
    expect(img).toBeInstanceOf(global.Image);
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should reject when File type is not an image', async () => {
    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
    await expect(loadImage(mockFile)).rejects.toThrow(/Expected an image File/);
  });

  it('should reject when input is neither string nor File', async () => {
    await expect(loadImage(123)).rejects.toThrow(/Invalid source type/);
    await expect(loadImage({})).rejects.toThrow(/Invalid source type/);
    await expect(loadImage(null)).rejects.toThrow(/Invalid source type/);
  });
});
