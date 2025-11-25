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
      const topInsideWrap  = Math.round(updatedTextRect.top - wrapRect.top - updatedNumRect.height + 55);
      
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
  React.useEffect(() => {
  const updatePanels = () => {
    const page = document.querySelector('.page:nth-of-type(3)');
    if (!page) return;
    const inner2 = page.querySelector('.inner-second');
    if (!inner2) return;

    // ensure exactly 4 .panel elements exist (create if missing)
    let panels = Array.from(inner2.querySelectorAll('.panel'));
    if (panels.length !== 4) {
      inner2.innerHTML = ''; // replace contents for a clean slate
      const labels = ['Engineer', 'Team leader', 'Communication', 'Networking'];
      for (let i = 0; i < 4; i++) {
        const p = document.createElement('div');
        p.className = 'panel';
        // text wrapper that won't affect layout (we'll absolutely position it)
        const t = document.createElement('div');
        t.className = 'panel-text';
        t.textContent = labels[i] || '';
        p.appendChild(t);
        inner2.appendChild(p);
      }
      panels = Array.from(inner2.querySelectorAll('.panel'));
    }

    // measure inner-second and set explicit pixel heights
    const innerRect = inner2.getBoundingClientRect();
    const innerH = Math.max(0, Math.round(innerRect.height));

    // floor division to get consistent pixels, then distribute remainder to last panel
    const base = Math.floor(innerH / 4);
    const remainder = innerH - base * 4;

    panels.forEach((p, idx) => {
      p.style.boxSizing = 'border-box';
      p.style.width = '100%';
      p.style.height = `${base + (idx === panels.length - 1 ? remainder : 0)}px`;
      p.style.margin = '0';
      p.style.padding = '0';
      p.style.overflow = 'hidden';
      p.style.position = 'relative'; // establishes a containing block for absolutely positioned children

      // ensure panel text is absolutely positioned so it doesn't affect panel height
      const t = p.querySelector('.panel-text');
      if (t) {
        Object.assign(t.style, {
          position: 'absolute',
          left: '0px',
          bottom: '1.5vh',
          margin: '0',
          padding: '0',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        });
      }
    });
  };

  updatePanels();
  const ro = new ResizeObserver(updatePanels);
  const watchEl = document.querySelector('.page:nth-of-type(3) .inner-second');
  if (watchEl) ro.observe(watchEl);
  window.addEventListener('resize', updatePanels);
  window.addEventListener('load', updatePanels);

  return () => {
    ro.disconnect();
    window.removeEventListener('resize', updatePanels);
    window.removeEventListener('load', updatePanels);
  };
}, []);

