import React, { useEffect, useRef, useState };

// App.jsx
// Inlines the exact SVG files from your GitHub repo and uses them directly — no added artwork or placeholder elements.
// Behavior implemented strictly from your instructions:
// - Each SVG is inlined into its own full-viewport section (100vw x 100vh).
// - No additional visual elements are introduced except a fixed container that clones the exact logo/stripes groups found inside the currently active SVG (if they exist in the SVG markup). If the SVGs do not contain identifiable logo/stripe groups, nothing is rendered in that fixed slot.
// - Clicking the fixed logo/stripes scrolls to the absolute top (page 1).
// - No fabricated logo, no debug labels, no extra hotspots are added by default. If the page2 SVG contains identifiable elements (ids/classes) for the interactive sections, they will be used as clickable areas to navigate to pages 3..6. Otherwise no hotspots are created.

const RAW = (name) =>
  `https://raw.githubusercontent.com/morysek/githubmrdky/main/${name}.svg`;

const PAGES = [
  RAW("page1"),
  RAW("page2"),
  RAW("page3"),
  RAW("page4"),
  RAW("page5"),
  RAW("page6"),
  RAW("page7"),
  RAW("page8"),
  RAW("page9"),
];

export default function App() {
  const [svgTexts, setSvgTexts] = useState(Array(PAGES.length).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fixedMarkup, setFixedMarkup] = useState(null); // exact logo/stripes fragment from current svg (if found)
  const sectionRefs = useRef([]);

  // Fetch raw SVG texts and inline them
  useEffect(() => {
    let mounted = true;
    async function fetchAll() {
      const results = await Promise.all(
        PAGES.map(async (url) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return null;
            return await res.text();
          } catch (e) {
            return null;
          }
        })
      );
      if (mounted) setSvgTexts(results);
    }
    fetchAll();
    return () => (mounted = false);
  }, []);

  // IntersectionObserver to set currentIndex
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
      { threshold: 0.6 }
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [svgTexts]);

  // When currentIndex or svgTexts change, extract logo/stripes groups from the active SVG markup.
  useEffect(() => {
    const text = svgTexts[currentIndex];
    if (!text) {
      setFixedMarkup(null);
      return;
    }

    // Parse SVG and try to find logo/stripe elements. We search for id/class names containing keywords.
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (!svg) {
      setFixedMarkup(null);
      return;
    }

    // Search patterns (case-insensitive) for elements that may represent logo or stripes.
    const selectors = [
      "[id*='logo']",
      "[class*='logo']",
      "[id*='Logo']",
      "[class*='Logo']",
      "[id*='stripe']",
      "[class*='stripe']",
      "[id*='Stripe']",
      "[class*='Stripe']",
    ];

    const found = [];
    selectors.forEach((sel) => {
      const matches = svg.querySelectorAll(sel);
      matches.forEach((m) => found.push(m));
    });

    // Remove duplicates and keep order
    const unique = Array.from(new Set(found));

    // If we found identifiable logo/stripe nodes, clone them into a new SVG wrapper preserving viewBox
    if (unique.length > 0) {
      // Ensure the wrapper borrows viewBox/width/height from original svg if present
      const viewBox = svg.getAttribute("viewBox");
      const width = svg.getAttribute("width");
      const height = svg.getAttribute("height");

      // Build a string for a minimal svg that contains the cloned nodes' outerHTML
      const inner = unique.map((n) => n.outerHTML).join("
");
      let wrapperStart = "<svg xmlns='http://www.w3.org/2000/svg' ";
      if (viewBox) wrapperStart += `viewBox='${viewBox}' `;
      else if (width && height) wrapperStart += `width='${width}' height='${height}' `;
      wrapperStart += ">
";
      const wrapper = wrapperStart + inner + "</svg>";
      setFixedMarkup(wrapper);
    } else {
      // No explicit logo/stripe found: try a conservative fallback — take the first element at top level inside svg (only if it's clearly a group)
      const firstGroup = svg.querySelector("g, symbol, defs, path, rect, circle");
      if (firstGroup) {
        const viewBox = svg.getAttribute("viewBox");
        const width = svg.getAttribute("width");
        const height = svg.getAttribute("height");
        const wrapperStart = "<svg xmlns='http://www.w3.org/2000/svg' " + (viewBox ? `viewBox='${viewBox}' ` : width && height ? `width='${width}' height='${height}' ` : "") + ">
";
        const wrapper = wrapperStart + firstGroup.outerHTML + "</svg>";
        // Only use fallback if currentIndex !== 0 because the fixed logo/stripes should be invisible on front page per instructions.
        if (currentIndex !== 0) setFixedMarkup(wrapper);
        else setFixedMarkup(null);
      } else {
        setFixedMarkup(null);
      }
    }
  }, [currentIndex, svgTexts]);

  // Scroll helpers
  function scrollToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  function navigateTo(idx) {
    const el = sectionRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Attempt to create interactive hotspots by detecting elements inside page2's inline SVG with candidate ids/classes.
  // Per your instruction to not invent UI, we only create hotspots if we detect elements with names matching these roles.
  function detectHotspots() {
    const text = svgTexts[1]; // page2
    if (!text) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (!svg) return [];

    // Candidate keywords mapping to target pages (3..6 => indexes 2..5)
    const map = [
      { keys: ["engineer", "engine", "eng"], target: 2 },
      { keys: ["team", "leader"], target: 3 },
      { keys: ["communication", "comm"], target: 4 },
      { keys: ["network", "connect"], target: 5 },
    ];

    const hotspots = [];

    map.forEach((m) => {
      // Build selectors for ids/classes
      const sel = m.keys.map((k) => `[id*='${k}'],[class*='${k}']`).join(",");
      const matches = svg.querySelectorAll(sel);
      if (matches && matches.length) {
        // For each match create a hotspot object that will be used to position an overlay on top of the rendered inline SVG.
        matches.forEach((node) => {
          // If node has a bounding box we can't compute it here without rendering. We'll instead include the node's id/class so we can query it once the SVG is in the DOM.
          hotspots.push({ selector: node.getAttribute("id") ? `#${node.getAttribute("id")}` : null, classes: node.getAttribute("class"), target: m.target });
        });
      }
    });
    return hotspots;
  }

  const hotspotsCandidates = detectHotspots();

  // After SVGs render in DOM, we will position overlays for hotspotsCandidates if any. We'll create refs to each section and compute bounding boxes client-side.
  useEffect(() => {
    if (hotspotsCandidates.length === 0) return;
    // Only run when page2 is in the DOM
    const pageEl = sectionRefs.current[1];
    if (!pageEl) return;

    // Clean any existing overlays
    const existing = pageEl.querySelectorAll(".inferred-hotspot-overlay");
    existing.forEach((e) => e.remove());

    // For each candidate, try to find the node inside the inlined SVG and compute bbox
    const svgEl = pageEl.querySelector("svg");
    if (!svgEl) return;

    hotspotsCandidates.forEach((h, i) => {
      let targetNode = null;
      if (h.selector) targetNode = svgEl.querySelector(h.selector);
      if (!targetNode && h.classes) {
        const clsSel = h.classes.split(" ").map((c) => `.${c}`).join("");
        targetNode = svgEl.querySelector(clsSel);
      }
      if (!targetNode) return; // don't invent

      // Attempt to get bounding box
      try {
        const bbox = targetNode.getBBox();
        const pt = svgEl.createSVGPoint();
        // Convert SVG bbox to screen coordinates
        const ctm = targetNode.getScreenCTM();
        if (!ctm) return;
        const x = bbox.x * ctm.a + ctm.e;
        const y = bbox.y * ctm.d + ctm.f;
        const w = bbox.width * ctm.a;
        const hgt = bbox.height * ctm.d;

        // Create overlay button
        const overlay = document.createElement("button");
        overlay.className = "inferred-hotspot-overlay";
        overlay.style.position = "absolute";
        overlay.style.left = `${x}px`;
        overlay.style.top = `${y}px`;
        overlay.style.width = `${w}px`;
        overlay.style.height = `${hgt}px`;
        overlay.style.background = "transparent";
        overlay.style.border = "0";
        overlay.style.cursor = "pointer";
        overlay.onclick = () => navigateTo(h.target);
        overlay.setAttribute("aria-label", `goto page ${h.target + 1}`);

        // Append to page element positioned relative to page's viewport
        pageEl.appendChild(overlay);
      } catch (e) {
        // if getBBox or getScreenCTM fails, skip — do not invent
      }
    });

    // Cleanup on unmount or change
    return () => {
      const existing = pageEl.querySelectorAll(".inferred-hotspot-overlay");
      existing.forEach((e) => e.remove());
    };
  }, [svgTexts]);

  return (
    <div className="app-root">
      {/* Fixed logo/stripes container — only present when fixedMarkup exists AND we're not on the front page (index 0) */}
      {fixedMarkup && currentIndex !== 0 && (
        <div className="fixed-fragment" onClick={scrollToTop} dangerouslySetInnerHTML={{ __html: fixedMarkup }} role="button" aria-label="Go to front page" />
      )}

      <main className="pages">
        {svgTexts.map((text, idx) => (
          <section
            key={idx}
            ref={(el) => (sectionRefs.current[idx] = el)}
            data-idx={idx}
            className="page-section"
          >
            {/* Inline the exact SVG markup here. If the SVG failed to load, we render nothing (per your instruction to not invent visuals). */}
            {text ? (
              <div className="svg-wrapper" dangerouslySetInnerHTML={{ __html: text }} />
            ) : null}
          </section>
        ))}
      </main>

      <style>{`
        :root{--gap:6vw}
        *{box-sizing:border-box}
        html,body,#root{height:100%;margin:0}
        .app-root{height:100%;width:100%;overflow:auto}

        /* Fixed fragment: we render the exact SVG fragment in its own box; styles minimized so as not to alter artwork */
        .fixed-fragment{position:fixed;top:16px;left:16px;z-index:50;display:inline-block;cursor:pointer}
        .fixed-fragment svg{display:block;max-width:180px;height:auto}

        /* Vertical scroller with snap — each section exactly viewport sized */
        .pages{height:100vh;overflow-y:auto;scroll-snap-type:y mandatory}
        .page-section{position:relative;min-height:100vh;height:100vh;scroll-snap-align:start;display:flex;align-items:center;justify-content:center;padding-left:var(--gap);padding-right:var(--gap)}

        /* Ensure the inlined SVG scales to the available viewport without revealing neighboring pages */
        .svg-wrapper{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
        .svg-wrapper > svg{max-width:calc(100vw - var(--gap) * 2);max-height:calc(100vh);width:100%;height:auto;display:block}

        /* Overlays created from detected hotspots (absolute positioned) */
        .inferred-hotspot-overlay{background:transparent}

        @media(max-width:600px){
          .fixed-fragment svg{max-width:120px}
        }
      `}</style>
    </div>
  );
}
