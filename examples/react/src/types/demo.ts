import type { CropArea } from '@gks101/luminajs/react';
import type { Dispatch, SetStateAction } from 'react';

export type FilterType =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'blur'
  | 'sharpen'
  | 'emboss'
  | 'edge';

export interface ImageAdjustmentState {
  brightness: number;
  contrast: number;
  filterType: FilterType;
}

export interface ImageAdjustmentActions {
  setBrightness: Dispatch<SetStateAction<number>>;
  setContrast: Dispatch<SetStateAction<number>>;
  setFilterType: Dispatch<SetStateAction<FilterType>>;
}

export interface TransformUtilityState {
  width: number;
  height: number;
  isResized: boolean;
  isCropped: boolean;
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  watermarkText: string;
  watermarkX: number;
  watermarkY: number;
  watermarkColor: string;
  watermarkSize: number;
  watermarkFont: string;
  bgBlur: boolean;
}

export interface TransformUtilityActions {
  setWidth: Dispatch<SetStateAction<number>>;
  setHeight: Dispatch<SetStateAction<number>>;
  setIsResized: Dispatch<SetStateAction<boolean>>;
  setIsCropped: Dispatch<SetStateAction<boolean>>;
  setCropX: Dispatch<SetStateAction<number>>;
  setCropY: Dispatch<SetStateAction<number>>;
  setCropW: Dispatch<SetStateAction<number>>;
  setCropH: Dispatch<SetStateAction<number>>;
  setWatermarkText: Dispatch<SetStateAction<string>>;
  setWatermarkX: Dispatch<SetStateAction<number>>;
  setWatermarkY: Dispatch<SetStateAction<number>>;
  setWatermarkColor: Dispatch<SetStateAction<string>>;
  setWatermarkSize: Dispatch<SetStateAction<number>>;
  setWatermarkFont: Dispatch<SetStateAction<string>>;
  setBgBlur: Dispatch<SetStateAction<boolean>>;
}

export interface CanvasDemoState
  extends ImageAdjustmentState, TransformUtilityState {
  showAscii: boolean;
  canvasDataUrl: string;
}

export interface InteractiveCropState {
  status: string;
  selection: CropArea | null;
  dataUrl: string;
}

export type LuminaImagePayload = string | Blob | ImageData | HTMLCanvasElement;
