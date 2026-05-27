export const navigation = [
  { label: 'Features', href: '#features' },
  { label: 'Playground', href: '#playground' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'API', href: '#api' },
  { label: 'Demos', href: '#demos' },
  { label: 'Install', href: '#install' },
  { label: 'Docs', href: './docs' },
  { label: 'Storybook', href: './storybook' },
  { label: 'GitHub', href: 'https://github.com/gaurav101/LuminaJS/' },
];

export const projectLinks = {
  github: 'https://github.com/gaurav101/LuminaJS/',
};

export const announcement = {
  label: 'LuminaJS 2.1',
  text: 'Canvas filters, React components, crop workflows, and CSS image utilities in one browser-first package.',
  href: './docs',
};

export const hero = {
  eyebrow: 'The browser image engine for modern JavaScript apps',
  title: 'Edit, transform, and export images where your users already are.',
  body: 'LuminaJS is a developer-friendly image processing toolkit for product teams building upload flows, profile editors, creative tools, CMS dashboards, and media-heavy web apps without sending every pixel through a backend job.',
  actions: [
    { label: 'Launch React Demo', href: './react', variant: 'primary' },
    {
      label: 'JS Demo',
      href: './vanilla-js',
      variant: 'secondary',
      icon: 'code',
    },
    { label: 'CSS Demo', href: './css-demo', variant: 'accent', icon: 'brush' },
    { label: 'Explore API Docs', href: './docs', variant: 'secondary' },
    {
      label: 'View GitHub',
      href: 'https://github.com/gaurav101/LuminaJS/',
      variant: 'accent',
      icon: 'github',
    },
  ],
  badges: [
    { value: '0 runtime deps', label: 'Canvas-native core', icon: 'gauge' },
    {
      value: 'Only 3.8 kB gzipped',
      label: 'Minified browser bundle',
      icon: 'download',
    },
  ],
  metrics: [
    {
      value: '4 output types',
      label: 'Canvas, Blob, data URL, and ImageData export paths.',
      icon: 'download',
    },
    {
      value: '3 ways to use',
      label: 'Core JavaScript, React components, and CSS utilities.',
      icon: 'layers',
    },
  ],
};

export const heroCodeTabs = [
  {
    id: 'vanilla',
    label: 'Vanilla JS',
    icon: 'code',
    code: `import { lumina } from '@gks101/luminajs';

await lumina(file)
  .resize(1200, 800)
  .contrast(28)
  .watermark('LuminaJS')
  .toCanvas(canvas);

const blob = await lumina(canvas)
  .sharpen()
  .toBlob('image/png');`,
  },
  {
    id: 'react',
    label: 'React',
    icon: 'react',
    code: `import { LuminaCanvas } from '@gks101/luminajs/react';

function Editor({ file }) {
  return (
    <LuminaCanvas
      source={file}
      width={1200}
      height={800}
      contrast={28}
      watermark="LuminaJS"
      outputType="blob"
    />
  );
}`,
  },
  {
    id: 'css',
    label: 'CSS Utilities',
    icon: 'brush',
    code: `<figure class="lum-frame lum-aspect-video">
  <img
    class="lum-img lum-fit-cover lum-filter-contrast lum-hover-zoom"
    src="/sample.png"
    alt="Processed preview"
  />
</figure>`,
  },
];

export const heroPipeline = [
  { label: 'Source', value: 'File | URL | Canvas', icon: 'upload' },
  { label: 'Pipeline', value: 'resize + filter + crop', icon: 'sliders' },
  { label: 'Output', value: 'Blob | Canvas | Data URL', icon: 'download' },
];

export const features = [
  {
    title: 'Chainable image pipeline',
    body: 'Load a File, URL, image element, canvas, or ImageData, then chain transformations and export the result.',
    tone: 'teal',
    icon: 'layers',
  },
  {
    title: 'Filters and transforms',
    body: 'Brightness, contrast, grayscale, sepia, blur, sharpen, emboss, edge detection, resize, crop, ASCII, and watermark support.',
    tone: 'blue',
    icon: 'sliders',
  },
  {
    title: 'React hooks and components',
    body: 'Use useLumina, LuminaCanvas, and ImageCropper to build responsive editors with less state glue.',
    tone: 'amber',
    icon: 'react',
  },
  {
    title: 'Export-ready outputs',
    body: 'Render to canvas, download Blob output, create data URLs, or keep ImageData available for custom processing.',
    tone: 'rose',
    icon: 'download',
  },
  {
    title: 'CSS image utilities',
    body: 'Style images with utility classes for filters, hover effects, object-fit, aspect ratios, animations, frames, and overlays.',
    tone: 'green',
    icon: 'brush',
  },
  {
    title: 'Browser-first ergonomics',
    body: 'Designed for upload previews, profile-image editors, CMS tools, creative apps, and client-side asset preparation.',
    tone: 'violet',
    icon: 'rocket',
  },
];

