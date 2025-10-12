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

  // preload fonts then assets
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

    const totalCount = 2 + assets.length; // 2 fonts + assets

    // Preload Helvetica font
    if (!document.getElementById("__preload_helvetica")) {
      const preload = document.createElement("link");
      preload.id = "__preload_helvetica";
      preload.rel = "preload";
      preload.as = "font";
      preload.href = "/fonts/helvetica.woff2";
      preload.type = "font/woff2";
      preload.crossOrigin = "anonymous";
      document.head.appendChild(preload);
    }

    // Preload Space Grotesk font
    if (!document.getElementById("__preload_spacegrotesk")) {
      const preload = document.createElement("link");
      preload.id = "__preload_spacegrotesk";
      preload.rel = "preload";
      preload.as = "font";
      preload.href = "/fonts/spacegrotesk.woff2";
      preload.type = "font/woff2";
      preload.crossOrigin = "anonymous";
      document.head.appendChild(preload);
    }

    if (!document.getElementById("__helvetica_font_style")) {
      const style = document.createElement("style");
      style.id = "__helvetica_font_style";
      style.innerHTML = `
        @font-face {
          font-family: 'Helvetica';
          src: url('/fonts/helvetica.woff2') format('woff2');
          font-weight: 400 700;
          font-style: normal;
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    }

    if (!document.getElementById("__spacegrotesk_font_style")) {
      const style = document.createElement("style");
      style.id = "__spacegrotesk_font_style";
      style.innerHTML = `
        @font-face {
          font-family: 'Space Grotesk';
          src: url('/fonts/spacegrotesk.woff2') format('woff2');
          font-weight: 400 700;
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

    (async function loadFontsFirst() {
      try {
        if (document.fonts && document.fonts.load) {
          await Promise.all([
            document.fonts.load("1em Helvetica"), 
            document.fonts.load("700 1em Helvetica"),
            document.fonts.load("1em 'Space Grotesk'"), 
            document.fonts.load("700 1em 'Space Grotesk'")
          ]);
        } else {
          await new Promise((r) => setTimeout(r, 150));
        }
      } catch (e) {
        // ignore
      } finally {
        markLoaded();
        markLoaded(); // Count both fonts as loaded
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
    <div style={{ width: "100vw", minHeight: "100vh", background: "#fff", color: "#000", overflowX: "hidden" }}>
      <style>{`
        @font-face { font-family: 'Helvetica'; src: url('/fonts/helvetica.woff2') format('woff2'); font-weight: 400 700; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Space Grotesk'; src: url('/fonts/spacegrotesk.woff2') format('woff2'); font-weight: 400 700; font-style: normal; font-display: swap; }
        html, body, #root { height: 100%; background: #fff; margin: 0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0 !important; height: 0 !important; display:none; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
        
        .frontPage { height: 100vh; width: 100%; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; background:#fff; }
        .heroLogo { width: min(540px, 60vmin); max-width: 90vw; transform-origin:center center; transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease; opacity: 0; display:flex; align-items:center; justify-content:center; }
        .heroLogo img { width: 100%; height: auto; display:block; }
        .leftLogo { position: fixed; left: 18px; top: 50%; transform: translateY(-50%); z-index: 9998; width: 96px; height: auto; opacity: 0; transition: opacity 360ms ease; pointer-events: none; }
        .leftLogo.show { opacity: 1; }
        .loadingOverlay { position: fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:99999; background: #fff; pointer-events: all; transform-origin: 50% 50%; }
        .loadingOverlay.zoomFade { transition: transform 700ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease; transform: scale(2.6); opacity: 0; pointer-events: none; }
        .loadingNumber { font-family: 'Helvetica', sans-serif; font-weight: 700; font-size: 72px; color: #000; line-height:1; user-select: none; }

        /* Swiss Design Styles */
        .swiss-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .hero-section {
          padding: 120px 0;
          text-align: center;
        }
        
        .hero-title {
          font-family: 'Helvetica', sans-serif;
          font-size: 64px;
          font-weight: 700;
          margin: 0 0 20px 0;
          text-transform: uppercase;
          letter-spacing: -1px;
        }
        
        .hero-subtitle {
          font-family: 'Helvetica', sans-serif;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 40px 0;
          text-transform: uppercase;
        }
        
        .hero-info {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          margin: 0;
        }
        
        .section {
          padding: 80px 0;
          border-top: 1px solid #000;
        }
        
        .section-title {
          font-family: 'Helvetica', sans-serif;
          font-size: 48px;
          font-weight: 700;
          margin: 0 0 40px 0;
          text-transform: uppercase;
        }
        
        .team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .team-member {
          text-align: center;
        }
        
        .team-member img {
          width: 100%;
          height: auto;
          display: block;
          margin-bottom: 10px;
        }
        
        .team-member-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }
        
        .team-member-role {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          margin: 5px 0 0 0;
        }
        
        .car-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }
        
        .car-image {
          flex: 1;
        }
        
        .car-image img {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .car-details {
          flex: 1;
        }
        
        .car-spec {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          margin: 0 0 20px 0;
        }
        
        .schedule-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid #000;
        }
        
        .schedule-event {
          font-family: 'Helvetica', sans-serif;
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }
        
        .schedule-date {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          margin: 0;
        }
        
        .countdown {
          font-family: 'Helvetica', sans-serif;
          font-size: 32px;
          font-weight: 700;
          margin: 20px 0 0 0;
          text-align: center;
        }
        
        .contact-info {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          margin: 0 0 20px 0;
        }
        
        .partners-grid {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          margin-top: 40px;
        }
        
        .partner-tier {
          flex: 1;
        }
        
        .partner-tier-title {
          font-family: 'Helvetica', sans-serif;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 20px 0;
          text-transform: uppercase;
        }
        
        .partner-logo {
          height: 60px;
          margin-bottom: 20px;
        }
        
        @media (max-width: 900px) {
          .hero-title { font-size: 48px; }
          .hero-subtitle { font-size: 24px; }
          .section-title { font-size: 36px; }
          .team-grid { grid-template-columns: repeat(2, 1fr); }
          .car-section { flex-direction: column; }
          .schedule-item { flex-direction: column; align-items: flex-start; gap: 10px; }
          .partners-grid { flex-direction: column; }
        }
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
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="swiss-container">
            <h1 className="hero-title">Czechia's Hero page</h1>
            <h2 className="hero-subtitle">only STEM Racing team</h2>
            <p className="hero-info">est 2024 Based in Prague hpwebs.de-slg</p>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section className="section">
          <div className="swiss-container">
            <h2 className="section-title">The Team</h2>
            <div className="team-grid">
              {TEAM_IMAGES.map((src, i) => (
                <div className="team-member" key={src}>
                  <img src={src} alt={`team-${i}`} />
                  <p className="team-member-name">{TEAM_CAPTIONS[i].split(' — ')[0]}</p>
                  <p className="team-member-role">{TEAM_CAPTIONS[i].split(' — ')[1]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CAR SECTION */}
        <section className="section">
          <div className="swiss-container">
            <h2 className="section-title">The Car</h2>
            <div className="car-section">
              <div className="car-image">
                <img src="/images/car.png" alt="Race Car" />
              </div>
              <div className="car-details">
                <p className="car-spec">Top Speed: 85 km/h</p>
                <p className="car-spec">Acceleration: 0-60 km/h in 3.2 seconds</p>
                <p className="car-spec">Weight: 45 kg</p>
                <p className="car-spec">Materials: Carbon fiber, aluminum alloy</p>
                <p className="car-spec">Engine: Electric motor with 3kW power</p>
              </div>
            </div>
          </div>
        </section>

        {/* SCHEDULE SECTION */}
        <section className="section">
          <div className="swiss-container">
            <h2 className="section-title">Schedule</h2>
            <div className="schedule-item">
              <h3 className="schedule-event">The UK</h3>
              <p className="schedule-date">January 26th</p>
            </div>
            <div className="countdown">Countdown: 45 days</div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="section">
          <div className="swiss-container">
            <h2 className="section-title">Contact</h2>
            <p className="contact-info">probstej@rigors or Partners</p>
            
            <div className="partners-grid">
              <div className="partner-tier">
                <h3 className="partner-tier-title">Gold</h3>
                <img src="/sponsors/gold1.svg" alt="Gold Sponsor 1" className="partner-logo" />
                <img src="/sponsors/gold2.svg" alt="Gold Sponsor 2" className="partner-logo" />
              </div>
              <div className="partner-tier">
                <h3 className="partner-tier-title">Silver</h3>
                <img src="/sponsors/silver1.svg" alt="Silver Sponsor 1" className="partner-logo" />
                <img src="/sponsors/silver2.svg" alt="Silver Sponsor 2" className="partner-logo" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}