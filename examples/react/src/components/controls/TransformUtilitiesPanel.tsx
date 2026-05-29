import { WATERMARK_FONTS } from '../../constants/demoOptions';
import type {
  TransformUtilityActions,
  TransformUtilityState,
} from '../../types/demo';

interface TransformUtilitiesPanelProps {
  state: TransformUtilityState;
  actions: TransformUtilityActions;
}

export const TransformUtilitiesPanel = ({
  state,
  actions,
}: TransformUtilitiesPanelProps) => (
  <aside className="sidebar sidebar-right">
    <div className="controls-card">
      <h3>Transformations</h3>
      <div className="checkbox-row">
        <input
          type="checkbox"
          id="resize"
          checked={state.isResized}
          onChange={() => actions.setIsResized(!state.isResized)}
        />
        <label htmlFor="resize">Enable Resize</label>
      </div>
      {state.isResized && (
        <div className="transformation-inputs">
          <div className="input-field">
            <label>W</label>
            <input
              type="number"
              value={state.width}
              onChange={(event) => actions.setWidth(Number(event.target.value))}
            />
          </div>
          <div className="input-field">
            <label>H</label>
            <input
              type="number"
              value={state.height}
              onChange={(event) =>
                actions.setHeight(Number(event.target.value))
              }
            />
          </div>
        </div>
      )}

      <div className="checkbox-row">
        <input
          type="checkbox"
          id="crop"
          checked={state.isCropped}
          onChange={() => actions.setIsCropped(!state.isCropped)}
        />
        <label htmlFor="crop">Enable Crop</label>
      </div>
      {state.isCropped && (
        <div className="transformation-inputs">
          <div className="input-field">
            <label>X</label>
            <input
              type="number"
              value={state.cropX}
              onChange={(event) => actions.setCropX(Number(event.target.value))}
            />
          </div>
          <div className="input-field">
            <label>Y</label>
            <input
              type="number"
              value={state.cropY}
              onChange={(event) => actions.setCropY(Number(event.target.value))}
            />
          </div>
          <div className="input-field">
            <label>W</label>
            <input
              type="number"
              value={state.cropW}
              onChange={(event) => actions.setCropW(Number(event.target.value))}
            />
          </div>
          <div className="input-field">
            <label>H</label>
            <input
              type="number"
              value={state.cropH}
              onChange={(event) => actions.setCropH(Number(event.target.value))}
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
          value={state.watermarkText}
          onChange={(event) => actions.setWatermarkText(event.target.value)}
          placeholder="Text..."
        />
        <div className="transformation-grid">
          <div className="input-field">
            <label>X</label>
            <input
              type="number"
              value={state.watermarkX}
              onChange={(event) =>
                actions.setWatermarkX(Number(event.target.value))
              }
            />
          </div>
          <div className="input-field">
            <label>Y</label>
            <input
              type="number"
              value={state.watermarkY}
              onChange={(event) =>
                actions.setWatermarkY(Number(event.target.value))
              }
            />
          </div>
          <div className="input-field">
            <label>Size</label>
            <input
              type="number"
              value={state.watermarkSize}
              onChange={(event) =>
                actions.setWatermarkSize(Number(event.target.value))
              }
            />
          </div>
          <div className="input-field">
            <label>Color</label>
            <input
              type="text"
              value={state.watermarkColor}
              onChange={(event) =>
                actions.setWatermarkColor(event.target.value)
              }
            />
          </div>
        </div>
        <div className="input-field mt-2">
          <label>Font</label>
          <select
            value={state.watermarkFont}
            onChange={(event) => actions.setWatermarkFont(event.target.value)}
            className="full-width-select"
          >
            {WATERMARK_FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="checkbox-row">
        <input
          type="checkbox"
          id="bgblur"
          checked={state.bgBlur}
          onChange={() => actions.setBgBlur(!state.bgBlur)}
        />
        <label htmlFor="bgblur">Background Blur (Portrait)</label>
      </div>
    </div>
  </aside>
);
