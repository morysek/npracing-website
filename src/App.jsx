// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* ---------- helpers ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ---------- labels (commented out as requested) ---------- */
// const LABELS = ["TEAM", "JOIN US", "SCHEDULE", "CONTACT"];

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
   - uses GLTF passed in as prop (App loads gltf with a manager)
   - appear animation driven by progressRef
   - continuous idle rotation along x/y/z
---------- */
function InteractiveModel({ gltf, onModelLoaded, progressRef, isMobile, scale = 600000 }) {
  const group = useRef();

  useEffect(() => {
    if (!gltf) return;
    // tweak materials for flatter, darker look and ensure sRGB encoding for textures
    gltf.scene.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material) {
          try {
            c.material.flatShading = true;
            if ("metalness" in c.material) c.material.metalness = 0.05;
            if ("roughness" in c.material) c.material.roughness = 0.6;
            // fix common encoding issues
            if (c.material.map) {
              c.material.map.encoding = THREE.sRGBEncoding;
            }
            if (c.material.emissiveMap) c.material.emissiveMap.encoding = THREE.sRGBEncoding;
            c.material.needsUpdate = true;
          } catch (err) {
            // ignore
          }
        }
      }
    });
    onModelLoaded && onModelLoaded(gltf.scene);
  }, [gltf, onModelLoaded]);

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
  });

  if (!gltf) return null;
  return (
    <group ref={group}>
      <primitive object={gltf.scene} scale={scale} position={[0, 0, 0]} />
    </group>
  );
}

/* ---------- LabelsFollower and CameraAnimator commented out ----------
   You asked to comment out tags and remove zoom/second animation.
   If you want tags / camera zoom later, we can re-enable them.
--------------------------------------------------------------------- */

