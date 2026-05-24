import { useState, useRef, useCallback, useEffect, useId } from 'react';
import type {
  FC,
  MouseEvent,
  TouchEvent,
  KeyboardEvent,
  ReactNode,
  CSSProperties,
} from 'react';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageAreaSelectorProps {
  src: string;
  onCropChange: (crop: CropArea) => void;
  onCropComplete?: (crop: CropArea) => void;
  aspect?: number;
  lineWidth?: number;
  lineColor?: string;
  overlayOpacity?: number;
  allowResize?: boolean;
  // Optional render prop to display controls relative to the selection overlay.
  // Receives overlay dimensions (CSS pixels) and display scale.
  overlayControls?: (params: {
    left: number;
    top: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
  }) => ReactNode;
  className?: string;
  style?: CSSProperties;
  imageClassName?: string;
  imageStyle?: CSSProperties;
  selectionClassName?: string;
  selectionStyle?: CSSProperties;
  handleClassName?: string;
  handleStyle?: CSSProperties;
  overlayControlsContainerClassName?: string;
  overlayControlsContainerStyle?: CSSProperties;
  ariaLabel?: string;
  ariaDescription?: string;
  keyboardStep?: number;
  keyboardStepLarge?: number;
}

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
type DragMode = 'draw' | 'move' | 'resize';

const HANDLE_SIZE = 12;
const MIN_CROP_SIZE = 1;

const ROOT_BASE_STYLE: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  userSelect: 'none',
  touchAction: 'none',
};

const IMAGE_BASE_STYLE: CSSProperties = {
  display: 'block',
  maxWidth: '100%',
  userSelect: 'none',
};

const SELECTION_BASE_STYLE: CSSProperties = {
  position: 'absolute',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  zIndex: 10,
};

const HANDLE_BASE_STYLE: CSSProperties = {
  position: 'absolute',
  width: HANDLE_SIZE,
  height: HANDLE_SIZE,
  borderRadius: '50%',
  backgroundColor: '#fff',
  boxSizing: 'border-box',
};

const OVERLAY_CONTROLS_BASE_STYLE: CSSProperties = {
  position: 'absolute',
  zIndex: 1001,
  pointerEvents: 'auto',
};

