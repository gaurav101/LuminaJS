import {
  loadImage,
  getPixelData,
  putPixelData,
  canvasToBlob,
  grayscale,
  brightness,
  contrast,
  sepia,
  ascii,
  blur,
  gaussianBlur,
  watermark,
  backgroundBlur,
  sharpen,
  emboss,
  edgeDetection,
  getResizedImageData,
  resize,
  crop
} from '@gks101/luminajs';

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const mainCanvas = document.getElementById('mainCanvas');
const asciiPreview = document.getElementById('asciiPreview');
const perfBadge = document.getElementById('perfBadge');
const processTime = document.getElementById('processTime');

const brightnessRange = document.getElementById('brightnessRange');
const contrastRange = document.getElementById('contrastRange');
const blurRange = document.getElementById('blurRange');
const brightnessVal = document.getElementById('brightnessVal');
const contrastVal = document.getElementById('contrastVal');
const blurVal = document.getElementById('blurVal');
const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');

const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

// Transform Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const resizeWidth = document.getElementById('resizeWidth');
const resizeHeight = document.getElementById('resizeHeight');
const applyResizeBtn = document.getElementById('applyResize');
const cropX = document.getElementById('cropX');
const cropY = document.getElementById('cropY');
const cropWidth = document.getElementById('cropWidth');
const cropHeight = document.getElementById('cropHeight');
const applyCropBtn = document.getElementById('applyCrop');

const watermarkText = document.getElementById('watermarkText');
const watermarkX = document.getElementById('watermarkX');
const watermarkY = document.getElementById('watermarkY');
const watermarkSize = document.getElementById('watermarkSize');
const watermarkOpacity = document.getElementById('watermarkOpacity');
const watermarkColor = document.getElementById('watermarkColor');
const applyWatermarkBtn = document.getElementById('applyWatermark');

// App State
let originalImage = null;
let transformedCanvas = null;
let currentFilter = 'original';

/**
 * Main application logic
 */

const init = () => {
  setupEventListeners();
};

