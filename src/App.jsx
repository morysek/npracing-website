// File: src/App.jsx
import React from 'react';
import './App.css';

export default function App() {
  const pages = Array.from({ length: 5 });

  const isMobileDevice = () =>
    /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent || '');

  /* -------------------------
     Helper utilities
     ------------------------- */
  const createIfMissing = (container, selector, tag = 'div', className) => {
    let el = container.querySelector(selector);
    if (!el) {
      el = document.createElement(tag);
      if (className) el.className = className;
      container.appendChild(el);
    }
    return el;
  };

  /* -------------------------
     Keep text--three anchored (original behavior)
     ------------------------- */
  React.useEffect(() => {
    const update = () => {
      const onDevice = isMobileDevice();
      document.querySelectorAll('.page').forEach((page) => {
        const text3 = page.querySelector('.text--three');
        if (!text3) return;

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
          return;
        }

        const img2 = page.querySelector('.placeholder--two, .img--two, .svg--two');
        if (!img2) return;

        const pageR = page.getBoundingClientRect();
        const img2R = img2.getBoundingClientRect();
        const textR = text3.getBoundingClientRect();

        const leftRel = Math.max(0, img2R.left - pageR.left);
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
    const tick = setTimeout(update, 60);
    window.addEventListener('resize', update);
    window.addEventListener('load', update);

    const ro = new ResizeObserver(update);
    document.querySelectorAll('.page').forEach((el) => ro.observe(el));

    return () => {
      clearTimeout(tick);
      window.removeEventListener('resize', update);
      window.removeEventListener('load', update);
      ro.disconnect();
    };
  }, []);

  /* -------------------------
     Keep image one sizing (unchanged)
     ------------------------- */
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

        const tRect = text1.getBoundingClientRect();
        const targetHeightPx = tRect.height * 1.2;

        const setSizeForImgElement = (el, heightPx) => {
          if (!el) return;
          if (el.tagName && el.tagName.toLowerCase() === 'img') {
            el.style.height = `${heightPx}px`;
            el.style.width = 'auto';
            el.style.objectFit = 'contain';
            return;
          }
          if (el instanceof SVGElement) {
            let ar = 1;
            const vb = el.getAttribute('viewBox');
            if (vb) {
              const parts = vb.trim().split(/\s+/).map(Number);
              if (parts.length === 4 && parts.every((n) => !Number.isNaN(n) && isFinite(n))) {
                const [, , vbW, vbH] = parts;
                if (vbH > 0) ar = vbW / vbH;
              }
            }
            el.style.height = `${heightPx}px`;
            el.style.width = `${heightPx * ar}px`;
            return;
          }
          el.style.height = `${heightPx}px`;
          el.style.width = 'auto';
        };

        img1.style.position = 'absolute';
        img1.style.top = '0';
        img1.style.left = '0';
        setSizeForImgElement(img1, targetHeightPx);
      });
    };

    updateImageOneSizes();
    window.addEventListener('resize', updateImageOneSizes);
    const ro = new ResizeObserver(updateImageOneSizes);
    document.querySelectorAll('.inner').forEach((el) => ro.observe(el));
    return () => {
      window.removeEventListener('resize', updateImageOneSizes);
      ro.disconnect();
    };
  }, []);

  /* -------------------------
     Device repositioning for text--two (unchanged)
     ------------------------- */
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

        if (t2TopRel + t2Height > t3TopRel - GAP_PX) {
          const desiredTop = Math.max(0, t3TopRel - GAP_PX - t2Height);
          text2.style.position = 'absolute';
          text2.style.top = `${desiredTop}px`;
          text2.style.bottom = 'auto';
        } else if (isMobileDevice()) {
          // keep flowing on device
          text2.style.position = 'static';
          text2.style.top = '';
        }
      });
    };

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

  /* -------------------------
     Toggle device class and set basic text--two behavior
     ------------------------- */
  React.useEffect(() => {
    const detectDevice = () =>
      /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent || '');

    const applyDeviceMode = () => {
      const onDevice = detectDevice();
      document.documentElement.classList.toggle('is-device', onDevice);

      document.querySelectorAll('.page').forEach((page) => {
        const inner = page.querySelector('.inner');
        const text2 = inner && inner.querySelector('.text--two');
        if (!text2) return;

        if (onDevice) {
          text2.style.position = 'static';
          text2.style.margin = '0 2% 4% 2%';
          text2.style.left = '';
          text2.style.bottom = '';
          text2.style.top = '';
        } else {
          text2.style.position = 'absolute';
          text2.style.left = '0';
          text2.style.bottom = '0';
          text2.style.top = '';
          text2.style.margin = '';
        }
      });
    };

    applyDeviceMode();
    window.addEventListener('orientationchange', applyDeviceMode);
    window.addEventListener('resize', applyDeviceMode);
    return () => {
      window.removeEventListener('orientationchange', applyDeviceMode);
      window.removeEventListener('resize', applyDeviceMode);
      document.documentElement.classList.remove('is-device');
    };
  }, []);

  /* -------------------------
     Line between text 1 & 2 (keeps midpoint)
     ------------------------- */
  React.useEffect(() => {
    const LINE_H = 8;
    const updateLine = () => {
      document.querySelectorAll('.page').forEach((page) => {
        const inner = page.querySelector('.inner');
        if (!inner) return;
        const t1 = inner.querySelector('.text--one');
        const t2 = inner.querySelector('.text--two');
        const line = createIfMissing(inner, '.line', 'div', 'line');
        if (!t1 || !t2) {
          line.style.display = 'none';
          return;
        }
        line.style.display = 'block';

        const r1 = t1.getBoundingClientRect();
        const r2 = t2.getBoundingClientRect();
        const innerR = inner.getBoundingClientRect();
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

  /* -------------------------
     Position car title + number + car-line (works per-page and supports mirrored pages)
     ------------------------- */
  React.useEffect(() => {
    const updateCarNumber = () => {
      document.querySelectorAll('.page').forEach((page) => {
        const carWrap = page.querySelector('.car-wrap');
        const carText = page.querySelector('.car-text');
        const carNum = page.querySelector('.car-num');
        const innerSecond = page.querySelector('.inner-second');
        if (!carWrap || !carText || !carNum || !innerSecond) return;

        const pageRect = page.getBoundingClientRect();
        const inner2Rect = innerSecond.getBoundingClientRect();
        const textRect = carText.getBoundingClientRect();
        const numRect = carNum.getBoundingClientRect();

        const isMirror = page.classList.contains('mirror');

        // position car-wrap: align to inner-second left (non-mirror) or right (mirror)
        if (!isMirror) {
          const leftForWrap = Math.round(inner2Rect.left - pageRect.left);
          Object.assign(carWrap.style, {
            position: 'absolute',
            left: `${leftForWrap}px`,
            right: '',
          });
        } else {
          // compute right offset relative to page: distance from page's right edge to inner2's right edge
          const rightOffset = Math.round(pageRect.right - inner2Rect.right);
          Object.assign(carWrap.style, {
            position: 'absolute',
            right: `${rightOffset}px`,
            left: '',
          });
        }

        // recompute rectangles after placing wrap
        const wrapRect = carWrap.getBoundingClientRect();
        const updatedTextRect = carText.getBoundingClientRect();
        const updatedNumRect = carNum.getBoundingClientRect();

        // compute number so its BOTTOM-LEFT == text TOP-RIGHT, then apply an extra -15px vertical offset
        // bottom-left of number -> x = text.right, y = text.top
        // top (in wrap coords) = text.top - wrap.top - num.height
        const leftInsideWrap = Math.round(updatedTextRect.right - wrapRect.left);
        const topInsideWrap = Math.round(updatedTextRect.top - wrapRect.top - updatedNumRect.height - 15); // extra -15px

        Object.assign(carNum.style, {
          position: 'absolute',
          left: `${leftInsideWrap}px`,
          top: `${topInsideWrap}px`,
        });

        // create/position car-line inside the page's first inner (spanning that inner)
        const inner = page.querySelector('.inner');
        if (inner) {
          const carLine = createIfMissing(inner, '.car-line', 'div', 'car-line');
          const innerRect = inner.getBoundingClientRect();
          const finalTextRect = carText.getBoundingClientRect();
          const topRel = Math.round((finalTextRect.bottom - innerRect.top) + 8); // 8px below text bottom
          Object.assign(carLine.style, {
            position: 'absolute',
            left: '0',
            right: '0',
            height: '8px',
            background: 'var(--bg-yellow)',
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
    document.querySelectorAll('.page').forEach((p) => {
      const el = p.querySelector('.car-wrap') || p.querySelector('.car-text') || p.querySelector('.inner-second');
      if (el) ro.observe(el);
    });

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updateCarNumber);
      window.removeEventListener('load', updateCarNumber);
      ro.disconnect();
    };
  }, []);

  /* -------------------------
     Position and size pruhmuzweb.svg to match car-text top & bottom (per-page, supports mirror)
     ------------------------- */
  React.useEffect(() => {
    const updatePruhAlign = () => {
      document.querySelectorAll('.page').forEach((page) => {
        const inner = page.querySelector('.inner') || page;
        const carText = page.querySelector('.car-text');
        if (!carText || !inner) return;

        // ensure <img class="pruh-img"> exists inside inner
        let img = inner.querySelector('.pruh-img');
        if (!img) {
          img = document.createElement('img');
          img.className = 'pruh-img';
          img.src = '/pruhmuzweb.svg';
          img.alt = '';
          img.setAttribute('aria-hidden', 'true');
          inner.appendChild(img);
        }

        const innerR = inner.getBoundingClientRect();
        const textR = carText.getBoundingClientRect();

        const isMirror = page.classList.contains('mirror');

        // top relative to inner
        const topPx = Math.round(textR.top - innerR.top);
        const heightPx = Math.max(0, Math.round(textR.height));

        if (!isMirror) {
          Object.assign(img.style, {
            position: 'absolute',
            right: 'var(--border)',
            left: '',
            top: `${topPx}px`,
            height: `${heightPx}px`,
            width: 'auto',
            objectFit: 'contain',
            zIndex: '10005',
            pointerEvents: 'none',
            display: 'block',
          });
        } else {
          Object.assign(img.style, {
            position: 'absolute',
            left: 'var(--border)',
            right: '',
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
    document.querySelectorAll('.page').forEach((p) => {
      const el = p.querySelector('.inner') || p.querySelector('.car-text');
      if (el) ro.observe(el);
    });

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updatePruhAlign);
      window.removeEventListener('load', updatePruhAlign);
      ro.disconnect();
    };
  }, []);

  /* -------------------------
     Render all pages: page 2..5 are special clones (2 = index 1)
     ------------------------- */
  const specialPages = {
    1: { title: 'The Car', num: '1', mirror: false, dark: true }, // page 2
    2: { title: 'The Team', num: '2', mirror: true, dark: false }, // page 3
    3: { title: 'Partners', num: '3', mirror: true, dark: false }, // page 4
    4: { title: 'Contact', num: '4', mirror: true, dark: false }, // page 5
  };

  return (
    <div className="App">
      {pages.map((_, i) => {
        // special pages 2..5
        if (i >= 1 && i <= 4) {
          const v = specialPages[i];
          const pageClass = `page ${v.dark ? 'page--dark' : 'page--inverted'} ${
            v.mirror ? 'mirror' : ''
          }`;

          return (
            <section key={i} className={pageClass}>
              <div className="inner">
                <div className="line" aria-hidden />
                {/* car-line will be ensured by JS */}
                <img src="/pruhmuzweb.svg" alt="" className="pruh-img" aria-hidden />
              </div>

              <div className="car-wrap" aria-hidden>
                <span className="car-text">{v.title}</span>
                <span className="car-num">{v.num}</span>
              </div>

              <div className="inner-second" aria-hidden>
                {/* left-box + right-copy only present on page 2 (i === 1) */}
                {i === 1 && (
                  <>
                    <div className="left-box" aria-hidden />
                    <div className="right-copy">
                      The STEM Racing Professional Class Car is a precision-engineered machine where
                      science meets speed. Every component is optimized through data-driven design —
                      aerodynamic contours sculpted by computational fluid dynamics. Built to
                      demonstrate the fusion of engineering disciplines — mechanical, and
                      computational — it’s not just a car; it’s a rolling laboratory. Each lap is an
                      experiment, a test of physics, teamwork, and innovation. This is STEM in
                      motion — where theory hits the track and innovation takes the checkered flag.
                    </div>
                  </>
                )}
              </div>
            </section>
          );
        }

        // default pages (unchanged)
        return (
          <section key={i} className="page">
            <div className="inner">
              <div className="text text--one" aria-hidden>
                NP
                <br />
                Racing
              </div>

              <div className="text text--two">
                Czechia's only
                <br />
                STEM Racing
                <br />
                team
              </div>

              <svg
                className="placeholder placeholder--one"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                <rect x="0" y="0" width="100" height="100" />
              </svg>

              <svg
                className="placeholder placeholder--two"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                <rect x="0" y="0" width="100" height="100" />
              </svg>

              <div className="line" aria-hidden />
            </div>

            <div className="text text--three">Scroll</div>
          </section>
        );
      })}
    </div>
  );
}
