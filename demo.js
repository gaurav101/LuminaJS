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
  getResizedImageData
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
const brightnessVal = document.getElementById('brightnessVal');
const contrastVal = document.getElementById('contrastVal');
const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');

const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

// App State
let originalImage = null;
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

  // Actions
  resetBtn.addEventListener('click', () => {
    currentFilter = 'original';
    brightnessRange.value = 0;
    contrastRange.value = 0;
    brightnessVal.textContent = 0;
    contrastVal.textContent = 0;
    filterBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="original"]').classList.add('active');
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
    dropZone.style.display = 'none';
    previewContainer.style.display = 'block';
    perfBadge.style.display = 'block';

    // Initial draw
    applyFilters();
  } catch (err) {
    console.error(err);
    alert('Failed to load image: ' + err.message);
  }
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
  const { imageData, canvas } = getPixelData(originalImage);
  let processedData = imageData;

  // 2. Apply chosen preset
  if (currentFilter === 'grayscale') {
    processedData = grayscale(processedData);
  } else if (currentFilter === 'sepia') {
    processedData = sepia(processedData);
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

  // 4. Update canvas
  mainCanvas.width = canvas.width;
  mainCanvas.height = canvas.height;
  putPixelData(mainCanvas, processedData);

  const end = performance.now();
  processTime.textContent = Math.round(end - start);
};

// Start
init();
