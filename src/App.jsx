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

  const heroLogoRef = useRef(null);

  // images + captions (static layout now)
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
    if (history && "scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // preload Workbench font then assets (keeps earlier logic)
  useEffect(() => {
    let mounted = true;
    let loaded = 0;
    const sponsors = ["/sponsors/ppas.svg", "/sponsors/winkelhofer.svg"];
    const assets = [
      "/np_website.svg",
      "/loading_logo.svg",
      ...TEAM_IMAGES,
      "/sponsors/ppas.svg",
      "/sponsors/winkelhofer.svg",
    ];

    const totalCount = 1 + assets.length;

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

    (async function loadFontFirst() {
      try {
        if (document.fonts && document.fonts.load) {
          await Promise.all([document.fonts.load("1em Workbench"), document.fonts.load("700 1em Workbench")]);
        } else {
          await new Promise((r) => setTimeout(r, 150));
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

  // transition from loading overlay to hero
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

  // show left logo when hero is scrolled past
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
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @font-face { font-family: 'Workbench'; src: url('/fonts/workbench.woff2') format('woff2'); font-weight: 400 800; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Microgramma'; src: url('/fonts/microgramma.woff2') format('woff2'); font-weight:700; font-style:normal; font-display:swap; }
        html, body, #root { height: 100%; background: #141414; margin: 0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0 !important; height: 0 !important; display:none; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
        h1, h2 { text-transform: uppercase; }

        .frontPage { height: 100vh; width: 100%; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; background:#141414; }
        .heroLogo { width: min(540px, 60vmin); max-width: 90vw; transform-origin:center center; transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease; opacity: 0; display:flex; align-items:center; justify-content:center; }
        .heroLogo img { width: 100%; height: auto; display:block; filter: drop-shadow(0 0 12px rgba(255,204,0,0.14)); }
        .leftLogo { position: fixed; left: 18px; top: 50%; transform: translateY(-50%); z-index: 9998; width: 96px; height: auto; opacity: 0; transition: opacity 360ms ease; pointer-events: none; }
        .leftLogo.show { opacity: 1; }
        .loadingOverlay { position: fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:99999; background: #141414; pointer-events: all; transform-origin: 50% 50%; }
        .loadingOverlay.zoomFade { transition: transform 700ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease; transform: scale(2.6); opacity: 0; pointer-events: none; }
        .loadingNumber { font-family: 'Workbench', 'Microgramma', sans-serif; font-weight: 700; font-size: 72px; color: #ffcc00; line-height:1; user-select: none; }

        /* Team section layout: title left, images center, descriptive text right */
        .teamSection {
          display: flex;
          gap: 32px;
          align-items: flex-start;
          padding: 48px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .teamTitle {
          flex: 0 0 200px;
        }
        .teamTitle h1 { margin: 0; color:#ffcc00; font-family: 'Microgramma'; }
        .teamImagesRow {
          flex: 1 1 520px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap: 18px;
          flex-wrap: wrap;
        }
        .imageCard {
          width: calc(25% - 18px);
          min-width: 140px;
          max-width: 220px;
          text-align:center;
        }
        @media (max-width: 900px) {
          .teamSection { flex-direction: column; align-items:center; }
          .teamTitle { order: 0; width:100%; text-align:center; }
          .teamImagesRow { order: 1; width:100%; }
          .teamRight { order: 2; width:100%; }
          .imageCard { width: 48%; }
        }
        .imageCard img { width: 100%; height: auto; display:block; border-radius:6px; object-fit:cover; box-shadow: 0 8px 28px rgba(0,0,0,0.6); }
        .imageCaption { margin-top: 8px; color:#eee; font-size:14px; font-family:'Microgramma'; }
        .teamRight { flex: 0 0 320px; color:#ddd; font-family: 'Workbench', sans-serif; line-height:1.45; }
        .restContent { background: transparent; color: #ddd; padding: 48px 20px; max-width:1200px; margin: 0 auto; }
        .partners { display:flex; gap: 24px; align-items:center; justify-content:flex-start; padding: 28px 20px; max-width:1200px; margin: 0 auto; }
        .partners img { height: 48px; width: auto; filter: drop-shadow(0 0 8px rgba(255,204,0,0.08)); }
      `}</style>

      {/* FRONT / HERO */}
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
        {/* TEAM SECTION */}
        <section className="teamSection" aria-label="Team">
          <div className="teamTitle">
            <h1>Team</h1>
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
            <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 0 }}>About Us</h2>
            <p>We are the only Czech team and a top contender in the prestigious international STEM racing competition.</p>
            <p>We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.</p>
            <p>Founded at Nový PORG, NP Racing unites skills in engineering, manufacturing, and marketing.</p>
            <p>We collaborate with partners like the Czech Technical University to enhance our expertise.</p>
          </div>
        </section>

        {/* REST CONTENT */}
        <div className="restContent">
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

          <div className="partners" aria-label="Partners">
            <img src="/sponsors/ppas.svg" alt="PPAS" />
            <img src="/sponsors/winkelhofer.svg" alt="Winkelhofer" />
          </div>

          <div style={{ height: 200 }} />
        </div>
      </div>
    </div>
  );
}
