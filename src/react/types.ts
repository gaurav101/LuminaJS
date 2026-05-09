import { type Lumina } from '../index.js';

export interface ImageEditingOptions {
  grayscale?: boolean;
  brightness?: number;
  contrast?: number;
  sepia?: boolean;
  ascii?: boolean | Record<string, any>;
  blur?: number;
  gaussianBlur?: number;
  watermark?: { text: string; options?: any };
  backgroundBlur?: any;
  sharpen?: boolean;
  emboss?: boolean;
  edgeDetection?: boolean;
  resize?: { width: number; height: number };
  crop?: { x: number; y: number; width: number; height: number };
}

/**
 * Applies the provided ImageEditingOptions to a Lumina instance.
 * @param chain The Lumina chain instance
 * @param options The options to apply
 * @returns The modified Lumina chain instance
 */
export function applyEditingOptions(
  chain: Lumina,
  options: ImageEditingOptions,
): Lumina {
  let c = chain;

  if (options.grayscale) c = c.grayscale();
  if (options.brightness !== undefined) c = c.brightness(options.brightness);
  if (options.contrast !== undefined) c = c.contrast(options.contrast);
  if (options.sepia) c = c.sepia();
  if (options.ascii) {
    c = c.ascii(typeof options.ascii === 'boolean' ? {} : options.ascii);
  }
  if (options.blur !== undefined) c = c.blur(options.blur);
  if (options.gaussianBlur !== undefined)
    c = c.gaussianBlur(options.gaussianBlur);
  if (options.watermark) {
    c = c.watermark(options.watermark.text, options.watermark.options);
  }
  if (options.backgroundBlur) {
    c = c.backgroundBlur(options.backgroundBlur);
  }
  if (options.sharpen) c = c.sharpen();
  if (options.emboss) c = c.emboss();
  if (options.edgeDetection) c = c.edgeDetection();
  if (options.resize) {
    c = c.resize(options.resize.width, options.resize.height);
  }
  if (options.crop) {
    c = c.crop(
      options.crop.x,
      options.crop.y,
      options.crop.width,
      options.crop.height,
    );
  }

  return c;
}
