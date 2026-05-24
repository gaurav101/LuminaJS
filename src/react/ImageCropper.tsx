import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { lumina } from '../index.js';
import { LuminaCanvas } from './LuminaCanvas.js';
import { ImageAreaSelector, type CropArea } from './ImageAreaSelector.js';

const ROOT_STYLE: React.CSSProperties = {
  padding: '16px',
  borderRadius: '8px',
};

const CONTAINER_STYLE: React.CSSProperties = {
  position: 'relative',
  borderRadius: '6px',
  overflow: 'hidden',
  border: '1px solid #ddd',
};

const PREVIEW_CANVAS_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
};

const BUTTON_CONTAINER_BASE_STYLE: React.CSSProperties = {
  position: 'absolute',
  display: 'flex',
  gap: '8px',
  zIndex: 1001,
  alignItems: 'center',
};

const APPLY_BUTTON_BASE_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  backgroundColor: '#0066cc',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
};

const RESET_BUTTON_BASE_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  backgroundColor: '#fff',
  color: '#333',
  border: '1px solid #ddd',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
};

const PROCESSING_OVERLAY_BASE_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.75)',
  color: '#333',
  fontSize: '14px',
  fontWeight: 500,
};

const ERROR_CONTAINER_BASE_STYLE: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #fca5a5',
  background: '#fff1f2',
};

const ERROR_TEXT_BASE_STYLE: React.CSSProperties = {
  color: '#b91c1c',
  margin: 0,
  fontSize: '13px',
  lineHeight: 1.4,
};

export interface ImageCropperProps {
  src: string | File | HTMLImageElement | HTMLCanvasElement | ImageData | null;
  onCropComplete?: (croppedImage: Blob | string) => void;
  onError?: (error: Error) => void;
  aspectRatio?: number;
  outputFormat?: 'blob' | 'dataUrl';
  maxWidth?: number;
  maxHeight?: number;
  /**
   * Shows the applied crop result inside the cropper after Apply.
   * Set false when the parent renders its own preview or upload state.
   */
  showPreview?: boolean;
  allowReset?: boolean;
  allowResize?: boolean;
  className?: string;
  style?: React.CSSProperties;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  previewCanvasClassName?: string;
  previewCanvasStyle?: React.CSSProperties;
  processingOverlayClassName?: string;
  processingOverlayStyle?: React.CSSProperties;
  errorClassName?: string;
  errorStyle?: React.CSSProperties;
  errorTextClassName?: string;
  errorTextStyle?: React.CSSProperties;

  // Button customization and callbacks
  applyButtonClassName?: string;
  applyButtonStyle?: React.CSSProperties;
  applyButtonLabel?: string;
  applyButtonAriaLabel?: string;
  resetButtonClassName?: string;
  resetButtonStyle?: React.CSSProperties;
  resetButtonLabel?: string;
  resetButtonAriaLabel?: string;
  buttonContainerClassName?: string;
  buttonContainerStyle?: React.CSSProperties;
  processingLabel?: string;

