// Import CSS framework for Vite compilation and hot reloading
import '../../../src/lumina-image.css';

document.addEventListener('DOMContentLoaded', () => {
  const previewImg = document.getElementById('sandboxImage');
  const previewFrame = document.getElementById('sandboxFrame');
  const codeOutput = document.getElementById('codeOutput');
  const codeHeaderLabel = document.getElementById('codeHeaderLabel');
  const copyBtn = document.getElementById('btnCopy');
  const copyClassListBtn = document.getElementById('btnCopyClassList');
  const activeClassList = document.getElementById('activeClassList');
  const toast = document.getElementById('toast');

  const modeButtons = document.querySelectorAll('[data-markup-mode]');
  const filterButtons = document.querySelectorAll('[data-category="filter"]');
  const transformButtons = document.querySelectorAll(
    '[data-category="transform"]',
  );
  const animationButtons = document.querySelectorAll(
    '[data-category="animation"]',
  );
  const aspectButtons = document.querySelectorAll('[data-category="aspect"]');
  const fitButtons = document.querySelectorAll('[data-category="fit"]');
  const hoverButtons = document.querySelectorAll('[data-category="hover"]');
  const presetButtons = document.querySelectorAll('[data-preset]');
  const classSearchInput = document.getElementById('classSearchInput');
  const classSearchResults = document.getElementById('classSearchResults');
  const clearClassSearchBtn = document.getElementById('btnClearClassSearch');
  const randomizeBtn = document.getElementById('btnRandomizeSandbox');
  const resetBtn = document.getElementById('btnResetSandbox');

  const classControlButtons = Array.from(
    document.querySelectorAll('.control-btn[data-class]'),
  );
  const classButtonMap = new Map(
    classControlButtons.map((btn) => [btn.dataset.class, btn]),
  );
  const searchableClassNames = Array.from(
    new Set(classControlButtons.map((btn) => btn.dataset.class)),
  ).sort();

  let toastTimer;
  let markupMode = 'html';
  let activeFilters = new Set();
  let activeTransform = null;
  let activeAnimation = null;
  let activeAspect = null;
  let activeFit = 'lum-fit-cover';
  let activeHover = null;

  let classSnapshot = {
    imgClasses: [],
    frameClasses: [],
    needsFrameWrapper: false,
  };

  const imageHoverTokens = [
    'zoom',
    'shrink',
    'rotate',
    'tilt',
    'flip',
    'grayscale',
    'blur',
    'bright',
    'sepia',
    'invert',
  ];

  const presetConfigs = {
    portraitPop: {
      filters: ['lum-bright-125', 'lum-contrast-125', 'lum-shadow'],
      transform: 'lum-scale-105',
      animation: 'lum-animate-float',
      aspect: 'lum-aspect-portrait',
      fit: 'lum-fit-cover',
      hover: 'lum-hover-grayscale-off',
    },
    cinematicHero: {
      filters: ['lum-contrast-150', 'lum-shadow-lg'],
      transform: null,
      animation: 'lum-animate-kenburns',
      aspect: 'lum-aspect-cinematic',
      fit: 'lum-fit-cover',
      hover: 'lum-hover-bright-on',
    },
    productCard: {
      filters: ['lum-bright-110', 'lum-shadow'],
      transform: null,
      animation: null,
      aspect: 'lum-aspect-square',
      fit: 'lum-fit-contain',
      hover: 'lum-hover-zoom',
    },
    monoEditorial: {
      filters: ['lum-grayscale', 'lum-contrast-150', 'lum-bright-75'],
      transform: null,
      animation: 'lum-animate-pulse',
      aspect: 'lum-aspect-standard',
      fit: 'lum-fit-cover',
      hover: 'lum-hover-grayscale-off',
    },
    neonShowcase: {
      filters: ['lum-hue-90', 'lum-saturate-200', 'lum-shadow-glow'],
      transform: 'lum-tilt-r',
      animation: 'lum-animate-breathe',
      aspect: 'lum-aspect-video',
      fit: 'lum-fit-cover',
      hover: 'lum-hover-rotate-3d',
    },
  };

  const isImageHoverClass = (className) =>
    imageHoverTokens.some((token) => className.includes(token));

  const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  async function copyText(text, successMessage) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('Copy failed');
    }
  }

  function syncMarkupModeUI() {
    modeButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.markupMode === markupMode);
    });
    codeHeaderLabel.textContent =
      markupMode === 'jsx' ? 'Generated JSX Markup' : 'Generated HTML Markup';
  }

  function syncControlButtons() {
    filterButtons.forEach((btn) => {
      btn.classList.toggle('active', activeFilters.has(btn.dataset.class));
    });
    transformButtons.forEach((btn) => {
      btn.classList.toggle('active', activeTransform === btn.dataset.class);
    });
    animationButtons.forEach((btn) => {
      btn.classList.toggle('active', activeAnimation === btn.dataset.class);
    });
    aspectButtons.forEach((btn) => {
      btn.classList.toggle('active', activeAspect === btn.dataset.class);
    });
    fitButtons.forEach((btn) => {
      btn.classList.toggle('active', activeFit === btn.dataset.class);
    });
    hoverButtons.forEach((btn) => {
      btn.classList.toggle('active', activeHover === btn.dataset.class);
    });
  }

  function buildClassListsFromState() {
    const imgClasses = ['lum-img'];
    const frameClasses = ['lum-frame'];

    if (activeFit) imgClasses.push(activeFit);
    if (activeFilters.size) imgClasses.push(...Array.from(activeFilters));
    if (activeTransform) imgClasses.push(activeTransform);
    if (activeAnimation) imgClasses.push(activeAnimation);

    if (activeAspect) frameClasses.push(activeAspect);
    if (activeHover) {
      if (isImageHoverClass(activeHover)) {
        imgClasses.push(activeHover);
      } else {
        frameClasses.push(activeHover);
      }
    }

    return {
      imgClasses,
      frameClasses,
      needsFrameWrapper: frameClasses.length > 1,
    };
  }

  function renderActiveClassChips() {
    if (!activeClassList) return;
    const chips = [];

    classSnapshot.imgClasses.forEach((className) => {
      chips.push(`
        <button
          class="class-chip"
          type="button"
          data-copy-value="${className}"
          data-copy-label="Class copied: ${className}"
          title="Copy ${className}"
        >
          .${className}
        </button>
      `);
    });

    if (classSnapshot.needsFrameWrapper) {
      classSnapshot.frameClasses.forEach((className) => {
        chips.push(`
          <button
            class="class-chip"
            type="button"
            data-copy-value="${className}"
            data-copy-label="Class copied: ${className}"
            title="Copy ${className}"
          >
            .${className}
          </button>
        `);
      });
    }

    activeClassList.innerHTML = chips.join('');
  }

  function renderClassSearchResults(query = '') {
    if (!classSearchResults) return;
    const normalized = query.trim().toLowerCase();
    const filtered = normalized
      ? searchableClassNames.filter((name) =>
          name.toLowerCase().includes(normalized),
        )
      : searchableClassNames;

    if (!filtered.length) {
      classSearchResults.innerHTML =
        '<div class="class-result-empty">No class matches found.</div>';
      return;
    }

    classSearchResults.innerHTML = filtered
      .map(
        (className) => `
        <div class="class-result-row">
          <span class="class-result-name">.${className}</span>
          <button
            type="button"
            class="class-result-btn"
            data-class-apply="${className}"
          >
            Apply
          </button>
          <button
            type="button"
            class="class-result-btn"
            data-class-copy="${className}"
          >
            Copy
          </button>
        </div>
      `,
      )
      .join('');
  }

  function updateSandboxCode() {
    classSnapshot = buildClassListsFromState();
    const imgClassString = classSnapshot.imgClasses.join(' ');
    const frameClassString = classSnapshot.frameClasses.join(' ');

    previewImg.className = imgClassString;
    previewFrame.className = frameClassString;

    let codeText = '';
    if (markupMode === 'jsx') {
      if (classSnapshot.needsFrameWrapper) {
        codeText = `<div className="${frameClassString}">
  <img
    className="${imgClassString}"
    src="landscape.jpg"
    alt="Demo Image"
  />
</div>`;
      } else {
        codeText = `<img
  className="${imgClassString}"
  src="landscape.jpg"
  alt="Demo Image"
/>`;
      }
    } else if (classSnapshot.needsFrameWrapper) {
      codeText = `<div class="${frameClassString}">
  <img
    class="${imgClassString}"
    src="landscape.jpg"
    alt="Demo Image"
  />
</div>`;
    } else {
      codeText = `<img
  class="${imgClassString}"
  src="landscape.jpg"
  alt="Demo Image"
/>`;
    }

    codeOutput.textContent = codeText;
    renderActiveClassChips();
  }

  function applyPreset(presetKey) {
    const preset = presetConfigs[presetKey];
    if (!preset) return;

    activeFilters = new Set(preset.filters || []);
    activeTransform = preset.transform || null;
    activeAnimation = preset.animation || null;
    activeAspect = preset.aspect || null;
    activeFit = preset.fit || 'lum-fit-cover';
    activeHover = preset.hover || null;

    syncControlButtons();
    updateSandboxCode();
    showToast(`Preset applied: ${presetKey}`);
  }

  function randomizeSandboxState() {
    const filterClasses = Array.from(filterButtons).map(
      (btn) => btn.dataset.class,
    );
    const transformClasses = Array.from(transformButtons).map(
      (btn) => btn.dataset.class,
    );
    const animationClasses = Array.from(animationButtons).map(
      (btn) => btn.dataset.class,
    );
    const aspectClasses = Array.from(aspectButtons).map(
      (btn) => btn.dataset.class,
    );
    const fitClasses = Array.from(fitButtons).map((btn) => btn.dataset.class);
    const hoverClasses = Array.from(hoverButtons).map(
      (btn) => btn.dataset.class,
    );

    const selectedFilterCount = Math.floor(Math.random() * 4);
    const shuffledFilters = [...filterClasses].sort(() => Math.random() - 0.5);
    activeFilters = new Set(shuffledFilters.slice(0, selectedFilterCount));

    activeTransform =
      Math.random() > 0.45 ? pickRandom(transformClasses) : null;
    activeAnimation = Math.random() > 0.4 ? pickRandom(animationClasses) : null;
    activeAspect = Math.random() > 0.4 ? pickRandom(aspectClasses) : null;
    activeFit = pickRandom(fitClasses);
    activeHover = Math.random() > 0.35 ? pickRandom(hoverClasses) : null;

    syncControlButtons();
    updateSandboxCode();
    showToast('Sandbox randomized');
  }

  function resetSandboxState() {
    activeFilters = new Set();
    activeTransform = null;
    activeAnimation = null;
    activeAspect = null;
    activeFit = 'lum-fit-cover';
    activeHover = null;
    syncControlButtons();
    updateSandboxCode();
  }

  syncMarkupModeUI();
  syncControlButtons();
  updateSandboxCode();
  renderClassSearchResults();

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      markupMode = btn.dataset.markupMode || 'html';
      syncMarkupModeUI();
      updateSandboxCode();
    });
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cls = btn.dataset.class;
      if (activeFilters.has(cls)) activeFilters.delete(cls);
      else activeFilters.add(cls);
      syncControlButtons();
      updateSandboxCode();
    });
  });

  transformButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cls = btn.dataset.class;
      activeTransform = activeTransform === cls ? null : cls;
      syncControlButtons();
      updateSandboxCode();
    });
  });

  animationButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cls = btn.dataset.class;
      activeAnimation = activeAnimation === cls ? null : cls;
      syncControlButtons();
      updateSandboxCode();
    });
  });

  aspectButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cls = btn.dataset.class;
      activeAspect = activeAspect === cls ? null : cls;
      syncControlButtons();
      updateSandboxCode();
    });
  });

  fitButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFit = btn.dataset.class;
      syncControlButtons();
      updateSandboxCode();
    });
  });

  hoverButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cls = btn.dataset.class;
      activeHover = activeHover === cls ? null : cls;
      syncControlButtons();
      updateSandboxCode();
    });
  });

  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      applyPreset(preset);
    });
  });

  randomizeBtn.addEventListener('click', randomizeSandboxState);
  resetBtn.addEventListener('click', resetSandboxState);

  classSearchInput.addEventListener('input', () => {
    renderClassSearchResults(classSearchInput.value);
  });

  classSearchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      classSearchInput.value = '';
      renderClassSearchResults('');
    }
  });

  clearClassSearchBtn.addEventListener('click', () => {
    classSearchInput.value = '';
    classSearchInput.focus();
    renderClassSearchResults('');
  });

  classSearchResults.addEventListener('click', (event) => {
    const applyClass = event.target.getAttribute('data-class-apply');
    const copyClass = event.target.getAttribute('data-class-copy');

    if (applyClass) {
      const btn = classButtonMap.get(applyClass);
      if (btn) btn.click();
      showToast(`Applied .${applyClass}`);
      return;
    }

    if (copyClass) {
      copyText(copyClass, `Class copied: ${copyClass}`);
    }
  });

  copyBtn.addEventListener('click', () => {
    const label =
      markupMode === 'jsx' ? 'Generated JSX copied' : 'Generated HTML copied';
    copyText(codeOutput.textContent, label);
  });

  copyClassListBtn.addEventListener('click', () => {
    const lines = [`img: ${classSnapshot.imgClasses.join(' ')}`];
    if (classSnapshot.needsFrameWrapper) {
      lines.push(`frame: ${classSnapshot.frameClasses.join(' ')}`);
    }
    copyText(lines.join('\n'), 'Class list copied');
  });

  activeClassList.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-copy-value]');
    if (!btn) return;
    const className = btn.getAttribute('data-copy-value');
    const label = btn.getAttribute('data-copy-label') || 'Class copied';
    copyText(className, label);
  });

  document.querySelectorAll('[data-copy-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;
      const label = btn.getAttribute('data-copy-label') || 'Snippet copied';
      copyText(target.textContent.trim(), label);
    });
  });

  document.querySelectorAll('[data-copy-value]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.getAttribute('data-copy-value');
      const label = btn.getAttribute('data-copy-label') || 'Class copied';
      copyText(value, label);
    });
  });

  // Customizer inputs live update
  const customScale = document.getElementById('customScale');
  const customRotate = document.getElementById('customRotate');
  const customBlur = document.getElementById('customBlur');
  const customGray = document.getElementById('customGray');
  const customRotateY = document.getElementById('customRotateY');
  const customScaleVal = document.getElementById('customScaleVal');
  const customRotateVal = document.getElementById('customRotateVal');
  const customBlurVal = document.getElementById('customBlurVal');
  const customGrayVal = document.getElementById('customGrayVal');
  const customRotateYVal = document.getElementById('customRotateYVal');
  const customizerImage = document.getElementById('customizerImage');

  function updateCustomizer() {
    const scale = customScale.value;
    const rotate = customRotate.value;
    const blur = customBlur.value;
    const gray = customGray.value;
    const rotateY = customRotateY.value;

    customScaleVal.textContent = scale;
    customRotateVal.textContent = `${rotate}deg`;
    customBlurVal.textContent = `${blur}px`;
    customGrayVal.textContent = `${gray}%`;
    customRotateYVal.textContent = `${rotateY}deg`;

    customizerImage.style.setProperty('--lum-scale', scale);
    customizerImage.style.setProperty('--lum-rotate', `${rotate}deg`);
    customizerImage.style.setProperty('--lum-blur', `blur(${blur}px)`);
    customizerImage.style.setProperty('--lum-grayscale', `grayscale(${gray}%)`);
    customizerImage.style.setProperty('--lum-rotate-y', `${rotateY}deg`);
  }

  [customScale, customRotate, customBlur, customGray, customRotateY].forEach(
    (slider) => {
      slider.addEventListener('input', updateCustomizer);
    },
  );

  // Touch fallback support
  const frames = document.querySelectorAll('.lum-frame, .lum-img');
  frames.forEach((el) => {
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      const isActive = el.classList.contains('lum-touch-active');
      frames.forEach((node) => node.classList.remove('lum-touch-active'));
      if (!isActive) el.classList.add('lum-touch-active');
    });
  });

  document.addEventListener('click', (event) => {
    if (
      !event.target.closest('.lum-frame') &&
      !event.target.closest('.lum-img')
    ) {
      frames.forEach((node) => node.classList.remove('lum-touch-active'));
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== classSearchInput) {
      event.preventDefault();
      classSearchInput.focus();
    }
  });
});
