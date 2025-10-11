// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  // loading overlay state
  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [startTransition, setStartTransition] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);

  // left logo fade state
  const [showLeftLogo, setShowLeftLogo] = useState(false);

  // team scroll-driven image index
  const [teamIndex, setTeamIndex] = useState(0);
  const [inTeamSection, setInTeamSection] = useState(false);
  const [showRestContent, setShowRestContent] = useState(false);

  const heroLogoRef = useRef(null);
  const teamSectionRef = useRef(null);

  // assets for the team image sequence and captions
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

  // ensure reload always lands at top
  useEffect(() => {
    if (history && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // include material icons for the arrow (if not already injected)
  useEffect(() => {
    const id = "__material_symbols_link";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Preload Workbench font first, then preload all assets and update progress.
  useEffect(() => {
    let mounted = true;
    let loaded = 0;
    // all assets that should be counted by loader
    const sponsors = ["/sponsors/ppas.svg", "/sponsors/winkelhofer.svg"];
    const assets = [
      "/np_website.svg",
      "/loading_logo.svg",
      ...TEAM_IMAGES,
      ...sponsors.map((p) => `/public/sponsors/${p.replace(/^\/?sponsors\//, "")}`), // just to ensure we attempt to load from /public/sponsors
    ];

    const totalCount = 1 + assets.length; // 1 for Workbench font preload + all assets

    // inject preload link for Workbench to head (high priority)
    if (!document.getElementById("__preload_workbench")) {
      const preload = document.createElement("link");
      preload.id = "__preload_workbench";
      preload.rel = "preload";
      preload.as = "font";
      preload.href = "/fonts/workbench.woff2";
      preload.type = "font/woff2";
      preload.crossOrigin = "anonymous";
      document.head.appendChild(preload);
    }

    // inject @font-face for Workbench (used by loading overlay)
    if (!document.getElementById("__workbench_font_style")) {
      const style = document.createElement("style");
      style.id = "__workbench_font_style";
      style.innerHTML = `
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

    // helper to mark progress
    const markLoaded = () => {
      if (!mounted) return;
      loaded += 1;
      const pct = Math.round((loaded / totalCount) * 100);
      setProgress(pct);
      if (loaded >= totalCount) {
        setAssetsLoaded(true);
        setProgress(100);
      }
    };

    // load the font via Font Loading API (if available) to ensure it's counted first
    (async function loadFontFirst() {
      try {
        if (document.fonts && document.fonts.load) {
          // request several variants to be safe
          await Promise.all([
            document.fonts.load("1em Workbench"),
            document.fonts.load("700 1em Workbench"),
          ]);
        } else {
          // fallback: small delay to let preload kick in
          await new Promise((r) => setTimeout(r, 150));
        }
      } catch (e) {
        // ignore font load errors, still mark as loaded so progress continues
      } finally {
        markLoaded(); // count the font as loaded
      }

      // now preload remaining assets (images & svgs)
      assets.forEach((src) => {
        // ensure we try to load sponsor assets from /sponsors/ path
        const trySrc = src.startsWith("/") ? src : `/${src}`;
        const img = new Image();
        img.onload = () => markLoaded();
        img.onerror = () => markLoaded();
        img.src = trySrc;
      });
    })();

    // fallback heartbeat so progress doesn't stall (will be capped by assetsLoaded)
    const fallback = setInterval(() => {
      setProgress((p) => Math.min(98, p + Math.ceil(Math.random() * 2)));
    }, 200);

    return () => {
      mounted = false;
      clearInterval(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when assets ready -> run transition
  useEffect(() => {
    if (!assetsLoaded) return;
    const delayBeforeTransition = 120; // shorter delay
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

  // disable scrolling while overlay is visible
  useEffect(() => {
    document.body.style.overflow = overlayVisible ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [overlayVisible]);

  // heroLogo scroll detection: fade left logo in/out when user scrolls past hero logo element
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

  // compute team image index based on scroll inside team section
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
        /* Fonts predeclared: Workbench used for loading screen, Microgramma still expected in /fonts if used elsewhere */
        @font-face { font-family: 'Workbench'; src: url('/fonts/workbench.woff2') format('woff2'); font-weight: 400 800; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Microgramma'; src: url('/fonts/microgramma.woff2') format('woff2'); font-weight:700; font-style:normal; font-display:swap; }

        html, body, #root { height: 100%; background: #141414; margin: 0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0 !important; height: 0 !important; display:none; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }

        /* Titles uppercase */
        h1, h2 { text-transform: uppercase; }

        .frontPage {
          height: 100vh;
          width: 100%;
          display:flex;
          align-items:center;
          justify-content:center;
          position:relative;
          overflow:hidden;
          background:#141414;
        }

        .heroLogo {
          width: min(540px, 60vmin);
          max-width: 90vw;
          transform-origin:center center;
          transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease;
          opacity: 0;
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .heroLogo img { width: 100%; height: auto; display:block; filter: drop-shadow(0 0 12px rgba(255,204,0,0.14)); }

        .leftLogo {
          position: fixed;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 9998;
          width: 96px;
          height: auto;
          opacity: 0;
          transition: opacity 360ms ease;
          pointer-events: none;
        }
        .leftLogo.show { opacity: 1; }

        .loadingOverlay {
          position: fixed;
          inset:0;
          display:flex;
          align-items:center;
          justify-content:center;
          z-index:99999;
          background: #141414;
          pointer-events: all;
          transform-origin: 50% 50%;
        }
        .loadingOverlay.zoomFade {
          transition: transform 700ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease;
          transform: scale(2.6);
          opacity: 0;
          pointer-events: none;
        }
        .loadingNumber {
          font-family: 'Workbench', 'Microgramma', sans-serif;
          font-weight: 700;
          font-size: 72px;
          color: #ffcc00;
          line-height:1;
          user-select: none;
        }

        .scrollArrowWrap {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display:flex;
          align-items:center;
          gap:10px;
          z-index:30;
          cursor:pointer;
          opacity:0;
          transition: opacity 420ms ease, transform 420ms cubic-bezier(.2,.9,.25,1);
        }
        .scrollArrowWrap.show { opacity:1; transform: translateX(-50%) translateY(0); }
        .material-symbols-outlined {
          font-variation-settings: 'wght' 400;
          font-size: 36px;
          color: #ffcc00;
          display:inline-block;
          transform: translateY(0);
          animation: arrowBounce 1400ms infinite;
        }
        .scrollText {
          font-family: 'Microgramma', sans-serif;
          color:#ffcc00;
          font-weight:700;
          letter-spacing:0.04em;
          font-size:14px;
        }
        @keyframes arrowBounce {
          0% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(10px); opacity: 0.7; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .teamSection {
          min-height: 120vh;
          display:flex;
          gap:24px;
          align-items:flex-start;
          padding: 48px 20px;
          max-width:1200px;
          margin: 0 auto;
        }
        .teamText {
          flex: 1 1 360px;
          position: relative;
          font-family: 'SpaceGrotesk', sans-serif;
          color: #eee;
        }
        .teamImages {
          flex: 1 1 480px;
          height: calc(100vh - 120px);
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

        .restContent { background: transparent; color: #ddd; padding: 48px 20px; max-width:1200px; margin: 0 auto; }

        .partners {
          display:flex;
          gap: 24px;
          align-items:center;
          justify-content:flex-start;
          padding: 28px 20px;
          max-width:1200px;
          margin: 0 auto;
        }
        .partners img { height: 48px; width: auto; filter: drop-shadow(0 0 8px rgba(255,204,0,0.08)); }

      `}</style>

      {/* HERO / FRONT PAGE */}
      <div className="frontPage" aria-hidden={!overlayVisible && !heroVisible}>
        <div
          className="heroLogo"
          ref={heroLogoRef}
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "scale(1)" : "scale(0.92)",
            transitionDelay: heroVisible ? "80ms" : "0ms",
            zIndex: 10,
          }}
        >
          <img src="/np_website.svg" alt="NP Website Logo" />
        </div>

        <div className={`scrollArrowWrap ${heroVisible && !overlayVisible ? "show" : ""}`} onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}>
          <span className="material-symbols-outlined">keyboard_double_arrow_down</span>
          <div className="scrollText">SCROLL</div>
        </div>
      </div>

      {/* small left logo (fade only) */}
      <img src="/loading_logo.svg" alt="small logo" className={`leftLogo ${showLeftLogo ? "show" : ""}`} />

      {/* Loading overlay with number */}
      {overlayVisible && (
        <div className={`loadingOverlay ${startTransition ? "zoomFade" : ""}`} aria-hidden={!overlayVisible}>
          <div style={{ textAlign: "center" }}>
            <div className="loadingNumber" aria-live="polite" aria-atomic="true">
              {progress}
            </div>
          </div>
        </div>
      )}

      {/* TEAM SECTION */}
      <section ref={teamSectionRef} className="teamSection" aria-label="Team section">
        <div className="teamText">
          <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Team</h1>

          <div style={{ marginTop: 8, marginBottom: 12, minHeight: 72 }}>
            <p style={{ color: "#eee", fontSize: 18, margin: 0 }}>{TEAM_CAPTIONS[teamIndex]}</p>
            <p style={{ color: "#ddd", marginTop: 8 }}>
              {[
                "Drip focuses on aerodynamic performance and CFD-driven decisions.",
                "Mory develops mechanical subsystems and suspension geometry.",
                "Adam handles wiring, sensors and embedded controls.",
                "Matěj coordinates the team and race strategy, and leads the project.",
              ][teamIndex]}
            </p>
          </div>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 20 }}>About Us</h2>
          <p style={{ color: "#ddd" }}>
            We are the only Czech team and a top contender in the prestigious international STEM racing competition.
          </p>
        </div>

        <div className="teamImages" aria-hidden={!inTeamSection}>
          <div className="sticky">
            {TEAM_IMAGES.map((src, i) => (
              <img key={src} src={src} alt={`team-${i}`} className={i === teamIndex ? "active" : ""} />
            ))}
          </div>
        </div>
      </section>

      {/* REST CONTENT */}
      <div className="restContent" style={{ opacity: showRestContent ? 1 : 0.98 }}>
        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Schedule</h2>
        <p>Next up: Poland — Oct 11</p>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Join Us</h2>
        <p>Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Contact</h2>
        <p>
          For general inquiry:{" "}
          <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">
            prokopmatej@novyporg.cz
          </a>
        </p>

        {/* Partners section added at bottom */}
        <div className="partners" aria-label="Partners">
          <img src="/sponsors/ppas.svg" alt="PPAS" />
          <img src="/sponsors/winkelhofer.svg" alt="Winkelhofer" />
        </div>

        <div style={{ height: 200 }} />
      </div>
    </div>
  );
}
