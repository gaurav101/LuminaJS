import { useState, useEffect } from 'react';
import { lumina, type Lumina } from '../index.js';

export type LuminaSource =
  | string
  | File
  | HTMLImageElement
  | HTMLCanvasElement
  | ImageData;
export type LuminaOutputType = 'imageData' | 'dataUrl' | 'blob';

import { type ImageEditingOptions, applyEditingOptions } from './types.js';

export interface UseLuminaOptions extends ImageEditingOptions {
  source: LuminaSource | null;
  operations?: (chain: Lumina) => Lumina;
  deps?: unknown[];
  outputType?: LuminaOutputType;
}

export interface UseLuminaResult<T = unknown> {
  result: T | null;
  loading: boolean;
  error: Error | null;
  getImage: (overrideOutputType?: LuminaOutputType) => Promise<T | null>;
}

/**
 * `useLumina` - A powerful and declarative React hook for image processing.
 *
 * This hook manages the entire lifecycle of an image, applying advanced filters
 * and transformations seamlessly while providing loading and error states.
 * You can process images via explicit props, or utilize the `operations` callback
 * for more complex chainable API logic.
 *
 * @template T - The expected output type (default: unknown)
 *
 * @param {UseLuminaOptions} options - Configuration options for the hook.
 * @param {LuminaSource | null} options.source - The image source (URL, File, HTMLImageElement, HTMLCanvasElement, or ImageData).
 * @param {Function} [options.operations] - Optional callback to use Lumina's chainable API manually.
 * @param {unknown[]} [options.deps=[]] - Array of dependencies that should trigger a re-render.
 * @param {LuminaOutputType} [options.outputType='imageData'] - The format of the returned result ('imageData', 'dataUrl', 'blob').
 * @param {boolean} [options.grayscale] - Apply a grayscale filter.
 * @param {number} [options.brightness] - Adjust image brightness.
 * @param {number} [options.blur] - Apply a box blur effect.
 * @param {Object} [options.resize] - Resize the image { width, height }.
 * // ... and many other filters (sepia, contrast, sharpen, etc.)
 *
 * @returns {UseLuminaResult<T>} The processing state containing `result`, `loading`, `error`, and an imperative `getImage` function.
 *
 * @example
 * ```tsx
 * const { result, loading, getImage } = useLumina({
 *   source: 'photo.jpg',
 *   grayscale: true,
 *   brightness: 20,
 *   outputType: 'dataUrl',
 *   deps: [] // dependencies that trigger a re-run
 * });
 *
 * // Get the image on demand (e.g., in an onClick handler)
 * const uploadImage = async () => {
 *   const blob = await getImage('blob');
 *   await api.upload(blob);
 * };
 * ```
 */
export function useLumina<T = unknown>({
  source,
  operations,
  deps = [],
  outputType = 'imageData',
  ...editingOptions
}: UseLuminaOptions): UseLuminaResult<T> {
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const process = async () => {
      if (!source) {
        setResult(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let chain = lumina(source);

        chain = applyEditingOptions(chain, editingOptions);

        if (typeof operations === 'function') {
          chain = operations(chain);
        }

        let data: T;
        switch (outputType) {
          case 'dataUrl':
            data = (await chain.toDataURL()) as unknown as T;
            break;
          case 'blob':
            data = (await chain.toBlob()) as unknown as T;
            break;
          default:
            data = (await chain.render()) as unknown as T;
        }

        if (isMounted) {
          setResult(data as T);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    process();

    return () => {
      isMounted = false;
    };
    // We include operations and outputType, and spread deps.
    // We disable the rule for the spread as it's intended for user-provided dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, outputType, operations, JSON.stringify(editingOptions), ...deps]);

  const getImage = async (
    overrideOutputType?: LuminaOutputType,
  ): Promise<T | null> => {
    if (!source) return null;
    try {
      let chain = lumina(source);
      chain = applyEditingOptions(chain, editingOptions);
      if (typeof operations === 'function') {
        chain = operations(chain);
      }

      let data: T;
      const finalOutputType = overrideOutputType || outputType;
      switch (finalOutputType) {
        case 'dataUrl':
          data = (await chain.toDataURL()) as unknown as T;
          break;
        case 'blob':
          data = (await chain.toBlob()) as unknown as T;
          break;
        default:
          data = (await chain.render()) as unknown as T;
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { result, loading, error, getImage };
}
