# LuminaJS React Example

A comprehensive React + TypeScript example showcasing the LuminaJS image processing library with real-time image filters and transformations.

## Features

- **Live Image Processing**: Apply filters in real-time with the `LuminaCanvas` component
- **Multiple Filter Effects**: Grayscale, sepia, blur, sharpen, emboss, edge detection, and more
- **Advanced Transformations**: Resize, crop, brightness, contrast adjustments
- **Watermarking**: Add custom text watermarks with configurable position, size, and color
- **ASCII Art Generation**: Convert images to ASCII art using the `useLumina` hook
- **Background Blur (Portrait Mode)**: Apply depth-of-field effects
- **Image Download**: Export processed images as PNG files
- **Responsive UI**: Modern, interactive control panel with live preview

## Getting Started

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Bug Fix: Infinite Loading Issue

### Issue

The `/sample.png` image was loading infinitely when the app was running. This was caused by inline object and function creation in the React component.

### Root Cause

- `resize` configuration objects were recreated on every render as new object instances
- The `operations` callback function was recreated on every render
- This caused the `useLumina` hook's dependency array to change on every render, triggering infinite re-renders

### Solution

Implemented proper memoization using React hooks:

```typescript
// Memoize operations to prevent infinite loops
const asciiOperation = useCallback((chain) => chain.ascii(), []);
const asciiResizeConfig = useMemo(() => ({ width: 100, height: 50 }), []);
const thumbnailResizeConfig = useMemo(() => ({ width: 200, height: 150 }), []);

// Pass stable references to useLumina hooks
const { result: asciiText, loading: asciiLoading } = useLumina<string>({
  source: '/sample.png',
  resize: asciiResizeConfig,
  operations: asciiOperation,
  outputType: undefined,
});
```

### Key Improvements

- Used `useCallback` to memoize the `operations` function
- Used `useMemo` to memoize configuration objects
- Ensured stable references across renders to prevent unnecessary re-processing
- Image now loads successfully without infinite loops

## Available Scripts

- `npm run dev` - Start the development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React** 18+ with TypeScript
- **Vite** - Next generation frontend tooling
- **LuminaJS** - Advanced image processing library
- **Vite Plugin React** - Fast Refresh support
