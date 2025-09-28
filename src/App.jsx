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

/* ---------- NPLogo (unchanged) ---------- */
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
/* ---------- InteractiveModel (appear + continuous rotation) ---------- */
function InteractiveModel({ onModelLoaded, progressRef, isMobile, scale = 600000 }) {
  const obj = useLoader(OBJLoader, "/models/F1.obj");
  const group = useRef();

  useEffect(() => {
    if (!obj) return;
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
          } catch {}
        }
      }
    });
    onModelLoaded && onModelLoaded(obj);
  }, [obj, onModelLoaded]);

  useFrame((state) => {
    if (!group.current) return;
    const p = clamp(progressRef.current);
    const eased = easeInOutCubic(p);
    const fromZ = isMobile ? 280000 : 420000;
    group.current.position.set(0, (1 - eased) * (isMobile ? 2.5 : 4), -fromZ * (1 - eased));

    // base appear rotation on X while appearing
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

/* ---------- LabelsFollower (kept but tag creation commented out) ---------- */
function LabelsFollower(props) {
  // Labels/dom creation was commented out per your request.
  // This function is left present in case you later re-enable labels.
  return null;
}

/* ---------- App (main) ---------- */
export default function App() {
  // google font (Inconsolata) left in — Microgramma self-host below
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
  const scrollRef = useRef(null); // internal scrollable container

  const modelRef = useRef(null);
  const anchorsRef = useRef([]);
  const timelineProgressRef = useRef(0);
  const timelineTargetRef = useRef(0);
  const animatingRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // handle model loaded to compute anchors (kept)
  const handleModelLoaded = (loadedObj) => {
    modelRef.current = loadedObj;
    const bbox = new THREE.Box3().setFromObject(loadedObj);
    const size = bbox.getSize(new THREE.Vector3());
    const min = bbox.min;
    const max = bbox.max;
    const center = bbox.getCenter(new THREE.Vector3());
    const anchorsWorld = [];
    anchorsWorld.push(new THREE.Vector3(center.x, max.y - size.y * 0.06, max.z - size.z * 0.06)); // helmet
    anchorsWorld.push(new THREE.Vector3(center.x, center.y, max.z)); // front
    anchorsWorld.push(new THREE.Vector3(center.x, center.y, min.z)); // back
    anchorsWorld.push(new THREE.Vector3(max.x - size.x * 0.03, min.y + size.y * 0.06, min.z + size.z * 0.08)); // wheel
    anchorsRef.current = anchorsWorld.map((w) => loadedObj.worldToLocal(w.clone()));
  };

  // combine translate + scale on wrapper for smooth transform
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
        const finalLeft = window.innerWidth / 2; // keep centered horizontally
        const finalTop = 100;
        const dx = finalLeft - centerX;
        const dy = finalTop - centerY;
        const scale = (startSize + (endSize - startSize) * eased) / startSize;
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

  // timeline tween
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
        if (Math.abs(timelineProgressRef.current - 1) < 1e-6) setLabelsVisible(true);
        else setLabelsVisible(false);
      }
    }
    requestAnimationFrame(step);
  }

  // scroll handlers: use the internal scroll container (scrollRef.current)
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;

    const onWheel = (e) => {
      if (sc.scrollTop <= 100) {
        if (e.deltaY > 0) animateTimelineTo(1, 700);
        else if (e.deltaY < 0) animateTimelineTo(0, 700);
      }
    };

    let touchStartY = null;
    const onTouchStart = (ev) => {
      if (sc.scrollTop <= 100) touchStartY = ev.touches ? ev.touches[0].clientY : null;
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

    sc.addEventListener("wheel", onWheel, { passive: true });
    sc.addEventListener("touchstart", onTouchStart, { passive: true });
    sc.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      sc.removeEventListener("wheel", onWheel);
      sc.removeEventListener("touchstart", onTouchStart);
      sc.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // ensure body background & disable native page scroll (we use internal scroll area)
  useEffect(() => {
    document.body.style.background = "#191919";
    // hide page scrollbars — we will use the internal scroll container
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#191919", position: "relative", color: "#fff" }}>
      <style>{`
        /* Microgramma (self-host) & Inconsolata fallback */
        @font-face {
          font-family: 'Microgramma';
          src: url('/fonts/microgramma.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        .title-microgramma { font-family: 'Microgramma', Inconsolata, monospace; color: #ffcc00; }
        .body-zalando { font-family: 'Zalando', system-ui, -apple-system, 'Segoe UI', Roboto, Arial; color: #e6e6e6; }

        /* hide any scrollbars within the scroll container */
        .scroll-container {
          height: 100vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          background: #191919;
        }
        .scroll-container::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .scroll-container { scrollbar-width: none; -ms-overflow-style: none; }

        /* sections: closer spacing and zig-zag text */
        .site-section { padding: 48px 8vw; min-height: 48vh; display:flex; align-items:center; }
        .site-section .content { max-width: 800px; }
        .site-section:nth-child(odd) .content { margin-left: 0; text-align: left; transform: translateX(0); }
        .site-section:nth-child(even) .content { margin-left: auto; text-align: right; transform: translateX(0); }
        .site-section h1 { margin: 0 0 8px 0; font-size: 36px; }
        .site-section p { margin: 6px 0 0 0; line-height: 1.5; }

        /* team images row */
        .team-images { display:flex; gap: 12px; margin-top: 12px; flex-wrap:wrap; }
        .team-images img { width: 220px; height: 140px; object-fit: cover; border-radius: 6px; box-shadow: 0 6px 18px rgba(0,0,0,0.6); }

        @media (max-width: 768px) {
          .site-section { padding: 28px 6vw; min-height: 40vh; flex-direction:column; align-items:flex-start; }
          .site-section:nth-child(even) .content { text-align: left; margin-left:0; }
          .team-images img { width: calc(50% - 8px); height: 120px; }
        }
      `}</style>

      {/* internal scroll container — this is the only scrollable element (no browser scrollbar) */}
      <div ref={scrollRef} className="scroll-container">
        {/* HERO area (sticky canvas & centered logo) */}
        <section style={{ height: "100vh", position: "relative" }}>
          <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%" }}>
            {/* LOGO wrapper: fixed so it stays visible, but transform is controlled via timeline */}
            <div
              ref={logoWrapRef}
              style={{
                position: "fixed",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%) scale(1)",
                zIndex: 60, // on top of canvas
                pointerEvents: "none",
                willChange: "transform, opacity",
              }}
              aria-hidden
            >
              <NPLogo size={isMobile ? 260 : 520} />
            </div>

            {/* fixed Canvas on top of content so content scrolls under it */}
            <div style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none" }}>
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

                <LabelsFollower visible={labelsVisible} />
                <EffectComposer multisampling={4}>
                  <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
                </EffectComposer>
              </Canvas>
            </div>
          </div>
        </section>

        {/* Sections after hero (page scrollable here) */}
        <main style={{ position: "relative", zIndex: 10 }}>
          <section id="team" className="site-section" aria-labelledby="team-title">
            <div className="content">
              <h1 id="team-title" className="title-microgramma">Team</h1>
              <p className="body-zalando">
                We are a tight-knit racing crew with experience across design, engineering and race strategy. Our team focuses on speed, precision, and collaboration.
              </p>

              {/* IMAGES - replace src with your images (placeholders below) */}
              <div className="team-images" aria-hidden>
                <img src="https://images.unsplash.com/photo-1542293787938-c9e299b88080?w=1600&q=80&auto=format&fit=crop" alt="team 1" />
                <img src="https://images.unsplash.com/photo-1517260918467-3f6f0a7f5a86?w=1600&q=80&auto=format&fit=crop" alt="team 2" />
                <img src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1600&q=80&auto=format&fit=crop" alt="team 3" />
              </div>
            </div>
          </section>

          <section id="join" className="site-section" aria-labelledby="join-title">
            <div className="content">
              <h1 id="join-title" className="title-microgramma">Join Us</h1>
              <p className="body-zalando">
                Interested in joining? We look for enthusiastic teammates passionate about racing and engineering. Check our openings and reach out.
              </p>
            </div>
          </section>

          <section id="schedule" className="site-section" aria-labelledby="schedule-title">
            <div className="content">
              <h1 id="schedule-title" className="title-microgramma">Schedule</h1>
              <p className="body-zalando">
                Race dates, testing sessions and events are listed here. Follow us for updates as the season progresses.
              </p>
            </div>
          </section>

          <section id="contact" className="site-section" aria-labelledby="contact-title">
            <div className="content">
              <h1 id="contact-title" className="title-microgramma">Contact</h1>
              <p className="body-zalando">
                For press, partnerships or general enquiries, reach out at hello@example.com.
              </p>
            </div>
          </section>
        </main>

        {/* final tail */}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