React.useEffect(() => {
  // NEW: store source rects so restore can animate back to the exact original position
  const savedSourceRects = {};

  const page = document.querySelector('.page:nth-of-type(3)');
  if (!page) return;
  const inner2 = page.querySelector('.inner-second');
  if (!inner2) return;

  const panels = Array.from(inner2.querySelectorAll('.panel'));
  
// overlay used while collapsed: create lazily and return it
let collapsedOverlay = inner2.querySelector('.collapsed-overlay') || null;

function ensureCollapsedOverlay() {
  // if already present in DOM and referenced, return it
  if (collapsedOverlay && collapsedOverlay.parentNode) return collapsedOverlay;

  // create (or recreate) the overlay and its content
  collapsedOverlay = document.createElement('div');
  collapsedOverlay.className = 'collapsed-overlay';
  const overlayText = document.createElement('div');
  overlayText.className = 'overlay-text';
  collapsedOverlay.appendChild(overlayText);

  // append to inner2 and return
  inner2.appendChild(collapsedOverlay);
  return collapsedOverlay;
}

const getOverlayTextEl = () => {
  if (collapsedOverlay && collapsedOverlay.querySelector) {
    const el = collapsedOverlay.querySelector('.overlay-text');
    if (el) return el;
  }
  // ensure overlay exists if the text element is requested
  return ensureCollapsedOverlay().querySelector('.overlay-text');
};
  
  if (!panels.length) return;

  inner2.style.pointerEvents = 'auto';
  panels.forEach(p => { p.style.pointerEvents = 'auto'; p.style.cursor = 'pointer'; });

  const originalTexts = panels.map((p) => {
    const t = p.querySelector('.panel-text');
    return t ? t.textContent : '';
  });

  let isCollapsed = false;
  let movingEl = null;
  let restoreTimeout = null;
  let lastCollapsedSourceIdx = null;

  const createCloneAt = (textEl, rect) => {
    const clone = document.createElement('div');
    clone.className = 'moving-panel-text';
    clone.textContent = textEl.textContent;
    clone.style.position = 'absolute';
    clone.style.left = `${rect.left + window.scrollX}px`;
    clone.style.top = `${rect.top + window.scrollY}px`;
    clone.style.fontFamily = window.getComputedStyle(textEl).fontFamily || 'inherit';
    clone.style.fontSize = window.getComputedStyle(textEl).fontSize || 'inherit';
    clone.style.lineHeight = window.getComputedStyle(textEl).lineHeight || 'normal';
    clone.style.color = window.getComputedStyle(textEl).color || 'inherit';
    clone.style.opacity = '1';
    clone.style.transform = 'none';
    clone.style.pointerEvents = 'none';
    document.body.appendChild(clone);
    return clone;
  };

  const animateClone = (clone, fromRect, toRect, opts = {}) => {
    const startLeft = fromRect.left + window.scrollX;
    const startTop = fromRect.top + window.scrollY;
    const endLeft = toRect.left + window.scrollX;
    const endTop = toRect.top + window.scrollY;
    const deltaX = endLeft - startLeft;
    const deltaY = endTop - startTop;
    clone.getBoundingClientRect();
    clone.style.transition = opts.transition || 'transform 600ms cubic-bezier(.2,.9,.2,1), opacity 420ms ease';
    clone.style.transform = `translate(${deltaX}px, ${deltaY}px)${opts.scale ? ` scale(${opts.scale})` : ''}`;
    if (typeof opts.opacityTo !== 'undefined') clone.style.opacity = String(opts.opacityTo);
  };

  const hidePanelLines = () => {
    // hide only .line inside panels 2..n
    panels.slice(1).forEach(p => p.querySelectorAll('.line').forEach(l => { l.style.display = 'none'; }));
  };

  const showPanelLines = () => {
    panels.slice(1).forEach(p => p.querySelectorAll('.line').forEach(l => { l.style.display = ''; }));
  };

  const collapseTo = (idx) => {
    if (isCollapsed) return;
    const targetPanel = panels[0];
    const targetText = targetPanel.querySelector('.panel-text');
    if (!targetText) return;

    isCollapsed = true;
    inner2.classList.add('animating');
    inner2.classList.remove('restoring');

    if (idx === 0) {
  // create/position overlay spanning panel 2 → panel 4, and set overlay text for panel 1
  const panelTopRect = panels[1].getBoundingClientRect();
  const panelBottomRect = panels[3].getBoundingClientRect();
  const innerRect = inner2.getBoundingClientRect();

  const ov = ensureCollapsedOverlay();
  const overlayTop = Math.round(panelTopRect.top - innerRect.top);
  const overlayHeight = Math.round(panelBottomRect.bottom - panelTopRect.top);

  ov.style.position = 'absolute';
  ov.style.top = `${overlayTop}px`;
  ov.style.height = `${overlayHeight}px`;
  ov.style.left = `0px`;
  ov.style.right = `0px`;

  // set overlay text for panel 1 (use 0..3 index mapping)
  const overlayTextEl = getOverlayTextEl();
  const panelMessages = {
    0: 'Engineer — short summary or CTA for Engineer',
    1: 'Team leader — short summary or CTA for Team leader',
    2: 'Communication — short summary or CTA for Communication',
    3: 'Networking — short summary or CTA for Networking',
  };
  overlayTextEl.textContent = panelMessages[0] || originalTexts[0] || '';

  // ensure overlay is appended (ensureCollapsedOverlay already appended it)
  // apply collapsed state and animate class
  inner2.classList.add('collapsed');
  inner2.classList.add('animating');

  clearTimeout(restoreTimeout);
  restoreTimeout = setTimeout(() => {
    inner2.classList.remove('animating');
  }, 420);

  lastCollapsedSourceIdx = 0;
  return;
}


const sourcePanel = panels[idx];
const sourceText = sourcePanel.querySelector('.panel-text');
if (!sourceText) return;

const srcRect = sourceText.getBoundingClientRect();
savedSourceRects[idx] = {
  left: srcRect.left + window.scrollX,
  top: srcRect.top + window.scrollY,
  width: srcRect.width,
  height: srcRect.height,
};
const tgtRect = targetText.getBoundingClientRect();

// --- IMMEDIATE: set targetText to clicked text but keep it hidden until animation ends
targetText.textContent = sourceText.textContent;
targetText.style.visibility = 'hidden';
targetText.style.opacity = '0';
targetText.style.whiteSpace = 'normal';

// create the clone for the moving animation
movingEl = createCloneAt(sourceText, srcRect);

// compute target rect AFTER we updated targetText content (but before revealing)
const finalTargetRect = targetText.getBoundingClientRect();

// animate clone from source -> target and fade it out
animateClone(movingEl, srcRect, finalTargetRect, {
  transition: 'transform 600ms cubic-bezier(.2,.9,.2,1), opacity 420ms ease',
  opacityTo: 0,
});

// finalize after animation completes
const onCloneTransitionEnd = (ev) => {
  // only respond to transform or opacity transitions
  if (ev.propertyName !== 'transform' && ev.propertyName !== 'opacity') return;

  if (movingEl) movingEl.removeEventListener('transitionend', onCloneTransitionEnd);

  // reveal the real target text with a short fade-in
  targetText.style.visibility = '';
  targetText.style.transition = 'opacity 220ms ease';
  // force reflow so the transition runs
  void targetText.offsetWidth;
  targetText.style.opacity = '1';

  // remove the clone shortly after reveal so the swap is smooth
  setTimeout(() => {
    if (movingEl && movingEl.parentNode) movingEl.parentNode.removeChild(movingEl);
    movingEl = null;
  }, 40);

  // restore UI state now that animation finished
  inner2.classList.remove('animating');
  inner2.classList.add('restoring');

  // re-show any panel lines hidden during animation
  showPanelLines();

  clearTimeout(restoreTimeout);
  restoreTimeout = setTimeout(() => {
    inner2.classList.remove('restoring');
  }, 300);
};

// attach listener
if (movingEl) movingEl.addEventListener('transitionend', onCloneTransitionEnd);


// compute overlay vertical span: top of panel 2 to bottom of panel 4 (relative to inner2)
const panelTopRect = panels[1].getBoundingClientRect();
const panelBottomRect = panels[3].getBoundingClientRect();
const innerRect = inner2.getBoundingClientRect();

// ensure overlay exists, then position/size it relative to inner2
const ov = ensureCollapsedOverlay();
const overlayTop = Math.round(panelTopRect.top - innerRect.top);
const overlayHeight = Math.round(panelBottomRect.bottom - panelTopRect.top);

ov.style.position = 'absolute';
ov.style.top = `${overlayTop}px`;
ov.style.height = `${overlayHeight}px`;
ov.style.left = `0px`;
ov.style.right = `0px`;

// set overlay text depending on clicked panel (customize messages)
const overlayTextEl = getOverlayTextEl();
const panelMessages = {
  0: 'Engineer — short summary or CTA for Engineer',
  1: 'Team leader — short summary or CTA for Team leader',
  2: 'Communication — short summary or CTA for Communication',
  3: 'Networking — short summary or CTA for Networking',
};
overlayTextEl.textContent = panelMessages[idx] || sourceText.textContent;

// ensure overlay is present and styled (will be shown via `.collapsed` class)
if (!collapsedOverlay.parentNode) inner2.appendChild(collapsedOverlay);

// apply collapsed state
inner2.classList.add('collapsed');
inner2.classList.add('animating');

// hide other panel texts and lines during animation
panels.slice(1).forEach(p => {
  const t = p.querySelector('.panel-text');
  if (t) { t.style.visibility = 'hidden'; t.style.opacity = '0'; }
});
hidePanelLines();

requestAnimationFrame(() => {
  animateClone(movingEl, srcRect, tgtRect, { opacityTo: 1, scale: 1 });
  const cleanup = () => {
    // reveal the targetText (already contains the clicked text)
    if (targetText) targetText.style.visibility = '';
    if (targetText) targetText.style.whiteSpace = '';
    if (movingEl && movingEl.parentNode) movingEl.parentNode.removeChild(movingEl);
    movingEl = null;
    inner2.classList.remove('animating');
    // overlay remains visible while inner2 has .collapsed; restoreAll will remove it
  };
  clearTimeout(restoreTimeout);
  restoreTimeout = setTimeout(cleanup, 700);
});

lastCollapsedSourceIdx = idx;

  };

  const restoreAll = () => {
    if (!isCollapsed) return;

    if (movingEl && movingEl.parentNode) {
      movingEl.parentNode.removeChild(movingEl);
      movingEl = null;
    }

    const srcIdx = lastCollapsedSourceIdx || 0;
    const targetPanel = panels[0];
    const targetText = targetPanel ? targetPanel.querySelector('.panel-text') : null;

    if (!targetText) {
      panels.forEach((p, i) => {
        const t = p.querySelector('.panel-text');
        if (t) t.textContent = originalTexts[i] || '';
      });
      inner2.classList.remove('collapsed');
      showPanelLines();
      isCollapsed = false;
      lastCollapsedSourceIdx = null;
      return;
    }

    // hide panel lines while animating back
    hidePanelLines();

    if (srcIdx !== 0) {
      const fromRect = targetText.getBoundingClientRect();
      const destPanel = panels[srcIdx];
      const destText = destPanel ? destPanel.querySelector('.panel-text') : null;

      const saved = savedSourceRects[srcIdx];
      let finalToRect;
      if (saved) {
        finalToRect = {
          left: saved.left - window.scrollX,
          top: saved.top - window.scrollY,
          width: saved.width,
          height: saved.height,
        };
      } else if (destText) {
        const destRect = destText.getBoundingClientRect();
        finalToRect = {
          left: destRect.left,
          top: destRect.top,
          width: destRect.width,
          height: destRect.height,
        };
      } else {
        finalToRect = {
          left: fromRect.left,
          top: fromRect.top,
          width: fromRect.width,
          height: fromRect.height,
        };
      }

      targetText.style.visibility = 'hidden';
      movingEl = createCloneAt(targetText, fromRect);

      requestAnimationFrame(() => {
        animateClone(movingEl, fromRect, finalToRect, { opacityTo: 1, scale: 1 });

        inner2.classList.remove('collapsed');
        inner2.classList.add('restoring');

        clearTimeout(restoreTimeout);
        restoreTimeout = setTimeout(() => {
          panels.forEach((p, i) => {
            const t = p.querySelector('.panel-text');
            if (t) {
              t.textContent = originalTexts[i] || '';
              t.style.visibility = '';
              t.style.opacity = '';
              t.style.whiteSpace = '';
            }
          });
          if (movingEl && movingEl.parentNode) movingEl.parentNode.removeChild(movingEl);
          movingEl = null;
          inner2.classList.remove('restoring', 'animating');
          showPanelLines();
          isCollapsed = false;
          lastCollapsedSourceIdx = null;
          if (collapsedOverlay && collapsedOverlay.parentNode) {
  collapsedOverlay.remove();
  collapsedOverlay = null;
}
        }, 700);
      });

      return;
    }

    // collapsed from panel-1 itself: fade panels back in, keep panel lines hidden until finalize
    panels.slice(1).forEach(p => {
      const t = p.querySelector('.panel-text');
      if (t) { t.style.visibility = 'hidden'; t.style.opacity = '0'; }
    });
    hidePanelLines();

    inner2.classList.add('restoring');
    inner2.classList.remove('animating');
    panels.forEach((p, i) => {
      const t = p.querySelector('.panel-text');
      if (t) {
        t.textContent = originalTexts[i] || '';
        t.style.visibility = '';
        t.style.opacity = '';
        t.style.whiteSpace = '';
      }
    });
    inner2.classList.remove('collapsed');
    clearTimeout(restoreTimeout);
    restoreTimeout = setTimeout(() => {
      inner2.classList.remove('restoring');
      showPanelLines();
      isCollapsed = false;
      lastCollapsedSourceIdx = null;
      if (collapsedOverlay && collapsedOverlay.parentNode) {
  collapsedOverlay.remove();
  collapsedOverlay = null;
}
    }, 480);
  };

  const handlers = panels.map((p, i) => {
    const fn = (ev) => {
      ev.stopPropagation();
      if (i === 0) {
        if (isCollapsed) {
          restoreAll();
        } else {
          collapseTo(0);
        }
        return;
      }
      if (!isCollapsed) collapseTo(i);
    };
    p.addEventListener('click', fn);
    return { el: p, fn };
  });

  return () => {
    handlers.forEach(h => h.el.removeEventListener('click', h.fn));
    inner2.classList.remove('collapsed', 'animating', 'restoring');
    inner2.style.pointerEvents = '';
    panels.forEach((p, i) => {
      const t = p.querySelector('.panel-text');
      if (t) t.textContent = originalTexts[i] || '';
      p.style.pointerEvents = '';
      p.style.cursor = '';
    });
    if (movingEl && movingEl.parentNode) movingEl.parentNode.removeChild(movingEl);
    clearTimeout(restoreTimeout);
  };
}, []);
  
