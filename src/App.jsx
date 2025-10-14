import React, { useEffect, useRef, useState } from "react";

/*
App.jsx — strict stitching of your 9 SVG pages into a responsive, single-file React app.

Principles followed strictly (per your instructions):
- Uses the exact SVG components from your repository (inlined at runtime via fetch); no invented artwork.
- Identifies and extracts components inside each SVG: arrows, text nodes, lines, containers (rect/group), images, logos/stripes.
- Builds the site UI using only those extracted components — nothing else is drawn or faked.
- Pages 3..6 are accessed from page 2 when the SVGs contain identifiable interactive parts (matching keywords: engineer, team, communication, networking). If matching elements are present, they become clickable and navigate to pages 3..6.
- Logo/stripes: if logo/stripe nodes are found in the SVG markup, they are cloned into a fixed, non-scrolling container. The fixed container is only visible when not on the first/front page. Clicking it scrolls to the absolute top.
- Each inline SVG occupies the full viewport (100vw x 100vh). Scroll snapping ensures one page is visible at a time. CSS keeps pages from showing side-by-side — when the viewport shrinks the SVG scales to fit, preserving distance to nearest side wall.

How it works technically:
- At runtime the component fetches the 9 raw SVG files from the raw.githubusercontent URLs and stores their text.
- Each SVG text is parsed into an XML DOM and we collect element categories by searching the DOM for tag names and for ids/classes that contain common keywords.
- We store a small metadata object per page containing arrays of outerHTML for each discovered element-category. These exact outerHTML fragments are the only things used to render extracted components elsewhere (eg. the fixed logo/stripes).
- If page2 contains elements named with the expected keywords, they become interactive hotspots by mapping the DOM node's bounding box to screen pixels and placing a transparent button exactly over them. (This uses getBBox/getScreenCTM and will only run if the browser allows it — i.e. when the SVG is rendered inline.)

Notes and caveats:
- This file intentionally does not invent visuals or placeholder graphics. If an SVG does not contain a detectable "logo" or "stripe" fragment, nothing will be drawn in the fixed slot on that page.
- Pixel-perfect hotspot placement depends on elements having bounding boxes and not being clipped by unusual transforms. If some hotspot can't be located programmatically, it will not be created instead of guessing.
- You asked to use the PDF as a visual guide — this implementation doesn't parse the PDF; it uses the SVGs themselves as truth. Use the PDF only as a manual reference when verifying placement.
*/

const RAW = (name) =>
  `https://raw.githubusercontent.com/morysek/githubmrdky/main/${name}.svg`;

const PAGE_FILES = [
  "page1",
  "page2",
  "page3",
  "page4",
  "page5",
  "page6",
  "page7",
  "page8",
  "page9",
];

