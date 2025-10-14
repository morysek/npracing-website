import React, { useEffect, useRef, useState } from "react";

// App.jsx
// Single-file React app that stitches 9 SVG pages (full-viewport) into a concise scrollable mockup.
// It references the SVGs stored in the user's GitHub repo (raw URLs).
// Behavior implemented:
// - Each page is a full viewport (100vw x 100vh) section with scroll-snap.
// - A fixed logo + stripes element appears when NOT on the front page (page1).
// - Stripes count logic: page2..page6 => 1 stripe; page7 => 2; page8 => 3; page9 => 4.
// - Logo/stripes are fixed and clicking them scrolls to the absolute top (page1).
// - Page2 contains 4 transparent hotspot buttons that navigate to pages 3..6 (Engineer, Team leader, Communication, Networking).
// - The site scales to the viewport so the user never sees multiple pages side-by-side.
// Notes:
// - Replace the SVG URLs below if you move them somewhere else. Currently they point to the raw files in your GitHub repo.
// - This file is intentionally "single-file" for quick prototyping. For production split CSS and components.

const PAGES = [
  "https://raw.githubusercontent.com/morysek/githubmrdky/main/page1.svg",
  "https://raw.githubusercontent.com/morysek/githubmrdky/main/page2.svg",
  "https://raw.githubusercontent.com/morysek/githubmrdky/main/page3.svg",
  "https://raw.githubusercontent.com/morysek/githubmrdky/main/page4.svg",
  "https://raw.githubusercontent.com/morysek/githubmrdky/main/page5.svg",
  "https://raw.githubusercontent.com/morysek/githubmrdky/main/page6.svg",
  "https://raw.githubusercontent.com/morysek/githubmrdky/main/page7.svg",
  "https://raw.githubusercontent.com/morysek/githubmrdky/main/page8.svg",
  "https://raw.githubusercontent.com/morysek/githubmrdky/main/page9.svg",
];

export default function App() {
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // IntersectionObserver to detect which page is currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-idx"));
            setCurrentIndex(idx);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.6 } // 60% visible -> active
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Scroll to top (absolute top / first page)
  function scrollToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  // Navigate to specific page index (0-based)
  function navigateTo(idx) {
    const el = sectionRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Compute number of stripes to display based on page (pageNumber = index+1):
  // page1 -> 0 (hidden). page2..page6 -> 1 stripe. page7->2, page8->3, page9->4.
  function stripesForIndex(idx) {
    const pageNumber = idx + 1;
    if (pageNumber === 1) return 0;
    if (pageNumber <= 6) return 1;
    return Math.max(1, pageNumber - 5);
  }

  return (
    <div ref={containerRef} className="app-root">
      {/* Fixed logo + stripes */}
      <div
        className={`fixed-logo ${currentIndex === 0 ? "hidden" : "visible"}`}
        onClick={scrollToTop}
        role="button"
        tabIndex={0}
        aria-label="Go to front page"
      >
        <div className="logo-box">{/* You asked to keep the exact SVGs for pages; this element mirrors the logo area visually but is rendered as DOM so it stays fixed. */}
          <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="48" height="48" rx="6" fill="#111" />
            <text x="50%" y="52%" fill="#fff" fontSize="10" fontFamily="sans-serif" textAnchor="middle">LOGO</text>
          </svg>
        </div>

        <div className="stripes" aria-hidden>
          {Array.from({ length: stripesForIndex(currentIndex) }).map((_, i) => (
            <div className="stripe" key={i} />
          ))}
        </div>
      </div>

      {/* Scrollable pages */}
      <main className="pages" >
        {PAGES.map((url, idx) => (
          <section
            key={url}
            className="page"
            ref={(el) => (sectionRefs.current[idx] = el)}
            data-idx={idx}
          >
            {/* Use <img> with object-fit: contain so the exact SVG is used unchanged. */}
            <img src={url} alt={`Page ${idx + 1}`} className="page-svg" />

            {/* Hotspots overlay on page2 (index 1): trigger navigation to pages 3..6 */}
            {idx === 1 && (
              <div className="hotspots" aria-hidden>
                {/* These are approximate percentage areas placed on top of the SVG. Adjust percentages to better match your SVG layout if needed. */}
                <button className="hotspot" style={{ top: "18%", left: "8%", width: "36%", height: "20%" }} onClick={() => navigateTo(2)} title="Engineer" />
                <button className="hotspot" style={{ top: "18%", right: "8%", width: "36%", height: "20%" }} onClick={() => navigateTo(3)} title="Team leader" />
                <button className="hotspot" style={{ bottom: "20%", left: "8%", width: "36%", height: "20%" }} onClick={() => navigateTo(4)} title="Communication" />
                <button className="hotspot" style={{ bottom: "20%", right: "8%", width: "36%", height: "20%" }} onClick={() => navigateTo(5)} title="Networking" />
              </div>
            )}

            {/* Optional indicator of which page (for dev/debug) */}
            <div className="page-index-label">{idx + 1}</div>
          </section>
        ))}
      </main>

      <style>{`
        :root{
          --gap-side: 8vw; /* distance from side walls */
          --max-content-width: 1200px; /* keep content from growing too wide */
        }
        *{box-sizing:border-box}
        html,body,#root{height:100%;margin:0}
        .app-root{height:100%;width:100%;overflow:auto}

        /* Fixed logo / stripes */
        .fixed-logo{position:fixed;top:18px;left:18px;display:flex;align-items:center;gap:12px;z-index:40;cursor:pointer;transition:opacity .25s ease, transform .25s ease}
        .fixed-logo.hidden{opacity:0;pointer-events:none;transform:translateY(-6px)}
        .fixed-logo.visible{opacity:1}
        .logo-box{width:48px;height:48px;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center}
        .stripes{display:flex;flex-direction:column;gap:6px;padding-left:6px}
        .stripe{width:28px;height:6px;background:#111;border-radius:3px}

        /* Pages container: vertical scroll with snap */
        .pages{height:100vh;scroll-snap-type:y mandatory;overflow-y:auto}
        .page{position:relative;scroll-snap-align:start;min-height:100vh;height:100vh;display:flex;align-items:center;justify-content:center;padding-left:var(--gap-side);padding-right:var(--gap-side);}

        /* Ensure the SVG image itself scales to fill the viewport while preserving aspect and never showing neighboring pages */
        .page-svg{display:block;max-width: calc(100vw - var(--gap-side) * 2);max-height: calc(100vh - 40px);width:100%;height:auto;object-fit:contain}

        /* Hotspots overlay (transparent buttons) */
        .hotspots{position:absolute;inset:0;pointer-events:none}
        .hotspots .hotspot{position:absolute;border:0;background:transparent;pointer-events:auto}
        .hotspots .hotspot:focus{outline:2px dashed rgba(0,0,0,.6)}

        /* Small page index label for dev */
        .page-index-label{position:absolute;right:calc(var(--gap-side));bottom:18px;background:rgba(255,255,255,0.9);padding:6px 10px;border-radius:8px;font-size:12px}

        /* Responsive: keep distance from side walls and scale down if viewport is narrow or extremely wide */
        @media(min-width:1400px){
          .page-svg{max-width:var(--max-content-width)}
        }

        @media(max-width:600px){
          .fixed-logo{top:12px;left:12px}
          .stripe{width:20px;height:5px}
        }
      `}</style>
    </div>
  );
}
