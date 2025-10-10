// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/* ---------- small content components (from your earlier code) ---------- */
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

/* ---------- Loading+Hero logic ---------- */
function chooseLoadingSvg(percent) {
  // percent is 0..100
  if (percent >= 100) return "/public/loading_100.svg";
  if (percent >= 75) return "/public/loading_75.svg";
  if (percent >= 50) return "/public/loading_50.svg";
  if (percent >= 25) return "/public/loading_25.svg";
  // default placeholder before 25%
  return "/public/loading_25.svg";
}

export default function App() {
  // fonts: inject Microgramma
  useEffect(() => {
    const id = "__microgramma_font";
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
        html,body,#root { height: 100%; background: #141414; }
        body { margin: 0; background: #141414; color: #fff; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
        /* small zig-zag class from earlier */
        .zig { text-align: left; margin: 8px 0; font-family: 'ZalandoSans', Inter, sans-serif; line-height:1.35; max-width: 900px; }
        @media (min-width: 900px) {
          .zig:nth-of-type(odd) { transform: translateX(-6%); }
          .zig:nth-of-type(even) { transform: translateX(6%); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // assets to preload (images + glb)
  const assets = [
    "/images/team1.jpg",
    "/images/team2.jpg",
    "/images/team3.jpg",
    "/models/F1.glb" // we just fetch it to count as loaded; user previously had .glb
  ];
  const totalAssets = assets.length;

  const [loadedCount, setLoadedCount] = useState(0);
  const percent = Math.round((loadedCount / totalAssets) * 100);

  // animated display number that counts up smoothly to percent
  const [displayNumber, setDisplayNumber] = useState(0);
  const displayNumberRef = useRef(displayNumber);
  displayNumberRef.current = displayNumber;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = displayNumberRef.current;
    const to = percent;
    const duration = 350; // ms for each update
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const val = Math.round(from + (to - from) * t);
      setDisplayNumber(val);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [percent]);

  // preload routine
  useEffect(() => {
    let mounted = true;
    let localLoaded = 0;

    // helper to increment safely
    const markLoaded = () => {
      if (!mounted) return;
      localLoaded++;
      setLoadedCount((c) => c + 1);
    };

    // preload images
    assets.forEach((url) => {
      if (url.match(/\.(jpe?g|png|webp|svg)$/i)) {
        const img = new Image();
        img.onload = markLoaded;
        img.onerror = markLoaded;
        img.src = url;
        return;
      }
      // fallback: fetch other assets (e.g. .glb) as arrayBuffer
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
  }, []); // only once

  const fullyLoaded = loadedCount >= totalAssets;

  // hero full-screen: before and after load the hero occupies the viewport
  // while not fullyLoaded we block scroll; once fullyLoaded we allow scrolling and
  // hide the percentage text, showing loading_logo with final SVG instead.
  useEffect(() => {
    if (!fullyLoaded) {
      document.body.style.overflow = "hidden";
    } else {
      // allow scroll after loaded. The user specified the rest of the site should be below this full-screen front page.
      document.body.style.overflow = "auto";
    }
  }, [fullyLoaded]);

  // which svg to show (main one)
  const mainSvg = chooseLoadingSvg(percent);

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff" }}>
      {/* Full-screen title/hero */}
      <section
        aria-label="Title page"
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* center container */}
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            padding: 20,
            width: "100%",
            maxWidth: 980,
          }}
        >
          {/* dynamic main SVG (changes with progress) */}
          <img
            src={mainSvg}
            alt="loading visual"
            style={{
              maxWidth: "60vw",
              width: 480,
              height: "auto",
              filter: "drop-shadow(0 10px 30px rgba(255,204,0,0.12))",
              transition: "opacity 360ms ease, transform 360ms ease"
            }}
          />

          {/* percentage text (Microgramma bold). Hidden once fully loaded. */}
          {!fullyLoaded && (
            <div
              aria-hidden={false}
              style={{
                fontFamily: "Microgramma, sans-serif",
                fontWeight: 700,
                fontSize: 48,
                color: "#ffffff",
                letterSpacing: "0.12em",
                marginTop: 6,
                transition: "opacity 300ms ease",
              }}
            >
              {displayNumber}%
            </div>
          )}

          {/* once fully loaded: hide percentage and show loading_logo.svg alongside the final SVG */}
          {fullyLoaded && (
            <div
              style={{
                display: "flex",
                gap: 18,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 6,
                transition: "opacity 360ms ease",
              }}
            >
              <img
                src="/public/loading_logo.svg"
                alt="logo"
                style={{
                  width: 120,
                  height: "auto",
                  transformOrigin: "center",
                }}
              />
              {/* also keep the final 100% svg visible */}
              <img
                src="/public/loading_100.svg"
                alt="final visual"
                style={{
                  width: 200,
                  height: "auto",
                  opacity: 1,
                }}
              />
            </div>
          )}
        </div>

        {/* small instruction arrow/chevron to show there's more content below (only after fully loaded) */}
        {fullyLoaded && (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              color: "#ffcc00",
              fontFamily: "Microgramma, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.12em",
              opacity: 0.9,
              fontSize: 12,
            }}
          >
            SCROLL
          </div>
        )}
      </section>

      {/* ===== Main content below the full-screen title page ===== */}
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
