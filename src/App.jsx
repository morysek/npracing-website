// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * App:
 * - Centered title overlay (loading frames) that shows appropriate SVG depending on load %
 * - Numeric count-up loader (number only, Microgramma bold, color #ffcc00)
 * - When fully loaded: hide number and show loading_logo.svg along with final frame
 * - Overlay acts as the front page (100vh). Rest of site (content) below it.
 * - Smooth/inertial scroll by lerping transform of the content wrapper
 * - Background #141414, Titles Microgramma (#ffcc00), body text Zalando
 */

function preloadImage(src) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(src);
    im.onerror = () => resolve(src);
    im.src = src;
  });
}

export default function App() {
  // assets to preload (logo + 3 team images)
  const assets = ["/images/npbasic.svg", "/images/team1.jpg", "/images/team2.jpg", "/images/team3.jpg"];
  const totalAssets = assets.length;

  // loading state
  const [loadedCount, setLoadedCount] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [displayedPercent, setDisplayedPercent] = useState(0);
  const percentTarget = Math.round((loadedCount / totalAssets) * 100);

  // overlay (title page) visibility — overlay remains until user scrolls past front page
  const [overlayVisible, setOverlayVisible] = useState(true);

  // refs for logo interactions & overlay area
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

  // inject fonts + global styles
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
      /* hide native scrollbar visually */
      ::-webkit-scrollbar { width: 0; height: 0; }
      html,body { scrollbar-width: none; -ms-overflow-style: none; }
    `;
    document.head.appendChild(style);
  }, []);

  // preload assets (images + logo)
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

  // animate numeric count-up to percentTarget smoothly (no percent symbol)
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const startVal = displayedPercent;
    const endVal = percentTarget;
    const duration = 300; // ms for each change
    function step(ts) {
      const elapsed = ts - start;
      const t = Math.min(1, elapsed / duration);
      const val = Math.round(startVal + (endVal - startVal) * t);
      setDisplayedPercent(val);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentTarget]);

  // keep overlay visible until user scrolls past front page (100vh)
  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY || 0;
      // hide overlay when scrolled beyond a tiny threshold of the first viewport
      if (scrolled > Math.max(24, window.innerHeight * 0.06)) {
        setOverlayVisible(false);
      } else {
        setOverlayVisible(true);
      }
      targetY.current = scrolled;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    // also set initial state in case page not at top
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // smooth/inertial scroll: we lerp contentRef transform to window.scrollY
  useEffect(() => {
    const onScroll = () => {
      targetY.current = window.scrollY || 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const animate = () => {
      // ease factor - smaller = slower/inertia feel.
      const ease = 0.08;
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

  // logo pointer interactions (tilt + small warp + neon glow)
  useEffect(() => {
    const el = overlayRef.current;
    const logo = logoRef.current;
    if (!el || !logo) return;

    let clearing = null;

    function onPointerMove(e) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const rotX = clamp(-dy * 12, -18, 18);
      const rotY = clamp(dx * 16, -22, 22);
      const tx = clamp(dx * 10, -18, 18);
      const ty = clamp(dy * 10, -18, 18);
      logo.style.transition = "";
      logo.style.transform = `translate(-50%, -50%) rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(${tx}px, ${ty}px, 0) scale(${isMobile ? 1.9 : 1.06})`;
      logo.style.filter = `drop-shadow(0 10px 30px rgba(0,255,200,0.06)) drop-shadow(0 0 22px rgba(255,204,0,0.12))`;
      // small text/warp effects could be added here if the SVG had text nodes
      if (clearing) clearTimeout(clearing);
    }

    function onPointerLeave() {
      logo.style.transition = "transform 700ms cubic-bezier(.2,.9,.2,1), filter 700ms ease";
      logo.style.transform = `translate(-50%, -50%) scale(${isMobile ? 1.9 : 1.0})`;
      logo.style.filter = "";
      clearing = setTimeout(() => (logo.style.transition = ""), 720);
    }

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);
    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      if (clearing) clearTimeout(clearing);
    };
  }, [isMobile]);

  // helper clamp
  function clamp(v, a = -Infinity, b = Infinity) {
    return Math.min(b, Math.max(a, v));
  }

  // choose which SVG frame to show according to displayedPercent
  function getFrameSvg(percent) {
    // use displayedPercent (animated) to decide which svg to show
    if (percent >= 100) return "/loading_100.svg";
    if (percent >= 75) return "/loading_75.svg";
    if (percent >= 50) return "/loading_50.svg";
    if (percent >= 25) return "/loading_25.svg";
    return null;
  }

  const frameSvg = getFrameSvg(displayedPercent);
  const showFinalLogo = assetsLoaded && displayedPercent >= 100;

  // CONTENT: reuse the previously provided sections (Team / Schedule / Join / Contact)
  function TeamContent() {
    return (
      <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
        <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Team</h1>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <p className="zig" style={{ fontFamily: "ZalandoSans" }}>
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

        <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 20 }}>About Us</h1>
        <div>
          <p className="zig" style={{ fontFamily: "ZalandoSans" }}>
            We are the only Czech team and a top contender in the prestigious international STEM racing competition.
          </p>
          <p className="zig" style={{ fontFamily: "ZalandoSans" }}>
            We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.
          </p>
          <p className="zig" style={{ fontFamily: "ZalandoSans" }}>
            Founded at Nový PORG, a prestigious school, NP Racing unites skills in engineering, manufacturing, and marketing.
          </p>
          <p className="zig" style={{ fontFamily: "ZalandoSans" }}>
            We collaborate with partners like the Czech Technical University to enhance our expertise.
          </p>
        </div>
      </div>
    );
  }

  function ScheduleContent() {
    return (
      <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
        <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Schedule</h1>
        <p className="zig" style={{ fontFamily: "ZalandoSans" }}>
          Next up: Poland — Oct 11
        </p>
        <ol style={{ color: "#fff", fontFamily: "ZalandoSans" }}>
          <li>Oct 11</li>
        </ol>
      </div>
    );
  }

  function ContactContent() {
    return (
      <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
        <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Contact</h1>
        <p className="zig" style={{ fontFamily: "ZalandoSans" }}>
          For general inquiry:{" "}
          <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">
            prokopmatej@novyporg.cz
          </a>
        </p>
      </div>
    );
  }

  function JoinUsContent() {
    return (
      <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
        <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Join Us</h1>
        <p className="zig" style={{ fontFamily: "ZalandoSans" }}>
          Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!
        </p>
      </div>
    );
  }

  // layout styles
  const frontViewportHeight = window.innerHeight || 800;

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflowX: "hidden" }}>
      {/* FRONT TITLE OVERLAY (full-screen). It stays visible until the user scrolls down past it */}
      {overlayVisible && (
        <div
          ref={overlayRef}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#141414",
            pointerEvents: "auto",
          }}
        >
          {/* frame svg (changes with progress). Keep it dominant */}
          <div style={{ position: "relative", width: isMobile ? 260 : 520, height: isMobile ? 260 : 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {frameSvg && (
              <img
                src={frameSvg}
                alt="loading frame"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            )}

            {/* when fully loaded, also show loading_logo.svg beneath or beside */}
            {showFinalLogo && (
              <img
                src="/loading_logo.svg"
                alt="loading logo"
                style={{
                  position: "absolute",
                  right: isMobile ? 8 : 24,
                  bottom: isMobile ? 8 : 18,
                  width: isMobile ? 64 : 96,
                  height: "auto",
                  opacity: 1,
                  filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.6))",
                }}
              />
            )}
          </div>

          {/* numeric loader: center of page while NOT fully loaded; Microgramma bold, color #ffcc00, NO percent sign */}
          {!assetsLoaded && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "Microgramma",
                  fontWeight: 700,
                  color: "#ffcc00",
                  fontSize: isMobile ? 46 : 64,
                  letterSpacing: "0.06em",
                  lineHeight: 1,
                }}
              >
                {displayedPercent}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invisible spacer equal to one viewport so page can't show content until user scrolls past the front page */}
      <div style={{ height: `${frontViewportHeight}px`, width: "100%" }} />

      {/* MAIN CONTENT (fixed wrapper transformed for smooth scroll) */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "200vh",
        }}
      >
        <div style={{ position: "relative", width: "100%", minHeight: "100vh", boxSizing: "border-box" }} />

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
                <div style={{ flex: "1 1 320px", display: "grid", gap: 12 }}>
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
        @media (max-width:768px) {
          img { max-width: 100%; height: auto; display:block; }
        }
      `}</style>
    </div>
  );
}
