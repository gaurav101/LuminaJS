export const THEMED_CROPPER_CODE = `<ImageCropper
  src="./sample.png"
  aspectRatio={16 / 9}
  className="cropper-shell"
  containerClassName="cropper-stage"
  buttonContainerClassName="cropper-controls"
  applyButtonClassName="cropper-btn cropper-btn-primary"
  resetButtonClassName="cropper-btn cropper-btn-secondary"
  processingOverlayClassName="cropper-processing"
  errorClassName="cropper-error"
  errorTextClassName="cropper-error-text"
  selectorSelectionClassName="cropper-selection"
  selectorHandleClassName="cropper-handle"
  selectorControlsContainerClassName="cropper-controls-anchor"
  selectorLineColor="#3b82f6"
  selectorOverlayOpacity={0.5}
  selectorAriaLabel="Avatar crop area"
  selectorAriaDescription="Use arrow keys to move the selection, Shift for larger movement, Alt with arrows to resize, Enter to confirm, Escape to clear."
  applyButtonAriaLabel="Apply avatar crop"
  resetButtonAriaLabel="Reset avatar crop"
  keyboardStep={2}
  keyboardStepLarge={16}
  processingLabel="Applying crop..."
/>`;

export const INTERACTIVE_CANVAS_CROP_CODE = `<LuminaCanvas
  source="./sample.png"
  interactiveCrop
  cropAspectRatio={1}
  outputType="dataUrl"
  getImage={handleInteractiveCropImage}
  onCropChange={handleInteractiveCropChange}
  onCropApply={handleInteractiveCropApply}
  onCropReset={handleInteractiveCropReset}
  cropContainerClassName="canvas-crop-shell"
  cropSelectorImageClassName="canvas-crop-source"
  cropButtonContainerClassName="cropper-controls"
  cropApplyButtonClassName="cropper-btn cropper-btn-primary"
  cropResetButtonClassName="cropper-btn cropper-btn-secondary"
  cropSelectionClassName="cropper-selection"
  cropHandleClassName="cropper-handle"
  cropLineColor="#38bdf8"
  cropOverlayOpacity={0.54}
  cropAriaLabel="LuminaCanvas interactive crop area"
  cropKeyboardStep={2}
  cropKeyboardStepLarge={18}
/>`;
