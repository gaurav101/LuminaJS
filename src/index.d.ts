/**
 * @fileoverview LuminaJS Type Definitions
 */

/**
 * Loads an image from a URL string or File object.
 */
export function loadImage(source: string | File): Promise<HTMLImageElement>;

/**
 * Result of getPixelData operation.
 */
export interface PixelDataResult {
  imageData: ImageData;
  canvas: HTMLCanvasElement;
}

/**
 * Extracts pixel data from an image using an offscreen canvas.
 */
export function getPixelData(image: HTMLImageElement): PixelDataResult;

/**
 * Writes pixel data back to a canvas.
 */
export function putPixelData(canvas: HTMLCanvasElement, imageData: ImageData): void;

/**
 * Converts a canvas to a Blob asynchronously.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType?: string,
  quality?: number
): Promise<Blob>;

/**
 * Extracts ImageData from an image after resizing it to the specified dimensions.
 */
export function getResizedImageData(
  image: HTMLImageElement,
  width: number,
  height: number
): ImageData;

/**
 * Converts an image to grayscale.
 */
export function grayscale(imageData: ImageData): ImageData;

/**
 * Adjusts image brightness.
 */
export function brightness(imageData: ImageData, level?: number): ImageData;

/**
 * Adjusts image contrast.
 */
export function contrast(imageData: ImageData, level?: number): ImageData;

/**
 * Applies a sepia (antique) tone.
 */
export function sepia(imageData: ImageData): ImageData;

/**
 * ASCII transformation options.
 */
export interface AsciiOptions {
  charSet?: string;
  invert?: boolean;
}

/**
 * Converts an image into an ASCII text string.
 */
export function ascii(imageData: ImageData, options?: AsciiOptions): string;

/**
 * Clamps a numeric value to a range.
 */
export function clamp(value: number, min: number, max: number): number;

/**
 * Type guard for image File objects.
 */
export function isImageFile(value: unknown): value is File;
