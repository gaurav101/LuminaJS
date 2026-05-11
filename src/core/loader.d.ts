/**
 * Loads an image from either a URL string or a File object,
 * returning a Promise that resolves to an HTMLImageElement.
 *
 * This is the primary entry point for image ingestion in LuminaJS.
 *
 * @param {string | File} source - The image source. Accepts:
 *   - `string`: A URL (absolute, relative, or data URL).
 *   - `File`: A File object from the browser File API.
 * @returns {Promise<HTMLImageElement>} A promise that resolves to
 *   a fully loaded `HTMLImageElement`, ready for canvas drawing.
 * @throws {TypeError} Rejects if `source` is neither a string nor a File.
 *
 * @example
 * // Load from URL
 * const img = await loadImage('<image url string>');
 *
 * @example
 * // Load from File input
 * const [file] = event.target.files;
 * const img = await loadImage(file);
 */
export function loadImage(source: string | File): Promise<HTMLImageElement>;