return (
  <div className="App">
    {pages.map((_, i) => {
      // Special pages 2 and 3 (index 1 and 2)
      if (i === 1 || i === 2) {
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
            pruhImg: "/theteamweb.svg",
            rightCopy: `Your custom text for page 3 goes here.
You can write multiple lines and paragraphs.
Change this to whatever content you want for the third page.`
          }
        };

        const content = pageContent[i];
        
        React.useEffect(() => {
  const page3 = document.querySelector('.page:nth-of-type(3)');
  if (!page3) return;

  const inner2 = page3.querySelector('.inner-second');
  if (!inner2) return;

  // Helper: when restore/collapse animation is active we consider "in progress"
  const isAnimating = (el) =>
    el.classList.contains('animating') || el.classList.contains('restoring') || el.classList.contains('collapsed');

  // Initial state
  page3.setAttribute('data-restore-in-progress', isAnimating(inner2) ? 'true' : 'false');

  // Observe class changes on inner2
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        page3.setAttribute('data-restore-in-progress', isAnimating(inner2) ? 'true' : 'false');
        break;
      }
    }
  });
  mo.observe(inner2, { attributes: true, attributeFilter: ['class'] });

  // Also update on window load/resize as a fallback
  const refresh = () => page3.setAttribute('data-restore-in-progress', isAnimating(inner2) ? 'true' : 'false');
  window.addEventListener('load', refresh);
  window.addEventListener('resize', refresh);

  return () => {
    mo.disconnect();
    window.removeEventListener('load', refresh);
    window.removeEventListener('resize', refresh);
    page3.removeAttribute('data-restore-in-progress');
  };
}, []);

        return (
          <section key={i} className="page">
            {/* inner (keeps border and contains the horizontal line + pruh image) */}
            <div className="inner">
              <div className="line" aria-hidden />
              <div className="car-line" aria-hidden />
              <img src={content.pruhImg} alt="" className="pruh-img" aria-hidden />
            </div>

            {/* car-wrap positioned by JS (shared for both pages) */}
            <div className="car-wrap" aria-hidden>
              <span className="car-text">{content.carText}</span>
              <span className="car-num">{content.carNum}</span>
            </div>

            {/* inner-second differs per page:
                - page 2 (i===1): left-box + right-copy
                - page 3 (i===2): four equal vertical panels (full-width each) */}
            {i === 1 ? (
              <div className="inner-second" aria-hidden>
                <div className="left-box" aria-hidden>
                  {/* left-box content for page 2 (kept empty intentionally) */}
                </div>
                <div className="right-copy" aria-hidden>
                  {content.rightCopy}
                </div>
              </div>
            ) : (
              <div className="inner-second" aria-hidden>
                  <div className="panel panel--1">
                    <div className="panel-text">Engineer</div>
                  </div>
                  <div className="panel panel--2">
                    <div className="panel-text">Team leader</div>
                  </div>
                  <div className="panel panel--3">
                    <div className="panel-text">Communication</div>
                  </div>
                  <div className="panel panel--4">
                    <div className="panel-text">Networking</div>
                  </div>
              </div>
            )}
          </section>
        );
      }

      // Default page rendering (unchanged)
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
    })}
  </div>
);
}
