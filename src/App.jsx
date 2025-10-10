// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * App:
 * - Centered npbasic.svg logo during load (reacts to mouse)
 * - Numeric count-up loader (percentage)
 * - Smooth/inertial scroll by lerping transform of the content wrapper
 * - Background #141414, titles in Microgramma (#ffcc00), body text Zalando
 * - Uses images /images/team1.jpg team2.jpg team3.jpg
 *
 * Notes:
 * - Place fonts at /public/fonts/microgramma.woff2 and /public/fonts/zalando-sans-expanded.woff2
 * - Place npbasic.svg at /images/npbasic.svg
 * - If fonts are missing, system fallbacks will be used.
 */

function preloadImage(src) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(src);
    im.onerror = () => resolve(src); // resolve anyway to avoid hang
    im.src = src;
  });
}

export default function App() {
  // assets to preload (svg logo + 3 images)
  const assets = ["/images/npbasic.svg", "/images/team1.jpg", "/images/team2.jpg", "/images/team3.jpg"];
  const totalAssets = assets.length;

  // loading state
  const [loadedCount, setLoadedCount] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [displayedPercent, setDisplayedPercent] = useState(0);
  const percentTarget = Math.round((loadedCount / totalAssets) * 100);

  // overlay visibility
  const [overlayVisible, setOverlayVisible] = useState(true);

  // logo pointer interactions
  const logoRef = useRef(null);
  const overlayRef = useRef(null);

  // smooth scroll refs
  const contentRef = useRef(null);
  const rafRef = useRef(null);
  const targetY = useRef(window.scrollY || 0);
  const currentY = useRef(window.scrollY || 0);

  // mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // inject fonts (expecting .woff2 at /public/fonts)
  useEffect(() => {
    const id = "__npr_inject_fonts";
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
      body { margin: 0; background: #141414; }
      ::-webkit-scrollbar { width: 0; height: 0; }
      html,body { scrollbar-width: none; -ms-overflow-style: none; }
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
    return () => (mounted = false);
  }, []);

  // animate numeric count-up to percentTarget smoothly
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const startVal = displayedPercent;
    const endVal = percentTarget;
    const duration = 300; // ms for each step update
    function step(ts) {
      const elapsed = ts - start;
      // ramp to new target
      const t = Math.min(1, elapsed / duration);
      const val = Math.round(startVal + (endVal - startVal) * t);
      setDisplayedPercent(val);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentTarget]);

  // when everything loaded -> finish overlay after a short delay
  useEffect(() => {
    if (!assetsLoaded) return;
    const id = setTimeout(() => {
      // animate the overlay fade and hide centered logo; we remove the centered logo from scrolling page
      setOverlayVisible(false);
    }, 600); // small delay so count hits 100 and user sees it
    return () => clearTimeout(id);
  }, [assetsLoaded]);

  // smooth/inertial scroll: we lerp contentRef transform to window.scrollY
  useEffect(() => {
    const onScroll = () => {
      targetY.current = window.scrollY || 0;
    };
    // ensure targetY updated (necessary)
    window.addEventListener("scroll", onScroll, { passive: true });

    const animate = () => {
      // ease factor - smaller = slower/inertia feel. tuned for slower start & nicer inertia.
      const ease = 0.08;
      currentY.current += (targetY.current - currentY.current) * ease;
      if (contentRef.current) {
        // apply a rounded translate to avoid subpixel blurriness
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

  // logo pointer interactions (tilt + small warp + neon glow)
  useEffect(() => {
    const el = overlayRef.current;
    const logo = logoRef.current;
    if (!el || !logo) return;

    function onPointerMove(e) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      // tilt & translate
      const rotX = clamp(-dy * 10, -12, 12); // degrees
      const rotY = clamp(dx * 14, -18, 18);
      const tx = clamp(dx * 10, -12, 12);
      const ty = clamp(dy * 10, -12, 12);
      logo.style.transform = `translate(-50%, -50%) rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(${tx}px, ${ty}px, 0) scale(${isMobile ? 1.95 : 1.05})`;
      // letter spacing effect for SVG path group: we just scale a bit for "warp"
      logo.style.filter = `drop-shadow(0 8px 18px rgba(0,255,200,0.06)) drop-shadow(0 0 14px rgba(255,204,0,0.08))`;
    }

    function onPointerLeave() {
      logo.style.transition = "transform 600ms cubic-bezier(.2,.9,.2,1), filter 600ms ease";
      logo.style.transform = `translate(-50%, -50%) scale(${isMobile ? 1.95 : 1.0})`;
      logo.style.filter = "";
      setTimeout(() => (logo.style.transition = ""), 650);
    }

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);
    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [isMobile]);

  // small helper
  function clamp(v, a = -Infinity, b = Infinity) {
    return Math.min(b, Math.max(a, v));
  }

  // content markup
  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflow: "auto" }}>
      {/* center loading overlay with interactive logo */}
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
            transition: "opacity 500ms ease",
          }}
        >
          <div style={{ position: "relative", width: isMobile ? 260 : 520, height: isMobile ? 180 : 260 }}>
            <img
              ref={logoRef}
              src="/images/npbasic.svg"
              alt="np logo"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%,-50%) scale(${isMobile ? 1.95 : 1})`,
                transformOrigin: "center center",
                willChange: "transform, filter",
                transition: "transform 220ms cubic-bezier(.2,.9,.2,1)",
                maxWidth: "100%",
                height: "auto",
                display: "block",
                filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.6))",
              }}
            />
          </div>

          {/* numeric loader */}
          <div
            style={{
              position: "absolute",
              bottom: isMobile ? 60 : 80,
              textAlign: "center",
              width: "100%",
              pointerEvents: "none",
              fontFamily: "'ZalandoSans', Inter, sans-serif",
              color: "#ffcc00",
              fontSize: isMobile ? 18 : 20,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {displayedPercent}%
          </div>
        </div>
      )}

      {/* once overlay is hidden, we no longer render the centered logo (logo removed from the scrolling page) */}
      {/* MAIN CONTENT: we render content inside a fixed wrapper that will be transformed for smooth scroll */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          // set height equal to document scroll space so native scrollbar works while we animate content transform
          // content wrapper itself will be transformed by requestAnimationFrame
          minHeight: "200vh",
        }}
      >
        {/* This invisible spacer preserves native scroll height */}
        <div style={{ position: "relative", width: "100%", minHeight: "100vh", boxSizing: "border-box" }} />

        {/* content fixed wrapper that we translate for smooth scrolling */}
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
          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "80px 20px" }}>
            {/* sections — Titles Microgramma with #ffcc00, text Zalando */}
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

            <section style={{ marginBottom: 20 }}>
              <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", margin: "8px 0" }}>Schedule</h1>
              <p style={{ color: "#fff", fontFamily: "ZalandoSans" }} className="zig">
                Next up: Poland — Oct 11
              </p>
            </section>

            <section style={{ marginBottom: 20 }}>
              <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", margin: "8px 0" }}>Join Us</h1>
              <p style={{ color: "#fff", fontFamily: "ZalandoSans" }} className="zig">
                Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!
              </p>
            </section>

            <section style={{ marginBottom: 20 }}>
              <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", margin: "8px 0" }}>Contact</h1>
              <p style={{ color: "#fff", fontFamily: "ZalandoSans" }} className="zig">
                For general inquiry: <a href="mailto:prokopmatej@novyporg.cz" style={{ color: "#ffcc00" }}>prokopmatej@novyporg.cz</a>
              </p>
            </section>

            <div style={{ height: 400 }} />
          </div>
        </div>
      </div>

      {/* small decorative styles and zig-zag effect */}
      <style>{`
        .zig { line-height: 1.45; margin: 8px 0; }
        @media (min-width:900px) {
          .zig:nth-of-type(odd) { transform: translateX(-6%); }
          .zig:nth-of-type(even) { transform: translateX(6%); }
        }
        /* ensure images keep aspect ratio on mobile and stack vertically (we already used grid) */
        @media (max-width:768px) {
          img { max-width: 100%; height: auto; display:block; }
        }
      `}</style>
    </div>
  );
}
