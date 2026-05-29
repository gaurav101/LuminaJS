import { useCallback, useState } from 'react';
import type { CropArea } from '@gks101/luminajs/react';
import type { InteractiveCropState, LuminaImagePayload } from '../types/demo';

export const useInteractiveCropDemo = () => {
  const [state, setState] = useState<InteractiveCropState>({
    status: 'Select an area, then apply the crop.',
    selection: null,
    dataUrl: '',
  });

  const handleCropChange = useCallback((crop: CropArea) => {
    setState((current) => ({
      ...current,
      selection: crop,
      status: `Selection ${Math.round(crop.width)} x ${Math.round(
        crop.height,
      )} at ${Math.round(crop.x)}, ${Math.round(crop.y)}`,
    }));
  }, []);

  const handleCropApply = useCallback((crop: CropArea) => {
    if (crop.width < 32 || crop.height < 32) {
      setState((current) => ({
        ...current,
        status: 'Select at least 32 x 32 pixels.',
      }));
      return false;
    }

    setState((current) => ({
      ...current,
      status: 'Applying crop through LuminaCanvas...',
    }));
  }, []);

  const handleCropReset = useCallback(() => {
    setState({
      status: 'Crop selection reset.',
      selection: null,
      dataUrl: '',
    });
  }, []);

  const handleCropImage = useCallback((data: LuminaImagePayload) => {
    if (typeof data === 'string') {
      setState((current) => ({
        ...current,
        dataUrl: data,
        status: `Applied crop exported as ${Math.round(
          data.length / 1024,
        )} KB data URL.`,
      }));
    }
  }, []);

  return {
    interactiveCrop: state,
    handleCropChange,
    handleCropApply,
    handleCropReset,
    handleCropImage,
  };
};
