import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Lumina } from '../../src/core/chain.js';
import * as filters from '../../src/filters/index.js';
import * as loader from '../../src/core/loader.js';
import * as canvas from '../../src/core/canvas.js';

vi.mock('../../src/filters/index.js', () => ({
  grayscale: vi.fn((img) => img),
  brightness: vi.fn((img) => img),
  contrast: vi.fn((img) => img),
  sepia: vi.fn((img) => img),
  ascii: vi.fn((img) => img),
  blur: vi.fn((img) => img),
  gaussianBlur: vi.fn((img) => img),
  watermark: vi.fn((img) => img),
  backgroundBlur: vi.fn((img) => img),
  applyConvolution: vi.fn((img) => img),
  sharpen: vi.fn((img) => img),
  emboss: vi.fn((img) => img),
  edgeDetection: vi.fn((img) => img),
}));

vi.mock('../../src/core/loader.js', () => ({
  loadImage: vi.fn(),
}));

vi.mock('../../src/core/canvas.js', () => ({
  getPixelData: vi.fn(),
  putPixelData: vi.fn(),
  canvasToBlob: vi.fn(),
  resize: vi.fn(),
  crop: vi.fn(),
}));

global.HTMLCanvasElement = class HTMLCanvasElement {};
global.HTMLImageElement = class HTMLImageElement {};
global.ImageData = class ImageData {};

