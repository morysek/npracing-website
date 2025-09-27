// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* -------------------------------------------------
   Helpers
   ------------------------------------------------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Right/left “tags” to match the reference image
const RIGHT_TAGS = ["waapi", "timeline", "stagger", "svg", "spring", "animation"];
const LEFT_TAGS = ["timer", "easings", "draggable", "scroll", "scope"];

/* -------------------------------------------------
   Small reusable NP logo (same SVG, positioned via CSS)
   ------------------------------------------------- */
function NPLogo({ size = 300 }) {
  return (
    <svg
      alt="NP Racing Logo"
      width={size}
      viewBox="0 0 104.1419 30.962112"
      height={(size * 30.96) / 104.14}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* (original paths unchanged) */}
      <g transform="translate(-54.124261,-130.25079)">
        <g transform="translate(0,-2.4052947)" style={{ fontSize: 17.6389, fontFamily: "Inconsolata, monospace", fill: "#fff", strokeWidth: 0.264583 }}>
          <g transform="scale(1.1966041,0.83569829)" style={{ fontSize: 14.1111, fontFamily: "Inconsolata, monospace", letterSpacing: 5.29167, fill: "#fff", strokeWidth: 2.21112 }}>
            <path d="m 53.020878,195.78621 h -2.060221 l -2.610554,-2.65289 h -1.509887 v 2.65289 H 45.23155 v -7.02733 h 6.02544 q 1.580443,0 1.580443,1.22767 v 1.91911 q 0,0.889 -0.818444,1.22766 h -1.693332 z m -1.763888,-4.41678 v -0.84666 q 0,-0.55033 -0.465666,-0.55033 h -3.951108 v 1.96144 h 3.951108 q 0.465666,0 0.465666,-0.56445 z" />
            <path d="m 69.474419,195.78621 h -1.566332 l -0.917222,-1.53811 h -4.571996 l -0.874888,1.53811 h -1.622777 l 3.965219,-7.05555 h 1.566332 z m -3.217331,-2.82222 -1.580443,-2.86455 -1.566332,2.86455 z" />
            <path d="m 84.756759,194.1211 q 0,0.98778 -0.380999,1.32644 -0.366889,0.33867 -1.368777,0.33867 h -4.190997 q -1.001888,0 -1.382888,-0.33867 -0.366888,-0.33866 -0.366888,-1.32644 v -3.71122 q 0,-.97367 .366888,-1.31233 .381,-.35278 1.382888,-.35278 h 4.190997 q 1.693332,.0141 1.749776,1.17122 v 1.03011 h -1.636887 v -.94544 h -4.416775 v 4.45911 h 4.416775 v -1.03011 h 1.636887 z" />
            <path d="m 95.438876,195.78621 h -1.622777 v -7.05555 h 1.622777 z" />
            <path d="m 112.80966,195.78621 h -1.42522 l -5.37633,-4.93889 v 4.93889 h -1.49578 v -7.05555 h 1.397 l 5.43278,4.92477 v -4.92477 h 1.46755z" />
            <path d="m 130.26509,194.1211 q 0,.98778 -.381,1.32644 -.36688,.33867 -1.36877,.33867 h -4.84011 q -1.00189,0 -1.38289,-.33867 -.36689,-.33866 -.36689,-1.32644 v -3.69711 q 0,-.98778 .36689,-1.32644 .381,-.33867 1.38289,-.33867 h 4.84011 q 1.04422,0 1.397,.36689 .35277,.35278 .35277,1.38289 h -1.59455 v -.49389 h -5.10822 v 4.445 h 5.10822 v -1.56634 h -2.94922 v -1.19944 h 4.54377 z" />
          </g>
        </g>
        <path style={{ fill: "#ffcc00", strokeWidth: 1.61928, strokeLinecap: "round" }} d="m 64.083427,130.25096 -9.959082,21.06022 h 4.532023 l 9.959082,-21.06022 z m 11.342977,0 -9.959082,21.06022 h 1.139465 4.505151 3.62872 l 9.959082,-21.06022 h -3.628719 -4.505152 z m 14.738635,0 -9.959082,21.06022 h 1.783354 v 5.1e-4 h 13.889591 l 0.535368,-1.13223 h -0.001 l 9.42371,-19.9285 H 97.007033 91.94791 Z" />
        <path style={{ fill: "#fff", strokeLinejoin: "round" }} d="m 111.60859,130.25083 c -0.96683,0.005 -1.91905,0.53479 -2.3828,1.51567 L 101.76888,147.53246 100,151.27435 h 5.85287 l 0.69867,-1.47846 h 5.2e-4 l 5.77949,-12.22045 11.88247,12.88242 c 1.27166,1.38021 3.53608,1.03468 4.33824,-0.66197 l 6.74016,-14.25185 h 16.1463 l -2.44895,5.17747 h -8.20725 l -2.50217,5.29115 h 12.38477 c 1.02253,-1.7e-4 1.95344,-0.58946 2.39107,-1.51361 l 4.95267,-10.46861 c 0.83036,-1.75547 -0.45016,-3.77762 -2.3921,-3.77755 h -21.99814 c -1.02309,-4.3e-4 -1.95475,0.58896 -2.39262,1.51361 l -5.7795,12.22096 -11.88247,-12.88294 c -0.53648,-0.58227 -1.24991,-0.85758 -1.95544,-0.85369 z" />
      </g>
    </svg>
  );
}

