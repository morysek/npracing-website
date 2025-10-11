// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Front-page loader -> hero transition with proximity "neon blob" effects.
 *
 * Requirements implemented:
 * - small centered hero logo
 * - loading number overlay (Microgramma bold) centered over the front page
 * - show appropriate loading SVG based on progress thresholds
 * - when loaded: small delay, then loading overlay zooms in+fades out, hero "pops" in
 * - two proximity blobs that appear when mouse is near the logo (near / closer)
 * - faint neon glow on svgs
 * - fonts: Microgramma for loading number; SpaceGrotesk for main text
 * - front page occupies full viewport; rest of content lives below (not shown until you scroll)
 *
 * Drop this file into your React app and ensure the assets exist at the given paths.
 */

export default function App() {
  // progress (0..100)
  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // frontend states for transition
  const [startTransition, setStartTransition] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  // refs
  const loadingOverlayRef = useRef(null);
  const heroLogoRef = useRef(null);
  const proximityBlob1Ref = useRef(null);
  const proximityBlob2Ref = useRef(null);

  // control flow:
  // preload assets & increment progress as they load
  useEffect(() => {
    const assetsToLoad = [
      "/images/team1.jpg",
      "/images/team2.jpg",
      "/images/team3.jpg",
      "/loading_logo.svg", // optional: ensures the final logo file also accounted for
    ];
    let loaded = 0;
    const total = assetsToLoad.length;

    function markOne() {
      loaded += 1;
      const pct = Math.round((loaded / total) * 100);
      setProgress(pct);
      if (loaded >= total) {
        // make sure we show 100% briefly
        setTimeout(() => {
          setAssetsLoaded(true);
          setProgress(100);
        }, 120);
      }
    }

    assetsToLoad.forEach((src) => {
      const img = new Image();
      img.onload = () => markOne();
      img.onerror = () => markOne();
      img.src = src;
    });

    // safety: animate a slow count-up so user sees progress even if very fast
    let fake = 0;
    const ticker = setInterval(() => {
      // don't override actual progress beyond it
      setProgress((cur) => {
        if (cur >= 100) return 100;
        const next = Math.min(100, Math.max(cur, Math.round(cur + 2 + Math.random() * 6)));
        return next;
      });
      fake += 1;
      if (fake > 150) clearInterval(ticker);
    }, 160);

    return () => clearInterval(ticker);
  }, []);

  // When assetsLoaded becomes true -> wait small delay -> start transition
  useEffect(() => {
    if (!assetsLoaded) return;
    const delayMs = 420; // small delay before transition
    const id = setTimeout(() => {
      // animate the overlay zoom/fade then reveal hero
      setStartTransition(true);

      // when overlay animation ends reveal hero (give overlay 700ms to animate)
      setTimeout(() => {
        setHeroVisible(true);
        // after hero visible, hide overlay element entirely
        setTimeout(() => {
          // remove overlay from DOM visually
          if (loadingOverlayRef.current) {
            loadingOverlayRef.current.style.display = "none";
          }
        }, 700);
      }, 700);
    }, delayMs);

    return () => clearTimeout(id);
  }, [assetsLoaded]);

  // Mouse proximity handler for hero
  useEffect(() => {
    const root = document.documentElement;
    const onMove = (e) => {
      const el = heroLogoRef.current;
      if (!el || !proximityBlob1Ref.current || !proximityBlob2Ref.current) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      // position the blobs relative to the logo center so they "follow" the cursor
      const blob1 = proximityBlob1Ref.current;
      const blob2 = proximityBlob2Ref.current;

      // normalized vector
      const nx = dx / (rect.width || 1);
      const ny = dy / (rect.height || 1);

      // blob offsets: scale smaller offsets for blob2
      blob1.style.transform = `translate(${nx * 20}px, ${ny * 14}px)`;
      blob2.style.transform = `translate(${nx * -18}px, ${ny * -12}px)`;

      // show intensities based on distance threshold
      const nearThresh = Math.min(window.innerWidth, window.innerHeight) * 0.28; // near
      const closeThresh = Math.min(window.innerWidth, window.innerHeight) * 0.12; // close

      if (dist < closeThresh) {
        blob1.style.opacity = "1";
        blob1.style.transform += " scale(1.08)";
        blob2.style.opacity = "1";
        blob2.style.transform += " scale(0.95)";
      } else if (dist < nearThresh) {
        blob1.style.opacity = "0.9";
        blob2.style.opacity = "0.7";
      } else {
        blob1.style.opacity = "0";
        blob2.style.opacity = "0";
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // pick which loading SVG to show depending on progress
  function loadingSvgForProgress(p) {
    if (p >= 100) return "/loading_100.svg";
    if (p >= 75) return "/loading_75.svg";
    if (p >= 50) return "/loading_50.svg";
    if (p >= 25) return "/loading_25.svg";
    // below 25: show first as well
    return "/loading_25.svg";
  }

  // fonts and base styles injected inline for convenience
  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        /* fonts: adjust paths to your .woff2 location inside /public/fonts */
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

        body, html, #root { background: #141414; margin: 0; height: 100%; }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .frontPage {
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .heroLogo {
          display: inline-block;
          width: 320px;           /* smaller hero logo */
          max-width: 56vmin;
          transform-origin: center center;
          transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease;
          filter: drop-shadow(0 6px 20px rgba(255,80,40,0.08));
        }
        .heroLogo img { width: 100%; height: auto; display: block; }

        /* proximity blobs */
        .blob {
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          pointer-events: none;
          mix-blend-mode: screen;
          filter: blur(34px);
          transition: opacity 300ms ease, transform 300ms ease;
          opacity: 0;
        }
        .blob.one { background: radial-gradient(circle at 30% 30%, rgba(255,100,40,0.95) 0%, rgba(255,100,40,0.15) 28%, transparent 60%); }
        .blob.two { background: radial-gradient(circle at 70% 70%, rgba(255,140,90,0.85) 0%, rgba(255,140,90,0.08) 30%, transparent 60%); }

        /* neon glow for svg artwork */
        .svgWrapper img { filter: drop-shadow(0 0 18px rgba(255,140,90,0.06)) drop-shadow(0 6px 24px rgba(0,0,0,0.6)); }

        /* loading overlay */
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
        .loadingInner {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 28px;
          text-align: center;
        }
        .loadingSvg {
          max-width: min(48vw, 520px);
          width: 48vw;
          height: auto;
          display: block;
          margin: 0 auto;
        }
        .loadingNumber {
          font-family: 'Microgramma', SpaceGrotesk, sans-serif;
          font-weight: 700;
          font-size: 72px;
          color: #ffcc00; /* match titles color per earlier request */
          line-height: 1;
          letter-spacing: 0.02em;
          position: absolute;
          transform: translateY(-6px);
          pointer-events: none;
          text-shadow:
            0 2px 6px rgba(0,0,0,0.6),
            0 0 24px rgba(255,204,0,0.06);
        }

        /* overlay transition states */
        .loadingOverlay.transitioning {
          transition: transform 700ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease;
          transform: scale(1.9);  /* zoom in */
          opacity: 0;
          pointer-events: none;
        }

        /* hero entrance "pop" */
        .heroEnter {
          transform: scale(1.06);
          opacity: 1;
        }
        .heroHidden {
          opacity: 0;
          transform: scale(0.9);
        }

        /* below-front-page content */
        .below {
          background: #141414;
          color: #eee;
          padding: 48px 20px;
          min-height: 100vh;
        }
      `}</style>

      {/* FRONT PAGE (full-screen) */}
      <div className="frontPage" aria-hidden={!heroVisible}>
        {/* proximity blobs (centered over hero) */}
        <div
          ref={proximityBlob1Ref}
          className="blob one"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 5,
            opacity: 0,
          }}
        />
        <div
          ref={proximityBlob2Ref}
          className="blob two"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 6,
            opacity: 0,
          }}
        />

        {/* HERO LOGO (centered). Hidden until heroVisible true */}
        <div
          ref={heroLogoRef}
          className="heroLogo"
          style={{
            zIndex: 10,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "scale(1)" : "scale(0.92)",
            transitionDelay: heroVisible ? "80ms" : "0ms",
          }}
        >
          <img src="/np_website.svg" alt="NP Website Logo" style={{ filter: "drop-shadow(0 10px 36px rgba(255,100,40,0.06))" }} />
        </div>
      </div>

      {/* LOADING OVERLAY (covers whole viewport until removed) */}
      {!startTransition && (
        <div ref={loadingOverlayRef} className="loadingOverlay" style={{ zIndex: 99999 }}>
          <div className="loadingInner" style={{ position: "relative", width: "100%", maxWidth: 980 }}>
            {/* svg that switches based on progress */}
            <div className="svgWrapper" style={{ position: "relative" }}>
              <img
                className="loadingSvg"
                src={loadingSvgForProgress(progress)}
                alt="loading art"
                style={{
                  // ensure no fade transitions for loading svgs (user asked to disable fade for loading svgs)
                  transition: "none",
                  filter: "drop-shadow(0 20px 60px rgba(255,140,80,0.06))",
                }}
              />
            </div>

            {/* big number centered overlay - overlay style so it stays at center of page */}
            <div className="loadingNumber" aria-hidden={assetsLoaded}>
              {String(progress)}
            </div>
          </div>
        </div>
      )}

      {/* when startTransition is true we add the transition class so the overlay zooms/fades and the hero pops in */}
      {startTransition && !heroVisible && (
        <div
          ref={loadingOverlayRef}
          className="loadingOverlay transitioning"
          style={{
            zIndex: 99999,
            // still show the final svg as it zooms past viewer (no fade on svg itself required)
          }}
        >
          <div className="loadingInner" style={{ position: "relative", width: "100%", maxWidth: 980 }}>
            <img className="loadingSvg" src="/loading_100.svg" alt="final loading art" style={{ transition: "none" }} />
            {/* number hidden when assetsLoaded and transitioning */}
          </div>
        </div>
      )}

      {/* BELOW / MAIN CONTENT (locked below the front page; you scroll past the front page to reach it) */}
      <div className="below" style={{ paddingTop: 48 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", color: "#eee", fontFamily: "SpaceGrotesk, Inter, sans-serif" }}>
          <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginBottom: 6 }}>Team</h1>
          <p style={{ marginTop: 0 }} className="zig">The Team</p>
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
          <p className="zig">We are the only Czech team and a top contender in the prestigious international STEM racing competition.</p>
          <p className="zig">We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.</p>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Schedule</h2>
          <p className="zig">Next up: Poland — Oct 11</p>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Join Us</h2>
          <p className="zig">Want to have the chance to compete for a scholarship? Contact us!</p>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Contact</h2>
          <p className="zig">
            For general inquiry: <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">prokopmatej@novyporg.cz</a>
          </p>
        </div>
      </div>
    </div>
  );
}
