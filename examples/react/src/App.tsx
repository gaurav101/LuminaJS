import { useState, useCallback, useMemo } from 'react';
import { useLumina, LuminaCanvas } from '@gks101/luminajs/react';
import './App.css';
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

  // Memoize operations to prevent infinite loops
  const asciiOperation = useCallback((chain) => chain.ascii(), []);
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

  return (
    <div className="demo-container">
      <header>
        <h1>LuminaJS Premium Demo</h1>
        <p>A full showcase of the LuminaJS Image Processing Library</p>
      </header>

      <main className="demo-grid">
        <section className="preview-panel">
          <div className="card">
            <div className="card-header">
              <h3>{showAscii ? 'ASCII Output' : 'Live Canvas Output'}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
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
          </div>

          <div className="thumbnail-card">
            <h4>Generated Thumbnail (useLumina Hook)</h4>
            {thumbnail && <img src={thumbnail} alt="Preview" />}

            <button
              className="toggle-btn"
              onClick={handleDownloadThumbnail}
              style={{ marginTop: '10px', display: 'block', margin: '0 auto' }}
            >
              Fetch & Download Thumbnail
            </button>
          </div>
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
      </main>
    </div>
  );
}

export default App;
