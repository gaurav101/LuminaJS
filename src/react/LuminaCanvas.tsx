import { useRef, useEffect, useState, type CanvasHTMLAttributes } from 'react';
import { lumina, type Lumina } from '../index.js';
import { type ImageEditingOptions, applyEditingOptions } from './types.js';

export interface LuminaCanvasProps
  extends
    Omit<CanvasHTMLAttributes<HTMLCanvasElement>, 'onError'>,
    ImageEditingOptions {
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
  getImage?: (data: string | Blob | ImageData | HTMLCanvasElement) => void;
  outputType?: 'imageData' | 'dataUrl' | 'blob' | 'canvas';
}

/**
 * `LuminaCanvas` - A declarative React component to render LuminaJS processed images on a canvas.
 *
 * This component handles the rendering of image transformations directly onto an HTML `<canvas>`.
 * It provides a powerful, prop-driven interface to apply image edits like crop, resize, and various filters.
 * You can also access the resulting generated image using the `getImage` callback prop.
 *
 * @param {LuminaCanvasProps} props - The props for the component, extending standard CanvasHTMLAttributes.
 * @param {LuminaSource | null} props.source - The image source (URL, File, HTMLImageElement, HTMLCanvasElement, or ImageData).
 * @param {Function} [props.filter] - An optional callback to use the Lumina chainable API manually. Runs after explicit props.
 * @param {Function} [props.onProcessError] - Callback triggered if an error occurs during processing.
 * @param {Function} [props.onLoad] - Callback triggered when the image is successfully processed and rendered to the canvas.
 * @param {Function} [props.getImage] - Callback triggered after rendering to provide the resulting image data.
 * @param {'imageData' | 'dataUrl' | 'blob' | 'canvas'} [props.outputType='canvas'] - The format of the data sent to `getImage`.
 * @param {boolean} [props.grayscale] - Applies a grayscale filter.
 * @param {number} [props.brightness] - Adjusts brightness.
 * @param {Object} [props.resize] - Resizes the image e.g. { width: 800, height: 600 }.
 * @param {Object} [props.crop] - Crops the image e.g. { x: 0, y: 0, width: 100, height: 100 }.
 * // ... plus many more filters.
 *
 * @example
 * ```tsx
 * function App() {
 *   const handleImage = (dataUrl) => console.log('Generated Image:', dataUrl);
 *
 *   return (
 *     <LuminaCanvas
 *       source="photo.jpg"
 *       brightness={20}
 *       sepia={true}
 *       resize={{ width: 500, height: 500 }}
 *       outputType="dataUrl"
 *       getImage={handleImage}
 *       width={500} // standard canvas attribute
 *       height={500} // standard canvas attribute
 *     />
 *   );
 * }
 * ```
 */
export function LuminaCanvas({
  source,
  filter,
  onProcessError,
  onLoad,
  getImage,
  outputType = 'canvas',
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

        if (isMounted && getImage && canvasRef.current) {
          if (outputType === 'dataUrl') {
            getImage(canvasRef.current.toDataURL());
          } else if (outputType === 'blob') {
            canvasRef.current.toBlob((blob) => {
              if (blob) getImage(blob);
            });
          } else if (outputType === 'imageData') {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              getImage(
                ctx.getImageData(
                  0,
                  0,
                  canvasRef.current.width,
                  canvasRef.current.height,
                ),
              );
            }
          } else {
            getImage(canvasRef.current);
          }
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
  }, [
    source,
    filter,
    onProcessError,
    onLoad,
    getImage,
    outputType,
    JSON.stringify(editingOptions),
  ]);

  if (error) {
    return <div className="lumina-error">{error.message}</div>;
  }

  return <canvas ref={canvasRef} {...props} />;
}
