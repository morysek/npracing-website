// src/App.jsx
import React, { useEffect, useState } from "react";

/* ---------- helper ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---------- Content components (Team / Schedule / Contact / Join Us) ---------- */
function TeamContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Team</h1>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px" }}>
          <p className="zig">The Team</p>
          <ul>
            <li>Team Leader: Matěj Prokop</li>
            <li>Engineer: Lukáš Moravec</li>
            <li>Finance manager: Lukáš Martin</li>
            <li>Marketing manager: Veronika Lindová</li>
          </ul>
        </div>

        <div style={{ flex: "1 1 320px", display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <img src="/images/team1.jpg" alt="team1" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
          <img src="/images/team2.jpg" alt="team2" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
          <img src="/images/team3.jpg" alt="team3" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
        </div>
      </div>

      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 20 }}>About Us</h1>
      <div>
        <p className="zig">We are the only Czech team and a top contender in the prestigious international STEM racing competition.</p>
        <p className="zig">We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.</p>
        <p className="zig">Founded at Nový PORG, a prestigious school, NP Racing unites skills in engineering, manufacturing, and marketing.</p>
        <p className="zig">We collaborate with partners like the Czech Technical University to enhance our expertise.</p>
      </div>
    </div>
  );
}

function ScheduleContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Schedule</h1>
      <p className="zig">Next up: Poland</p>
      <ol>
        <li>Oct 11</li>
      </ol>
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

function JoinUsContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Join Us</h1>
      <p className="zig">Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>
    </div>
  );
}

/* ---------- LoaderOverlay (RESPONSIVE & CENTERED) ---------- */
function LoaderOverlay({ progress }) {
  const p = Math.round(clamp(progress, 0, 100));

  // pick correct svg according to ranges
  let svgToShow = "/loading_25.svg";
  if (p >= 100) svgToShow = "/loading_100.svg";
  else if (p >= 75) svgToShow = "/loading_75.svg";
  else if (p >= 50) svgToShow = "/loading_50.svg";
  else svgToShow = "/loading_25.svg";

  return (
    <div
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
      {/* Centered content container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* SVG: responsive sizing (caps width + height to viewport proportions) */}
        <img
          src={svgToShow}
          alt="loading graphic"
          style={{
            width: "min(72vw, 680px)",
            height: "auto",
            maxHeight: "60vh",
            display: "block",
            objectFit: "contain",
          }}
        />

        {/* Numeric progress centered under the svg */}
        <div
          style={{
            marginTop: 20,
            fontSize: "5.2vw",
            minWidth: 40,
            maxWidth: 220,
            lineHeight: 1,
            textAlign: "center",
            fontFamily: "Microgramma, sans-serif",
            fontWeight: 700,
            color: "#ffcc00",
            letterSpacing: "0.02em",
          }}
        >
          {String(p)}
        </div>
      </div>
    </div>
  );
}

/* ---------- App (main) ---------- */
export default function App() {
  // ensure fonts are preloaded & available first
  useEffect(() => {
    if (!document.querySelector("link[data-npr-preload=microgramma]")) {
      const l1 = document.createElement("link");
      l1.rel = "preload";
      l1.href = "/fonts/microgramma.woff2";
      l1.as = "font";
      l1.type = "font/woff2";
      l1.crossOrigin = "anonymous";
      l1.setAttribute("data-npr-preload", "microgramma");
      document.head.appendChild(l1);
    }
    if (!document.querySelector("link[data-npr-preload=zalando]")) {
      const l2 = document.createElement("link");
      l2.rel = "preload";
      l2.href = "/fonts/zalando-sans-expanded.woff2";
      l2.as = "font";
      l2.type = "font/woff2";
      l2.crossOrigin = "anonymous";
      l2.setAttribute("data-npr-preload", "zalando");
      document.head.appendChild(l2);
    }

    if (!document.getElementById("__npr_font_faces")) {
      const style = document.createElement("style");
      style.id = "__npr_font_faces";
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
        body { font-family: 'ZalandoSans', Inter, sans-serif; background: #141414; margin: 0; }
        ::-webkit-scrollbar { display: none; width: 0; height: 0; }
        html,body { scrollbar-width: none; -ms-overflow-style: none; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // preload images
  const [loadedCount, setLoadedCount] = useState(0);
  const totalAssets = 3; // number of images
  const progress = (loadedCount / totalAssets) * 100;
  const assetsLoaded = loadedCount >= totalAssets;

  useEffect(() => {
    // show page scroll only after assets are loaded (but hide scrollbars visually)
    document.body.style.overflowY = assetsLoaded ? "auto" : "hidden";
  }, [assetsLoaded]);

  useEffect(() => {
    const imgs = ["/images/team1.jpg", "/images/team2.jpg", "/images/team3.jpg"];
    let mounted = true;
    imgs.forEach((src) => {
      const im = new Image();
      im.onload = () => mounted && setLoadedCount((c) => c + 1);
      im.onerror = () => mounted && setLoadedCount((c) => c + 1); // count it so loader doesn't hang on errors
      im.src = src;
    });
    return () => {
      mounted = false;
    };
  }, []);

  // STYLES
  const contentContainerStyle = {
    background: "#141414",
    color: "#fff",
    paddingTop: 0,
  };

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", position: "relative" }}>
      <style>{`
        h1 { margin: 12px 0; font-family: Microgramma, sans-serif; }
        .section { max-width: 1300px; margin: 0 auto; padding: 28px 20px; }
        .zig { text-align: left; margin: 8px 0; font-family: 'ZalandoSans', Inter, sans-serif; line-height:1.35; color: #fff; }
        @media (min-width: 900px) {
          .zig:nth-of-type(odd) { transform: translateX(-6%); }
          .zig:nth-of-type(even) { transform: translateX(6%); }
        }
      `}</style>

      {/* FRONT / TITLE PAGE — visible only while assets loading */}
      {!assetsLoaded && <LoaderOverlay progress={progress} />}

      {/* MAIN CONTENT — below the front/title area */}
      <div style={contentContainerStyle}>
        <div className="section">
          <TeamContent />
        </div>

        <div className="section">
          <ScheduleContent />
        </div>

        <div className="section">
          <JoinUsContent />
        </div>

        <div className="section">
          <ContactContent />
        </div>

        <div style={{ height: 200 }} />
      </div>
    </div>
  );
}