export const useCases = [
  {
    title: 'Upload previews',
    body: 'Resize and compress large uploads before they hit your API, while showing users a responsive preview.',
    accent: 'border-teal-200 bg-teal-50/70 text-teal-800',
    icon: 'upload',
  },
  {
    title: 'Profile editors',
    body: 'Add crop, resize, watermark, and export flows to avatar or cover-photo forms without a heavy editor stack.',
    accent: 'border-blue-200 bg-blue-50/70 text-blue-800',
    icon: 'crop',
  },
  {
    title: 'CMS image tools',
    body: 'Let editors apply predictable image transformations directly in admin dashboards and content workflows.',
    accent: 'border-amber-200 bg-amber-50/70 text-amber-900',
    icon: 'fileImage',
  },
  {
    title: 'Creative interfaces',
    body: 'Prototype filter labs, ASCII previews, hover effects, and visual recipes with a browser-native API.',
    accent: 'border-rose-200 bg-rose-50/70 text-rose-800',
    icon: 'wand',
  },
];

export const mediaShowcase = [
  {
    title: 'Original',
    label: 'Input media',
    body: 'Accept user-selected files and render the first preview instantly.',
    imageClass: 'brightness-105 saturate-110',
    icon: 'image',
  },
  {
    title: 'Edited',
    label: 'Canvas result',
    body: 'Apply contrast, crop, filters, watermarking, and export rules in the browser.',
    imageClass: 'contrast-125 saturate-150',
    icon: 'sliders',
  },
  {
    title: 'Styled',
    label: 'CSS utility',
    body: 'Use CSS-only image treatments for galleries, cards, and documentation examples.',
    imageClass: 'sepia contrast-125 brightness-95',
    icon: 'brush',
  },
];

export const playgroundDemos = [
  {
    label: 'Full React Demo',
    href: './react',
    variant: 'primary',
    icon: 'react',
  },
  {
    label: 'Full JS Demo',
    href: './vanilla-js',
    variant: 'secondary',
    icon: 'code',
  },
  {
    label: 'Full CSS Demo',
    href: './css-demo',
    variant: 'accent',
    icon: 'brush',
  },
  {
    label: 'React Storybook',
    href: './storybook',
    variant: 'secondary',
    icon: 'boxes',
  },
];

export const playgroundFilters = [
  { id: 'none', label: 'Original' },
  { id: 'grayscale', label: 'Mono' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'sharpen', label: 'Sharpen' },
  { id: 'emboss', label: 'Emboss' },
];

