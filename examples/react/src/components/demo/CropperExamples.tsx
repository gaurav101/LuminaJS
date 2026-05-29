import { ImageCropper, LuminaCanvas } from '@gks101/luminajs/react';
import type { CropArea } from '@gks101/luminajs/react';
import {
  INTERACTIVE_CANVAS_CROP_CODE,
  THEMED_CROPPER_CODE,
} from '../../constants/demoCode';
import type {
  InteractiveCropState,
  LuminaImagePayload,
} from '../../types/demo';
import { CodePanel } from '../CodePanel';

interface CropperExamplesProps {
  interactiveCrop: InteractiveCropState;
  copiedPanel: string | null;
  onCopyCode: (panelId: string, code: string) => void;
  onCropChange: (crop: CropArea) => void;
  onCropApply: (crop: CropArea) => false | void;
  onCropReset: () => void;
  onCropImage: (data: LuminaImagePayload) => void;
}

export const CropperExamples = ({
  interactiveCrop,
  copiedPanel,
  onCopyCode,
  onCropChange,
  onCropApply,
  onCropReset,
  onCropImage,
}: CropperExamplesProps) => (
  <section id="cropping-tool">
    <div className="preview-panel">
      <div className="card cropper-demo-card">
        <h3>LuminaCanvas - Interactive Crop</h3>
        <p className="cropper-demo-text">
          Select, reposition, resize, apply, and reset a crop directly from
          LuminaCanvas.
        </p>

        <div className="interactive-crop-layout">
          <div className="interactive-crop-stage">
            <LuminaCanvas
              source="sample.png"
              interactiveCrop
              cropAspectRatio={1}
              outputType="dataUrl"
              getImage={onCropImage}
              onCropChange={onCropChange}
              onCropApply={onCropApply}
              onCropReset={onCropReset}
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
              cropAriaDescription="Use arrow keys to move the crop. Hold Shift for larger steps. Hold Alt with arrows to resize. Press Enter to confirm and Escape to clear."
              cropKeyboardStep={2}
              cropKeyboardStepLarge={18}
              className="interactive-canvas-output"
            />
          </div>

          <div className="interactive-crop-result">
            <h4>Crop State</h4>
            <p>{interactiveCrop.status}</p>
            {interactiveCrop.selection && (
              <dl className="crop-metrics">
                <div>
                  <dt>X</dt>
                  <dd>{Math.round(interactiveCrop.selection.x)}</dd>
                </div>
                <div>
                  <dt>Y</dt>
                  <dd>{Math.round(interactiveCrop.selection.y)}</dd>
                </div>
                <div>
                  <dt>W</dt>
                  <dd>{Math.round(interactiveCrop.selection.width)}</dd>
                </div>
                <div>
                  <dt>H</dt>
                  <dd>{Math.round(interactiveCrop.selection.height)}</dd>
                </div>
              </dl>
            )}
            {interactiveCrop.dataUrl && (
              <img
                src={interactiveCrop.dataUrl}
                alt="Applied LuminaCanvas crop preview"
              />
            )}
          </div>
        </div>

        <CodePanel
          title="Show Interactive Crop JSX"
          code={INTERACTIVE_CANVAS_CROP_CODE}
          panelId="interactive-crop"
          copiedPanel={copiedPanel}
          height="420px"
          ariaLabel="LuminaCanvas interactive crop JSX code"
          onCopy={onCopyCode}
        />
      </div>
    </div>

    <div className="preview-panel">
      <div className="card cropper-demo-card mt-20">
        <h3>ImageCropper - Default</h3>
        <p className="cropper-demo-text">
          Baseline crop workflow with keyboard support and explicit Apply.
        </p>
        <ImageCropper src="sample.png" allowResize={true} />
      </div>
    </div>

    <div className="preview-panel">
      <div className="card cropper-demo-card mt-20">
        <h3>ImageCropper - Themed / Production Customization</h3>
        <p className="cropper-demo-text">
          Demonstrates class/style hooks for controls, handles, overlay,
          keyboard behavior, and error display.
        </p>

        <ImageCropper
          src="sample.png"
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
        />

        <CodePanel
          title="Show Customization JSX"
          code={THEMED_CROPPER_CODE}
          panelId="cropper"
          copiedPanel={copiedPanel}
          height="360px"
          ariaLabel="ImageCropper customization JSX code"
          onCopy={onCopyCode}
        />
      </div>
    </div>
  </section>
);
