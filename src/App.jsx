
// File: src/App.jsx
import React from 'react';
import './App.css';

export default function App() {
  // create 5 identical pages for testing
  const pages = Array.from({ length: 5 });

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
      line.style.height = '2px';
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