export const playgroundCodeTabs = [
  {
    id: 'html',
    label: 'HTML',
    icon: 'code',
    code: `<section class="lumina-playground">
  <label class="drop-zone">
    <input id="imageInput" type="file" accept="image/*" />
    <span>Drop an image or browse</span>
  </label>

  <label>
    Brightness
    <input id="brightness" type="range" min="-80" max="80" value="0" />
  </label>

  <label>
    Contrast
    <input id="contrast" type="range" min="-80" max="80" value="18" />
  </label>

  <div id="cropStage" class="crop-stage">
    <canvas id="preview" width="960" height="540"></canvas>
    <div id="cropBox" class="crop-box" hidden></div>
  </div>

  <button id="applyCrop" type="button">Apply crop</button>
  <button id="resetImage" type="button">Reset image</button>

  <div class="filters">
    <button data-filter="none">Original</button>
    <button data-filter="grayscale">Mono</button>
    <button data-filter="sepia">Sepia</button>
    <button data-filter="sharpen">Sharpen</button>
    <button data-filter="emboss">Emboss</button>
  </div>
</section>`,
  },
  {
    id: 'css',
    label: 'CSS',
    icon: 'brush',
    code: `.lumina-playground {
  display: grid;
  gap: 1rem;
  max-width: 960px;
}

.drop-zone {
  display: grid;
  min-height: 9rem;
  place-items: center;
  border: 2px dashed #5eead4;
  border-radius: 1rem;
  cursor: pointer;
}

.crop-stage {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  background: #020617;
}

#preview {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.crop-box {
  position: absolute;
  cursor: move;
  border: 2px solid #5eead4;
  background: rgb(94 234 212 / 15%);
  box-shadow: 0 0 0 9999px rgb(15 23 42 / 45%);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}`,
  },
  {
    id: 'react',
    label: 'React',
    icon: 'react',
    code: `import { useCallback, useState } from 'react';
import {
  ImageCropper,
  LuminaCanvas,
  useLumina,
} from '@gks101/luminajs/react';

const filterToProps = {
  none: {},
  grayscale: { grayscale: true },
  sepia: { sepia: true },
  sharpen: { sharpen: true },
  emboss: { emboss: true },
};

export function LuminaPlayground() {
  const [source, setSource] = useState(null);
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(18);
  const [cropped, setCropped] = useState(null);

  const activeSource = cropped ?? source;
  const filterProps = filterToProps[filter];

  const { loading, error, getImage } = useLumina({
    source: activeSource,
    ...filterProps,
    brightness,
    contrast,
    outputType: 'blob',
    deps: [filter, brightness, contrast, activeSource],
  });

  const handleFile = useCallback((event) => {
    const [file] = event.target.files ?? [];
    if (!file) return;
    setSource(file);
    setCropped(null);
  }, []);

  const exportBlob = async () => {
    const blob = await getImage('blob');
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'lumina-output.png';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="lumina-playground">
      <input type="file" accept="image/*" onChange={handleFile} />

      <div className="filters">
        {Object.keys(filterToProps).map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={filter === name}
            onClick={() => setFilter(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <label>
        Brightness
        <input
          type="range"
          min="-80"
          max="80"
          value={brightness}
          onChange={(event) => setBrightness(Number(event.target.value))}
        />
      </label>

      <label>
        Contrast
        <input
          type="range"
          min="-80"
          max="80"
          value={contrast}
          onChange={(event) => setContrast(Number(event.target.value))}
        />
      </label>

      <LuminaCanvas
        className="preview"
        source={activeSource}
        {...filterProps}
        brightness={brightness}
        contrast={contrast}
        outputType="canvas"
      />

      <ImageCropper
        src={activeSource}
        outputFormat="blob"
        allowResize
        allowReset
        showPreview={false}
        onCropComplete={(blob) => setCropped(blob)}
      />

      <button type="button" disabled={!activeSource || loading} onClick={exportBlob}>
        Export processed image
      </button>

      {error ? <p role="alert">{error.message}</p> : null}
    </section>
  );
}`,
  },
  {
    id: 'js',
    label: 'JS',
    icon: 'code',
    code: `import { lumina } from '@gks101/luminajs';

const input = document.querySelector('#imageInput');
const canvas = document.querySelector('#preview');
const brightness = document.querySelector('#brightness');
const contrast = document.querySelector('#contrast');
const filterButtons = document.querySelectorAll('[data-filter]');
const sourceCanvas = document.createElement('canvas');
const originalCanvas = document.createElement('canvas');
let activeFilter = 'none';

input.addEventListener('change', async () => {
  const [file] = input.files;
  if (!file) return;

  const image = new Image();
  image.onload = () => {
    drawImage(originalCanvas, image);
    copyCanvas(sourceCanvas, originalCanvas);
    render();
  };
  image.src = URL.createObjectURL(file);
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    render();
  });
});

[brightness, contrast].forEach((control) => {
  control.addEventListener('input', render);
});

async function render() {
  let chain = lumina(sourceCanvas);

  if (activeFilter === 'grayscale') chain = chain.grayscale();
  if (activeFilter === 'sepia') chain = chain.sepia();
  if (activeFilter === 'sharpen') chain = chain.sharpen();
  if (activeFilter === 'emboss') chain = chain.emboss();

  await chain
    .brightness(Number(brightness.value))
    .contrast(Number(contrast.value))
    .toCanvas(canvas);
}

async function applyCrop({ x, y, width, height }) {
  const cropped = document.createElement('canvas');

  await lumina(sourceCanvas)
    .crop(x, y, width, height)
    .toCanvas(cropped);

  copyCanvas(sourceCanvas, cropped);
  render();
}

function drawImage(targetCanvas, image) {
  targetCanvas.width = image.naturalWidth;
  targetCanvas.height = image.naturalHeight;
  targetCanvas.getContext('2d').drawImage(image, 0, 0);
}

function copyCanvas(targetCanvas, source) {
  targetCanvas.width = source.width;
  targetCanvas.height = source.height;
  targetCanvas.getContext('2d').drawImage(source, 0, 0);
}`,
  },
];

export const demos = [
  {
    label: 'React',
    title: 'Image editor demo',
    body: 'Live filters, resize, crop, watermark, ASCII, hooks, and components.',
    href: './react',
    icon: 'react',
  },
  {
    label: 'JavaScript',
    title: 'Vanilla browser demo',
    body: 'Drag-and-drop processing with Canvas exports and transform controls.',
    href: './vanilla-js',
    icon: 'code',
  },
  {
    label: 'CSS',
    title: 'Lumina Image CSS',
    body: 'Utility classes for responsive image styling and hover effects.',
    href: './css-demo',
    icon: 'brush',
  },
  {
    label: 'Reference',
    title: 'Generated docs',
    body: 'API reference generated from source comments.',
    href: './docs',
    icon: 'book',
  },
  {
    label: 'Storybook',
    title: 'React stories',
    body: 'Component examples for React integration and documentation.',
    href: './storybook',
    icon: 'boxes',
  },
];

