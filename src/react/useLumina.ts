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
}

/**
 * React hook to process images using LuminaJS.
 *
 * @example
 * const { result, loading } = useLumina({
 *   source: 'photo.jpg',
 *   operations: (l) => l.grayscale().brightness(20),
 *   outputType: 'dataUrl',
 *   deps: []
 * });
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

  return { result, loading, error };
}