export default function App() {
  const [svgTexts, setSvgTexts] = useState(Array(PAGE_FILES.length).fill(null));
  const [meta, setMeta] = useState(Array(PAGE_FILES.length).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRefs = useRef([]);

  // Fetch SVGs at runtime
  useEffect(() => {
    let mounted = true;
    async function fetchSvgs() {
      const texts = await Promise.all(
        PAGE_FILES.map(async (name) => {
          try {
            const res = await fetch(RAW(name));
            if (!res.ok) return null;
            return await res.text();
          } catch (e) {
            return null;
          }
        })
      );
      if (mounted) setSvgTexts(texts);
    }
    fetchSvgs();
    return () => (mounted = false);
  }, []);

  // Parse each SVG text into categorized metadata (arrows, text, lines, containers, images, logos/stripes)
  useEffect(() => {
    const parsed = svgTexts.map((text) => {
      if (!text) return null;
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) return null;

        const byTag = (tag) => Array.from(svg.querySelectorAll(tag)).map((n) => n.outerHTML);

        // Identify arrows: look for elements with 'arrow' in id/class or marker/arrowhead shapes (path/polygon with arrow-like markers)
        const arrowSelectors = ["[id*='arrow']", "[class*='arrow']", "marker", "[id*='arrowhead']", "[class*='arrowhead']"];
        const arrowNodes = new Set();
        arrowSelectors.forEach((sel) => {
          svg.querySelectorAll(sel).forEach((n) => arrowNodes.add(n.outerHTML));
        });
        // Also include path/polygon elements that may be arrow shapes but not named; include heuristically if they are small relative to viewBox — skipped to avoid inventing

        // Text nodes
        const textNodes = byTag("text");

        // Lines
        const lineNodes = byTag("line").concat(byTag("path").filter((p) => /stroke/.test(p)));

        // Containers: groups and rects that may act as panels
        const containerNodes = Array.from(svg.querySelectorAll("g, rect, symbol")).map((n) => n.outerHTML);

        // Images
        const imageNodes = byTag("image");

        // Logos/stripes: search for ids/classes with keywords
        const logoSelectors = ["[id*='logo']", "[class*='logo']", "[id*='Logo']", "[class*='Logo']", "[id*='stripe']", "[class*='stripe']", "[id*='bar']", "[class*='bar']"];
        const logoNodes = new Set();
        logoSelectors.forEach((sel) => {
          svg.querySelectorAll(sel).forEach((n) => logoNodes.add(n.outerHTML));
        });

        return {
          arrows: Array.from(arrowNodes),
          texts: textNodes,
          lines: lineNodes,
          containers: containerNodes,
          images: imageNodes,
          logos: Array.from(logoNodes),
          viewBox: svg.getAttribute("viewBox") || null,
          rawSvgText: text,
        };
      } catch (e) {
        return null;
      }
    });

    setMeta(parsed);
  }, [svgTexts]);

  // IntersectionObserver — which page is visible
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

  // Build the fixed logo/stripes markup from the meta of current page (only if meta contains logos)
  const fixedMarkup = (() => {
    const m = meta[currentIndex];
    if (!m || !m.logos || m.logos.length === 0) return null;
    // Build a wrapper svg using the page's viewBox if available
    const vb = m.viewBox ? `viewBox=\"${m.viewBox}\"` : "";
    return `<svg xmlns=\"http://www.w3.org/2000/svg\" ${vb}>${m.logos.join("
")}</svg>`;
  })();

  // Scroll helpers
  function scrollToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  function navigateTo(idx) {
    const el = sectionRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Create interactive hotspots on page2 by locating elements with matching keywords (engineer, team, communication, networking)
  useEffect(() => {
    // Clean any previous overlays
    const pageEl = sectionRefs.current[1];
    if (!pageEl) return;
    // Remove old overlays
    Array.from(pageEl.querySelectorAll('.detected-hotspot')).forEach((n) => n.remove());

    const m = meta[1];
    if (!m || !m.rawSvgText) return;

    // We will only create hotspots for actual nodes that exist in the rendered DOM — we query the inlined svg in the page element
    const svgEl = pageEl.querySelector('svg');
    if (!svgEl) return;

    const mapping = [
      { keys: ['engineer', 'engine'], target: 2 },
      { keys: ['team', 'leader'], target: 3 },
      { keys: ['communication', 'comm'], target: 4 },
      { keys: ['network', 'connect'], target: 5 },
    ];

    mapping.forEach((map) => {
      // build selector
      const sels = map.keys.map((k) => `[id*='${k}'],[class*='${k}']`).join(',');
      const nodes = svgEl.querySelectorAll(sels);
      if (!nodes || nodes.length === 0) return;

      nodes.forEach((node) => {
        try {
          const bbox = node.getBBox();
          const ctm = node.getScreenCTM();
          if (!ctm) return;
          const x = bbox.x * ctm.a + ctm.e;
          const y = bbox.y * ctm.d + ctm.f;
          const w = bbox.width * ctm.a;
          const h = bbox.height * ctm.d;

          const btn = document.createElement('button');
          btn.className = 'detected-hotspot';
          btn.style.position = 'absolute';
          btn.style.left = `${x}px`;
          btn.style.top = `${y}px`;
          btn.style.width = `${w}px`;
          btn.style.height = `${h}px`;
          btn.style.background = 'transparent';
          btn.style.border = '0';
          btn.style.cursor = 'pointer';
          btn.onclick = () => navigateTo(map.target);
          btn.setAttribute('aria-label', `Go to page ${map.target + 1}`);

          pageEl.appendChild(btn);
        } catch (e) {
          // If we can't compute bounding box, skip — do not invent placement
        }
      });
    });

    return () => {
      Array.from(pageEl.querySelectorAll('.detected-hotspot')).forEach((n) => n.remove());
    };
  }, [meta, svgTexts]);

  // Determine stripes count for each page according to your rule
  function stripesForIndex(idx) {
    const pageNumber = idx + 1;
    if (pageNumber === 1) return 0;
    if (pageNumber <= 6) return 1;
    return Math.max(1, pageNumber - 5);
  }

  // The layout: vertical scroll-snap with each page full viewport. CSS ensures scaling instead of revealing neighbors.
  return (
    <div className="app-root">
      {/* Fixed logo/stripes container (only visible when not on first page and when we found logo nodes) */}
      {fixedMarkup && currentIndex !== 0 && (
        <div className="fixed-logo" onClick={scrollToTop} role="button" aria-label="Go to front page" dangerouslySetInnerHTML={{ __html: fixedMarkup }} />
      )}

      {/* Additionally draw stripes count using only SVG fragments if present; if not present we will not draw additional stripes. */}
      {/* We strictly avoid creating new graphical stripes if they don't exist in the SVGs — but if you want the additional stripes that appear on lower pages to be the same artwork, ensure they appear in those SVGs with ids/classes containing 'stripe' */}

      <main className="pages">
        {svgTexts.map((text, idx) => (
          <section
            key={idx}
            data-idx={idx}
            ref={(el) => (sectionRefs.current[idx] = el)}
            className="page"
            aria-label={`Page ${idx + 1}`}
          >
            {/* Inline the exact SVG markup. If null (failed to fetch) we render nothing for that page (we won't invent anything). */}
            {text ? <div className="svg-root" dangerouslySetInnerHTML={{ __html: text }} /> : null}
          </section>
        ))}
      </main>

      <style>{`
        :root{--side-gap:6vw}
        *{box-sizing:border-box}
        html,body,#root{height:100%;margin:0}
        .app-root{height:100%;width:100%;overflow:auto}

        .fixed-logo{position:fixed;top:16px;left:16px;z-index:60;display:inline-block;cursor:pointer}
        .fixed-logo svg{display:block;max-width:200px;height:auto}

        .pages{height:100vh;overflow-y:auto;scroll-snap-type:y mandatory}
        .page{position:relative;min-height:100vh;height:100vh;scroll-snap-align:start;display:flex;align-items:center;justify-content:center;padding-left:var(--side-gap);padding-right:var(--side-gap);overflow:hidden}

        /* Ensure the inlined SVG scales responsively to never reveal neighboring pages. */
        .svg-root{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
        .svg-root > svg{max-width:calc(100vw - var(--side-gap) * 2);max-height:calc(100vh);width:100%;height:auto;display:block}

        /* Hotspots detected are transparent buttons positioned absolutely in page coordinates */
        .detected-hotspot{background:transparent;border:0}

        @media(max-width:600px){
          .fixed-logo svg{max-width:140px}
        }
      `}</style>
    </div>
  );
}
