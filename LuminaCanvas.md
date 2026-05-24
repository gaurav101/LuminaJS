# LuminaCanvas

`LuminaCanvas` is the declarative React canvas component for LuminaJS. Pass it an image `source`, optional editing props, and it renders the processed result into an HTML `<canvas>`.

> Browser-only component: `LuminaCanvas` depends on DOM/canvas APIs and must run on the client side.
> In Next.js/SSR apps, render it only from client components (`'use client'`).

> Server-side scope: LuminaJS is not a Node.js/server-side processor. Use Sharp/Jimp/ImageMagick for backend image workflows.

```tsx
import { LuminaCanvas } from '@gks101/luminajs/react';
```

Use `LuminaCanvas` when you want a processed canvas in your UI. Use `ImageCropper` when you want a complete drag-to-crop interface, and use `useLumina` when you need hook state without rendering a canvas.

## Basic Usage

```tsx
export function BasicCanvas() {
  return (
    <LuminaCanvas
      source="/photo.jpg"
      grayscale
      brightness={20}
      width={640}
      height={420}
    />
  );
}
```

`LuminaCanvas` also accepts normal canvas attributes such as `className`, `width`, `height`, `style`, `aria-label`, and event handlers.

## Props

| Prop             | Type                                                                           | Description                                                                       |
| ---------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `source`         | `string \| File \| HTMLImageElement \| HTMLCanvasElement \| ImageData \| null` | Image input to process. Nothing renders while `source` is `null`.                 |
| `filter`         | `(chain: Lumina) => Lumina`                                                    | Optional callback for custom chain operations. Runs after explicit editing props. |
| `onLoad`         | `() => void`                                                                   | Called after the image is processed and drawn to the canvas.                      |
| `onProcessError` | `(error: Error) => void`                                                       | Called when processing fails.                                                     |
| `getImage`       | `(data: string \| Blob \| ImageData \| HTMLCanvasElement) => void`             | Receives the processed output after rendering.                                    |
| `outputType`     | `'canvas' \| 'dataUrl' \| 'blob' \| 'imageData'`                               | Format sent to `getImage`. Defaults to `'canvas'`.                                |

## Editing Options

These props are applied in this order before `filter`: `grayscale`, `brightness`, `contrast`, `sepia`, `ascii`, `blur`, `gaussianBlur`, `watermark`, `backgroundBlur`, `sharpen`, `emboss`, `edgeDetection`, `resize`, `crop`.

| Prop             | Type                                                      | Example                                            |
| ---------------- | --------------------------------------------------------- | -------------------------------------------------- |
| `grayscale`      | `boolean`                                                 | `grayscale`                                        |
| `brightness`     | `number`                                                  | `brightness={25}`                                  |
| `contrast`       | `number`                                                  | `contrast={15}`                                    |
| `sepia`          | `boolean`                                                 | `sepia`                                            |
| `ascii`          | `boolean \| Record<string, unknown>`                      | `ascii`                                            |
| `blur`           | `number`                                                  | `blur={3}`                                         |
| `gaussianBlur`   | `number`                                                  | `gaussianBlur={4}`                                 |
| `watermark`      | `{ text: string; options?: Record<string, unknown> }`     | `watermark={{ text: 'LuminaJS' }}`                 |
| `backgroundBlur` | `Record<string, unknown>`                                 | `backgroundBlur={{ sigma: 6 }}`                    |
| `sharpen`        | `boolean`                                                 | `sharpen`                                          |
| `emboss`         | `boolean`                                                 | `emboss`                                           |
| `edgeDetection`  | `boolean`                                                 | `edgeDetection`                                    |
| `resize`         | `{ width: number; height: number }`                       | `resize={{ width: 800, height: 600 }}`             |
| `crop`           | `{ x: number; y: number; width: number; height: number }` | `crop={{ x: 40, y: 40, width: 300, height: 300 }}` |

## Examples

### Export a Processed Data URL

```tsx
import { useCallback, useState } from 'react';
import { LuminaCanvas } from '@gks101/luminajs/react';

export function DownloadablePreview() {
  const [dataUrl, setDataUrl] = useState('');

  const handleImage = useCallback(
    (data: string | Blob | ImageData | HTMLCanvasElement) => {
      if (typeof data === 'string') {
        setDataUrl(data);
      }
    },
    [],
  );

  return (
    <>
      <LuminaCanvas
        source="/photo.jpg"
        resize={{ width: 800, height: 600 }}
        sharpen
        outputType="dataUrl"
        getImage={handleImage}
        width={800}
        height={600}
      />

      <a href={dataUrl} download="processed.png">
        Download
      </a>
    </>
  );
}
```

### Process an Uploaded File

```tsx
import { useMemo, useState } from 'react';
import { LuminaCanvas } from '@gks101/luminajs/react';

export function UploadEditor() {
  const [file, setFile] = useState<File | null>(null);
  const resize = useMemo(() => ({ width: 600, height: 400 }), []);

  return (
    <section>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />

      <LuminaCanvas
        source={file}
        brightness={10}
        contrast={12}
        resize={file ? resize : undefined}
        gaussianBlur={file ? 1 : undefined}
        width={600}
        height={400}
      />
    </section>
  );
}
```

