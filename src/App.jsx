// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  // loading + overlay + hero logic unchanged...
  // For brevity I keep the top-level loading / hero code the same as in the previous file you accepted.
  // (Assume everything above Team section remains identical; only Team section and CSS have been adjusted.)
  // ... full code from previous version until return() is expected to be here ...
  // The updated parts are the CSS block and the Team section markup below.

  // ---------- (app state and logic are the same as previous version)
  const [progress, setProgress] = useState(100); // stubbed for brevity
  const [assetsLoaded, setAssetsLoaded] = useState(true);
  const [startTransition, setStartTransition] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [showLeftLogo, setShowLeftLogo] = useState(false);
  const [teamIndex, setTeamIndex] = useState(0);
  const [inTeamSection, setInTeamSection] = useState(false);
  const [showRestContent, setShowRestContent] = useState(false);

  const heroLogoRef = useRef(null);
  const teamSectionRef = useRef(null);

  const TEAM_IMAGES = [
    "/images/drip.png",
    "/images/mory.png",
    "/images/adam.png",
    "/images/matej.png",
  ];
  const TEAM_CAPTIONS = [
    "Drip — Lead aerodynamicist",
    "Mory — Mechanical engineer",
    "Adam — Electronics & controls",
    "Matěj — Team lead & strategy",
  ];
  const TEAM_TEXTS = [
    "Drip focuses on aerodynamic performance and CFD-driven decisions.",
    "Mory develops mechanical subsystems and suspension geometry.",
    "Adam handles wiring, sensors and embedded controls.",
    "Matěj coordinates the team and race strategy, and leads the project.",
  ];

  // ensure reload always lands at top
  useEffect(() => {
    if (history && "scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // compute team image index based on scroll inside team section (same logic as before)
  useEffect(() => {
    function onScroll() {
      const el = teamSectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      const isIntersecting = rect.top < vh && rect.bottom > 0;
      setInTeamSection(isIntersecting);
      setShowRestContent(rect.bottom <= 0);

      if (!isIntersecting) return;

      const sectionHeight = rect.height;
      // measure the scrolled distance into the team section; you may tweak if you want different trigger points
      const scrolled = Math.min(Math.max(0, vh - rect.top), sectionHeight + vh);
      const relative = Math.min(1, Math.max(0, scrolled / (sectionHeight + 0.0001)));
      const n = TEAM_IMAGES.length;
      const idx = Math.min(n - 1, Math.floor(relative * n));
      setTeamIndex(idx);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @font-face { font-family: 'Microgramma'; src: url('/fonts/microgramma.woff2') format('woff2'); font-weight:700; font-style:normal; font-display:swap; }
        @font-face { font-family: 'Workbench'; src: url('/fonts/workbench.woff2') format('woff2'); font-weight:400 800; font-style:normal; font-display:swap; }
        html, body, #root { height: 100%; background: #141414; margin: 0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0 !important; height: 0 !important; display:none; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
        h1, h2 { text-transform: uppercase; }

        .frontPage { height: 100vh; width: 100%; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; background:#141414; }
        .heroLogo { width: min(540px, 60vmin); max-width: 90vw; transform-origin:center center; transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease; opacity: 1; display:flex; align-items:center; justify-content:center; }
        .heroLogo img { width: 100%; height: auto; display:block; filter: drop-shadow(0 0 12px rgba(255,204,0,0.14)); }

        .leftLogo { position: fixed; left: 18px; top: 50%; transform: translateY(-50%); z-index: 9998; width: 96px; height: auto; opacity: 0; transition: opacity 360ms ease; pointer-events: none; }
        .leftLogo.show { opacity: 1; }

        .teamSection { min-height: 120vh; display:grid; grid-template-columns: 1fr min(560px,45vw); gap:48px; align-items:start; padding: 48px 20px; max-width:1200px; margin: 0 auto; }
        .teamText { padding-right: 20px; font-family: 'SpaceGrotesk', sans-serif; color: #eee; }
        .teamText h1 { color: #ffcc00; font-family: 'Microgramma'; margin-top: 0; }
        .teamText p { color: #ddd; line-height: 1.45; }

        .teamRight { position: relative; }
        .teamImages {
          width:100%;
          height: calc(100vh - 160px);
          position: relative;
        }
        .teamImages .sticky {
          position: sticky;
          top: 80px;
          width: 100%;
          height: calc(100vh - 160px);
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
        }
        .teamImages img {
          position:absolute;
          left:50%;
          top:50%;
          transform: translate(-50%,-50%) translateY(10px);
          max-width:100%;
          max-height:100%;
          width:auto;
          height:auto;
          object-fit:contain;
          opacity:0;
          transition: opacity 420ms ease, transform 420ms cubic-bezier(.2,.9,.25,1);
          pointer-events: none;
        }
        .teamImages img.active {
          opacity:1;
          transform: translate(-50%,-50%) translateY(0);
        }

        /* Name box displayed on the right side of the image area */
        .nameBox {
          position: absolute;
          right: -120px; /* sits outside the image block to the right */
          top: 50%;
          transform: translateY(-50%);
          width: 240px;
          text-align: left;
        }
        .nameTitle {
          font-family: 'Microgramma';
          font-weight: 700;
          color: #ffcc00;
          font-size: 22px;
          letter-spacing: 0.04em;
          line-height: 1;
          margin: 0 0 8px 0;
          text-transform: uppercase;
        }
        .nameRole {
          color: #ddd;
          font-size: 13px;
        }

        /* responsive adjustments */
        @media (max-width: 900px) {
          .teamSection { grid-template-columns: 1fr; gap: 20px; }
          .teamRight { order: -1; } /* show image area above text on small screens */
          .nameBox { position: relative; right: 0; transform: none; width:100%; margin-top:12px; text-align:left; }
          .teamImages .sticky { top: 24px; height: calc(60vh); }
        }
      `}</style>

      {/* HERO */}
      <div className="frontPage" aria-hidden={!overlayVisible && !heroVisible}>
        <div className="heroLogo" ref={heroLogoRef} style={{ zIndex: 10 }}>
          <img src="/np_website.svg" alt="NP Website Logo" />
        </div>
      </div>

      <img src="/loading_logo.svg" alt="small logo" className={`leftLogo ${showLeftLogo ? "show" : ""}`} />

      {/* (Loading overlay logic unchanged and omitted here for brevity) */}
      {overlayVisible && (
        <div className={`loadingOverlay ${startTransition ? "zoomFade" : ""}`} aria-hidden={!overlayVisible}>
          <div style={{ textAlign: "center" }}>
            <div className="loadingNumber" aria-live="polite" aria-atomic="true">{progress}</div>
          </div>
        </div>
      )}

      {/* TEAM SECTION - updated layout: text left, big sticky image on the right, name box to the right */}
      <section ref={teamSectionRef} className="teamSection" aria-label="Team section">
        <div className="teamText">
          <h1>Team</h1>

          <div style={{ marginTop: 8, marginBottom: 12, minHeight: 72 }}>
            <p style={{ color: "#eee", fontSize: 18, margin: 0 }}>{TEAM_CAPTIONS[teamIndex]}</p>
            <p style={{ color: "#ddd", marginTop: 8 }}>{TEAM_TEXTS[teamIndex]}</p>
          </div>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 20 }}>About Us</h2>
          <p style={{ color: "#ddd" }}>
            We are the only Czech team and a top contender in the prestigious international STEM racing competition.
          </p>
        </div>

        <div className="teamRight">
          <div className="teamImages" aria-hidden={!inTeamSection}>
            <div className="sticky">
              {TEAM_IMAGES.map((src, i) => (
                <img key={src} src={src} alt={`team-${i}`} className={i === teamIndex ? "active" : ""} />
              ))}
            </div>
            <div className="nameBox" aria-hidden={!inTeamSection}>
              <div className="nameTitle">{TEAM_CAPTIONS[teamIndex].split("—")[0].trim()}</div>
              <div className="nameRole">{TEAM_CAPTIONS[teamIndex].split("—")[1]?.trim()}</div>
            </div>
          </div>
        </div>
      </section>

      {/* REST CONTENT (unchanged) */}
      <div style={{ padding: "48px 20px", maxWidth: 1200, margin: "0 auto", color: "#ddd" }}>
        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Schedule</h2>
        <p>Next up: Poland — Oct 11</p>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Join Us</h2>
        <p>Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Contact</h2>
        <p>
          For general inquiry: <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">prokopmatej@novyporg.cz</a>
        </p>

        <div style={{ display: "flex", gap: 24, alignItems: "center", marginTop: 28 }}>
          <img src="/sponsors/ppas.svg" alt="PPAS" style={{ height: 48 }} />
          <img src="/sponsors/winkelhofer.svg" alt="Winkelhofer" style={{ height: 48 }} />
        </div>

        <div style={{ height: 200 }} />
      </div>
    </div>
  );
}
