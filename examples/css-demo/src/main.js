// Import CSS framework for Vite compilation and hot reloading
import '../../../src/lumina-image.css';

document.addEventListener('DOMContentLoaded', () => {
  const previewImg = document.getElementById('sandboxImage');
  const previewFrame = document.getElementById('sandboxFrame');
  const codeOutput = document.getElementById('codeOutput');
  const copyBtn = document.getElementById('btnCopy');
  const copyClassListBtn = document.getElementById('btnCopyClassList');
  const activeClassList = document.getElementById('activeClassList');
  const toast = document.getElementById('toast');
  let toastTimer;

  // Interactive selectors configuration
  const filterButtons = document.querySelectorAll('[data-category="filter"]');
  const transformButtons = document.querySelectorAll(
    '[data-category="transform"]',
  );
  const aspectButtons = document.querySelectorAll('[data-category="aspect"]');
  const fitButtons = document.querySelectorAll('[data-category="fit"]');
  const hoverButtons = document.querySelectorAll('[data-category="hover"]');

  // Currently active sandbox classes
  let activeFilters = new Set();
  let activeTransform = null;
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

  const isImageHoverClass = (className) =>
    imageHoverTokens.some((token) => className.includes(token));

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

  // Initial code rendering
  updateSandboxCode();

  // Handle Multi-select filters
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cls = btn.dataset.class;
      if (activeFilters.has(cls)) {
        activeFilters.delete(cls);
        btn.classList.remove('active');
        previewImg.classList.remove(cls);
      } else {
        activeFilters.add(cls);
        btn.classList.add('active');
        previewImg.classList.add(cls);
      }
      updateSandboxCode();
    });
  });

  // Handle Single-select transforms
  transformButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cls = btn.dataset.class;
      transformButtons.forEach((b) => b.classList.remove('active'));

      if (activeTransform === cls) {
        activeTransform = null;
        previewImg.classList.remove(cls);
      } else {
        if (activeTransform) previewImg.classList.remove(activeTransform);
        activeTransform = cls;
        btn.classList.add('active');
        previewImg.classList.add(cls);
      }
      updateSandboxCode();
    });
  });

  // Handle Single-select aspect ratios on frame
  aspectButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cls = btn.dataset.class;
      aspectButtons.forEach((b) => b.classList.remove('active'));

      if (activeAspect === cls) {
        activeAspect = null;
        previewFrame.classList.remove(cls);
      } else {
        if (activeAspect) previewFrame.classList.remove(activeAspect);
        activeAspect = cls;
        btn.classList.add('active');
        previewFrame.classList.add(cls);
      }
      updateSandboxCode();
    });
  });

  // Handle Single-select object fit
  fitButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cls = btn.dataset.class;
      fitButtons.forEach((b) => b.classList.remove('active'));

      if (activeFit) previewImg.classList.remove(activeFit);
      activeFit = cls;
      btn.classList.add('active');
      previewImg.classList.add(cls);
      updateSandboxCode();
    });
  });

  // Handle Single-select hovers on frame or image
  hoverButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cls = btn.dataset.class;
      hoverButtons.forEach((b) => b.classList.remove('active'));

      // Clean up previous hover classes
      const allHovers = Array.from(hoverButtons).map((b) => b.dataset.class);
      allHovers.forEach((h) => {
        previewImg.classList.remove(h);
        previewFrame.classList.remove(h);
      });

      if (activeHover === cls) {
        activeHover = null;
      } else {
        activeHover = cls;
        btn.classList.add('active');

        // Some hover states apply to frame, some to image
        if (isImageHoverClass(cls)) {
          previewImg.classList.add(cls);
        } else {
          previewFrame.classList.add(cls);
        }
      }
      updateSandboxCode();
    });
  });

  // Reset sandbox control
  document.getElementById('btnResetSandbox').addEventListener('click', () => {
    // Reset buttons
    const allButtons = document.querySelectorAll('.control-btn');
    allButtons.forEach((b) => b.classList.remove('active'));

    // Reset variables
    activeFilters.clear();
    activeTransform = null;
    activeAspect = null;
    activeFit = 'lum-fit-cover';
    activeHover = null;

    // Reset default active fit class
    document
      .querySelector('[data-class="lum-fit-cover"]')
      .classList.add('active');

    // Reset element classes
    previewImg.className = 'lum-img lum-fit-cover';
    previewFrame.className = 'lum-frame';

    updateSandboxCode();
  });

  // Update HTML Code Box
  function updateSandboxCode() {
    const imgClasses = ['lum-img'];
    const frameClasses = ['lum-frame'];

    if (activeFit) imgClasses.push(activeFit);
    if (activeFilters.size) imgClasses.push(...Array.from(activeFilters));
    if (activeTransform) imgClasses.push(activeTransform);

    if (activeAspect) frameClasses.push(activeAspect);
    if (activeHover) {
      if (isImageHoverClass(activeHover)) {
        imgClasses.push(activeHover);
      } else {
        frameClasses.push(activeHover);
      }
    }

    const imgClassString = imgClasses.join(' ');
    const frameClassString = frameClasses.join(' ');
    const needsFrameWrapper = frameClasses.length > 1;

    classSnapshot = {
      imgClasses,
      frameClasses,
      needsFrameWrapper,
    };

    let codeText;
    if (needsFrameWrapper) {
      // If frame is active, wrap in lum-frame
      codeText = `<div class="${frameClassString}">
  <img 
    class="${imgClassString}" 
    src="landscape.jpg" 
    alt="Demo Image"
  />
</div>`;
    } else {
      // Just bare image
      codeText = `<img 
  class="${imgClassString}" 
  src="landscape.jpg" 
  alt="Demo Image"
/>`;
    }

    codeOutput.textContent = codeText;
    renderActiveClassChips();
  }

  // Handle Copy Snippet Action
  copyBtn.addEventListener('click', () => {
    copyText(codeOutput.textContent, 'Generated HTML copied');
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
    customRotateVal.textContent = rotate + 'deg';
    customBlurVal.textContent = blur + 'px';
    customGrayVal.textContent = gray + '%';
    customRotateYVal.textContent = rotateY + 'deg';

    // Write directly to CSS variables on element
    customizerImage.style.setProperty('--lum-scale', scale);
    customizerImage.style.setProperty('--lum-rotate', rotate + 'deg');
    customizerImage.style.setProperty('--lum-blur', `blur(${blur}px)`);
    customizerImage.style.setProperty('--lum-grayscale', `grayscale(${gray}%)`);
    customizerImage.style.setProperty('--lum-rotate-y', rotateY + 'deg');
  }

  [customScale, customRotate, customBlur, customGray, customRotateY].forEach(
    (slider) => {
      slider.addEventListener('input', updateCustomizer);
    },
  );

  // Touch triggers fallback support using standard click events
  const frames = document.querySelectorAll('.lum-frame, .lum-img');
  frames.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = el.classList.contains('lum-touch-active');
      frames.forEach((f) => f.classList.remove('lum-touch-active'));
      if (!isActive) {
        el.classList.add('lum-touch-active');
      }
    });
  });

  // Close touch highlights on clicking anywhere else
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.lum-frame') && !e.target.closest('.lum-img')) {
      frames.forEach((f) => f.classList.remove('lum-touch-active'));
    }
  });
});
