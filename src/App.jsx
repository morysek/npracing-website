
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
  React.useEffect(() => {
  const updateIntermediateSpace = () => {
    // remove any existing intermediate-space elements (cleanup)
    document.querySelectorAll('.intermediate-space').forEach(el => el.remove());
    // still compute paddingBottom per page so layout doesn't overlap when svg extends below inner
    document.querySelectorAll('.page').forEach((page) => {
      const inner = page.querySelector('.inner');
      const anchored = page.querySelector('.img--two, .placeholder--two, .svg--two');
      if (!inner || !anchored) { page.style.paddingBottom = ''; return; }
      const innerR = inner.getBoundingClientRect();
      const anchoredR = anchored.getBoundingClientRect();
      const gapPx = Math.max(0, anchoredR.bottom - innerR.bottom);
      page.style.paddingBottom = `${gapPx}px`;
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
  
React.useEffect(() => {
  const updateCarNumber = () => {
    document.querySelectorAll('.page:nth-of-type(2), .page:nth-of-type(3)').forEach((page) => {
      const innerSecond = page.querySelector('.inner-second');
      const carWrap = page.querySelector('.car-wrap');
      const carText = page.querySelector('.car-text');
      const carNum  = page.querySelector('.car-num');
      if (!innerSecond || !carWrap || !carText || !carNum) return;
      
      const pageRect = page.getBoundingClientRect();
      const inner2Rect = innerSecond.getBoundingClientRect();
      const textRect = carText.getBoundingClientRect();
      const numRect  = carNum.getBoundingClientRect();
      
      // 1) place car-wrap so its left aligns with inner-second left
      let leftForWrap;
if (page.matches(':nth-of-type(3)')) {
  // For page 3: align the car-text / car-num block to the RIGHT side of .inner
  // so that text.width + num.width sit flush to inner.right (num sits at the far right).
  // formula: leftForWrap = inner_right - page_left - (text_width + num_width)
  leftForWrap = Math.round(
    inner2Rect.right - pageRect.left - (textRect.width + numRect.width)
  );
} else {
  // default: align left as before (inner-second left)
  leftForWrap = Math.round(inner2Rect.left - pageRect.left);
}
      // 2) compute top so car-text bottom is 20px above inner-second top
      const desiredCarTextBottom = inner2Rect.top - 30; // 20px gap
      const topForWrap = desiredCarTextBottom - textRect.height - pageRect.top;
      
      // apply positioning to car-wrap (absolute relative to .page)
      Object.assign(carWrap.style, {
        position: 'absolute',
        left: `${Math.round(leftForWrap)}px`,
        top: `${Math.round(topForWrap)}px`,
      });
      
      // --- recompute after placing wrap so measurements reflect final positions ---
      const wrapRect = carWrap.getBoundingClientRect();
      const updatedTextRect = carText.getBoundingClientRect();
      const updatedNumRect  = carNum.getBoundingClientRect();
      
      // number: place so its bottom-left matches text top-right, then apply -15px vertical offset
      const leftInsideWrap = Math.round(updatedTextRect.right - wrapRect.left);
      const topInsideWrap  = Math.round(updatedTextRect.top - wrapRect.top - updatedNumRect.height + 40);
      
      Object.assign(carNum.style, {
        position: 'absolute',
        left: `${leftInsideWrap}px`,
        top: `${topInsideWrap}px`,
      });
      
      // --- ensure .car-line exists inside .inner and place it 8px below the final car-text bottom ---
      const inner = page.querySelector('.inner');
      if (inner) {
        let carLine = inner.querySelector('.car-line');
        if (!carLine) {
          carLine = document.createElement('div');
          carLine.className = 'car-line';
          inner.appendChild(carLine);
        }
        const innerRect = inner.getBoundingClientRect();
        const finalTextRect = carText.getBoundingClientRect();
        const topRel = Math.round((finalTextRect.bottom - innerRect.top) + 6);
        
        Object.assign(carLine.style, {
          position: 'absolute',
          left: '0',
          right: '0',
          height: '8px',
          top: `${topRel}px`,
          zIndex: '10002',
          pointerEvents: 'none',
        });
        
if (page.matches(':nth-of-type(3)')) {
  // compute inner-second top so its top aligns with the car-line
  // finalTextRect.bottom is viewport y; pageRect.top is viewport y of page top
  const topForInnerSecond = Math.round(finalTextRect.bottom - pageRect.top + 6); // +6 like your car-line gap
  // apply as px (inner-second is positioned absolute on .page)
  innerSecond.style.top = `${topForInnerSecond}px`;
}
      }
    });
  };
  
  updateCarNumber();
  const t = setTimeout(updateCarNumber, 60);
  window.addEventListener('resize', updateCarNumber);
  window.addEventListener('load', updateCarNumber);
  const ro = new ResizeObserver(updateCarNumber);
  
  document.querySelectorAll('.page:nth-of-type(2), .page:nth-of-type(3)').forEach((page) => {
    const wrapEl = page.querySelector('.car-wrap');
    const textEl = page.querySelector('.car-text');
    const inner2El = page.querySelector('.inner-second');
    if (wrapEl) ro.observe(wrapEl);
    if (textEl) ro.observe(textEl);
    if (inner2El) ro.observe(inner2El);
  });
  
  return () => {
    clearTimeout(t);
    window.removeEventListener('resize', updateCarNumber);
    window.removeEventListener('load', updateCarNumber);
    ro.disconnect();
  };
}, []);
  
React.useEffect(() => {
  const updatePruhAlign = () => {
    document.querySelectorAll('.page:nth-of-type(2), .page:nth-of-type(3)').forEach((page) => {
      const inner = page.querySelector('.inner') || page;
      const carText = page.querySelector('.car-text');
      if (!carText) return;
      
      // create or reuse image
      let img = page.querySelector('.pruh-img');
      if (!img) {
        img = document.createElement('img');
        img.className = 'pruh-img';
        img.src = '/pruhmuzweb.svg';
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        inner.appendChild(img);
      }
      
      const innerR = inner.getBoundingClientRect();
const textR  = carText.getBoundingClientRect();
const pageRect = page.getBoundingClientRect();

// compute numeric values
const topPx   = Math.round(textR.top - innerR.top);
const heightPx = Math.max(0, Math.round(textR.height));

if (page.matches(':nth-of-type(3)')) {
  // Page 3: left wall of image flush with inner left
  Object.assign(img.style, {
    position: 'absolute',
    left: '0', // align left wall to inner left
    top: `${topPx}px`,          // align top to car-text top (so top edges match)
    height: `${heightPx}px`,    // match car-text height so bottom aligns too
    width: 'auto',
    objectFit: 'contain',
    zIndex: '10005',
    pointerEvents: 'none',
    display: 'block',
  });
} else {
  // Default (page 2): keep right-anchored behavior
  Object.assign(img.style, {
    position: 'absolute',
    right: '0',
    top: `${topPx}px`,
    height: `${heightPx}px`,
    width: 'auto',
    objectFit: 'contain',
    zIndex: '10005',
    pointerEvents: 'none',
    display: 'block',
  });
}
    });
  };
  
  updatePruhAlign();
  const t = setTimeout(updatePruhAlign, 60);
  window.addEventListener('resize', updatePruhAlign);
  window.addEventListener('load', updatePruhAlign);
  const ro = new ResizeObserver(updatePruhAlign);
  
  document.querySelectorAll('.page:nth-of-type(2), .page:nth-of-type(3)').forEach((page) => {
    const watchEls = [
      page.querySelector('.inner'),
      page.querySelector('.car-text'),
      page.querySelector('.car-wrap'),
      page.querySelector('.inner-second'),
    ].filter(Boolean);
    watchEls.forEach(el => ro.observe(el));
  });
  
  return () => {
    clearTimeout(t);
    window.removeEventListener('resize', updatePruhAlign);
    window.removeEventListener('load', updatePruhAlign);
    ro.disconnect();
  };
}, []);
  
return (
  <div className="App">
    {pages.map((_, i) => {
      // Special pages 2 and 3 (index 1 and 2)
      if (i === 1 || i === 2) {
        // Define content for each page
        const pageContent = {
  1: {
    carText: "The Car",
    carNum: "1",
    pruhImg: "/pruhmuzweb.svg",
    rightCopy: `The STEM Racing Professional Class Car is a precision-engineered machine where science meets speed.
Every component is optimized through data-driven design—aerodynamic contours sculpted by computational fluid dynamics.
Built to demonstrate the fusion of engineering disciplines—mechanical, and computational—it's not just a car; it's a rolling laboratory.
Each lap is an experiment, a test of physics, teamwork, and innovation.
This is STEM in motion—where theory hits the track and innovation takes the checkered flag.`
  },
  2: {
    carText: "The Team",
    carNum: "2",
    pruhImg: "/theteamweb.svg",  // Changed from pruhmuzweb.svg
    rightCopy: `Your custom text for page 3 goes here.
You can write multiple lines and paragraphs.
Change this to whatever content you want for the third page.`
  }
};

        const content = pageContent[i];

        return (
          <section key={i} className="page">
            <div className="inner">
              <div className="line" aria-hidden />
              <div className="car-line" aria-hidden></div>
              <img src={content.pruhImg} alt="" className="pruh-img" aria-hidden />
            </div>
            <div className="car-wrap" aria-hidden>
              <span className="car-text">{content.carText}</span>
              <span className="car-num">{content.carNum}</span>
            </div>
            <div className="inner-second" aria-hidden>
              <div className="left-box" aria-hidden>
                {/* Add content here if needed */}
              </div>
              <div className="right-copy">
                {content.rightCopy}
              </div>
            </div>
          </section>
        );
      }
      // Default page rendering (unchanged)
      else {
        return (
          <section key={i} className="page">
            <div className="inner">
              <img src="/websitegrafikalogo.svg" alt="" className="img--one" aria-hidden />
              <div className="text text--one" aria-hidden>
                NP <br /> Racing
              </div>
              <div className="text text--two">Czechia's only <br /> STEM Racing <br /> team</div>
            </div>
            <img src="/schody.svg" alt="" className="img--two" aria-hidden />
            <div className="text text--three" aria-hidden></div>
          </section>
        );
      }
    })}
  </div>
);
}
