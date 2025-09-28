// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* ---------- helpers ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ---------- labels (4) ---------- */
const LABELS = ["TEAM", "JOIN US", "SCHEDULE", "CONTACT"];

/* ---------- NPLogo (kept original SVG paths) ---------- */
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
      {/* original SVG content (unchanged) */}
      <g transform="translate(-54.124261,-130.25079)">
        <g transform="translate(0,-2.4052947)" style={{ fontSize: 17.6389, fontFamily: "Inconsolata, monospace", fill: "#fff", strokeWidth: 0.264583 }}>
          <g transform="scale(1.1966041,0.83569829)" style={{ fontSize: 14.1111, fontFamily: "Inconsolata, monospace", letterSpacing: 5.29167, fill: "#fff", strokeWidth: 2.21112 }}>
            <path d="m 53.020878,195.78621 h -2.060221 l -2.610554,-2.65289 h -1.509887 v 2.65289 H 45.23155 v -7.02733 h 6.02544 q 1.580443,0 1.580443,1.22767 v 1.91911 q 0,0.889 -0.818444,1.22766 h -1.693332 z m -1.763888,-4.41678 v -0.84666 q 0,-0.55033 -0.465666,-0.55033 h -3.951108 v 1.96144 h 3.951108 q 0.465666,0 0.465666,-0.56445 z" />
            <path d="m 69.474419,195.78621 h -1.566332 l -0.917222,-1.53811 h -4.571996 l -0.874888,1.53811 h -1.622777 l 3.965219,-7.05555 h 1.566332 z m -3.217331,-2.82222 -1.580443,-2.86455 -1.566332,2.86455 z" />
            <path d="m 84.756759,194.1211 q 0,0.98778 -0.380999,1.32644 -0.366889,0.33867 -1.368777,0.33867 h -4.190997 q -1.001888,0 -1.382888,-0.33867 -0.366888,-0.33866 -0.366888,-1.32644 v -3.71122 q 0,-0.97367 0.366888,-1.31233 0.381,-0.35278 1.382888,-0.35278 h 4.190997 q 1.693332,0.0141 1.749776,1.17122 v 1.03011 h -1.636887 v -0.94544 h -4.416775 v 4.45911 h 4.416775 v -1.03011 h 1.636887 z" />
            <path d="m 95.438876,195.78621 h -1.622777 v -7.05555 h 1.622777 z" />
            <path d="m 112.80966,195.78621 h -1.42522 l -5.37633,-4.93889 v 4.93889 h -1.49578 v -7.05555 h 1.397 l 5.43278,4.92477 v -4.92477 h 1.46755 z" />
            <path d="m 130.26509,194.1211 q 0,0.98778 -0.381,1.32644 -0.36688,0.33867 -1.36877,0.33867 h -4.84011 q -1.00189,0 -1.38289,-0.33867 -0.36689,-0.33866 -0.36689,-1.32644 v -3.69711 q 0,-0.98778 0.36689,-1.32644 0.381,-0.33867 1.38289,-0.33867 h 4.84011 q 1.04422,0 1.397,0.36689 0.35277,0.35278 0.35277,1.38289 h -1.59455 v -0.49389 h -5.10822 v 4.445 h 5.10822 v -1.56634 h -2.94922 v -1.19944 h 4.54377 z" />
          </g>
        </g>
        <path style={{ fill: "#ffcc00", strokeWidth: 1.61928, strokeLinecap: "round" }} d="m 64.083427,130.25096 -9.959082,21.06022 h 4.532023 l 9.959082,-21.06022 z m 11.342977,0 -9.959082,21.06022 h 1.139465 4.505151 3.62872 l 9.959082,-21.06022 h -3.628719 -4.505152 z m 14.738635,0 -9.959082,21.06022 h 1.783354 v 5.1e-4 h 13.889591 l 0.535368,-1.13223 h -0.001 l 9.42371,-19.9285 H 97.007033 91.94791 Z" />
        <path style={{ fill: "#fff", strokeLinejoin: "round" }} d="m 111.60859,130.25083 c -0.96683,0.005 -1.91905,0.53479 -2.3828,1.51567 L 101.76888,147.53246 100,151.27435 h 5.85287 l 0.69867,-1.47846 h 5.2e-4 l 5.77949,-12.22045 11.88247,12.88242 c 1.27166,1.38021 3.53608,1.03468 4.33824,-0.66197 l 6.74016,-14.25185 h 16.1463 l -2.44895,5.17747 h -8.20725 l -2.50217,5.29115 h 12.38477 c 1.02253,-1.7e-4 1.95344,-0.58946 2.39107,-1.51361 l 4.95267,-10.46861 c 0.83036,-1.75547 -0.45016,-3.77762 -2.3921,-3.77755 h -21.99814 c -1.02309,-4.3e-4 -1.95475,0.58896 -2.39262,1.51361 l -5.7795,12.22096 -11.88247,-12.88294 c -0.53648,-0.58227 -1.24991,-0.85758 -1.95544,-0.85369 z" />
      </g>
    </svg>
  );
}

