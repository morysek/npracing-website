// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const [progress, setProgress] = useState(0); // 0..100
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [startTransition, setStartTransition] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showLeftLogo, setShowLeftLogo] = useState(false);

  const loadingOverlayRef = useRef(null);

  // ensure top on load/reload
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch (e) {}
  }, []);

  // preload assets (images + svgs)
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

    // fallback ticker so progress increases visually if loads are instant
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

  // disable scrolling until overlay removed
  useEffect(() => {
    document.body.style.overflow = overlayVisible ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [overlayVisible]);

  // shorter delay then start transition; larger zoom
  useEffect(() => {
    if (!assetsLoaded) return;
    const delayBeforeTransition = 120; // shorter delay now
    const t = setTimeout(() => {
      setStartTransition(true);

      const transitionMs = 700;
      setTimeout(() => {
        setHeroVisible(true);
        setTimeout(() => {
          setOverlayVisible(false);
        }, 140);
      }, transitionMs);
    }, delayBeforeTransition);

    return () => clearTimeout(t);
  }, [assetsLoaded]);

  // show small left logo after user scrolls past the hero
  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight - 10; // once user scrolls past 1vh shy of hero bottom
      if (window.scrollY > threshold && heroVisible && !overlayVisible) setShowLeftLogo(true);
      else setShowLeftLogo(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // call once
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [heroVisible, overlayVisible]);

  function scrollToContent() {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
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

        /* hero logo responsive larger */
        .heroLogo {
          width: min(720px, 72vmin);
          max-width: 90vw;
          transform-origin: center center;
          transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease;
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 10px 26px rgba(255, 80, 0, 0.06));
        }
        .heroLogo img { width: 100%; height: auto; display: block; }

        /* small left logo */
        .leftLogo {
          position: fixed;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 9998;
          width: 96px;
          height: auto;
          opacity: 0;
          transition: opacity 360ms ease, transform 360ms cubic-bezier(.2,.9,.25,1);
          filter: drop-shadow(0 6px 18px rgba(255, 80, 0, 0.06));
        }
        .leftLogo.show { opacity: 1; transform: translateY(-50%) translateX(0); }

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
        /* zoom+fade: increased zoom scale */
        .loadingOverlay.zoomFade {
          transition: transform 700ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease;
          transform: scale(2.6); /* larger zoom */
          opacity: 0;
          pointer-events: none;
        }

        .loadingNumber {
          font-family: 'Microgramma', 'SpaceGrotesk', sans-serif;
          font-weight: 700;
          font-size: 76px;
          color: #ffcc00;
          line-height: 1;
          letter-spacing: 0.02em;
          position: relative;
          z-index: 3;
          user-select: none;
        }

        /* animated arrow */
        .scrollArrow {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 28px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 30;
          opacity: 0;
          transition: opacity 420ms ease, transform 420ms cubic-bezier(.2,.9,.25,1);
        }
        .scrollArrow.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .scrollArrow .chev {
          width: 12px;
          height: 12px;
          border-right: 2px solid rgba(255,255,255,0.9);
          border-bottom: 2px solid rgba(255,255,255,0.9);
          transform: rotate(45deg);
          animation: arrowBounce 1400ms infinite;
          opacity: 0.95;
        }
        @keyframes arrowBounce {
          0% { transform: rotate(45deg) translateY(0); opacity: .95; }
          50% { transform: rotate(45deg) translateY(8px); opacity: .6; }
          100% { transform: rotate(45deg) translateY(0); opacity: .95; }
        }

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
            cursor: "default",
          }}
        >
          <img src="/np_website.svg" alt="NP Website Logo" />
        </div>

        {/* animated scroll arrow */}
        <div className={`scrollArrow ${heroVisible && !overlayVisible ? "show" : ""}`} onClick={scrollToContent} role="button" aria-label="Scroll down">
          <div className="chev" />
        </div>
      </div>

      {/* small left logo: appears fixed middle-left once user scrolls past hero */}
      <div style={{ pointerEvents: "none" }}>
        <img src="/loading_logo.svg" alt="small logo" className={`leftLogo ${showLeftLogo ? "show" : ""}`} />
      </div>

      {/* LOADING OVERLAY: only number shown; we preloaded svgs but don't display them */}
      {overlayVisible && (
        <div ref={loadingOverlayRef} className={`loadingOverlay ${startTransition ? "zoomFade" : ""}`} aria-hidden={!overlayVisible}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 980 }}>
            <div style={{ position: "relative", width: "100%", textAlign: "center" }}>
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
