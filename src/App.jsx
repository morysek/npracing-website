// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Center, ContactShadows, useGLTF } from "@react-three/drei";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* ---------- helpers ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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
      {/* ... original SVG content (unchanged) ... */}
      <g transform="translate(-54.124261,-130.25079)">
        {/* (SVG content trimmed here in the example for brevity; paste your full SVG paths) */}
        <path style={{ fill: "#ffcc00" }} d="M64 130 ..." />
      </g>
    </svg>
  );
}

/* ---------- InteractiveModel (GLTF) ---------- */
function InteractiveModel({ onModelLoaded, progressRef, isMobile, baseScale = 600000 }) {
  const gltf = useGLTF("/models/F1.glb");
  const group = useRef();

  useEffect(() => {
    if (!gltf || !gltf.scene) return;
    // ensure textures are in sRGB
    gltf.scene.traverse((c) => {
      if (c.isMesh && c.material) {
        // convert maps to sRGB if present
        if (c.material.map) {
          c.material.map.encoding = THREE.sRGBEncoding;
        }
        if (c.material.emissiveMap) {
          c.material.emissiveMap.encoding = THREE.sRGBEncoding;
        }
        // material tweaks:
        try {
          if ("metalness" in c.material) c.material.metalness = c.material.metalness ?? 0.05;
          if ("roughness" in c.material) c.material.roughness = c.material.roughness ?? 0.6;
          c.material.needsUpdate = true;
        } catch (e) {}
        c.castShadow = true;
        c.receiveShadow = true;
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

    // appear motion (z/ y)
    group.current.position.set(0, (1 - eased) * (isMobile ? 2.5 : 4), -fromZ * (1 - eased));

    // base appear rotation on X (when appearing)
    group.current.rotation.x = eased * (Math.PI * 0.12);

    // continuous idle rotation on all axes (time-based)
    const t = state.clock.getElapsedTime();
    group.current.rotation.x += 0.002 + 0.02 * Math.sin(t * 0.7) * 0.01;
    group.current.rotation.y += 0.0015 + 0.02 * Math.sin(t * 0.5) * 0.01;
    group.current.rotation.z += 0.0012 + 0.015 * Math.cos(t * 0.6) * 0.01;

    // scale in with appear; on mobile reduce scale so it fits viewport
    const mobileScale = isMobile ? baseScale * (window.innerWidth / 1200) : baseScale;
    const finalScale = (0.0001 + eased) * (mobileScale / baseScale);
    group.current.scale.setScalar(finalScale);

    // ensure opacity
    gltf.scene.traverse((c) => {
      if (c.isMesh && c.material) {
        if ("opacity" in c.material) c.material.opacity = clamp(eased);
      }
    });
  });

  return (
    <group ref={group}>
      <primitive object={gltf.scene} scale={baseScale} position={[0, 0, 0]} />
    </group>
  );
}

/* ---------- Labels & CameraAnimator removed / commented out ---------- */
/* Tags & camera zoom behavior were removed per your request. */

/* ---------- Simple LoaderOverlay ----------
   Blocks interaction until images + glb are loaded.
------------------------------------------- */
function LoaderOverlay({ progress }) {
  // fancy loader with animated bars + percent
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(180deg, rgba(10,12,16,0.95), rgba(20,22,28,0.95))",
        color: "#fff",
        pointerEvents: "auto",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 520, padding: 24 }}>
        <div style={{ fontSize: 16, marginBottom: 12, opacity: 0.9, fontFamily: "'ZalandoSans', Inter, sans-serif" }}>
          Loading NP Racing
        </div>

        <div style={{ height: 6, width: "100%", background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
          <div
            style={{
              height: "100%",
              width: `${Math.round(progress)}%`,
              background: "linear-gradient(90deg,#ffcc00,#ffd47a)",
              transition: "width 220ms ease",
            }}
          />
        </div>

        <div style={{ fontSize: 14, opacity: 0.95, fontFamily: "'ZalandoSans', Inter, sans-serif" }}>{Math.round(progress)}%</div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg,#222,#141414)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 6,
                background: "#ffcc00",
                animation: "loaderPulse 900ms infinite ease-in-out",
              }}
            />
          </div>
        </div>

        <style>{`
          @keyframes loaderPulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(0.7); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}

/* ---------- Content sections (provided by you, adapted) ---------- */
function TeamContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Team</h1>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px" }}>
          <p className="zig">The Team</p>
          <ul>
            <li>Team Leader: Matěj Prokop</li>
            <li>Engineer: Lukáš Moravec</li>
            <li>Finance manager: Lukáš Martin</li>
            <li>Marketing manager: Veronika Lindová</li>
          </ul>
        </div>

        <div style={{ flex: "1 1 320px", display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <img src="/images/team1.jpg" alt="team1" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
          <img src="/images/team2.jpg" alt="team2" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
          <img src="/images/team3.jpg" alt="team3" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
        </div>
      </div>

      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma", marginTop: 20 }}>About Us</h1>
      <div>
        <p className="zig">We are the only Czech team and a top contender in the prestigious international STEM racing competition.</p>
        <p className="zig">We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.</p>
        <p className="zig">Founded at Nový PORG, a prestigious school, NP Racing unites skills in engineering, manufacturing, and marketing.</p>
        <p className="zig">We collaborate with partners like the Czech Technical University to enhance our expertise.</p>
      </div>
    </div>
  );
}

function ScheduleContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Schedule</h1>
      <p className="zig">Next up: Poland</p>
      <ol>
        <li>Oct 11</li>
      </ol>
    </div>
  );
}

function ContactContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Contact</h1>
      <p className="zig">
        For general inquiry:{" "}
        <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">
          prokopmatej@novyporg.cz
        </a>
      </p>
    </div>
  );
}

function JoinUsContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Join Us</h1>
      <p className="zig">Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>
    </div>
  );
}

/* ---------- App (main) ---------- */
export default function App() {
  // fonts: Microgramma and Zalando (local @font-face). Place woff2 files in /public/fonts
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @font-face {
        font-family: 'Microgramma';
        src: url('/fonts/microgramma.woff2') format('woff2');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'ZalandoSans';
        src: url('/fonts/zalando-sans-expanded.woff2') format('woff2');
        font-weight: 400 800;
        font-style: normal;
        font-display: swap;
      }
      body {
        font-family: 'ZalandoSans', Inter, sans-serif;
      }
      .zig { 
        /* zig-zag paragraphs: alternate using nth-child via JS/CSS not reliable for static; we apply classes in markup */
        margin: 10px 0;
        line-height: 1.35;
      }
      /* hide scrollbars */
      ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
      html, body { scrollbar-width: none; -ms-overflow-style: none; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // refs
  const logoWrapRef = useRef(null);

  const modelRef = useRef(null);
  const anchorsRef = useRef([]);
  // labels & lines commented out as requested
  // const labelDomRefs = useRef([]);
  // const lineRefs = useRef([]);

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

  // labels visibility (disabled because tags commented out)
  const [labelsVisible, setLabelsVisible] = useState(false);

  // loader state
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalAssets] = useState(4); // 3 images + 1 glb
  const loadingProgress = (loadedCount / totalAssets) * 100;
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // track whether animation finished (so page becomes scrollable & canvas unpins)
  const [introComplete, setIntroComplete] = useState(false);

  // manage body scroll: initially block, allow only after introComplete
  useEffect(() => {
    document.body.style.overflow = introComplete && assetsLoaded ? "auto" : "hidden";
  }, [introComplete, assetsLoaded]);

  // preload images
  useEffect(() => {
    const imgs = ["/images/team1.jpg", "/images/team2.jpg", "/images/team3.jpg"];
    let mounted = true;
    imgs.forEach((src) => {
      const im = new Image();
      im.onload = () => {
        if (!mounted) return;
        setLoadedCount((c) => c + 1);
      };
      im.onerror = () => {
        if (!mounted) return;
        setLoadedCount((c) => c + 1);
      };
      im.src = src;
    });
    return () => (mounted = false);
  }, []);

  // model on-loaded callback increments loadedCount (GLB)
  const handleModelLoaded = (gltfScene) => {
    modelRef.current = gltfScene;
    setLoadedCount((c) => c + 1);
    // compute anchors if needed (kept but unused since tags commented)
    const bbox = new THREE.Box3().setFromObject(gltfScene);
    const size = bbox.getSize(new THREE.Vector3());
    const min = bbox.min;
    const max = bbox.max;
    const center = bbox.getCenter(new THREE.Vector3());
    const anchorsWorld = [];
    anchorsWorld.push(new THREE.Vector3(center.x, max.y - size.y * 0.06, max.z - size.z * 0.06));
    anchorsWorld.push(new THREE.Vector3(center.x, center.y, max.z));
    anchorsWorld.push(new THREE.Vector3(center.x, center.y, min.z));
    anchorsWorld.push(new THREE.Vector3(max.x - size.x * 0.03, min.y + size.y * 0.06, min.z + size.z * 0.08));
    anchorsRef.current = anchorsWorld.map((w) => gltfScene.worldToLocal(w.clone()));
  };

  // mark when all assets loaded
  useEffect(() => {
    if (loadedCount >= totalAssets) {
      setAssetsLoaded(true);
    }
  }, [loadedCount, totalAssets]);

  // update logo transform in RAF loop; keep translate+scale on same wrapper (avoid jumps)
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
        const finalLeft = window.innerWidth / 2; // keep centered as requested
        const finalTop = 100;
        const dx = finalLeft - centerX;
        const dy = finalTop - centerY;
        const scale = (startSize + (endSize - startSize) * eased) / startSize;
        wrap.style.transform = `translate(-50%,-50%) translate(${dx * eased}px, ${dy * eased}px) scale(${scale})`;
        wrap.style.transformOrigin = "center top";
        wrap.style.transition = "transform 0ms linear";
        wrap.style.opacity = "1";
      }
      // if fully played -> mark introComplete (unblock scrolling)
      if (p >= 0.9999) {
        setIntroComplete(true);
      } else {
        setIntroComplete(false);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isMobile]);

  // timeline animator (tween to target)
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
        // show labels? we commented out tags.
        if (Math.abs(timelineProgressRef.current - 1) < 1e-6) {
          setLabelsVisible(true);
        } else {
          setLabelsVisible(false);
        }
      }
    }
    requestAnimationFrame(step);
  }

  // scroll triggers: only when top area (<=100px) and assetsLoaded
  useEffect(() => {
    const onWheel = (e) => {
      if (!assetsLoaded) return;
      if (window.scrollY <= 100) {
        if (e.deltaY > 0) animateTimelineTo(1, 700);
        else if (e.deltaY < 0) animateTimelineTo(0, 700);
      }
    };
    let touchStartY = null;
    const onTouchStart = (ev) => {
      if (!assetsLoaded) return;
      if (window.scrollY <= 100) touchStartY = ev.touches ? ev.touches[0].clientY : null;
      else touchStartY = null;
    };
    const onTouchMove = (ev) => {
      if (!assetsLoaded) return;
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
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [assetsLoaded]);

  // ensure renderer color space set to sRGB to show textures correctly.
  // This is done inside Canvas onCreated below.

  // keep canvas wrapper toggling between fixed (during intro) and normal flow (after)
  const canvasWrapperStyle = {
    position: introComplete ? "relative" : "fixed",
    inset: introComplete ? "auto" : 0,
    zIndex: 2,
    pointerEvents: "none",
    width: "100%",
    height: introComplete ? "60vh" : "100vh", // when flow, reduce height so content follows
    top: introComplete ? undefined : 0,
  };

  // styling for content sections container
  const contentContainerStyle = {
    background: "#191919",
    color: "#fff",
    paddingTop: introComplete ? 20 : window.innerHeight, // ensure sections appear after intro when pinned
  };

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#191919", position: "relative" }}>
      <style>{`
        html, body, #root { height: 100%; background: #191919; }
        body { margin: 0; }
        body::-webkit-scrollbar { width: 0; height: 0; }
        body { scrollbar-width: none; -ms-overflow-style: none; }
        h1 { margin: 12px 0; }
        .section { max-width: 1300px; margin: 0 auto; padding: 28px 20px; }
        /* zig-zag paragraphs: alternate using .zig:nth-of-type(odd) etc. */
        .zig { text-align: left; margin: 8px 0; font-family: 'ZalandoSans', Inter, sans-serif; }
        @media (min-width: 900px) {
          .zig:nth-of-type(odd) { transform: translateX(-6%); }
          .zig:nth-of-type(even) { transform: translateX(6%); }
        }
      `}</style>

      {/* Logo wrapper (centered initially) */}
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

      {/* Canvas wrapper - toggles between fixed (intro) and relative (after) */}
      <div style={canvasWrapperStyle}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0, isMobile ? 120000 : 220000], fov: 7, near: 10000, far: 800000 }}
          style={{ width: "100%", height: "100%", maxWidth: "100vw" }}
          onCreated={({ gl, scene }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            try {
              if (gl.outputColorSpace !== undefined) gl.outputColorSpace = THREE.SRGBColorSpace;
              else gl.outputEncoding = THREE.sRGBEncoding;
            } catch (e) {}
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
                baseScale={isMobile ? 300000 : 600000}
              />
            </Center>
            <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.45} far={10} />
          </Suspense>

          <EffectComposer multisampling={4}>
            <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Loader overlay blocks until assets are loaded */}
      {!assetsLoaded && <LoaderOverlay progress={loadingProgress} />}

      {/* Content sections — scrollable after introComplete */}
      <div style={contentContainerStyle}>
        <div className="section">
          <TeamContent />
        </div>

        <div className="section">
          <ScheduleContent />
        </div>

        <div className="section">
          <JoinUsContent />
        </div>

        <div className="section">
          <ContactContent />
        </div>

        <div style={{ height: 200 }} />
      </div>
    </div>
  );
}
