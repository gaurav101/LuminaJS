# ImageCropper Tool Guide

This guide covers the LuminaJS React cropping tools.

> Browser-only tools: `ImageCropper`, `ImageAreaSelector`, and `useLumina` are client-side Canvas features.
> In Next.js/SSR apps, use them only in client components (`'use client'`).

> Server-side scope: LuminaJS does not implement Node.js/server-side image processing pipelines.
> Use Sharp/Jimp/ImageMagick for backend transformations.

## Overview

LuminaJS provides three ways to build cropping workflows:

1. **`ImageCropper`** - High-level cropper. Draw a crop area, resize it with handles, then click Apply Crop. Full mobile touch support including pinch-to-resize.
2. **`ImageAreaSelector`** - Low-level selector for custom crop UIs with move, resize interactions, and native multi-touch gestures (pinch-to-resize).
3. **`useLumina`** - Hook for custom crop, filter, upload, and save workflows.

---

## ImageCropper Recommended

`ImageCropper` is the quickest way to add image cropping to a React app. The user selects an area directly on the image, can drag handles to resize it, and clicks Apply Crop when ready. LuminaJS then crops the image and replaces the original selector with a `LuminaCanvas` rendering of the cropped result.

The built-in Reset button reloads the original image selector so the user can crop again.

### Basic Usage

```tsx
import { ImageCropper } from '@gks101/luminajs/react';

export function AvatarCropper() {
  const handleCropComplete = (croppedImage: Blob | string) => {
    console.log('Cropped image:', croppedImage);
  };

  return (
    <ImageCropper
      src="/photo.jpg"
      aspectRatio={1}
      outputFormat="blob"
      onCropComplete={handleCropComplete}
    />
  );
}
```

### Props

| Prop             | Type                                                                           | Default  | Description                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src`            | `string \| File \| HTMLImageElement \| HTMLCanvasElement \| ImageData \| null` | —        | Image source.                                                                                                               |
| `onCropComplete` | `(result: Blob \| string) => void`                                             | —        | Called automatically after the user finishes selecting a crop area.                                                         |
| `onError`        | `(error: Error) => void`                                                       | —        | Called when source loading or crop processing fails.                                                                        |
| `aspectRatio`    | `number`                                                                       | —        | Optional fixed crop aspect ratio, expressed as `width / height`.                                                            |
| `outputFormat`   | `'blob' \| 'dataUrl'`                                                          | `'blob'` | Output format passed to `onCropComplete`.                                                                                   |
| `maxWidth`       | `number`                                                                       | `600`    | Maximum width of the cropper frame.                                                                                         |
| `maxHeight`      | `number`                                                                       | `400`    | Maximum height of the cropper frame.                                                                                        |
| `allowReset`     | `boolean`                                                                      | `true`   | Shows a Reset button after a crop is applied. Set `false` to hide it.                                                       |
| `allowResize`    | `boolean`                                                                      | `true`   | Shows handles for resizing an existing crop selection before applying.                                                      |
| `showPreview`    | `boolean`                                                                      | `true`   | Shows the applied crop result inside the cropper after Apply. Set `false` for parent-managed previews or upload-only flows. |
| `className`      | `string`                                                                       | —        | CSS class name for the wrapper.                                                                                             |
| `style`          | `React.CSSProperties`                                                          | —        | Inline styles for the wrapper.                                                                                              |

### Common Aspect Ratios

```tsx
<ImageCropper src={imageUrl} aspectRatio={1} />        // Square avatar
<ImageCropper src={imageUrl} aspectRatio={16 / 9} />   // Landscape banner
<ImageCropper src={imageUrl} aspectRatio={9 / 16} />   // Portrait story
<ImageCropper src={imageUrl} aspectRatio={4 / 5} />    // Social post
```

### File Upload and Auto Crop

```tsx
import { useState } from 'react';
import { ImageCropper } from '@gks101/luminajs/react';

export function UploadCropper() {
  const [file, setFile] = useState<File | null>(null);
  const [croppedUrl, setCroppedUrl] = useState('');

  const handleCropComplete = (result: Blob | string) => {
    if (result instanceof Blob) {
      setCroppedUrl(URL.createObjectURL(result));
    } else {
      setCroppedUrl(result);
    }
  };

  return (
    <section>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />

      {file && (
        <ImageCropper
          src={file}
          aspectRatio={1}
          outputFormat="blob"
          onCropComplete={handleCropComplete}
          onError={(error) => console.error(error.message)}
        />
      )}

      {croppedUrl && <img src={croppedUrl} alt="Cropped result" />}
    </section>
  );
}
```

### Upload Cropped Blob

```tsx
import { ImageCropper } from '@gks101/luminajs/react';

export function ProfilePhotoCropper({ src }: { src: File | string }) {
  const uploadAvatar = async (result: Blob | string) => {
    if (!(result instanceof Blob)) return;

    const formData = new FormData();
    formData.append('avatar', result, 'avatar.png');

    await fetch('/api/avatar', {
      method: 'POST',
      body: formData,
    });
  };

  return (
    <ImageCropper
      src={src}
      aspectRatio={1}
      outputFormat="blob"
      maxWidth={500}
      maxHeight={500}
      onCropComplete={uploadAvatar}
    />
  );
}
```

### Data URL Output

Use `outputFormat="dataUrl"` when the cropped result should be stored in component state or shown in an `<img>` without creating an object URL.

```tsx
import { useState } from 'react';
import { ImageCropper } from '@gks101/luminajs/react';

