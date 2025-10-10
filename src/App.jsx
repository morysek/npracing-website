// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Requirements implemented:
 * - fonts loaded first (FontFace API)
 * - loading screen shows appropriate /loading_*.svg based on progress ranges
 * - percentage number (no % sign) centered in Microgramma Bold, color #ffcc00
 * - loading_logo.svg also centered and on top (always on top of everything)
 * - removed 3D canvas and logo contraction animation
 * - front/title page occupies full viewport; main content sits below and is not visible until user scrolls past the front page
 * - scroll bar visually hidden
 */

/* helpers */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export default function App() {
  // font + assets states
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const totalAssets = 3; // team images only (fonts counted separately and loaded first)
  const progress = Math.round((loadedCount / totalAssets) * 100);

  // overall "assets loaded" (images)
  const assetsLoaded = loadedCount >= totalAssets;

  // whether the front (title) page was scrolled past
  const [introComplete, setIntroComplete] = useState(false);

  // load fonts first using FontFace API
  useEffect(() => {
    let mounted = true;
    async function loadFonts() {
      try {
        const micro = new FontFace("Microgramma", "url(/fonts/microgramma.woff2)", { weight: "700", style: "normal" });
        const zal = new FontFace("ZalandoSans", "url(/fonts/zalando-sans-expanded.woff2)", { weight: "400", style: "normal" });

        // start loading
        const [m, z] = await Promise.all([micro.load(), zal.load()]);

        // register
        if (mounted) {
          document.fonts.add(m);
          document.fonts.add(z);
          // ensure fonts are considered loaded by the browser's FontFaceSet
          await document.fonts.ready;
          setFontsLoaded(true);
        }
      } catch (e) {
        // if fonts fail, still continue so page doesn't hang forever
        console.warn("Font loading failed:", e);
        if (mounted) setFontsLoaded(true);
      }
    }
    loadFonts();
    return () => (mounted = false);
  }, []);

  // after fontsLoaded, preload images (team1..3)
  useEffect(() => {
    if (!fontsLoaded) return;
    let mounted = true;
    const imgs = ["/images/team1.jpg", "/images/team2.jpg", "/images/team3.jpg"];
    imgs.forEach((src) => {
      const im = new Image();
      im.onload = () => mounted && setLoadedCount((c) => c + 1);
      im.onerror = () => mounted && setLoadedCount((c) => c + 1);
      im.src = src;
    });
    return () => (mounted = false);
  }, [fontsLoaded]);

  // when assets are loaded, allow scrolling (before that body overflow hidden)
  useEffect(() => {
    document.body.style.background = "#141414";
    document.body.style.margin = "0";
    // visually hide scrollbars
    document.body.style.overflow = assetsLoaded ? "auto" : "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [assetsLoaded]);

  // listen for scroll to detect when user has scrolled past the front/title full viewport
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY >= window.innerHeight - 10) setIntroComplete(true);
      else setIntroComplete(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // also check on load/resize
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // pick the loading svg based on progress ranges
  const pickLoadingSvg = (p) => {
    if (p >= 100) return "/loading_100.svg";
    if (p >= 75) return "/loading_75.svg";
    if (p >= 50) return "/loading_50.svg";
    if (p >= 25) return "/loading_25.svg";
    return "/loading_25.svg";
  };

  // Styles (kept inline for drop-in usage)
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    display: introComplete ? "none" : "flex", // hide entire overlay when front page scrolled past
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    background: "#141414",
    pointerEvents: "none", // let user interact with page once scrolling allowed; overlay is visual only
  };

  const centerStack = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    pointerEvents: "none", // never block interactions
  };

  const percentStyle = {
    fontFamily: "Microgramma, sans-serif",
    fontWeight: 700,
    color: "#ffcc00",
    fontSize: 64,
    lineHeight: 1,
    marginTop: 4,
    textAlign: "center",
    userSelect: "none",
    // keep on top visually
    zIndex: 100000,
    textRendering: "geometricPrecision",
  };

  const loadingLogoStyle = {
    width: 160,
    height: "auto",
    userSelect: "none",
    zIndex: 100001,
  };

  // Title/front page content that sits behind overlay; full viewport
  const titlePage = (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#141414",
      }}
    >
      {/* keep a centered decorative logo (npbasic.svg) but we intentionally DO NOT animate it.
          overlay above will hold the loading svgs and percentage on top. */}
      <img src="/npbasic.svg" alt="NP" style={{ width: 360, height: "auto", pointerEvents: "none" }} />
    </div>
  );

  // main content (below title page) — kept consistent with previous content snippets (titles Microgramma, text Zalando)
  const mainContent = (
    <div style={{ background: "#141414", color: "#fff" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: 28 }}>
        <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Team</h1>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <p style={{ fontFamily: "ZalandoSans", color: "#fff" }}>The Team</p>
            <ul style={{ fontFamily: "ZalandoSans", color: "#fff" }}>
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

        <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 20 }}>About Us</h1>
        <div>
          <p style={{ fontFamily: "ZalandoSans" }}>We are the only Czech team and a top contender in the prestigious international STEM racing competition.</p>
          <p style={{ fontFamily: "ZalandoSans" }}>We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.</p>
          <p style={{ fontFamily: "ZalandoSans" }}>Founded at Nový PORG, a prestigious school, NP Racing unites skills in engineering, manufacturing, and marketing.</p>
          <p style={{ fontFamily: "ZalandoSans" }}>We collaborate with partners like the Czech Technical University to enhance our expertise.</p>
        </div>

        <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 28 }}>Schedule</h1>
        <p style={{ fontFamily: "ZalandoSans" }}>Next up: Poland — Oct 11</p>

        <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 28 }}>Join Us</h1>
        <p style={{ fontFamily: "ZalandoSans" }}>Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>

        <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 28 }}>Contact</h1>
        <p style={{ fontFamily: "ZalandoSans" }}>
          For general inquiry: <a href="mailto:prokopmatej@novyporg.cz" style={{ color: "#ffcc00" }}>prokopmatej@novyporg.cz</a>
        </p>
      </div>
      <div style={{ height: 200 }} />
    </div>
  );

  // the picture svg shown based on progress (behind the persistent logo+number)
  const loadingSvg = pickLoadingSvg(progress);

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#141414" }}>
      {/* visually hide native scrollbar while preserving scroll mechanics */}
      <style>{`
        ::-webkit-scrollbar { width: 0; height: 0; }
        html,body,#root { height: 100%; background: #141414; }
      `}</style>

      {/* FRONT/TITLE PAGE */}
      {titlePage}

      {/* LOADER OVERLAY (centered; top-most). Remains until user scrolls past the front page (introComplete). */}
      <div style={overlayStyle} aria-hidden={introComplete}>
        <div style={centerStack}>
          {/* dynamic SVG (progress-based) */}
          <img
            src={loadingSvg}
            alt="loading progress"
            style={{ maxWidth: "60vw", height: "auto", display: "block", pointerEvents: "none" }}
          />

          {/* loading_logo.svg ALWAYS centered on top as requested */}
          <img src="/loading_logo.svg" alt="loading logo" style={loadingLogoStyle} />

          {/* percentage number (no percent sign) - stays in the middle and above the progress svgs */}
          <div style={percentStyle}>{String(progress)}</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      {!titlePage ? null : null}
      {/* content sits below the title area; user scrolls past the front page to reach it */}
      <div style={{ marginTop: 0 }}>{mainContent}</div>
    </div>
  );
}
