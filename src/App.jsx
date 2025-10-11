// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/* ---------- helpers ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---------- small content components (rendered after hero) ---------- */
function TeamContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Team</h1>
      <p className="zig">The Team</p>
      <ul>
        <li>Team Leader: Matěj Prokop</li>
        <li>Engineer: Lukáš Moravec</li>
        <li>Finance manager: Lukáš Martin</li>
        <li>Marketing manager: Veronika Lindová</li>
      </ul>
    </div>
  );
}
function ScheduleContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Schedule</h1>
      <p className="zig">Next up: Poland</p>
    </div>
  );
}
function JoinUsContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Join Us</h1>
      <p className="zig">Want to have the chance to compete for a scholarship in a prestigious competition? Contact us!</p>
    </div>
  );
}
function ContactContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Contact</h1>
      <p className="zig">
        For general inquiry:{" "}
        <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">
          prokopmatej@novyporg.cz
        </a>
      </p>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  // inject fonts + base CSS
  useEffect(() => {
    const id = "__npr_fonts_spacegrotesk";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.innerHTML = `
        @font-face {
          font-family: 'SpaceGrotesk';
          src: url('/fonts/spacegrotesk.woff2') format('woff2');
          font-weight: 400 700;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Microgramma';
          src: url('/fonts/microgramma.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        html, body, #root { height: 100%; background: #141414; }
        body { margin: 0; background: #141414; font-family: 'SpaceGrotesk', Inter, sans-serif; color: #fff; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
        .zig { text-align: left; margin: 8px 0; font-family: 'SpaceGrotesk', Inter, sans-serif; line-height:1.35 }
        @media (min-width: 900px) {
          .zig:nth-of-type(odd) { transform: translateX(-6%); }
          .zig:nth-of-type(even) { transform: translateX(6%); }
        }
        /* neon glow for svgs */
        .neon-svg {
          filter:
            drop-shadow(0 2px 6px rgba(255,204,0,0.06))
            drop-shadow(0 6px 18px rgba(255,204,0,0.06));
          /* subtle outer glow */
        }
        .hero-logo {
          transition: transform 360ms cubic-bezier(.2,.9,.2,1), opacity 360ms ease;
          will-change: transform, opacity;
          display: block;
          max-width: 100%;
          height: auto;
        }
        .hero-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100vh;
          position: relative;
          overflow: hidden;
          background: #141414;
        }
        .loading-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #141414;
          z-index: 80;
        }
        .loading-number {
          font-family: 'Microgramma', sans-serif;
          color: #ffcc00;
          font-weight: 700;
          letter-spacing: 0.12em;
          user-select: none;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // assets to preload (make sure these exist)
  const assets = [
    "/images/team1.jpg",
    "/images/team2.jpg",
    "/images/team3.jpg",
    "/np_website.svg",
    "/npbasic.svg",
  ];
  const totalAssets = assets.length;

  const [loadedCount, setLoadedCount] = useState(0);
  const percent = Math.round((loadedCount / totalAssets) * 100);
  const assetsLoaded = loadedCount >= totalAssets;

  // displayNumber tween (smooth countup)
  const [displayNumber, setDisplayNumber] = useState(0);
  useEffect(() => {
    let raf = 0;
    const startTime = performance.now();
    const duration = 260;
    const from = displayNumber;
    const to = percent;
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const v = Math.round(from + (to - from) * t);
      setDisplayNumber(v);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent]);

  // preload assets
  useEffect(() => {
    let mounted = true;
    const markLoaded = () => {
      if (!mounted) return;
      setLoadedCount((c) => c + 1);
    };

    assets.forEach((url) => {
      const img = new Image();
      img.onload = markLoaded;
      img.onerror = markLoaded;
      img.src = url;
    });

    return () => {
      mounted = false;
    };
  }, []);

  // manage overlay visibility + fade
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const overlayRef = useRef(null);

  // when assetsLoaded becomes true, begin fade transition:
  useEffect(() => {
    if (!assetsLoaded) return;
    // start fade: fade out overlay, fade in hero
    // overlay fade duration
    const fadeDuration = 700; // ms
    // trigger CSS transition via inline styles
    if (overlayRef.current) {
      overlayRef.current.style.transition = `opacity ${fadeDuration}ms ease`;
      overlayRef.current.style.opacity = "0";
    }
    // show hero (set opacity via class)
    setHeroVisible(true);

    // after fadeDuration, remove overlay and enable scrolling
    const t = setTimeout(() => {
      setOverlayVisible(false);
      document.body.style.overflow = "auto";
    }, fadeDuration + 50);

    return () => clearTimeout(t);
  }, [assetsLoaded]);

  // disable scroll while overlay is visible
  useEffect(() => {
    document.body.style.overflow = overlayVisible ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [overlayVisible]);

  // reference for hero graphics container sizing (make svgs fit)
  const heroGraphicsRef = useRef(null);

  // keep logo responsive to mouse movement (subtle tilt / transform)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = heroGraphicsRef.current;
    if (!el) return;
    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      // small offsets
      setMouseOffset({ x: clamp(dx, -1, 1), y: clamp(dy, -1, 1) });
    }
    function onLeave() {
      setMouseOffset({ x: 0, y: 0 });
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const logoTransform = {
    transform: `translate3d(-50%,-50%,0) translate(${mouseOffset.x * 8}px, ${mouseOffset.y * 8}px)`,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#141414", color: "#fff" }}>
      {/* HERO (the front/title page) */}
      <div className="hero-container" aria-hidden={overlayVisible ? "true" : "false"}>
        {/* hero SVG centered & responsive */}
        <div
          ref={heroGraphicsRef}
          style={{
            width: "min(80vw, 80vh)",
            height: "min(80vw, 80vh)",
            maxWidth: 1000,
            maxHeight: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            pointerEvents: "none",
            opacity: heroVisible ? 1 : 0,
            transition: "opacity 700ms ease",
          }}
        >
          {/* Hero logo (np_website.svg). It scales with container */}
          <img
            src="/np_website.svg"
            alt="NP Website Logo"
            className="hero-logo neon-svg"
            style={{
              ...logoTransform,
              position: "absolute",
              left: "50%",
              top: "50%",
              transformOrigin: "center center",
              width: "100%",
              maxWidth: "100%",
              height: "auto",
              // slight hover/interaction transform is controlled via mouseOffset
            }}
          />
        </div>

        {/* Loading overlay (number only) */}
        {overlayVisible && (
          <div
            ref={overlayRef}
            className="loading-overlay"
            style={{
              opacity: 1,
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                pointerEvents: "none",
              }}
            >
              <div
                className="loading-number"
                style={{
                  fontSize: "clamp(28px, 10vw, 96px)",
                  lineHeight: 1,
                }}
              >
                {displayNumber}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content (below front page). Hidden until overlay removed (we keep it mounted but user cannot scroll until overlayVisible false) */}
      <main
        style={{
          background: "#141414",
          color: "#fff",
          opacity: overlayVisible ? 0 : 1,
          transition: "opacity 700ms ease 100ms",
        }}
      >
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: 24 }}>
          <section className="section" style={{ paddingTop: 28 }}>
            <TeamContent />
          </section>

          <section className="section">
            <ScheduleContent />
          </section>

          <section className="section">
            <JoinUsContent />
          </section>

          <section className="section">
            <ContactContent />
          </section>

          <div style={{ height: 200 }} />
        </div>
      </main>
    </div>
  );
}
