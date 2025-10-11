// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/* ---------- helpers ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
function chooseLoadingSvg(percent) {
  if (percent >= 100) return "/loading_100.svg";
  if (percent >= 75) return "/loading_75.svg";
  if (percent >= 50) return "/loading_50.svg";
  return "/loading_25.svg";
}

/* ---------- small content (kept short) ---------- */
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
      <p className="zig">For general inquiry: <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">prokopmatej@novyporg.cz</a></p>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  // inject Microgramma font + base CSS
  useEffect(() => {
    const id = "__npr_microgramma";
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
        body { margin: 0; background: #141414; color: #fff; }
        html,body,#root { height: 100%; background: #141414; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        html,body { scrollbar-width: none; -ms-overflow-style: none; }
        .zig { text-align: left; margin: 8px 0; font-family: 'ZalandoSans', Inter, sans-serif; line-height:1.35; }
        @media (min-width: 900px) {
          .zig:nth-of-type(odd) { transform: translateX(-6%); }
          .zig:nth-of-type(even) { transform: translateX(6%); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // assets to preload
  const assets = [
    "/images/mory.png",
    "/images/matej.png",
    "/images/adam.png",
    "/images/drip.png",
    "/loading_25.svg",
    "/loading_50.svg",
    "/loading_75.svg",
    "/loading_100.svg",
    "/loading_logo.svg",
  ];
  const totalAssets = assets.length;

  const [loadedCount, setLoadedCount] = useState(0);
  const percent = Math.round((loadedCount / totalAssets) * 100);
  const fullyLoaded = loadedCount >= totalAssets;

  // animated display number
  const [displayNumber, setDisplayNumber] = useState(0);
  useEffect(() => {
    // animate number quickly toward percent
    let raf = 0;
    const start = performance.now();
    const from = displayNumber;
    const to = percent;
    const duration = 260;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const val = Math.round(from + (to - from) * t);
      setDisplayNumber(val);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [percent]);

  // preload assets
  useEffect(() => {
    let mounted = true;
    const markLoaded = () => {
      if (!mounted) return;
      setLoadedCount((c) => c + 1);
    };

    assets.forEach((url) => {
      if (url.match(/\.(jpe?g|png|webp|svg)$/i)) {
        const img = new Image();
        img.onload = markLoaded;
        img.onerror = markLoaded;
        img.src = url;
        return;
      }
      // fallback fetch for non-image resources
      fetch(url, { method: "GET" })
        .then((res) => res.ok ? res.arrayBuffer() : Promise.reject())
        .then(() => markLoaded())
        .catch(() => markLoaded());
    });

    return () => (mounted = false);
  }, []);

  // resizing helper so graphics never overflow the hero area
  const graphicsRef = useRef(null);
  useEffect(() => {
    if (!graphicsRef.current) return;
    const el = graphicsRef.current;
    let ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => {
        // no-op hook in case you want to compute sizes later
      });
      ro.observe(el);
    }
    return () => ro && ro.disconnect();
  }, []);

  const chosenSvg = chooseLoadingSvg(percent);

  return (
    <div style={{ minHeight: "100vh", background: "#141414", color: "#fff" }}>
      {/* HERO - full screen title page (home div) */}
      <div
        className="home"
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Graphics wrapper (centered, responsive square) */}
        <div
          ref={graphicsRef}
          style={{
            width: "min(90vw, 90vh)",
            height: "min(90vw, 90vh)",
            maxWidth: 980,
            maxHeight: 980,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxSizing: "border-box",
            transition: "opacity 360ms ease, transform 360ms ease",
            opacity: fullyLoaded ? 0 : 1, // fade out when done
            pointerEvents: fullyLoaded ? "none" : "auto",
          }}
        >
          <img
            src={chosenSvg}
            alt="loading visual"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "100%",
              height: "auto",
              objectFit: "contain",
              display: "block",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* PERCENT NUMBER OVERLAY: always centered and on top of graphics.
            Hidden when fullyLoaded (we fade it out). */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 60,
            pointerEvents: "none",
            transition: "opacity 420ms ease, transform 420ms ease",
            opacity: fullyLoaded ? 0 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Microgramma, sans-serif",
              fontWeight: 700,
              color: "#ffcc00",
              fontSize: "clamp(28px, 8vw, 64px)",
              letterSpacing: "0.12em",
            }}
          >
            {displayNumber}
          </div>
        </div>

        {/* FINAL LOGO OVERLAY: appears after fully loaded and stays centered.
            We show this overlay logo and keep it visible while the hero is visible.
            It is independent of the graphics wrapper (so it stays perfectly centered). */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: fullyLoaded ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(0.98)",
            zIndex: 70,
            pointerEvents: "none",
            transition: "opacity 420ms ease, transform 420ms ease",
            opacity: fullyLoaded ? 1 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "min(70vw, 70vh)",
            maxWidth: 600,
          }}
        >
          <img
            src="/loading_logo.svg"
            alt="main logo"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              display: "block",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* subtle SCROLL hint */}
        <div
          style={{
            position: "absolute",
            bottom: 18,
            left: "50%",
            transform: "translateX(-50%)",
            color: "#ffcc00",
            fontFamily: "Microgramma, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.08em",
            opacity: fullyLoaded ? 0.95 : 0.15,
            fontSize: 12,
            pointerEvents: "none",
          }}
        >
          SCROLL
        </div>
      </div>

      {/* MAIN content below the hero - user only sees this after they scroll past the full-screen hero */}
      <main style={{ background: "#141414", color: "#fff" }}>
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
