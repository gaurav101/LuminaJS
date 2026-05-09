import { useRef, useEffect, useState, type CanvasHTMLAttributes } from 'react';
import { lumina, type Lumina } from '../index.js';
import { type ImageEditingOptions, applyEditingOptions } from './types.js';

export interface LuminaCanvasProps extends Omit<
  CanvasHTMLAttributes<HTMLCanvasElement>,
  'onError'
>, ImageEditingOptions {
  source:
    | string
    | File
    | HTMLImageElement
    | HTMLCanvasElement
    | ImageData
    | null;
  filter?: (chain: Lumina) => Lumina;
  onProcessError?: (error: Error) => void;
  onLoad?: () => void;
}

/**
 * A declarative React component to render LuminaJS processed images on a canvas.
 *
 * @example
 * <LuminaCanvas
 *   source="photo.jpg"
 *   filter={(l) => l.sepia()}
 *   width={500}
 * />
 */
export function LuminaCanvas({
  source,
  filter,
  onProcessError,
  onLoad,
  grayscale,
  brightness,
  contrast,
  sepia,
  ascii,
  blur,
  gaussianBlur,
  watermark,
  backgroundBlur,
  sharpen,
  emboss,
  edgeDetection,
  resize,
  crop,
  ...props
}: LuminaCanvasProps) {
  const editingOptions = {
    grayscale,
    brightness,
    contrast,
    sepia,
    ascii,
    blur,
    gaussianBlur,
    watermark,
    backgroundBlur,
    sharpen,
    emboss,
    edgeDetection,
    resize,
    crop,
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!source || !canvasRef.current) return;

    let isMounted = true;

    const applyFilter = async () => {
      try {
        let chain = lumina(source);
        chain = applyEditingOptions(chain, editingOptions);

        if (typeof filter === 'function') {
          chain = filter(chain);
        }

        if (canvasRef.current) {
          await chain.toCanvas(canvasRef.current);
        }

        if (isMounted && onLoad) {
          onLoad();
        }
      } catch (err) {
        const errorObject = err instanceof Error ? err : new Error(String(err));
        if (isMounted) {
          setError(errorObject);
          if (onProcessError) onProcessError(errorObject);
        }
      }
    };

    applyFilter();

    return () => {
      isMounted = false;
    };
  }, [source, filter, onProcessError, onLoad, JSON.stringify(editingOptions)]);

  if (error) {
    return <div className="lumina-error">{error.message}</div>;
  }

  return <canvas ref={canvasRef} {...props} />;
}