  // Overlay and handle theming hooks
  selectorLineWidth?: number;
  selectorLineColor?: string;
  selectorOverlayOpacity?: number;
  selectorClassName?: string;
  selectorStyle?: React.CSSProperties;
  selectorImageClassName?: string;
  selectorImageStyle?: React.CSSProperties;
  selectorSelectionClassName?: string;
  selectorSelectionStyle?: React.CSSProperties;
  selectorHandleClassName?: string;
  selectorHandleStyle?: React.CSSProperties;
  selectorControlsContainerClassName?: string;
  selectorControlsContainerStyle?: React.CSSProperties;
  selectorAriaLabel?: string;
  selectorAriaDescription?: string;
  keyboardStep?: number;
  keyboardStepLarge?: number;

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
 * - showPreview: show the applied crop result in place after Apply. Set false for parent-managed previews.
 * - allowReset: show reset button
 * - allowResize: show resize handles on the selected crop area
 * - applyButtonClassName / applyButtonStyle: Customize the Apply button class/style
 * - resetButtonClassName / resetButtonStyle: Customize the Reset button class/style
 * - selector* and *ClassName/*Style props: Theme overlay, handles, controls, and error states
 * - onApply / onReset: Optional callbacks fired when Apply or Reset are clicked. If the callback returns false (or a Promise that resolves to false), the default behavior is aborted.
 *
 * Accessibility notes:
 * - Keyboard support is available for an existing crop region (arrow move, Shift+arrow larger move, Alt+arrow resize, Enter confirm, Escape clear).
 * - Pointer interactions (dragging/handles) remain primary for geometric selection.
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
  showPreview = true,
  allowReset = true,
  allowResize = true,
  className,
  style,
  containerClassName,
  containerStyle,
  previewCanvasClassName,
  previewCanvasStyle,
  processingOverlayClassName,
  processingOverlayStyle,
  errorClassName,
  errorStyle,
  errorTextClassName,
  errorTextStyle,
  // button customization
  applyButtonClassName,
  applyButtonStyle,
  applyButtonLabel = 'Apply Crop',
  applyButtonAriaLabel = 'Apply selected crop',
  resetButtonClassName,
  resetButtonStyle,
  resetButtonLabel = 'Reset',
  resetButtonAriaLabel = 'Reset crop selection',
  buttonContainerClassName,
  buttonContainerStyle,
  processingLabel = 'Processing...',
  selectorLineWidth = 2,
  selectorLineColor = '#0066cc',
  selectorOverlayOpacity = 0.6,
  selectorClassName,
  selectorStyle,
  selectorImageClassName,
  selectorImageStyle,
  selectorSelectionClassName,
  selectorSelectionStyle,
  selectorHandleClassName,
  selectorHandleStyle,
  selectorControlsContainerClassName,
  selectorControlsContainerStyle,
  selectorAriaLabel = 'Image crop selection area',
  selectorAriaDescription = 'Use arrow keys to move the crop. Hold Shift for larger steps. Hold Alt with arrows to resize. Press Enter to confirm the current selection. Press Escape to clear the selection.',
  keyboardStep = 1,
  keyboardStepLarge = 10,
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
  const [localError, setLocalError] = useState<string | null>(null);
  const appliedPreviewSrc =
    appliedPreview?.source === src ? appliedPreview.src : null;
  const selectedCrop =
    selectedCropState?.source === src ? selectedCropState.crop : null;
  const isFileSource = typeof File !== 'undefined' && src instanceof File;
  const canCreateObjectUrl =
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function' &&
    typeof URL.revokeObjectURL === 'function';

  // Convert File to URL for ImageAreaSelector
  const imageSrc = useMemo(() => {
    if (typeof src === 'string') return src;
    if (isFileSource && canCreateObjectUrl) return URL.createObjectURL(src);
    return undefined;
  }, [canCreateObjectUrl, isFileSource, src]);

  useEffect(() => {
    return () => {
      if (imageSrc && isFileSource && canCreateObjectUrl) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [canCreateObjectUrl, imageSrc, isFileSource]);

  useEffect(() => {
    return () => {
      if (canCreateObjectUrl && appliedPreview?.src.startsWith('blob:')) {
        URL.revokeObjectURL(appliedPreview.src);
      }
    };
  }, [appliedPreview, canCreateObjectUrl]);

  const handleCropChange = useCallback(
    (crop: CropArea) => {
      setSelectedCropState({ source: src, crop });
      setAppliedPreview(null);
      setLocalError(null);
    },
    [src],
  );

  const handleCropSelectionComplete = useCallback(
    (crop: CropArea) => {
      setSelectedCropState({ source: src, crop });
      setLocalError(null);
    },
    [src],
  );

  const handleApplyCrop = useCallback(async () => {
    setLocalError(null);

    if (
      !selectedCrop ||
      selectedCrop.width === 0 ||
      selectedCrop.height === 0
    ) {
      const error = new Error('Please select a crop area');
      setLocalError(error.message);
      onError?.(error);
      return;
    }

    if (!src) {
      const error = new Error('No source image provided');
      setLocalError(error.message);
      onError?.(error);
      return;
    }

    // If consumer provided an onApply callback, call it first. If it returns false, abort default behavior.
    if (onApply) {
      try {
        const proceed = await onApply(selectedCrop);
        if (proceed === false) return;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setLocalError(error.message);
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
          if (showPreview) {
            if (!canCreateObjectUrl) {
              throw new Error('Blob preview requires URL.createObjectURL.');
            }

            setAppliedPreview({ source: src, src: URL.createObjectURL(blob) });
          }
          onCropComplete?.(blob);
        } else {
          throw new Error('Failed to generate cropped blob.');
        }
      } else {
        const dataUrl = await chain.toDataURL();
        if (showPreview) {
          setAppliedPreview({ source: src, src: dataUrl });
        }
        onCropComplete?.(dataUrl);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setLocalError(error.message);
      onError?.(error);
    } finally {
      setIsCropping(false);
    }
  }, [
    canCreateObjectUrl,
    onApply,
    onCropComplete,
    onError,
    outputFormat,
    selectedCrop,
    showPreview,
    src,
  ]);

  const handleReset = useCallback(async () => {
    if (onReset) {
      try {
        const proceed = await onReset();
        if (proceed === false) return;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setLocalError(error.message);
        onError?.(error);
        return;
      }
    }

    setAppliedPreview(null);
    setSelectedCropState(null);
    setLocalError(null);
    setSelectorVersion((version) => version + 1);
  }, [onReset, onError]);

  const handleProcessError = (error: Error) => {
    setLocalError(error.message);
    onError?.(error);
  };

  // Compute button container style based on buttonPosition prop
  const positionedButtonContainerStyle = useMemo(() => {
    const base: React.CSSProperties = { ...BUTTON_CONTAINER_BASE_STYLE };
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
        ...ROOT_STYLE,
        ...style,
      }}
    >
      <div
        className={containerClassName}
        style={{
          ...CONTAINER_STYLE,
          maxWidth: maxWidth,
          maxHeight: maxHeight,
          ...containerStyle,
        }}
      >
        {appliedPreviewSrc ? (
          <LuminaCanvas
            source={appliedPreviewSrc}
            className={previewCanvasClassName}
            style={{ ...PREVIEW_CANVAS_STYLE, ...previewCanvasStyle }}
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
              lineWidth={selectorLineWidth}
              lineColor={selectorLineColor}
              overlayOpacity={selectorOverlayOpacity}
              allowResize={allowResize}
              className={selectorClassName}
              style={selectorStyle}
              imageClassName={selectorImageClassName}
              imageStyle={selectorImageStyle}
              selectionClassName={selectorSelectionClassName}
              selectionStyle={selectorSelectionStyle}
              handleClassName={selectorHandleClassName}
              handleStyle={selectorHandleStyle}
              overlayControlsContainerClassName={
                selectorControlsContainerClassName
              }
              overlayControlsContainerStyle={selectorControlsContainerStyle}
              ariaLabel={selectorAriaLabel}
              ariaDescription={selectorAriaDescription}
              keyboardStep={keyboardStep}
              keyboardStepLarge={keyboardStepLarge}
              overlayControls={() => (
                <div
                  className={buttonContainerClassName}
                  style={{
                    ...positionedButtonContainerStyle,
                    ...buttonContainerStyle,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    disabled={isCropping}
                    className={applyButtonClassName}
                    aria-label={applyButtonAriaLabel}
                    style={{
                      ...APPLY_BUTTON_BASE_STYLE,
                      cursor: isCropping ? 'not-allowed' : 'pointer',
                      ...applyButtonStyle,
                    }}
                  >
                    {isCropping ? processingLabel : applyButtonLabel}
                  </button>

                  {allowReset && (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isCropping}
                      className={resetButtonClassName}
                      aria-label={resetButtonAriaLabel}
                      style={{
                        ...RESET_BUTTON_BASE_STYLE,
                        cursor: isCropping ? 'not-allowed' : 'pointer',
                        ...resetButtonStyle,
                      }}
                    >
                      {resetButtonLabel}
                    </button>
                  )}
                </div>
              )}
            />
          )
        )}

        {isCropping && (
          <div
            className={processingOverlayClassName}
            role="status"
            aria-live="polite"
            style={{
              ...PROCESSING_OVERLAY_BASE_STYLE,
              ...processingOverlayStyle,
            }}
          >
            {processingLabel}
          </div>
        )}

        {allowReset && appliedPreviewSrc && !isCropping && (
          <div
            className={buttonContainerClassName}
            style={{
              ...positionedButtonContainerStyle,
              ...buttonContainerStyle,
            }}
          >
            <button
              type="button"
              onClick={handleReset}
              className={resetButtonClassName}
              aria-label={resetButtonAriaLabel}
              style={{
                ...RESET_BUTTON_BASE_STYLE,
                ...resetButtonStyle,
              }}
            >
              {resetButtonLabel}
            </button>
          </div>
        )}
      </div>

      {localError ? (
        <div
          className={errorClassName}
          style={{ ...ERROR_CONTAINER_BASE_STYLE, ...errorStyle }}
        >
          <p
            className={errorTextClassName}
            style={{ ...ERROR_TEXT_BASE_STYLE, ...errorTextStyle }}
            role="alert"
          >
            {localError}
          </p>
        </div>
      ) : null}
    </div>
  );
};