/* -------------------------------------------------
   3D Model with “appear from center” animation
   - animation is driven by scroll progress (0 → 1)
   ------------------------------------------------- */
function InteractiveModel({ onModelLoaded, progress, scale = 600000, isMobile }) {
  const obj = useLoader(OBJLoader, "/models/F1.obj");
  const group = useRef();

  useEffect(() => {
    if (!obj) return;
    obj.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material) {
          c.material.transparent = true;
        }
      }
    });
    onModelLoaded && onModelLoaded(obj);
  }, [obj, onModelLoaded]);

  useFrame(() => {
    if (!group.current) return;

    // Car “appearance” window
    const p = clamp((progress - 0.18) / 0.52); // starts ~18%, ends ~70% scroll
    const eased = easeInOutCubic(p);

    // Scale up from nothing and push forward from Z depth
    const fromZ = isMobile ? 280000 : 420000;
    group.current.position.set(0, (1 - eased) * (isMobile ? 2.5 : 4), -fromZ * (1 - eased));
    group.current.rotation.y = (1 - eased) * 0.45;
    group.current.scale.setScalar(0.0001 + eased); // 0→1

    if (obj) {
      obj.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material.opacity = clamp(eased); // fade in
        }
      });
    }
  });

  return (
    <group ref={group}>
      <primitive object={obj} scale={scale} position={[0, 0, 0]} />
    </group>
  );
}

/* -------------------------------------------------
   LabelsFollower
   - Projects model-space anchors to 2D and draws “reference image” style
     right/left lines with text at the page edges (not over the model)
   - Uses polylines with a short diagonal + long horizontal to the edge
   - Visibility fades in after mid-scroll
   ------------------------------------------------- */
