# LuminaJS Vanilla JavaScript Example

This example demonstrates how to use LuminaJS in a plain JavaScript application with Vite.

## Features Demonstrated

- Using the chainable API directly in vanilla JavaScript
- Canvas-based image processing
- File input handling
- Real-time filter application

## Getting Started

### Running Locally

```bash
# From the root directory
npm run serve:vanilla-js

# Or using Nx directly
npx nx run examples-vanilla-js:serve
```

### Building for Production

```bash
# From the root directory
npm run build:examples

# Or build just this example
npx nx run examples-vanilla-js:build
```

## Usage

The example shows how to use LuminaJS without any framework:

1. **Direct API usage**: Using the `lumina()` function directly
2. **Canvas manipulation**: Working with HTML5 Canvas elements
3. **File handling**: Processing user-uploaded images
4. **Chainable operations**: Applying multiple filters in sequence

## Project Structure

```
src/
├── main.js          # Main application logic
├── style.css        # Application styles
└── assets/          # Static assets
```

## Dependencies

This example uses:

- Vanilla JavaScript (ES6+)
- Vite for build tooling
- LuminaJS (from the monorepo)
