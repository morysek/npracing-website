// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

export default function App() {
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

  // loading / hero visibility (kept from your previous iteration)
  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [startTransition, setStartTransition] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showLeftLogo, setShowLeftLogo] = useState(false);

  // team image cycling state
  const [teamIndex, setTeamIndex] = useState(0);
  const [imagesFixed, setImagesFixed] = useState(false); // true => fixed in viewport
  const teamSectionRef = useRef(null);
  const frontPageRef = useRef(null);
  const heroLogoRef = useRef(null);

  // --- minimal asset preloader for progress (keeps previous behavior simple) ---
  useEffect(() => {
    let mounted = true;
    const assets = [
      "/np_website.svg",
      "/loading_logo.svg",
      ...TEAM_IMAGES,
      "/sponsors/ppas.svg",
      "/sponsors/winkelhofer.svg",
    ];
    let loaded = 0;
    const total = assets.length + 1; // +1 for font (if you count it)
    const mark = () => {
      if (!mounted) return;
      loaded += 1;
      const pct = Math.round((loaded / total) * 100);
      setProgress(pct);
      if (loaded >= total) {
        setAssetsLoaded(true);
        setProgress(100);
      }
    };

    // fake font load resolution first (you can replace with document.fonts.load)
    setTimeout(mark, 90);

    assets.forEach((src) => {
      const img = new Image();
      img.onload = mark;
      img.onerror = mark;
      img.src = src;
    });

    const fallback = setInterval(() => {
      setProgress((p) => Math.min(98, p + Math.ceil(Math.random() * 2)));
    }, 240);

    return () => {
      mounted = false;
      clearInterval(fallback);
    };
  }, []);

  // start the front-page -> hero transition when assets done
  useEffect(() => {
    if (!assetsLoaded) return;
    const delayBeforeTransition = 100;
    const t = setTimeout(() => {
      setStartTransition(true);
      const transitionMs = 600;
      setTimeout(() => {
        setHeroVisible(true);
        setTimeout(() => setOverlayVisible(false), 120);
      }, transitionMs);
    }, delayBeforeTransition);
    return () => clearTimeout(t);
  }, [assetsLoaded]);

  // disable body scroll while overlay is visible
  useEffect(() => {
    document.body.style.overflow = overlayVisible ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [overlayVisible]);

  // show left small logo once hero has scrolled out of view
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

  // Core scroll handler: decide when images should be fixed, compute index, release after last
  useEffect(() => {
    function onScroll() {
      const sectionEl = teamSectionRef.current;
      const frontEl = frontPageRef.current;
      if (!sectionEl || !frontEl) return;

      const sectionRect = sectionEl.getBoundingClientRect();
      const frontRect = frontEl.getBoundingClientRect();
      const vh = window.innerHeight;

      // heroPassed = user scrolled past the end of the front-page (frontRect.bottom <= 0)
      const heroPassed = frontRect.bottom <= 0;

      // compute relative progress within the team section
      // relative goes from 0 when the section first touches viewport bottom -> to 1 when section bottom is scrolled past viewport top
      const relative = Math.min(
        1,
        Math.max(0, (vh - sectionRect.top) / (sectionRect.height + vh))
      );

      // index mapping: split the section into N equal chunks for N images
      const n = TEAM_IMAGES.length;
      const idx = Math.min(n - 1, Math.floor(relative * n));
      setTeamIndex(idx);

      // images should remain fixed while:
      //  - heroPassed is true
      //  - and relative < 1 (we haven't reached the very end)
      //  - and the section intersects viewport (sectionRect.top < vh && sectionRect.bottom > 0)
      const isIntersecting = sectionRect.top < vh && sectionRect.bottom > 0;
      const shouldFix = heroPassed && isIntersecting && relative < 1 - 1e-5;
      setImagesFixed(shouldFix);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // ensure reload always at top
  useEffect(() => {
    if (history && "scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Team section computed height: use (n + 1) viewports so there's space to cycle + release
  const teamSectionHeight = `${(TEAM_IMAGES.length + 1) * 100}vh`;

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @font-face { font-family:'Workbench'; src: url('/fonts/workbench.woff2') format('woff2'); font-weight:400 800; font-style:normal; font-display:swap; }
        @font-face { font-family:'Microgramma'; src: url('/fonts/microgramma.woff2') format('woff2'); font-weight:700; font-style:normal; font-display:swap; }

        html, body, #root { height: 100%; background: #141414; margin: 0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }

        .frontPage { height:100vh; width:100%; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; background:#141414; }
        .heroLogo { width: min(540px, 60vmin); max-width:90vw; transform-origin:center center; transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease; display:flex; align-items:center; justify-content:center; }
        .heroLogo img { width:100%; display:block; filter: drop-shadow(0 0 12px rgba(255,204,0,0.14)); }

        .leftLogo { position: fixed; left: 16px; top: 48px; z-index: 9998; width: 84px; opacity:0; transition: opacity 360ms ease; pointer-events:none; }
        .leftLogo.show { opacity: 1; }

        .loadingOverlay { position: fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:99999; background:#141414; pointer-events:all; transform-origin:50% 50%; }
        .loadingOverlay.zoomFade { transition: transform 700ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease; transform: scale(2.6); opacity: 0; pointer-events: none; }
        .loadingNumber { font-family: 'Workbench', 'Microgramma', sans-serif; font-weight:700; font-size:72px; color:#ffcc00; line-height:1; user-select:none; }

        /* TEAM layout */
        .teamSection { width:100%; padding: 48px 20px; display:flex; gap:24px; align-items:flex-start; max-width:1200px; margin:0 auto; box-sizing:border-box; }
        .teamText { flex: 1 1 360px; font-family: 'SpaceGrotesk', sans-serif; color:#eee; }
        .teamImages { flex: 1 1 480px; height: calc(100vh - 120px); position: relative; box-sizing:border-box; }
        .teamImages .fixedWrap {
          width: min(480px, 40vw);
          max-width: 90vw;
          height: calc(100vh - 160px);
          display:flex;
          align-items:center;
          justify-content:center;
          pointer-events:none;
          left:50%;
          transform: translateX(-50%);
        }
        /* fixed positioning while cycling */
        .teamImages .fixedWrap.fixed {
          position: fixed;
          top: 80px;
          z-index: 30;
        }
        /* released positioning (moves with page) */
        .teamImages .fixedWrap.released {
          position: absolute;
          top: 0;
          z-index: 10;
        }

        .teamImages img {
          position: absolute;
          left:50%;
          top:50%;
          transform: translate(-50%,-50%) translateY(8px);
          max-width:100%;
          max-height:100%;
          width:auto;
          height:auto;
          object-fit:contain;
          opacity:0;
          transition: opacity 420ms ease, transform 420ms cubic-bezier(.2,.9,.25,1);
        }
        .teamImages img.active { opacity:1; transform: translate(-50%,-50%) translateY(0); }

        .restContent { padding: 48px 20px; max-width:1200px; margin: 0 auto; color:#ddd; }

        h1,h2 { color:#ffcc00; font-family: 'Microgramma', sans-serif; text-transform:uppercase; }
      `}</style>

      {/* FRONT / HERO */}
      <div className="frontPage" ref={frontPageRef} aria-hidden={!overlayVisible && !heroVisible}>
        <div
          className="heroLogo"
          ref={heroLogoRef}
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "scale(1)" : "scale(0.96)",
            transitionDelay: heroVisible ? "80ms" : "0ms",
            zIndex: 10,
          }}
        >
          <img src="/np_website.svg" alt="NP Website Logo" />
        </div>
      </div>

      {/* left small logo (fade-only) */}
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

      {/* TEAM SECTION - note we set the section height to allow cycling through images */}
      <section
        ref={teamSectionRef}
        className="teamSection"
        style={{ minHeight: teamSectionHeight }}
        aria-label="Team section"
      >
        <div className="teamText">
          <h1>Team</h1>
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

          <h2>About Us</h2>
          <p style={{ color: "#ddd" }}>
            We are the only Czech team and a top contender in the prestigious international STEM racing competition.
          </p>
        </div>

        <div className="teamImages" aria-hidden={false}>
          {/* fixedWrap: switches between .fixed (position:fixed) and .released (position:absolute) */}
          <div className={`fixedWrap ${imagesFixed ? "fixed" : "released"}`} style={{ left: "50%", transform: "translateX(-50%)" }}>
            {TEAM_IMAGES.map((src, i) => (
              <img key={src} src={src} alt={`team-${i}`} className={i === teamIndex ? "active" : ""} />
            ))}
          </div>
        </div>
      </section>

      {/* rest of content */}
      <div className="restContent">
        <h2>Schedule</h2>
        <p>Next up: Poland — Oct 11</p>

        <h2 style={{ marginTop: 24 }}>Join Us</h2>
        <p>Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>

        <h2 style={{ marginTop: 24 }}>Contact</h2>
        <p>
          For general inquiry:{" "}
          <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">
            prokopmatej@novyporg.cz
          </a>
        </p>

        <div style={{ paddingTop: 28 }}>
          <h2>Partners</h2>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <img src="/sponsors/ppas.svg" alt="PPAS" style={{ height: 48 }} />
            <img src="/sponsors/winkelhofer.svg" alt="Winkelhofer" style={{ height: 48 }} />
          </div>
        </div>

        <div style={{ height: 200 }} />
      </div>
    </div>
  );
}
