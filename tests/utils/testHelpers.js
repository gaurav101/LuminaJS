/* global global */
import { vi } from 'vitest';

export class MockImageData {
  constructor(dataOrWidth, widthOrHeight, height) {
    if (dataOrWidth instanceof Uint8ClampedArray) {
      this.data = dataOrWidth;
      this.width = widthOrHeight;
      this.height = height;
    } else {
      this.width = dataOrWidth;
      this.height = widthOrHeight;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    }
  }
}

export function setupDOMMocks() {
  global.ImageData = MockImageData;
  global.HTMLCanvasElement = class HTMLCanvasElement {};
  global.HTMLImageElement = class HTMLImageElement {};

  const mockCtx = {
    drawImage: vi.fn(),
    getImageData: vi.fn((x, y, w, h) => new MockImageData(w, h)),
    putImageData: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    clip: vi.fn(),
  };

  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => mockCtx),
    toDataURL: vi.fn(() => 'data:image/png;base64,...'),
    toBlob: vi.fn((cb, mime) =>
      cb(new Blob(['mock data'], { type: mime || 'image/png' })),
    ),
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
    getElementById: vi.fn(),
  };

  return { mockCtx, mockCanvas };
}

export function createTestImageData(width = 2, height = 2) {
  const data = new Uint8ClampedArray(width * height * 4);
  // Fill with dummy color (R=10, G=20, B=30, A=255)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 10;
    data[i + 1] = 20;
    data[i + 2] = 30;
    data[i + 3] = 255;
  }
  return new MockImageData(data, width, height);
}
