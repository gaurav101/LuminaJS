import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { lumina, type Lumina } from '@gks101/luminajs';

type ProfileFilter = 'none' | 'grayscale' | 'sepia' | 'sharpen' | 'soft-blur';
type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
type CropInteractionMode = 'move' | ResizeHandle;
type TransformInteractionMode = 'move' | 'rotate';

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageSize {
  width: number;
  height: number;
}

interface ThumbnailPreview {
  filter: ProfileFilter;
  label: string;
  src: string;
}

interface CropInteraction {
  mode: CropInteractionMode;
  startX: number;
  startY: number;
  startCrop: CropRect;
}

interface TransformInteraction {
  mode: TransformInteractionMode;
  startX: number;
  startY: number;
  startPositionX: number;
  startPositionY: number;
  startRotation: number;
  startAngle: number;
  centerX: number;
  centerY: number;
  canvasScale: number;
}

export interface ProfileImageEditorProps {
  initialSrc?: string;
  outputSize?: number;
  className?: string;
  onChange?: (dataUrl: string) => void;
}

const FILTERS: Array<{ id: ProfileFilter; label: string }> = [
  { id: 'none', label: 'Original' },
  { id: 'grayscale', label: 'Mono' },
  { id: 'sepia', label: 'Warm' },
  { id: 'sharpen', label: 'Sharp' },
  { id: 'soft-blur', label: 'Soft' },
];

const HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const MIN_CROP_SIZE = 48;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

const normalizeRotation = (value: number) => {
  let nextValue = value % 360;
  if (nextValue > 180) nextValue -= 360;
  if (nextValue < -180) nextValue += 360;
  return Math.round(nextValue);
};

const loadHtmlImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      image.crossOrigin = 'anonymous';
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load profile image.'));
    image.src = src;
  });

const getRoundedCrop = (crop: CropRect) => ({
  x: Math.round(crop.x),
  y: Math.round(crop.y),
  width: Math.max(1, Math.round(crop.width)),
  height: Math.max(1, Math.round(crop.height)),
});

const applyFilter = (chain: Lumina, filter: ProfileFilter) => {
  if (filter === 'grayscale') return chain.grayscale();
  if (filter === 'sepia') return chain.sepia();
  if (filter === 'sharpen') return chain.sharpen();
  if (filter === 'soft-blur') return chain.gaussianBlur(1.2);
  return chain;
};

const createLuminaChain = ({
  source,
  crop,
  brightness,
  contrast,
  filter,
}: {
  source: string;
  crop: CropRect | null;
  brightness: number;
  contrast: number;
  filter: ProfileFilter;
}) => {
  let chain = lumina(source);

  if (crop && crop.width > 0 && crop.height > 0) {
    const roundedCrop = getRoundedCrop(crop);
    chain = chain.crop(
      roundedCrop.x,
      roundedCrop.y,
      roundedCrop.width,
      roundedCrop.height,
    );
  }

  if (brightness !== 0) chain = chain.brightness(brightness);
  if (contrast !== 0) chain = chain.contrast(contrast);

  return applyFilter(chain, filter);
};

const getFullImageCrop = (size: ImageSize): CropRect => ({
  x: 0,
  y: 0,
  width: size.width,
  height: size.height,
});

