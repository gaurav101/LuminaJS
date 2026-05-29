import type { CanvasDemoState, LuminaImagePayload } from '../../types/demo';
import { CanvasPreview } from './CanvasPreview';
import { ThumbnailCard } from './ThumbnailCard';

interface CanvasDemoSectionProps {
  state: CanvasDemoState;
  asciiText: string | undefined;
  asciiLoading: boolean;
  thumbnail: string | undefined;
  generatedCanvasCode: string;
  copiedPanel: string | null;
  onCopyCode: (panelId: string, code: string) => void;
  onToggleAscii: (showAscii: boolean) => void;
  onDownloadMain: () => void;
  onDownloadThumbnail: () => void;
  onGetCanvasImage: (data: LuminaImagePayload) => void;
}

export const CanvasDemoSection = ({
  state,
  asciiText,
  asciiLoading,
  thumbnail,
  generatedCanvasCode,
  copiedPanel,
  onCopyCode,
  onToggleAscii,
  onDownloadMain,
  onDownloadThumbnail,
  onGetCanvasImage,
}: CanvasDemoSectionProps) => (
  <section id="full-demo" className="demo-center">
    <section className="preview-panel">
      <CanvasPreview
        state={state}
        asciiText={asciiText}
        asciiLoading={asciiLoading}
        generatedCanvasCode={generatedCanvasCode}
        copiedPanel={copiedPanel}
        onCopyCode={onCopyCode}
        onToggleAscii={onToggleAscii}
        onDownloadMain={onDownloadMain}
        onGetCanvasImage={onGetCanvasImage}
      />

      <ThumbnailCard
        thumbnail={thumbnail}
        onDownloadThumbnail={onDownloadThumbnail}
      />
    </section>
  </section>
);
