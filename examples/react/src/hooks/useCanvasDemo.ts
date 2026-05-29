import { useCallback, useMemo, useState } from 'react';
import { useLumina } from '@gks101/luminajs/react';
import type { Lumina } from '../../../../src/';
import {
  ASCII_RESIZE_CONFIG,
  THUMBNAIL_RESIZE_CONFIG,
} from '../constants/demoOptions';
import type {
  CanvasDemoState,
  FilterType,
  ImageAdjustmentActions,
  ImageAdjustmentState,
  LuminaImagePayload,
  TransformUtilityActions,
  TransformUtilityState,
} from '../types/demo';
import { generateCanvasCode } from '../utils/codeGeneration';

const downloadDataUrl = (href: string, filename: string) => {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
};

export const useCanvasDemo = () => {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [filterType, setFilterType] = useState<FilterType>('none');
  const [watermarkText, setWatermarkText] = useState('LuminaJS');
  const [watermarkX, setWatermarkX] = useState(20);
  const [watermarkY, setWatermarkY] = useState(60);
  const [watermarkColor, setWatermarkColor] = useState('rgba(255,255,255,0.7)');
  const [watermarkSize, setWatermarkSize] = useState(40);
  const [watermarkFont, setWatermarkFont] = useState('Inter');
  const [bgBlur, setBgBlur] = useState(false);
  const [showAscii, setShowAscii] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState('');
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [isResized, setIsResized] = useState(false);
  const [isCropped, setIsCropped] = useState(false);
  const [cropX, setCropX] = useState(100);
  const [cropY, setCropY] = useState(100);
  const [cropW, setCropW] = useState(400);
  const [cropH, setCropH] = useState(400);

  const asciiOperation = useCallback((chain: Lumina) => chain.ascii(), []);

  const { result: asciiText, loading: asciiLoading } = useLumina<string>({
    source: './sample.png',
    resize: ASCII_RESIZE_CONFIG,
    operations: asciiOperation,
    outputType: undefined,
  });

  const { result: thumbnail, getImage: getThumbnailImage } = useLumina<string>({
    source: '/sample.png',
    resize: THUMBNAIL_RESIZE_CONFIG,
    grayscale: true,
    outputType: 'dataUrl',
  });

  const state = useMemo<CanvasDemoState>(
    () => ({
      brightness,
      contrast,
      filterType,
      watermarkText,
      watermarkX,
      watermarkY,
      watermarkColor,
      watermarkSize,
      watermarkFont,
      bgBlur,
      showAscii,
      canvasDataUrl,
      width,
      height,
      isResized,
      isCropped,
      cropX,
      cropY,
      cropW,
      cropH,
    }),
    [
      bgBlur,
      brightness,
      canvasDataUrl,
      contrast,
      cropH,
      cropW,
      cropX,
      cropY,
      filterType,
      height,
      isCropped,
      isResized,
      showAscii,
      watermarkColor,
      watermarkFont,
      watermarkSize,
      watermarkText,
      watermarkX,
      watermarkY,
      width,
    ],
  );

  const imageAdjustmentState = useMemo<ImageAdjustmentState>(
    () => ({ brightness, contrast, filterType }),
    [brightness, contrast, filterType],
  );

  const imageAdjustmentActions = useMemo<ImageAdjustmentActions>(
    () => ({ setBrightness, setContrast, setFilterType }),
    [],
  );

  const transformUtilityState = useMemo<TransformUtilityState>(
    () => ({
      width,
      height,
      isResized,
      isCropped,
      cropX,
      cropY,
      cropW,
      cropH,
      watermarkText,
      watermarkX,
      watermarkY,
      watermarkColor,
      watermarkSize,
      watermarkFont,
      bgBlur,
    }),
    [
      bgBlur,
      cropH,
      cropW,
      cropX,
      cropY,
      height,
      isCropped,
      isResized,
      watermarkColor,
      watermarkFont,
      watermarkSize,
      watermarkText,
      watermarkX,
      watermarkY,
      width,
    ],
  );

  const transformUtilityActions = useMemo<TransformUtilityActions>(
    () => ({
      setWidth,
      setHeight,
      setIsResized,
      setIsCropped,
      setCropX,
      setCropY,
      setCropW,
      setCropH,
      setWatermarkText,
      setWatermarkX,
      setWatermarkY,
      setWatermarkColor,
      setWatermarkSize,
      setWatermarkFont,
      setBgBlur,
    }),
    [],
  );

  const handleGetCanvasImage = useCallback((data: LuminaImagePayload) => {
    if (typeof data === 'string') {
      setCanvasDataUrl(data);
    }
  }, []);

  const handleDownloadMain = useCallback(() => {
    if (canvasDataUrl) {
      downloadDataUrl(canvasDataUrl, 'lumina-processed.png');
    }
  }, [canvasDataUrl]);

  const handleDownloadThumbnail = useCallback(async () => {
    const data = await getThumbnailImage();
    if (data) {
      downloadDataUrl(data, 'lumina-thumbnail.png');
    }
  }, [getThumbnailImage]);

  const generatedCanvasCode = useMemo(() => generateCanvasCode(state), [state]);

  return {
    state,
    imageAdjustmentState,
    imageAdjustmentActions,
    transformUtilityState,
    transformUtilityActions,
    asciiText,
    asciiLoading,
    thumbnail,
    generatedCanvasCode,
    setShowAscii,
    handleGetCanvasImage,
    handleDownloadMain,
    handleDownloadThumbnail,
  };
};
