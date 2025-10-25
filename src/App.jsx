// File: src/App.jsx
import React from 'react';
import './App.css';

export default function App() {
  // create 5 identical pages for testing
  const pages = Array.from({ length: 5 });

  // helper device detection used by multiple effects
  const isMobileDevice = () => {
    const uaMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent || '');
    return Boolean(uaMobile);
  };

  // --- FIRST positioning useEffect (branching: device vs non-device) ---
  React.useEffect(() => {
    const update = () => {
      const onDevice = isMobileDevice();

      document.querySelectorAll('.page').forEach((page) => {
        const text3 = page.querySelector('.text--three');
        if (!text3 || !page) return;

        // non-mobile: anchor text3 bottom-left to inner bottom-left
        if (!onDevice) {
          const inner = page.querySelector('.inner');
          if (!inner) return;

          const pageR = page.getBoundingClientRect();
          const innerR = inner.getBoundingClientRect();
          const textR = text3.getBoundingClientRect();

          const leftRel = Math.max(0, innerR.left - pageR.left);
          const topRel = Math.max(0, innerR.bottom - pageR.top - textR.height);

          Object.assign(text3.style, {
            position: 'absolute',
            left: `${leftRel}px`,
            top: `${topRel}px`,
            transform: 'none',
            zIndex: '9999',
            pointerEvents: 'none',
          });

          return; // done for non-device
        }

        // on device: keep original behaviour (position relative to img2)
        const img2 = page.querySelector('.placeholder--two, .img--two, .svg--two');
        if (!img2) return;

        const pageR = page.getBoundingClientRect();
        const img2R = img2.getBoundingClientRect();
        const textR = text3.getBoundingClientRect();

        // left: align left edges
        const leftRel = Math.max(0, img2R.left - pageR.left);

        // top: position so text's BOTTOM aligns with img2's TOP (kept -16 gap like earlier)
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

  // --- Image1 sizing (120% of text--one height) ---
  React.useEffect(() => {
    const updateImageOneSizes = () => {
      document.querySelectorAll('.page').forEach((page) => {
        const inner = page.querySelector('.inner');
        if (!inner) return;
        const text1 = inner.querySelector('.text--one');
        const img1 =
          inner.querySelector('.placeholder--one') ||
          inner.querySelector('.img--one') ||
          inner.querySelector('.svg--one');
        if (!text1 || !img1) return;

        // measured height of text--one (px)
        const tRect = text1.getBoundingClientRect();
        const targetHeightPx = tRect.height * 1.2; // 120%

        // Helper: set height & width while preserving aspect ratio
        const setSizeForImgElement = (el, heightPx) => {
          if (el.tagName && el.tagName.toLowerCase() === 'img') {
            el.style.height = `${heightPx}px`;
            el.style.width = 'auto';
            el.style.objectFit = 'contain';
            return;
          }

          if (el instanceof SVGElement) {
            let ar = 1; // width / height
            const vb = el.getAttribute('viewBox');
            if (vb) {
              const parts = vb.trim().split(/\s+/).map(Number);
              if (parts.length === 4 && parts.every((n) => !Number.isNaN(n) && isFinite(n))) {
                const [, , vbW, vbH] = parts;
                if (vbH > 0) ar = vbW / vbH;
              }
            } else {
              try {
                const bb = el.getBBox();
                if (bb.height > 0) ar = bb.width / bb.height;
              } catch (e) {
                /* ignore */
              }
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

  // --- Device-based repositioning for text--two (keeps it above text--three on touch devices) ---
  React.useEffect(() => {
    const GAP_PX = 48;

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


        // mobile/device: ensure text2 is fully above text3
        if (t2TopRel + t2Height > t3TopRel - GAP_PX) {
          const desiredTop = Math.max(0, t3TopRel - GAP_PX - t2Height);
          text2.style.position = 'absolute';
          text2.style.top = `${desiredTop}px`;
          text2.style.bottom = 'auto';
        }
      });
    };

    // run initially and on changes
    updateDevicePositions();
    const tick = setTimeout(updateDevicePositions, 60);
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

  // --- Add intermediate space padding so next page begins after svg bottom (when svg extends below inner) ---
  React.useEffect(() => {
    const updateGap = () => {
      document.querySelectorAll('.page').forEach((page) => {
        const inner = page.querySelector('.inner');
        const svg = page.querySelector('.img--two, .placeholder--two, .svg--two');
        if (!inner || !svg) {
          page.style.paddingBottom = '';
          return;
        }

        const innerR = inner.getBoundingClientRect();
        const svgR = svg.getBoundingClientRect();
        const gapPx = Math.max(0, svgR.bottom - innerR.bottom);
        page.style.paddingBottom = `${gapPx}px`;
      });
    };
    updateGap();
    const t = setTimeout(updateGap, 60);
    window.addEventListener('resize', updateGap);
    window.addEventListener('load', updateGap);
    const ro = new ResizeObserver(updateGap);
    document.querySelectorAll('.page').forEach((el) => ro.observe(el));
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updateGap);
      window.removeEventListener('load', updateGap);
      ro.disconnect();
    };
  }, []);

  // --- Intermediate space div per-page (keeps visual gap as separate element) ---
  React.useEffect(() => {
    const updateIntermediateSpace = () => {
      // Get the anchored svg/image in the viewport
      const anchored = document.querySelector('.img--two, .placeholder--two, .svg--two');
      document.querySelectorAll('.page').forEach((page) => {
        const inner = page.querySelector('.inner');

        // find/create a sibling div immediately after the page
        let inter = page.nextElementSibling;
        if (!inter || !inter.classList.contains('intermediate-space')) {
          inter = document.createElement('div');
          inter.className = 'intermediate-space';
          page.parentNode.insertBefore(inter, page.nextSibling);
        }

        if (!inner || !anchored) {
          // no inner or no anchored image — clear height
          inter.style.height = '0px';
          return;
        }

        const innerR = inner.getBoundingClientRect();
        const anchoredR = anchored.getBoundingClientRect();

        // how many pixels the anchored image extends below inner bottom
        const gapPx = Math.max(0, anchoredR.bottom - innerR.bottom);

        // set the intermediate-space height so next page begins after that visual area
        inter.style.height = `${gapPx}px`;
        inter.style.width = '100%';
        inter.style.pointerEvents = 'none';
        inter.style.background = 'transparent';
        inter.style.display = 'block';
      });
    };

    updateIntermediateSpace();
    const t = setTimeout(updateIntermediateSpace, 60);
    window.addEventListener('resize', updateIntermediateSpace);
    window.addEventListener('load', updateIntermediateSpace);

    const ro = new ResizeObserver(updateIntermediateSpace);
    document.querySelectorAll('.inner').forEach((el) => ro.observe(el));

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updateIntermediateSpace);
      window.removeEventListener('load', updateIntermediateSpace);
      ro.disconnect();
    };
  }, []);

  React.useEffect(() => {
  const detectDevice = () => {
    const uaMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent || '');
    return Boolean(uaMobile);
  };

  const applyDeviceMode = () => {
  const onDevice = detectDevice();

  // toggle class so CSS can react
  document.documentElement.classList.toggle('is-device', onDevice);

  document.querySelectorAll('.page').forEach((page) => {
    const inner = page.querySelector('.inner');
    const text2 = inner && inner.querySelector('.text--two');
    if (!text2) return;

    if (onDevice) {
      // device: let it flow (no clipping)
      text2.style.position = 'static';
      text2.style.margin = '0 2% 4% 2%';
      text2.style.left = '';
      text2.style.bottom = '';
      text2.style.top = '';
    } else {
      // non-device: explicitly anchor to inner bottom-left
      text2.style.position = 'absolute';
      text2.style.left = '0';
      text2.style.bottom = '0';
      text2.style.top = '';
      text2.style.margin = '';
    }
  });
};

  // run now and on orientation/resize (keep responsive if device mode changes)
  applyDeviceMode();
  window.addEventListener('orientationchange', applyDeviceMode);
  window.addEventListener('resize', applyDeviceMode);

  return () => {
    window.removeEventListener('orientationchange', applyDeviceMode);
    window.removeEventListener('resize', applyDeviceMode);
    document.documentElement.classList.remove('is-device');
  };
}, []);

React.useEffect(() => {
  const LINE_H = 8; // px

  const updateLine = () => {
    document.querySelectorAll('.page').forEach((page) => {
      const inner = page.querySelector('.inner');
      if (!inner) return;
      const t1 = inner.querySelector('.text--one');
      const t2 = inner.querySelector('.text--two');
      let line = inner.querySelector('.line');

      // ensure the .line element exists
      if (!line) {
        line = document.createElement('div');
        line.className = 'line';
        inner.appendChild(line);
      }

      if (!t1 || !t2) {
        line.style.display = 'none';
        return;
      }
      line.style.display = 'block';

      const r1 = t1.getBoundingClientRect();
      const r2 = t2.getBoundingClientRect();
      const innerR = inner.getBoundingClientRect();

      // midpoint between bottom of t1 and top of t2, relative to inner top
      const mid = ((r1.bottom + r2.top) / 2) - innerR.top;
      const topPos = Math.max(0, mid - LINE_H / 2);

      Object.assign(line.style, {
        position: 'absolute',
        left: '0',
        right: '0',
        top: `${topPos}px`,
        height: `${LINE_H}px`,
        background: 'var(--bg-dark)',
        zIndex: '50',
        pointerEvents: 'none',
        transform: 'none',
      });
    });
  };

  updateLine();
  const t = setTimeout(updateLine, 60);
  window.addEventListener('resize', updateLine);
  window.addEventListener('load', updateLine);

  const ro = new ResizeObserver(updateLine);
  document.querySelectorAll('.inner').forEach((el) => ro.observe(el));

  return () => {
    clearTimeout(t);
    window.removeEventListener('resize', updateLine);
    window.removeEventListener('load', updateLine);
    ro.disconnect();
  };
}, []);
  
  return (
    <div className="App">
      {pages.map((_, i) => {
  // Special page 2 (index 1)
  if (i === 1) {
    return (
      <section key={i} className="page">
        {/* Page 2: dark background, inner same inset */}
        <div className="inner">
          {/* yellow horizontal line at 20% from top of inner */}
          <div className="line" aria-hidden />

          {/* wrapper positioned at the same top (line top); we translate the text up so its bottom aligns to the line */}
          <div className="car-wrap" aria-hidden>
            <span className="car-text">The Car</span>
            <span className="car-num">1</span>
          </div>
        </div>
      </section>
    );
  }
  else{
  // Default page rendering for all other pages (unchanged)
  return (
    <section key={i} className="page">
          {/* Inner box contains ALL content now */}
          <div className="inner">
            {/* Text windows placed inside the inner box */}
            <img src="/websitegrafikalogo.svg" alt="" className="img--one" aria-hidden />
            <div className="text text--one" aria-hidden>
              NP
              <br />
              Racing
            </div>

            <div className="text text--two">Czechia's only
              <br />
              STEM Racing
              <br />
              team
            </div>
          </div>

          {/* overlay / second image placed outside .inner */}
          <img src="/schody.svg" alt="" className="img--two" aria-hidden />

          {/* text--three lives on the outer .page so it can overlay above img--two */}
          <div className="text text--three" aria-hidden>
          </div>
        </section>
  );
  }
    </div>
  );
}
