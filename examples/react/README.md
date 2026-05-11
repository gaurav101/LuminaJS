# LuminaJS React Example

This example demonstrates how to use LuminaJS in a React application with TypeScript and Vite.

## Features Demonstrated

- Using the `useLumina` hook for image processing
- Using the `LuminaCanvas` component for canvas-based image manipulation
- Chainable API for applying multiple filters
- Real-time image processing with React state

## Getting Started

### Running Locally

```bash
# From the root directory
npm run serve:react

# Or using Nx directly
npx nx run examples-react:serve
```

### Building for Production

```bash
# From the root directory
npm run build:examples

# Or build just this example
npx nx run examples-react:build
```

## Usage

The example shows various ways to use LuminaJS:

1. **Hook-based approach**: Using `useLumina` for state management
2. **Component approach**: Using `LuminaCanvas` for direct canvas manipulation
3. **Chainable API**: Applying multiple filters in sequence

## Project Structure

```
src/
├── App.tsx          # Main application component
├── main.tsx         # Application entry point
└── assets/          # Static assets
```

## Dependencies

This example uses:

- React 19
- TypeScript
- Vite for build tooling
- LuminaJS (from the monorepo)
  ...reactDom.configs.recommended.rules,
  },
  });

```

```