const SR_ONLY_STYLE: CSSProperties = {
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

const resizeHandles: Array<{
  id: ResizeHandle;
  cursor: string;
  style: {
    left?: string;
    top?: string;
    right?: string;
    bottom?: string;
    transform?: string;
  };
}> = [
  {
    id: 'nw',
    cursor: 'nwse-resize',
    style: { left: '0%', top: '0%', transform: 'translate(-50%, -50%)' },
  },
  {
    id: 'n',
    cursor: 'ns-resize',
    style: { left: '50%', top: '0%', transform: 'translate(-50%, -50%)' },
  },
  {
    id: 'ne',
    cursor: 'nesw-resize',
    style: { right: '0%', top: '0%', transform: 'translate(50%, -50%)' },
  },
  {
    id: 'e',
    cursor: 'ew-resize',
    style: { right: '0%', top: '50%', transform: 'translate(50%, -50%)' },
  },
  {
    id: 'se',
    cursor: 'nwse-resize',
    style: { right: '0%', bottom: '0%', transform: 'translate(50%, 50%)' },
  },
  {
    id: 's',
    cursor: 'ns-resize',
    style: { left: '50%', bottom: '0%', transform: 'translate(-50%, 50%)' },
  },
  {
    id: 'sw',
    cursor: 'nesw-resize',
    style: { left: '0%', bottom: '0%', transform: 'translate(-50%, 50%)' },
  },
  {
    id: 'w',
    cursor: 'ew-resize',
    style: { left: '0%', top: '50%', transform: 'translate(-50%, -50%)' },
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function normalizeCrop(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): CropArea {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

function clampAspectCrop(
  crop: CropArea,
  imageWidth: number,
  imageHeight: number,
) {
  const x = clamp(crop.x, 0, imageWidth - crop.width);
  const y = clamp(crop.y, 0, imageHeight - crop.height);

  return {
    ...crop,
    x,
    y,
  };
}

function getAspectResizeCrop(
  point: { x: number; y: number; imageWidth: number; imageHeight: number },
  currentCrop: CropArea,
  handle: ResizeHandle,
  aspect: number,
) {
  const left = currentCrop.x;
  const right = currentCrop.x + currentCrop.width;
  const top = currentCrop.y;
  const bottom = currentCrop.y + currentCrop.height;
  const centerX = left + currentCrop.width / 2;
  const centerY = top + currentCrop.height / 2;

  if (handle === 'e' || handle === 'w') {
    const anchorX = handle === 'e' ? left : right;
    const maxWidth = handle === 'e' ? point.imageWidth - anchorX : anchorX;
    const width = clamp(
      Math.abs(point.x - anchorX),
      MIN_CROP_SIZE,
      Math.min(maxWidth, point.imageHeight * aspect),
    );
    const height = width / aspect;
    const crop = {
      x: handle === 'e' ? anchorX : anchorX - width,
      y: centerY - height / 2,
      width,
      height,
    };

    return clampAspectCrop(crop, point.imageWidth, point.imageHeight);
  }

  if (handle === 'n' || handle === 's') {
    const anchorY = handle === 's' ? top : bottom;
    const maxHeight = handle === 's' ? point.imageHeight - anchorY : anchorY;
    const height = clamp(
      Math.abs(point.y - anchorY),
      MIN_CROP_SIZE,
      Math.min(maxHeight, point.imageWidth / aspect),
    );
    const width = height * aspect;
    const crop = {
      x: centerX - width / 2,
      y: handle === 's' ? anchorY : anchorY - height,
      width,
      height,
    };

    return clampAspectCrop(crop, point.imageWidth, point.imageHeight);
  }

  const anchorX = handle.includes('e') ? left : right;
  const anchorY = handle.includes('s') ? top : bottom;
  const deltaX = point.x - anchorX;
  const deltaY = point.y - anchorY;
  const signX = deltaX >= 0 ? 1 : -1;
  const signY = deltaY >= 0 ? 1 : -1;
  let width = Math.max(
    Math.abs(deltaX),
    Math.abs(deltaY) * aspect,
    MIN_CROP_SIZE,
  );
  let height = width / aspect;

  const maxWidth = signX > 0 ? point.imageWidth - anchorX : anchorX;
  const maxHeight = signY > 0 ? point.imageHeight - anchorY : anchorY;
  width = Math.min(width, maxWidth, maxHeight * aspect);
  height = width / aspect;

  return normalizeCrop(
    anchorX,
    anchorY,
    anchorX + signX * width,
    anchorY + signY * height,
  );
}

function getResizeCrop(
  point: { x: number; y: number; imageWidth: number; imageHeight: number },
  currentCrop: CropArea,
  handle: ResizeHandle,
  aspect?: number,
) {
  if (aspect) return getAspectResizeCrop(point, currentCrop, handle, aspect);

  const left = currentCrop.x;
  const right = currentCrop.x + currentCrop.width;
  const top = currentCrop.y;
  const bottom = currentCrop.y + currentCrop.height;

  const x1 = handle.includes('w') ? point.x : left;
  const x2 = handle.includes('e') ? point.x : right;
  const y1 = handle.includes('n') ? point.y : top;
  const y2 = handle.includes('s') ? point.y : bottom;

  return normalizeCrop(x1, y1, x2, y2);
}

/**
 * ImageAreaSelector - An interactive image cropping tool.
 *
 * Displays an image with a draggable selection box to define a crop area.
 * The selected crop area can be dragged to another part of the image before applying.
 * Constraints applied: image boundaries, optional aspect ratio, and prevents negative dimensions.
 *
 * @param {ImageAreaSelectorProps} props
 * @param {string} props.src - The image URL to display
 * @param {Function} props.onCropChange - Callback triggered when crop area changes
 * @param {Function} [props.onCropComplete] - Callback triggered when crop selection ends
 * @param {number} [props.aspect] - Optional aspect ratio to enforce (width / height)
 * @param {number} [props.lineWidth=2] - Border line width in pixels
 * @param {string} [props.lineColor='#fff'] - Border color (CSS color value)
 * @param {number} [props.overlayOpacity=0.5] - Opacity of the darkened surround area (0-1)
 * @param {boolean} [props.allowResize=true] - Enables resize handles on the crop area
 *
 * @example
 * ```tsx
 * const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
 *
 * <ImageAreaSelector
 *   src="image.jpg"
 *   aspect={16 / 9}
 *   lineColor="#00ff00"
 *   onCropChange={setCrop}
 * />
 * ```
 */
export const ImageAreaSelector: FC<ImageAreaSelectorProps> = ({
  src,
  onCropChange,
  onCropComplete,
  aspect,
  lineWidth = 2,
  lineColor = '#fff',
  overlayOpacity = 0.5,
  allowResize = true,
  overlayControls,
  className,
  style,
  imageClassName,
  imageStyle,
  selectionClassName,
  selectionStyle,
  handleClassName,
  handleStyle,
  overlayControlsContainerClassName,
  overlayControlsContainerStyle,
  ariaLabel = 'Image crop selection area',
  ariaDescription = 'Use arrow keys to move the crop. Hold Shift for larger steps. Hold Alt with arrows to resize. Press Enter to confirm the current selection. Press Escape to clear the selection.',
  keyboardStep = 1,
  keyboardStepLarge = 10,
}) => {
  const [crop, setCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>('draw');
  const [activeResizeHandle, setActiveResizeHandle] =
    useState<ResizeHandle | null>(null);
  const [displayScale, setDisplayScale] = useState({
    scaleX: 1,
    scaleY: 1,
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const moveOffset = useRef({ x: 0, y: 0 });
  const cropRef = useRef<CropArea>(crop);
  const isDraggingRef = useRef(false);
  const dragModeRef = useRef<DragMode>('draw');
  const resizeHandleRef = useRef<ResizeHandle | null>(null);
  const resizeStartCropRef = useRef<CropArea | null>(null);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const pinchStartCropRef = useRef<CropArea | null>(null);
  const descriptionId = useId();

  const updateDisplayScale = useCallback(() => {
    const img = imgRef.current;
    if (!img || img.naturalWidth === 0 || img.naturalHeight === 0) return;

    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    setDisplayScale({
      scaleX: rect.width / img.naturalWidth,
      scaleY: rect.height / img.naturalHeight,
    });
  }, []);

  const getImagePoint = useCallback(
    (e: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>) => {
      const img = imgRef.current;
      const rect = img?.getBoundingClientRect();
      if (!rect || !img) return null;

      const scaleX = img.naturalWidth / rect.width;
      const scaleY = img.naturalHeight / rect.height;

      let clientX, clientY;
      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: Math.max(
          0,
          Math.min((clientX - rect.left) * scaleX, img.naturalWidth),
        ),
        y: Math.max(
          0,
          Math.min((clientY - rect.top) * scaleY, img.naturalHeight),
        ),
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight,
      };
    },
    [],
  );

  const getResizeHandle = useCallback(
    (point: { x: number; y: number }) => {
      if (!allowResize) return null;

      const currentCrop = cropRef.current;
      if (currentCrop.width <= 0 || currentCrop.height <= 0) return null;

      const thresholdX = HANDLE_SIZE / Math.max(displayScale.scaleX, 0.001);
      const thresholdY = HANDLE_SIZE / Math.max(displayScale.scaleY, 0.001);
      const left = currentCrop.x;
      const right = currentCrop.x + currentCrop.width;
      const top = currentCrop.y;
      const bottom = currentCrop.y + currentCrop.height;
      const centerX = left + currentCrop.width / 2;
      const centerY = top + currentCrop.height / 2;
      const nearX = (x: number) => Math.abs(point.x - x) <= thresholdX;
      const nearY = (y: number) => Math.abs(point.y - y) <= thresholdY;

      if (nearX(left) && nearY(top)) return 'nw';
      if (nearX(right) && nearY(top)) return 'ne';
      if (nearX(right) && nearY(bottom)) return 'se';
      if (nearX(left) && nearY(bottom)) return 'sw';
      if (nearY(top) && point.x >= left && point.x <= right) return 'n';
      if (nearX(right) && point.y >= top && point.y <= bottom) return 'e';
      if (nearY(bottom) && point.x >= left && point.x <= right) return 's';
      if (nearX(left) && point.y >= top && point.y <= bottom) return 'w';
      if (nearX(centerX) && nearY(top)) return 'n';
      if (nearX(right) && nearY(centerY)) return 'e';
      if (nearX(centerX) && nearY(bottom)) return 's';
      if (nearX(left) && nearY(centerY)) return 'w';

      return null;
    },
    [allowResize, displayScale.scaleX, displayScale.scaleY],
  );

  const handleInteractionStart = useCallback(
    (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
      if ('button' in e && e.button !== 0) return;

      if ('touches' in e && e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );
        initialPinchDistanceRef.current = dist;
        pinchStartCropRef.current = cropRef.current;
        setIsDragging(true);
        isDraggingRef.current = true;
        dragModeRef.current = 'resize';
        setDragMode('resize');
        return;
      }

      if ('touches' in e && e.touches.length > 2) return;

      const point = getImagePoint(e);
      if (!point) return;

      setIsDragging(true);
      isDraggingRef.current = true;

      const currentCrop = cropRef.current;
      const resizeHandle = getResizeHandle(point);

      if (resizeHandle) {
        dragModeRef.current = 'resize';
        setDragMode('resize');
        resizeHandleRef.current = resizeHandle;
        setActiveResizeHandle(resizeHandle);
        resizeStartCropRef.current = currentCrop;
        return;
      }

      const isInsideCrop =
        currentCrop.width > 0 &&
        currentCrop.height > 0 &&
        point.x >= currentCrop.x &&
        point.x <= currentCrop.x + currentCrop.width &&
        point.y >= currentCrop.y &&
        point.y <= currentCrop.y + currentCrop.height;

      if (isInsideCrop) {
        dragModeRef.current = 'move';
        setDragMode('move');
        resizeHandleRef.current = null;
        setActiveResizeHandle(null);
        resizeStartCropRef.current = null;
        moveOffset.current = {
          x: point.x - currentCrop.x,
          y: point.y - currentCrop.y,
        };
        return;
      }

      dragModeRef.current = 'draw';
      setDragMode('draw');
      resizeHandleRef.current = null;
      setActiveResizeHandle(null);
      resizeStartCropRef.current = null;
      startPos.current = { x: point.x, y: point.y };
      const emptyCrop = { x: point.x, y: point.y, width: 0, height: 0 };
      cropRef.current = emptyCrop;
      setCrop(emptyCrop);
    },
    [getImagePoint, getResizeHandle],
  );

  const handleInteractionMove = useCallback(
    (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
      if (!isDragging || !imgRef.current) return;

      if ('touches' in e && e.touches.length === 2) {
        if (
          initialPinchDistanceRef.current !== null &&
          pinchStartCropRef.current !== null
        ) {
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const dist = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY,
          );
          const scale = dist / initialPinchDistanceRef.current;

          const startCrop = pinchStartCropRef.current;
          const imgWidth = imgRef.current.naturalWidth;
          const imgHeight = imgRef.current.naturalHeight;

          let newWidth = startCrop.width * scale;
          let newHeight = aspect ? newWidth / aspect : startCrop.height * scale;

          newWidth = Math.max(MIN_CROP_SIZE, Math.min(newWidth, imgWidth));
          newHeight = Math.max(MIN_CROP_SIZE, Math.min(newHeight, imgHeight));

          if (aspect && newHeight > imgHeight) {
            newHeight = imgHeight;
            newWidth = newHeight * aspect;
          }

          const centerX = startCrop.x + startCrop.width / 2;
          const centerY = startCrop.y + startCrop.height / 2;

          const newX = centerX - newWidth / 2;
          const newY = centerY - newHeight / 2;

          const newCrop = clampAspectCrop(
            { x: newX, y: newY, width: newWidth, height: newHeight },
            imgWidth,
            imgHeight,
          );

          cropRef.current = newCrop;
          setCrop(newCrop);
          onCropChange(newCrop);
        }
        return;
      }

      const point = getImagePoint(e);
      if (!point) return;

      if (
        dragModeRef.current === 'resize' &&
        resizeHandleRef.current &&
        resizeStartCropRef.current
      ) {
        const newCrop = getResizeCrop(
          point,
          resizeStartCropRef.current,
          resizeHandleRef.current,
          aspect,
        );

        cropRef.current = newCrop;
        setCrop(newCrop);
        onCropChange(newCrop);
        return;
      }

      if (dragModeRef.current === 'move') {
        const currentCrop = cropRef.current;
        const newCrop = {
          ...currentCrop,
          x: Math.max(
            0,
            Math.min(
              point.x - moveOffset.current.x,
              point.imageWidth - currentCrop.width,
            ),
          ),
          y: Math.max(
            0,
            Math.min(
              point.y - moveOffset.current.y,
              point.imageHeight - currentCrop.height,
            ),
          ),
        };

        cropRef.current = newCrop;
        setCrop(newCrop);
        onCropChange(newCrop);
        return;
      }

      let width = point.x - startPos.current.x;
      let height = aspect ? width / aspect : point.y - startPos.current.y;

      if (aspect && Math.abs(height) > 0) {
        const maxHeight = point.imageHeight - Math.max(0, startPos.current.y);
        const maxWidth = point.imageWidth - Math.max(0, startPos.current.x);

        if (Math.abs(height) > maxHeight) {
          height = Math.sign(height) * maxHeight;
          width = height * aspect;
        }
        if (Math.abs(width) > maxWidth) {
          width = Math.sign(width) * maxWidth;
          height = width / aspect;
        }
      }

      const newCrop = {
        x: width > 0 ? startPos.current.x : point.x,
        y: height > 0 ? startPos.current.y : point.y,
        width: Math.abs(width),
        height: Math.abs(height),
      };

      cropRef.current = newCrop;
      setCrop(newCrop);
      onCropChange(newCrop);
    },
    [isDragging, aspect, getImagePoint, onCropChange],
  );

  const stopDragging = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setIsDragging(false);
    resizeHandleRef.current = null;
    setActiveResizeHandle(null);
    resizeStartCropRef.current = null;
    initialPinchDistanceRef.current = null;
    pinchStartCropRef.current = null;

    const finalCrop = cropRef.current;
    if (finalCrop.width > 0 && finalCrop.height > 0) {
      onCropComplete?.(finalCrop);
    }
  }, [onCropComplete]);

  const emitCrop = useCallback(
    (nextCrop: CropArea, complete = false) => {
      cropRef.current = nextCrop;
      setCrop(nextCrop);
      onCropChange(nextCrop);
      if (complete && nextCrop.width > 0 && nextCrop.height > 0) {
        onCropComplete?.(nextCrop);
      }
    },
    [onCropChange, onCropComplete],
  );

  const handleKeyboardInteraction = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;

      const currentCrop = cropRef.current;
      const hasCrop = currentCrop.width > 0 && currentCrop.height > 0;
      const image = imgRef.current;
      if (!image) return;

      const imageWidth = image.naturalWidth || 0;
      const imageHeight = image.naturalHeight || 0;
      if (!imageWidth || !imageHeight) return;

      if (event.key === 'Escape' && hasCrop) {
        event.preventDefault();
        emitCrop({ x: 0, y: 0, width: 0, height: 0 });
        return;
      }

      if ((event.key === 'Enter' || event.key === ' ') && hasCrop) {
        event.preventDefault();
        onCropComplete?.(currentCrop);
        return;
      }

      if (!hasCrop) return;

      const isArrowKey = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
      ].includes(event.key);

      if (!isArrowKey) return;
      event.preventDefault();

      const step = event.shiftKey ? keyboardStepLarge : keyboardStep;
      const moveX =
        event.key === 'ArrowLeft'
          ? -step
          : event.key === 'ArrowRight'
            ? step
            : 0;
      const moveY =
        event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;

      if (event.altKey) {
        let nextWidth = currentCrop.width + moveX;
        let nextHeight = currentCrop.height + moveY;

        if (aspect) {
          if (moveX !== 0) {
            nextWidth = currentCrop.width + moveX;
            nextHeight = nextWidth / aspect;
          } else {
            nextHeight = currentCrop.height + moveY;
            nextWidth = nextHeight * aspect;
          }
        }

        nextWidth = clamp(nextWidth, MIN_CROP_SIZE, imageWidth - currentCrop.x);
        nextHeight = clamp(
          nextHeight,
          MIN_CROP_SIZE,
          imageHeight - currentCrop.y,
        );

        if (aspect) {
          const widthByHeight = nextHeight * aspect;
          const heightByWidth = nextWidth / aspect;
          if (widthByHeight <= imageWidth - currentCrop.x) {
            nextWidth = widthByHeight;
          } else {
            nextHeight = heightByWidth;
          }
        }

        emitCrop({
          ...currentCrop,
          width: nextWidth,
          height: nextHeight,
        });
        return;
      }

      emitCrop({
        ...currentCrop,
        x: clamp(currentCrop.x + moveX, 0, imageWidth - currentCrop.width),
        y: clamp(currentCrop.y + moveY, 0, imageHeight - currentCrop.height),
      });
    },
    [aspect, keyboardStep, keyboardStepLarge, emitCrop, onCropComplete],
  );

  useEffect(() => {
    updateDisplayScale();
    window.addEventListener('resize', updateDisplayScale);
    return () => window.removeEventListener('resize', updateDisplayScale);
  }, [src, updateDisplayScale]);

  const resizeCursor =
    dragMode === 'resize' && activeResizeHandle
      ? resizeHandles.find((handle) => handle.id === activeResizeHandle)?.cursor
      : undefined;

  return (
    <div
      className={className}
      style={{
        ...ROOT_BASE_STYLE,
        cursor:
          resizeCursor ??
          (isDragging && dragMode === 'move' ? 'grabbing' : 'crosshair'),
        ...style,
      }}
      role="group"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? descriptionId : undefined}
      aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Shift+ArrowLeft Shift+ArrowRight Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight Enter Escape"
      onKeyDown={handleKeyboardInteraction}
      onMouseDown={handleInteractionStart}
      onMouseMove={handleInteractionMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onTouchStart={handleInteractionStart}
      onTouchMove={handleInteractionMove}
      onTouchEnd={stopDragging}
      onTouchCancel={stopDragging}
    >
      {ariaDescription ? (
        <span id={descriptionId} style={SR_ONLY_STYLE}>
          {ariaDescription}
        </span>
      ) : null}
      <img
        ref={imgRef}
        src={src}
        alt="Crop Source"
        onLoad={updateDisplayScale}
        className={imageClassName}
        style={{ ...IMAGE_BASE_STYLE, ...imageStyle }}
        draggable={false}
      />

      {/* The Selection Box Overlay */}
      {crop.width > 0 && crop.height > 0 && (
        <>
          <div
            className={selectionClassName}
            style={{
              ...SELECTION_BASE_STYLE,
              border: `${lineWidth}px dashed ${lineColor}`,
              boxShadow: `0 0 0 9999px rgba(0, 0, 0, ${overlayOpacity})`,
              cursor: isDragging ? 'grabbing' : 'move',
              left: crop.x * displayScale.scaleX,
              top: crop.y * displayScale.scaleY,
              width: crop.width * displayScale.scaleX,
              height: crop.height * displayScale.scaleY,
              ...selectionStyle,
            }}
            aria-hidden={true}
          >
            {allowResize &&
              resizeHandles.map((handle) => (
                <span
                  key={handle.id}
                  className={handleClassName}
                  style={{
                    ...HANDLE_BASE_STYLE,
                    border: `2px solid ${lineColor}`,
                    cursor: handle.cursor,
                    ...handle.style,
                    ...handleStyle,
                  }}
                  aria-hidden={true}
                />
              ))}
          </div>

          {/* Optional controls rendered relative to the selection overlay */}
          {overlayControls &&
            (() => {
              const leftPx = crop.x * displayScale.scaleX;
              const topPx = crop.y * displayScale.scaleY;
              const widthPx = crop.width * displayScale.scaleX;
              const heightPx = crop.height * displayScale.scaleY;

              // Attempt to place controls above the selection; if not enough space, place below.
              const CONTROL_HEIGHT = 40;
              let controlsTop = topPx - CONTROL_HEIGHT - 8;
              if (controlsTop < 8) controlsTop = topPx + heightPx + 8;

              return (
                <div
                  className={overlayControlsContainerClassName}
                  style={{
                    ...OVERLAY_CONTROLS_BASE_STYLE,
                    left: leftPx,
                    top: controlsTop,
                    ...overlayControlsContainerStyle,
                  }}
                  // Prevent parent drag/selection handlers from reacting to clicks on controls
                  onMouseDown={(ev) => ev.stopPropagation()}
                  onMouseUp={(ev) => ev.stopPropagation()}
                  onClick={(ev) => ev.stopPropagation()}
                  onTouchStart={(ev) => ev.stopPropagation()}
                  onTouchMove={(ev) => ev.stopPropagation()}
                  onTouchEnd={(ev) => ev.stopPropagation()}
                  onTouchCancel={(ev) => ev.stopPropagation()}
                >
                  {overlayControls({
                    left: leftPx,
                    top: topPx,
                    width: widthPx,
                    height: heightPx,
                    scaleX: displayScale.scaleX,
                    scaleY: displayScale.scaleY,
                  })}
                </div>
              );
            })()}
        </>
      )}
    </div>
  );
};
