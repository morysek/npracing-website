// src/App.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Scroll-pinned Team section:
 * - Team section height = items.length * 100vh
 * - .teamInner is position:sticky; top:0 and fills viewport while scrolling through the section
 * - scroll progress inside section drives which item is visible
 */

const TEAM_ITEMS = [
  {
    img: "/images/team1.jpg",
    title: "DRIP",
    caption: "Lead aerodynamicist",
    text:
      "DRIP is our lead aerodynamicist — responsible for CFD, wing geometry and low-drag performance.",
  },
  {
    img: "/images/team2.jpg",
    title: "MORY",
    caption: "Mechanical engineer",
    text:
      "MORY handles the mechanical design and assemblies, optimizing stiffness and reliability.",
  },
  {
    img: "/images/team3.jpg",
    title: "ADAM",
    caption: "Electronics & controls",
    text:
      "ADAM leads the electronics stack and control algorithms which drive the car's systems.",
  },
  {
    img: "/images/team4.jpg",
    title: "MATĚJ",
    caption: "Team lead & strategy",
    text:
      "MATĚJ coordinates the team, competition strategy and external partnerships.",
  },
];

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export default function App() {
  // which item is active (integer index)
  const [activeIndex, setActiveIndex] = useState(0);
  // fractional progress (0..1) across the team section
  const [progress, setProgress] = useState(0);

  const teamRef = useRef(null);
  const rafRef = useRef(null);

  // ensure page loads at top on refresh
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // scroll handler: compute progress inside the team section
  useEffect(() => {
    const el = teamRef.current;
    if (!el) return;

    function onScroll() {
      // bounding rect relative to document
      const rect = el.getBoundingClientRect();
      const docTop = window.scrollY;
      const elTop = docTop + rect.top; // section top in document coords
      const elHeight = el.offsetHeight;
      const vh = window.innerHeight;

      // compute scrollY
      const scrollY = window.scrollY;

      // fraction through the section where 0 = top entering, 1 = fully scrolled past
      // we want the pinned period to be from elTop .. elTop + (elHeight - vh)
      const denom = Math.max(1, elHeight - vh);
      const raw = (scrollY - elTop) / denom;
      const frac = clamp(raw, 0, 1);

      // progress 0..1 across the whole pinned period
      setProgress(frac);

      // determine index: divide into N equal segments
      const n = TEAM_ITEMS.length;
      // map frac in [0,1) -> [0, n), final 1 => n-1
      let idx = Math.min(n - 1, Math.floor(frac * n));
      if (idx < 0) idx = 0;
      setActiveIndex(idx);
    }

    // use RAF-based scroll perf
    let ticking = false;
    function handler() {
      if (ticking) return;
      ticking = true;
      rafRef.current = requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    }

    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    // run once to initialize
    handler();

    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // CSS-in-JS styles (keeps everything in one file)
  // You can extract to CSS files if you prefer.
  return (
    <div style={{ background: "#141414", color: "#eee", minHeight: "100vh", fontFamily: "Workbench, Inter, sans-serif" }}>
      <style>{`
        /* fonts should already be injected elsewhere in your project; these are fallback names */
        .page { min-height: 100vh; }
        .hero { height: 90vh; display:flex; align-items:center; justify-content:center; color:#fff; }
        .hero h1 { color:#ffcc00; font-family: Microgramma, sans-serif; letter-spacing: 0.06em; font-size: clamp(36px, 6vw, 72px); margin:0; }
        
        /* TEAM section */
        .teamSection {
          /* this height controls how much scroll is used to cycle images:
             one viewport-per-item gives good mapping */
          height: ${TEAM_ITEMS.length}00vh; /* e.g. 4 * 100vh */
          position: relative;
          overflow: hidden;
        }
        /* the inner container is sticky to pin over the viewport while user scrolls through the section */
        .teamInner {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          gap: 28px;
        }

        .teamLeft {
          flex: 0 0 220px;
          max-width: 240px;
        }
        .teamLeft h2 { margin:0; color:#ffcc00; font-family: Microgramma, sans-serif; letter-spacing:0.06em; font-size: 28px; }

        .teamCenter {
          flex: 1 1 640px;
          display:flex;
          align-items:center;
          justify-content:center;
          position: relative;
          height: 66vh;
          max-height: 760px;
        }
        .imageStack {
          position: relative;
          width: min(620px, 56vw);
          max-width: 720px;
          height: 100%;
        }
        .imageItem {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 420ms cubic-bezier(.2,.9,.25,1), transform 520ms cubic-bezier(.2,.9,.25,1);
          opacity: 0;
          transform: translateY(8px) scale(0.99);
        }
        .imageItem.visible {
          opacity: 1;
          transform: translateY(0px) scale(1);
        }
        .imageItem img { width:100%; height:100%; object-fit: cover; border-radius: 8px; box-shadow: 0 18px 38px rgba(0,0,0,0.65); }

        .imageCaption {
          margin-top: 10px;
          color: #fff;
          font-family: Microgramma, sans-serif;
          font-weight: 700;
          font-size: 14px;
          text-align: center;
        }

        .teamRight {
          flex: 0 0 320px;
          max-width: 360px;
          color: #ddd;
        }
        .teamRight h3 { color:#ffcc00; margin-top: 0; font-family: Microgramma, sans-serif; }
        .teamRight p { line-height: 1.5; }

        /* responsive stack */
        @media (max-width: 900px) {
          .teamInner { flex-direction: column; padding: 20px; gap: 20px; align-items: center; justify-content: flex-start; }
          .teamLeft { width:100%; text-align:center; order: 0; }
          .teamCenter { order: 1; width:100%; height: 46vh; max-height: 56vh; }
          .teamRight { order: 2; width:100%; max-width:none; padding-bottom: 24px; }
          .imageStack { width: 94%; height:100%; }
        }

        /* rest content */
        .rest { padding: 48px 20px; max-width: 1200px; margin: 0 auto; color:#ddd; }
      `}</style>

      {/* Hero (keeps earlier page structure minimal) */}
      <header className="hero">
        <h1>NP RACING</h1>
      </header>

      {/* TEAM SECTION - pin & scroll-driven cycling */}
      <section ref={teamRef} className="teamSection" aria-label="Team section (scroll to cycle)">
        <div className="teamInner" role="region" aria-roledescription="pinned team scroller">
          <div className="teamLeft" aria-hidden>
            <h2>TEAM</h2>
          </div>

          <div className="teamCenter" aria-live="polite">
            <div className="imageStack" aria-hidden={false}>
              {TEAM_ITEMS.map((it, i) => {
                const isVisible = i === activeIndex;
                return (
                  <div
                    key={it.img}
                    className={`imageItem ${isVisible ? "visible" : ""}`}
                    style={{ zIndex: isVisible ? 5 : 1 }}
                    aria-hidden={!isVisible}
                  >
                    <div style={{ width: "100%", height: "100%" }}>
                      <img src={it.img} alt={`${it.title} ${it.caption}`} />
                      <div className="imageCaption">{it.title} — {it.caption}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="teamRight" aria-live="polite">
            <h3>{TEAM_ITEMS[activeIndex].title}</h3>
            <p>{TEAM_ITEMS[activeIndex].text}</p>
          </aside>
        </div>
      </section>

      {/* After team - normal scrolled content */}
      <main className="rest">
        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>About Us</h2>
        <p>We are the only Czech team and a top contender in the prestigious international STEM racing competition.</p>
        <p>We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.</p>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 28 }}>Schedule</h2>
        <p>Next up: Poland — Oct 11</p>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 28 }}>Join Us</h2>
        <p>Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>

        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 28 }}>Contact</h2>
        <p>For general inquiry: <a href="mailto:prokopmatej@novyporg.cz" style={{ color: "#ffcc00" }}>prokopmatej@novyporg.cz</a></p>

        <div style={{ height: 320 }} />
      </main>
    </div>
  );
}
