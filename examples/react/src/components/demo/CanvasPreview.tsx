import { LuminaCanvas } from '@gks101/luminajs/react';
import type { CanvasDemoState, LuminaImagePayload } from '../../types/demo';
import { CodePanel } from '../CodePanel';

interface CanvasPreviewProps {
  state: CanvasDemoState;
  asciiText: string | undefined;
  asciiLoading: boolean;
  generatedCanvasCode: string;
  copiedPanel: string | null;
  onCopyCode: (panelId: string, code: string) => void;
  onToggleAscii: (showAscii: boolean) => void;
  onDownloadMain: () => void;
  onGetCanvasImage: (data: LuminaImagePayload) => void;
}

export const CanvasPreview = ({
  state,
  asciiText,
  asciiLoading,
  generatedCanvasCode,
  copiedPanel,
  onCopyCode,
  onToggleAscii,
  onDownloadMain,
  onGetCanvasImage,
}: CanvasPreviewProps) => (
  <div className="card">
    <div className="card-header">
      <h3>{state.showAscii ? 'ASCII Output' : 'Live Canvas Output'}</h3>
      <div className="preview-actions">
        {!state.showAscii && (
          <button
            className="toggle-btn"
            onClick={onDownloadMain}
            disabled={!state.canvasDataUrl}
          >
            Download
          </button>
        )}
        <button
          className="toggle-btn"
          onClick={() => onToggleAscii(!state.showAscii)}
        >
          {state.showAscii ? 'Show Image' : 'Show ASCII'}
        </button>
      </div>
    </div>

    <div className="display-area">
      {state.showAscii ? (
        <pre className="ascii-box">
          {asciiLoading ? 'Generating ASCII...' : asciiText}
        </pre>
      ) : (
        <LuminaCanvas
          source="/sample.png"
          className="main-canvas"
          brightness={state.brightness}
          contrast={state.contrast}
          resize={
            state.isResized
              ? { width: state.width, height: state.height }
              : undefined
          }
          crop={
            state.isCropped
              ? {
                  x: state.cropX,
                  y: state.cropY,
                  width: state.cropW,
                  height: state.cropH,
                }
              : undefined
          }
          grayscale={state.filterType === 'grayscale'}
          sepia={state.filterType === 'sepia'}
          gaussianBlur={state.filterType === 'blur' ? 5 : undefined}
          sharpen={state.filterType === 'sharpen'}
          emboss={state.filterType === 'emboss'}
          edgeDetection={state.filterType === 'edge'}
          backgroundBlur={
            state.bgBlur
              ? { sigma: 6, focusRadius: 150, falloff: 200 }
              : undefined
          }
          watermark={
            state.watermarkText
              ? {
                  text: state.watermarkText,
                  options: {
                    x: state.watermarkX,
                    y: state.watermarkY,
                    fontSize: state.watermarkSize,
                    fontFace: state.watermarkFont,
                    color: state.watermarkColor,
                  },
                }
              : undefined
          }
          outputType="dataUrl"
          getImage={onGetCanvasImage}
        />
      )}
    </div>

    <CodePanel
      title="Show Generated JSX"
      code={generatedCanvasCode}
      panelId="canvas"
      copiedPanel={copiedPanel}
      height="280px"
      ariaLabel="Generated LuminaCanvas JSX code"
      onCopy={onCopyCode}
    />
  </div>
);
