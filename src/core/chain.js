import * as filters from '../filters/index.js';
import { loadImage } from './loader.js';
import { getPixelData, putPixelData, canvasToBlob, resize, crop } from './canvas.js';

/**
 * @fileoverview LuminaJS Core - Chainable API
 * Provides a premium, fluent interface for image processing.
 */

export class Lumina {
  /**
   * @param {string|File|HTMLImageElement|HTMLCanvasElement|ImageData} source - The image source.
   */
  constructor(source) {
    /** @type {string|File|HTMLImageElement|HTMLCanvasElement|ImageData} */
    this.source = source;
    /** @type {Array<{fn: Function, args: any[]}>} */
    this.operations = [];
  }

  /**
   * Internal method to add an operation to the queue.
   * @param {Function} fn
   * @param {any[]} args
   * @private
   */
  _addOp(fn, ...args) {
    this.operations.push({ fn, args });
    return this;
  }

  // --- Filter Methods ---

  /** @returns {this} */
  grayscale() {
    return this._addOp(filters.grayscale);
  }

  /** @param {number} level - Brightness level. @returns {this} */
  brightness(level) {
    return this._addOp(filters.brightness, level);
  }

  /** @param {number} level - Contrast level. @returns {this} */
  contrast(level) {
    return this._addOp(filters.contrast, level);
  }

  /** @returns {this} */
  sepia() {
    return this._addOp(filters.sepia);
  }

  /** @param {any} options - ASCII options. @returns {this} */
  ascii(options) {
    return this._addOp(filters.ascii, options);
  }

  /** @param {number} radius - Blur radius. @returns {this} */
  blur(radius) {
    return this._addOp(filters.blur, radius);
  }

  /** @param {number} radius - Gaussian blur radius. @returns {this} */
  gaussianBlur(radius) {
    return this._addOp(filters.gaussianBlur, radius);
  }

  /** @param {string} text @param {any} options @returns {this} */
  watermark(text, options) {
    return this._addOp(filters.watermark, text, options);
  }

  /** @param {any} options @returns {this} */
  backgroundBlur(options) {
    return this._addOp(filters.backgroundBlur, options);
  }

  /** @param {number[]} kernel @param {number} [divisor] @param {number} [offset] @returns {this} */
  applyConvolution(kernel, divisor, offset) {
    return this._addOp(filters.applyConvolution, kernel, divisor, offset);
  }

  /** @returns {this} */
  sharpen() {
    return this._addOp(filters.sharpen);
  }

  /** @returns {this} */
  emboss() {
    return this._addOp(filters.emboss);
  }

  /** @returns {this} */
  edgeDetection() {
    return this._addOp(filters.edgeDetection);
  }

  // --- Transformation Methods ---

  /**
   * Resizes the image in the chain.
   * @param {number} width 
   * @param {number} height 
   * @returns {this}
   */
  resize(width, height) {
    return this._addOp((/** @type {ImageData} */ imageData, /** @type {number} */ w, /** @type {number} */ h) => {
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('LuminaJS [chain]: Failed to get canvas context.');
      ctx.putImageData(imageData, 0, 0);

      const resizedCanvas = resize(canvas, w, h);
      const resizedCtx = resizedCanvas.getContext('2d');
      if (!resizedCtx) throw new Error('LuminaJS [chain]: Failed to get resized canvas context.');
      return resizedCtx.getImageData(0, 0, w, h);
    }, width, height);
  }

  /**
   * Crops the image in the chain.
   * @param {number} x @param {number} y @param {number} width @param {number} height @returns {this}
   */
  crop(x, y, width, height) {
    return this._addOp((/** @type {ImageData} */ imageData, /** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ cw, /** @type {number} */ ch) => {
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('LuminaJS [chain]: Failed to get canvas context.');
      ctx.putImageData(imageData, 0, 0);

      const croppedCanvas = crop(canvas, cx, cy, cw, ch);
      const croppedCtx = croppedCanvas.getContext('2d');
      if (!croppedCtx) throw new Error('LuminaJS [chain]: Failed to get cropped canvas context.');
      return croppedCtx.getImageData(0, 0, cw, ch);
    }, x, y, width, height);
  }

  // --- Execution Methods ---

  /**
   * Resolves the source to ImageData.
   * @private
   * @returns {Promise<ImageData>}
   */
  async _resolveSource() {
    let currentSource = this.source;

    if (typeof currentSource === 'string' || currentSource instanceof File) {
      currentSource = await loadImage(currentSource);
    }

    if (currentSource instanceof HTMLImageElement) {
      return getPixelData(currentSource).imageData;
    }

    if (currentSource instanceof HTMLCanvasElement) {
      const ctx = currentSource.getContext('2d');
      if (!ctx) throw new Error('LuminaJS [chain]: Failed to get canvas context from source.');
      return ctx.getImageData(0, 0, currentSource.width, currentSource.height);
    }

    if (currentSource instanceof ImageData) {
      return currentSource;
    }

    throw new Error('LuminaJS [chain]: Unsupported source type.');
  }

  /**
   * Executes the chain and returns the final ImageData.
   * @returns {Promise<ImageData>}
   */
  async render() {
    let imageData = await this._resolveSource();

    for (const op of this.operations) {
      imageData = await op.fn(imageData, ...op.args);
    }

    return imageData;
  }

  /**
   * Executes the chain and draws the result to a canvas.
   * @param {HTMLCanvasElement} canvas 
   * @returns {Promise<HTMLCanvasElement>}
   */
  async toCanvas(canvas) {
    const imageData = await this.render();
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    putPixelData(canvas, imageData);
    return canvas;
  }

  /**
   * Executes the chain and returns a Blob.
   * @param {string} [mimeType='image/png']
   * @param {number} [quality=0.92]
   * @returns {Promise<Blob>}
   */
  async toBlob(mimeType = 'image/png', quality = 0.92) {
    const imageData = await this.render();
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    putPixelData(canvas, imageData);
    return canvasToBlob(canvas, mimeType, quality);
  }

  /**
   * Executes the chain and returns a Data URL.
   * @param {string} [mimeType='image/png']
   * @param {number} [quality=0.92]
   * @returns {Promise<string>}
   */
  async toDataURL(mimeType = 'image/png', quality = 0.92) {
    const imageData = await this.render();
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    putPixelData(canvas, imageData);
    return canvas.toDataURL(mimeType, quality);
  }

  /**
   * Executes the chain and displays the result in an HTML element.
   * Supports <img> (via src) and <canvas> (via drawing).
   * @param {string|HTMLElement} elementOrId - The target element or its ID.
   * @returns {Promise<HTMLElement>}
   */
  async toHtmlElement(elementOrId) {
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!el) {
      throw new Error(`LuminaJS [chain]: Target element not found: "${elementOrId}"`);
    }

    if (el instanceof HTMLImageElement) {
      el.src = await this.toDataURL();
    } else if (el instanceof HTMLCanvasElement) {
      await this.toCanvas(el);
    } else {
      throw new Error('LuminaJS [chain]: toHtmlElement only supports <img> and <canvas> elements.');
    }

    return el;
  }
}
