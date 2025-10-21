
// File: src/App.jsx
import React from 'react';
import './App.css';

export default function App() {
  // create 5 identical pages for testing
  const pages = Array.from({ length: 5 });

  React.useEffect(() => {
  const updatePositions = () => {
    document.querySelectorAll('.page').forEach((page) => {
      const inner = page.querySelector('.inner');
      if (!inner) return;
      const img1 = inner.querySelector('.placeholder--one');
      const img2 = inner.querySelector('.placeholder--two');
      const text3 = inner.querySelector('.text--three');
      if (!img1 || !img2 || !text3) return;

      // Ensure SVG placeholders keep aspect ratio (if they're SVGs)
      if (img1 instanceof SVGElement) img1.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      if (img2 instanceof SVGElement) img2.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      // Size & anchor the images (CSS also sets this but we enforce here so measurements are reliable)
      Object.assign(img1.style, {
        position: 'absolute',
        top: '0px',
        left: '0px',
        height: '6vw',
        width: 'auto',
      });
      Object.assign(img2.style, {
        position: 'absolute',
        bottom: '0px',
        right: '0px',
        height: '7vw',
        width: 'auto',
      });

      // Compute positions relative to .inner
      const innerR = inner.getBoundingClientRect();
      const img2R = img2.getBoundingClientRect();

      // The top-left corner of img2 relative to inner:
      const img2LeftRelative = img2R.left - innerR.left;
      const img2TopRelative = img2R.top - innerR.top;

      // We want text3's BOTTOM-LEFT to match img2's TOP-LEFT.
      // Set text3.left = img2LeftRelative
      // Set text3.bottom = innerHeight - img2TopRelative
      const innerHeight = innerR.height;
      const bottomValuePx = innerHeight - img2TopRelative;

      Object.assign(text3.style, {
        position: 'absolute',
        left: `${img2LeftRelative}px`,
        bottom: `${bottomValuePx}px`,
        top: 'auto',              // remove conflicting top
        transform: 'none',        // remove translateY used earlier
      });
    });
  };

  updatePositions();
  window.addEventListener('resize', updatePositions);

  const ro = new ResizeObserver(updatePositions);
  document.querySelectorAll('.inner').forEach((el) => ro.observe(el));

  return () => {
    window.removeEventListener('resize', updatePositions);
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
            <div className="text text--one" aria-hidden>
              NP<br />Racing
            </div>
            <div className="line" aria-hidden />

            <div className="text text--two">
              Czechia's only<br />STEM Racing<br />team
            </div>

            <div className="text text--three" aria-hidden>
              {/* intentionally left blank */}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
