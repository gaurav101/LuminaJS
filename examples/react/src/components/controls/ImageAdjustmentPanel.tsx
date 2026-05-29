import { FILTER_OPTIONS } from '../../constants/demoOptions';
import type {
  ImageAdjustmentActions,
  ImageAdjustmentState,
} from '../../types/demo';

interface ImageAdjustmentPanelProps {
  state: ImageAdjustmentState;
  actions: ImageAdjustmentActions;
}

export const ImageAdjustmentPanel = ({
  state,
  actions,
}: ImageAdjustmentPanelProps) => (
  <aside className="sidebar sidebar-left">
    <div className="controls-card">
      <h3>Image Adjustments</h3>
      <div className="control-group">
        <div className="label-row">
          <label>Brightness</label>
          <span>{state.brightness}</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={state.brightness}
          onChange={(event) =>
            actions.setBrightness(Number(event.target.value))
          }
        />
      </div>
      <div className="control-group">
        <div className="label-row">
          <label>Contrast</label>
          <span>{state.contrast}</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={state.contrast}
          onChange={(event) => actions.setContrast(Number(event.target.value))}
        />
      </div>

      <hr />

      <h3>Filters</h3>
      <div className="filter-grid">
        {FILTER_OPTIONS.map((filter) => (
          <button
            key={filter}
            className={state.filterType === filter ? 'active' : ''}
            onClick={() => actions.setFilterType(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>
    </div>
  </aside>
);
