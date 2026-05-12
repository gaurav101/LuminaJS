# useLumina

`useLumina` is the React hook for processing images with LuminaJS while keeping loading, result, and error state in React.

```tsx
import { useLumina } from '@gks101/luminajs/react';
```

## Basic Usage

```tsx
export function PreviewImage() {
  const { result, loading, error } = useLumina<string>({
    source: '/photo.jpg',
    grayscale: true,
    brightness: 20,
    outputType: 'dataUrl',
  });

  if (loading) return <p>Processing...</p>;
  if (error) return <p>{error.message}</p>;

  return result ? <img src={result} alt="Processed preview" /> : null;
}
```

## Options

| Option       | Type                                                                           | Description                                                                         |
| ------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `source`     | `string \| File \| HTMLImageElement \| HTMLCanvasElement \| ImageData \| null` | Image input to process. Result is reset to `null` when `source` is `null`.          |
| `operations` | `(chain: Lumina) => Lumina`                                                    | Optional callback for custom chain operations. Runs after explicit editing options. |
| `deps`       | `unknown[]`                                                                    | Extra dependencies that should trigger reprocessing. Defaults to `[]`.              |
| `outputType` | `'imageData' \| 'dataUrl' \| 'blob'`                                           | Output format for `result`. Defaults to `'imageData'`.                              |

## Return Value

| Field      | Type                                                            | Description                                                                           |
| ---------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `result`   | `T \| null`                                                     | The processed output in the requested format.                                         |
| `loading`  | `boolean`                                                       | `true` while processing is running.                                                   |
| `error`    | `Error \| null`                                                 | Processing error, if one occurred.                                                    |
| `getImage` | `(overrideOutputType?: LuminaOutputType) => Promise<T \| null>` | Imperatively processes and returns an image. Can override the configured output type. |

## Editing Options

The hook supports the same editing options as `LuminaCanvas`: `grayscale`, `brightness`, `contrast`, `sepia`, `ascii`, `blur`, `gaussianBlur`, `watermark`, `backgroundBlur`, `sharpen`, `emboss`, `edgeDetection`, `resize`, and `crop`.

```tsx
useLumina({
  source: '/photo.jpg',
  crop: { x: 20, y: 20, width: 500, height: 500 },
  resize: { width: 250, height: 250 },
  contrast: 15,
  sharpen: true,
  outputType: 'dataUrl',
});
```

## Examples

### Generate a Thumbnail

```tsx
import { useMemo } from 'react';
import { useLumina } from '@gks101/luminajs/react';

export function Thumbnail() {
  const resize = useMemo(() => ({ width: 200, height: 150 }), []);

  const { result, loading } = useLumina<string>({
    source: '/photo.jpg',
    resize,
    grayscale: true,
    outputType: 'dataUrl',
  });

  if (loading) return <span>Processing...</span>;

  return result ? <img src={result} alt="Thumbnail" /> : null;
}
```

### Process an Uploaded File

```tsx
import { useState } from 'react';
import { useLumina } from '@gks101/luminajs/react';

export function UploadPreview() {
  const [file, setFile] = useState<File | null>(null);

  const { result, loading, error } = useLumina<string>({
    source: file,
    resize: { width: 640, height: 480 },
    brightness: 12,
    outputType: 'dataUrl',
  });

  return (
    <section>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />

      {loading && <p>Processing...</p>}
      {error && <p>{error.message}</p>}
      {result && <img src={result} alt="Processed upload" />}
    </section>
  );
}
```

### Export a Blob on Demand

```tsx
import { useMemo } from 'react';
import { useLumina } from '@gks101/luminajs/react';

export function UploadButton() {
  const resize = useMemo(() => ({ width: 1200, height: 800 }), []);

  const { getImage, loading } = useLumina<Blob>({
    source: '/photo.jpg',
    resize,
    sharpen: true,
    outputType: 'blob',
  });

  const upload = async () => {
    const blob = await getImage('blob');
    if (!blob) return;

    const formData = new FormData();
    formData.append('image', blob, 'processed.png');
    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
  };

  return (
    <button type="button" onClick={upload} disabled={loading}>
      Upload processed image
    </button>
  );
}
```

### Use Custom Chain Operations

Use `operations` when you need a custom Lumina pipeline. The callback receives the active chain and must return the chain.

```tsx
import { useCallback } from 'react';
import { useLumina } from '@gks101/luminajs/react';
import type { Lumina } from '@gks101/luminajs';

export function CustomHookPipeline() {
  const operations = useCallback((chain: Lumina) => {
    return chain.crop(50, 50, 500, 500).resize(250, 250).sepia();
  }, []);

  const { result } = useLumina<string>({
    source: '/portrait.jpg',
    operations,
    outputType: 'dataUrl',
  });

  return result ? <img src={result} alt="Custom processed output" /> : null;
}
```

### Reprocess When UI State Changes

Pass changing values in `deps` when they are used inside `operations`.

```tsx
import { useCallback, useState } from 'react';
import { useLumina } from '@gks101/luminajs/react';
import type { Lumina } from '@gks101/luminajs';

export function AdjustableBlur() {
  const [radius, setRadius] = useState(2);

  const operations = useCallback(
    (chain: Lumina) => chain.gaussianBlur(radius).sharpen(),
    [radius],
  );

  const { result } = useLumina<string>({
    source: '/photo.jpg',
    operations,
    deps: [radius],
    outputType: 'dataUrl',
  });

  return (
    <>
      <input
        type="range"
        min="0"
        max="10"
        value={radius}
        onChange={(event) => setRadius(Number(event.target.value))}
      />
      {result && <img src={result} alt="Blurred preview" />}
    </>
  );
}
```

### Generate ASCII Text

```tsx
import { useCallback, useMemo } from 'react';
import { useLumina } from '@gks101/luminajs/react';
import type { Lumina } from '@gks101/luminajs';

export function AsciiPreview() {
  const resize = useMemo(() => ({ width: 100, height: 50 }), []);
  const operations = useCallback((chain: Lumina) => chain.ascii(), []);

  const { result, loading } = useLumina<string>({
    source: '/photo.jpg',
    resize,
    operations,
  });

  return <pre>{loading ? 'Generating...' : result}</pre>;
}
```

## Best Practices

- Memoize `operations` with `useCallback`.
- Memoize object options such as `resize`, `crop`, `watermark`, and `backgroundBlur` with `useMemo` in interactive components.
- Use `outputType: 'dataUrl'` when rendering into an `<img>`.
- Use `outputType: 'blob'` when uploading or saving binary data.
- Use the default `imageData` output when you need pixel-level processing.
- Pass values used inside `operations` through `deps` so the hook reprocesses when those values change.
- Keep expensive processing away from every keystroke; debounce sliders or text fields when processing large images.
- Prefer explicit editing options for common filters and reserve `operations` for custom ordering or advanced chains.
- Handle all three states in the UI: `loading`, `error`, and `result`.