### Replace the Canvas Source After Cropping

`LuminaCanvas` can render a cropped result from `ImageCropper`, a data URL, a `Blob` converted to an object URL, or the original image.

```tsx
import { useState } from 'react';
import { ImageCropper, LuminaCanvas } from '@gks101/luminajs/react';

export function CropThenFilter() {
  const [source, setSource] = useState<string | null>('/photo.jpg');

  return (
    <>
      <ImageCropper
        src={source}
        aspectRatio={1}
        outputFormat="dataUrl"
        onCropComplete={(result) => {
          if (typeof result === 'string') setSource(result);
        }}
      />

      <LuminaCanvas
        source={source}
        brightness={8}
        sharpen
        outputType="dataUrl"
        getImage={(data) => console.log('Processed crop:', data)}
        width={400}
        height={400}
      />
    </>
  );
}
```

### Live Filter Controls

```tsx
import { useMemo, useState } from 'react';
import { LuminaCanvas } from '@gks101/luminajs/react';

export function LiveControls() {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const resize = useMemo(() => ({ width: 800, height: 500 }), []);

  return (
    <>
      <input
        type="range"
        min="-100"
        max="100"
        value={brightness}
        onChange={(event) => setBrightness(Number(event.target.value))}
      />
      <input
        type="range"
        min="-100"
        max="100"
        value={contrast}
        onChange={(event) => setContrast(Number(event.target.value))}
      />

      <LuminaCanvas
        source="/photo.jpg"
        resize={resize}
        brightness={brightness}
        contrast={contrast}
        width={800}
        height={500}
      />
    </>
  );
}
```

### Crop, Resize, and Watermark

```tsx
import { LuminaCanvas } from '@gks101/luminajs/react';

export function WatermarkedCrop() {
  return (
    <LuminaCanvas
      source="/landscape.jpg"
      crop={{ x: 80, y: 40, width: 900, height: 600 }}
      resize={{ width: 450, height: 300 }}
      watermark={{
        text: 'LuminaJS',
        options: {
          x: 24,
          y: 48,
          font: '32px Arial',
          color: 'rgba(255,255,255,0.75)',
        },
      }}
      outputType="blob"
      getImage={(blob) => {
        if (blob instanceof Blob) {
          console.log('Ready to upload:', blob);
        }
      }}
      width={450}
      height={300}
    />
  );
}
```

### Custom Chain Operations

Use `filter` when the preset props do not express the full pipeline.

```tsx
import { useCallback } from 'react';
import { LuminaCanvas } from '@gks101/luminajs/react';
import type { Lumina } from '@gks101/luminajs';

export function CustomPipeline() {
  const filter = useCallback((chain: Lumina) => {
    return chain.resize(500, 500).sepia().brightness(15).sharpen();
  }, []);

  return (
    <LuminaCanvas
      source="/portrait.jpg"
      filter={filter}
      width={500}
      height={500}
    />
  );
}
```

## Error Handling

```tsx
<LuminaCanvas
  source="/missing-image.jpg"
  onLoad={() => console.log('Image processed')}
  onProcessError={(error) => {
    console.error('Lumina processing failed:', error.message);
  }}
/>
```

When processing fails, the component renders a `<div className="lumina-error">` with the error message.

## Best Practices

- Memoize `filter`, `getImage`, `onLoad`, and `onProcessError` with `useCallback` when they depend on React state.
- Keep `resize`, `crop`, `watermark`, and `backgroundBlur` objects stable with `useMemo` in highly interactive screens.
- Use `ImageCropper` for user-driven crop selection; use `LuminaCanvas` for rendering a known source or crop.
- Prefer `outputType="blob"` for uploads and `outputType="dataUrl"` for previews or downloads.
- Set explicit `width` and `height` attributes when you know the intended output size.
- Use `source={null}` while waiting for a user upload or async image selection.
- Put simple edits in props and reserve `filter` for custom chains.
- Remember that `filter` runs after the explicit editing props, so avoid duplicating the same operation in both places unless order is intentional.

## ImageCropper - Props

This repository includes the ImageCropper component. New props were added to allow customizing the Apply Crop and Reset buttons:

- allowResize: boolean (optional) - Shows resize handles on the crop area so users can adjust an existing selection before applying. Default: true.
- applyButtonClassName: string (optional) - CSS class for the Apply button.
- applyButtonStyle: CSSProperties (optional) - Inline style object for the Apply button.
- resetButtonClassName: string (optional) - CSS class for the Reset button.
- resetButtonStyle: CSSProperties (optional) - Inline style object for the Reset button.
- buttonPosition: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-center' | 'bottom-right' (optional) - Position of the Apply/Reset button container. Default: 'top-left'.
- zIndex: number (internal) - The button container uses a high z-index (1001) to ensure the buttons render above the image selection overlay.
- onApply: (crop) => boolean | void | Promise<boolean | void> (optional) - Callback invoked when the Apply button is clicked. Returning `false` (or a Promise resolving to `false`) will abort the component's default apply behavior.
- onReset: () => boolean | void | Promise<boolean | void> (optional) - Callback invoked when Reset is clicked. Returning `false` will abort the default reset.

These props are optional and backward-compatible.
