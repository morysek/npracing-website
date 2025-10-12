// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/*
  Swiss Design update:
  - Headings use Microgramma (local woff2)
  - Body uses Space Grotesk from Google Fonts (injected)
  - Strong left alignment, large negative space, simple grid
  - Accent color retained (#ffcc00)
  - Keeps existing loading/hero/content flow from your last version
*/

export default function App() {
  // loading overlay state
  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [startTransition, setStartTransition] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showLeftLogo, setShowLeftLogo] = useState(false);

  const heroLogoRef = useRef(null);

  const TEAM_IMAGES = [
    "/images/drip.png",
    "/images/mory.png",
    "/images/adam.png",
    "/images/matej.png",
  ];
  const TEAM_CAPTIONS = [
    "DRIP — Lead aerodynamicist",
    "MORY — Mechanical engineer",
    "ADAM — Electronics & controls",
    "MATĚJ — Team lead & strategy",
  ];

  // ensure reload always lands at top
  useEffect(() => {
    if (history && "scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // inject Space Grotesk, preload Microgramma & Workbench fonts
  useEffect(() => {
    // Space Grotesk from Google Fonts
    if (!document.getElementById("__npr_spacegrotesk")) {
      const link = document.createElement("link");
      link.id = "__npr_spacegrotesk";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;600;700&display=swap";
      document.head.appendChild(link);
    }

    // preload and local-face for Microgramma (assumes file at /fonts/microgramma.woff2)
    if (!document.getElementById("__npr_microgramma")) {
      const style = document.createElement("style");
      style.id = "__npr_microgramma";
      style.innerHTML = `
        @font-face {
          font-family: 'Microgramma';
          src: url('/fonts/microgramma.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Workbench';
          src: url('/fonts/workbench.woff2') format('woff2');
          font-weight: 400 800;
          font-style: normal;
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // preload images and fonts then progress
  useEffect(() => {
    let mounted = true;
    let loaded = 0;
    const assets = [
      "/np_website.svg",
      "/loading_logo.svg",
      ...TEAM_IMAGES,
      "/sponsors/ppas.svg",
      "/sponsors/winkelhofer.svg",
    ];
    const total = 1 + assets.length; // include font preloaded marker

    // simulate font load mark
    const markLoaded = () => {
      if (!mounted) return;
      loaded += 1;
      const pct = Math.round((loaded / total) * 100);
      setProgress(pct);
      if (loaded >= total) {
        setAssetsLoaded(true);
        setProgress(100);
      }
    };

    // quick font load attempt
    (async function tryFonts() {
      try {
        if (document.fonts && document.fonts.load) {
          await Promise.all([document.fonts.load("1em Space Grotesk"), document.fonts.load("700 1em Microgramma")]);
        }
      } catch (e) {
        // ignore
      } finally {
        markLoaded();
      }

      assets.forEach((src) => {
        const img = new Image();
        img.onload = () => markLoaded();
        img.onerror = () => markLoaded();
        img.src = src;
      });
    })();

    const fallback = setInterval(() => {
      setProgress((p) => Math.min(98, p + Math.ceil(Math.random() * 2)));
    }, 200);

    return () => {
      mounted = false;
      clearInterval(fallback);
    };
  }, []);

  // transition overlay -> hero
  useEffect(() => {
    if (!assetsLoaded) return;
    const delayBeforeTransition = 120;
    const t = setTimeout(() => {
      setStartTransition(true);
      const transitionMs = 700;
      setTimeout(() => {
        setHeroVisible(true);
        setTimeout(() => setOverlayVisible(false), 140);
      }, transitionMs);
    }, delayBeforeTransition);
    return () => clearTimeout(t);
  }, [assetsLoaded]);

  // disable scrolling while overlay visible
  useEffect(() => {
    document.body.style.overflow = overlayVisible ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [overlayVisible]);

  // show left small logo when hero scrolled past
  useEffect(() => {
    function checkHeroRect() {
      const el = heroLogoRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setShowLeftLogo(rect.bottom < 0);
    }
    window.addEventListener("scroll", checkHeroRect, { passive: true });
    window.addEventListener("resize", checkHeroRect);
    checkHeroRect();
    return () => {
      window.removeEventListener("scroll", checkHeroRect);
      window.removeEventListener("resize", checkHeroRect);
    };
  }, [heroVisible, overlayVisible]);

  const canvasWrapperStyle = {
    position: "relative",
    zIndex: 2,
    width: "100%",
  };

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflowX: "hidden", fontFamily: "'Space Grotesk', 'Workbench', system-ui, sans-serif" }}>
      <style>{`
        /* Swiss design: strong grid, left aligned headings, big whitespace */
        html, body, #root { height: 100%; background: #141414; margin: 0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0 !important; height: 0 !important; display:none; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }

        :root {
          --accent: #ffcc00;
          --bg: #141414;
          --muted: #cfcfcf;
          --maxWidth: 1200px;
          --gutter: 28px;
        }

        /* Front / Hero styles */
        .frontPage { height: 100vh; width: 100%; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; background: var(--bg); }
        .heroInner { width: 100%; max-width: var(--maxWidth); padding: 0 var(--gutter); display:grid; grid-template-columns: 1fr 420px; gap: 48px; align-items:center; }
        .heroLeft { align-self:center; padding-left: 6vw; }
        .heroRight { display:flex; align-items:center; justify-content:center; }
        .heroTitle { font-family: 'Microgramma', 'Space Grotesk', sans-serif; color: var(--accent); font-weight:700; font-size:48px; letter-spacing: 0.06em; margin:0 0 12px 0; text-transform: uppercase; text-align:left; }
        .heroSubtitle { font-family:'Space Grotesk', sans-serif; color: #e6e6e6; font-size:18px; margin:0; line-height:1.35; max-width: 520px; }

        .heroLogo { width: min(420px, 44vmin); max-width: 90%; transform-origin:center center; transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease; display:flex; align-items:center; justify-content:center; }
        .heroLogo img { width: 100%; height: auto; display:block; filter: drop-shadow(0 12px 36px rgba(0,0,0,0.6)) drop-shadow(0 0 12px rgba(255,204,0,0.06)); }

        /* left small logo fade */
        .leftLogo { position: fixed; left: 18px; top: 50%; transform: translateY(-50%); z-index: 9998; width: 96px; height: auto; opacity: 0; transition: opacity 360ms ease; pointer-events: none; }
        .leftLogo.show { opacity: 1; }

        /* Loading overlay */
        .loadingOverlay { position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; z-index:99999; background: var(--bg); pointer-events: all; transform-origin: 50% 50%; }
        .loadingOverlay.zoomFade { transition: transform 700ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease; transform: scale(2.8); opacity: 0; pointer-events: none; }
        .loadingNumber { font-family: 'Microgramma', 'Space Grotesk', sans-serif; font-weight: 700; font-size: 88px; color: var(--accent); line-height:1; user-select: none; letter-spacing:0.04em; }

        /* Swiss grid for Team and content */
        .contentWrapper { max-width: var(--maxWidth); margin: 0 auto; padding: 36px var(--gutter); display: grid; grid-template-columns: 220px 1fr 320px; gap: 32px; align-items:start; }
        .teamTitle { grid-column: 1 / 2; align-self:start; }
        .teamTitle h1 { font-family: 'Microgramma'; color: var(--accent); margin: 0 0 6px 0; font-size: 28px; letter-spacing: 0.06em; text-transform: uppercase; }
        .teamImagesRow { grid-column: 2 / 3; display:flex; gap: 18px; justify-content:center; flex-wrap:wrap; }
        .teamRight { grid-column: 3 / 4; color: var(--muted); font-family: 'Space Grotesk', sans-serif; line-height:1.45; }

        .imageCard { width: calc(25% - 18px); min-width: 140px; max-width: 220px; text-align:center; }
        .imageCard img { width:100%; height:auto; display:block; border-radius:6px; object-fit:cover; box-shadow: 0 8px 28px rgba(0,0,0,0.6); }
        .imageCaption { margin-top: 8px; color:#fff; font-family:'Microgramma'; font-size:13px; letter-spacing:0.04em; }

        @media (max-width: 1100px) {
          .heroInner { grid-template-columns: 1fr; text-align: center; padding: 0 20px; gap: 20px; }
          .heroLeft { padding-left: 0; order:2; }
          .heroRight { order:1; }
          .contentWrapper { grid-template-columns: 1fr; }
          .teamTitle { grid-column: 1 / -1; text-align:left; margin-bottom: 12px; }
          .teamImagesRow { justify-content: center; grid-column: 1 / -1; }
          .teamRight { grid-column: 1 / -1; }
          .imageCard { width: 48%; }
        }

        @media (max-width: 600px) {
          .loadingNumber { font-size: 56px; }
          .heroTitle { font-size: 32px; }
        }
      `}</style>

      {/* FRONT / HERO */}
      <div className="frontPage" aria-hidden={!overlayVisible && !heroVisible}>
        <div className="heroInner" style={{ opacity: heroVisible ? 1 : 0, transition: "opacity 420ms ease" }}>
          <div className="heroLeft">
            <div style={{ maxWidth: 680 }}>
              <h1 className="heroTitle">NP RACING</h1>
              <p className="heroSubtitle">
                Swiss-inspired visual system — rational grid, bold typography and clear hierarchy. This site showcases the team, schedule and partners.
              </p>
            </div>
          </div>

          <div className="heroRight">
            <div
              className="heroLogo"
              ref={heroLogoRef}
              style={{
                transform: heroVisible ? "scale(1)" : "scale(0.95)",
                opacity: heroVisible ? 1 : 0,
                transitionDelay: heroVisible ? "80ms" : "0ms",
              }}
            >
              <img src="/np_website.svg" alt="NP Website Logo" />
            </div>
          </div>
        </div>
      </div>

      {/* left small logo (fade) */}
      <img src="/loading_logo.svg" alt="small logo" className={`leftLogo ${showLeftLogo ? "show" : ""}`} />

      {/* Loading overlay */}
      {overlayVisible && (
        <div className={`loadingOverlay ${startTransition ? "zoomFade" : ""}`} aria-hidden={!overlayVisible}>
          <div style={{ textAlign: "center" }}>
            <div className="loadingNumber" aria-live="polite" aria-atomic="true">
              {progress}
            </div>
          </div>
        </div>
      )}

      {/* main content below hero */}
      <div style={canvasWrapperStyle}>
        <div className="contentWrapper" role="main" aria-label="Main content">
          <div className="teamTitle" aria-labelledby="team-heading">
            <h1 id="team-heading">Team</h1>
          </div>

          <div className="teamImagesRow" role="list">
            {TEAM_IMAGES.map((src, i) => (
              <div className="imageCard" key={src} role="listitem">
                <img src={src} alt={`team-${i}`} />
                <div className="imageCaption">{TEAM_CAPTIONS[i]}</div>
              </div>
            ))}
          </div>

          <div className="teamRight">
            <h2 style={{ color: "var(--accent)", fontFamily: "Microgramma", marginTop: 0 }}>About Us</h2>
            <p>We are the only Czech team and a top contender in the prestigious international STEM racing competition.</p>
            <p>We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.</p>
            <p>Founded at Nový PORG, NP Racing unites skills in engineering, manufacturing, and marketing.</p>
            <p>We collaborate with partners like the Czech Technical University to enhance our expertise.</p>
          </div>
        </div>

        {/* REST CONTENT — still Swiss grid feel */}
        <div style={{ maxWidth: "var(--maxWidth)", margin: "40px auto", padding: "0 var(--gutter)" }}>
          <h2 style={{ color: "var(--accent)", fontFamily: "Microgramma" }}>Schedule</h2>
          <p>Next up: Poland — Oct 11</p>

          <h2 style={{ color: "var(--accent)", fontFamily: "Microgramma", marginTop: 24 }}>Join Us</h2>
          <p>Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>

          <h2 style={{ color: "var(--accent)", fontFamily: "Microgramma", marginTop: 24 }}>Contact</h2>
          <p>
            For general inquiry:{" "}
            <a style={{ color: "var(--accent)" }} href="mailto:prokopmatej@novyporg.cz">
              prokopmatej@novyporg.cz
            </a>
          </p>

          <div style={{ marginTop: 36 }} className="partners" aria-label="Partners">
            <img src="/sponsors/ppas.svg" alt="PPAS" style={{ height: 56, marginRight: 18 }} />
            <img src="/sponsors/winkelhofer.svg" alt="Winkelhofer" style={{ height: 56 }} />
          </div>

          <div style={{ height: 120 }} />
        </div>
      </div>
    </div>
  );
}
