import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  forwardRef,
  type CanvasHTMLAttributes,
  type CSSProperties,
  type MutableRefObject,
  type Ref,
} from 'react';
import { lumina, type Lumina } from '../index.js';
import { type ImageEditingOptions, applyEditingOptions } from './types.js';
import { ImageAreaSelector, type CropArea } from './ImageAreaSelector.js';

export type LuminaCanvasCropButtonPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

const INTERACTIVE_CROP_CONTAINER_STYLE: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
};

const CROP_BUTTON_CONTAINER_STYLE: CSSProperties = {
  position: 'absolute',
  display: 'flex',
  gap: '8px',
  zIndex: 1001,
  alignItems: 'center',
};

const CROP_APPLY_BUTTON_STYLE: CSSProperties = {
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

const CROP_RESET_BUTTON_STYLE: CSSProperties = {
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

const CROP_STATUS_STYLE: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

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
  errorClassName?: string;
  errorStyle?: CSSProperties;
  errorRole?: 'alert' | 'status';
  interactiveCrop?: boolean;
  cropAspectRatio?: number;
  allowCropResize?: boolean;
  allowCropReset?: boolean;
  onCropChange?: (crop: CropArea) => void;
  onCropApply?: (crop: CropArea) => boolean | void | Promise<boolean | void>;
  onCropReset?: () => boolean | void | Promise<boolean | void>;
  cropApplyButtonLabel?: string;
  cropApplyButtonAriaLabel?: string;
  cropResetButtonLabel?: string;
  cropResetButtonAriaLabel?: string;
  cropButtonPosition?: LuminaCanvasCropButtonPosition;
  cropContainerClassName?: string;
  cropContainerStyle?: CSSProperties;
  cropButtonContainerClassName?: string;
  cropButtonContainerStyle?: CSSProperties;
  cropApplyButtonClassName?: string;
  cropApplyButtonStyle?: CSSProperties;
  cropResetButtonClassName?: string;
  cropResetButtonStyle?: CSSProperties;
  cropSelectorClassName?: string;
  cropSelectorStyle?: CSSProperties;
  cropSelectorImageClassName?: string;
  cropSelectorImageStyle?: CSSProperties;
  cropSelectionClassName?: string;
  cropSelectionStyle?: CSSProperties;
  cropHandleClassName?: string;
  cropHandleStyle?: CSSProperties;
  cropLineWidth?: number;
  cropLineColor?: string;
  cropOverlayOpacity?: number;
  cropAriaLabel?: string;
  cropAriaDescription?: string;
  cropKeyboardStep?: number;
  cropKeyboardStepLarge?: number;
}

function isFileSource(source: LuminaCanvasProps['source']): source is File {
  return typeof File !== 'undefined' && source instanceof File;
}

function isImageElementSource(
  source: LuminaCanvasProps['source'],
): source is HTMLImageElement {
  return (
    typeof HTMLImageElement !== 'undefined' &&
    source instanceof HTMLImageElement
  );
}

function isCanvasSource(
  source: LuminaCanvasProps['source'],
): source is HTMLCanvasElement {
  return (
    typeof HTMLCanvasElement !== 'undefined' &&
    source instanceof HTMLCanvasElement
  );
}

function isImageDataSource(
  source: LuminaCanvasProps['source'],
): source is ImageData {
  return typeof ImageData !== 'undefined' && source instanceof ImageData;
}

function getCropButtonPositionStyle(position: LuminaCanvasCropButtonPosition) {
  switch (position) {
    case 'top-right':
      return { top: '12px', right: '12px' };
    case 'top-center':
      return { top: '12px', left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-left':
      return { bottom: '12px', left: '12px' };
    case 'bottom-center':
      return { bottom: '12px', left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-right':
      return { bottom: '12px', right: '12px' };
    case 'top-left':
    default:
      return { top: '12px', left: '12px' };
  }
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
export const LuminaCanvas = forwardRef<HTMLCanvasElement, LuminaCanvasProps>(
  function LuminaCanvasComponent(
    {
      source,
      filter,
      onProcessError,
      onLoad,
      getImage,
      outputType = 'canvas',
      errorClassName,
      errorStyle,
      errorRole = 'alert',
      interactiveCrop = false,
      cropAspectRatio,
      allowCropResize = true,
      allowCropReset = true,
      onCropChange,
      onCropApply,
      onCropReset,
      cropApplyButtonLabel = 'Apply Crop',
      cropApplyButtonAriaLabel = 'Apply selected crop',
      cropResetButtonLabel = 'Reset',
      cropResetButtonAriaLabel = 'Reset crop selection',
      cropButtonPosition = 'top-left',
      cropContainerClassName,
      cropContainerStyle,
      cropButtonContainerClassName,
      cropButtonContainerStyle,
      cropApplyButtonClassName,
      cropApplyButtonStyle,
      cropResetButtonClassName,
      cropResetButtonStyle,
      cropSelectorClassName,
      cropSelectorStyle,
      cropSelectorImageClassName,
      cropSelectorImageStyle,
      cropSelectionClassName,
      cropSelectionStyle,
      cropHandleClassName,
      cropHandleStyle,
      cropLineWidth = 2,
      cropLineColor = '#0066cc',
      cropOverlayOpacity = 0.6,
      cropAriaLabel = 'Image crop selection area',
      cropAriaDescription = 'Use arrow keys to move the crop. Hold Shift for larger steps. Hold Alt with arrows to resize. Press Enter to confirm the current selection. Press Escape to clear the selection.',
      cropKeyboardStep = 1,
      cropKeyboardStepLarge = 10,
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
    }: LuminaCanvasProps,
    ref: Ref<HTMLCanvasElement>,
  ) {
    const [selectedCrop, setSelectedCrop] = useState<CropArea | null>(null);
    const [appliedInteractiveCrop, setAppliedInteractiveCrop] =
      useState<CropArea | null>(null);
    const [selectorSource, setSelectorSource] = useState<string | null>(null);
    const [selectorVersion, setSelectorVersion] = useState(0);
    const effectiveCrop = interactiveCrop
      ? (appliedInteractiveCrop ?? crop)
      : crop;
    const editingOptions = useMemo(
      () => ({
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
        crop: effectiveCrop,
      }),
      [
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
        effectiveCrop,
      ],
    );
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<Error | null>(null);
    const cropStatus = selectedCrop
      ? `Selected crop ${Math.round(selectedCrop.width)} by ${Math.round(
          selectedCrop.height,
        )} at ${Math.round(selectedCrop.x)}, ${Math.round(selectedCrop.y)}.`
      : 'No crop selected.';
    const setCanvasRef = useCallback(
      (node: HTMLCanvasElement | null) => {
        canvasRef.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as MutableRefObject<HTMLCanvasElement | null>).current = node;
        }
      },
      [ref],
    );

    useEffect(() => {
      setError(null);
    }, [source, editingOptions, filter]);

    useEffect(() => {
      setSelectedCrop(null);
      setAppliedInteractiveCrop(null);
      setSelectorVersion((version) => version + 1);
    }, [source]);

    useEffect(() => {
      if (!interactiveCrop || !source) {
        setSelectorSource(null);
        return;
      }

      let objectUrl: string | null = null;

      try {
        if (typeof source === 'string') {
          setSelectorSource(source);
        } else if (isFileSource(source)) {
          objectUrl = URL.createObjectURL(source);
          setSelectorSource(objectUrl);
        } else if (isImageElementSource(source)) {
          const imageSource = source.currentSrc || source.src;
          if (!imageSource) {
            throw new Error('Interactive crop requires an image with a src.');
          }
          setSelectorSource(imageSource);
        } else if (isCanvasSource(source)) {
          setSelectorSource(source.toDataURL());
        } else if (isImageDataSource(source)) {
          const selectorCanvas = document.createElement('canvas');
          selectorCanvas.width = source.width;
          selectorCanvas.height = source.height;
          const context = selectorCanvas.getContext('2d');
          if (!context) {
            throw new Error('Unable to prepare ImageData for cropping.');
          }
          context.putImageData(source, 0, 0);
          setSelectorSource(selectorCanvas.toDataURL());
        } else {
          setSelectorSource(null);
        }
      } catch (err) {
        const errorObject = err instanceof Error ? err : new Error(String(err));
        setSelectorSource(null);
        setError(errorObject);
        onProcessError?.(errorObject);
      }

      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }, [interactiveCrop, onProcessError, source]);

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
          const errorObject =
            err instanceof Error ? err : new Error(String(err));
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
      editingOptions,
    ]);

    const handleCropChange = useCallback(
      (nextCrop: CropArea) => {
        setSelectedCrop(nextCrop);
        onCropChange?.(nextCrop);
      },
      [onCropChange],
    );

    const handleApplyCrop = useCallback(async () => {
      if (
        !selectedCrop ||
        selectedCrop.width <= 0 ||
        selectedCrop.height <= 0
      ) {
        const errorObject = new Error('Please select a crop area');
        setError(errorObject);
        onProcessError?.(errorObject);
        return;
      }

      try {
        const proceed = await onCropApply?.(selectedCrop);
        if (proceed === false) return;

        setAppliedInteractiveCrop(selectedCrop);
        setError(null);
      } catch (err) {
        const errorObject = err instanceof Error ? err : new Error(String(err));
        setError(errorObject);
        onProcessError?.(errorObject);
      }
    }, [onCropApply, onProcessError, selectedCrop]);

    const handleResetCrop = useCallback(async () => {
      try {
        const proceed = await onCropReset?.();
        if (proceed === false) return;

        setSelectedCrop(null);
        setAppliedInteractiveCrop(null);
        setError(null);
        setSelectorVersion((version) => version + 1);
      } catch (err) {
        const errorObject = err instanceof Error ? err : new Error(String(err));
        setError(errorObject);
        onProcessError?.(errorObject);
      }
    }, [onCropReset, onProcessError]);

    const hasSelectedCrop =
      selectedCrop !== null &&
      selectedCrop.width > 0 &&
      selectedCrop.height > 0;

    const renderCropButtons = (includeApply: boolean) => (
      <div
        className={cropButtonContainerClassName}
        style={{
          ...CROP_BUTTON_CONTAINER_STYLE,
          ...getCropButtonPositionStyle(cropButtonPosition),
          ...cropButtonContainerStyle,
        }}
      >
        {includeApply ? (
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={!hasSelectedCrop}
            className={cropApplyButtonClassName}
            aria-label={cropApplyButtonAriaLabel}
            style={{
              ...CROP_APPLY_BUTTON_STYLE,
              cursor: hasSelectedCrop ? 'pointer' : 'not-allowed',
              opacity: hasSelectedCrop ? 1 : 0.65,
              ...cropApplyButtonStyle,
            }}
          >
            {cropApplyButtonLabel}
          </button>
        ) : null}

        {allowCropReset ? (
          <button
            type="button"
            onClick={handleResetCrop}
            className={cropResetButtonClassName}
            aria-label={cropResetButtonAriaLabel}
            style={{
              ...CROP_RESET_BUTTON_STYLE,
              ...cropResetButtonStyle,
            }}
          >
            {cropResetButtonLabel}
          </button>
        ) : null}
      </div>
    );

    if (error) {
      return (
        <div
          className={errorClassName ?? 'lumina-error'}
          style={errorStyle}
          role={errorRole}
        >
          {error.message}
        </div>
      );
    }

    if (interactiveCrop && selectorSource && !appliedInteractiveCrop) {
      return (
        <div
          className={cropContainerClassName}
          style={{ ...INTERACTIVE_CROP_CONTAINER_STYLE, ...cropContainerStyle }}
        >
          <ImageAreaSelector
            key={`${selectorSource}-${selectorVersion}`}
            src={selectorSource}
            onCropChange={handleCropChange}
            onCropComplete={handleCropChange}
            aspect={cropAspectRatio}
            allowResize={allowCropResize}
            lineWidth={cropLineWidth}
            lineColor={cropLineColor}
            overlayOpacity={cropOverlayOpacity}
            className={cropSelectorClassName}
            style={cropSelectorStyle}
            imageClassName={cropSelectorImageClassName}
            imageStyle={cropSelectorImageStyle}
            selectionClassName={cropSelectionClassName}
            selectionStyle={cropSelectionStyle}
            handleClassName={cropHandleClassName}
            handleStyle={cropHandleStyle}
            ariaLabel={cropAriaLabel}
            ariaDescription={cropAriaDescription}
            keyboardStep={cropKeyboardStep}
            keyboardStepLarge={cropKeyboardStepLarge}
          />
          {renderCropButtons(true)}
          <span aria-live="polite" style={CROP_STATUS_STYLE}>
            {cropStatus}
          </span>
        </div>
      );
    }

    if (interactiveCrop && appliedInteractiveCrop) {
      return (
        <div
          className={cropContainerClassName}
          style={{ ...INTERACTIVE_CROP_CONTAINER_STYLE, ...cropContainerStyle }}
        >
          <canvas ref={setCanvasRef} {...props} />
          {allowCropReset ? renderCropButtons(false) : null}
          <span aria-live="polite" style={CROP_STATUS_STYLE}>
            {cropStatus}
          </span>
        </div>
      );
    }

    return <canvas ref={setCanvasRef} {...props} />;
  },
);
