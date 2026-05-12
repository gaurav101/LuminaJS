import {
  useState,
  useRef,
  useCallback,
  useEffect,
  FC,
  MouseEvent,
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
}

/**
 * ImageAreaSelector - An interactive image cropping tool.
 *
 * Displays an image with a draggable selection box to define a crop area.
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
  const [displayScale, setDisplayScale] = useState({
    scaleX: 1,
    scaleY: 1,
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const cropRef = useRef<CropArea>(crop);
  const isDraggingRef = useRef(false);

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

  const handleMouseDown = useCallback((e: MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    const rect = img?.getBoundingClientRect();
    if (!rect || !img) return;

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDragging(true);
    isDraggingRef.current = true;
    startPos.current = { x, y };
    const emptyCrop = { x, y, width: 0, height: 0 };
    cropRef.current = emptyCrop;
    setCrop(emptyCrop);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !imgRef.current) return;

      const img = imgRef.current;
      const rect = img.getBoundingClientRect();

      const scaleX = img.naturalWidth / rect.width;
      const scaleY = img.naturalHeight / rect.height;

      let currentX = (e.clientX - rect.left) * scaleX;
      let currentY = (e.clientY - rect.top) * scaleY;

      currentX = Math.max(0, Math.min(currentX, img.naturalWidth));
      currentY = Math.max(0, Math.min(currentY, img.naturalHeight));

      let width = currentX - startPos.current.x;
      let height = aspect ? width / aspect : currentY - startPos.current.y;

      if (aspect && Math.abs(height) > 0) {
        const maxHeight = img.naturalHeight - Math.max(0, startPos.current.y);
        const maxWidth = img.naturalWidth - Math.max(0, startPos.current.x);

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
        x: width > 0 ? startPos.current.x : currentX,
        y: height > 0 ? startPos.current.y : currentY,
        width: Math.abs(width),
        height: Math.abs(height),
      };

      cropRef.current = newCrop;
      setCrop(newCrop);
      onCropChange(newCrop);
    },
    [isDragging, aspect, onCropChange],
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
        cursor: isDragging ? 'grabbing' : 'crosshair',
        userSelect: 'none',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <img
        ref={imgRef}
        src={src}
        alt="Crop Source"
        onLoad={updateDisplayScale}
        onMouseDown={handleMouseDown}
        style={{ display: 'block', maxWidth: '100%', userSelect: 'none' }}
        draggable={false}
      />

      {/* The Selection Box Overlay */}
      {crop.width > 0 && crop.height > 0 && (
        <div
          style={{
            position: 'absolute',
            border: `${lineWidth}px dashed ${lineColor}`,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, ${overlayOpacity})`,
            pointerEvents: 'none',
            left: crop.x * displayScale.scaleX,
            top: crop.y * displayScale.scaleY,
            width: crop.width * displayScale.scaleX,
            height: crop.height * displayScale.scaleY,
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};
