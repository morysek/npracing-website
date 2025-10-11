// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * App.jsx
 *
 * Key changes:
 * - no gradient/proximity cursor
 * - loading overlay: centered numeric count-up (Microgramma bold)
 * - still preloads the loading_*.svg + images, but doesn't display them
 * - disables native scrolling until the intro transition finishes
 * - after transition, enables a custom smooth/inertial scroller (transform-based)
 * - forces scroll to top on load/reload
 *
 * Note: put font files in /public/fonts/
 * - /public/fonts/microgramma.woff2
 * - /public/fonts/spacegrotesk.woff2
 *
 * Assets assumed at:
 * - /np_website.svg (hero logo)
 * - /images/team1.jpg, /images/team2.jpg, /images/team3.jpg
 * - /loading_25.svg, /loading_50.svg, /loading_75.svg, /loading_100.svg, /loading_logo.svg
 */

export default function App() {
  // loading state
  const [progress, setProgress] = useState(0); // 0..100
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // transition / intro
  const [startTransition, setStartTransition] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [scrollerActive, setScrollerActive] = useState(false); // enables custom scroller

  // refs
  const loadingOverlayRef = useRef(null);
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const scrollProxyRef = useRef({ target: 0, current: 0, raf: 0, max: 0, isRunning: false, velocity: 0 });

  // ensure on reload/go to top
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (e) {}
  }, []);

  // inject fonts + hide native scrollbar globally
  useEffect(() => {
    const id = "__npr_fonts_and_styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.innerHTML = `
        @font-face {
          font-family: 'Microgramma';
          src: url('/fonts/microgramma.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'SpaceGrotesk';
          src: url('/fonts/spacegrotesk.woff2') format('woff2');
          font-weight: 400 700;
          font-style: normal;
          font-display: swap;
        }
        html,body,#root { height: 100%; background: #141414; margin: 0; }
        body { font-family: 'SpaceGrotesk', Inter, sans-serif; background: #141414; color: #fff; }
        /* hide native scrollbar */
        ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
        html,body { scrollbar-width: none; -ms-overflow-style: none; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Preload assets (images + loading svgs + logo) but DO NOT use loading_* svgs for UI now
  useEffect(() => {
    const assets = [
      "/images/team1.jpg",
      "/images/team2.jpg",
      "/images/team3.jpg",
      "/loading_25.svg",
      "/loading_50.svg",
      "/loading_75.svg",
      "/loading_100.svg",
      "/loading_logo.svg",
      "/np_website.svg",
    ];
    let loaded = 0;
    const total = assets.length;

    const mark = () => {
      loaded += 1;
      const pct = Math.min(100, Math.round((loaded / total) * 100));
      setProgress(pct);
      if (loaded >= total) {
        setTimeout(() => {
          setAssetsLoaded(true);
          setProgress(100);
        }, 120);
      }
    };

    assets.forEach((src) => {
      // for svg and img we can use Image
      const img = new Image();
      img.onload = mark;
      img.onerror = mark;
      img.src = src;
    });

    // fallback fake progress so the user sees motion even if network is fast
    let ticker = 0;
    const interv = setInterval(() => {
      setProgress((cur) => {
        if (cur >= 98) return cur;
        return Math.min(98, cur + Math.ceil(Math.random() * 3));
      });
      ticker++;
      if (ticker > 200) clearInterval(interv);
    }, 160);

    return () => clearInterval(interv);
  }, []);

  // when all assets loaded -> trigger transition timeline
  useEffect(() => {
    if (!assetsLoaded) return;
    // small delay then start the zoom/fade transition
    const preDelay = 420;
    const id = setTimeout(() => {
      setStartTransition(true);
      // allow the overlay to animate (zoom+fade) for 700ms, then show hero
      setTimeout(() => {
        setHeroVisible(true);
        // after hero visible, remove overlay from the DOM flow after a short delay
        setTimeout(() => {
          if (loadingOverlayRef.current) loadingOverlayRef.current.style.display = "none";
          // activate custom scroller after overlay removed
          setScrollerActive(true);
        }, 400);
      }, 700);
    }, preDelay);

    return () => clearTimeout(id);
  }, [assetsLoaded]);

  /**
   * CUSTOM SMOOTH SCROLLER
   * We disable native scrolling and simulate scroll by transforming the content container.
   * This is activated only after the intro transition completes (scrollerActive = true).
   *
   * Basic strategy:
   * - set document height (via a spacer) equal to contentRef scrollHeight, to preserve scrollbar-less page length
   * - intercept wheel/touch and update scrollProxyRef.target
   * - RAF loop lerps scrollProxyRef.current -> target, and transforms contentRef by translateY(-current)
   * - provides gentle easing/inertia
   */
  useEffect(() => {
    // nothing while scroller inactive
    if (!scrollerActive) {
      // ensure native body overflow hidden until scroller active
      document.body.style.overflow = "hidden";
      return;
    }

    // enable our scroller: still keep native overflow hidden
    document.body.style.overflow = "hidden";

    const contentEl = contentRef.current;
    if (!contentEl) return;

    // create a spacer element that determines page height (so user can still reach bottom)
    let spacer = document.getElementById("__scroll_spacer");
    if (!spacer) {
      spacer = document.createElement("div");
      spacer.id = "__scroll_spacer";
      document.body.appendChild(spacer);
    }

    const recalc = () => {
      const height = contentEl.scrollHeight;
      spacer.style.height = `${height}px`;
      scrollProxyRef.current.max = Math.max(0, height - window.innerHeight);
      // clamp target/current
      scrollProxyRef.current.target = Math.max(0, Math.min(scrollProxyRef.current.target, scrollProxyRef.current.max));
      scrollProxyRef.current.current = Math.max(0, Math.min(scrollProxyRef.current.current, scrollProxyRef.current.max));
    };

    recalc();
    window.addEventListener("resize", recalc);

    // wheel handling: increment target
    let wheelTimeout;
    const onWheel = (ev) => {
      ev.preventDefault();
      const delta = ev.deltaY;
      // apply step with scaling and clamp
      const step = delta * 1.6; // adjust sensitivity
      scrollProxyRef.current.target = Math.max(0, Math.min(scrollProxyRef.current.max, scrollProxyRef.current.target + step));
      // small debounce to allow velocity-based smoothing
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        // nothing; leaving for possible future damping
      }, 50);
    };

    // touch handling
    let touchStartY = null;
    const onTouchStart = (ev) => {
      touchStartY = ev.touches ? ev.touches[0].clientY : null;
    };
    const onTouchMove = (ev) => {
      if (touchStartY == null) return;
      const y = ev.touches ? ev.touches[0].clientY : null;
      if (y == null) return;
      const dy = touchStartY - y;
      touchStartY = y;
      scrollProxyRef.current.target = Math.max(0, Math.min(scrollProxyRef.current.max, scrollProxyRef.current.target + dy));
    };
    const onTouchEnd = () => {
      touchStartY = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });

    // RAF loop
    const ease = 0.12; // lower = slower smoothing; tune for "thevariable" feel
    const loop = () => {
      const s = scrollProxyRef.current;
      // simple lerp to target
      s.current += (s.target - s.current) * ease;
      // small velocity for inertial feel
      s.velocity = (s.target - s.current);

      // apply transform
      contentEl.style.transform = `translate3d(0,${-Math.round(s.current)}px,0)`;

      // request next
      s.raf = requestAnimationFrame(loop);
    };
    scrollProxyRef.current.isRunning = true;
    scrollProxyRef.current.raf = requestAnimationFrame(loop);

    // ensure we start at top
    scrollProxyRef.current.current = 0;
    scrollProxyRef.current.target = 0;
    contentEl.style.willChange = "transform";

    // cleanup
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (scrollProxyRef.current.raf) cancelAnimationFrame(scrollProxyRef.current.raf);
      scrollProxyRef.current.isRunning = false;
      // remove spacer
      if (spacer && spacer.parentNode) spacer.parentNode.removeChild(spacer);
    };
  }, [scrollerActive]);

  // small helper: overlay class toggles
  const overlayClass = startTransition ? "loadingOverlay transitioning" : "loadingOverlay";

  // styles inlined to keep component self-contained
  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflow: "hidden" }}>
      <style>{`
        .frontPage {
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #141414;
        }
        .heroLogo {
          display: inline-block;
          width: 320px;
          max-width: 56vmin;
          transform-origin: center center;
          transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease;
          opacity: 0;
        }
        .heroLogo.visible { opacity: 1; transform: scale(1); }
        .loadingOverlay {
          position: fixed;
          left: 0; top: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          background: #141414;
          pointer-events: all;
          transform-origin: 50% 50%;
        }
        .loadingOverlay.transitioning {
          transition: transform 700ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease;
          transform: scale(1.9);
          opacity: 0;
          pointer-events: none;
        }
        .loadingNumber {
          font-family: 'Microgramma', SpaceGrotesk, sans-serif;
          font-weight: 700;
          font-size: 74px;
          color: #ffcc00;
          letter-spacing: 0.02em;
        }
        .below {
          position: relative;
          min-height: 200vh; /* content height determined dynamically; spacer will be used for page length */
          background: #141414;
        }
      `}</style>

      {/* FRONT PAGE / HERO */}
      <div className="frontPage" aria-hidden={!heroVisible}>
        <div
          ref={heroRef}
          className={`heroLogo ${heroVisible ? "visible" : ""}`}
          style={{
            zIndex: 10,
            transitionDelay: heroVisible ? "80ms" : "0ms",
            pointerEvents: "none",
          }}
        >
          <img src="/np_website.svg" alt="NP Website Logo" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      </div>

      {/* LOADING OVERLAY */}
      {!startTransition && (
        <div ref={loadingOverlayRef} className="loadingOverlay" style={{ zIndex: 99999 }}>
          <div style={{ textAlign: "center" }}>
            {/* we intentionally DO NOT render the loading_*.svg images here; only show numeric progress */}
            <div className="loadingNumber" aria-hidden={assetsLoaded}>
              {String(progress)}
            </div>
          </div>
        </div>
      )}

      {/* transitioning overlay: zoom+fade (we still display nothing but keep overlay to animate out) */}
      {startTransition && !heroVisible && (
        <div ref={loadingOverlayRef} className="loadingOverlay transitioning" style={{ zIndex: 99999 }} />
      )}

      {/* MAIN CONTENT (rendered below the hero). We will transform this container for the smooth scroller */}
      <div
        ref={contentRef}
        style={{
          position: "relative",
          top: 0,
          left: 0,
          width: "100%",
          transform: "translate3d(0,0,0)",
          transition: "transform 0s",
          willChange: "transform",
        }}
      >
        <div style={{ padding: 48, maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Team</h1>
          <p style={{ color: "#fff" }}>The Team</p>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px" }}>
              <ul>
                <li>Team Leader: Matěj Prokop</li>
                <li>Engineer: Lukáš Moravec</li>
                <li>Finance manager: Lukáš Martin</li>
                <li>Marketing manager: Veronika Lindová</li>
              </ul>
            </div>
            <div style={{ flex: "1 1 320px", display: "grid", gap: 12 }}>
              <img src="/images/team1.jpg" alt="team1" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
              <img src="/images/team2.jpg" alt="team2" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
              <img src="/images/team3.jpg" alt="team3" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
            </div>
          </div>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>About Us</h2>
          <p>We are the only Czech team and a top contender in the prestigious international STEM racing competition.</p>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Schedule</h2>
          <p>Next up: Poland — Oct 11</p>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Join Us</h2>
          <p>Want to have the chance to compete for a scholarship? Contact us!</p>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Contact</h2>
          <p>
            For general inquiry: <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">prokopmatej@novyporg.cz</a>
          </p>

          <div style={{ height: 300 }} />
        </div>
      </div>
    </div>
  );
}
