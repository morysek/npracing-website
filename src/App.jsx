// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* helpers */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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
      {/* SVG content unchanged (omitted here for brevity in this snippet) */}
      <g transform="translate(-54.124261,-130.25079)"> ... </g>
    </svg>
  );
}

/* ---------- InteractiveModel (GLB) ---------- */
function InteractiveModel({ onModelLoaded, progressRef, isMobile, scale = 600000 }) {
  const gltf = useLoader(GLTFLoader, "/models/F1.glb");
  const group = useRef();

  useEffect(() => {
    if (!gltf || !gltf.scene) return;
    const obj = gltf.scene;

    // Fix textures & materials so GLB shows correctly
    obj.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        const mat = c.material;
        if (mat) {
          // If material has a color map, make sure encoding is sRGB so colors are correct
          if (mat.map) {
            try {
              mat.map.encoding = THREE.sRGBEncoding;
              mat.map.needsUpdate = true;
            } catch (err) {}
          }
          if (mat.emissiveMap) {
            try {
              mat.emissiveMap.encoding = THREE.sRGBEncoding;
              mat.emissiveMap.needsUpdate = true;
            } catch (err) {}
          }
          // Ensure physically based properties exist
          if (!("metalness" in mat)) mat.metalness = 0.05;
          if (!("roughness" in mat)) mat.roughness = 0.6;
          mat.side = THREE.FrontSide;
          mat.needsUpdate = true;
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

    if (gltf && gltf.scene) {
      // fade-in by material opacity if desired
      gltf.scene.traverse((c) => {
        if (c.isMesh && c.material) {
          if ("opacity" in c.material) c.material.opacity = clamp(eased);
          c.material.transparent = c.material.opacity < 1;
        }
      });
    }
  });

  return (
    <group ref={group}>
      <primitive object={gltf.scene} scale={scale} position={[0, 0, 0]} />
    </group>
  );
}

/* LabelsFollower is intentionally a no-op (tags commented out per your request) */
function LabelsFollower() {
  return null;
}

/* ---------- App (main) ---------- */
export default function App() {
  // inject Inconsolata once
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

  const logoWrapRef = useRef(null);
  const scrollRef = useRef(null);

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

  // logo transform (unchanged)
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = clamp(timelineProgressRef.current);
      const eased = easeInOutCubic(p);
      const wrap = logoWrapRef.current;
      if (wrap) {
        const startSize = isMobile ? 260 : 520;
        const endSize = isMobile ? 56 * 2 : 90; // mobile final doubled
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const finalLeft = window.innerWidth / 2;
        const finalTop = 100;
        const dx = finalLeft - centerX;
        const dy = finalTop - centerY;
        const scale = (startSize + (endSize - startSize) * eased) / startSize;
        wrap.style.transform = `translate(-50%,-50%) translate(${dx * eased}px, ${dy * eased}px) scale(${scale})`;
        wrap.style.transformOrigin = "center top";
        wrap.style.transition = "transform 0ms linear";
        wrap.style.opacity = "1";
        if (isMobile && eased > 0.999) wrap.style.padding = "0";
        else wrap.style.padding = "";
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
        setLabelsVisible(Math.abs(timelineProgressRef.current - 1) < 1e-6);
      }
    }
    requestAnimationFrame(step);
  }

  // local scroll listeners (wheel/touch operate on the scroll container)
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;

    const onWheel = (e) => {
      // allow the wheel to trigger timeline while the container is locked at top
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

  // --- NEW: lock / unlock internal scroll depending on animation progress ---
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const sc = scrollRef.current;
      if (sc) {
        const p = timelineProgressRef.current;
        // locked until animation fully finished
        if (p >= 0.999) {
          // enable scrolling
          sc.style.overflowY = "auto";
        } else {
          // lock scrolling while animation not finished
          sc.style.overflowY = "hidden";
          // keep scrollTop at 0 so content doesn't slip
          if (sc.scrollTop !== 0) sc.scrollTop = 0;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // disable native page scroll
  useEffect(() => {
    document.body.style.background = "#191919";
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
        @font-face {
          font-family: 'Microgramma';
          src: url('/fonts/microgramma.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        .scroll-container {
          height: 100vh;
          overflow-y: hidden; /* start locked */
          -webkit-overflow-scrolling: touch;
          background: #191919;
        }
        .scroll-container::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .scroll-container { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      <div ref={scrollRef} className="scroll-container">
        <section style={{ height: "100vh", position: "relative" }}>
          <div style={{ position: "relative", height: "100%", width: "100%" }}>
            <div
              ref={logoWrapRef}
              style={{
                position: "fixed",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%) scale(1)",
                zIndex: 120,
                pointerEvents: "none",
                willChange: "transform, opacity, padding",
              }}
              aria-hidden
            >
              <NPLogo size={isMobile ? 260 : 520} />
            </div>

            {/* Canvas now in normal flow so it will scroll once unlocked */}
            <div style={{ position: "relative", width: "100%", height: "100vh", zIndex: 40, pointerEvents: "none" }}>
              <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ position: [0, 0, isMobile ? 120000 : 220000], fov: 7, near: 10000, far: 800000 }}
                style={{ width: "100%", height: "100%" }}
                onCreated={({ gl, scene }) => {
                  gl.shadowMap.enabled = true;
                  gl.shadowMap.type = THREE.PCFSoftShadowMap;
                  // support both new and older three.js APIs for color management
                  if (gl.outputColorSpace !== undefined && THREE.SRGBColorSpace) {
                    try {
                      gl.outputColorSpace = THREE.SRGBColorSpace;
                    } catch (err) {}
                  } else if (gl.outputEncoding !== undefined) {
                    gl.outputEncoding = THREE.sRGBEncoding;
                  }
                  // prefer physically correct lights so materials appear right
                  gl.physicallyCorrectLights = true;
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

                <LabelsFollower />
                <EffectComposer multisampling={4}>
                  <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
                </EffectComposer>
              </Canvas>
            </div>
          </div>
        </section>

        {/* your page sections... (Team / Join / Schedule / Contact) */}
        <main style={{ position: "relative", zIndex: 70, pointerEvents: "auto", background: "#191919" }}>
          {/* Team */}
          <section style={{ padding: 48 }}>
            <h1 style={{ fontFamily: "Microgramma, Inconsolata, monospace", color: "#ffcc00" }}>Team</h1>
            <p style={{ fontFamily: "Zalando, system-ui, sans-serif", color: "#e6e6e6" }}>
              Team text here...
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <img src="/images/team1.jpg" alt="team1" style={{ width: 220, height: 140, objectFit: "cover", borderRadius: 6 }} />
              <img src="/images/team2.jpg" alt="team2" style={{ width: 220, height: 140, objectFit: "cover", borderRadius: 6 }} />
              <img src="/images/team3.jpg" alt="team3" style={{ width: 220, height: 140, objectFit: "cover", borderRadius: 6 }} />
            </div>
          </section>

          {/* Join Us */}
          <section style={{ padding: 48 }}>
            <h1 style={{ fontFamily: "Microgramma, Inconsolata, monospace", color: "#ffcc00" }}>Join Us</h1>
            <p style={{ fontFamily: "Zalando, system-ui, sans-serif", color: "#e6e6e6" }}>
              Join us text...
            </p>
          </section>

          {/* Schedule */}
          <section style={{ padding: 48 }}>
            <h1 style={{ fontFamily: "Microgramma, Inconsolata, monospace", color: "#ffcc00" }}>Schedule</h1>
            <p style={{ fontFamily: "Zalando, system-ui, sans-serif", color: "#e6e6e6" }}>
              Schedule text...
            </p>
          </section>

          {/* Contact */}
          <section style={{ padding: 48 }}>
            <h1 style={{ fontFamily: "Microgramma, Inconsolata, monospace", color: "#ffcc00" }}>Contact</h1>
            <p style={{ fontFamily: "Zalando, system-ui, sans-serif", color: "#e6e6e6" }}>
              Contact text...
            </p>
          </section>

          <div style={{ height: 24 }} />
        </main>
      </div>
    </div>
  );
}