export function DataUrlCropper() {
  const [preview, setPreview] = useState('');

  return (
    <>
      <ImageCropper
        src="/product.jpg"
        aspectRatio={4 / 3}
        outputFormat="dataUrl"
        onCropComplete={(result) => {
          if (typeof result === 'string') setPreview(result);
        }}
      />

      {preview && <img src={preview} alt="Cropped product" />}
    </>
  );
}
```

### Hide Reset

```tsx
<ImageCropper
  src="/photo.jpg"
  aspectRatio={16 / 9}
  allowReset={false}
  onCropComplete={(result) => console.log(result)}
/>
```

---

## ImageAreaSelector

`ImageAreaSelector` is the low-level crop selection component. It does not process the image by itself. Use it when you need a custom UI, multiple crop outputs, or filters before saving. Users can draw a crop area, move it, and resize it with handles. It includes full touch support for mobile devices, including two-finger pinch-to-resize gestures.

### Basic Usage

```tsx
import { ImageAreaSelector, type CropArea } from '@gks101/luminajs/react';
import { useState } from 'react';

export function ManualSelector() {
  const [crop, setCrop] = useState<CropArea | null>(null);

  return (
    <>
      <ImageAreaSelector
        src="/photo.jpg"
        aspect={16 / 9}
        allowResize={true}
        onCropChange={setCrop}
        onCropComplete={(finalCrop) => {
          console.log('Final crop:', finalCrop);
        }}
      />

      {crop && <pre>{JSON.stringify(crop, null, 2)}</pre>}
    </>
  );
}
```

### Props

| Prop             | Type                       | Default  | Description                                                 |
| ---------------- | -------------------------- | -------- | ----------------------------------------------------------- |
| `src`            | `string`                   | —        | Image URL to display.                                       |
| `onCropChange`   | `(crop: CropArea) => void` | —        | Called while the user is dragging the crop selection.       |
| `onCropComplete` | `(crop: CropArea) => void` | —        | Called once when the user finishes the selection.           |
| `aspect`         | `number`                   | —        | Optional fixed aspect ratio, expressed as `width / height`. |
| `lineWidth`      | `number`                   | `2`      | Border line width in pixels.                                |
| `lineColor`      | `string`                   | `'#fff'` | Border color.                                               |
| `overlayOpacity` | `number`                   | `0.5`    | Opacity of the dark overlay outside the selection.          |
| `allowResize`    | `boolean`                  | `true`   | Shows resize handles on the selected crop area.             |

### CropArea

```tsx
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

All crop values are measured in original image pixels, not displayed CSS pixels.

---

## Custom Workflow with useLumina

Use `ImageAreaSelector` with `useLumina` when you want filters, resize, watermarking, or multiple outputs.

```tsx
import {
  ImageAreaSelector,
  useLumina,
  type CropArea,
} from '@gks101/luminajs/react';
import { useState } from 'react';

export function FilteredCrop() {
  const [crop, setCrop] = useState<CropArea | null>(null);

  const { result, loading, error } = useLumina<string>({
    source: '/portrait.jpg',
    crop: crop ?? undefined,
    resize: crop ? { width: 400, height: 400 } : undefined,
    brightness: 10,
    sharpen: true,
    outputType: 'dataUrl',
  });

  return (
    <>
      <ImageAreaSelector
        src="/portrait.jpg"
        aspect={1}
        onCropChange={setCrop}
      />

      {loading && <p>Processing...</p>}
      {error && <p>{error.message}</p>}
      {result && <img src={result} alt="Filtered crop" />}
    </>
  );
}
```

## Best Practices

- Use `ImageCropper` for standard upload, avatar, product, banner, and social image crops.
- Use `outputFormat="blob"` for uploads.
- Use `outputFormat="dataUrl"` for immediate image previews.
- Keep `allowReset` enabled when users may need to adjust the crop after seeing the result.
- Use `ImageAreaSelector` and `useLumina` for advanced workflows with filters, multiple crops, or custom controls.
- Revoke object URLs you create in parent components when they are no longer needed.
- Use `onError` to surface invalid image sources, CORS failures, or crop processing issues.

## Troubleshooting

### Crop applies immediately

This is expected. `ImageCropper` applies the crop when the user releases the pointer after selecting an area.

### I need an Apply button

Use `ImageAreaSelector` and call `useLumina` or `lumina(source).crop(...)` from your own button handler.

### Reset does not show

The Reset button only appears after a crop has been applied. Check that `allowReset` is not set to `false`.

### Remote image fails to crop

Remote images must be accessible to the browser canvas. If you see CORS errors, use same-origin images, upload the file locally, or serve the image with the correct CORS headers.

## See Also

- [LuminaCanvas Documentation](./LuminaCanvas.md)
- [useLumina Hook Documentation](./useLumina.md)
- [LuminaJS Core API](./README.md)

## ImageCropper - Props

This repository includes the ImageCropper component. New props were added to allow customizing the Apply Crop and Reset buttons:

- applyButtonClassName: string (optional) - CSS class for the Apply button.
- applyButtonStyle: CSSProperties (optional) - Inline style object for the Apply button.
- resetButtonClassName: string (optional) - CSS class for the Reset button.
- resetButtonStyle: CSSProperties (optional) - Inline style object for the Reset button.
- buttonPosition: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-center' | 'bottom-right' (optional) - Position of the Apply/Reset button container. Default: 'top-left'.
- zIndex: number (internal) - The button container uses a high z-index (1001) to ensure the buttons render above the image selection overlay.
- onApply: (crop) => boolean | void | Promise<boolean | void> (optional) - Callback invoked when the Apply button is clicked. Returning `false` (or a Promise resolving to `false`) will abort the component's default apply behavior.
- onReset: () => boolean | void | Promise<boolean | void> (optional) - Callback invoked when Reset is clicked. Returning `false` will abort the default reset.

These props are optional and backward-compatible.
