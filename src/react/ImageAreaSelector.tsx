import {
  useState,
  useRef,
  useCallback,
  useEffect,
  FC,
  MouseEvent,
  ReactNode,
} from 'react';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageAreaSelectorProps {
  src: string;
  onCropChange: (crop: CropArea) => void;
  onCropComplete?: (crop: CropArea) => void;
  aspect?: number;
  lineWidth?: number;
  lineColor?: string;
  overlayOpacity?: number;
  // Optional render prop to display controls relative to the selection overlay.
  // Receives overlay dimensions (CSS pixels) and display scale.
  overlayControls?: (params: {
    left: number;
    top: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
  }) => React.ReactNode;
}

type DragMode = 'draw' | 'move';

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
}) => {
  const [crop, setCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>('draw');
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

  const getImagePoint = useCallback((e: MouseEvent<HTMLElement>) => {
    const img = imgRef.current;
    const rect = img?.getBoundingClientRect();
    if (!rect || !img) return null;

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    return {
      x: Math.max(
        0,
        Math.min((e.clientX - rect.left) * scaleX, img.naturalWidth),
      ),
      y: Math.max(
        0,
        Math.min((e.clientY - rect.top) * scaleY, img.naturalHeight),
      ),
      imageWidth: img.naturalWidth,
      imageHeight: img.naturalHeight,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;

      const point = getImagePoint(e);
      if (!point) return;

      setIsDragging(true);
      isDraggingRef.current = true;

      const currentCrop = cropRef.current;
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
        moveOffset.current = {
          x: point.x - currentCrop.x,
          y: point.y - currentCrop.y,
        };
        return;
      }

      dragModeRef.current = 'draw';
      setDragMode('draw');
      startPos.current = { x: point.x, y: point.y };
      const emptyCrop = { x: point.x, y: point.y, width: 0, height: 0 };
      cropRef.current = emptyCrop;
      setCrop(emptyCrop);
    },
    [getImagePoint],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !imgRef.current) return;

      const point = getImagePoint(e);
      if (!point) return;

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

    const finalCrop = cropRef.current;
    if (finalCrop.width > 0 && finalCrop.height > 0) {
      onCropComplete?.(finalCrop);
    }
  }, [onCropComplete]);

  useEffect(() => {
    updateDisplayScale();
    window.addEventListener('resize', updateDisplayScale);
    return () => window.removeEventListener('resize', updateDisplayScale);
  }, [src, updateDisplayScale]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor:
          isDragging && dragMode === 'move'
            ? 'grabbing'
            : isDragging
              ? 'crosshair'
              : 'crosshair',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <img
        ref={imgRef}
        src={src}
        alt="Crop Source"
        onLoad={updateDisplayScale}
        style={{ display: 'block', maxWidth: '100%', userSelect: 'none' }}
        draggable={false}
      />

      {/* The Selection Box Overlay */}
      {crop.width > 0 && crop.height > 0 && (
        <>
          <div
            style={{
              position: 'absolute',
              border: `${lineWidth}px dashed ${lineColor}`,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: `0 0 0 9999px rgba(0, 0, 0, ${overlayOpacity})`,
              cursor: isDragging ? 'grabbing' : 'move',
              left: crop.x * displayScale.scaleX,
              top: crop.y * displayScale.scaleY,
              width: crop.width * displayScale.scaleX,
              height: crop.height * displayScale.scaleY,
              zIndex: 10,
            }}
          />

          {/* Optional controls rendered relative to the selection overlay */}
          {overlayControls && (() => {
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
                style={{
                  position: 'absolute',
                  left: leftPx,
                  top: controlsTop,
                  zIndex: 1001,
                }}
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
