
// File: src/App.jsx
import React from 'react';
import './App.css';

export default function App() {
  // create 5 identical pages for testing
  const pages = Array.from({ length: 5 });

// Replace the old positioning useEffect with this
React.useEffect(() => {
  const update = () => {
    document.querySelectorAll('.page').forEach((page) => {
      const img2 = page.querySelector('.placeholder--two, .img--two, .svg--two');
      const text3 = page.querySelector('.text--three');
      if (!img2 || !text3) return;

      const pageR = page.getBoundingClientRect();
      const img2R  = img2.getBoundingClientRect();
      const textR  = text3.getBoundingClientRect();

      // left: align left edges
      const leftRel = Math.max(0, img2R.left - pageR.left);

      // top: position so text's BOTTOM aligns with img2's TOP
      const topRel = Math.max(0, img2R.top - pageR.top - textR.height - 16);
      
      Object.assign(text3.style, {
        position: 'absolute',
        left: `${leftRel}px`,
        top: `${topRel}px`,
        transform: 'none',
        zIndex: '9999',
        pointerEvents: 'none',
      });
    });
  };

  update();
  const tick = setTimeout(update, 60); // catch late layout changes
  window.addEventListener('resize', update);
  window.addEventListener('load', update);

  const ro = new ResizeObserver(update);
  document.querySelectorAll('.page').forEach((el) => ro.observe(el));

  // attach image load listeners for <img class="img--two">
  document.querySelectorAll('.page').forEach((page) => {
    const img = page.querySelector('.img--two');
    if (img && img.tagName.toLowerCase() === 'img') img.addEventListener('load', update);
  });

  return () => {
    clearTimeout(tick);
    window.removeEventListener('resize', update);
    window.removeEventListener('load', update);
    ro.disconnect();
    document.querySelectorAll('.page').forEach((page) => {
      const img = page.querySelector('.img--two');
      if (img && img.tagName.toLowerCase() === 'img') img.removeEventListener('load', update);
    });
  };
}, []);


  React.useEffect(() => {
  const updateImageOneSizes = () => {
    document.querySelectorAll('.page').forEach((page) => {
      const inner = page.querySelector('.inner');
      if (!inner) return;
      const text1 = inner.querySelector('.text--one');
      const img1 = inner.querySelector('.placeholder--one') || inner.querySelector('.img--one') || inner.querySelector('.svg--one');
      if (!text1 || !img1) return;

      // measured height of text--one (px)
      const tRect = text1.getBoundingClientRect();
      const targetHeightPx = tRect.height * 1.2; // 120%

      // Helper: set height & width while preserving aspect ratio
      const setSizeForImgElement = (el, heightPx) => {
        // <img> (HTMLImageElement)
        if (el.tagName.toLowerCase() === 'img') {
          el.style.height = `${heightPx}px`;
          el.style.width = 'auto';
          el.style.objectFit = 'contain';
          return;
        }

        // <svg> (SVGElement) - compute aspect ratio from viewBox or bbox
        if (el instanceof SVGElement) {
          let ar = 1; // width / height
          const vb = el.getAttribute('viewBox');
          if (vb) {
            const parts = vb.trim().split(/\s+/).map(Number);
            if (parts.length === 4 && parts.every(n => !Number.isNaN(n) && isFinite(n))) {
              const [, , vbW, vbH] = parts;
              if (vbH > 0) ar = vbW / vbH;
            }
          } else {
            // fallback to bbox (may throw in some SVGs; guard it)
            try {
              const bb = el.getBBox();
              if (bb.height > 0) ar = bb.width / bb.height;
            } catch (e) { /* ignore */ }
          }
          el.style.height = `${heightPx}px`;
          el.style.width = `${heightPx * ar}px`;
          return;
        }

        // Generic element fallback
        el.style.height = `${heightPx}px`;
        el.style.width = 'auto';
      };

      // apply position anchors (top-left)
      img1.style.position = 'absolute';
      img1.style.top = '0';
      img1.style.left = '0';

      // set size
      setSizeForImgElement(img1, targetHeightPx);
    });
  };

  // initial layout
  updateImageOneSizes();

  // re-calc on resize and when inner content changes
  window.addEventListener('resize', updateImageOneSizes);
  const ro = new ResizeObserver(updateImageOneSizes);
  document.querySelectorAll('.inner').forEach((el) => ro.observe(el));

  return () => {
    window.removeEventListener('resize', updateImageOneSizes);
    ro.disconnect();
  };
}, []);

  React.useEffect(() => {
  const updateAllLines = () => {
    document.querySelectorAll('.page').forEach((page) => {
      const inner = page.querySelector('.inner');
      if (!inner) return;
      const t1 = inner.querySelector('.text--one');
      const t2 = inner.querySelector('.text--two');
      const line = inner.querySelector('.line');
      if (!t1 || !t2 || !line) return;

      const r1 = t1.getBoundingClientRect();
      const r2 = t2.getBoundingClientRect();
      const innerR = inner.getBoundingClientRect();

      // center point between bottom of t1 and top of t2, relative to .inner top
      const centerY = ((r1.bottom + r2.top) / 2) - innerR.top;

      // apply positioning to the line
      line.style.position = 'absolute';
      line.style.left = '0';
      line.style.right = '0';
      line.style.top = `${centerY}px`;
      line.style.height = '4px';
      line.style.transform = 'none';
      line.style.zIndex = '10';
      line.style.pointerEvents = 'none';
    });
  };

  // initial placement
  updateAllLines();

  // update on resize
  window.addEventListener('resize', updateAllLines);

  // also observe size/content changes of each .inner
  const ro = new ResizeObserver(updateAllLines);
  document.querySelectorAll('.inner').forEach((el) => ro.observe(el));

  return () => {
    window.removeEventListener('resize', updateAllLines);
    ro.disconnect();
  };
}, []);

React.useEffect(() => {
  const GAP_PX = 48; // small gap between text2 and text3

  const isMobileDevice = () => {
    // Touch-capable, coarse pointer, or common mobile UA tokens
    const touch = typeof navigator !== 'undefined' && ('maxTouchPoints' in navigator ? navigator.maxTouchPoints > 0 : 'ontouchstart' in window);
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const uaMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent || '');
    return Boolean(touch || coarse || uaMobile);
  };

  const updateDevicePositions = () => {
    const onDevice = isMobileDevice();

    document.querySelectorAll('.page').forEach((page) => {
      const inner = page.querySelector('.inner');
      const text2 = inner && inner.querySelector('.text--two');
      const text3 = page.querySelector('.text--three');
      if (!inner || !text2 || !text3) return;

      const innerR = inner.getBoundingClientRect();
      const t2R = text2.getBoundingClientRect();
      const t3R = text3.getBoundingClientRect();

      const t3TopRel = t3R.top - innerR.top;
      const t2Height = t2R.height;
      const t2TopRel = t2R.top - innerR.top;

      // if text2 would overlap text3, move it up so its BOTTOM sits above text3.top - GAP
      if (t2TopRel + t2Height > t3TopRel - GAP_PX) {
        const desiredTop = Math.max(0, t3TopRel - GAP_PX - t2Height);
        text2.style.position = 'absolute';
        text2.style.top = `${desiredTop}px`;
        text2.style.bottom = 'auto';
      } else {
        // already above; keep natural bottom anchor
        text2.style.position = 'absolute';
        text2.style.top = '';
        text2.style.bottom = '2%';
      }
    });
  };

  // run initially and on relevant events
  updateDevicePositions();
  const tick = setTimeout(updateDevicePositions, 60); // catch late layout
  window.addEventListener('resize', updateDevicePositions);
  window.addEventListener('orientationchange', updateDevicePositions);

  const ro = new ResizeObserver(updateDevicePositions);
  document.querySelectorAll('.inner').forEach((el) => ro.observe(el));

  return () => {
    clearTimeout(tick);
    window.removeEventListener('resize', updateDevicePositions);
    window.removeEventListener('orientationchange', updateDevicePositions);
    ro.disconnect();
  };
}, []);

  React.useEffect(() => {
  const updateIntermediateSpace = () => {
    document.querySelectorAll('.page').forEach((page) => {
      const inner = page.querySelector('.inner');
      const svg = page.querySelector('.placeholder--two, .img--two, .svg--two');
      if (!inner || !svg) {
        // restore any previously set padding if svg/inner missing
        page.style.paddingBottom = '';
        return;
      }

      const innerR = inner.getBoundingClientRect();
      const svgR = svg.getBoundingClientRect();

      // how many pixels the svg extends below the inner bottom
      const gapPx = Math.max(0, svgR.bottom - innerR.bottom);

      // ensure the next page starts after that intermediate space:
      // apply as padding-bottom on the page (so section height includes the intermediate space)
      page.style.paddingBottom = `${gapPx}px`;
    });
  };

  updateIntermediateSpace();
  const t = setTimeout(updateIntermediateSpace, 60); // catch late image load layout
  window.addEventListener('resize', updateIntermediateSpace);
  window.addEventListener('load', updateIntermediateSpace);

  const ro = new ResizeObserver(updateIntermediateSpace);
  document.querySelectorAll('.page').forEach((el) => ro.observe(el));

  return () => {
    clearTimeout(t);
    window.removeEventListener('resize', updateIntermediateSpace);
    window.removeEventListener('load', updateIntermediateSpace);
    ro.disconnect();
  };
}, []);

  return (
    <div className="App">
      {pages.map((_, i) => (
        <section key={i} className={`page`}>
          {/* Inner box contains ALL content now */}
          <div className="inner">
            {/* Text windows placed inside the inner box */}
            <img src="/websitegrafikalogo.svg" alt="" className="img--one" aria-hidden />
            <div className="text text--one" aria-hidden>
              NP<br />Racing
            </div>
            <div className="line" aria-hidden />

            <div className="text text--two">
              Czechia's only<br />STEM Racing<br />team
            </div>
          </div>
          /* <img src="/schody.svg" alt="" className="img--two" aria-hidden /> */
          <div className="text text--three" aria-hidden>
              Scroll
          </div>
        </section>
      ))}
    </div>
  );
}
