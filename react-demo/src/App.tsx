import { useState } from 'react'
import { useLumina, LuminaCanvas } from '@gks101/luminajs/react'
import './App.css'

function App() {
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [filterType, setFilterType] = useState<string>('none')
  const [watermarkText, setWatermarkText] = useState('LuminaJS')
  const [watermarkX, setWatermarkX] = useState(20)
  const [watermarkY, setWatermarkY] = useState(60)
  const [watermarkColor, setWatermarkColor] = useState('rgba(255,255,255,0.7)')
  const [watermarkSize, setWatermarkSize] = useState(40)
  const [watermarkFont, setWatermarkFont] = useState('Inter')
  const [bgBlur, setBgBlur] = useState(false)
  const [showAscii, setShowAscii] = useState(false)

  // Transformation states
  const [width, setWidth] = useState(600)
  const [height, setHeight] = useState(400)
  const [isResized, setIsResized] = useState(false)
  const [isCropped, setIsCropped] = useState(false)
  const [cropX, setCropX] = useState(100)
  const [cropY, setCropY] = useState(100)
  const [cropW, setCropW] = useState(400)
  const [cropH, setCropH] = useState(400)

  // ASCII logic
  const { result: asciiText, loading: asciiLoading } = useLumina({
    source: '/sample.png',
    operations: (l) => l.resize(100, 50).ascii(),
    deps: [showAscii]
  });

  // Thumbnail preview
  const { result: thumbnail } = useLumina({
    source: '/sample.png',
    operations: (l) => l.resize(200, 150).grayscale(),
    outputType: 'dataUrl',
  });

  const getFilter = (l: any) => {
    let chain = l.brightness(brightness).contrast(contrast);

    if (isResized) chain = chain.resize(width, height);
    if (isCropped) chain = chain.crop(cropX, cropY, cropW, cropH);

    // Apply filters
    if (filterType === 'grayscale') chain = chain.grayscale();
    if (filterType === 'sepia') chain = chain.sepia();
    if (filterType === 'blur') chain = chain.gaussianBlur(5);
    if (filterType === 'sharpen') chain = chain.sharpen();
    if (filterType === 'emboss') chain = chain.emboss();
    if (filterType === 'edge') chain = chain.edgeDetection();

    if (bgBlur) chain = chain.backgroundBlur({ sigma: 6, focusRadius: 150, falloff: 200 });
    if (watermarkText) chain = chain.watermark(watermarkText, {
      x: watermarkX, y: watermarkY,
      fontSize: watermarkSize,
      fontFace: watermarkFont,
      color: watermarkColor
    });

    return chain;
  };

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
              <button className="toggle-btn" onClick={() => setShowAscii(!showAscii)}>
                {showAscii ? 'Show Image' : 'Show ASCII'}
              </button>
            </div>

            <div className="display-area">
              {showAscii ? (
                <pre className="ascii-box">
                  {asciiLoading ? 'Generating ASCII...' : asciiText}
                </pre>
              ) : (
                <LuminaCanvas
                  source="/sample.png"
                  filter={getFilter}
                  className="main-canvas"
                />
              )}
            </div>
          </div>

          <div className="thumbnail-card">
            <h4>Generated Thumbnail (useLumina Hook)</h4>
            <img src={thumbnail} alt="Preview" />
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
              <input type="range" min="-100" max="100" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} />
            </div>
            <div className="control-group">
              <div className="label-row">
                <label>Contrast</label>
                <span>{contrast}</span>
              </div>
              <input type="range" min="-100" max="100" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
            </div>

            <hr />

            <h3>Filters</h3>
            <div className="filter-grid">
              {['none', 'grayscale', 'sepia', 'blur', 'sharpen', 'emboss', 'edge'].map(f => (
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
              <input type="checkbox" id="resize" checked={isResized} onChange={() => setIsResized(!isResized)} />
              <label htmlFor="resize">Enable Resize</label>
            </div>
            {isResized && (
              <div className="transformation-inputs">
                <div className="input-field"><label>W</label><input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} /></div>
                <div className="input-field"><label>H</label><input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} /></div>
              </div>
            )}

            <div className="checkbox-row">
              <input type="checkbox" id="crop" checked={isCropped} onChange={() => setIsCropped(!isCropped)} />
              <label htmlFor="crop">Enable Crop</label>
            </div>
            {isCropped && (
              <div className="transformation-inputs">
                <div className="input-field"><label>X</label><input type="number" value={cropX} onChange={(e) => setCropX(Number(e.target.value))} /></div>
                <div className="input-field"><label>Y</label><input type="number" value={cropY} onChange={(e) => setCropY(Number(e.target.value))} /></div>
                <div className="input-field"><label>W</label><input type="number" value={cropW} onChange={(e) => setCropW(Number(e.target.value))} /></div>
                <div className="input-field"><label>H</label><input type="number" value={cropH} onChange={(e) => setCropH(Number(e.target.value))} /></div>
              </div>
            )}

            <hr />

            <h3>Utilities</h3>
            <div className="control-group">
              <label>Watermark Options</label>
              <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="Text..." />
              <div className="transformation-grid">
                <div className="input-field"><label>X</label><input type="number" value={watermarkX} onChange={(e) => setWatermarkX(Number(e.target.value))} /></div>
                <div className="input-field"><label>Y</label><input type="number" value={watermarkY} onChange={(e) => setWatermarkY(Number(e.target.value))} /></div>
                <div className="input-field"><label>Size</label><input type="number" value={watermarkSize} onChange={(e) => setWatermarkSize(Number(e.target.value))} /></div>
                <div className="input-field"><label>Color</label><input type="text" value={watermarkColor} onChange={(e) => setWatermarkColor(e.target.value)} /></div>
              </div>
              <div className="input-field mt-2">
                <label>Font</label>
                <select value={watermarkFont} onChange={(e) => setWatermarkFont(e.target.value)} className="full-width-select">
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                  <option value="cursive">Cursive</option>
                </select>
              </div>
            </div>
            <div className="checkbox-row">
              <input type="checkbox" id="bgblur" checked={bgBlur} onChange={() => setBgBlur(!bgBlur)} />
              <label htmlFor="bgblur">Background Blur (Portrait)</label>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
