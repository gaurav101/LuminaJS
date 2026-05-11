/**
 * @fileoverview LuminaJS Core - Chainable API
 * Provides a premium, fluent interface for image processing.
 */
export class Lumina {
  /**
   * @param {string|File|HTMLImageElement|HTMLCanvasElement|ImageData} source - The image source.
   */
  constructor(
    source: string | File | HTMLImageElement | HTMLCanvasElement | ImageData,
  );
  /** @type {string|File|HTMLImageElement|HTMLCanvasElement|ImageData} */
  source: string | File | HTMLImageElement | HTMLCanvasElement | ImageData;
  /** @type {Array<{fn: (...args: unknown[]) => unknown, args: unknown[]}>} */
  operations: Array<{
    fn: (...args: unknown[]) => unknown;
    args: unknown[];
  }>;
  /**
   * Internal method to add an operation to the queue.
   * @param {(...args: unknown[]) => unknown} fn
   * @param {unknown[]} args
   * @private
   */
  private _addOp;
  /** @returns {this} */
  grayscale(): this;
  /** @param {number} level - Brightness level. @returns {this} */
  brightness(level: number): this;
  /** @param {number} level - Contrast level. @returns {this} */
  contrast(level: number): this;
  /** @returns {this} */
  sepia(): this;
  /** @param {Record<string, unknown>} [options] - ASCII options. @returns {this} */
  ascii(options?: Record<string, unknown>): this;
  /** @param {number} radius - Blur radius. @returns {this} */
  blur(radius: number): this;
  /** @param {number} radius - Gaussian blur radius. @returns {this} */
  gaussianBlur(radius: number): this;
  /** @param {string} text @param {Record<string, unknown>} options @returns {this} */
  watermark(text: string, options: Record<string, unknown>): this;
  /** @param {Record<string, unknown>} options @returns {this} */
  backgroundBlur(options: Record<string, unknown>): this;
  /** @param {number[]} kernel @param {number} [divisor] @param {number} [offset] @returns {this} */
  applyConvolution(kernel: number[], divisor?: number, offset?: number): this;
  /** @returns {this} */
  sharpen(): this;
  /** @returns {this} */
  emboss(): this;
  /** @returns {this} */
  edgeDetection(): this;
  /**
   * Resizes the image in the chain.
   * @param {number} width
   * @param {number} height
   * @returns {this}
   */
  resize(width: number, height: number): this;
  /**
   * Crops the image in the chain.
   * @param {number} x @param {number} y @param {number} width @param {number} height @returns {this}
   */
  crop(x: number, y: number, width: number, height: number): this;
  /**
   * Resolves the source to ImageData.
   * @private
   * @returns {Promise<ImageData>}
   */
  private _resolveSource;
  /**
   * Executes the chain and returns the final ImageData.
   * @returns {Promise<ImageData>}
   */
  render(): Promise<ImageData>;
  /**
   * Executes the chain and draws the result to a canvas.
   * @param {HTMLCanvasElement} canvas
   * @returns {Promise<HTMLCanvasElement>}
   */
  toCanvas(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement>;
  /**
   * Executes the chain and returns a Blob.
   * @param {string} [mimeType='image/png']
   * @param {number} [quality=0.92]
   * @returns {Promise<Blob>}
   */
  toBlob(mimeType?: string, quality?: number): Promise<Blob>;
  /**
   * Executes the chain and returns a Data URL.
   * @param {string} [mimeType='image/png']
   * @param {number} [quality=0.92]
   * @returns {Promise<string>}
   */
  toDataURL(mimeType?: string, quality?: number): Promise<string>;
  /**
   * Executes the chain and displays the result in an HTML element.
   * Supports <img> (via src) and <canvas> (via drawing).
   * @param {string|HTMLElement} elementOrId - The target element or its ID.
   * @returns {Promise<HTMLElement>}
   */
  toHtmlElement(elementOrId: string | HTMLElement): Promise<HTMLElement>;
}
