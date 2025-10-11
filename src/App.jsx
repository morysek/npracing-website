// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  // Loading / assets
  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [startTransition, setStartTransition] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  // Team image/text sequencing
  const TEAM_IMAGES = ["/images/drip.png", "/images/mory.png", "/images/adam.png", "/images/matej.png"];
  const TEAM_NAMES = ["DRIP", "MORY", "ADAM", "MATĚJ"];
  const TEAM_BIOS = [
    "Lead aerodynamicist — Drip focuses on CFD, aero surfaces and wing tuning.",
    "Mechanical engineer — Mory works on suspension, kinematics and parts design.",
    "Electronics & controls — Adam handles sensors, boards and embedded systems.",
    "Team lead & strategy — Matěj coordinates the project, partners and race day plans.",
  ];

  const [teamIndex, setTeamIndex] = useState(0);
  const teamTextRef = useRef(null);
  const teamSectionRef = useRef(null);

  // ensure reload always lands at top
  useEffect(() => {
    if (history && "scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // fonts: Workbench for loader, Microgramma for headings, SpaceGrotesk for body
  useEffect(() => {
    const id = "__npr_fonts";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.innerHTML = `
        @font-face { font-family: 'Workbench'; src: url('/fonts/workbench.woff2') format('woff2'); font-weight:700; font-style:normal; font-display:swap; }
        @font-face { font-family: 'Microgramma'; src: url('/fonts/microgramma.woff2') format('woff2'); font-weight:700; font-style:normal; font-display:swap; }
        @font-face { font-family: 'SpaceGrotesk'; src: url('/fonts/spacegrotesk.woff2') format('woff2'); font-weight:400; font-style:normal; font-display:swap; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // preload images & sponsors & hero logo (so loader can count)
  useEffect(() => {
    const assets = [
      "/np_website.svg",
      "/loading_logo.svg",
      "/team.svg",
      ...TEAM_IMAGES,
      "/sponsors/ppas.svg",
      "/sponsors/winkelhofer.svg",
    ];
    let loaded = 0;
    let mounted = true;

    const inc = () => {
      loaded += 1;
      if (!mounted) return;
      const p = Math.round((loaded / assets.length) * 100);
      setProgress(p);
      if (loaded >= assets.length) {
        setAssetsLoaded(true);
        setProgress(100);
      }
    };

    assets.forEach((src) => {
      const img = new Image();
      img.onload = inc;
      img.onerror = inc;
      img.src = src;
    });

    // fallback slow progress to avoid freezing at 0
    const fallback = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + 1;
      });
    }, 120);

    return () => {
      mounted = false;
      clearInterval(fallback);
    };
  }, []);

  // orchestrate overlay -> hero transition
  useEffect(() => {
    if (!assetsLoaded) return;
    // short delay then transition
    const delay = 200;
    const t1 = setTimeout(() => {
      setStartTransition(true);
      // after zoom/fade of overlay, reveal hero and remove overlay
      const transitionOut = 700;
      setTimeout(() => {
        setHeroVisible(true);
        setTimeout(() => setOverlayVisible(false), 120);
      }, transitionOut);
    }, delay);
    return () => clearTimeout(t1);
  }, [assetsLoaded]);

  // Disable scrolling while overlay is visible
  useEffect(() => {
    document.body.style.overflow = overlayVisible ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [overlayVisible]);

  // Team logic: use scroll position of the *page* (not inner scroll) to compute which team member is active.
  useEffect(() => {
    function onScroll() {
      const el = teamSectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Only compute if section intersects viewport
      if (rect.top < vh && rect.bottom > 0) {
        // distance scrolled through section normalized 0..1
        // We'll use the middle of the viewport as trigger line
        const total = rect.height + vh;
        const scrolled = Math.min(Math.max(0, vh - rect.top), total);
        const relative = Math.min(1, Math.max(0, scrolled / (total)));
        const idx = Math.min(TEAM_IMAGES.length - 1, Math.floor(relative * TEAM_IMAGES.length));
        setTeamIndex(idx);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // small helper to jump down from hero
  const jumpToContent = () => window.scrollTo({ top: window.innerHeight, behavior: "smooth" });

  return (
    <div style={{ minHeight: "100vh", background: "#141414", color: "#fff", fontFamily: "SpaceGrotesk, sans-serif" }}>
      <style>{`
        html, body, #root { height: 100%; margin:0; background: #141414; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }

        /* Hero / front page */
        .front {
          height: 100vh;
          width: 100%;
          display:flex;
          align-items:center;
          justify-content:center;
          position:relative;
          overflow:hidden;
          background: #141414;
        }
        .heroBox {
          display:flex;
          align-items:center;
          justify-content:center;
          width: min(640px, 70vmin);
          max-width: 92vw;
          transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease;
        }
        .heroBox img { width:100%; height:auto; display:block; filter: drop-shadow(0 8px 24px rgba(255,204,0,0.08)); }

        /* Loading overlay */
        .loaderOverlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display:flex;
          align-items:center;
          justify-content:center;
          pointer-events: all;
          background: #141414;
          transition: transform 700ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease;
          transform-origin: 50% 50%;
        }
        .loaderOverlay.zoomOut {
          transform: scale(2.6);
          opacity: 0;
          pointer-events: none;
        }
        .loaderNumber {
          font-family: 'Workbench', sans-serif;
          font-weight: 700;
          color: #ffcc00;
          font-size: clamp(36px, 8vw, 96px);
          line-height: 1;
          user-select: none;
        }

        /* box sections */
        .sectionBox {
          max-width: 1200px;
          margin: 28px auto;
          padding: 28px;
          border-radius: 8px;
          background: rgba(20,20,24,0.6);
          border: 1px solid rgba(255,204,0,0.06);
          box-shadow: 0 6px 30px rgba(0,0,0,0.6), 0 0 18px rgba(255,204,0,0.02) inset;
        }
        .sectionTitle {
          font-family: 'Microgramma', sans-serif;
          color: #ffcc00;
          letter-spacing: 0.08em;
          font-weight: 700;
          text-transform: uppercase;
          margin: 0 0 12px 0;
        }

        /* Team layout: left scrollable text, right sticky images + team.svg */
        .teamWrap {
          display: grid;
          grid-template-columns: 1fr 520px;
          gap: 28px;
          align-items: start;
        }
        @media (max-width: 980px) {
          .teamWrap { grid-template-columns: 1fr; }
        }

        .teamLeft {
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          padding-right: 8px;
        }

        /* each member card is tall to encourage scrolling within section */
        .memberCard {
          padding: 18px 8px;
          border-radius: 6px;
          margin-bottom: 18px;
          background: rgba(255,255,255,0.02);
          transition: transform 260ms ease, background 260ms ease;
        }
        .memberCard.active {
          background: rgba(255,204,0,0.03);
          transform: translateX(2px);
        }
        .memberTitle {
          font-family: 'Microgramma', sans-serif;
          color: #ffcc00;
          text-transform: uppercase;
          font-weight:700;
          margin: 0 0 8px 0;
          letter-spacing: 0.06em;
        }

        .memberText { color: #ddd; line-height:1.45; margin:0; }

        .teamRight {
          position: relative;
          min-height: 420px;
        }

        .teamGraphic {
          position: sticky;
          top: 80px;
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 12px;
          pointer-events: none;
        }
        .teamGraphic img.graph { width: 220px; max-width: 46%; display:block; margin-bottom: 14px; opacity: 0.95; filter: drop-shadow(0 10px 30px rgba(255,204,0,0.06)); }

        .teamPhotoStack {
          position: relative;
          width: 100%;
          height: calc(60vh);
          max-height: 640px;
          margin-top: 6px;
        }
        .teamPhotoStack img {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%) translateY(12px);
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          opacity: 0;
          transition: opacity 460ms ease, transform 460ms cubic-bezier(.2,.9,.25,1);
          border-radius: 6px;
          box-shadow: 0 12px 44px rgba(0,0,0,0.6);
        }
        .teamPhotoStack img.active {
          opacity: 1;
          transform: translate(-50%,-50%) translateY(0);
        }

        /* Partners logos row */
        .partnersRow {
          display:flex;
          gap: 24px;
          align-items:center;
          justify-content:flex-start;
          flex-wrap:wrap;
        }
        .partnersRow img {
          width: 160px;
          height: auto;
          opacity: 0.98;
          filter: drop-shadow(0 6px 20px rgba(255,204,0,0.04));
          background: rgba(255,255,255,0.01);
          padding: 10px;
          border-radius: 6px;
        }
      `}</style>

      {/* FRONT / HERO (centered logo) */}
      <div className="front" aria-hidden={!overlayVisible && !heroVisible}>
        <div
          className="heroBox"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "scale(1)" : "scale(0.96)",
            transitionDelay: heroVisible ? "100ms" : "0ms",
          }}
        >
          <img src="/np_website.svg" alt="NP Website Logo" />
        </div>
      </div>

      {/* LOADING overlay */}
      {overlayVisible && (
        <div className={`loaderOverlay ${startTransition ? "zoomOut" : ""}`} style={{ zIndex: 99999 }}>
          <div style={{ textAlign: "center" }}>
            <div className="loaderNumber" aria-live="polite" aria-atomic="true">
              {progress}
            </div>
          </div>
        </div>
      )}

      {/* MAIN PAGE CONTENT - each section inside .sectionBox */}
      <main style={{ paddingTop: 18 }}>
        {/* TEAM */}
        <section ref={teamSectionRef} className="sectionBox" aria-label="Team">
          <h2 className="sectionTitle">TEAM</h2>
          <div className="teamWrap">
            {/* Left: scrollable member text */}
            <div className="teamLeft" ref={teamTextRef}>
              {TEAM_NAMES.map((name, i) => (
                <div className={`memberCard ${i === teamIndex ? "active" : ""}`} key={name}>
                  <div className="memberTitle">{name}</div>
                  <p className="memberText">{TEAM_BIOS[i]}</p>
                </div>
              ))}
            </div>

            {/* Right: sticky graphic + photos that fade in/out */}
            <div className="teamRight">
              <div className="teamGraphic">
                <img src="/team.svg" className="graph" alt="team graphic" />
              </div>

              <div className="teamPhotoStack" aria-hidden={false}>
                {TEAM_IMAGES.map((src, i) => (
                  <img key={src} src={src} alt={`team-${i}`} className={i === teamIndex ? "active" : ""} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT (keeps it boxed) */}
        <section className="sectionBox">
          <h2 className="sectionTitle">ABOUT US</h2>
          <p style={{ color: "#ddd", marginTop: 6 }}>
            We are the only Czech team and a top contender in the prestigious international STEM racing competition.
          </p>
          <p style={{ color: "#ddd" }}>
            We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.
          </p>
        </section>

        {/* SCHEDULE */}
        <section className="sectionBox">
          <h2 className="sectionTitle">SCHEDULE</h2>
          <p style={{ color: "#ddd" }}>NEXT UP: POLAND — OCT 11</p>
        </section>

        {/* JOIN US */}
        <section className="sectionBox">
          <h2 className="sectionTitle">JOIN US</h2>
          <p style={{ color: "#ddd" }}>
            Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact
            us!
          </p>
        </section>

        {/* CONTACT */}
        <section className="sectionBox">
          <h2 className="sectionTitle">CONTACT</h2>
          <p style={{ color: "#ddd" }}>
            For general inquiry:{" "}
            <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">
              prokopmatej@novyporg.cz
            </a>
          </p>
        </section>

        {/* PARTNERS */}
        <section className="sectionBox">
          <h2 className="sectionTitle">PARTNERS</h2>
          <div className="partnersRow" style={{ marginTop: 12 }}>
            <img src="/sponsors/ppas.svg" alt="PPAS" />
            <img src="/sponsors/winkelhofer.svg" alt="Winkelhofer" />
          </div>
        </section>

        <div style={{ height: 120 }} />
      </main>
    </div>
  );
}