/* ---------- InteractiveModel (inside Canvas)
   - appear animation driven by progressRef
   - continuous idle rotation along x/y/z
---------- */
function InteractiveModel({ onModelLoaded, progressRef, isMobile, scale = 600000 }) {
  const obj = useLoader(OBJLoader, "/models/F1.obj");
  const group = useRef();

  useEffect(() => {
    if (!obj) return;
    // tweak materials for flatter, darker look with a warm rim
    obj.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material) {
          try {
            c.material.flatShading = true;
            if ("metalness" in c.material) c.material.metalness = 0.05;
            if ("roughness" in c.material) c.material.roughness = 0.6;
            c.material.needsUpdate = true;
          } catch (err) {}
        }
      }
    });
    onModelLoaded && onModelLoaded(obj);
  }, [obj, onModelLoaded]);

  useFrame((state) => {
    if (!group.current) return;
    // appear progress
    const p = clamp(progressRef.current);
    const eased = easeInOutCubic(p);

    const fromZ = isMobile ? 280000 : 420000;
    group.current.position.set(0, (1 - eased) * (isMobile ? 2.5 : 4), -fromZ * (1 - eased));

    // base appear rotation on X (when appearing)
    group.current.rotation.x = eased * (Math.PI * 0.12);

    // continuous idle rotation on all axes (time-based)
    const t = state.clock.getElapsedTime();
    group.current.rotation.x += 0.002 + 0.02 * Math.sin(t * 0.7) * 0.01;
    group.current.rotation.y += 0.0015 + 0.02 * Math.sin(t * 0.5) * 0.01;
    group.current.rotation.z += 0.0012 + 0.015 * Math.cos(t * 0.6) * 0.01;

    // scale in with appear
    group.current.scale.setScalar(0.0001 + eased);

    if (obj) {
      obj.traverse((c) => {
        if (c.isMesh && c.material) c.material.opacity = clamp(eased);
      });
    }
  });

  return (
    <group ref={group}>
      <primitive object={obj} scale={scale} position={[0, 0, 0]} />
    </group>
  );
}

/* ---------- CameraAnimator
   - DISABLED per request: camera zoom animation removed
   - If you want to re-enable later, uncomment the function and its use in the Canvas
---------- */
/*
function CameraAnimator({ anchorsRef, modelRef, zoomTrigger, isMobile }) {
  // ... (function body intentionally removed / commented)
  return null;
}
*/

/* ---------- LabelsFollower (inside Canvas)
   - label text positions are fixed on-screen; only polyline tip/elbow near model moves
   - mobile: labels placed above/below center
   - NOTE: tags creation in App is commented out, so this will have no DOM elements to operate on.
---------- */
function LabelsFollower({ modelRef, anchorsRef, labelDomRefs, lineRefs, visible, isMobile }) {
  const { camera, size } = useThree();
  const tmp = useRef(new THREE.Vector3());

  useFrame(() => {
    const anchors = anchorsRef.current;
    const model = modelRef.current;
    if (!model || !anchors || !anchors.length) {
      // hide if nothing
      if (labelDomRefs.current) labelDomRefs.current.forEach((el) => el && (el.style.opacity = "0"));
      if (lineRefs.current) lineRefs.current.forEach((p) => p && p.setAttribute("opacity", "0"));
      return;
    }

    if (!visible) {
      // fade-out
      labelDomRefs.current.forEach((el) => el && (el.style.opacity = "0"));
      lineRefs.current.forEach((p) => p && p.setAttribute("opacity", "0"));
      return;
    }

    // If tag DOM is ever re-enabled, this code positions them.
    // (left as-is in case you later want labels back)
  });

  return null;
}