/* ---------- App (main) ---------- */
export default function App() {
  // inject Inconsolata (keeps previous look) and microgramma/zalandos via @font-face below
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
  const labelDomRefs = useRef([]);
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

  // labels visible (commented out functionality)
  const [labelsVisible, setLabelsVisible] = useState(false);

  // loading manager & assets
  const [percent, setPercent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [gltf, setGltf] = useState(null);

  useEffect(() => {
    // Create a manager to monitor progress for model + images
    const manager = new THREE.LoadingManager();
    manager.onStart = () => setPercent(0);
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const p = Math.round((itemsLoaded / itemsTotal) * 100);
      setPercent(p);
    };
    manager.onLoad = () => {
      setPercent(100);
      setLoaded(true);
      // allow small timeout for UX
      setTimeout(() => {
        // still keep page locked until animation is explicitly ended by user (see below)
      }, 250);
    };
    manager.onError = () => {
      // still mark loaded to avoid blocking forever
      setLoaded(true);
    };

    // Load GLTF
    const gltfLoader = new GLTFLoader(manager);
    gltfLoader.load(
      "/models/F1.glb",
      (res) => {
        // Ensure textures encoding is correct
        res.scene.traverse((c) => {
          if (c.isMesh && c.material) {
            if (c.material.map) c.material.map.encoding = THREE.sRGBEncoding;
            if (c.material.emissiveMap) c.material.emissiveMap.encoding = THREE.sRGBEncoding;
            c.material.needsUpdate = true;
          }
        });
        setGltf(res);
      },
      undefined,
      (err) => {
        console.error("GLTF load error:", err);
      }
    );

    // preload team images using TextureLoader (so manager counts them)
    const texLoader = new THREE.TextureLoader(manager);
    ["/images/team1.jpg", "/images/team2.jpg", "/images/team3.jpg"].forEach((u) => {
      texLoader.load(u, () => {}, undefined, () => {});
    });

    return () => {
      // nothing to cleanup on manager
    };
  }, []);

  // prevent body scrolling / interaction until all assets loaded AND timeline complete
  useEffect(() => {
    const applyBodyLock = () => {
      // lock unless loaded && timelineProgressRef.current === 1
      if (!loaded || timelineProgressRef.current < 1 - 1e-8) {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
      } else {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
    };

    // heartbeat RAF to track timeline changes (because timelineProgressRef is a ref)
    let raf = 0;
    const tick = () => {
      applyBodyLock();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loaded]);

  // ----- update logo transform (timeline)
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = clamp(timelineProgressRef.current);
      const eased = easeInOutCubic(p);

      const wrap = logoWrapRef.current;
      if (wrap) {
        const startSize = isMobile ? 260 : 520;
        const endSize = isMobile ? startSize * 2 : 90; // keep your "bigger on mobile" request: 2x
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const finalLeft = window.innerWidth / 2; // top center as requested
        const finalTop = 60; // keep same distance from top
        const dx = finalLeft - centerX;
        const dy = finalTop - centerY;

        const scale = (startSize + (endSize - startSize) * eased) / startSize;
        // combine translate & scale so there are no transform jumps
        // on mobile ensure there is no padding (we set transform origin center top)
        wrap.style.transform = `translate(-50%,-50%) translate(${dx * eased}px, ${dy * eased}px) scale(${scale})`;
        wrap.style.transformOrigin = "center top";
        wrap.style.transition = "transform 0ms linear";
        wrap.style.opacity = "1";
        // mobile padding 0 handled by styling, the logo element itself has no extra padding
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

        // labels were commented out per your request; if you re-enable labels, set visibility here
        if (Math.abs(timelineProgressRef.current - 1) < 1e-6) {
          setLabelsVisible(true);
        } else {
          setLabelsVisible(false);
        }
      }
    }
    requestAnimationFrame(step);
  }

  // ----- scroll triggers (only treat wheel in top area to trigger animation) -----
  useEffect(() => {
    const onWheel = (e) => {
      // allow wheel to trigger timeline while at top (window.scrollY is 0 while locked)
      if (window.scrollY <= 100) {
        if (e.deltaY > 0) animateTimelineTo(1, 900);
        else if (e.deltaY < 0) animateTimelineTo(0, 900);
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
        if (dy > 0) animateTimelineTo(1, 900);
        else animateTimelineTo(0, 900);
        touchStartY = null;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // ensure body background + font family
  useEffect(() => {
    document.body.style.background = "#191919";
  }, []);

  /* ---------- Content sections placed AFTER hero ---------- */
  const Content = () => (
    <main style={{ background: "#191919", color: "#fff", padding: 0 }}>
      <section style={{ padding: "48px 16px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma, sans-serif", fontSize: 36, margin: "8px 0" }}>Team</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
          <img src="/images/team1.jpg" alt="team1" style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 8 }} />
          <img src="/images/team2.jpg" alt="team2" style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 8 }} />
          <img src="/images/team3.jpg" alt="team3" style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 8 }} />
        </div>
        <p style={{ fontFamily: "Zalando, sans-serif", marginTop: 12 }}>
          {/* Zig-zag sample paragraph pieces */}
          <span style={{ display: "inline-block", transform: "translateX(0px)" }}>We build race cars.</span>{" "}
          <span style={{ display: "inline-block", transform: "translateX(6px)" }}>We tune them for speed.</span>{" "}
          <span style={{ display: "inline-block", transform: "translateX(0px)" }}>We race as one team.</span>
        </p>
      </section>

      <section style={{ padding: "48px 16px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma, sans-serif", fontSize: 34, margin: "8px 0" }}>Join Us</h2>
        <p style={{ fontFamily: "Zalando, sans-serif" }}>
          <span style={{ display: "inline-block", transform: "translateX(0px)" }}>Want to be part of the crew?</span>{" "}
          <span style={{ display: "inline-block", transform: "translateX(-6px)" }}>Apply and show up.</span>
        </p>
      </section>

      <section style={{ padding: "48px 16px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma, sans-serif", fontSize: 34, margin: "8px 0" }}>Schedule</h2>
        <p style={{ fontFamily: "Zalando, sans-serif" }}>
          <span style={{ display: "inline-block", transform: "translateX(0px)" }}>Races, tests and events.</span>{" "}
          <span style={{ display: "inline-block", transform: "translateX(6px)" }}>We keep it tight.</span>
        </p>
      </section>

      <section style={{ padding: "48px 16px", maxWidth: 900, margin: "0 auto 6rem auto" }}>
        <h2 style={{ color: "#ffcc00", fontFamily: "Microgramma, sans-serif", fontSize: 34, margin: "8px 0" }}>Contact</h2>
        <p style={{ fontFamily: "Zalando, sans-serif" }}>
          <span style={{ display: "inline-block", transform: "translateX(0px)" }}>Say hello.</span>{" "}
          <span style={{ display: "inline-block", transform: "translateX(-6px)" }}>We respond quickly.</span>
        </p>
      </section>
    </main>
  );

  /* ---------- Render ---------- */
  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#191919",
        position: "relative",
        fontFamily: "'Inconsolata', 'Microgramma', 'Zalando', monospace",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      <style>{`
        /* self-hosted fonts - replace /fonts/... with your files */
        @font-face {
          font-family: 'Microgramma';
          src: url('/fonts/microgramma.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Zalando';
          src: url('/fonts/zalando-sans.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        html, body, #root { height: 100%; background: #191919; }
        body { margin: 0; }
        /* hide scrollbars visually but keep scrolling */
        ::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none; }
        html { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* Loading overlay */}
      {!loaded && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f1113",
            color: "#fff",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: 18, marginBottom: 12 }}>Loading... {percent}%</div>
          <div style={{ width: 300, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 4 }}>
            <div style={{ width: `${percent}%`, height: "100%", background: "#ffcc00", borderRadius: 4, transition: "width 200ms linear" }} />
          </div>
        </div>
      )}

      {/* HERO: sticky container with canvas that becomes scrollable when page unlocked */}
      <section style={{ height: "100vh", position: "relative" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", overflow: "hidden" }}>
          {/* Centered Logo (transforms with timeline) */}
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
              padding: isMobile ? 0 : undefined,
            }}
            aria-hidden
          >
            <NPLogo size={isMobile ? 520 : 520} /> {/* mobile double size per earlier request */}
          </div>

          {/* Canvas wrapper - sticky so it scrolls away once body is unlocked and user scrolls past the hero */}
          <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", zIndex: 2, pointerEvents: "none" }}>
            <Canvas
              shadows
              dpr={[1, 2]}
              camera={{ position: [0, 0, isMobile ? 120000 : 220000], fov: 7, near: 10000, far: 800000 }}
              style={{ width: "100%", height: "100%", maxWidth: "100vw" }}
              onCreated={({ gl, scene }) => {
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
                // ensure correct output encoding if three version supports it
                if (gl.outputColorSpace !== undefined) {
                  // newer three
                  try {
                    gl.outputColorSpace = THREE.SRGBColorSpace;
                  } catch (e) {}
                } else {
                  try {
                    gl.outputEncoding = THREE.sRGBEncoding;
                  } catch (e) {}
                }
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
                  <InteractiveModel gltf={gltf} onModelLoaded={(m) => (modelRef.current = m)} progressRef={timelineProgressRef} isMobile={isMobile} scale={isMobile ? 300000 : 600000} />
                </Center>

                <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.45} far={10} />
              </Suspense>

              {/* labels and camera animator were removed / commented out per request */}

              <EffectComposer multisampling={4}>
                <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
              </EffectComposer>
            </Canvas>
          </div>
        </div>
      </section>

      {/* After hero -> now page content becomes scrollable */}
      <div style={{ background: "#191919" }}>
        <Content />
      </div>
    </div>
  );
}
