// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/* ---------- Helper data ---------- */
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

export default function App() {
  // loading / hero states (kept minimal for this example)
  const [progress, setProgress] = useState(100); // assume loaded for brevity; wire up your loader if needed
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);

  // hero & team refs
  const heroRef = useRef(null);
  const seqRef = useRef(null);

  // scroll-driven states
  const [heroPassed, setHeroPassed] = useState(false); // true when hero scrolled out of view
  const [imageIndex, setImageIndex] = useState(0); // current image shown (0..n-1)
  const [sequenceActive, setSequenceActive] = useState(false); // true while sticky sequence is active
  const [sequenceEnded, setSequenceEnded] = useState(false); // true after last image passed

  // left small logo fade
  const [showLeftLogo, setShowLeftLogo] = useState(false);

  // ensure reload always lands at top
  useEffect(() => {
    if (history && "scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // detect hero passed (scrolled past) and update left logo display
  useEffect(() => {
    function onScroll() {
      const heroEl = heroRef.current;
      if (!heroEl) return;
      const heroRect = heroEl.getBoundingClientRect();
      const passed = heroRect.bottom <= 0;
      setHeroPassed(passed);
      setShowLeftLogo(passed);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // compute image index while the user scrolls through the sequence container
  useEffect(() => {
    const onScroll = () => {
      const wrapper = seqRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;

      // The sequence should only be "active" once hero is passed
      if (!heroPassed) {
        setSequenceActive(false);
        setImageIndex(0);
        setSequenceEnded(false);
        return;
      }

      // When wrapper is not yet reached -> not active
      if (rect.top > 0 && rect.top > vh * 0.25) {
        setSequenceActive(false);
        setImageIndex(0);
        setSequenceEnded(false);
        return;
      }

      // When wrapper bottom is above top of viewport -> finished
      if (rect.bottom <= 0) {
        setSequenceActive(false);
        setImageIndex(TEAM_IMAGES.length - 1);
        setSequenceEnded(true);
        return;
      }

      // Sequence active: compute position inside the wrapper
      // We'll make wrapperHeight such that each image occupies roughly a viewport's worth of scroll.
      const wrapperHeight = rect.height; // set in CSS to n * 100vh
      const scrolled = Math.min(wrapperHeight - 1, Math.max(0, window.innerHeight - rect.top));
      const ratio = scrolled / wrapperHeight; // 0..(≈1)
      const idx = Math.min(TEAM_IMAGES.length - 1, Math.floor(ratio * TEAM_IMAGES.length));
      setSequenceActive(true);
      setImageIndex(idx);
      setSequenceEnded(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [heroPassed]);

  /* ---------- Styles (kept inline for single-file deliverable) ---------- */
  const css = `
    :root { --accent: #ffcc00; --bg: #141414; --muted: #dcdcdc; }
    html,body,#root { background: var(--bg); height: 100%; margin:0; }
    * { box-sizing: border-box; }
    .hidden-scroll::-webkit-scrollbar { display:none; } /* hide scrollbar facsimile */
    .frontPage {
      height: 100vh; width:100%; display:flex; align-items:center; justify-content:center;
      background: var(--bg); position:relative;
    }
    .hero-logo {
      width: min(540px, 56vmin); max-width: 90vw; transition: transform .42s cubic-bezier(.2,.9,.25,1), opacity .32s;
    }
    .hero-logo img { width:100%; height:auto; display:block; filter: drop-shadow(0 0 18px rgba(255,204,0,0.12)); }
    .left-logo {
      position: fixed; left: 18px; top: 24px; width: 96px; opacity: 0; transition: opacity .36s ease; z-index: 50;
    }
    .left-logo.show { opacity: 1; }
    /* Sequence wrapper: total height = imagesCount * 100vh (so scrolling through triggers the image steps) */
    .sequenceWrapper {
      width:100%; display:block; position:relative; background: transparent;
    }
    .sequenceSpacer { height: calc(100vh * var(--count)); } /* created by inlined style */
    .sequenceSticky {
      position: sticky; top: 80px; height: calc(100vh - 160px); display:flex; align-items:center; justify-content:center;
      margin: 0 auto; width: min(640px, 56vw); max-width: 90vw;
    }
    .seqImage {
      position:absolute; left:50%; top:50%; transform: translate(-50%,-50%) translateY(12px);
      max-width:100%; max-height:100%; width:auto; height:auto; object-fit:contain;
      opacity:0; transition: opacity .42s ease, transform .56s cubic-bezier(.2,.9,.25,1);
      will-change: opacity, transform;
      filter: drop-shadow(0 16px 36px rgba(0,0,0,0.6));
    }
    .seqImage.active {
      opacity:1; transform: translate(-50%,-50%) translateY(0);
    }
    .captionWrap { margin-bottom: 12px; color: #ddd; font-family: 'Microgramma', sans-serif; }
    .captionTitle { color: var(--accent); font-family: 'Microgramma', sans-serif; font-weight:700; text-transform:uppercase; }
    .belowContent { padding: 40px 20px; max-width:1200px; margin:0 auto; color:#ddd; background:transparent; }
  `;

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff" }}>
      <style>{css}</style>

      {/* FRONT PAGE / HERO */}
      <div className="frontPage" ref={heroRef}>
        <div
          className="hero-logo"
          style={{
            opacity: heroVisible && !overlayVisible ? 1 : 1,
            transform: heroVisible ? "scale(1)" : "scale(0.96)",
          }}
        >
          <img src="/np_website.svg" alt="Hero logo" />
        </div>
      </div>

      {/* small left logo that fades when hero has been scrolled past */}
      <img src="/loading_logo.svg" alt="small logo" className={`left-logo ${showLeftLogo ? "show" : ""}`} />

      {/* ===================
          IMAGE SEQUENCE SECTION
          - the wrapper has height = imagesCount * 100vh so scrolling across it steps through images
          - the sticky container keeps images fixed in viewport while scrolling inside wrapper
         ==================== */}
      <section
        className="sequenceWrapper"
        ref={seqRef}
        aria-label="Team image sequence"
        style={{
          // we set a CSS variable to be used by .sequenceSpacer for height
          ["--count"]: TEAM_IMAGES.length,
        }}
      >
        {/* spacer drives the scroll length */}
        <div className="sequenceSpacer" style={{ height: `${TEAM_IMAGES.length * 100}vh` }} />

        {/* sticky area: only becomes visually active once heroPassed is true (we fade images in/out via CSS) */}
        <div
          className="sequenceSticky"
          style={{
            pointerEvents: "none",
            opacity: heroPassed ? 1 : 0,
            transition: "opacity 420ms ease",
          }}
        >
          {/* images stacked, only the active one is visible */}
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {TEAM_IMAGES.map((src, i) => (
              <img
                key={src}
                src={src}
                className={`seqImage ${i === imageIndex && sequenceActive ? "active" : i === imageIndex && !sequenceActive && !sequenceEnded ? "active" : i === imageIndex && sequenceEnded ? "active" : ""}`}
                alt={`team-${i}`}
                style={{ zIndex: i === imageIndex ? 6 : 1 }}
              />
            ))}
          </div>
        </div>

        {/* caption area positioned above the sticky images (left column behavior earlier) */}
        <div style={{ maxWidth: 1200, margin: "24px auto 24px", padding: "0 20px" }}>
          <div className="captionWrap">
            <div className="captionTitle" style={{ fontSize: 20 }}>
              {TEAM_CAPTIONS[imageIndex]}
            </div>
            <div style={{ color: "#ddd", marginTop: 8 }}>{TEAM_TEXTS[imageIndex]}</div>
          </div>
        </div>
      </section>

      {/* ===================
          BELOW: rest of Team text & the rest of the page
          - These are placed below the picture sequence, per your request.
         ==================== */}
      <div className="belowContent" aria-live="polite">
        {/* Here goes the rest of the team text that should be shown after pictures.
            Same content as earlier but now placed below the sequence. */}
        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 6 }}>Team</h2>
        <p style={{ color: "#ddd" }}>
          The Team
        </p>
        <ul>
          <li>Team Leader: Matěj Prokop</li>
          <li>Engineer: Lukáš Moravec</li>
          <li>Finance manager: Lukáš Martin</li>
          <li>Marketing manager: Veronika Lindová</li>
        </ul>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 20 }}>About Us</h2>
        <p style={{ color: "#ddd" }}>
          We are the only Czech team and a top contender in the prestigious international STEM racing competition.
        </p>
        <p style={{ color: "#ddd" }}>
          We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.
        </p>
        <p style={{ color: "#ddd" }}>
          Founded at Nový PORG, NP Racing unites skills in engineering, manufacturing, and marketing.
        </p>

        {/* ... Schedule / Join / Contact etc. follow */}
        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 28 }}>Schedule</h2>
        <p style={{ color: "#ddd" }}>Next up: Poland — Oct 11</p>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 28 }}>Join Us</h2>
        <p style={{ color: "#ddd" }}>
          Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!
        </p>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 28 }}>Contact</h2>
        <p style={{ color: "#ddd" }}>
          For general inquiry:{" "}
          <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">
            prokopmatej@novyporg.cz
          </a>
        </p>

        <div style={{ height: 240 }} />
      </div>
    </div>
  );
}
