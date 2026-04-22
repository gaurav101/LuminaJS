/**
 * @fileoverview LuminaJS Core - Image Loader
 * Handles ingestion of image sources (URL strings or File objects)
 * and resolves them to HTMLImageElement instances.
 */

/**
 * Loads an image from a URL string.
 *
 * @param {string} url - A fully-qualified image URL or a data URL.
 * @returns {Promise<HTMLImageElement>} Resolves with a fully loaded HTMLImageElement.
 * @throws {Error} Rejects if the image fails to load (e.g. 404, CORS block).
 */
function loadFromURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Required for cross-origin images to allow canvas pixel access.
    // The server must respond with appropriate CORS headers.
    img.crossOrigin = 'Anonymous';

    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`LuminaJS [loader]: Failed to load image from URL — "${url}"`));

    img.src = url;
  });
}

/**
 * Loads an image from a File object by creating a temporary object URL.
 * The object URL is revoked automatically after the image has loaded
 * to prevent memory leaks.
 *
 * @param {File} file - A File object, typically from an <input type="file"> element.
 * @returns {Promise<HTMLImageElement>} Resolves with a fully loaded HTMLImageElement.
 * @throws {TypeError} Rejects if the provided File is not a valid image MIME type.
 * @throws {Error} Rejects if the image fails to load from the generated object URL.
 */
function loadFromFile(file) {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(
      new TypeError(
        `LuminaJS [loader]: Expected an image File, but received MIME type "${file.type}".`
      )
    );
  }

  const objectURL = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectURL); // Release memory immediately after load
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectURL); // Also release on failure
      reject(new Error(`LuminaJS [loader]: Failed to load image from File — "${file.name}".`));
    };

    img.src = objectURL;
  });
}

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
 * const img = await loadImage('https://example.com/photo.jpg');
 *
 * @example
 * // Load from File input
 * const [file] = event.target.files;
 * const img = await loadImage(file);
 */
export async function loadImage(source) {
  if (typeof source === 'string') {
    return loadFromURL(source);
  }

  if (source instanceof File) {
    return loadFromFile(source);
  }

  return Promise.reject(
    new TypeError(
      `LuminaJS [loader]: Invalid source type "${typeof source}". ` +
        `Expected a URL string or a File object.`
    )
  );
}
