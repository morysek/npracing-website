
// File: src/App.jsx
import React from 'react';
import './App.css';

export default function App() {
  // create 5 identical pages for testing
  const pages = Array.from({ length: 5 });

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
  const update = () => {
    document.querySelectorAll('.page').forEach((page) => {
      const inner = page.querySelector('.inner');
      if (!inner) return;
      const img2 = inner.querySelector('.img--two'); // bottom-right image
      const text3 = inner.querySelector('.text--three');
      if (!img2 || !text3) return;

      const innerR = inner.getBoundingClientRect();
      const img2R = img2.getBoundingClientRect();

      // top-left of img2 relative to inner:
      const leftRel = img2R.left - innerR.left;
      const topRel = img2R.top - innerR.top;

      // set text3's bottom-left to match img2 top-left:
      const bottomPx = Math.max(0, innerR.height - topRel);

      Object.assign(text3.style, {
        left: `${leftRel}px`,
        bottom: `${bottomPx}px`,
        top: 'auto',
        right: 'auto',
        transform: 'none',
      });
    });
  };

  // run once and on resize / inner changes
  update();
  window.addEventListener('resize', update);
  const ro = new ResizeObserver(update);
  document.querySelectorAll('.inner').forEach((el) => ro.observe(el));

  return () => {
    window.removeEventListener('resize', update);
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
          <img src="/muzschodyweb.svg" alt="" className="img--two" aria-hidden />
          <div className="text text--three" aria-hidden>
              Scroll
          </div>
        </section>
      ))}
    </div>
  );
}
