import { useCallback, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ImageAreaSelector,
  ImageCropper,
  LuminaCanvas,
  useLumina,
  type CropArea,
  type ImageEditingOptions,
} from '@gks101/luminajs/react';
import type { Lumina } from '@gks101/luminajs';

const SAMPLE_IMAGE = './sample.png';
const ASCII_SAMPLE = './lumina.png';
const meta = {
  title: 'LuminaJS React/API Overview',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Storybook coverage for the React exports in src/react: LuminaCanvas, useLumina, ImageAreaSelector, and ImageCropper. The stories also document the shared image editing options used by the component and hook APIs.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<Record<string, never>>;
type LuminaCanvasAdjustmentArgs = {
  brightness: number;
  contrast: number;
  grayscale: boolean;
  sepia: boolean;
  gaussianBlur: number;
  sharpen: boolean;
  emboss: boolean;
  edgeDetection: boolean;
};
type AreaSelectorArgs = {
  aspect?: number;
  lineColor: string;
  overlayOpacity: number;
  allowResize: boolean;
};
type CropperArgs = {
  aspectRatio?: number;
  outputFormat: 'blob' | 'dataUrl';
  buttonPosition:
    | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  allowReset: boolean;
  allowResize: boolean;
  showPreview: boolean;
};
type UseLuminaLiveArgs = {
  brightness: number;
  contrast: number;
  gaussianBlur: number;
  sepia: boolean;
  sharpen: boolean;
};
type CanvasOutputType = 'canvas' | 'dataUrl' | 'blob' | 'imageData';
type CanvasOutputArgs = {
  outputType: CanvasOutputType;
};
type CanvasInteractiveCropArgs = {
  cropAspectRatio?: number;
  allowCropResize: boolean;
  cropButtonPosition:
    | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  cropKeyboardStep: number;
  cropKeyboardStepLarge: number;
};

function StoryShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="lumina-story-shell">
      <div className="lumina-story-stack">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

function StoryLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <a
      className="lumina-story-link"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

function ResultLabel({ children }: { children: React.ReactNode }) {
  return <div className="lumina-story-result">{children}</div>;
}

function FilterCard({
  title,
  description,
  options = {},
}: {
  title: string;
  description: string;
  options?: ImageEditingOptions;
}) {
  return (
    <div className="lumina-story-filter-card">
      <LuminaCanvas
        className="lumina-story-canvas lumina-story-filter-canvas"
        source={SAMPLE_IMAGE}
        resize={{ width: 260, height: 170 }}
        {...options}
      />
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function UseLuminaLiveDemo({
  brightness,
  contrast,
  gaussianBlur,
  sepia,
  sharpen,
}: UseLuminaLiveArgs) {
  const resize = useMemo(() => ({ width: 360, height: 240 }), []);
  const operations = useCallback(
    (chain: Lumina) => {
      let next = chain;
      if (sharpen) next = next.sharpen();
      return next.watermark('Live hook', {
        x: 16,
        y: 34,
        fontSize: 22,
        color: 'rgba(255,255,255,0.78)',
      });
    },
    [sharpen],
  );
  const { result, loading, error } = useLumina<string>({
    source: SAMPLE_IMAGE,
    resize,
    brightness,
    contrast,
    gaussianBlur,
    sepia,
    operations,
    deps: [brightness, contrast, gaussianBlur, sepia, sharpen],
    outputType: 'dataUrl',
  });

  return (
    <StoryShell
      title="useLumina Live Controls"
      description="Story args update the hook dependency list so controls reprocess the same source through the React hook."
    >
      <div className="lumina-story-panel lumina-story-stack">
        <ResultLabel>
          {loading && 'Processing image...'}
          {error && error.message}
          {!loading &&
            !error &&
            `brightness ${brightness}, contrast ${contrast}, gaussian blur ${gaussianBlur}`}
        </ResultLabel>
        {result && (
          <img
            className="lumina-story-image-preview wide"
            src={result}
            alt="Live useLumina output"
          />
        )}
      </div>
    </StoryShell>
  );
}

function LuminaCanvasOutputDemo({ outputType }: CanvasOutputArgs) {
  const [result, setResult] = useState<string>('Waiting for canvas render...');

  const handleImage = useCallback(
    (data: string | Blob | ImageData | HTMLCanvasElement) => {
      if (typeof data === 'string') {
        setResult(`Data URL length: ${data.length}`);
        return;
      }

      if (data instanceof Blob) {
        setResult(`Blob: ${data.type || 'image/png'}, ${data.size} bytes`);
        return;
      }

      if (data instanceof ImageData) {
        setResult(
          `ImageData: ${data.width} x ${data.height}, ${data.data.length} values`,
        );
        return;
      }

      setResult(`Canvas: ${data.width} x ${data.height}`);
    },
    [],
  );

  return (
    <StoryShell
      title="LuminaCanvas Output Types"
      description="getImage can receive the rendered canvas, a Data URL, a Blob, or raw ImageData."
    >
      <div className="lumina-story-panel lumina-story-stack">
        <LuminaCanvas
          className="lumina-story-canvas"
          source={SAMPLE_IMAGE}
          resize={{ width: 420, height: 280 }}
          brightness={8}
          contrast={12}
          outputType={outputType}
          getImage={handleImage}
        />
        <ResultLabel>{result}</ResultLabel>
      </div>
    </StoryShell>
  );
}

function LuminaCanvasInteractiveCropDemo({
  cropAspectRatio,
  allowCropResize,
  cropButtonPosition,
  cropKeyboardStep,
  cropKeyboardStepLarge,
}: CanvasInteractiveCropArgs) {
  const [result, setResult] = useState<string>('No crop applied yet');
  const [selectedCrop, setSelectedCrop] = useState<CropArea | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleImage = useCallback(
    (data: string | Blob | ImageData | HTMLCanvasElement) => {
      if (typeof data === 'string') {
        setPreviewUrl(data);
        setResult(`Data URL length: ${data.length}`);
        return;
      }

      if (data instanceof Blob) {
        setResult(`Blob size: ${data.size} bytes`);
        return;
      }

      if (data instanceof ImageData) {
        setResult(`ImageData: ${data.width} x ${data.height}`);
        return;
      }

      setResult(`Canvas: ${data.width} x ${data.height}`);
    },
    [],
  );

  const handleCropChange = useCallback((crop: CropArea) => {
    setSelectedCrop(crop);
    setResult(
      `Selected ${Math.round(crop.width)} x ${Math.round(crop.height)}`,
    );
  }, []);

  const handleCropApply = useCallback((crop: CropArea) => {
    if (crop.width < 32 || crop.height < 32) {
      setResult('Select at least 32 x 32 pixels.');
      return false;
    }

    setResult('Applying crop...');
  }, []);

  const handleCropReset = useCallback(() => {
    setSelectedCrop(null);
    setPreviewUrl('');
    setResult('No crop applied yet');
  }, []);

  return (
    <StoryShell
      title="LuminaCanvas Interactive Crop"
      description="LuminaCanvas can now collect a user-selected crop before rendering the processed canvas output."
    >
      <div className="lumina-story-grid">
        <div className="lumina-story-panel">
          <LuminaCanvas
            source={SAMPLE_IMAGE}
            interactiveCrop
            cropAspectRatio={cropAspectRatio}
            allowCropResize={allowCropResize}
            cropButtonPosition={cropButtonPosition}
            cropKeyboardStep={cropKeyboardStep}
            cropKeyboardStepLarge={cropKeyboardStepLarge}
            outputType="dataUrl"
            getImage={handleImage}
            onCropChange={handleCropChange}
            onCropApply={handleCropApply}
            onCropReset={handleCropReset}
            cropContainerClassName="lumina-story-crop-shell"
            cropSelectorImageClassName="lumina-story-crop-source"
            cropButtonContainerClassName="lumina-story-crop-controls"
            cropApplyButtonClassName="lumina-story-button"
            cropResetButtonClassName="lumina-story-button secondary"
            cropSelectionClassName="lumina-story-crop-selection"
            cropHandleClassName="lumina-story-crop-handle"
            cropLineColor="#1c64d1"
            cropOverlayOpacity={0.55}
            cropAriaLabel="Storybook LuminaCanvas crop area"
            cropAriaDescription="Use arrow keys to move the crop. Hold Shift for larger steps. Hold Alt with arrows to resize. Press Enter to confirm and Escape to clear."
            className="lumina-story-canvas"
          />
        </div>
        <div className="lumina-story-panel lumina-story-stack">
          <ResultLabel>{result}</ResultLabel>
          {selectedCrop && (
            <div className="lumina-story-note">
              x {Math.round(selectedCrop.x)}, y {Math.round(selectedCrop.y)}, w{' '}
              {Math.round(selectedCrop.width)}, h{' '}
              {Math.round(selectedCrop.height)}
            </div>
          )}
          {previewUrl && (
            <img
              className="lumina-story-image-preview"
              src={previewUrl}
              alt="LuminaCanvas interactive crop output"
            />
          )}
        </div>
      </div>
    </StoryShell>
  );
}

function UseLuminaDataUrlDemo() {
  const resize = useMemo(() => ({ width: 260, height: 180 }), []);
  const operations = useCallback(
    (chain: Lumina) => chain.sepia().watermark('useLumina', { x: 16, y: 34 }),
    [],
  );

  const { result, loading, error, getImage } = useLumina<string>({
    source: SAMPLE_IMAGE,
    resize,
    brightness: 8,
    contrast: 12,
    operations,
    outputType: 'dataUrl',
  });
  const [blobSize, setBlobSize] = useState<string>('Blob not requested yet');

  const requestBlob = async () => {
    const blob = (await getImage('blob')) as Blob | null;
    setBlobSize(blob instanceof Blob ? `${blob.size} bytes` : 'No blob');
  };

  return (
    <StoryShell
      title="useLumina Hook"
      description="Processes an image in React state and can imperatively request another output type with getImage."
    >
      <div className="lumina-story-panel lumina-story-stack">
        <div className="lumina-story-row">
          <button className="lumina-story-button" onClick={requestBlob}>
            Request Blob
          </button>
          <ResultLabel>
            {loading && 'Processing image...'}
            {error && error.message}
            {!loading && !error && blobSize}
          </ResultLabel>
        </div>
        {result && (
          <img
            className="lumina-story-image-preview"
            src={result}
            alt="Processed useLumina result"
          />
        )}
      </div>
    </StoryShell>
  );
}

function UseLuminaAsciiDemo() {
  const resize = useMemo(() => ({ width: 80, height: 44 }), []);
  const operations = useCallback((chain: Lumina) => chain.ascii(), []);
  const { result, loading, error } = useLumina<string>({
    source: ASCII_SAMPLE,
    resize,
    operations,
  });

  return (
    <StoryShell
      title="ASCII Output"
      description="The hook can return non-image output when the Lumina chain operation returns text."
    >
      <pre className="lumina-story-pre">
        {loading ? 'Generating ASCII...' : error?.message || result}
      </pre>
    </StoryShell>
  );
}

function ImageAreaSelectorDemo({
  aspect,
  lineColor,
  overlayOpacity,
  allowResize,
}: {
  aspect?: number;
  lineColor: string;
  overlayOpacity: number;
  allowResize: boolean;
}) {
  const [crop, setCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  return (
    <StoryShell
      title="ImageAreaSelector"
      description="Drag on the image to create a crop region. Drag inside the region to move it, or drag a handle to resize it."
    >
      <div className="lumina-story-panel lumina-story-stack">
        <ImageAreaSelector
          src={SAMPLE_IMAGE}
          aspect={aspect}
          lineColor={lineColor}
          overlayOpacity={overlayOpacity}
          allowResize={allowResize}
          onCropChange={setCrop}
          onCropComplete={setCrop}
          overlayControls={({ width, height }) => (
            <span className="lumina-story-chip">
              {Math.round(width)} x {Math.round(height)}
            </span>
          )}
        />
        <ResultLabel>
          x {Math.round(crop.x)}, y {Math.round(crop.y)}, w{' '}
          {Math.round(crop.width)}, h {Math.round(crop.height)}
        </ResultLabel>
      </div>
    </StoryShell>
  );
}

function ImageCropperDemo({
  aspectRatio,
  outputFormat,
  buttonPosition,
  allowReset,
  allowResize,
  showPreview,
}: {
  aspectRatio?: number;
  outputFormat: 'blob' | 'dataUrl';
  buttonPosition:
    | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  allowReset: boolean;
  allowResize: boolean;
  showPreview: boolean;
}) {
  const [result, setResult] = useState<string>('No crop applied yet');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleCropComplete = (croppedImage: Blob | string) => {
    if (typeof croppedImage === 'string') {
      setPreviewUrl(croppedImage);
      setResult(`Data URL length: ${croppedImage.length}`);
      return;
    }

    const url = URL.createObjectURL(croppedImage);
    setPreviewUrl((previousUrl) => {
      if (previousUrl?.startsWith('blob:')) URL.revokeObjectURL(previousUrl);
      return url;
    });
    setResult(`Blob size: ${croppedImage.size} bytes`);
  };

  const handleApply = (crop: CropArea) => {
    if (crop.width < 24 || crop.height < 24) {
      setResult('Select an area at least 24 x 24 pixels.');
      return false;
    }

    setResult('Applying crop...');
  };

  const handleReset = () => {
    setPreviewUrl((previousUrl) => {
      if (previousUrl?.startsWith('blob:')) URL.revokeObjectURL(previousUrl);
      return null;
    });
    setResult('No crop applied yet');
  };

  return (
    <StoryShell
      title="ImageCropper"
      description="Select an area, apply the crop, and inspect the returned Blob or Data URL. showPreview controls whether the cropper swaps to the applied preview internally."
    >
      <div className="lumina-story-grid">
        <div className="lumina-story-panel">
          <ImageCropper
            src={SAMPLE_IMAGE}
            aspectRatio={aspectRatio}
            outputFormat={outputFormat}
            buttonPosition={buttonPosition}
            allowReset={allowReset}
            allowResize={allowResize}
            showPreview={showPreview}
            maxWidth={520}
            maxHeight={360}
            applyButtonLabel="Apply"
            resetButtonLabel="Reset"
            applyButtonAriaLabel="Apply selected Storybook crop"
            resetButtonAriaLabel="Reset Storybook crop selection"
            selectorAriaLabel="Storybook image crop selection"
            selectorAriaDescription="Use arrow keys to move the crop. Hold Shift for larger steps. Hold Alt with arrows to resize. Press Enter to confirm and Escape to clear."
            keyboardStep={2}
            keyboardStepLarge={18}
            onApply={handleApply}
            onReset={handleReset}
            onCropComplete={handleCropComplete}
            onError={(error) => setResult(error.message)}
          />
        </div>
        <div className="lumina-story-panel lumina-story-stack">
          <div className="lumina-story-note">
            Internal preview: {showPreview ? 'enabled' : 'disabled'}.
            Parent-managed preview is shown below when a crop completes.
          </div>
          <ResultLabel>{result}</ResultLabel>
          {previewUrl && (
            <img
              className="lumina-story-image-preview"
              src={previewUrl}
              alt="Cropped output"
            />
          )}
        </div>
      </div>
    </StoryShell>
  );
}

export const ReactExports: Story = {
  name: 'React exports and functionality list',
  render: () => (
    <StoryShell
      title="React Exports"
      description="The React entrypoint exposes component, hook, and crop-selection primitives over the LuminaJS chain API."
    >
      <div className="lumina-story-grid">
        <div className="lumina-story-panel">
          <h3>LuminaCanvas</h3>
          <ul className="lumina-story-list">
            <li>Renders a processed image to canvas.</li>
            <li>Supports declarative editing props.</li>
            <li>Accepts a custom chain callback through filter.</li>
            <li>
              Returns canvas, dataUrl, blob, or ImageData through getImage.
            </li>
            <li>
              Can collect an interactive crop with apply/reset controls before
              rendering.
            </li>
            <li>Runs only in browser/client render paths.</li>
          </ul>
        </div>
        <div className="lumina-story-panel">
          <h3>useLumina</h3>
          <ul className="lumina-story-list">
            <li>Processes images from a hook.</li>
            <li>Provides result, loading, error, and getImage.</li>
            <li>Supports deps for caller-controlled reprocessing.</li>
            <li>Can request Blob output on demand for upload flows.</li>
          </ul>
        </div>
        <div className="lumina-story-panel">
          <h3>ImageAreaSelector</h3>
          <ul className="lumina-story-list">
            <li>Interactive selection rectangle over an image.</li>
            <li>
              Resizable handles, drag-to-move, and touch support with
              pinch-to-resize.
            </li>
            <li>Optional aspect-ratio lock.</li>
            <li>Selection styling and overlayControls render prop.</li>
            <li>Keyboard movement and resize controls for existing regions.</li>
          </ul>
        </div>
        <div className="lumina-story-panel">
          <h3>ImageCropper</h3>
          <ul className="lumina-story-list">
            <li>Complete crop workflow with apply and reset controls.</li>
            <li>
              Resizable crop selection powered by ImageAreaSelector (supports
              touch & pinch).
            </li>
            <li>Blob or Data URL output.</li>
            <li>Custom button classes, styles, positions, and callbacks.</li>
            <li>Explicit showPreview support for parent-managed previews.</li>
          </ul>
        </div>
      </div>
    </StoryShell>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { LuminaCanvas, useLumina, ImageAreaSelector, ImageCropper } from '@gks101/luminajs/react';`,
      },
    },
  },
};

export const ClientOnlyAndCssOnlyPositioning: Story = {
  name: 'Positioning/browser client and CSS-only path',
  render: () => (
    <StoryShell
      title="Browser-Only And CSS-Only Positioning"
      description="LuminaJS React APIs process images with browser Canvas and ImageData APIs. Use Lumina Image CSS when you only need CSS presentation."
    >
      <div className="lumina-story-grid">
        <div className="lumina-story-panel lumina-story-stack">
          <h3>React image processing</h3>
          <ul className="lumina-story-list">
            <li>Use inside client-only React views.</li>
            <li>Keep SSR render passes away from runtime image processing.</li>
            <li>Use Blob/Data URL outputs for upload or preview workflows.</li>
          </ul>
        </div>
        <div className="lumina-story-panel lumina-story-stack">
          <h3>CSS-only image styling</h3>
          <ul className="lumina-story-list">
            <li>No JavaScript pixel processing.</li>
            <li>
              Presentation-only filters, hover effects, overlays, and layout.
            </li>
            <li>Stable import: @gks101/luminajs/lumina-image.css.</li>
          </ul>
          <div className="lumina-story-row">
            <StoryLink href="https://gaurav101.github.io/LuminaJS/css-demo">
              CSS Demo
            </StoryLink>
            <StoryLink href="https://github.com/gaurav101/LuminaJS/blob/main/Lumina-IMAGE-CSS.md">
              CSS Guide
            </StoryLink>
          </div>
        </div>
      </div>
    </StoryShell>
  ),
  parameters: {
    docs: {
      source: {
        code: `// React processing APIs are client/browser features.
import { LuminaCanvas, useLumina, ImageCropper } from '@gks101/luminajs/react';

// CSS-only presentation path:
import '@gks101/luminajs/lumina-image.css';`,
      },
    },
  },
};

export const LuminaCanvasBasic: Story = {
  name: 'LuminaCanvas/basic canvas',
  render: () => (
    <StoryShell
      title="LuminaCanvas Basic"
      description="Use source plus standard canvas attributes to render an image."
    >
      <LuminaCanvas
        className="lumina-story-canvas"
        source={SAMPLE_IMAGE}
        width={520}
        height={360}
      />
    </StoryShell>
  ),
  parameters: {
    docs: {
      source: {
        code: `<LuminaCanvas source="/sample.png" width={520} height={360} />`,
      },
    },
  },
};

export const LuminaCanvasAdjustments: StoryObj<LuminaCanvasAdjustmentArgs> = {
  name: 'LuminaCanvas/adjustments and filters',
  args: {
    brightness: 12,
    contrast: 18,
    grayscale: false,
    sepia: true,
    gaussianBlur: 0,
    sharpen: false,
    emboss: false,
    edgeDetection: false,
  },
  render: (args) => (
    <StoryShell
      title="Adjustments And Filters"
      description="These props map to the shared ImageEditingOptions contract."
    >
      <LuminaCanvas
        className="lumina-story-canvas"
        source={SAMPLE_IMAGE}
        width={520}
        height={360}
        brightness={args.brightness}
        contrast={args.contrast}
        grayscale={args.grayscale}
        sepia={args.sepia}
        gaussianBlur={args.gaussianBlur || undefined}
        sharpen={args.sharpen}
        emboss={args.emboss}
        edgeDetection={args.edgeDetection}
      />
    </StoryShell>
  ),
  parameters: {
    docs: {
      source: {
        code: `<LuminaCanvas
  source="/sample.png"
  brightness={12}
  contrast={18}
  sepia
  gaussianBlur={0}
/>`,
      },
    },
  },
};

export const LuminaCanvasFilterGallery: Story = {
  name: 'LuminaCanvas/filter gallery',
  render: () => (
    <StoryShell
      title="Built-In Filter Gallery"
      description="Each card applies one built-in LuminaJS edit option through the React component API."
    >
      <div className="lumina-story-filter-grid">
        <FilterCard title="Original" description="Unmodified source image" />
        <FilterCard
          title="Grayscale"
          description="grayscale"
          options={{ grayscale: true }}
        />
        <FilterCard
          title="Sepia"
          description="sepia"
          options={{ sepia: true }}
        />
        <FilterCard
          title="Brightness"
          description="brightness={28}"
          options={{ brightness: 28 }}
        />
        <FilterCard
          title="Contrast"
          description="contrast={34}"
          options={{ contrast: 34 }}
        />
        <FilterCard title="Blur" description="blur={3}" options={{ blur: 3 }} />
        <FilterCard
          title="Gaussian Blur"
          description="gaussianBlur={4}"
          options={{ gaussianBlur: 4 }}
        />
        <FilterCard
          title="Background Blur"
          description="backgroundBlur focus area"
          options={{
            backgroundBlur: {
              sigma: 7,
              centerX: 150,
              centerY: 92,
              focusRadius: 58,
              falloff: 86,
            },
          }}
        />
        <FilterCard
          title="Sharpen"
          description="sharpen"
          options={{ sharpen: true }}
        />
        <FilterCard
          title="Emboss"
          description="emboss"
          options={{ emboss: true }}
        />
        <FilterCard
          title="Edge Detection"
          description="edgeDetection"
          options={{ edgeDetection: true }}
        />
        <FilterCard
          title="Watermark"
          description="watermark text overlay"
          options={{
            watermark: {
              text: 'LuminaJS',
              options: {
                x: 16,
                y: 38,
                fontSize: 26,
                color: 'rgba(255,255,255,0.82)',
              },
            },
          }}
        />
      </div>
    </StoryShell>
  ),
  parameters: {
    docs: {
      source: {
        code: `<LuminaCanvas source="/sample.png" grayscale />
<LuminaCanvas source="/sample.png" sepia />
<LuminaCanvas source="/sample.png" brightness={28} />
<LuminaCanvas source="/sample.png" contrast={34} />
<LuminaCanvas source="/sample.png" blur={3} />
<LuminaCanvas source="/sample.png" gaussianBlur={4} />
<LuminaCanvas source="/sample.png" backgroundBlur={{ sigma: 7, focusRadius: 58, falloff: 86 }} />
<LuminaCanvas source="/sample.png" sharpen />
<LuminaCanvas source="/sample.png" emboss />
<LuminaCanvas source="/sample.png" edgeDetection />
<LuminaCanvas source="/sample.png" watermark={{ text: 'LuminaJS' }} />`,
      },
    },
  },
};

export const LuminaCanvasTransformations: Story = {
  name: 'LuminaCanvas/resize crop watermark',
  render: () => (
    <StoryShell
      title="Resize, Crop, And Watermark"
      description="Crop and resize are applied before the optional filter callback."
    >
      <LuminaCanvas
        className="lumina-story-canvas"
        source={SAMPLE_IMAGE}
        resize={{ width: 420, height: 280 }}
        crop={{ x: 80, y: 60, width: 520, height: 360 }}
        watermark={{
          text: 'LuminaJS',
          options: {
            x: 20,
            y: 48,
            fontSize: 32,
            color: 'rgba(255,255,255,0.82)',
          },
        }}
      />
    </StoryShell>
  ),
  parameters: {
    docs: {
      source: {
        code: `<LuminaCanvas
  source="/sample.png"
  crop={{ x: 80, y: 60, width: 520, height: 360 }}
  resize={{ width: 420, height: 280 }}
  watermark={{
    text: 'LuminaJS',
    options: { x: 20, y: 48, fontSize: 32, color: 'rgba(255,255,255,0.82)' },
  }}
/>`,
      },
    },
  },
};

export const LuminaCanvasInteractiveCrop: StoryObj<CanvasInteractiveCropArgs> =
  {
    name: 'LuminaCanvas/interactive crop apply reset',
    args: {
      cropAspectRatio: 1,
      allowCropResize: true,
      cropButtonPosition: 'top-right',
      cropKeyboardStep: 2,
      cropKeyboardStepLarge: 18,
    },
    argTypes: {
      cropButtonPosition: {
        control: 'select',
        options: [
          'top-left',
          'top-right',
          'top-center',
          'bottom-left',
          'bottom-center',
          'bottom-right',
        ],
      },
    },
    render: (args) => <LuminaCanvasInteractiveCropDemo {...args} />,
    parameters: {
      docs: {
        source: {
          code: `<LuminaCanvas
  source="/sample.png"
  interactiveCrop
  cropAspectRatio={1}
  allowCropResize
  cropButtonPosition="top-right"
  outputType="dataUrl"
  getImage={(data) => console.log(data)}
  onCropChange={(crop) => setCrop(crop)}
  onCropApply={(crop) => crop.width >= 32}
  onCropReset={() => clearCropState()}
  cropKeyboardStep={2}
  cropKeyboardStepLarge={18}
/>`,
        },
      },
    },
  };

export const LuminaCanvasCustomChain: Story = {
  name: 'LuminaCanvas/custom filter chain',
  render: () => (
    <StoryShell
      title="Custom Chain"
      description="Use filter when you need the chainable Lumina API directly."
    >
      <LuminaCanvas
        className="lumina-story-canvas"
        source={SAMPLE_IMAGE}
        width={520}
        height={360}
        filter={(chain) => chain.grayscale().brightness(20).sharpen()}
      />
    </StoryShell>
  ),
  parameters: {
    docs: {
      source: {
        code: `<LuminaCanvas
  source="/sample.png"
  filter={(chain) => chain.grayscale().brightness(20).sharpen()}
/>`,
      },
    },
  },
};

export const LuminaCanvasOutputTypes: StoryObj<CanvasOutputArgs> = {
  name: 'LuminaCanvas/getImage output types',
  args: {
    outputType: 'dataUrl',
  },
  argTypes: {
    outputType: {
      control: 'select',
      options: ['canvas', 'dataUrl', 'blob', 'imageData'],
    },
  },
  render: (args) => <LuminaCanvasOutputDemo outputType={args.outputType} />,
  parameters: {
    docs: {
      source: {
        code: `<LuminaCanvas
  source="/sample.png"
  outputType="dataUrl"
  getImage={(data) => console.log(data)}
/>`,
      },
    },
  },
};

export const LuminaCanvasErrorState: Story = {
  name: 'LuminaCanvas/error state',
  render: () => (
    <StoryShell
      title="Error State"
      description="Invalid sources render an accessible error container and call onProcessError."
    >
      <LuminaCanvas
        source="/missing-lumina-image.png"
        errorClassName="lumina-story-error"
        errorRole="status"
        onProcessError={() => undefined}
      />
    </StoryShell>
  ),
  parameters: {
    docs: {
      source: {
        code: `<LuminaCanvas
  source="/missing-image.png"
  errorClassName="image-error"
  errorRole="status"
  onProcessError={(error) => report(error)}
/>`,
      },
    },
  },
};

export const UseLuminaDataUrl: Story = {
  name: 'useLumina/data URL and getImage',
  render: () => <UseLuminaDataUrlDemo />,
  parameters: {
    docs: {
      source: {
        code: `const { result, loading, error, getImage } = useLumina<string>({
  source: '/sample.png',
  resize: { width: 260, height: 180 },
  brightness: 8,
  contrast: 12,
  operations: (chain) => chain.sepia().watermark('useLumina', { x: 16, y: 34 }),
  outputType: 'dataUrl',
});

const blob = await getImage('blob');`,
      },
    },
  },
};

export const UseLuminaLiveControls: StoryObj<UseLuminaLiveArgs> = {
  name: 'useLumina/live filter controls',
  args: {
    brightness: 12,
    contrast: 16,
    gaussianBlur: 0,
    sepia: false,
    sharpen: false,
  },
  render: (args) => <UseLuminaLiveDemo {...args} />,
  parameters: {
    docs: {
      source: {
        code: `const { result, loading, error } = useLumina<string>({
  source: '/sample.png',
  resize: { width: 360, height: 240 },
  brightness,
  contrast,
  gaussianBlur,
  sepia,
  operations: (chain) => chain.watermark('Live hook'),
  deps: [brightness, contrast, gaussianBlur, sepia],
  outputType: 'dataUrl',
});`,
      },
    },
  },
};

export const UseLuminaAscii: Story = {
  name: 'useLumina/ASCII output',
  render: () => <UseLuminaAsciiDemo />,
  parameters: {
    docs: {
      source: {
        code: `const { result, loading, error } = useLumina<string>({
  source: '/sample.png',
  resize: { width: 80, height: 44 },
  operations: (chain) => chain.ascii(),
});`,
      },
    },
  },
};

export const ImageAreaSelectorFreeform: StoryObj<AreaSelectorArgs> = {
  name: 'ImageAreaSelector/freeform selection',
  args: {
    lineColor: '#1c64d1',
    overlayOpacity: 0.55,
    allowResize: true,
  },
  render: (args) => (
    <ImageAreaSelectorDemo
      lineColor={args.lineColor}
      overlayOpacity={args.overlayOpacity}
      allowResize={args.allowResize}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<ImageAreaSelector
  src="/sample.png"
  lineColor="#1c64d1"
  overlayOpacity={0.55}
  allowResize
  onCropChange={setCrop}
  onCropComplete={setCrop}
/>`,
      },
    },
  },
};

export const ImageAreaSelectorAspectLocked: StoryObj<AreaSelectorArgs> = {
  name: 'ImageAreaSelector/aspect locked',
  args: {
    aspect: 16 / 9,
    lineColor: '#d14d1c',
    overlayOpacity: 0.62,
    allowResize: true,
  },
  render: (args) => (
    <ImageAreaSelectorDemo
      aspect={args.aspect}
      lineColor={args.lineColor}
      overlayOpacity={args.overlayOpacity}
      allowResize={args.allowResize}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<ImageAreaSelector
  src="/sample.png"
  aspect={16 / 9}
  lineColor="#d14d1c"
  allowResize
  overlayControls={({ width, height }) => (
    <span>{Math.round(width)} x {Math.round(height)}</span>
  )}
  onCropChange={setCrop}
/>`,
      },
    },
  },
};

export const ImageCropperBlob: StoryObj<CropperArgs> = {
  name: 'ImageCropper/blob output',
  args: {
    aspectRatio: 1,
    outputFormat: 'blob',
    buttonPosition: 'top-left',
    allowReset: true,
    allowResize: true,
    showPreview: false,
  },
  render: (args) => (
    <ImageCropperDemo
      aspectRatio={args.aspectRatio}
      outputFormat={args.outputFormat}
      buttonPosition={args.buttonPosition}
      allowReset={args.allowReset}
      allowResize={args.allowResize}
      showPreview={args.showPreview}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<ImageCropper
  src="/sample.png"
  aspectRatio={1}
  outputFormat="blob"
  showPreview={false}
  allowResize
  onApply={(crop) => crop.width >= 24}
  onCropComplete={(blob) => console.log(blob)}
  onError={(error) => console.error(error)}
/>`,
      },
    },
  },
};

export const ImageCropperDataUrl: StoryObj<CropperArgs> = {
  name: 'ImageCropper/data URL output and custom controls',
  args: {
    aspectRatio: 16 / 9,
    outputFormat: 'dataUrl',
    buttonPosition: 'bottom-left',
    allowReset: true,
    allowResize: true,
    showPreview: true,
  },
  render: (args) => (
    <ImageCropperDemo
      aspectRatio={args.aspectRatio}
      outputFormat={args.outputFormat}
      buttonPosition={args.buttonPosition}
      allowReset={args.allowReset}
      allowResize={args.allowResize}
      showPreview={args.showPreview}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<ImageCropper
  src="/sample.png"
  aspectRatio={16 / 9}
  outputFormat="dataUrl"
  showPreview
  buttonPosition="bottom-right"
  allowResize
  applyButtonStyle={{ backgroundColor: '#1c64d1' }}
  resetButtonStyle={{ borderColor: '#c4ccda' }}
  onApply={(crop) => crop.width > 20}
/>`,
      },
    },
  },
};
