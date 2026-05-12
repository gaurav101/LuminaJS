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

  // Button customization and callbacks
  applyButtonClassName?: string;
  applyButtonStyle?: React.CSSProperties;
  resetButtonClassName?: string;
  resetButtonStyle?: React.CSSProperties;

  // Button position options
  buttonPosition?:
    | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

  // Optional callbacks invoked when user clicks Apply or Reset.
  // If the callback returns false (or a Promise that resolves to false),
  // the component will abort the default behavior.
  onApply?: (crop: CropArea) => boolean | void | Promise<boolean | void>;
  onReset?: () => boolean | void | Promise<boolean | void>;
}

/**
 * ImageCropper - A complete image cropping interface with explicit apply.
 *
 * Combines the `ImageAreaSelector` for interactive crop area selection with
 * `LuminaCanvas` for rendering the applied crop in the same component after the user clicks Apply.
 *
 * Props summary (not exhaustive):
 * - src: Image source (string | File | HTMLImageElement | HTMLCanvasElement | ImageData | null)
 * - onCropComplete: Callback when crop is finalized (receives Blob or DataURL)
 * - onError: Callback for processing errors
 * - aspectRatio: Optional aspect ratio to enforce (width / height)
 * - outputFormat: 'blob' | 'dataUrl'
 * - allowReset: show reset button
 * - applyButtonClassName / applyButtonStyle: Customize the Apply button class/style
 * - resetButtonClassName / resetButtonStyle: Customize the Reset button class/style
 * - onApply / onReset: Optional callbacks fired when Apply or Reset are clicked. If the callback returns false (or a Promise that resolves to false), the default behavior is aborted.
 *
 * @example
 * ```tsx
 * <ImageCropper
 *   src="photo.jpg"
 *   aspectRatio={16 / 9}
 *   outputFormat="blob"
 *   applyButtonClassName="primary-btn"
 *   resetButtonStyle={{ backgroundColor: '#fff' }}
 *   onApply={(crop) =>  validate crop or return false to prevent default }
 *   onReset={() => /* do custom reset; return false to prevent default }
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
  // button customization
  applyButtonClassName,
  applyButtonStyle,
  resetButtonClassName,
  resetButtonStyle,
  // button position (default top-left)
  buttonPosition = 'top-left',
  // optional callbacks
  onApply,
  onReset,
}) => {
  const [isCropping, setIsCropping] = useState(false);
  const [appliedPreview, setAppliedPreview] = useState<{
    source: ImageCropperProps['src'];
    src: string;
  } | null>(null);
  const [selectedCropState, setSelectedCropState] = useState<{
    source: ImageCropperProps['src'];
    crop: CropArea;
  } | null>(null);
  const [selectorVersion, setSelectorVersion] = useState(0);
  const appliedPreviewSrc =
    appliedPreview?.source === src ? appliedPreview.src : null;
  const selectedCrop =
    selectedCropState?.source === src ? selectedCropState.crop : null;
  const hasSelectedCrop =
    !!selectedCrop && selectedCrop.width > 0 && selectedCrop.height > 0;

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

  const handleCropChange = useCallback(
    (crop: CropArea) => {
      setSelectedCropState({ source: src, crop });
      setAppliedPreview(null);
    },
    [src],
  );

  const handleCropSelectionComplete = useCallback(
    (crop: CropArea) => {
      setSelectedCropState({ source: src, crop });
    },
    [src],
  );

  const handleApplyCrop = useCallback(async () => {
    if (
      !selectedCrop ||
      selectedCrop.width === 0 ||
      selectedCrop.height === 0
    ) {
      onError?.(new Error('Please select a crop area'));
      return;
    }

    if (!src) {
      onError?.(new Error('No source image provided'));
      return;
    }

    // If consumer provided an onApply callback, call it first. If it returns false, abort default behavior.
    if (onApply) {
      try {
        const proceed = await onApply(selectedCrop);
        if (proceed === false) return;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
        return;
      }
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
  }, [onError, onCropComplete, outputFormat, selectedCrop, src, onApply]);

  const handleReset = useCallback(async () => {
    if (onReset) {
      try {
        const proceed = await onReset();
        if (proceed === false) return;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
        return;
      }
    }

    setAppliedPreview(null);
    setSelectedCropState(null);
    setSelectorVersion((version) => version + 1);
  }, [onReset, onError]);

  const handleProcessError = (error: Error) => {
    onError?.(error);
  };

  // Compute button container style based on buttonPosition prop
  const buttonContainerStyle = useMemo(() => {
    const base: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      gap: '8px',
      zIndex: 1001,
      alignItems: 'center',
    };
    switch (buttonPosition) {
      case 'top-left':
        return { ...base, top: '12px', left: '12px' };
      case 'top-right':
        return { ...base, top: '12px', right: '12px' };
      case 'top-center':
        return {
          ...base,
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'bottom-left':
        return { ...base, bottom: '12px', left: '12px' };
      case 'bottom-center':
        return {
          ...base,
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'bottom-right':
        return { ...base, bottom: '12px', right: '12px' };
      default:
        return { ...base, top: '12px', left: '12px' };
    }
  }, [buttonPosition]);

  return (
    <div
      className={className}
      style={{
        padding: '16px',
        borderRadius: '8px',
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
              key={`${imageSrc}-${selectorVersion}`}
              src={imageSrc}
              aspect={aspectRatio}
              onCropChange={handleCropChange}
              onCropComplete={handleCropSelectionComplete}
              lineColor="#0066cc"
              overlayOpacity={0.6}
              overlayControls={({
                left,
                top,
                width,
                height,
                scaleX,
                scaleY,
              }) => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    disabled={isCropping}
                    className={applyButtonClassName}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#0066cc',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isCropping ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                      ...applyButtonStyle,
                    }}
                  >
                    {isCropping ? 'Processing...' : 'Apply Crop'}
                  </button>

                  {allowReset && (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isCropping}
                      className={resetButtonClassName}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#fff',
                        color: '#333',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: isCropping ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                        ...resetButtonStyle,
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
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
          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={handleReset}
              className={resetButtonClassName}
              style={{
                padding: '8px 12px',
                backgroundColor: '#fff',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                ...resetButtonStyle,
              }}
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
