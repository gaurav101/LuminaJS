// Import CSS framework for Vite compilation and hot reloading
import '../../../src/lumina-image.css';

document.addEventListener('DOMContentLoaded', () => {
  const previewImg = document.getElementById('sandboxImage');
  const previewFrame = document.getElementById('sandboxFrame');
  const codeOutput = document.getElementById('codeOutput');
  const copyBtn = document.getElementById('btnCopy');
  const toast = document.getElementById('toast');

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
        if (
          cls.includes('zoom') ||
          cls.includes('shrink') ||
          cls.includes('rotate') ||
          cls.includes('tilt') ||
          cls.includes('flip') ||
          cls.includes('grayscale') ||
          cls.includes('blur') ||
          cls.includes('bright') ||
          cls.includes('sepia') ||
          cls.includes('invert')
        ) {
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
    const filtersStr = Array.from(activeFilters).join(' ');
    const transformStr = activeTransform ? ` ${activeTransform}` : '';
    const aspectStr = activeAspect ? ` ${activeAspect}` : '';
    const fitStr = activeFit ? ` ${activeFit}` : '';
    const hoverStr = activeHover ? ` ${activeHover}` : '';

    const imgClasses = `lum-img${fitStr ? ` ${fitStr}` : ''}${filtersStr ? ` ${filtersStr}` : ''}${transformStr ? `${transformStr}` : ''}${hoverStr && (hoverStr.includes('zoom') || hoverStr.includes('shrink') || hoverStr.includes('rotate') || hoverStr.includes('tilt') || hoverStr.includes('flip') || hoverStr.includes('grayscale') || hoverStr.includes('blur') || hoverStr.includes('bright') || hoverStr.includes('sepia') || hoverStr.includes('invert')) ? `${hoverStr}` : ''}`;
    const frameClasses = `lum-frame${aspectStr ? `${aspectStr}` : ''}${hoverStr && !(hoverStr.includes('zoom') || hoverStr.includes('shrink') || hoverStr.includes('rotate') || hoverStr.includes('tilt') || hoverStr.includes('flip') || hoverStr.includes('grayscale') || hoverStr.includes('blur') || hoverStr.includes('bright') || hoverStr.includes('sepia') || hoverStr.includes('invert')) ? `${hoverStr}` : ''}`;

    let codeText;
    if (activeAspect || (hoverStr && !imgClasses.includes(activeHover))) {
      // If frame is active, wrap in lum-frame
      codeText = `<div class="${frameClasses}">
  <img 
    class="${imgClasses}" 
    src="landscape.jpg" 
    alt="Demo Image"
  />
</div>`;
    } else {
      // Just bare image
      codeText = `<img 
  class="${imgClasses}" 
  src="landscape.jpg" 
  alt="Demo Image"
/>`;
    }

    codeOutput.textContent = codeText;
  }

  // Handle Copy Snippet Action
  copyBtn.addEventListener('click', () => {
    navigator.clipboard
      .writeText(codeOutput.textContent)
      .then(() => {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
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
