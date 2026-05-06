import { useState, useEffect } from 'react';
import { lumina, Lumina } from '../index.js';

export type LuminaSource = string | File | HTMLImageElement | HTMLCanvasElement | ImageData;
export type LuminaOutputType = 'imageData' | 'dataUrl' | 'blob';

export interface UseLuminaOptions {
  source: LuminaSource | null;
  operations?: (chain: Lumina) => Lumina;
  deps?: any[];
  outputType?: LuminaOutputType;
}

export interface UseLuminaResult {
  result: any;
  loading: boolean;
  error: Error | null;
}

/**
 * React hook to process images using LuminaJS.
 */
export function useLumina({
  source,
  operations,
  deps = [],
  outputType = 'imageData'
}: UseLuminaOptions): UseLuminaResult {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!source) {
      setResult(null);
      return;
    }

    let isMounted = true;
    const process = async () => {
      setLoading(true);
      setError(null);
      try {
        let chain = lumina(source);
        
        if (typeof operations === 'function') {
          chain = operations(chain);
        }

        let data;
        switch (outputType) {
          case 'dataUrl':
            data = await chain.toDataURL();
            break;
          case 'blob':
            data = await chain.toBlob();
            break;
          default:
            data = await chain.render();
        }

        if (isMounted) {
          setResult(data);
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
  }, [source, outputType, ...deps]);

  return { result, loading, error };
}