describe('chain.js (Lumina class)', () => {
  let lumina;
  let mockImageData;
  let originalDocument;

  beforeEach(() => {
    mockImageData = { data: [], width: 100, height: 100 };
    lumina = new Lumina('test.png');
    
    loader.loadImage.mockResolvedValue({ isMockImage: true });
    canvas.getPixelData.mockReturnValue({ imageData: mockImageData, canvas: {} });

    originalDocument = global.document;
    global.document = {
      createElement: vi.fn(() => ({
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          putImageData: vi.fn(),
          getImageData: vi.fn(() => mockImageData),
          drawImage: vi.fn(),
        })),
        toDataURL: vi.fn(() => 'data:image/png;base64,...'),
      })),
      getElementById: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    global.document = originalDocument;
  });

  describe('constructor', () => {
    it('should initialize source and operations array', () => {
      const l = new Lumina('source.png');
      expect(l.source).toBe('source.png');
      expect(l.operations).toEqual([]);
    });
  });

  describe('chainable methods', () => {
    it('should add grayscale operation and return this', () => {
      const result = lumina.grayscale();
      expect(result).toBe(lumina);
      expect(lumina.operations[0]).toEqual({ fn: filters.grayscale, args: [] });
    });

    it('should add brightness operation with argument', () => {
      lumina.brightness(10);
      expect(lumina.operations[0]).toEqual({ fn: filters.brightness, args: [10] });
    });

    it('should add multiple operations', () => {
      lumina.contrast(5).sepia().blur(3);
      expect(lumina.operations).toHaveLength(3);
      expect(lumina.operations[0].fn).toBe(filters.contrast);
      expect(lumina.operations[1].fn).toBe(filters.sepia);
      expect(lumina.operations[2].fn).toBe(filters.blur);
    });

    it('should handle complex operations like watermark', () => {
      lumina.watermark('test', { color: 'red' });
      expect(lumina.operations[0]).toEqual({ fn: filters.watermark, args: ['test', { color: 'red' }] });
    });

    it('should handle applyConvolution', () => {
      lumina.applyConvolution([1,0,-1], 1, 0);
      expect(lumina.operations[0].fn).toBe(filters.applyConvolution);
      expect(lumina.operations[0].args).toEqual([[1,0,-1], 1, 0]);
    });
  });

  describe('transformation methods', () => {
    it('should add resize operation that uses canvas resize', async () => {
      canvas.resize.mockReturnValue({
        getContext: () => ({ getImageData: () => mockImageData })
      });
      lumina.resize(50, 50);
      expect(lumina.operations[0].args).toEqual([50, 50]);
      
      const opFn = lumina.operations[0].fn;
      const result = await opFn(mockImageData, 50, 50);
      expect(result).toBe(mockImageData);
      expect(canvas.resize).toHaveBeenCalled();
    });

    it('should add crop operation that uses canvas crop', async () => {
      canvas.crop.mockReturnValue({
        getContext: () => ({ getImageData: () => mockImageData })
      });
      lumina.crop(10, 10, 50, 50);
      expect(lumina.operations[0].args).toEqual([10, 10, 50, 50]);

      const opFn = lumina.operations[0].fn;
      const result = await opFn(mockImageData, 10, 10, 50, 50);
      expect(result).toBe(mockImageData);
      expect(canvas.crop).toHaveBeenCalled();
    });
  });

  describe('execution methods', () => {
    describe('_resolveSource', () => {
      it('should resolve string source via loadImage and getPixelData', async () => {
        lumina.source = 'test.jpg';
        const mockHtmlImg = new global.HTMLImageElement();
        loader.loadImage.mockResolvedValueOnce(mockHtmlImg);
        
        const res = await lumina._resolveSource();
        expect(loader.loadImage).toHaveBeenCalledWith('test.jpg');
        expect(canvas.getPixelData).toHaveBeenCalledWith(mockHtmlImg);
      });

      it('should resolve ImageData directly', async () => {
        Object.defineProperty(global, 'ImageData', { value: function() {} });
        const mockImgData = new global.ImageData();
        lumina.source = mockImgData;
        const res = await lumina._resolveSource();
        expect(res).toBe(mockImgData);
      });

      it('should throw on unsupported source type', async () => {
        lumina.source = 123;
        await expect(lumina._resolveSource()).rejects.toThrow(/Unsupported source type/);
      });
    });

    describe('render', () => {
      it('should resolve source and apply all operations sequentially', async () => {
        lumina._resolveSource = vi.fn().mockResolvedValue(mockImageData);
        lumina.grayscale().brightness(10);
        
        const finalImageData = await lumina.render();
        expect(lumina._resolveSource).toHaveBeenCalled();
        expect(filters.grayscale).toHaveBeenCalledWith(mockImageData);
        expect(filters.brightness).toHaveBeenCalledWith(mockImageData, 10);
        expect(finalImageData).toBe(mockImageData);
      });
    });

    describe('toCanvas', () => {
      it('should render and put pixel data on provided canvas', async () => {
        lumina.render = vi.fn().mockResolvedValue(mockImageData);
        const mockTargetCanvas = { width: 0, height: 0 };
        
        const res = await lumina.toCanvas(mockTargetCanvas);
        expect(lumina.render).toHaveBeenCalled();
        expect(mockTargetCanvas.width).toBe(100);
        expect(mockTargetCanvas.height).toBe(100);
        expect(canvas.putPixelData).toHaveBeenCalledWith(mockTargetCanvas, mockImageData);
        expect(res).toBe(mockTargetCanvas);
      });
    });

    describe('toBlob', () => {
      it('should render and return canvas blob', async () => {
        lumina.render = vi.fn().mockResolvedValue(mockImageData);
        canvas.canvasToBlob.mockResolvedValueOnce('mock-blob');
        
        const blob = await lumina.toBlob('image/jpeg', 0.8);
        expect(canvas.putPixelData).toHaveBeenCalled();
        expect(canvas.canvasToBlob).toHaveBeenCalledWith(expect.anything(), 'image/jpeg', 0.8);
        expect(blob).toBe('mock-blob');
      });
    });

    describe('toDataURL', () => {
      it('should render and return data URL', async () => {
        lumina.render = vi.fn().mockResolvedValue(mockImageData);
        const dataUrl = await lumina.toDataURL('image/jpeg', 0.8);
        expect(canvas.putPixelData).toHaveBeenCalled();
        expect(dataUrl).toBe('data:image/png;base64,...');
      });
    });

    describe('toHtmlElement', () => {
      it('should throw if element not found by ID', async () => {
        await expect(lumina.toHtmlElement('non-existent')).rejects.toThrow(/Target element not found/);
      });

      it('should throw if element is not img or canvas', async () => {
        const div = {}; // not HTMLImageElement or HTMLCanvasElement
        await expect(lumina.toHtmlElement(div)).rejects.toThrow(/only supports <img> and <canvas>/);
      });
    });
  });
});
