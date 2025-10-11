// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/* ---------- simple content components (unchanged) ---------- */
function TeamContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma, sans-serif" }}>Team</h1>

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

      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma, sans-serif", marginTop: 20 }}>About Us</h1>
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
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma, sans-serif" }}>Schedule</h1>
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
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma, sans-serif" }}>Contact</h1>
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
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma, sans-serif" }}>Join Us</h1>
      <p className="zig">Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>
    </div>
  );
}

/* ---------- choose the appropriate loading svg based on percent ---------- */
function chooseLoadingSvg(percent) {
  // user-specified thresholds:
  // 25 <= p < 50 -> loading_25.svg
  // 50 <= p < 75 -> loading_50.svg
  // 75 <= p < 100 -> loading_75.svg
  // p === 100 -> loading_100.svg
  if (percent >= 100) return "/loading_100.svg";
  if (percent >= 75) return "/loading_75.svg";
  if (percent >= 50) return "/loading_50.svg";
  // percent >= 25 OR <25 default -> loading_25.svg
  return "/loading_25.svg";
}

/* ---------- App ---------- */
export default function App() {
  // inject Microgramma font (assumes /fonts/microgramma.woff2 exists in public)
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
        body { background: #141414; color: #fff; margin: 0; }
        html, body, #root { height: 100%; background: #141414; }
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

  // assets to preload (adjust as needed)
  const assets = [
    "/images/team1.jpg",
    "/images/team2.jpg",
    "/images/team3.jpg",
    "/models/F1.glb",
    "/loading_25.svg",
    "/loading_50.svg",
    "/loading_75.svg",
    "/loading_100.svg",
    "/loading_logo.svg",
  ];
  const totalAssets = assets.length;

  const [loadedCount, setLoadedCount] = useState(0);
  const percent = Math.round((loadedCount / totalAssets) * 100);

  // animate displayed number to avoid jumpiness
  const [displayNumber, setDisplayNumber] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = displayNumber;
    const to = percent;
    const duration = 300;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const val = Math.round(from + (to - from) * t);
      setDisplayNumber(val);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent]);

  // preload routine
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
      // for other assets (e.g. glb)
      fetch(url, { method: "GET" })
        .then((res) => {
          if (!res.ok) throw new Error("fetch failed");
          return res.arrayBuffer();
        })
        .then(() => markLoaded())
        .catch(() => markLoaded());
    });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fullyLoaded = loadedCount >= totalAssets;
  const chosenSvg = chooseLoadingSvg(percent);

  // We don't block scrolling. The hero is full-screen (100vh) so the rest of the content sits below and is visible only when user scrolls past.
  // Hero-local centering: svg and number are centered inside the hero container only.
  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff" }}>
      {/* HERO / title page (100vh) */}
      <section
        aria-label="Title page"
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
        {/* Hero inner container keeps svgs centered and constrained */}
        <div
          style={{
            width: "100%",
            maxWidth: 980,
            padding: "20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          {/* chosen stage svg */}
          <img
            src={chosenSvg}
            alt="loading visual"
            style={{
              width: "min(72vw, 720px)", // always fit inside hero
              maxHeight: "60vh",
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 10px 30px rgba(255,204,0,0.08))",
              transition: "opacity 260ms ease, transform 260ms ease",
            }}
          />

          {/* percentage number (Microgramma bold), hidden when fully loaded */}
          {!fullyLoaded && (
            <div
              style={{
                fontFamily: "Microgramma, sans-serif",
                fontWeight: 700,
                fontSize: "48px",
                color: "#ffcc00",
                letterSpacing: "0.12em",
                marginTop: 6,
              }}
            >
              {displayNumber}
            </div>
          )}

          {/* when fully loaded: hide percent and show loading_logo.svg along with final svg */}
          {fullyLoaded && (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img
                src="/loading_logo.svg"
                alt="logo"
                style={{
                  width: 120,
                  height: "auto",
                  objectFit: "contain",
                  transformOrigin: "center",
                }}
              />
              <img
                src="/loading_100.svg"
                alt="final visual"
                style={{
                  width: "min(40vw, 320px)",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>
          )}
        </div>

        {/* subtle scroll hint */}
        <div
          style={{
            position: "absolute",
            bottom: 18,
            left: "50%",
            transform: "translateX(-50%)",
            color: "#ffcc00",
            fontFamily: "Microgramma, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.12em",
            opacity: fullyLoaded ? 0.95 : 0.25,
            fontSize: 12,
            pointerEvents: "none",
          }}
        >
          SCROLL
        </div>
      </section>

      {/* Main content below the hero */}
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
