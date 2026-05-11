import React, { useState, useCallback } from 'react';
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
 * ImageCropper - A complete image cropping interface with preview.
 *
 * Combines the `ImageAreaSelector` for interactive crop area selection with
 * `LuminaCanvas` for processing. Provides a full UI with controls.
 *
 * @param {ImageCropperProps} props
 * @param {string | File | HTMLImageElement | HTMLCanvasElement | ImageData | null} props.src - Image source
 * @param {Function} [props.onCropComplete] - Callback when crop is finalized (receives Blob or DataURL)
 * @param {Function} [props.onError] - Callback for processing errors
 * @param {number} [props.aspectRatio] - Optional aspect ratio to enforce (width / height)
 * @param {'blob' | 'dataUrl'} [props.outputFormat='blob'] - Output format for cropped image
 * @param {number} [props.maxWidth] - Max width of the container
 * @param {number} [props.maxHeight] - Max height of the container
 * @param {boolean} [props.showPreview=true] - Show the cropped preview
 * @param {boolean} [props.allowReset=true] - Show reset button
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
  showPreview = true,
  allowReset = true,
  className,
  style,
}) => {
  const [crop, setCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isCropping, setIsCropping] = useState(false);

  // Convert File to URL for ImageAreaSelector
  const imageSrc =
    typeof src === 'string'
      ? src
      : src instanceof File
        ? URL.createObjectURL(src)
        : undefined;

  const handleCropChange = useCallback((newCrop: CropArea) => {
    setCrop(newCrop);
  }, []);

  const handleApplyCrop = useCallback(async () => {
    if (crop.width === 0 || crop.height === 0) {
      onError?.(new Error('Please select a crop area'));
      return;
    }

    if (!src) {
      onError?.(new Error('No source image provided'));
      return;
    }

    setIsCropping(true);

    try {
      const chain = lumina(src).crop(crop.x, crop.y, crop.width, crop.height);

      if (outputFormat === 'blob') {
        const blob = await chain.toBlob();
        if (blob) {
          onCropComplete?.(blob);
        } else {
          throw new Error('Failed to generate cropped blob.');
        }
      } else {
        const dataUrl = await chain.toDataURL();
        onCropComplete?.(dataUrl);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
    } finally {
      setIsCropping(false);
    }
  }, [crop, onError, onCropComplete, outputFormat, src]);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
  }, []);

  const handleProcessError = (error: Error) => {
    onError?.(error);
  };

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
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Selection Area */}
        <div
          style={{
            flex: 1,
            minWidth: '300px',
            maxWidth: maxWidth,
            maxHeight: maxHeight,
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid #ddd',
            backgroundColor: '#fff',
          }}
        >
          {imageSrc && (
            <ImageAreaSelector
              src={imageSrc}
              aspect={aspectRatio}
              onCropChange={handleCropChange}
              lineColor="#0066cc"
              overlayOpacity={0.6}
            />
          )}
        </div>

        {/* Right: Preview & Controls */}
        <div
          style={{
            flex: 1,
            minWidth: '250px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Preview */}
          {showPreview && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fff',
                borderRadius: '6px',
                border: '1px solid #ddd',
              }}
            >
              <h4
                style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}
              >
                Preview
              </h4>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: aspectRatio || 'auto',
                  minHeight: '150px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {src && crop.width > 0 && crop.height > 0 && (
                  <LuminaCanvas
                    source={src}
                    crop={crop}
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                    }}
                    onProcessError={handleProcessError}
                  />
                )}
                {crop.width === 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#999',
                      fontSize: '12px',
                    }}
                  >
                    Select a crop area
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Crop Info */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fff',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '13px',
              color: '#666',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <strong>Crop Area:</strong>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              <div>X: {Math.round(crop.x)}px</div>
              <div>Y: {Math.round(crop.y)}px</div>
              <div>Width: {Math.round(crop.width)}px</div>
              <div>Height: {Math.round(crop.height)}px</div>
            </div>
          </div>

          {/* Controls */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexDirection: 'column',
            }}
          >
            <button
              onClick={handleApplyCrop}
              disabled={isCropping || crop.width === 0 || crop.height === 0}
              style={{
                padding: '10px 16px',
                backgroundColor: '#0066cc',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor:
                  crop.width === 0 || crop.height === 0 || isCropping
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  crop.width === 0 || crop.height === 0 || isCropping ? 0.5 : 1,
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
            >
              {isCropping ? 'Processing...' : 'Apply Crop'}
            </button>

            {allowReset && (
              <button
                onClick={handleReset}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