export const ProfileImageEditor = ({
  initialSrc = '/sample.png',
  outputSize = 640,
  className,
  onChange,
}: ProfileImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renderRequestRef = useRef(0);
  const drawRequestRef = useRef(0);
  const thumbnailRequestRef = useRef(0);
  const interactionRef = useRef<CropInteraction | null>(null);
  const transformInteractionRef = useRef<TransformInteraction | null>(null);

  const [source, setSource] = useState(initialSrc);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [displaySize, setDisplaySize] = useState<ImageSize | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [filter, setFilter] = useState<ProfileFilter>('none');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<
    ThumbnailPreview[]
  >([]);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCrop = useMemo(() => {
    if (crop && crop.width > 0 && crop.height > 0) return crop;
    return null;
  }, [crop]);

  const displayScale = useMemo(() => {
    if (!imageSize || !displaySize) return null;

    return {
      x: displaySize.width / imageSize.width,
      y: displaySize.height / imageSize.height,
    };
  }, [displaySize, imageSize]);

  const cropOverlayStyle = useMemo(() => {
    if (!activeCrop || !displayScale) return undefined;

    return {
      left: activeCrop.x * displayScale.x,
      top: activeCrop.y * displayScale.y,
      width: activeCrop.width * displayScale.x,
      height: activeCrop.height * displayScale.y,
    };
  }, [activeCrop, displayScale]);

  const syncDisplaySize = useCallback(() => {
    const image = cropImageRef.current;
    if (!image) return;

    const rect = image.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setDisplaySize({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadHtmlImage(source)
      .then((image) => {
        if (!isMounted) return;

        const size = {
          width: image.naturalWidth,
          height: image.naturalHeight,
        };
        setImageSize(size);
        setCrop(null);
        setCropMode(false);
        setPositionX(0);
        setPositionY(0);
        setRotation(0);
        setScale(1);
        setProcessedPreview(null);
        setError(null);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [source]);

  useEffect(() => {
    const image = cropImageRef.current;
    if (!image) return;

    syncDisplaySize();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncDisplaySize);
      return () => window.removeEventListener('resize', syncDisplaySize);
    }

    const observer = new ResizeObserver(syncDisplaySize);
    observer.observe(image);

    return () => observer.disconnect();
  }, [cropMode, source, syncDisplaySize]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    if (!source || cropMode) return;

    const requestId = renderRequestRef.current + 1;
    renderRequestRef.current = requestId;
    setIsRendering(true);

    const renderImage = async () => {
      try {
        const processedUrl = await createLuminaChain({
          source,
          crop: activeCrop,
          brightness,
          contrast,
          filter,
        }).toDataURL();

        if (requestId === renderRequestRef.current) {
          setProcessedPreview(processedUrl);
          setError(null);
        }
      } catch (err) {
        if (requestId === renderRequestRef.current) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (requestId === renderRequestRef.current) {
          setIsRendering(false);
        }
      }
    };

    renderImage();
  }, [activeCrop, brightness, contrast, cropMode, filter, source]);

  useEffect(() => {
    if (!processedPreview || cropMode) return;

    const requestId = drawRequestRef.current + 1;
    drawRequestRef.current = requestId;

    const drawImage = async () => {
      try {
        const processedImage = await loadHtmlImage(processedPreview);
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context || requestId !== drawRequestRef.current) {
          return;
        }

        canvas.width = outputSize;
        canvas.height = outputSize;
        context.clearRect(0, 0, outputSize, outputSize);
        context.fillStyle = '#f8fafc';
        context.fillRect(0, 0, outputSize, outputSize);

        const baseScale =
          Math.min(
            outputSize / processedImage.naturalWidth,
            outputSize / processedImage.naturalHeight,
          ) * scale;
        const drawWidth = processedImage.naturalWidth * baseScale;
        const drawHeight = processedImage.naturalHeight * baseScale;

        context.save();
        context.translate(
          outputSize / 2 + positionX,
          outputSize / 2 + positionY,
        );
        context.rotate((rotation * Math.PI) / 180);
        context.drawImage(
          processedImage,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight,
        );
        context.restore();

        const dataUrl = canvas.toDataURL('image/png');
        onChange?.(dataUrl);
        setError(null);
      } catch (err) {
        if (requestId === drawRequestRef.current) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    };

    drawImage();
  }, [
    cropMode,
    onChange,
    outputSize,
    positionX,
    positionY,
    processedPreview,
    rotation,
    scale,
  ]);

  useEffect(() => {
    if (!source) return;

    const requestId = thumbnailRequestRef.current + 1;
    thumbnailRequestRef.current = requestId;

    const renderThumbnails = async () => {
      try {
        const previews = await Promise.all(
          FILTERS.map(async (filterOption) => {
            const preview = await createLuminaChain({
              source,
              crop: null,
              brightness: 0,
              contrast: 0,
              filter: filterOption.id,
            })
              .resize(112, 112)
              .toDataURL();

            return {
              filter: filterOption.id,
              label: filterOption.label,
              src: preview,
            };
          }),
        );

        if (requestId === thumbnailRequestRef.current) {
          setThumbnailPreviews(previews);
        }
      } catch (err) {
        if (requestId === thumbnailRequestRef.current) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    };

    renderThumbnails();
  }, [source]);

  const startCropMode = () => {
    if (!imageSize) return;

    setCrop(getFullImageCrop(imageSize));
    setCropMode(true);
    requestAnimationFrame(syncDisplaySize);
  };

  const resetCrop = () => {
    setCrop(null);
    setCropMode(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextUrl = URL.createObjectURL(file);
    setObjectUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return nextUrl;
    });
    setSource(nextUrl);
  };

  const handleDownload = () => {
    const dataUrl = canvasRef.current?.toDataURL('image/png');
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'lumina-profile.png';
    link.click();
  };

  const getCropFromPointerMove = useCallback(
    (event: PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction || !displayScale || !imageSize) return null;

      const deltaX = (event.clientX - interaction.startX) / displayScale.x;
      const deltaY = (event.clientY - interaction.startY) / displayScale.y;
      const startCrop = interaction.startCrop;

      if (interaction.mode === 'move') {
        return {
          ...startCrop,
          x: clamp(startCrop.x + deltaX, 0, imageSize.width - startCrop.width),
          y: clamp(
            startCrop.y + deltaY,
            0,
            imageSize.height - startCrop.height,
          ),
        };
      }

      let left = startCrop.x;
      let right = startCrop.x + startCrop.width;
      let top = startCrop.y;
      let bottom = startCrop.y + startCrop.height;

      if (interaction.mode.includes('w')) left += deltaX;
      if (interaction.mode.includes('e')) right += deltaX;
      if (interaction.mode.includes('n')) top += deltaY;
      if (interaction.mode.includes('s')) bottom += deltaY;

      left = clamp(left, 0, imageSize.width - MIN_CROP_SIZE);
      right = clamp(right, MIN_CROP_SIZE, imageSize.width);
      top = clamp(top, 0, imageSize.height - MIN_CROP_SIZE);
      bottom = clamp(bottom, MIN_CROP_SIZE, imageSize.height);

      if (right - left < MIN_CROP_SIZE) {
        if (interaction.mode.includes('w')) left = right - MIN_CROP_SIZE;
        else right = left + MIN_CROP_SIZE;
      }

      if (bottom - top < MIN_CROP_SIZE) {
        if (interaction.mode.includes('n')) top = bottom - MIN_CROP_SIZE;
        else bottom = top + MIN_CROP_SIZE;
      }

      return {
        x: clamp(left, 0, imageSize.width - MIN_CROP_SIZE),
        y: clamp(top, 0, imageSize.height - MIN_CROP_SIZE),
        width: clamp(right - left, MIN_CROP_SIZE, imageSize.width),
        height: clamp(bottom - top, MIN_CROP_SIZE, imageSize.height),
      };
    },
    [displayScale, imageSize],
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const nextCrop = getCropFromPointerMove(event);
      if (nextCrop) setCrop(nextCrop);
    };

    const handlePointerUp = () => {
      interactionRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [getCropFromPointerMove]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const interaction = transformInteractionRef.current;
      if (!interaction) return;

      if (interaction.mode === 'move') {
        const maxOffset = outputSize / 2;

        setPositionX(
          clamp(
            Math.round(
              interaction.startPositionX +
                (event.clientX - interaction.startX) * interaction.canvasScale,
            ),
            -maxOffset,
            maxOffset,
          ),
        );
        setPositionY(
          clamp(
            Math.round(
              interaction.startPositionY +
                (event.clientY - interaction.startY) * interaction.canvasScale,
            ),
            -maxOffset,
            maxOffset,
          ),
        );
        return;
      }

      const currentAngle =
        (Math.atan2(
          event.clientY - interaction.centerY,
          event.clientX - interaction.centerX,
        ) *
          180) /
        Math.PI;

      setRotation(
        normalizeRotation(
          interaction.startRotation + currentAngle - interaction.startAngle,
        ),
      );
    };

    const handlePointerUp = () => {
      transformInteractionRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [outputSize]);

  const startCropInteraction = (
    event: React.PointerEvent,
    mode: CropInteractionMode,
  ) => {
    if (!activeCrop) return;

    event.preventDefault();
    event.stopPropagation();
    interactionRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startCrop: activeCrop,
    };
  };

  const startTransformInteraction = (
    event: React.PointerEvent<HTMLElement>,
    mode: TransformInteractionMode,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    event.preventDefault();
    event.stopPropagation();
    transformInteractionRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startPositionX: positionX,
      startPositionY: positionY,
      startRotation: rotation,
      startAngle:
        (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) /
        Math.PI,
      centerX,
      centerY,
      canvasScale: outputSize / rect.width,
    };
  };

  const controlsDisabled = cropMode;

  return (
    <section
      className={['profile-editor', className].filter(Boolean).join(' ')}
    >
      <div className="profile-editor-header">
        <div>
          <h2>Profile Image Editor</h2>
          <p>
            Crop, tune, filter, scale, rotate, and position an avatar image.
          </p>
        </div>
        <div className="profile-editor-actions">
          <input
            ref={fileInputRef}
            className="profile-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            Upload
          </button>
          <button type="button" onClick={handleDownload} disabled={cropMode}>
            Download
          </button>
        </div>
      </div>

      <div className="profile-editor-layout">
        <div className="profile-preview-column">
          <div className="profile-stage" aria-busy={isRendering}>
            {cropMode ? (
              <div className="profile-crop-frame">
                <img
                  ref={cropImageRef}
                  src={source}
                  alt="Crop source"
                  onLoad={syncDisplaySize}
                  draggable={false}
                />
                {cropOverlayStyle ? (
                  <div
                    className="profile-crop-overlay"
                    style={cropOverlayStyle}
                    onPointerDown={(event) =>
                      startCropInteraction(event, 'move')
                    }
                  >
                    {HANDLES.map((handle) => (
                      <span
                        key={handle}
                        className={`profile-crop-handle handle-${handle}`}
                        onPointerDown={(event) =>
                          startCropInteraction(event, handle)
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="profile-transform-frame">
                <canvas
                  ref={canvasRef}
                  className="profile-output-canvas"
                  aria-label="Edited profile image preview"
                />
                <div
                  className="profile-transform-selector"
                  onPointerDown={(event) =>
                    startTransformInteraction(event, 'move')
                  }
                  role="group"
                  aria-label="Position and rotate image"
                >
                  <span className="profile-transform-center-knob" />
                  <span className="profile-transform-rotate-arm" />
                  <button
                    type="button"
                    className="profile-transform-rotate-knob"
                    aria-label="Rotate image"
                    title={`Rotate ${rotation} degrees`}
                    onPointerDown={(event) =>
                      startTransformInteraction(event, 'rotate')
                    }
                  />
                </div>
              </div>
            )}
            {isRendering && !cropMode ? (
              <span className="profile-rendering-label">Rendering...</span>
            ) : null}
          </div>

          {error ? <p className="profile-error">{error}</p> : null}

          <div className="profile-filter-strip" aria-label="Filter previews">
            {thumbnailPreviews.map((preview) => (
              <button
                key={preview.filter}
                type="button"
                className={preview.filter === filter ? 'active' : ''}
                onClick={() => setFilter(preview.filter)}
                disabled={cropMode}
              >
                <img src={preview.src} alt="" />
                <span>{preview.label}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="profile-controls">
          <div className="profile-control-row">
            <span>Crop</span>
            <div className="profile-segmented-actions">
              {cropMode ? (
                <button type="button" onClick={() => setCropMode(false)}>
                  Done
                </button>
              ) : (
                <button type="button" onClick={startCropMode}>
                  Crop
                </button>
              )}
              <button type="button" onClick={resetCrop} disabled={!activeCrop}>
                Reset
              </button>
            </div>
          </div>

          <label className="profile-slider">
            <span>
              Brightness <strong>{brightness}</strong>
            </span>
            <input
              type="range"
              min="-100"
              max="100"
              value={brightness}
              onChange={(event) => setBrightness(Number(event.target.value))}
              disabled={controlsDisabled}
            />
          </label>

          <label className="profile-slider">
            <span>
              Contrast <strong>{contrast}</strong>
            </span>
            <input
              type="range"
              min="-100"
              max="100"
              value={contrast}
              onChange={(event) => setContrast(Number(event.target.value))}
              disabled={controlsDisabled}
            />
          </label>

          <label className="profile-slider">
            <span>
              Scale <strong>{scale.toFixed(2)}x</strong>
            </span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.01"
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              disabled={controlsDisabled}
            />
          </label>

          <button
            type="button"
            className="profile-reset-edits"
            onClick={() => {
              setBrightness(0);
              setContrast(0);
              setScale(1);
              setRotation(0);
              setPositionX(0);
              setPositionY(0);
              setFilter('none');
            }}
            disabled={controlsDisabled}
          >
            Reset edits
          </button>
        </aside>
      </div>
    </section>
  );
};
