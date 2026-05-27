import './styles.css';
import { renderPage } from './components/sections.js';
import { lumina } from '@gks101/luminajs';

document.querySelector('#app').innerHTML = renderPage();

document.querySelectorAll('[data-code-tabs]').forEach((tabsRoot) => {
  const buttons = [...tabsRoot.querySelectorAll('[data-code-tab]')];
  const panels = [...tabsRoot.querySelectorAll('[data-code-panel]')];
  const copyButton = tabsRoot.querySelector('[data-copy-code]');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedTab = button.dataset.codeTab;

      buttons.forEach((tabButton) => {
        const isActive = tabButton.dataset.codeTab === selectedTab;
        tabButton.classList.toggle('is-active', isActive);
        tabButton.setAttribute('aria-selected', String(isActive));
      });

      panels.forEach((panel) => {
        panel.classList.toggle(
          'hidden',
          panel.dataset.codePanel !== selectedTab,
        );
      });
    });
  });

  copyButton?.addEventListener('click', async () => {
    const activePanel = panels.find(
      (panel) => !panel.classList.contains('hidden'),
    );
    const code = activePanel?.querySelector('code')?.textContent ?? '';
    const label = copyButton.querySelector('[data-copy-label]');

    if (!code) {
      return;
    }

    await copyText(code);
    if (label) {
      label.textContent = 'Copied';
    }

    window.setTimeout(() => {
      if (label) {
        label.textContent = 'Copy';
      }
    }, 1400);
  });
});

document.querySelectorAll('[data-copy-command]').forEach((button) => {
  button.addEventListener('click', async () => {
    await copyText(button.dataset.copyCommand);
    const originalLabel = button.getAttribute('aria-label');

    button.classList.add('border-teal-300', 'bg-teal-300/20');
    button.setAttribute('aria-label', 'Copied');

    window.setTimeout(() => {
      button.classList.remove('border-teal-300', 'bg-teal-300/20');
      button.setAttribute('aria-label', originalLabel);
    }, 1200);
  });
});

