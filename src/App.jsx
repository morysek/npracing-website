// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  // --- assets & captions
  const TEAM_IMAGES = ["/images/drip.png", "/images/mory.png", "/images/adam.png", "/images/matej.png"];
  const TEAM_CAPTIONS = [
    "Drip — Lead aerodynamicist",
    "Mory — Mechanical engineer",
    "Adam — Electronics & controls",
    "Matěj — Team lead & strategy",
  ];

  // --- refs
  const heroRef = useRef(null);
  const teamSectionRef = useRef(null);

  // --- UI state
  const [progress] = useState(100); // keep loader logic elsewhere; not touched here
  const [heroPassed, setHeroPassed] = useState(false);
  const [inTeamSection, setInTeamSection] = useState(false);
  const [teamIndex, setTeamIndex] = useState(0);
  const [imagesFixed, setImagesFixed] = useState(false);
  const lastIndex = TEAM_IMAGES.length - 1;

  // ensure reload always at top
  useEffect(() => {
    if (history && "scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // single scroll handler that:
  // - updates heroPassed (user scrolled past hero)
  // - updates whether team section is in view
  // - computes relative scroll inside team section to pick teamIndex
  // - decides whether images are fixed or released
  useEffect(() => {
    const handleScroll = () => {
      const heroEl = heroRef.current;
      const teamEl = teamSectionRef.current;

      // determine heroPassed: true once hero bottom is <= 0 (scrolled past)
      if (heroEl) {
        const r = heroEl.getBoundingClientRect();
        setHeroPassed(r.bottom <= 0);
      }

      if (!teamEl) {
        setInTeamSection(false);
        return;
      }

      const rect = teamEl.getBoundingClientRect();
      const vh = window.innerHeight;

      // section in view if any part intersects viewport
      const intersecting = rect.top < vh && rect.bottom > 0;
      setInTeamSection(intersecting);

      // compute index only when the team section is being interacted with (and hero passed)
      // The logic: we map the portion of scroll from section top entering the viewport to section fully passed
      // to an index delta across TEAM_IMAGES.
      if (intersecting && heroEl) {
        const sectionHeight = Math.max(1, rect.height);
        // amount the user has scrolled into the section (0 when its top first hits viewport bottom)
        // We'll use (vh - rect.top) as how many pixels of the section are visible starting from top
        const visibleFromTop = Math.min(sectionHeight + vh, Math.max(0, vh - rect.top));
        // normalize in [0,1]
        const relative = Math.max(0, Math.min(1, visibleFromTop / (sectionHeight + 0.0001)));
        // pick index proportional to relative progress through section
        const idx = Math.min(lastIndex, Math.floor(relative * (TEAM_IMAGES.length)));
        setTeamIndex(idx);
      }

      // decide whether images should be fixed (stuck to viewport) or not
      // imagesFixed when:
      //  - user has scrolled past hero (heroPassed)
      //  - team section intersects viewport (inTeamSection)
      //  - user has NOT yet reached the last image (teamIndex < lastIndex)
      // Once user reaches lastIndex and scrolls a bit more so the bottom of the section passes,
      // imagesFixed becomes false and images will scroll away as normal.
      const shouldBeFixed = heroEl && rect && rect.top < vh && rect.bottom > 0 && teamIndex < lastIndex && (heroEl.getBoundingClientRect().bottom <= 0);
      setImagesFixed(Boolean(shouldBeFixed));
    };

    // passive scroll
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    // call once to initialise states
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [teamIndex, lastIndex]);

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @font-face { font-family: 'Microgramma'; src: url('/fonts/microgramma.woff2') format('woff2'); font-weight:700; font-style:normal; font-display:swap; }
        html,body,#root{height:100%;margin:0;background:#141414}
        ::-webkit-scrollbar{width:0;height:0}
        html,body{scrollbar-width:none;-ms-overflow-style:none}
        .frontPage { height:100vh; display:flex; align-items:center; justify-content:center; }
        .heroLogo img { display:block; width:min(540px,60vmin); max-width:90vw; filter: drop-shadow(0 0 12px rgba(255,204,0,0.14)); }
        .teamSection { position: relative; padding: 48px 20px; max-width:1200px; margin: 0 auto; display:flex; gap:24px; align-items:flex-start; min-height:120vh; }
        .teamText { flex:1 1 360px; color:#eee; font-family: 'Microgramma', sans-serif; }
        .teamImages { flex:1 1 480px; height: calc(100vh - 120px); position: relative; }
        /* fixed container that keeps images absolutely centered in viewport */
        .teamImages.fixed { position: fixed; right: 50%; transform: translateX(50%); top: 80px; width: 48vw; max-width: 560px; height: calc(100vh - 160px); z-index: 20; display:flex; align-items:center; justify-content:center; pointer-events:none; }
        /* normal flow container (once released) */
        .teamImages.relative { position: relative; width: 100%; height: auto; display:block; }
        .teamImages .slot { position: relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .teamImages img { position:absolute; left:50%; top:50%; transform: translate(-50%,-50%) translateY(10px); max-width:100%; max-height:100%; opacity:0; transition: opacity 420ms ease, transform 420ms cubic-bezier(.2,.9,.25,1); object-fit:contain; }
        .teamImages img.active { opacity:1; transform: translate(-50%,-50%) translateY(0); }
        .restContent { max-width:1200px; margin: 0 auto; padding: 48px 20px; color: #ddd; }
      `}</style>

      {/* FRONT PAGE / HERO */}
      <div ref={heroRef} className="frontPage" aria-label="Hero front page">
        <div className="heroLogo"><img src="/np_website.svg" alt="hero logo" /></div>
      </div>

      {/* TEAM SECTION */}
      <section ref={teamSectionRef} className="teamSection" aria-label="Team">
        <div className="teamText">
          <h1 style={{ color: "#ffcc00", marginTop: 0 }}>TEAM</h1>

          {/* caption for current image */}
          <div style={{ marginTop: 12, marginBottom: 18 }}>
            <h3 style={{ margin: 0, color: "#fff", fontFamily: "Microgramma" }}>{TEAM_CAPTIONS[teamIndex]}</h3>
            <p style={{ color: "#ddd", marginTop: 8 }}>
              {[
                "Drip focuses on aerodynamic performance and CFD-driven decisions.",
                "Mory develops mechanical subsystems and suspension geometry.",
                "Adam handles wiring, sensors and embedded controls.",
                "Matěj coordinates the team and race strategy, and leads the project.",
              ][teamIndex]}
            </p>
          </div>

          {/* minimal list relevant to images (kept inside team section) */}
          <ul style={{ color: "#ddd" }}>
            <li>Team Leader: Matěj Prokop</li>
            <li>Engineer: Lukáš Moravec</li>
            <li>Finance manager: Lukáš Martin</li>
            <li>Marketing manager: Veronika Lindová</li>
          </ul>
        </div>

        {/* Images container: either fixed (centered in viewport) or normal flow when released */}
        <div className={`teamImages ${imagesFixed ? "fixed" : "relative"}`} aria-hidden={!heroPassed}>
          {/* single visual slot: show all images stacked, only active one is visible */}
          <div className="slot">
            {TEAM_IMAGES.map((src, i) => (
              <img key={src} src={src} alt={`team-${i}`} className={i === teamIndex ? "active" : ""} />
            ))}
          </div>
        </div>
      </section>

      {/* REST CONTENT below the images */}
      <div className="restContent" aria-label="Rest of content">
        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>ABOUT US</h2>
        <p>
          We are the only Czech team and a top contender in the prestigious international STEM racing competition.
          We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.
        </p>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>SCHEDULE</h2>
        <p>Next up: Poland — Oct 11</p>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>JOIN US</h2>
        <p>Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>CONTACT</h2>
        <p>For general inquiry: <a href="mailto:prokopmatej@novyporg.cz" style={{ color: "#ffcc00" }}>prokopmatej@novyporg.cz</a></p>

        <div style={{ height: 200 }} />
      </div>
    </div>
  );
}
