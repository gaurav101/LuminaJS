import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { lumina } from '../index.js';
import { LuminaCanvas } from './LuminaCanvas';
import { ImageAreaSelector, type CropArea } from './ImageAreaSelector';

export interface ImageCropperProps {
  src: string | File | HTMLImageElement | HTMLCanvasElement | ImageData | null;
  onCropComplete?: (croppedImage: Blob | string) => void;
  onError?: (error: Error) => void;
  aspectRatio?: number;
  outputFormat?: 'blob' | 'dataUrl';
  maxWidth?: number;
  maxHeight?: number;
  showPreview?: boolean;
  allowReset?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ImageCropper - A complete image cropping interface with automatic processing.
 *
 * Combines the `ImageAreaSelector` for interactive crop area selection with
 * `LuminaCanvas` for rendering the applied crop in the same component.
 *
 * @param {ImageCropperProps} props
 * @param {string | File | HTMLImageElement | HTMLCanvasElement | ImageData | null} props.src - Image source
 * @param {Function} [props.onCropComplete] - Callback when crop is finalized (receives Blob or DataURL)
 * @param {Function} [props.onError] - Callback for processing errors
 * @param {number} [props.aspectRatio] - Optional aspect ratio to enforce (width / height)
 * @param {'blob' | 'dataUrl'} [props.outputFormat='blob'] - Output format for cropped image
 * @param {number} [props.maxWidth] - Max width of the container
 * @param {number} [props.maxHeight] - Max height of the container
 * @param {boolean} [props.allowReset=true] - Show reset button after crop is applied.
 * @param {string} [props.className] - CSS class name
 * @param {React.CSSProperties} [props.style] - Inline styles
 *
 * @example
 * ```tsx
 * const handleCropComplete = (croppedBlob: Blob) => {
 *   const url = URL.createObjectURL(croppedBlob);
 *   // Use the cropped image...
 * };
 *
 * <ImageCropper
 *   src="photo.jpg"
 *   aspectRatio={16 / 9}
 *   outputFormat="blob"
 *   onCropComplete={handleCropComplete}
 * />
 * ```
 */
export const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  onCropComplete,
  onError,
  aspectRatio,
  outputFormat = 'blob',
  maxWidth = 600,
  maxHeight = 400,
  allowReset = true,
  className,
  style,
}) => {
  const [isCropping, setIsCropping] = useState(false);
  const [appliedPreview, setAppliedPreview] = useState<{
    source: ImageCropperProps['src'];
    src: string;
  } | null>(null);
  const appliedPreviewSrc =
    appliedPreview?.source === src ? appliedPreview.src : null;

  // Convert File to URL for ImageAreaSelector
  const imageSrc = useMemo(() => {
    if (typeof src === 'string') return src;
    if (src instanceof File) return URL.createObjectURL(src);
    return undefined;
  }, [src]);

  useEffect(() => {
    return () => {
      if (imageSrc && src instanceof File) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc, src]);

  useEffect(() => {
    return () => {
      if (appliedPreview?.src.startsWith('blob:')) {
        URL.revokeObjectURL(appliedPreview.src);
      }
    };
  }, [appliedPreview]);

  const handleCropChange = useCallback(() => {
    setAppliedPreview(null);
  }, []);

  const handleCropComplete = useCallback(
    async (selectedCrop: CropArea) => {
      if (selectedCrop.width === 0 || selectedCrop.height === 0) {
        onError?.(new Error('Please select a crop area'));
        return;
      }

      if (!src) {
        onError?.(new Error('No source image provided'));
        return;
      }

      setIsCropping(true);

      try {
        const chain = lumina(src).crop(
          selectedCrop.x,
          selectedCrop.y,
          selectedCrop.width,
          selectedCrop.height,
        );

        if (outputFormat === 'blob') {
          const blob = await chain.toBlob();
          if (blob) {
            setAppliedPreview({ source: src, src: URL.createObjectURL(blob) });
            onCropComplete?.(blob);
          } else {
            throw new Error('Failed to generate cropped blob.');
          }
        } else {
          const dataUrl = await chain.toDataURL();
          setAppliedPreview({ source: src, src: dataUrl });
          onCropComplete?.(dataUrl);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
      } finally {
        setIsCropping(false);
      }
    },
    [onError, onCropComplete, outputFormat, src],
  );

  const handleProcessError = (error: Error) => {
    onError?.(error);
  };

  const handleReset = useCallback(() => {
    setAppliedPreview(null);
  }, []);

  return (
    <div
      className={className}
      style={{
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: maxWidth,
          maxHeight: maxHeight,
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid #ddd',
          backgroundColor: '#fff',
        }}
      >
        {appliedPreviewSrc ? (
          <LuminaCanvas
            source={appliedPreviewSrc}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
            onProcessError={handleProcessError}
          />
        ) : (
          imageSrc && (
            <ImageAreaSelector
              src={imageSrc}
              aspect={aspectRatio}
              onCropChange={handleCropChange}
              onCropComplete={handleCropComplete}
              lineColor="#0066cc"
              overlayOpacity={0.6}
            />
          )
        )}

        {isCropping && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              color: '#333',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Processing...
          </div>
        )}

        {allowReset && appliedPreviewSrc && !isCropping && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '8px 12px',
              backgroundColor: '#fff',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