const setupEventListeners = () => {
  // File Upload
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleSource(e.target.files[0]));

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('active');
  });

  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('active'));

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('active');
    handleSource(e.dataTransfer.files[0]);
  });

  // Filter selection
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  // Sliders
  brightnessRange.addEventListener('input', (e) => {
    brightnessVal.textContent = e.target.value;
    applyFilters();
  });

  contrastRange.addEventListener('input', (e) => {
    contrastVal.textContent = e.target.value;
    applyFilters();
  });

  blurRange.addEventListener('input', (e) => {
    blurVal.textContent = e.target.value;
    applyFilters();
  });

  // Actions
  resetBtn.addEventListener('click', () => {
    currentFilter = 'original';
    brightnessRange.value = 0;
    contrastRange.value = 0;
    blurRange.value = 0;
    brightnessVal.textContent = 0;
    contrastVal.textContent = 0;
    blurVal.textContent = 0;
    filterBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="original"]').classList.add('active');

    // Reset transformations
    if (originalImage) {
      transformedCanvas = resize(originalImage, originalImage.naturalWidth, originalImage.naturalHeight);
      updateTransformInputs();
    }

    applyFilters();
  });

  // Transform Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}Controls`).classList.add('active');
    });
  });

  // Apply Resize
  applyResizeBtn.addEventListener('click', () => {
    if (!originalImage) return;
    const w = parseInt(resizeWidth.value);
    const h = parseInt(resizeHeight.value);
    if (w > 0 && h > 0) {
      transformedCanvas = resize(transformedCanvas || originalImage, w, h);
      updateTransformInputs();
      applyFilters();
    }
  });

  // Apply Crop
  applyCropBtn.addEventListener('click', () => {
    if (!originalImage) return;
    const x = parseInt(cropX.value);
    const y = parseInt(cropY.value);
    const w = parseInt(cropWidth.value);
    const h = parseInt(cropHeight.value);
    if (w > 0 && h > 0) {
      transformedCanvas = crop(transformedCanvas || originalImage, x, y, w, h);
      updateTransformInputs();
      applyFilters();
    }
  });

  // Apply Watermark
  applyWatermarkBtn.addEventListener('click', () => {
    if (!originalImage) return;
    applyFilters();
  });

  downloadBtn.addEventListener('click', async () => {
    if (!originalImage) return;
    const blob = await canvasToBlob(mainCanvas, 'image/png');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
};

const handleSource = async (file) => {
  if (!file) return;

  try {
    originalImage = await loadImage(file);
    transformedCanvas = resize(originalImage, originalImage.naturalWidth, originalImage.naturalHeight);

    dropZone.style.display = 'none';
    previewContainer.style.display = 'block';
    perfBadge.style.display = 'block';

    updateTransformInputs();

    // Initial draw
    applyFilters();
  } catch (err) {
    console.error(err);
    alert('Failed to load image: ' + err.message);
  }
};

const updateTransformInputs = () => {
  if (!transformedCanvas) return;
  const w = transformedCanvas.width;
  const h = transformedCanvas.height;

  resizeWidth.value = w;
  resizeHeight.value = h;
  cropWidth.value = w;
  cropHeight.value = h;
  cropX.value = 0;
  cropY.value = 0;
};

const applyFilters = () => {
  if (!originalImage) return;

  const start = performance.now();

  // 1. Handle ASCII separately as it returns a string, not ImageData
  if (currentFilter === 'ascii') {
    mainCanvas.style.display = 'none';
    asciiPreview.style.display = 'block';
    downloadBtn.style.opacity = '0.5';
    downloadBtn.style.pointerEvents = 'none';

    // Calculate dimensions: 100 chars wide, maintain aspect ratio
    // We adjust height by 0.5 because font characters are taller than they are wide
    const asciiWidth = 100;
    const asciiHeight = Math.round((asciiWidth * (originalImage.naturalHeight / originalImage.naturalWidth)) * 0.5);

    const resizedData = getResizedImageData(originalImage, asciiWidth, asciiHeight);
    const asciiText = ascii(resizedData);

    asciiPreview.textContent = asciiText;
    console.log(asciiText);
    const end = performance.now();
    processTime.textContent = Math.round(end - start);
    return;
  }

  // Regular filters
  mainCanvas.style.display = 'block';
  asciiPreview.style.display = 'none';
  downloadBtn.style.opacity = '1';
  downloadBtn.style.pointerEvents = 'auto';

  // 1. Get fresh pixel data from original
  const { imageData, canvas } = getPixelData(transformedCanvas);
  let processedData = imageData;

  // 2. Apply chosen preset
  if (currentFilter === 'grayscale') {
    processedData = grayscale(processedData);
  } else if (currentFilter === 'sepia') {
    processedData = sepia(processedData);
  } else if (currentFilter === 'blur') {
    processedData = blur(processedData, 5); // Default blur for preset
  } else if (currentFilter === 'gaussian') {
    processedData = gaussianBlur(processedData, 3); // Default sigma for preset
  } else if (currentFilter === 'portrait') {
    processedData = backgroundBlur(processedData, { sigma: 5 });
  } else if (currentFilter === 'sharpen') {
    processedData = sharpen(processedData);
  } else if (currentFilter === 'emboss') {
    processedData = emboss(processedData);
  } else if (currentFilter === 'edge') {
    processedData = edgeDetection(processedData);
  }

  // 3. Apply adjustments
  const b = parseInt(brightnessRange.value);
  if (b !== 0) {
    processedData = brightness(processedData, b);
  }

  const c = parseInt(contrastRange.value);
  if (c !== 0) {
    processedData = contrast(processedData, c);
  }

  const radius = parseInt(blurRange.value);
  if (radius > 0) {
    processedData = blur(processedData, radius);
  }

  // 4. Apply Watermark (if text is provided)
  const text = watermarkText.value;
  if (text) {
    const x = parseInt(watermarkX.value) || 0;
    const y = parseInt(watermarkY.value) || 0;
    const size = parseInt(watermarkSize.value) || 24;
    const opacity = parseFloat(watermarkOpacity.value) || 0.5;
    const color = watermarkColor.value;

    // Convert hex color to rgba for opacity
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const rgba = `rgba(${r}, ${g}, ${b}, ${opacity})`;

    processedData = watermark(processedData, text, {
      x, y,
      font: `${size}px Inter, sans-serif`,
      color: rgba
    });
  }

  // 5. Update canvas
  mainCanvas.width = canvas.width;
  mainCanvas.height = canvas.height;
  putPixelData(mainCanvas, processedData);

  const end = performance.now();
  processTime.textContent = Math.round(end - start);
};

// Start
init();
