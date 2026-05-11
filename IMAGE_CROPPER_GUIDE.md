# ImageCropper Tool Guide

This guide covers the image cropping tools available in LuminaJS React components.

## Overview

LuminaJS provides three components for image cropping:

1. **`ImageAreaSelector`** - Low-level interactive crop area selection
2. **`ImageCropper`** - High-level complete cropping interface with preview and controls
3. **`useLumina` hook** - For custom cropping workflows

---

## ImageCropper (Recommended)

The `ImageCropper` component provides a complete, production-ready image cropping interface.

### Basic Usage

```tsx
import { ImageCropper } from '@lumina/react';

export function App() {
  const handleCropComplete = (croppedBlob: Blob) => {
    const url = URL.createObjectURL(croppedBlob);
    console.log('Cropped image:', url);
  };

  return <ImageCropper src="photo.jpg" onCropComplete={handleCropComplete} />;
}
```

### Props

| Prop             | Type                                                                           | Default  | Description                                       |
| ---------------- | ------------------------------------------------------------------------------ | -------- | ------------------------------------------------- |
| `src`            | `string \| File \| HTMLImageElement \| HTMLCanvasElement \| ImageData \| null` | —        | Image source (URL, File, or canvas element)       |
| `onCropComplete` | `(result: Blob \| string) => void`                                             | —        | Callback when crop is applied                     |
| `onError`        | `(error: Error) => void`                                                       | —        | Callback for errors                               |
| `aspectRatio`    | `number`                                                                       | —        | Optional aspect ratio to enforce (width / height) |
| `outputFormat`   | `'blob' \| 'dataUrl'`                                                          | `'blob'` | Output format for cropped image                   |
| `maxWidth`       | `number`                                                                       | `600`    | Maximum width of the cropper container            |
| `maxHeight`      | `number`                                                                       | `400`    | Maximum height of the cropper container           |
| `showPreview`    | `boolean`                                                                      | `true`   | Show the cropped preview pane                     |
| `allowReset`     | `boolean`                                                                      | `true`   | Show the reset button                             |
| `className`      | `string`                                                                       | —        | CSS class name                                    |
| `style`          | `React.CSSProperties`                                                          | —        | Inline styles                                     |

### Examples

#### Square Crop (1:1)

```tsx
<ImageCropper src={imageUrl} aspectRatio={1} />
```

#### Portrait Aspect (9:16)

```tsx
<ImageCropper src={imageUrl} aspectRatio={9 / 16} />
```

#### Landscape Aspect (16:9 - HD)

```tsx
<ImageCropper src={imageUrl} aspectRatio={16 / 9} />
```

#### Instagram Post (1.2:1)

```tsx
<ImageCropper src={imageUrl} aspectRatio={1.2} />
```

#### File Upload + Crop

```tsx
import { useState, useRef } from 'react';
import { ImageCropper } from '@lumina/react';

export function CropUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setResult(croppedBlob);
  };

  return (
    <>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      {file && (
        <ImageCropper
          src={file}
          aspectRatio={16 / 9}
          onCropComplete={handleCropComplete}
        />
      )}
      {result && (
        <img
          src={URL.createObjectURL(result)}
          alt="Cropped"
          style={{ maxWidth: '100%' }}
        />
      )}
    </>
  );
}
```

---

## ImageAreaSelector

Low-level component for interactive crop area selection. Useful if you need custom control over the cropping logic.

### Basic Usage

```tsx
import { ImageAreaSelector, type CropArea } from '@lumina/react';
import { useState } from 'react';

export function CustomCropper() {
  const [crop, setCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const handleCropChange = (newCrop: CropArea) => {
    setCrop(newCrop);
    console.log('Crop area:', newCrop);
  };

  return <ImageAreaSelector src="photo.jpg" onCropChange={handleCropChange} />;
}
```

### Props

| Prop             | Type                       | Default  | Description                        |
| ---------------- | -------------------------- | -------- | ---------------------------------- |
| `src`            | `string`                   | —        | Image URL to display               |
| `onCropChange`   | `(crop: CropArea) => void` | —        | Callback when crop area changes    |
| `aspect`         | `number`                   | —        | Optional aspect ratio to enforce   |
| `lineWidth`      | `number`                   | `2`      | Border line width in pixels        |
| `lineColor`      | `string`                   | `'#fff'` | Border color (CSS color value)     |
| `overlayOpacity` | `number`                   | `0.5`    | Opacity of darkened surround (0-1) |

### CropArea Interface

```tsx
interface CropArea {
  x: number; // Left position in pixels
  y: number; // Top position in pixels
  width: number; // Crop width in pixels
  height: number; // Crop height in pixels
}
```

### Custom Styling Example

```tsx
<ImageAreaSelector
  src="photo.jpg"
  onCropChange={handleCropChange}
  aspect={1}
  lineWidth={3}
  lineColor="#00ff00"
  overlayOpacity={0.7}
/>
```

---

## Combining ImageAreaSelector with useLumina

For advanced workflows where you need custom filtering + cropping:

```tsx
import { ImageAreaSelector, useLumina, type CropArea } from '@lumina/react';
import { useState } from 'react';

export function FilterAndCrop() {
  const [crop, setCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Apply filters AND crop
  const { result } = useLumina({
    source: 'photo.jpg',
    grayscale: true, // Add filter
    brightness: 20, // Add filter
    crop, // Apply crop
    outputType: 'blob',
  });

  return (
    <>
      <ImageAreaSelector
        src="photo.jpg"
        onCropChange={setCrop}
        aspect={16 / 9}
      />
      {result && (
        <img
          src={URL.createObjectURL(result)}
          alt="Processed"
          style={{ maxWidth: '100%' }}
        />
      )}
    </>
  );
}
```

