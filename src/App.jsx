// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  // existing loading/overlay state (keeps previous behavior)
  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [startTransition, setStartTransition] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);

  // new: small left logo shown after hero logo scrolled past
  const [showLeftLogo, setShowLeftLogo] = useState(false);

  // team flicker logic
  const [inTeamSection, setInTeamSection] = useState(false);
  const [currentFlickerIdx, setCurrentFlickerIdx] = useState(0);
  const [showRestContent, setShowRestContent] = useState(false);

  // refs
  const loadingOverlayRef = useRef(null);
  const heroLogoRef = useRef(null);
  const teamSectionRef = useRef(null);
  const flickerTimerRef = useRef(null);

  // image list to flicker (adjust filenames if needed)
  const FLICKER_IMAGES = [
    "/images/drip.png",
    "/images/mory.png",
    "/images/adam.png",
    "/images/matej.png",
  ];

  // ensure reload goes to top
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch (e) {}
  }, []);

  // add material icons stylesheet for arrow (via JS so it's included by this component)
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

  // fake asset preloader (you already had one) - keep so loading number increases
  useEffect(() => {
    const assets = [
      "/np_website.svg",
      "/loading_logo.svg",
      ...FLICKER_IMAGES,
    ];
    let loaded = 0;
    let mounted = true;

    assets.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        if (!mounted) return;
        loaded += 1;
        setProgress(Math.round((loaded / assets.length) * 100));
        if (loaded >= assets.length) {
          setAssetsLoaded(true);
          setProgress(100);
        }
      };
      img.onerror = () => {
        if (!mounted) return;
        loaded += 1;
        setProgress(Math.round((loaded / assets.length) * 100));
        if (loaded >= assets.length) {
          setAssetsLoaded(true);
          setProgress(100);
        }
      };
      img.src = src;
    });

    const fallback = setInterval(() => {
      setProgress((p) => Math.min(99, p + Math.ceil(Math.random() * 3)));
    }, 140);

    return () => {
      mounted = false;
      clearInterval(fallback);
    };
  }, []);

  // disable scrolling until overlay removed
  useEffect(() => {
    document.body.style.overflow = overlayVisible ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [overlayVisible]);

  // start transition once assetsLoaded (shorter delay)
  useEffect(() => {
    if (!assetsLoaded) return;
    const delayBeforeTransition = 120;
    const t = setTimeout(() => {
      setStartTransition(true);
      // transition duration 700ms, then heroVisible true, then overlay removed shortly after
      const transitionMs = 700;
      setTimeout(() => {
        setHeroVisible(true);
        setTimeout(() => {
          setOverlayVisible(false);
        }, 140);
      }, transitionMs);
    }, delayBeforeTransition);
    return () => clearTimeout(t);
  }, [assetsLoaded]);

  // heroLogo scroll detection: show left logo when user scrolls past the hero logo element
  useEffect(() => {
    function checkHeroRect() {
      const el = heroLogoRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // element bottom less than 0 means scrolled past
      const scrolledPast = rect.bottom < 0;
      setShowLeftLogo(scrolledPast);
    }
    window.addEventListener("scroll", checkHeroRect, { passive: true });
    window.addEventListener("resize", checkHeroRect);
    // initial check
    checkHeroRect();
    return () => {
      window.removeEventListener("scroll", checkHeroRect);
      window.removeEventListener("resize", checkHeroRect);
    };
  }, [heroVisible, overlayVisible]);

  // Team section intersection: detect when user is inside the team section
  useEffect(() => {
    const el = teamSectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // when the team section is at least 10% visible, start flicker
          if (entry.isIntersecting && entry.intersectionRatio > 0.10) {
            setInTeamSection(true);
            setShowRestContent(false);
          } else {
            setInTeamSection(false);
          }
        });
      },
      { threshold: [0.1, 0.5, 0.9] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // flicker while in team section
  useEffect(() => {
    if (inTeamSection) {
      // start fast flicker
      if (flickerTimerRef.current) clearInterval(flickerTimerRef.current);
      flickerTimerRef.current = setInterval(() => {
        setCurrentFlickerIdx((i) => (i + 1) % FLICKER_IMAGES.length);
      }, 120); // flicker every 120ms (adjust)
    } else {
      // stop flicker and reset to first image
      if (flickerTimerRef.current) {
        clearInterval(flickerTimerRef.current);
        flickerTimerRef.current = null;
      }
      setCurrentFlickerIdx(0);
    }
    return () => {
      if (flickerTimerRef.current) clearInterval(flickerTimerRef.current);
      flickerTimerRef.current = null;
    };
  }, [inTeamSection]);

  // detect when user scrolls past the team section (i.e. past the last image)
  useEffect(() => {
    function onScroll() {
      const el = teamSectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // when top of team is above - (sectionHeight - viewportHeight) meaning we've scrolled past
      // easier: when rect.bottom <= 0 -> fully scrolled past
      if (rect.bottom <= 0) {
        setShowRestContent(true);
      } else {
        setShowRestContent(false);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // helper to scroll to below hero
  function scrollToContent() {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  }

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @font-face {
          font-family: 'Microgramma';
          src: url('/fonts/microgramma.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        html, body, #root { height: 100%; background: #141414; margin: 0; }
        * { box-sizing: border-box; }
        /* hide scrollbar */
        ::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }

        .frontPage {
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #141414;
        }

        .heroLogo {
          width: min(640px, 68vmin);
          max-width: 90vw;
          transform-origin: center center;
          transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease;
          opacity: 0;
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .heroLogo img { width: 100%; height: auto; display:block; }

        .leftLogo {
          position: fixed;
          left: 18px;
          top: 50%;
          transform: translateY(-50%) translateX(-8px);
          z-index: 9998;
          width: 96px;
          height: auto;
          opacity: 0;
          transition: opacity 360ms ease, transform 360ms cubic-bezier(.2,.9,.25,1);
        }
        .leftLogo.show { opacity: 1; transform: translateY(-50%) translateX(0); }

        /* Loading overlay */
        .loadingOverlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          background: #141414;
          pointer-events: all;
          transform-origin: 50% 50%;
        }
        .loadingOverlay.zoomFade {
          transition: transform 700ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease;
          transform: scale(2.6); /* larger zoom */
          opacity: 0;
          pointer-events: none;
        }
        .loadingNumber {
          font-family: 'Microgramma', sans-serif;
          font-weight: 700;
          font-size: 72px;
          color: #ffcc00;
          line-height:1;
          user-select: none;
        }

        /* scroll arrow replacement: material icon + SCROLL text */
        .scrollArrowWrap {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 30;
          cursor: pointer;
          opacity: 0;
          transition: opacity 420ms ease, transform 420ms cubic-bezier(.2,.9,.25,1);
        }
        .scrollArrowWrap.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .material-symbols-outlined {
          font-variation-settings: 'wght' 400;
          font-size: 36px;
          color: #ffcc00;
          display: inline-block;
          transform: translateY(0);
          animation: arrowBounce 1400ms infinite;
        }
        .scrollText {
          font-family: 'Microgramma', sans-serif;
          color: #ffcc00;
          font-weight: 700;
          letter-spacing: 0.04em;
          font-size: 14px;
        }
        @keyframes arrowBounce {
          0% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(10px); opacity: 0.7; }
          100% { transform: translateY(0); opacity: 1; }
        }

        /* team section layout */
        .teamSection {
          min-height: 120vh; /* leave room to scroll through image area */
          display: flex;
          gap: 24px;
          align-items: flex-start;
          padding: 48px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .teamText {
          flex: 1 1 360px;
          position: relative;
          top: 0;
          font-family: 'SpaceGrotesk', sans-serif;
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
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .teamImages img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }

        /* rest content hidden until you pass team */
        .restContent.hidden { display: none; }
        .restContent.visible { display: block; }

      `}</style>

      {/* FRONT PAGE / HERO */}
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

        {/* scroll arrow + SCROLL text */}
        <div className={`scrollArrowWrap ${heroVisible && !overlayVisible ? "show" : ""}`} onClick={scrollToContent}>
          <span className="material-symbols-outlined">keyboard_double_arrow_down</span>
          <div className="scrollText">SCROLL</div>
        </div>
      </div>

      {/* small left logo: appears when user scrolls past hero logo element */}
      <img src="/loading_logo.svg" alt="small logo" className={`leftLogo ${showLeftLogo ? "show" : ""}`} />

      {/* Loading overlay with number only */}
      {overlayVisible && (
        <div ref={loadingOverlayRef} className={`loadingOverlay ${startTransition ? "zoomFade" : ""}`} aria-hidden={!overlayVisible}>
          <div style={{ textAlign: "center" }}>
            <div className="loadingNumber" aria-live="polite" aria-atomic="true">
              {progress}
            </div>
          </div>
        </div>
      )}

      {/* ----- TEAM SECTION ----- */}
      <section ref={teamSectionRef} className="teamSection" aria-label="Team section">
        <div className="teamText">
          <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Team</h1>
          <p style={{ color: "#eee" }}>
            The Team
          </p>
          <ul style={{ color: "#ddd" }}>
            <li>Team Leader: Matěj Prokop</li>
            <li>Engineer: Lukáš Moravec</li>
            <li>Finance manager: Lukáš Martin</li>
            <li>Marketing manager: Veronika Lindová</li>
          </ul>
          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 20 }}>About Us</h2>
          <p style={{ color: "#ddd" }}>We are the only Czech team and a top contender in the prestigious international STEM racing competition.</p>
        </div>

        <div className="teamImages" aria-hidden={!inTeamSection}>
          <div className="sticky">
            {/* This image flickers while user is in the team section */}
            <img src={FLICKER_IMAGES[currentFlickerIdx]} alt="team flicker" />
          </div>
        </div>
      </section>

      {/* ----- REST (hidden until team scrolled past) ----- */}
      <div className={`restContent ${showRestContent ? "visible" : "hidden"}`}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 20px", color: "#eee" }}>
          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Schedule</h2>
          <p>Next up: Poland — Oct 11</p>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Join Us</h2>
          <p>Want to have the chance to compete for a scholarship? Contact us!</p>

          <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 24 }}>Contact</h2>
          <p>
            For general inquiry:{" "}
            <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">
              prokopmatej@novyporg.cz
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