async function copyText(value) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.append(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

document.querySelectorAll('[data-playground]').forEach((playground) => {
  const canvas = playground.querySelector('[data-playground-canvas]');
  const input = playground.querySelector('[data-image-input]');
  const dropZone = playground.querySelector('[data-drop-zone]');
  const cropStage = playground.querySelector('[data-crop-stage]');
  const cropBox = playground.querySelector('[data-crop-box]');
  const cropHelp = playground.querySelector('[data-crop-help]');
  const applyCropButton = playground.querySelector('[data-apply-crop]');
  const resetCropButton = playground.querySelector('[data-reset-crop]');
  const filterButtons = [...playground.querySelectorAll('[data-filter]')];
  const filterPreviews = [
    ...playground.querySelectorAll('[data-filter-preview]'),
  ];
  const status = playground.querySelector('[data-playground-status]');
  const timing = playground.querySelector('[data-playground-timing]');
  const controls = [...playground.querySelectorAll('[data-control]')];
  const values = new Map(
    controls.map((control) => [control.dataset.control, Number(control.value)]),
  );
  const originalCanvas = document.createElement('canvas');
  const sourceCanvas = document.createElement('canvas');
  let cropSelection;
  let cropInteraction;
  let activeFilter = 'none';
  let objectUrl;
  let frame = 0;
  let renderId = 0;

  loadImageSource(
    './sample.png',
    'Using the sample image until you choose a local file.',
  );

  controls.forEach((control) => {
    control.addEventListener('input', () => {
      values.set(control.dataset.control, Number(control.value));
      const output = playground.querySelector(
        `[data-control-value="${control.dataset.control}"]`,
      );
      if (output) {
        output.value = control.value;
        output.textContent = control.value;
      }
      queueDraw();
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((filterButton) => {
        filterButton.classList.toggle('is-active', filterButton === button);
      });
      status.textContent = `${button.textContent.trim()} filter selected.`;
      queueDraw();
    });
  });

  input.addEventListener('change', () => {
    const [file] = input.files;
    if (file) {
      loadFile(file);
    }
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add('border-teal-600', 'bg-teal-50');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove('border-teal-600', 'bg-teal-50');
    });
  });

  dropZone.addEventListener('drop', (event) => {
    const [file] = event.dataTransfer.files;
    if (file?.type.startsWith('image/')) {
      loadFile(file);
    }
  });

  cropStage.addEventListener('pointerdown', (event) => {
    if (!sourceCanvas.width || !sourceCanvas.height) {
      return;
    }

    event.preventDefault();
    cropStage.setPointerCapture(event.pointerId);
    const handle = event.target.closest('[data-crop-handle]');
    const point = getCanvasPoint(event);

    if (handle && cropSelection) {
      cropInteraction = {
        mode: 'resize',
        handle: handle.dataset.cropHandle,
        startPoint: point,
        startSelection: { ...cropSelection },
      };
      return;
    }

    if (cropSelection && cropBox.contains(event.target)) {
      cropInteraction = {
        mode: 'move',
        startPoint: point,
        startSelection: { ...cropSelection },
      };
      return;
    }

    cropInteraction = {
      mode: 'create',
      startPoint: point,
      startSelection: { x: point.x, y: point.y, width: 0, height: 0 },
    };
    cropSelection = { ...cropInteraction.startSelection };
    updateCropBox();
  });

  cropStage.addEventListener('pointermove', (event) => {
    if (!cropInteraction) {
      return;
    }

    const point = getCanvasPoint(event);

    if (cropInteraction.mode === 'create') {
      cropSelection = normalizeSelection(cropInteraction.startPoint, point);
    }

    if (cropInteraction.mode === 'move') {
      cropSelection = moveSelection(
        cropInteraction.startSelection,
        point,
        cropInteraction.startPoint,
      );
    }

    if (cropInteraction.mode === 'resize') {
      cropSelection = resizeSelection(
        cropInteraction.startSelection,
        point,
        cropInteraction.startPoint,
        cropInteraction.handle,
      );
    }

    updateCropBox();
  });

  cropStage.addEventListener('pointerup', () => {
    if (
      cropSelection &&
      (cropSelection.width < 18 || cropSelection.height < 18)
    ) {
      clearCropSelection();
    }
    cropInteraction = undefined;
  });

  applyCropButton.addEventListener('click', async () => {
    if (!cropSelection) {
      status.textContent = 'Select an area on the image before applying crop.';
      return;
    }

    const crop = {
      x: Math.round(cropSelection.x),
      y: Math.round(cropSelection.y),
      width: Math.round(cropSelection.width),
      height: Math.round(cropSelection.height),
    };
    const croppedCanvas = document.createElement('canvas');

    await lumina(sourceCanvas)
      .crop(crop.x, crop.y, crop.width, crop.height)
      .toCanvas(croppedCanvas);

    replaceCanvas(sourceCanvas, croppedCanvas);
    clearCropSelection();
    status.textContent = `Crop applied: ${crop.width} x ${crop.height}px.`;
    renderFilterPreviews();
    queueDraw();
  });

  resetCropButton.addEventListener('click', () => {
    replaceCanvas(sourceCanvas, originalCanvas);
    activeFilter = 'none';
    filterButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.filter === 'none');
    });
    clearCropSelection();
    status.textContent = 'Image reset to the original loaded file.';
    renderFilterPreviews();
    queueDraw();
  });

  function loadFile(file) {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    objectUrl = URL.createObjectURL(file);
    loadImageSource(objectUrl, `${file.name} loaded locally.`);
  }

  function loadImageSource(source, message) {
    const image = new Image();
    image.onload = () => {
      drawImageToCanvas(originalCanvas, image);
      replaceCanvas(sourceCanvas, originalCanvas);
      activeFilter = 'none';
      filterButtons.forEach((button) => {
        button.classList.toggle('is-active', button.dataset.filter === 'none');
      });
      clearCropSelection();
      status.textContent = message;
      renderFilterPreviews();
      queueDraw();
    };
    image.src = source;
  }

  function queueDraw() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      drawPlayground();
    });
  }

  async function drawPlayground() {
    if (!sourceCanvas.width || !sourceCanvas.height) {
      return;
    }

    const currentRenderId = ++renderId;
    const started = performance.now();
    const brightness = values.get('brightness') ?? 0;
    const contrast = values.get('contrast') ?? 0;

    let chain = applyFilter(lumina(sourceCanvas), activeFilter);

    if (brightness !== 0) {
      chain = chain.brightness(brightness);
    }

    if (contrast !== 0) {
      chain = chain.contrast(contrast);
    }

    await chain.toCanvas(canvas);

    if (currentRenderId !== renderId) {
      return;
    }

    updateCropBox();
    timing.textContent = `Rendered in ${Math.max(1, Math.round(performance.now() - started))}ms`;
  }

  async function renderFilterPreviews() {
    if (!sourceCanvas.width || !sourceCanvas.height) {
      return;
    }

    const thumbnailSource = document.createElement('canvas');
    thumbnailSource.width = 160;
    thumbnailSource.height = 90;
    const thumbnailContext = thumbnailSource.getContext('2d');
    const ratio = Math.max(
      thumbnailSource.width / sourceCanvas.width,
      thumbnailSource.height / sourceCanvas.height,
    );
    const drawWidth = sourceCanvas.width * ratio;
    const drawHeight = sourceCanvas.height * ratio;
    const drawX = (thumbnailSource.width - drawWidth) / 2;
    const drawY = (thumbnailSource.height - drawHeight) / 2;

    thumbnailContext.drawImage(
      sourceCanvas,
      drawX,
      drawY,
      drawWidth,
      drawHeight,
    );

    await Promise.all(
      filterPreviews.map(async (preview) => {
        await applyFilter(
          lumina(thumbnailSource),
          preview.dataset.filterPreview,
        ).toCanvas(preview);
      }),
    );
  }

  function drawImageToCanvas(targetCanvas, image) {
    const maxEdge = 1200;
    const scale = Math.min(
      1,
      maxEdge / Math.max(image.naturalWidth, image.naturalHeight),
    );
    targetCanvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    targetCanvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const targetContext = targetCanvas.getContext('2d');
    targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    targetContext.drawImage(
      image,
      0,
      0,
      targetCanvas.width,
      targetCanvas.height,
    );
  }

  function replaceCanvas(targetCanvas, source) {
    targetCanvas.width = source.width;
    targetCanvas.height = source.height;
    const targetContext = targetCanvas.getContext('2d');
    targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    targetContext.drawImage(source, 0, 0);
  }

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

    return {
      x: Math.max(0, Math.min(canvas.width, x)),
      y: Math.max(0, Math.min(canvas.height, y)),
    };
  }

  function normalizeSelection(start, end) {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);

    return {
      x,
      y,
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    };
  }

  function moveSelection(selection, point, startPoint) {
    const next = {
      ...selection,
      x: selection.x + point.x - startPoint.x,
      y: selection.y + point.y - startPoint.y,
    };

    return clampSelection(next);
  }

  function resizeSelection(selection, point, startPoint, handle) {
    const deltaX = point.x - startPoint.x;
    const deltaY = point.y - startPoint.y;
    let left = selection.x;
    let top = selection.y;
    let right = selection.x + selection.width;
    let bottom = selection.y + selection.height;

    if (handle.includes('w')) {
      left += deltaX;
    }
    if (handle.includes('e')) {
      right += deltaX;
    }
    if (handle.includes('n')) {
      top += deltaY;
    }
    if (handle.includes('s')) {
      bottom += deltaY;
    }

    left = Math.max(0, Math.min(canvas.width, left));
    right = Math.max(0, Math.min(canvas.width, right));
    top = Math.max(0, Math.min(canvas.height, top));
    bottom = Math.max(0, Math.min(canvas.height, bottom));

    if (Math.abs(right - left) < 18 || Math.abs(bottom - top) < 18) {
      return selection;
    }

    return normalizeSelection({ x: left, y: top }, { x: right, y: bottom });
  }

  function clampSelection(selection) {
    return {
      ...selection,
      x: Math.max(0, Math.min(canvas.width - selection.width, selection.x)),
      y: Math.max(0, Math.min(canvas.height - selection.height, selection.y)),
    };
  }

  function updateCropBox() {
    if (!cropSelection) {
      return;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const stageRect = cropStage.getBoundingClientRect();
    cropBox.classList.remove('hidden');
    cropHelp.textContent =
      'Adjust by dragging a new selection, then apply crop.';
    cropBox.style.left = `${canvasRect.left - stageRect.left + (cropSelection.x / canvas.width) * canvasRect.width}px`;
    cropBox.style.top = `${canvasRect.top - stageRect.top + (cropSelection.y / canvas.height) * canvasRect.height}px`;
    cropBox.style.width = `${(cropSelection.width / canvas.width) * canvasRect.width}px`;
    cropBox.style.height = `${(cropSelection.height / canvas.height) * canvasRect.height}px`;
  }

  function clearCropSelection() {
    cropSelection = undefined;
    cropBox.classList.add('hidden');
    cropBox.removeAttribute('style');
    cropHelp.textContent = 'Drag on the image to select a crop area.';
  }
});

function applyFilter(chain, filter) {
  if (filter === 'grayscale') {
    return chain.grayscale();
  }
  if (filter === 'sepia') {
    return chain.sepia();
  }
  if (filter === 'sharpen') {
    return chain.sharpen();
  }
  if (filter === 'emboss') {
    return chain.emboss();
  }

  return chain;
}
