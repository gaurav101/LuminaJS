import { AppHeader } from './components/AppHeader';
import { ImageAdjustmentPanel } from './components/controls/ImageAdjustmentPanel';
import { TransformUtilitiesPanel } from './components/controls/TransformUtilitiesPanel';
import { CanvasDemoSection } from './components/demo/CanvasDemoSection';
import { CropperExamples } from './components/demo/CropperExamples';
import { ProfileImageEditor } from './components/profile/ProfileImageEditor';
import { useCanvasDemo } from './hooks/useCanvasDemo';
import { useCodeClipboard } from './hooks/useCodeClipboard';
import { useInteractiveCropDemo } from './hooks/useInteractiveCropDemo';
import './App.css';

function App() {
  const canvasDemo = useCanvasDemo();
  const { copiedPanel, copyCode } = useCodeClipboard();
  const interactiveCropDemo = useInteractiveCropDemo();

  return (
    <div className="demo-container">
      <AppHeader />

      <ProfileImageEditor />

      <main className="demo-grid">
        <ImageAdjustmentPanel
          state={canvasDemo.imageAdjustmentState}
          actions={canvasDemo.imageAdjustmentActions}
        />

        <CanvasDemoSection
          state={canvasDemo.state}
          asciiText={canvasDemo.asciiText}
          asciiLoading={canvasDemo.asciiLoading}
          thumbnail={canvasDemo.thumbnail}
          generatedCanvasCode={canvasDemo.generatedCanvasCode}
          copiedPanel={copiedPanel}
          onCopyCode={copyCode}
          onToggleAscii={canvasDemo.setShowAscii}
          onDownloadMain={canvasDemo.handleDownloadMain}
          onDownloadThumbnail={canvasDemo.handleDownloadThumbnail}
          onGetCanvasImage={canvasDemo.handleGetCanvasImage}
        />

        <TransformUtilitiesPanel
          state={canvasDemo.transformUtilityState}
          actions={canvasDemo.transformUtilityActions}
        />

        <CropperExamples
          interactiveCrop={interactiveCropDemo.interactiveCrop}
          copiedPanel={copiedPanel}
          onCopyCode={copyCode}
          onCropChange={interactiveCropDemo.handleCropChange}
          onCropApply={interactiveCropDemo.handleCropApply}
          onCropReset={interactiveCropDemo.handleCropReset}
          onCropImage={interactiveCropDemo.handleCropImage}
        />
      </main>
    </div>
  );
}

export default App;
