# @gks101/react-lumina

React support for [LuminaJS](https://github.com/gaurav101/LuminaJS). Provides hooks and components for easy, reactive image processing in the browser.

## Installation

```bash
npm install @gks101/luminajs @gks101/react-lumina
```

## Features

- **`useLumina`**: A hook that manages image processing state (loading, result, error).
- **`LuminaCanvas`**: A declarative component to render processed images.

---

## Usage

### Using `useLumina` Hook

```jsx
import { useLumina } from '@gks101/react-lumina';

function ImagePreview({ file }) {
  const { result, loading, error } = useLumina({
    source: file,
    operations: (l) => l.grayscale().brightness(20),
    outputType: 'dataUrl', // Get a base64 string
    deps: [file]
  });

  if (loading) return <p>Processing...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <img src={result} alt="Processed" />;
}
```

### Using `LuminaCanvas` Component

```jsx
import { LuminaCanvas } from '@gks101/react-lumina';

function App() {
  return (
    <LuminaCanvas
      source="photo.jpg"
      filter={(l) => l.sepia().sharpen()}
      width={800}
      height={600}
      className="my-canvas"
    />
  );
}
```

## License

MIT
