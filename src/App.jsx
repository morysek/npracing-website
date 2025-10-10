// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/* ---------- helper: preload image ---------- */
function preloadImage(src) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(src);
    im.onerror = () => resolve(src); // resolve anyway so loader doesn't hang
    im.src = src;
  });
}

/* ---------- choose which loading svg to show based on percent ---------- */
function chooseLoadingSvg(pct) {
  // pct: 0..100
  if (pct >= 100) return "/public/loading_100.svg";
  if (pct >= 75) return "/public/loading_75.svg";
  if (pct >= 50) return "/public/loading_50.svg";
  if (pct >= 25) return "/public/loading_25.svg";
  return "/public/loading_25.svg";
}

export default function App() {
  // assets to preload (note: you requested /public/... paths for svgs)
  const assets = [
    "/images/npbasic.svg",
    "/images/team1.jpg",
    "/images/team2.jpg",
    "/images/team3.jpg",
    "/public/loading_25.svg",
    "/public/loading_50.svg",
    "/public/loading_75.svg",
    "/public/loading_100.svg",
    "/public/loading_logo.svg",
  ];

  const totalAssets = assets.length;

  // loading counters
  const [loadedCount, setLoadedCount] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // overlay / logo visibility
  const [overlayVisible, setOverlayVisible] = useState(true);

  // percent (derived)
  const percent = Math.round((loadedCount / totalAssets) * 100);

  // animated display number (counts toward `percent`)
  const [displayNumber, setDisplayNumber] = useState(0);
  const displayRef = useRef(displayNumber);
  displayRef.current = displayNumber;

  // mobile detection
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // inject fonts + base styles; keeps scrollbar hidden
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
      body { margin: 0; background: #141414; color: #fff; }
      ::-webkit-scrollbar { width: 0; height: 0; }
      html,body { scrollbar-width: none; -ms-overflow-style: none; }
    `;
    document.head.appendChild(style);
  }, []);

  // preload assets
  useEffect(() => {
    let mounted = true;
    let localLoaded = 0;

    const loadAll = async () => {
      for (const src of assets) {
        // preload image-like assets; this also covers svg
        // we purposely don't throw on error - we want loader to proceed
        // quickly even if some assets 404.
        // NOTE: using Image() won't load .glb, but we don't have glb here.
        // If you later add binary assets, handle via fetch.
        // We use await serially so display increments visibly — feel free to change to Promise.all.
        // But serial gives a nicer stepwise loading feel.
        // Try both the requested '/public/...' path and fallback '/...'
        const tries = [src, src.startsWith("/public/") ? src.replace("/public", "") : src];
        let success = false;
        for (const t of tries) {
          try {
            // use image preload
            // for local svg/jpg this is fine
            // wrap in promise to await
            // eslint-disable-next-line no-await-in-loop
            await preloadImage(t);
            success = true;
            break;
          } catch (e) {
            // ignore and try next
          }
        }
        if (!mounted) return;
        localLoaded++;
        setLoadedCount(localLoaded);
      }
      if (!mounted) return;
      setAssetsLoaded(true);
    };

    loadAll();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // animate displayed number smoothly toward percent (short duration)
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = displayRef.current;
    const to = percent;
    const duration = 350;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = Math.round(from + (to - from) * t);
      setDisplayNumber(v);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [percent]);

  // when fully loaded -> hide overlay after a small delay (so final UI feels smooth)
  useEffect(() => {
    if (!assetsLoaded) return;
    const id = setTimeout(() => setOverlayVisible(false), 600);
    return () => clearTimeout(id);
  }, [assetsLoaded]);

  // smooth/inertial scroll (lerp transform)
  const contentRef = useRef(null);
  const rafRef = useRef(null);
  const targetY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const currentY = useRef(targetY.current);

  useEffect(() => {
    const onScroll = () => {
      targetY.current = window.scrollY || 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const animate = () => {
      const ease = 0.08; // controls inertia / slowness
      currentY.current += (targetY.current - currentY.current) * ease;
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${-currentY.current}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // interactive logo behavior: subtle tilt on pointer move
  const logoRef = useRef(null);
  const overlayRef = useRef(null);
  useEffect(() => {
    const el = overlayRef.current;
    const logo = logoRef.current;
    if (!el || !logo) return;

    function onPointerMove(e) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = clamp(dy * 6, -10, 10);
      const rotY = clamp(dx * -8, -12, 12);
      logo.style.transform = `translate(-50%,-50%) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${isMobile ? 1.95 : 1.0})`;
      logo.style.transition = "transform 120ms linear";
    }
    function onLeave() {
      logo.style.transition = "transform 600ms cubic-bezier(.2,.9,.2,1)";
      logo.style.transform = `translate(-50%,-50%) scale(${isMobile ? 1.95 : 1.0})`;
      setTimeout(() => (logo.style.transition = ""), 650);
    }

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [isMobile]);

  // clamp helper
  function clamp(v, a = -Infinity, b = Infinity) {
    return Math.min(b, Math.max(a, v));
  }

  // selected svg based on the current displayed percent (we use `percent` for thresholds)
  const loadingSvg = chooseLoadingSvg(percent);

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflow: "auto" }}>
      {/* full-screen overlay */}
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
            transition: "opacity 500ms ease",
            pointerEvents: "auto",
          }}
        >
          <div style={{ textAlign: "center", width: "100%", maxWidth: 980, padding: 24 }}>
            {/* center SVG that changes with progress */}
            <img
              src={loadingSvg}
              alt="loading visual"
              style={{
                display: "block",
                margin: "0 auto",
                maxWidth: "60vw",
                width: isMobile ? 300 : 480,
                height: "auto",
                filter: "drop-shadow(0 12px 40px rgba(255,204,0,0.08))",
                transition: "opacity 260ms ease, transform 260ms ease",
              }}
            />

            {/* numeric counter (no percent symbol) — same title color #ffcc00 and Microgramma font */}
            <div
              style={{
                marginTop: 18,
                fontFamily: "Microgramma, sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? 36 : 44,
                color: "#ffcc00",
                letterSpacing: "0.14em",
              }}
            >
              {displayNumber}
            </div>
          </div>
        </div>
      )}

      {/* main content area: we keep native scroll height with spacer and translate the fixed content for smooth scroll */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "200vh" }}>
        <div style={{ position: "relative", width: "100%", minHeight: "100vh" }} />

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
            {/* sections — Titles Microgramma (#ffcc00), body Zalando */}
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

      {/* decorative styles */}
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
