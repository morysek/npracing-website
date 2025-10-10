// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Center, ContactShadows, useGLTF } from "@react-three/drei";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* ---------- helpers ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ---------- NPLogo (kept original SVG content simplified) ---------- */
function NPLogo({ size = 300 }) {
  // small / simplified inline svg is fine here — replace with your npbasic.svg if you want to reference an external file.
  return (
    <img
      src="/npbasic.svg"
      alt="NP Basic Logo"
      width={size}
      height={(size * 30.96) / 104.14}
      style={{ display: "block" }}
    />
  );
}

/* ---------- InteractiveModel (GLTF) — unchanged from previous iteration ---------- */
function InteractiveModel({ onModelLoaded, progressRef, isMobile, baseScale = 600000 }) {
  const gltf = useGLTF("/models/F1.glb");
  const group = useRef();

  useEffect(() => {
    if (!gltf || !gltf.scene) return;
    gltf.scene.traverse((c) => {
      if (c.isMesh && c.material) {
        if (c.material.map) c.material.map.encoding = THREE.sRGBEncoding;
        if (c.material.emissiveMap) c.material.emissiveMap.encoding = THREE.sRGBEncoding;
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
    const p = clamp(progressRef.current);
    const eased = easeInOutCubic(p);
    const fromZ = isMobile ? 280000 : 420000;

    group.current.position.set(0, (1 - eased) * (isMobile ? 2.5 : 4), -fromZ * (1 - eased));
    group.current.rotation.x = eased * (Math.PI * 0.12);

    const t = state.clock.getElapsedTime();
    group.current.rotation.x += 0.002 + 0.02 * Math.sin(t * 0.7) * 0.01;
    group.current.rotation.y += 0.0015 + 0.02 * Math.sin(t * 0.5) * 0.01;
    group.current.rotation.z += 0.0012 + 0.015 * Math.cos(t * 0.6) * 0.01;

    const mobileScale = isMobile ? baseScale * (window.innerWidth / 1200) : baseScale;
    const finalScale = (0.0001 + eased) * (mobileScale / baseScale);
    group.current.scale.setScalar(finalScale);

    gltf.scene.traverse((c) => {
      if (c.isMesh && c.material && "opacity" in c.material) c.material.opacity = clamp(eased);
    });
  });

  return (
    <group ref={group}>
      <primitive object={gltf.scene} scale={baseScale} position={[0, 0, 0]} />
    </group>
  );
}

/* ---------- LoaderOverlay
   - shows different svgs based on progress ranges
   - shows numeric percentage (no percent sign) in Microgramma Bold (color #ffcc00)
   - when assetsLoaded: hides the number and shows loading_logo.svg alongside the 100% svg
   - pointerEvents is controlled so overlay blocks interaction until all assets are loaded
---------- */
function LoaderOverlay({ progress, assetsLoaded, introComplete }) {
  // progress is 0..100
  const p = Math.round(Math.max(0, Math.min(100, progress)));
  let svgToShow = "/loading_25.svg";
  if (p >= 100) svgToShow = "/loading_100.svg";
  else if (p >= 75) svgToShow = "/loading_75.svg";
  else if (p >= 50) svgToShow = "/loading_50.svg";
  else svgToShow = "/loading_25.svg";

  // overlay blocks interaction while assets are loading; once assetsLoaded we allow pointer events (so user can scroll)
  const overlayPointer = assetsLoaded ? "none" : "auto";

  // keep overlay visible until the user scrolls past (introComplete true)
  if (introComplete) return null;

  return (
    <div
      aria-hidden={!assetsLoaded}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#141414",
        pointerEvents: overlayPointer,
      }}
    >
      <div style={{ textAlign: "center", width: "100%", maxWidth: 920, padding: 24 }}>
        {/* central SVG for current progress */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, flexDirection: "column" }}>
          <img src={svgToShow} alt="loading" style={{ maxWidth: "60vw", height: "auto", display: "block" }} />

          {/* if assetsLoaded show the final loading_logo alongside the 100% svg */}
          {assetsLoaded ? (
            <img src="/loading_logo.svg" alt="loading logo" style={{ width: 160, height: "auto", marginTop: 18 }} />
          ) : (
            // percentage number in Microgramma Bold (no percent sign) colored like titles (#ffcc00)
            <div
              style={{
                marginTop: 18,
                fontSize: 48,
                fontFamily: "Microgramma, sans-serif",
                fontWeight: 700,
                color: "#ffcc00",
                letterSpacing: "0.02em",
              }}
            >
              {String(p)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Content components (Team / Schedule / Contact / Join Us)
   - Titles use Microgramma, body uses ZalandoSans
   - images referenced as requested
---------- */
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
  // fonts: Microgramma + Zalando (expects files in /public/fonts)
  useEffect(() => {
    const id = "__npr_fonts";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
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
        body { font-family: 'ZalandoSans', Inter, sans-serif; background: #141414; margin: 0; }
        ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
        html,body { scrollbar-width: none; -ms-overflow-style: none; }
      `;
      document.head.appendChild(style);
    }
    return () => {};
  }, []);

  // refs
  const logoWrapRef = useRef(null);
  const modelRef = useRef(null);
  const anchorsRef = useRef([]);

  // responsive
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // timeline (logo transform on scroll, user controls)
  const timelineProgressRef = useRef(0);
  const timelineTargetRef = useRef(0);
  const animatingRef = useRef(false);

  // loader state: 3 images + 1 glb
  const [loadedCount, setLoadedCount] = useState(0);
  const totalAssets = 4;
  const loadingProgress = (loadedCount / totalAssets) * 100;
  const assetsLoaded = loadedCount >= totalAssets;

  // Whether the intro/logo has completed the transform and the front page can be removed
  const [introComplete, setIntroComplete] = useState(false);

  // preload images
  useEffect(() => {
    const imgs = ["/images/team1.jpg", "/images/team2.jpg", "/images/team3.jpg"];
    let mounted = true;
    imgs.forEach((src) => {
      const im = new Image();
      im.onload = () => mounted && setLoadedCount((c) => c + 1);
      im.onerror = () => mounted && setLoadedCount((c) => c + 1);
      im.src = src;
    });
    return () => (mounted = false);
  }, []);

  // model loaded callback (InteractiveModel will call this)
  const handleModelLoaded = (gltfScene) => {
    modelRef.current = gltfScene;
    setLoadedCount((c) => c + 1);

    // compute anchors (unused here but kept)
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

  // enable page scroll only after assets have loaded — before that block interaction
  useEffect(() => {
    document.body.style.overflow = assetsLoaded ? "auto" : "hidden";
  }, [assetsLoaded]);

  // update logo transform RAF loop (drives logo while timelineProgressRef changes)
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
        const finalLeft = window.innerWidth / 2;
        const finalTop = 100;
        const dx = finalLeft - centerX;
        const dy = finalTop - centerY;
        const scale = (startSize + (endSize - startSize) * eased) / startSize;
        wrap.style.transform = `translate(-50%,-50%) translate(${dx * eased}px, ${dy * eased}px) scale(${scale})`;
        wrap.style.transformOrigin = "center top";
        wrap.style.transition = "transform 0ms linear";
        wrap.style.opacity = "1";
      }

      // mark introComplete only when the timeline is at the end AND assets are loaded
      if (p >= 0.9999 && assetsLoaded) setIntroComplete(true);
      else setIntroComplete(false);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isMobile, assetsLoaded]);

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
      }
    }
    requestAnimationFrame(step);
  }

  // scroll triggers — allow control only after assets are loaded
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

  // canvas wrapper style; when introComplete the canvas becomes relative and shorter so the content below becomes visible
  const canvasWrapperStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 2,
    pointerEvents: "none",
    width: "100%",
    height: "100vh",
    top: 0,
  };

  // content container starts after the front page (title area). We ensure front page fills the viewport.
  const contentContainerStyle = {
    background: "#141414",
    color: "#fff",
    paddingTop: 0, // content sits after full-screen title area
  };

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#141414", position: "relative" }}>
      <style>{`
        html, body, #root { height: 100%; background: #141414; }
        body { margin: 0; }
        body::-webkit-scrollbar { width: 0; height: 0; }
        body { scrollbar-width: none; -ms-overflow-style: none; }
        h1 { margin: 12px 0; font-family: Microgramma, sans-serif; }
        .section { max-width: 1300px; margin: 0 auto; padding: 28px 20px; }
        .zig { text-align: left; margin: 8px 0; font-family: 'ZalandoSans', Inter, sans-serif; line-height:1.35; color: #fff; }
        @media (min-width: 900px) {
          .zig:nth-of-type(odd) { transform: translateX(-6%); }
          .zig:nth-of-type(even) { transform: translateX(6%); }
        }
      `}</style>

      {/* FRONT/TITLE PAGE (logo centered) */}
      <div
        style={{
          height: "100vh",
          width: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          ref={logoWrapRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%) scale(1)",
            zIndex: 40,
            pointerEvents: "none",
            willChange: "transform, opacity",
          }}
          aria-hidden
        >
          <NPLogo size={isMobile ? 200 : 360} />
        </div>

        {/* Canvas sits behind/above as needed */}
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
              scene.background = new THREE.Color(0x141414);
            }}
          >
            <ambientLight intensity={0.12} />
            <directionalLight intensity={0.9} position={[10, 20, 10]} color={0xffffff} />
            <directionalLight intensity={0.9} position={[-10, 12, -6]} color={0xffb27a} />

            <Suspense fallback={null}>
              <Environment preset="city" background={false} />
              <Center>
                {/* keep model but it is optional — InteractiveModel will call handleModelLoaded when it loads */}
                <InteractiveModel onModelLoaded={handleModelLoaded} progressRef={timelineProgressRef} isMobile={isMobile} baseScale={isMobile ? 300000 : 600000} />
              </Center>
              <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.45} far={10} />
            </Suspense>

            <EffectComposer multisampling={4}>
              <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
            </EffectComposer>
          </Canvas>
        </div>

        {/* Loader/title overlay: visible until the user scrolls past front page (introComplete) */}
        <LoaderOverlay progress={loadingProgress} assetsLoaded={assetsLoaded} introComplete={introComplete} />
      </div>

      {/* MAIN CONTENT (below front page) */}
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
