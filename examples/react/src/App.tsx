import { useState, useCallback, useMemo } from 'react';
import { useLumina, LuminaCanvas } from '@gks101/luminajs/react';
import type { Lumina } from '../../../src/';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import './App.css';
import { ImageCropper } from '@gks101/luminajs/react';

const THEMED_CROPPER_CODE = `<ImageCropper
  src="sample.png"
  aspectRatio={16 / 9}
  className="cropper-shell"
  containerClassName="cropper-stage"
  buttonContainerClassName="cropper-controls"
  applyButtonClassName="cropper-btn cropper-btn-primary"
  resetButtonClassName="cropper-btn cropper-btn-secondary"
  processingOverlayClassName="cropper-processing"
  errorClassName="cropper-error"
  errorTextClassName="cropper-error-text"
  selectorSelectionClassName="cropper-selection"
  selectorHandleClassName="cropper-handle"
  selectorControlsContainerClassName="cropper-controls-anchor"
  selectorLineColor="#3b82f6"
  selectorOverlayOpacity={0.5}
  selectorAriaLabel="Avatar crop area"
  selectorAriaDescription="Use arrow keys to move the selection, Shift for larger movement, Alt with arrows to resize, Enter to confirm, Escape to clear."
  applyButtonAriaLabel="Apply avatar crop"
  resetButtonAriaLabel="Reset avatar crop"
  keyboardStep={2}
  keyboardStepLarge={16}
  processingLabel="Applying crop..."
/>`;

