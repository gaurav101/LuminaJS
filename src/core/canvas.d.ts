/**
 * Draws an HTMLImageElement onto an offscreen canvas and returns the raw
 * pixel data as an `ImageData` object.
 *
 * The returned `ImageData.data` is a flat `Uint8ClampedArray` of RGBA values:
 * `[R, G, B, A, R, G, B, A, ...]`, where each channel is in the range [0, 255].
 *
 * @param {HTMLImageElement} image - A fully loaded image element. It must have
 *   non-zero `naturalWidth` and `naturalHeight` properties.
 * @returns {{ imageData: ImageData, canvas: HTMLCanvasElement }} An object
 *   containing the extracted `ImageData` and the offscreen `canvas` used,
 *   which can be passed to `putPixelData` after manipulation.
 * @throws {Error} Throws if the image has zero dimensions or if the canvas
 *   context cannot be obtained (e.g. context already in use).
 *
 * @example
 * const img = await loadImage('photo.jpg');
 * const { imageData, canvas } = getPixelData(img);
 * // imageData.data => Uint8ClampedArray [R, G, B, A, ...]
 */
export function getPixelData(image: HTMLImageElement): {
  imageData: ImageData;
  canvas: HTMLCanvasElement;
};
/**
 * Writes an `ImageData` object back onto a canvas element, replacing its
 * current contents. This is the inverse of `getPixelData` and is used to
 * commit mutated pixel data back to a drawable surface.
 *
 * @param {HTMLCanvasElement} canvas   - The target canvas. Typically the one
 *   returned from a prior `getPixelData` call, already sized to match the data.
 * @param {ImageData}         imageData - The pixel data to write. Its `width`
 *   and `height` must not exceed the canvas dimensions.
 * @returns {void}
 * @throws {Error} Throws if a 2D context cannot be obtained from the canvas.
 *
 * @example
 * const { imageData, canvas } = getPixelData(img);
 * // ... mutate imageData.data ...
 * putPixelData(canvas, imageData);
 * const dataURL = canvas.toDataURL('image/png');
 */
export function putPixelData(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
): void;
/**
 * Converts a canvas element to a `Blob` asynchronously.
 * A convenience wrapper around the native `canvas.toBlob` callback API.
 *
 * @param {HTMLCanvasElement} canvas   - The source canvas.
 * @param {string}            [mimeType='image/png']  - Output MIME type (e.g. `'image/jpeg'`).
 * @param {number}            [quality=0.92] - Compression quality for lossy formats (0.0–1.0).
 * @returns {Promise<Blob>} Resolves with the encoded image Blob.
 * @throws {Error} Rejects if the browser fails to encode the canvas.
 *
 * @example
 * const blob = await canvasToBlob(canvas, 'image/jpeg', 0.85);
 * const url = URL.createObjectURL(blob);
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType?: string,
  quality?: number,
): Promise<Blob>;
/**
 * Extracts ImageData from an image after resizing it to the specified dimensions.
 * Useful for filters that require downsampling, like ASCII art.
 *
 * @param {HTMLImageElement} image  - The source image.
 * @param {number}           width  - Target width.
 * @param {number}           height - Target height.
 * @returns {ImageData} The extracted pixel data at the new resolution.
 */
export function getResizedImageData(
  image: HTMLImageElement,
  width: number,
  height: number,
): ImageData;
/**
 * Resizes an image or canvas to new dimensions.
 * Returns a new canvas with the resized content.
 *
 * @param {HTMLImageElement|HTMLCanvasElement} source - The source to resize.
 * @param {number} width - New width.
 * @param {number} height - New height.
 * @returns {HTMLCanvasElement} A new canvas containing the resized image.
 */
export function resize(
  source: HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number,
): HTMLCanvasElement;
/**
 * Crops an image or canvas.
 * Returns a new canvas with the cropped content.
 *
 * @param {HTMLImageElement|HTMLCanvasElement} source - The source to crop.
 * @param {number} x - Left coordinate.
 * @param {number} y - Top coordinate.
 * @param {number} width - Crop width.
 * @param {number} height - Crop height.
 * @returns {HTMLCanvasElement} A new canvas containing the cropped image.
 */
export function crop(
  source: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
): HTMLCanvasElement;
export type CanvasContext = {
  /**
   * - The offscreen canvas element.
   */
  canvas: HTMLCanvasElement;
  /**
   * - The 2D rendering context.
   */
  ctx: CanvasRenderingContext2D;
};
