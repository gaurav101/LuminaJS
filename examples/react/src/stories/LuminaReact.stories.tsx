import { useCallback, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ImageAreaSelector,
  ImageCropper,
  LuminaCanvas,
  useLumina,
  type CropArea,
} from '../../../../src/react';
import type { Lumina } from '../../../../src';

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

function ResultLabel({ children }: { children: React.ReactNode }) {
  return <div className="lumina-story-result">{children}</div>;
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

  return (
    <StoryShell
      title="ImageCropper"
      description="Select an area, apply the crop, and inspect the returned Blob or Data URL."
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
            maxWidth={520}
            maxHeight={360}
            onCropComplete={handleCropComplete}
            onError={(error) => setResult(error.message)}
          />
        </div>
        <div className="lumina-story-panel lumina-story-stack">
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
          </ul>
        </div>
        <div className="lumina-story-panel">
          <h3>useLumina</h3>
          <ul className="lumina-story-list">
            <li>Processes images from a hook.</li>
            <li>Provides result, loading, error, and getImage.</li>
            <li>Supports deps for caller-controlled reprocessing.</li>
          </ul>
        </div>
        <div className="lumina-story-panel">
          <h3>ImageAreaSelector</h3>
          <ul className="lumina-story-list">
            <li>Interactive selection rectangle over an image.</li>
            <li>Resizable handles, drag-to-move, and touch support with pinch-to-resize.</li>
            <li>Optional aspect-ratio lock.</li>
            <li>Selection styling and overlayControls render prop.</li>
          </ul>
        </div>
        <div className="lumina-story-panel">
          <h3>ImageCropper</h3>
          <ul className="lumina-story-list">
            <li>Complete crop workflow with apply and reset controls.</li>
            <li>Resizable crop selection powered by ImageAreaSelector (supports touch & pinch).</li>
            <li>Blob or Data URL output.</li>
            <li>Custom button classes, styles, positions, and callbacks.</li>
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
  },
  render: (args) => (
    <ImageCropperDemo
      aspectRatio={args.aspectRatio}
      outputFormat={args.outputFormat}
      buttonPosition={args.buttonPosition}
      allowReset={args.allowReset}
      allowResize={args.allowResize}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<ImageCropper
  src="/sample.png"
  aspectRatio={1}
  outputFormat="blob"
  allowResize
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
  },
  render: (args) => (
    <ImageCropperDemo
      aspectRatio={args.aspectRatio}
      outputFormat={args.outputFormat}
      buttonPosition={args.buttonPosition}
      allowReset={args.allowReset}
      allowResize={args.allowResize}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<ImageCropper
  src="/sample.png"
  aspectRatio={16 / 9}
  outputFormat="dataUrl"
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