function App() {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [filterType, setFilterType] = useState<string>('none');
  const [watermarkText, setWatermarkText] = useState('LuminaJS');
  const [watermarkX, setWatermarkX] = useState(20);
  const [watermarkY, setWatermarkY] = useState(60);
  const [watermarkColor, setWatermarkColor] = useState('rgba(255,255,255,0.7)');
  const [watermarkSize, setWatermarkSize] = useState(40);
  const [watermarkFont, setWatermarkFont] = useState('Inter');
  const [bgBlur, setBgBlur] = useState(false);
  const [showAscii, setShowAscii] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string>('');
  // Transformation states
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [isResized, setIsResized] = useState(false);
  const [isCropped, setIsCropped] = useState(false);
  const [cropX, setCropX] = useState(100);
  const [cropY, setCropY] = useState(100);
  const [cropW, setCropW] = useState(400);
  const [cropH, setCropH] = useState(400);
  const [copiedPanel, setCopiedPanel] = useState<string | null>(null);
  const codeExtensions = useMemo(() => [javascript({ jsx: true })], []);
  const codeEditorSetup = useMemo(
    () => ({
      lineNumbers: true,
      foldGutter: false,
      highlightActiveLine: false,
      highlightActiveLineGutter: false,
    }),
    [],
  );

  // Memoize operations to prevent infinite loops
  const asciiOperation = useCallback((chain: Lumina) => chain.ascii(), []);
  const asciiResizeConfig = useMemo(() => ({ width: 100, height: 50 }), []);
  const thumbnailResizeConfig = useMemo(
    () => ({ width: 200, height: 150 }),
    [],
  );

  // ASCII logic
  const { result: asciiText, loading: asciiLoading } = useLumina<string>({
    source: '/sample.png',
    resize: asciiResizeConfig,
    operations: asciiOperation,
    outputType: undefined,
  });

  // Thumbnail preview
  const { result: thumbnail, getImage: getThumbnailImage } = useLumina<string>({
    source: '/sample.png',
    resize: thumbnailResizeConfig,
    grayscale: true,
    outputType: 'dataUrl',
  });

  const handleDownloadThumbnail = async () => {
    const data = await getThumbnailImage();
    if (data) {
      const link = document.createElement('a');
      link.href = data;
      link.download = 'lumina-thumbnail.png';
      link.click();
    }
  };

  const handleDownloadMain = () => {
    if (canvasDataUrl) {
      const link = document.createElement('a');
      link.href = canvasDataUrl;
      link.download = 'lumina-processed.png';
      link.click();
    }
  };

  const handleGetCanvasImage = useCallback(
    (data: string | Blob | ImageData | HTMLCanvasElement) => {
      if (typeof data === 'string') {
        setCanvasDataUrl(data);
      }
    },
    [],
  );

  const generatedCanvasCode = useMemo(() => {
    const lines = ['<LuminaCanvas', '  source="/sample.png"'];

    lines.push(`  brightness={${brightness}}`);
    lines.push(`  contrast={${contrast}}`);

    if (isResized) {
      lines.push(`  resize={{ width: ${width}, height: ${height} }}`);
    }

    if (isCropped) {
      lines.push(
        `  crop={{ x: ${cropX}, y: ${cropY}, width: ${cropW}, height: ${cropH} }}`,
      );
    }

    if (filterType === 'grayscale') lines.push('  grayscale={true}');
    if (filterType === 'sepia') lines.push('  sepia={true}');
    if (filterType === 'blur') lines.push('  gaussianBlur={5}');
    if (filterType === 'sharpen') lines.push('  sharpen={true}');
    if (filterType === 'emboss') lines.push('  emboss={true}');
    if (filterType === 'edge') lines.push('  edgeDetection={true}');

    if (bgBlur) {
      lines.push(
        '  backgroundBlur={{ sigma: 6, focusRadius: 150, falloff: 200 }}',
      );
    }

    if (watermarkText) {
      lines.push('  watermark={{');
      lines.push(`    text: "${watermarkText.replace(/"/g, '\\"')}",`);
      lines.push('    options: {');
      lines.push(`      x: ${watermarkX},`);
      lines.push(`      y: ${watermarkY},`);
      lines.push(`      fontSize: ${watermarkSize},`);
      lines.push(`      fontFace: "${watermarkFont.replace(/"/g, '\\"')}",`);
      lines.push(`      color: "${watermarkColor.replace(/"/g, '\\"')}",`);
      lines.push('    },');
      lines.push('  }}');
    }

    lines.push('  outputType="dataUrl"');
    lines.push('  getImage={handleGetCanvasImage}');
    lines.push('/>');

    return lines.join('\n');
  }, [
    bgBlur,
    brightness,
    contrast,
    cropH,
    cropW,
    cropX,
    cropY,
    filterType,
    isCropped,
    isResized,
    height,
    watermarkColor,
    watermarkFont,
    watermarkSize,
    watermarkText,
    watermarkX,
    watermarkY,
    width,
  ]);

  const copyCode = useCallback(async (panelId: string, code: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopiedPanel(panelId);
      setTimeout(() => {
        setCopiedPanel((current) => (current === panelId ? null : current));
      }, 1400);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, []);

  return (
    <div className="demo-container">
      <header>
        <h1>LuminaJS React Demo</h1>
        <p>
          A full showcase of the LuminaJS Image Processing Component Library
        </p>
        <div>
          <a href={'./storybook'}>View Story book demo</a>
          <a href={'./docs'}>Documentation</a>
        </div>
      </header>

      <main className="demo-grid">
        <section id="full-demo">
          <section className="preview-panel">
            <div className="card">
              <div className="card-header">
                <h3>{showAscii ? 'ASCII Output' : 'Live Canvas Output'}</h3>
                <div className="preview-actions">
                  {!showAscii && (
                    <button
                      className="toggle-btn"
                      onClick={handleDownloadMain}
                      disabled={!canvasDataUrl}
                    >
                      Download
                    </button>
                  )}
                  <button
                    className="toggle-btn"
                    onClick={() => {
                      setShowAscii(!showAscii);
                      console.log(asciiText);
                    }}
                  >
                    {showAscii ? 'Show Image' : 'Show ASCII'}
                  </button>
                </div>
              </div>

              <div className="display-area">
                {showAscii ? (
                  <pre className="ascii-box">
                    {asciiLoading ? 'Generating ASCII...' : asciiText}
                  </pre>
                ) : (
                  <LuminaCanvas
                    source="/sample.png"
                    className="main-canvas"
                    brightness={brightness}
                    contrast={contrast}
                    resize={isResized ? { width, height } : undefined}
                    crop={
                      isCropped
                        ? { x: cropX, y: cropY, width: cropW, height: cropH }
                        : undefined
                    }
                    grayscale={filterType === 'grayscale'}
                    sepia={filterType === 'sepia'}
                    gaussianBlur={filterType === 'blur' ? 5 : undefined}
                    sharpen={filterType === 'sharpen'}
                    emboss={filterType === 'emboss'}
                    edgeDetection={filterType === 'edge'}
                    backgroundBlur={
                      bgBlur
                        ? { sigma: 6, focusRadius: 150, falloff: 200 }
                        : undefined
                    }
                    watermark={
                      watermarkText
                        ? {
                            text: watermarkText,
                            options: {
                              x: watermarkX,
                              y: watermarkY,
                              fontSize: watermarkSize,
                              fontFace: watermarkFont,
                              color: watermarkColor,
                            },
                          }
                        : undefined
                    }
                    outputType="dataUrl"
                    getImage={handleGetCanvasImage}
                  />
                )}
              </div>

              <details className="code-panel">
                <summary className="code-panel-summary">
                  Show Generated JSX
                </summary>
                <div className="code-panel-body">
                  <div className="code-panel-toolbar">
                    <button
                      type="button"
                      className="code-copy-btn"
                      onClick={() => copyCode('canvas', generatedCanvasCode)}
                      aria-label="Copy generated LuminaCanvas JSX"
                    >
                      {copiedPanel === 'canvas' ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>
                  <div className="code-block">
                    <CodeMirror
                      value={generatedCanvasCode}
                      height="280px"
                      theme={oneDark}
                      editable={false}
                      extensions={codeExtensions}
                      basicSetup={codeEditorSetup}
                      className="code-editor"
                      aria-label="Generated LuminaCanvas JSX code"
                    />
                  </div>
                </div>
              </details>
            </div>

            <div className="thumbnail-card">
              <h4>Generated Thumbnail (useLumina Hook)</h4>
              {thumbnail && <img src={thumbnail} alt="Preview" />}

              <button
                className="toggle-btn"
                onClick={handleDownloadThumbnail}
                style={{ margin: '10px auto 0' }}
              >
                Fetch & Download Thumbnail
              </button>
            </div>
          </section>
        </section>
        <aside className="sidebar">
          <div className="controls-card">
            <h3>Adjustments</h3>
            <div className="control-group">
              <div className="label-row">
                <label>Brightness</label>
                <span>{brightness}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
              />
            </div>
            <div className="control-group">
              <div className="label-row">
                <label>Contrast</label>
                <span>{contrast}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
              />
            </div>

            <hr />

            <h3>Filters</h3>
            <div className="filter-grid">
              {[
                'none',
                'grayscale',
                'sepia',
                'blur',
                'sharpen',
                'emboss',
                'edge',
              ].map((f) => (
                <button
                  key={f}
                  className={filterType === f ? 'active' : ''}
                  onClick={() => setFilterType(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <hr />

            <h3>Transformations</h3>
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="resize"
                checked={isResized}
                onChange={() => setIsResized(!isResized)}
              />
              <label htmlFor="resize">Enable Resize</label>
            </div>
            {isResized && (
              <div className="transformation-inputs">
                <div className="input-field">
                  <label>W</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                  />
                </div>
                <div className="input-field">
                  <label>H</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            <div className="checkbox-row">
              <input
                type="checkbox"
                id="crop"
                checked={isCropped}
                onChange={() => setIsCropped(!isCropped)}
              />
              <label htmlFor="crop">Enable Crop</label>
            </div>
            {isCropped && (
              <div className="transformation-inputs">
                <div className="input-field">
                  <label>X</label>
                  <input
                    type="number"
                    value={cropX}
                    onChange={(e) => setCropX(Number(e.target.value))}
                  />
                </div>
                <div className="input-field">
                  <label>Y</label>
                  <input
                    type="number"
                    value={cropY}
                    onChange={(e) => setCropY(Number(e.target.value))}
                  />
                </div>
                <div className="input-field">
                  <label>W</label>
                  <input
                    type="number"
                    value={cropW}
                    onChange={(e) => setCropW(Number(e.target.value))}
                  />
                </div>
                <div className="input-field">
                  <label>H</label>
                  <input
                    type="number"
                    value={cropH}
                    onChange={(e) => setCropH(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            <hr />

            <h3>Utilities</h3>
            <div className="control-group">
              <label>Watermark Options</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Text..."
              />
              <div className="transformation-grid">
                <div className="input-field">
                  <label>X</label>
                  <input
                    type="number"
                    value={watermarkX}
                    onChange={(e) => setWatermarkX(Number(e.target.value))}
                  />
                </div>
                <div className="input-field">
                  <label>Y</label>
                  <input
                    type="number"
                    value={watermarkY}
                    onChange={(e) => setWatermarkY(Number(e.target.value))}
                  />
                </div>
                <div className="input-field">
                  <label>Size</label>
                  <input
                    type="number"
                    value={watermarkSize}
                    onChange={(e) => setWatermarkSize(Number(e.target.value))}
                  />
                </div>
                <div className="input-field">
                  <label>Color</label>
                  <input
                    type="text"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                  />
                </div>
              </div>
              <div className="input-field mt-2">
                <label>Font</label>
                <select
                  value={watermarkFont}
                  onChange={(e) => setWatermarkFont(e.target.value)}
                  className="full-width-select"
                >
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                  <option value="cursive">Cursive</option>
                </select>
              </div>
            </div>
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="bgblur"
                checked={bgBlur}
                onChange={() => setBgBlur(!bgBlur)}
              />
              <label htmlFor="bgblur">Background Blur (Portrait)</label>
            </div>
          </div>
        </aside>
        <section id="cropping-tool">
          <div className="preview-panel">
            <div className="card cropper-demo-card">
              <h3>ImageCropper - Default</h3>
              <p className="cropper-demo-text">
                Baseline crop workflow with keyboard support and explicit Apply.
              </p>
              <ImageCropper src="sample.png" allowResize={true} />
            </div>
          </div>

          <div className="preview-panel">
            <div className="card cropper-demo-card mt-20">
              <h3>ImageCropper - Themed / Production Customization</h3>
              <p className="cropper-demo-text">
                Demonstrates class/style hooks for controls, handles, overlay,
                keyboard behavior, and error display.
              </p>

              <ImageCropper
                src="sample.png"
                aspectRatio={16 / 9}
                className="cropper-shell"
                containerClassName="cropper-stage"
                buttonContainerClassName="cropper-controls"
                applyButtonClassName="cropper-btn cropper-btn-primary"
                resetButtonClassName="cropper-btn cropper-btn-secondary"
                processingOverlayClassName="cropper-processing"
                errorClassName="cropper-error"
                errorTextClassName="cropper-error-text"
                selectorSelectionClassName="cropper-selection"
                selectorHandleClassName="cropper-handle"
                selectorControlsContainerClassName="cropper-controls-anchor"
                selectorLineColor="#3b82f6"
                selectorOverlayOpacity={0.5}
                selectorAriaLabel="Avatar crop area"
                selectorAriaDescription="Use arrow keys to move the selection, Shift for larger movement, Alt with arrows to resize, Enter to confirm, Escape to clear."
                applyButtonAriaLabel="Apply avatar crop"
                resetButtonAriaLabel="Reset avatar crop"
                keyboardStep={2}
                keyboardStepLarge={16}
                processingLabel="Applying crop..."
              />

              <details className="code-panel">
                <summary className="code-panel-summary">
                  Show Customization JSX
                </summary>
                <div className="code-panel-body">
                  <div className="code-panel-toolbar">
                    <button
                      type="button"
                      className="code-copy-btn"
                      onClick={() => copyCode('cropper', THEMED_CROPPER_CODE)}
                      aria-label="Copy themed ImageCropper JSX"
                    >
                      {copiedPanel === 'cropper' ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>
                  <div className="code-block">
                    <CodeMirror
                      value={THEMED_CROPPER_CODE}
                      height="360px"
                      theme={oneDark}
                      editable={false}
                      extensions={codeExtensions}
                      basicSetup={codeEditorSetup}
                      className="code-editor"
                      aria-label="ImageCropper customization JSX code"
                    />
                  </div>
                </div>
              </details>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