function LabelsFollower({
  modelObjRef,
  anchorsRef,
  labelDomRefs,
  lineRefs,
  progress,
  rightCount,
}) {
  const { camera, size } = useThree();
  const tmp = useRef(new THREE.Vector3());

  useFrame(() => {
    const model = modelObjRef.current;
    const anchors = anchorsRef.current;
    if (!model || !anchors || !anchors.length) return;

    const total = anchors.length;
    const edgePadding = 20;
    const linePadToText = 14;
    const alpha = clamp((progress - 0.52) / 0.2); // show labels in latter half

    for (let i = 0; i < total; i++) {
      const isRight = i < rightCount;
      const labelEl = labelDomRefs.current[i];
      const poly = lineRefs.current[i];
      if (!labelEl || !poly) continue;

      // Project model anchor to screen coords
      tmp.current.copy(anchors[i]);
      model.localToWorld(tmp.current);
      tmp.current.project(camera);

      const ax = (tmp.current.x * 0.5 + 0.5) * size.width;
      const ay = (-tmp.current.y * 0.5 + 0.5) * size.height;

      // Edge-aligned label positions
      const labelRect = labelEl.getBoundingClientRect();
      const y = ay; // keep y aligned with the anchor
      const edgeX = isRight ? size.width - edgePadding : edgePadding;

      // Absolute label placement at the page edge
      const left = isRight ? size.width - edgePadding - labelRect.width : edgePadding;
      labelEl.style.transform = `translate3d(${left}px, ${y - labelRect.height / 2}px, 0)`;
      labelEl.style.opacity = tmp.current.z < 1 ? String(alpha) : "0";

      // Polyline points: anchor -> diagonal elbow -> edge before text
      const dx = isRight ? 120 : -120;
      const dy = isRight ? -60 : 60;
      const elbowX = ax + dx;
      const elbowY = ay + dy;
      const endX = isRight ? left - linePadToText : left + labelRect.width + linePadToText;
      const endY = elbowY;

      poly.setAttribute(
        "points",
        `${ax},${ay} ${elbowX},${elbowY} ${endX},${endY}`
      );
      poly.setAttribute("opacity", tmp.current.z < 1 ? String(alpha) : "0");
    }
  });

  return null;
}

/* -------------------------------------------------
   Main App
   • Logo is outside of Canvas and attached to the page (site-level)
   • Scroll scrubs the entire intro; you can scroll back to restart it
   • After intro, the logo lands at the top-left and stays there
   • Car appears from the middle via animated scale/position
   • Tags styled like the provided picture (edge-aligned with polylines)
   ------------------------------------------------- */
