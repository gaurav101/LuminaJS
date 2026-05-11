/**
 * Initiates a chainable processing sequence.
 * @param {string|File|HTMLImageElement|HTMLCanvasElement|ImageData} source - The image source.
 * @returns {Lumina} A new Lumina chain instance.
 */
export function lumina(
  source: string | File | HTMLImageElement | HTMLCanvasElement | ImageData,
): Lumina;
export { loadImage } from './core/loader.js';
export { grayscale } from './filters/grayscale.js';
export { brightness } from './filters/brightness.js';
export { contrast } from './filters/contrast.js';
export { sepia } from './filters/sepia.js';
export { ascii } from './filters/ascii.js';
export { blur } from './filters/blur.js';
export { gaussianBlur } from './filters/gaussianBlur.js';
export { watermark } from './filters/watermark.js';
export { backgroundBlur } from './filters/backgroundBlur.js';
export { applyConvolution } from './filters/convolution.js';
export { sharpen } from './filters/sharpen.js';
export { emboss } from './filters/emboss.js';
export { edgeDetection } from './filters/edgeDetection.js';
export { Lumina };
import { Lumina } from './core/chain.js';
export {
  getPixelData,
  putPixelData,
  canvasToBlob,
  getResizedImageData,
  resize,
  crop,
} from './core/canvas.js';
export { clamp, isImageFile } from './utils/helpers.js';
