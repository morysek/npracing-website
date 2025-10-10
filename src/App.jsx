// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Updated App
 * - loading svgs live at /public/loading_25.svg, /public/loading_50.svg, /public/loading_75.svg, /public/loading_100.svg
 * - shows the appropriate SVG based on load percent thresholds:
 *     >=25 && <50  -> loading_25.svg
 *     >=50 && <75  -> loading_50.svg
 *     >=75 && <100 -> loading_75.svg
 *     ===100       -> loading_100.svg
 * - displays the numeric count-up in the center (NO % sign) in Microgramma bold, color #ffcc00
 * - overlay sits above everything and ignores other objects while visible
 * - retains the smooth/inertial scrolling and hidden scroll bar from the previous code
 *
 * NOTE: the files are referenced exactly as you requested: "/public/loading_25.svg" etc.
 * If your app serves static files from root (create-react-app default), you may prefer to use "/loading_25.svg".
 * I'm using your requested "/public/..." paths here to match your instruction.
 */

/* small helper to preload images */
function preloadImage(src) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(src);
    im.onerror = () => resolve(src); // resolve anyway so loader doesn't hang
    im.src = src;
  });
}

export default function App() {
  // assets to preload (logo + content images)
  const assets = [
    "/images/npbasic.svg",
    "/images/team1.jpg",
    "/images/team2.jpg",
    "/images/team3.jpg",
    // you can add more assets here if you want them counted
  ];
  const totalAssets = assets.length;

  // loader state
  const [loadedCount, setLoadedCount] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // animated displayed number (no % sign)
  const [displayedPercent, setDisplayedPercent] = useState(0);
  const percent = Math.round((loadedCount / totalAssets) * 100);

  // overlay visibility (center hero)
  const [overlayVisible, setOverlayVisible] = useState(true);

  // responsive
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // inject fonts + base styles (Microgramma + Zalando)
  useEffect(() => {
    const id = "__npr_inject_fonts_and_base";
    if (document.getElementById(id)) return;
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
        font-family: 'ZalandoSans';
        src: url('/fonts/zalando-sans-expanded.woff2') format('woff2');
        font-weight: 400 800;
        font-style: normal;
        font-display: swap;
      }
      html,body,#root { height: 100%; background: #141414; }
      body { margin: 0; background: #141414; color: #fff; }
      ::-webkit-scrollbar { width: 0; height: 0; }
      html,body { scrollbar-width: none; -ms-overflow-style: none; }
      .zig { line-height: 1.45; margin: 8px 0; font-family: 'ZalandoSans', Inter, sans-serif; }
      @media (min-width:900px) {
        .zig:nth-of-type(odd) { transform: translateX(-6%); }
        .zig:nth-of-type(even) { transform: translateX(6%); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // preload assets
  useEffect(() => {
    let mounted = true;
    Promise.all(
      assets.map((src) =>
        preloadImage(src).then(() => {
          if (!mounted) return;
          setLoadedCount((c) => c + 1);
        })
      )
    ).then(() => {
      if (!mounted) return;
      setAssetsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // animate numeric count-up whenever percent updates
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = displayedPercent;
    const to = percent;
    const duration = 280;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const val = Math.round(from + (to - from) * t);
      setDisplayedPercent(val);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent]);

  // when everything loaded -> hide overlay after a tiny delay so user sees 100
  useEffect(() => {
    if (!assetsLoaded) return;
    const id = setTimeout(() => setOverlayVisible(false), 520);
    return () => clearTimeout(id);
  }, [assetsLoaded]);

  // choose which loading svg to show based on the actual progress (percent)
  function chooseLoadingSvg(p) {
    // p is 0..100 (integer)
    if (p >= 100) return "/public/loading_100.svg";
    if (p >= 75) return "/public/loading_75.svg";
    if (p >= 50) return "/public/loading_50.svg";
    if (p >= 25) return "/public/loading_25.svg";
    // default fallback before 25%
    return "/public/loading_25.svg";
  }

  // smooth/inertial scrolling (lerp the transform of the content wrapper)
  const contentRef = useRef(null);
  const rafRef = useRef(null);
  const targetY = useRef(window.scrollY || 0);
  const currentY = useRef(window.scrollY || 0);

  useEffect(() => {
    const onScroll = () => {
      targetY.current = window.scrollY || 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const animate = () => {
      const ease = 0.08; // smaller -> stronger inertia / slower start
      currentY.current += (targetY.current - currentY.current) * ease;
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${-currentY.current}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // helper clamp
  function clamp(v, a = -Infinity, b = Infinity) {
    return Math.min(b, Math.max(a, v));
  }

  // center overlay ref for interactive behavior if you want it later
  const overlayRef = useRef(null);

  // paths for svg & logo
  const currentSvg = chooseLoadingSvg(percent);

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflow: "auto" }}>
      {/* Full-screen center overlay (always above everything while visible) */}
      {overlayVisible && (
        <div
          ref={overlayRef}
          aria-hidden={false}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#141414",
            transition: "opacity 420ms ease",
            pointerEvents: "auto",
          }}
        >
          {/* The dynamic SVG (changes with thresholds). Placed center and sized responsively. */}
          <img
            src={currentSvg}
            alt="loading visual"
            style={{
              maxWidth: isMobile ? "72vw" : "52vw",
              width: isMobile ? 320 : 520,
              height: "auto",
              display: "block",
              pointerEvents: "none",
              filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.7))",
              transition: "opacity 340ms ease, transform 340ms ease",
            }}
          />

          {/* Percentage number (no % sign) centered on top of the SVG area */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: "Microgramma, sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? 48 : 64,
                color: "#ffcc00", // same color as titles
                letterSpacing: "0.10em",
                lineHeight: 1,
                pointerEvents: "none",
                textShadow: "0 6px 18px rgba(255,204,0,0.06)",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              {displayedPercent}
            </div>
          </div>
        </div>
      )}

      {/* MAIN DOCUMENT: keep same scroll & smooth transform approach */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "200vh" }}>
        {/* spacer equal to viewport so the following fixed content aligns under the hero */}
        <div style={{ position: "relative", width: "100%", minHeight: "100vh", boxSizing: "border-box" }} />

        {/* fixed content wrapper that we translate for smooth scrolling */}
        <div
          ref={contentRef}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            minHeight: "100vh",
            willChange: "transform",
            zIndex: 2,
            pointerEvents: "auto",
            overflow: "visible",
          }}
        >
          {/* actual page content (sections) */}
          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "80px 20px" }}>
            {/* Team */}
            <section style={{ marginBottom: 20 }}>
              <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", margin: "8px 0" }}>Team</h1>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 320px" }}>
                  <p style={{ color: "#fff", fontFamily: "ZalandoSans" }} className="zig">
                    The Team
                  </p>
                  <ul style={{ color: "#fff", fontFamily: "ZalandoSans" }}>
                    <li>Team Leader: Matěj Prokop</li>
                    <li>Engineer: Lukáš Moravec</li>
                    <li>Finance manager: Lukáš Martin</li>
                    <li>Marketing manager: Veronika Lindová</li>
                  </ul>
                </div>

                <div style={{ flex: "1 1 320px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr", gap: 12 }}>
                  <img src="/images/team1.jpg" alt="team1" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
                  <img src="/images/team2.jpg" alt="team2" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
                  <img src="/images/team3.jpg" alt="team3" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
                </div>
              </div>
            </section>

            {/* Schedule */}
            <section style={{ marginBottom: 20 }}>
              <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", margin: "8px 0" }}>Schedule</h1>
              <p style={{ color: "#fff", fontFamily: "ZalandoSans" }} className="zig">
                Next up: Poland — Oct 11
              </p>
            </section>

            {/* Join Us */}
            <section style={{ marginBottom: 20 }}>
              <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", margin: "8px 0" }}>Join Us</h1>
              <p style={{ color: "#fff", fontFamily: "ZalandoSans" }} className="zig">
                Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!
              </p>
            </section>

            {/* Contact */}
            <section style={{ marginBottom: 20 }}>
              <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", margin: "8px 0" }}>Contact</h1>
              <p style={{ color: "#fff", fontFamily: "ZalandoSans" }} className="zig">
                For general inquiry:{" "}
                <a href="mailto:prokopmatej@novyporg.cz" style={{ color: "#ffcc00" }}>
                  prokopmatej@novyporg.cz
                </a>
              </p>
            </section>

            <div style={{ height: 400 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
