// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Loading overlay that:
 * - preloads assets (including loading svgs) but doesn't display them
 * - shows a centered Microgramma number count-up
 * - disables scrolling until the end of a zoom+fade transition
 * - forces scroll to top on mount/reload
 * - hides the scrollbar
 * - reveals the hero / below-content after the transition
 */

export default function App() {
  const [progress, setProgress] = useState(0); // 0..100
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [startTransition, setStartTransition] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true); // overlay present until turned off
  const [heroVisible, setHeroVisible] = useState(false);

  const loadingOverlayRef = useRef(null);

  // Ensure page is at top on load/reload
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch (e) {}
  }, []);

  // Preload assets (images + svgs + any other files)
  useEffect(() => {
    const assetsToLoad = [
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

    let mounted = true;
    let loaded = 0;
    const total = assetsToLoad.length;

    assetsToLoad.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        if (!mounted) return;
        loaded += 1;
        setProgress(Math.round((loaded / total) * 100));
        if (loaded >= total) {
          setAssetsLoaded(true);
          setProgress(100);
        }
      };
      img.onerror = () => {
        if (!mounted) return;
        loaded += 1;
        setProgress(Math.round((loaded / total) * 100));
        if (loaded >= total) {
          setAssetsLoaded(true);
          setProgress(100);
        }
      };
      img.src = src;
    });

    // small visual fallback incrementer so users see progress even if network is instant
    const fallbackTicker = setInterval(() => {
      setProgress((cur) => {
        if (cur >= 100) return 100;
        return Math.min(99, cur + Math.ceil(Math.random() * 3));
      });
    }, 140);

    return () => {
      mounted = false;
      clearInterval(fallbackTicker);
    };
  }, []);

  // Disable scrolling until overlay is removed
  useEffect(() => {
    // hide scrollbar (CSS below also hides it, this ensures no overflow)
    document.body.style.overflow = overlayVisible ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [overlayVisible]);

  // When all assets loaded -> small delay -> start zoom+fade transition
  useEffect(() => {
    if (!assetsLoaded) return;
    const delayBeforeTransition = 320; // ms
    const t = setTimeout(() => {
      setStartTransition(true);

      // duration should match CSS transition time
      const transitionMs = 700; // same as CSS
      setTimeout(() => {
        // after transition ends, reveal hero and remove overlay
        setHeroVisible(true);

        // remove overlay after a short time so hero is visible
        setTimeout(() => {
          setOverlayVisible(false);
        }, 120); // let hero settle
      }, transitionMs);
    }, delayBeforeTransition);

    return () => clearTimeout(t);
  }, [assetsLoaded]);

  // Utility: pick which loading svg (we still loaded them, but per request we don't display them)
  function loadingSvgForProgress(p) {
    if (p >= 100) return "/loading_100.svg";
    if (p >= 75) return "/loading_75.svg";
    if (p >= 50) return "/loading_50.svg";
    if (p >= 25) return "/loading_25.svg";
    return "/loading_25.svg";
  }

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        /* fonts - ensure those files exist in /public/fonts */
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

        html, body, #root { height: 100%; background: #141414; margin: 0; }
        * { box-sizing: border-box; }
        /* hide scrollbars */
        ::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }

        /* front page full-viewport */
        .frontPage {
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: #141414;
          overflow: hidden;
        }

        /* hero logo center */
        .heroLogo {
          width: 320px;
          max-width: 56vmin;
          transform-origin: center center;
          transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease;
          opacity: 0;
        }
        .heroLogo img { width: 100%; height: auto; display: block; }

        /* loading overlay */
        .loadingOverlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          background: #141414;
          pointer-events: all;
          transform-origin: 50% 50%;
        }
        /* zoom+fade transition: overlay and children zoom in & fade out together */
        .loadingOverlay.zoomFade {
          transition: transform 700ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease;
          transform: scale(1.9);
          opacity: 0;
          pointer-events: none;
        }

        .loadingNumber {
          font-family: 'Microgramma', 'SpaceGrotesk', sans-serif;
          font-weight: 700;
          font-size: 72px;
          color: #ffcc00;
          line-height: 1;
          letter-spacing: 0.02em;
          position: relative;
          z-index: 3;
          user-select: none;
        }

        /* below content area (hidden until overlay removed via scroll / normal flow) */
        .below {
          background: #141414;
          color: #eee;
          padding: 48px 20px;
          min-height: 100vh;
          font-family: "SpaceGrotesk", Inter, sans-serif;
        }
      `}</style>

      {/* FRONT PAGE (hero area) */}
      <div className="frontPage" aria-hidden={!overlayVisible && !heroVisible}>
        {/* hero shown only after transition completes */}
        <div
          className="heroLogo"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "scale(1)" : "scale(0.92)",
            transitionDelay: heroVisible ? "80ms" : "0ms",
            zIndex: 10,
          }}
        >
          <img src="/np_website.svg" alt="NP Website Logo" />
        </div>
      </div>

      {/* LOADING OVERLAY: show number centered, zoom+fade when startTransition */}
      {overlayVisible && (
        <div
          ref={loadingOverlayRef}
          className={`loadingOverlay ${startTransition ? "zoomFade" : ""}`}
          aria-hidden={!overlayVisible}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 980 }}>
            <div style={{ position: "relative", width: "100%", textAlign: "center" }}>
              {/* We purposely DO NOT DISPLAY the loading_* svgs per your request, but they were preloaded above.
                  Only the big centered number is shown. */}
              <div className="loadingNumber" aria-live="polite" aria-atomic="true">
                {progress}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN / BELOW CONTENT */}
      <div className="below" style={{ paddingTop: 48 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Team</h1>
          <p>The Team</p>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
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
          <p>We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.</p>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Schedule</h2>
          <p>Next up: Poland — Oct 11</p>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Join Us</h2>
          <p>Want to have the chance to compete for a scholarship? Contact us!</p>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Contact</h2>
          <p>
            For general inquiry:{" "}
            <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">
              prokopmatej@novyporg.cz
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