export const reactDemoSpotlight = {
  eyebrow: 'React application demo',
  title: 'See LuminaJS running inside the React image editor.',
  body: 'The React demo shows the library in a real application flow: upload an image, tune visual filters, resize and crop, preview the result, and export from the browser without a backend processing step.',
  video: './react-demo.mp4',
  href: './react',
};

export const apiExamples = [
  {
    label: 'Core API',
    title: 'Compose image operations fluently.',
    body: 'Use the chain API for direct JavaScript workflows and framework-agnostic tools.',
    code: `import { lumina } from '@gks101/luminajs';

const dataUrl = await lumina(file)
  .resize(900, 600)
  .brightness(10)
  .contrast(18)
  .toDataURL();`,
  },
  {
    label: 'React',
    title: 'Render image processing as UI.',
    body: 'Use components and hooks when state, loading, preview, and user controls live in React.',
    code: `import { LuminaCanvas } from '@gks101/luminajs/react';

<LuminaCanvas
  source="/sample.png"
  grayscale
  outputType="dataUrl"
  getImage={setPreview}
/>`,
  },
  {
    label: 'CSS',
    title: 'Style images without JavaScript work.',
    body: 'Use utility classes for visual effects, frames, aspect ratios, and hover states.',
    code: `<figure class="lum-frame lum-aspect-video">
  <img
    class="lum-img lum-fit-cover lum-hover-zoom"
    src="/hero.jpg"
    alt="Preview"
  />
</figure>`,
  },
];

export const packageHighlights = [
  {
    title: 'Core image pipeline',
    body: 'Load File, URL, image element, canvas, or ImageData sources and compose operations through a chainable API.',
    icon: 'layers',
  },
  {
    title: 'Filter catalog',
    body: 'Brightness, contrast, grayscale, sepia, blur, sharpen, emboss, edge detection, ASCII, and background blur.',
    icon: 'sliders',
  },
  {
    title: 'Transform toolkit',
    body: 'Resize, crop, watermark, prepare previews, and keep image work close to the browser UI.',
    icon: 'crop',
  },
  {
    title: 'React exports',
    body: 'Use useLumina, LuminaCanvas, and ImageCropper for stateful editor screens and product upload flows.',
    icon: 'react',
  },
  {
    title: 'CSS image utilities',
    body: 'Aspect ratios, object-fit helpers, filters, shadows, frames, overlays, hover effects, and animation helpers.',
    icon: 'brush',
  },
  {
    title: 'Export adapters',
    body: 'Return Canvas, Blob, data URL, or ImageData results for previews, downloads, uploads, and custom processing.',
    icon: 'download',
  },
];

export const installCommands = `# npm
npm install @gks101/luminajs

# pnpm
pnpm add @gks101/luminajs

# yarn
yarn add @gks101/luminajs`;

export const installCommandOptions = [
  { label: 'npm', command: 'npm install @gks101/luminajs' },
  { label: 'pnpm', command: 'pnpm add @gks101/luminajs' },
  { label: 'yarn', command: 'yarn add @gks101/luminajs' },
];

export const installCode = `// Core JavaScript
import { lumina } from '@gks101/luminajs';

// React components and hooks
import { LuminaCanvas, useLumina } from '@gks101/luminajs/react';

// Optional CSS utility layer
import '@gks101/luminajs/lumina-image.css';

await lumina(file)
  .resize(800, 600)
  .brightness(12)
  .contrast(18)
  .toCanvas(canvas);`;

export const workflow = [
  {
    title: 'Load',
    body: 'Accept files, URLs, canvases, image elements, or ImageData.',
    icon: 'upload',
  },
  {
    title: 'Transform',
    body: 'Resize, crop, filter, sharpen, blur, watermark, or create ASCII.',
    icon: 'wand',
  },
  {
    title: 'Preview',
    body: 'Render quickly to a canvas or React component while users edit.',
    icon: 'canvas',
  },
  {
    title: 'Export',
    body: 'Return a Blob, data URL, ImageData, or final canvas for download.',
    icon: 'download',
  },
];

export const finalCta = {
  title: 'Start with the demo, ship with the API.',
  body: 'Inspect the generated docs/code and lift the pieces that match your product workflow.',
  actions: [
    { label: 'Read Documentation', href: './docs', variant: 'primary' },
    {
      label: 'Code',
      href: 'https://github.com/gaurav101/LuminaJS/',
      variant: 'accent',
      icon: 'github',
    },
  ],
};