export default function App() {
  // Refs
  const heroRef = useRef(null);
  const heroLogoRef = useRef(null);

  const modelObjRef = useRef(null);
  const anchorsRef = useRef([]); // local-space anchors (right first, then left)

  const labelDomRefs = useRef([]); // DOM refs to all labels (RIGHT + LEFT)
  const lineRefs = useRef([]); // SVG polylines for connectors

  // State
  const [isMobile, setIsMobile] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 scroll progress through hero

  // Responsive
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Scroll-driven intro (0..1).
     The hero section is ~200vh so you can scrub back to the beginning. */
  useEffect(() => {
    const onScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const vh = window.innerHeight;
      const rect = hero.getBoundingClientRect();
      const totalScrollable = hero.offsetHeight - vh;
      const scrolled = clamp(-rect.top, 0, totalScrollable);
      const t = totalScrollable > 0 ? scrolled / totalScrollable : 0;
      setProgress(clamp(t));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Logo transforms based on scroll progress (center → top-left)
  useEffect(() => {
    const el = heroLogoRef.current;
    if (!el) return;

    const startSize = isMobile ? 260 : 520;
    const endSize = isMobile ? 56 : 90;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Final resting spot at top-left of the site (site-level, not canvas)
    const finalLeft = 16;
    const finalTop = 14;

    const eased = easeInOutCubic(clamp(progress));
    const dx = finalLeft - centerX;
    const dy = finalTop - centerY;
    const size = startSize + (endSize - startSize) * eased;
    const scale = size / startSize;

    el.style.transform = `translate3d(${dx * eased}px, ${dy * eased}px, 0) scale(${scale})`;
    el.style.transformOrigin = "left top";
  }, [progress, isMobile]);

  // Create labels + SVG overlay once (and rebuild on breakpoint)
  useEffect(() => {
    labelDomRefs.current = [];
    lineRefs.current = [];

    // Remove old overlay if any
    const prev = document.getElementById("__npr_svg_overlay_lines");
    if (prev) prev.remove();

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "__npr_svg_overlay_lines");
    svg.style.position = "fixed";
    svg.style.left = "0";
    svg.style.top = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "6"; // below the logo, above canvas
    svg.style.overflow = "visible";
    svg.style.mixBlendMode = "normal";
    document.body.appendChild(svg);

    // Shared label style to match the reference: edge text, no background
    const baseLabelCSS = {
      position: "absolute",
      left: "0px",
      top: "0px",
      transform: "translate3d(-9999px,-9999px,0)", // off-screen until positioned
      pointerEvents: "none",
      opacity: "0",
      color: "#d6d3ce",
      fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
      fontWeight: 700,
      letterSpacing: "0.02em",
      textTransform: "lowercase",
      fontSize: isMobile ? "12px" : "14px",
      lineHeight: "1",
      padding: "0",
      background: "transparent",
      border: "none",
      textShadow: "none",
    };

    // Create all labels (RIGHT first, then LEFT) to align with anchors order
    const texts = [...RIGHT_TAGS, ...LEFT_TAGS];
    texts.forEach((text, idx) => {
      const label = document.createElement("div");
      Object.assign(label.style, baseLabelCSS);
      label.textContent = text;
      document.body.appendChild(label);
      labelDomRefs.current.push(label);

      // Connector polyline
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      poly.setAttribute("fill", "none");
      poly.setAttribute("stroke", "#8b8781");
      poly.setAttribute("stroke-width", String(isMobile ? 1 : 1.5));
      poly.setAttribute("stroke-linecap", "round");
      poly.setAttribute("stroke-linejoin", "round");
      poly.setAttribute("opacity", "0");
      poly.style.shapeRendering = "crispEdges";
      svg.appendChild(poly);
      lineRefs.current.push(poly);
    });

    return () => {
      labelDomRefs.current.forEach((el) => el && el.remove());
      svg.remove();
    };
  }, [isMobile]);

  // Compute anchors when model loads: right side first, then left side
  const handleModelLoaded = (loadedObj) => {
    modelObjRef.current = loadedObj;

    const bbox = new THREE.Box3().setFromObject(loadedObj);
    const size = bbox.getSize(new THREE.Vector3());
    const min = bbox.min;
    const max = bbox.max;

    const anchors = [];

    // Right anchors (spread vertically on the model's right)
    for (let i = 0; i < RIGHT_TAGS.length; i++) {
      const t = (i + 1) / (RIGHT_TAGS.length + 1);
      const x = max.x - size.x * 0.02;
      const y = max.y - t * size.y;
      const z = min.z + 0.4 * size.z; // slightly forward
      anchors.push(new THREE.Vector3(x, y, z));
    }

    // Left anchors (spread vertically on the model's left/bottom)
    for (let i = 0; i < LEFT_TAGS.length; i++) {
      const t = (i + 1) / (LEFT_TAGS.length + 1);
      const x = min.x + size.x * 0.02;
      const y = min.y + t * size.y * 0.8; // skew lower
      const z = min.z + 0.6 * size.z;
      anchors.push(new THREE.Vector3(x, y, z));
    }

    anchorsRef.current = anchors;
  };

  // Simple “Back to top” button for convenience
  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Heights: hero is long enough to scrub the animation; content below creates
  // natural scroll so you can move past the intro.
  const heroHeightVh = 220;

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#191919", position: "relative" }}>
      <style>{`
        :root {
          --bg:#191919;
          --edge-text:#d6d3ce;
          --edge-line:#8b8781;
          --gold:#ffcc00;
        }
        html, body, #root { height: 100%; background: var(--bg); }
        body { margin: 0; overscroll-behavior-y: none; }
        .sticky-layer { position: sticky; top: 0; height: 100vh; width: 100%; }
        .hero-content { width: min(1100px, 92vw); margin: 0 auto; padding-top: ${isMobile ? 80 : 100}px; color: #e9e7e4; }
        .backToTop {
          position: fixed; right: 16px; bottom: 16px; z-index: 50;
          background: rgba(255,255,255,0.06); color: #f2f2f2; border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px; padding: 10px 14px; font-size: 12px; backdrop-filter: blur(6px);
          cursor: pointer; user-select: none;
        }
        .backToTop:hover { background: rgba(255,255,255,0.1); }
      `}</style>

      {/* HERO (scroll-scrubbed) */}
      <section ref={heroRef} style={{ height: `${heroHeightVh}vh`, position: "relative" }}>
        {/* Sticky visual stack */}
        <div className="sticky-layer" style={{ zIndex: 1, pointerEvents: "none" }}>
          {/* Site-level logo (NOT inside canvas). It scrubs with scroll and ends at top-left. */}
          <div
            ref={heroLogoRef}
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate3d(-50%,-50%,0) scale(1)",
              zIndex: 40,
              pointerEvents: "none",
              willChange: "transform",
            }}
            aria-hidden
          >
            <NPLogo size={isMobile ? 260 : 520} />
          </div>

          {/* Canvas layer (always mounted; opacity rises slightly with progress) */}
          <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none", opacity: 0.999 }}>
            <Canvas
              shadows
              dpr={[1, 2]}
              camera={{ position: [0, 0, isMobile ? 120000 : 220000], fov: 7, near: 10000, far: 800000 }}
              style={{ width: "100%", height: "100%" }}
              onCreated={({ gl, scene }) => {
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
                if (gl.outputColorSpace !== undefined) gl.outputColorSpace = THREE.SRGBColorSpace;
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 0.6;
                scene.background = new THREE.Color(0x191919);
              }}
            >
              <ambientLight intensity={0.12} />
              <directionalLight intensity={1.8} position={[5, 10, 5]} />
              <Suspense fallback={null}>
                <Environment preset="city" background={false} />
                <Center>
                  <InteractiveModel
                    onModelLoaded={handleModelLoaded}
                    progress={progress}
                    isMobile={isMobile}
                    scale={isMobile ? 300000 : 600000}
                  />
                </Center>
                <ContactShadows
                  rotation-x={-Math.PI / 2}
                  position={[0, -1, 0]}
                  width={20}
                  height={20}
                  blur={1}
                  opacity={0.45}
                  far={10}
                />
              </Suspense>

              {/* Tags follower (right + left groups) */}
              <LabelsFollower
                modelObjRef={modelObjRef}
                anchorsRef={anchorsRef}
                labelDomRefs={labelDomRefs}
                lineRefs={lineRefs}
                progress={progress}
                rightCount={RIGHT_TAGS.length}
              />

              <EffectComposer multisampling={4}>
                <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
              </EffectComposer>
            </Canvas>
          </div>
        </div>

        {/* Hero foreground text (optional site copy) */}
        <div className="sticky-layer" style={{ zIndex: 3, pointerEvents: "none" }}>
          <div className="hero-content" style={{ opacity: 0.0 }}>
            {/* Reserved: If you want text during the scroll, place it here */}
          </div>
        </div>
      </section>

      {/* Site content after hero (to prove the logo is site-level and stays top-left after scroll) */}
      <main style={{ minHeight: "160vh", position: "relative", zIndex: 0 }}>
        <div style={{ width: "min(900px, 92vw)", margin: "0 auto", padding: "56px 0", color: "#e8e6e3" }}>
          <h1 style={{ fontSize: isMobile ? 28 : 40, margin: "0 0 14px 0" }}>Welcome to NP Racing</h1>
          <p style={{ opacity: 0.8 }}>
            Scroll back to the top anytime to replay the animation. The logo at the top-left is positioned relative to the site, not the canvas.
          </p>
          <div style={{ height: "120vh" }} />
        </div>
      </main>

      {/* Convenience: back-to-top control */}
      <button className="backToTop" onClick={backToTop} title="Back to the beginning">
        Back to top
      </button>
    </div>
  );
}