---

## Using ImageCropper with Other Filters

Since `ImageCropper` internally uses `LuminaCanvas`, you can leverage the `filter` prop on `LuminaCanvas` for advanced workflows:

```tsx
import { ImageCropper } from '@lumina/react';

export function FilterAndCrop() {
  const handleCropComplete = (croppedBlob: Blob) => {
    console.log('Cropped and filtered:', croppedBlob);
  };

  return (
    <ImageCropper
      src="photo.jpg"
      aspectRatio={1}
      onCropComplete={handleCropComplete}
    />
  );
}
```

> **Note:** The current `ImageCropper` component focuses on the cropping workflow. For combining filters with cropping, use `useLumina` + `ImageAreaSelector` as shown above.

---

## Common Patterns

### Pattern 1: File Upload with Preview and Crop

```tsx
import { useState, useRef } from 'react';
import { ImageCropper } from '@lumina/react';

export function UploadCrop() {
  const [file, setFile] = useState<File | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith('image/')) {
      setFile(f);
    }
  };

  const handleCropComplete = (blob: Blob) => {
    setCroppedUrl(URL.createObjectURL(blob));
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current?.click()}>
        Select Image
      </button>

      {file && (
        <ImageCropper
          src={file}
          aspectRatio={1}
          onCropComplete={handleCropComplete}
        />
      )}

      {croppedUrl && (
        <div>
          <h3>Result:</h3>
          <img src={croppedUrl} alt="Cropped" />
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: Profile Picture Cropper

```tsx
export function ProfilePictureCropper() {
  const handleCropComplete = async (blob: Blob) => {
    // Upload to server
    const formData = new FormData();
    formData.append('avatar', blob, 'profile.png');

    const response = await fetch('/api/upload-avatar', {
      method: 'POST',
      body: formData,
    });

    console.log('Avatar uploaded:', response.ok);
  };

  return (
    <ImageCropper
      src={userPhoto}
      aspectRatio={1}
      outputFormat="blob"
      maxWidth={500}
      maxHeight={500}
      onCropComplete={handleCropComplete}
    />
  );
}
```

### Pattern 3: Multiple Crops (e.g., Banner + Thumbnail)

```tsx
import { ImageAreaSelector, useLumina, type CropArea } from '@lumina/react';
import { useState } from 'react';

export function MultipleCrops() {
  const [bannerCrop, setBannerCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [thumbCrop, setThumbCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const { result: banner } = useLumina({
    source: 'photo.jpg',
    crop: bannerCrop,
    outputType: 'blob',
  });

  const { result: thumbnail } = useLumina({
    source: 'photo.jpg',
    crop: thumbCrop,
    outputType: 'blob',
  });

  return (
    <>
      <h3>Banner (16:9)</h3>
      <ImageAreaSelector
        src="photo.jpg"
        onCropChange={setBannerCrop}
        aspect={16 / 9}
      />

      <h3>Thumbnail (1:1)</h3>
      <ImageAreaSelector
        src="photo.jpg"
        onCropChange={setThumbCrop}
        aspect={1}
      />

      <div>
        {banner && <img src={URL.createObjectURL(banner)} alt="Banner" />}
        {thumbnail && (
          <img src={URL.createObjectURL(thumbnail)} alt="Thumbnail" />
        )}
      </div>
    </>
  );
}
```

---

## API Reference

### CropArea

```tsx
interface CropArea {
  x: number; // Left offset in pixels
  y: number; // Top offset in pixels
  width: number; // Width in pixels
  height: number; // Height in pixels
}
```

All values are in **pixels** and calculated from the **original image dimensions** (not the displayed size).

### Output Formats

- **`'blob'`** - Returns a `Blob` object. Useful for uploading to a server.
- **`'dataUrl'`** - Returns a data URL string. Useful for previewing in `<img src>`.

---

## Styling

### CSS Classes

The components use inline styles but respect the `className` and `style` props:

```tsx
<ImageCropper
  src={imageUrl}
  className="my-custom-cropper"
  style={{ backgroundColor: '#fafafa' }}
/>
```

### Customizing Colors

For `ImageAreaSelector`, use the props:

```tsx
<ImageAreaSelector
  src={imageUrl}
  lineColor="#ff0000" // Red border
  overlayOpacity={0.8} // Darker overlay
/>
```

---

## Performance Tips

1. **Lazy load images** - Use file URLs or data URLs instead of loading remote images repeatedly.
2. **Memoize callbacks** - Wrap `onCropComplete` and `onError` in `useCallback` to prevent unnecessary re-renders.
3. **Limit preview updates** - The preview re-renders on every crop change; debounce if needed:

```tsx
import { useDeferredValue } from 'react';

const deferredCrop = useDeferredValue(crop);

const { result } = useLumina({
  source: imageSrc,
  crop: deferredCrop, // Deferred updates
  outputType: 'blob',
});
```

---

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 13+)
- IE 11: ❌ Not supported (requires modern Canvas API)

---

## Troubleshooting

### Crop not being applied

- Ensure `crop.width > 0` and `crop.height > 0`
- Check that the image source is valid and loaded

### Preview not showing

- Set `showPreview={true}` (default)
- Ensure the image source is accessible

### CORS errors

- Remote images must have CORS headers
- Use a proxy or upload the file locally

### Performance issues

- Reduce `maxWidth` and `maxHeight` to lower canvas size
- Use smaller source images
- Debounce crop updates (see Performance Tips)

---

## See Also

- [LuminaCanvas Documentation](./LuminaCanvas.md)
- [useLumina Hook Documentation](./useLumina.md)
- [LuminaJS Core API](../core/README.md)
