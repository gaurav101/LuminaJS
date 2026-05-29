import type { CanvasDemoState } from '../types/demo';

const escapeJsxString = (value: string) => value.replace(/"/g, '\\"');

export const generateCanvasCode = (state: CanvasDemoState) => {
  const lines = ['<LuminaCanvas', '  source="./sample.png"'];

  lines.push(`  brightness={${state.brightness}}`);
  lines.push(`  contrast={${state.contrast}}`);

  if (state.isResized) {
    lines.push(`  resize={{ width: ${state.width}, height: ${state.height} }}`);
  }

  if (state.isCropped) {
    lines.push(
      `  crop={{ x: ${state.cropX}, y: ${state.cropY}, width: ${state.cropW}, height: ${state.cropH} }}`,
    );
  }

  if (state.filterType === 'grayscale') lines.push('  grayscale={true}');
  if (state.filterType === 'sepia') lines.push('  sepia={true}');
  if (state.filterType === 'blur') lines.push('  gaussianBlur={5}');
  if (state.filterType === 'sharpen') lines.push('  sharpen={true}');
  if (state.filterType === 'emboss') lines.push('  emboss={true}');
  if (state.filterType === 'edge') lines.push('  edgeDetection={true}');

  if (state.bgBlur) {
    lines.push(
      '  backgroundBlur={{ sigma: 6, focusRadius: 150, falloff: 200 }}',
    );
  }

  if (state.watermarkText) {
    lines.push('  watermark={{');
    lines.push(`    text: "${escapeJsxString(state.watermarkText)}",`);
    lines.push('    options: {');
    lines.push(`      x: ${state.watermarkX},`);
    lines.push(`      y: ${state.watermarkY},`);
    lines.push(`      fontSize: ${state.watermarkSize},`);
    lines.push(`      fontFace: "${escapeJsxString(state.watermarkFont)}",`);
    lines.push(`      color: "${escapeJsxString(state.watermarkColor)}",`);
    lines.push('    },');
    lines.push('  }}');
  }

  lines.push('  outputType="dataUrl"');
  lines.push('  getImage={handleGetCanvasImage}');
  lines.push('/>');

  return lines.join('\n');
};