/* ---------- App (main) ---------- */
export default function App() {
  // inject Google Fonts (Inconsolata) once
  useEffect(() => {
    const id = "__npr_google_fonts_inconsolata";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // refs
  const logoWrapRef = useRef(null);

  const modelRef = useRef(null);
  const anchorsRef = useRef([]);
  const labelDomRefs = useRef([]); // tags are commented out below
  const lineRefs = useRef([]);

  // responsive
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // timeline
  const timelineProgressRef = useRef(0); // 0..1 current
  const timelineTargetRef = useRef(0);
  const animatingRef = useRef(false);

  // labels visibility (only after animation completes) - tags creation commented
  const [labelsVisible, setLabelsVisible] = useState(false);

  // zoom-to-wheel trigger (camera animator removed, but keep state)
  const [zoomToWheel, setZoomToWheel] = useState(false);

  // ----- create DOM labels & SVG overlay (fixed text positions) -----
  // *** COMMENTED OUT: tag creation removed per request ***
  /*
  useEffect(() => {
    labelDomRefs.current = [];
    lineRefs.current = [];

    const oldSvg = document.getElementById("__npr_svg_overlay_lines");
    if (oldSvg) oldSvg.remove();

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "__npr_svg_overlay_lines");
    svg.style.position = "fixed";
    svg.style.left = "0";
    svg.style.top = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "9999";
    svg.style.overflow = "visible";
    document.body.appendChild(svg);

    LABELS.forEach((txt, i) => {
      const el = document.createElement("div");
      Object.assign(el.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        transform: "translate3d(-9999px,-9999px,0)",
        pointerEvents: "none",
        opacity: "0",
        display: "none", // shown only when animation ends
        color: "#ffffff",
        fontFamily: "Inconsolata, monospace",
        fontSize: "16px",
        fontWeight: "700",
        padding: "0",
        background: "transparent",
        zIndex: 10000,
        letterSpacing: "0.02em",
        textTransform: "lowercase",
      });
      el.textContent = txt;
      el.style.transition = "opacity 420ms ease, transform 420ms ease";
      document.body.appendChild(el);
      labelDomRefs.current.push(el);

      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      poly.setAttribute("fill", "none");
      poly.setAttribute("stroke", "#ffffff");
      poly.setAttribute("stroke-width", String(isMobile ? 1.5 : 1.5));
      poly.setAttribute("stroke-linecap", "round");
      poly.setAttribute("stroke-linejoin", "round");
      poly.setAttribute("opacity", "0");
      poly.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(poly);
      lineRefs.current.push(poly);
    });

    return () => {
      labelDomRefs.current.forEach((el) => el && el.remove());
      svg.remove();
    };
  }, [isMobile]);
  */

  // ----- compute anchors when model loads (pin to semantic parts) -----
  const handleModelLoaded = (loadedObj) => {
    modelRef.current = loadedObj;

    const bbox = new THREE.Box3().setFromObject(loadedObj);
    const size = bbox.getSize(new THREE.Vector3());
    const min = bbox.min;
    const max = bbox.max;
    const center = bbox.getCenter(new THREE.Vector3());

    const anchorsWorld = [];
    // helmet: slightly forward & top-center
    anchorsWorld.push(new THREE.Vector3(center.x, max.y - size.y * 0.06, max.z - size.z * 0.06));
    // front: front-most center
    anchorsWorld.push(new THREE.Vector3(center.x, center.y, max.z));
    // back: rear-most center
    anchorsWorld.push(new THREE.Vector3(center.x, center.y, min.z));
    // wheel: front-right-bottom-ish
    anchorsWorld.push(new THREE.Vector3(max.x - size.x * 0.03, min.y + size.y * 0.06, min.z + size.z * 0.08));

    anchorsRef.current = anchorsWorld.map((w) => loadedObj.worldToLocal(w.clone()));
  };

  // ----- update logo transform (timeline)
  // Combined translate + scale applied to the *same* wrapper element to avoid jumps
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = clamp(timelineProgressRef.current);
      const eased = easeInOutCubic(p);

      const wrap = logoWrapRef.current;
      if (wrap) {
        const startSize = isMobile ? 260 : 520;
        const endSize = isMobile ? 56 : 90;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        // finalLeft centered horizontally, keep specified vertical distance from top
        const finalLeft = window.innerWidth / 2;
        const finalTop = 100;
        const dx = finalLeft - centerX;
        const dy = finalTop - centerY;

        const scale = (startSize + (endSize - startSize) * eased) / startSize;
        // combine translate & scale so there are no transform jumps
        wrap.style.transform = `translate(-50%,-50%) translate(${dx * eased}px, ${dy * eased}px) scale(${scale})`;
        wrap.style.transformOrigin = "center top";
        wrap.style.transition = "transform 0ms linear";
        wrap.style.opacity = "1";
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isMobile]);

  // ----- timeline animator (tween to target) -----
  function animateTimelineTo(target = 0, duration = 700) {
    timelineTargetRef.current = clamp(target);
    if (animatingRef.current) return;
    animatingRef.current = true;

    const startTS = performance.now();
    const from = timelineProgressRef.current;
    const delta = timelineTargetRef.current - from;

    function step(now) {
      const t = Math.min(1, (now - startTS) / duration);
      timelineProgressRef.current = clamp(from + delta * easeInOutCubic(t));
      if (t < 1) requestAnimationFrame(step);
      else {
        animatingRef.current = false;
        timelineProgressRef.current = timelineTargetRef.current;

        if (Math.abs(timelineProgressRef.current - 1) < 1e-6) {
          setLabelsVisible(true);
          // label DOM creation is commented out, so nothing to reveal here
        } else {
          setLabelsVisible(false);
        }
      }
    }
    requestAnimationFrame(step);
  }

  // ----- scroll triggers and zoom trigger detection -----
  useEffect(() => {
    const onWheel = (e) => {
      if (window.scrollY <= 100) {
        if (e.deltaY > 0) animateTimelineTo(1, 700);
        else if (e.deltaY < 0) animateTimelineTo(0, 700);
      }
    };

    let touchStartY = null;
    const onTouchStart = (ev) => {
      if (window.scrollY <= 100) touchStartY = ev.touches ? ev.touches[0].clientY : null;
      else touchStartY = null;
    };
    const onTouchMove = (ev) => {
      if (touchStartY == null) return;
      const y = ev.touches ? ev.touches[0].clientY : null;
      if (y == null) return;
      const dy = touchStartY - y;
      if (Math.abs(dy) > 8) {
        if (dy > 0) animateTimelineTo(1, 700);
        else animateTimelineTo(0, 700);
        touchStartY = null;
      }
    };

    const onScroll = () => {
      const heroHeight = window.innerHeight * 0.98;
      if (window.scrollY > heroHeight) setZoomToWheel(true);
      else setZoomToWheel(false);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // ensure body background + font family
  useEffect(() => {
    document.body.style.background = "#191919";
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#191919",
        position: "relative",
        fontFamily: "'Inconsolata', 'Microgramma', monospace",
        color: "#fff",
      }}
    >
      <style>{`
        /* Fonts - adjust file paths if needed */
        @font-face {
          font-family: 'Microgramma';
          src: url('/fonts/microgramma.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Zalando';
          src: url('/fonts/ZalandoSansExpanded.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        /* helper classes */
        .title-microgramma { font-family: 'Microgramma', monospace; font-weight:700; letter-spacing:0.02em; color:#fff; }
        .body-zalando { font-family: 'Zalando', system-ui, -apple-system, 'Segoe UI', Roboto, Arial; color: #ddd; line-height:1.6; }

        html, body, #root { height: 100%; background: #191919; }
        body { margin: 0; overflow-y: scroll; }
        /* hide scrollbar while keeping scrolling */
        body::-webkit-scrollbar { width: 0; height: 0; }
        body { scrollbar-width: none; -ms-overflow-style: none; }
        /* sections */
        main.section-wrapper { background: #0f0f0f; }
        section.site-section { padding: 96px 18vw; min-height: 66vh; display:flex; flex-direction:column; justify-content:center; }
        @media (max-width: 768px) {
          section.site-section { padding: 48px 6vw; }
        }
      `}</style>

      {/* HERO area (sticky canvas & centered logo) */}
      <section style={{ height: "160vh", position: "relative" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%" }}>
          {/* CENTERED LOGO — stays visible and tucks to top-center */}
          <div
            ref={logoWrapRef}
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%) scale(1)",
              zIndex: 40,
              pointerEvents: "none",
              willChange: "transform, opacity",
            }}
            aria-hidden
          >
            <NPLogo size={isMobile ? 260 : 520} />
          </div>

          {/* fixed Canvas */}
          <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none" }}>
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
              <directionalLight intensity={0.9} position={[10, 20, 10]} color={0xffffff} />
              <directionalLight intensity={0.9} position={[-10, 12, -6]} color={0xffb27a} />

              <Suspense fallback={null}>
                <Environment preset="city" background={false} />
                <Center>
                  <InteractiveModel
                    onModelLoaded={handleModelLoaded}
                    progressRef={timelineProgressRef}
                    isMobile={isMobile}
                    scale={isMobile ? 300000 : 600000}
                  />
                </Center>
                <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.45} far={10} />
              </Suspense>

              {/* LabelsFollower kept but tags creation commented out, so nothing visible */}
              <LabelsFollower
                modelRef={modelRef}
                anchorsRef={anchorsRef}
                labelDomRefs={labelDomRefs}
                lineRefs={lineRefs}
                visible={labelsVisible}
                isMobile={isMobile}
              />

              {/* CameraAnimator removed per request - if you want to re-enable later, uncomment usage and function */}
              {/* <CameraAnimator anchorsRef={anchorsRef} modelRef={modelRef} zoomTrigger={zoomToWheel} isMobile={isMobile} /> */}

              <EffectComposer multisampling={4}>
                <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
              </EffectComposer>
            </Canvas>
          </div>
        </div>
      </section>

      {/* Now add the actual page sections so the page is scrollable after the hero */}
      <main className="section-wrapper" style={{ zIndex: 1, position: "relative" }}>
        <section id="team" className="site-section" aria-labelledby="team-title">
          <h1 id="team-title" className="title-microgramma" style={{ fontSize: 40, margin: 0 }}>
            Team
          </h1>
          <p className="body-zalando" style={{ marginTop: 18, maxWidth: 860 }}>
            We are a tight-knit racing crew with experience across design, engineering and race strategy. Our team is focused on speed,
            precision, and bringing together top-tier talent to build high-performance cars and experiences.
          </p>
        </section>

        <section id="join" className="site-section" aria-labelledby="join-title">
          <h1 id="join-title" className="title-microgramma" style={{ fontSize: 40, margin: 0 }}>
            Join Us
          </h1>
          <p className="body-zalando" style={{ marginTop: 18, maxWidth: 860 }}>
            Interested in joining? We look for enthusiastic teammates who are passionate about racing and pushing the technical envelope.
            Check our openings and drop your CV — we’d love to hear from driven people.
          </p>
        </section>

        <section id="schedule" className="site-section" aria-labelledby="schedule-title">
          <h1 id="schedule-title" className="title-microgramma" style={{ fontSize: 40, margin: 0 }}>
            Schedule
          </h1>
          <p className="body-zalando" style={{ marginTop: 18, maxWidth: 860 }}>
            Race calendar, testing dates, and events are listed here. We update the schedule regularly — follow the team for the latest info.
          </p>
        </section>

        <section id="contact" className="site-section" aria-labelledby="contact-title">
          <h1 id="contact-title" className="title-microgramma" style={{ fontSize: 40, margin: 0 }}>
            Contact
          </h1>
          <p className="body-zalando" style={{ marginTop: 18, maxWidth: 860 }}>
            For press, partnerships or general enquiries reach out via email at hello@example.com or use the contact form on our site.
          </p>
        </section>
      </main>

      {/* small extra tail so final scroll feels natural */}
      <div style={{ height: "8vh" }} />
    </div>
  );
}
