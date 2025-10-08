// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Center, ContactShadows, useGLTF } from "@react-three/drei";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* ---------- helpers ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---------- assets / labels ---------- */
const LABELS = ["TEAM", "JOIN US", "SCHEDULE", "CONTACT"];

/* ---------- SVG Logo component: use np_website.svg from public/ ---------- */
function NPWebsiteSVG({ width = 520, alt = "NP Website Logo", style = {} }) {
  return <img src="/np_website.svg" alt={alt} width={width} style={style} />;
}

/* ---------- small/basic logo (top-left) ---------- */
function NPBasic({ size = 56, style = {} }) {
  return <img src="/npbasic.svg" alt="NP Basic" width={size} style={style} />;
}

/* ---------- InteractiveModel (GLTF) ---------- */
function InteractiveModel({ onModelLoaded, isMobile, baseScale = 600000 }) {
  // loads /models/F1.glb
  const gltf = useGLTF("/models/F1.glb");
  const group = useRef();

  useEffect(() => {
    if (!gltf || !gltf.scene) return;
    // improve texture encoding so colors look correct
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

  // Continuous idle rotation only (no appear animation)
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    // gentle, multi-axis idle rotation
    group.current.rotation.x = 0.05 + Math.sin(t * 0.2) * 0.02;
    group.current.rotation.y = Math.sin(t * 0.4) * 0.15;
    group.current.rotation.z = Math.cos(t * 0.3) * 0.06;

    // scale so model fits viewport on mobile
    const mobileScale = isMobile ? baseScale * (window.innerWidth / 1200) : baseScale;
    const scaleFactor = mobileScale / baseScale;
    group.current.scale.setScalar(scaleFactor);
  });

  return (
    <group ref={group}>
      {gltf && <primitive object={gltf.scene} scale={baseScale} position={[0, 0, 0]} />}
    </group>
  );
}

/* ---------- LoaderOverlay (uses np_website.svg) ---------- */
function LoaderOverlay({ progress }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg,#070617 0%, #0f0f1f 100%)",
        color: "#e6f9ff",
        pointerEvents: "auto",
      }}
    >
      <div style={{ textAlign: "center", padding: 24, width: "min(720px, 92%)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <NPWebsiteSVG width={260} style={{ filter: "drop-shadow(0 6px 18px rgba(0,255,230,0.12))", WebkitFilter: "drop-shadow(0 6px 18px rgba(0,255,230,0.12))" }} />
        </div>

        <div style={{ color: "#00ffd8", fontFamily: "'ZalandoSans', Inter, sans-serif', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          RETRO FUTURISTIC LOADING
        </div>

        <div style={{ height: 10, width: "100%", background: "rgba(255,255,255,0.04)", borderRadius: 999, overflow: "hidden", boxShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.round(progress)}%`,
              background: "linear-gradient(90deg,#00ffd8,#ff00d0,#ffcc00)",
              transition: "width 220ms ease",
              boxShadow: "0 8px 28px rgba(255,0,208,0.08), inset 0 -4px 12px rgba(0,0,0,0.25)",
            }}
          />
        </div>

        <div style={{ marginTop: 10, color: "#bfeeee", fontFamily: "'ZalandoSans', Inter, sans-serif", fontSize: 14 }}>
          {Math.round(progress)}% — powering up the ducts...
        </div>

        <div style={{ marginTop: 18, display: "flex", justifyContent: "center", gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "radial-gradient(circle at 30% 20%, #00ffd8, #001f22)",
              boxShadow: "0 8px 30px rgba(0,255,216,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: 6, background: "#ff00d0", boxShadow: "0 6px 20px rgba(255,0,208,0.25)", transformOrigin: "center" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Content sections ---------- */
function TeamContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300, margin: "0 auto" }}>
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
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300, margin: "0 auto" }}>
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
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300, margin: "0 auto" }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Contact</h1>
      <p className="zig">
        For general inquiry: <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">prokopmatej@novyporg.cz</a>
      </p>
    </div>
  );
}

function JoinUsContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300, margin: "0 auto" }}>
      <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Join Us</h1>
      <p className="zig">Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>
    </div>
  );
}

/* ---------- App (main) ---------- */
export default function App() {
  // fonts: Microgramma + Zalando (ensure you put woff2 files in /public/fonts or use Google)
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
        body { font-family: 'ZalandoSans', Inter, sans-serif; background: radial-gradient(circle at 10% 10%, #070617 0%, #0b0820 25%, #070a16 100%); margin: 0; color: #fff; }
        ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
        html,body { scrollbar-width: none; -ms-overflow-style: none; }
      `;
      document.head.appendChild(style);
    }
    return () => {};
  }, []);

  // refs + state
  const logoRef = useRef(null);
  const smallLogoRef = useRef(null);
  const modelRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // preload images + model loaded state
  const [loadedCount, setLoadedCount] = useState(0);
  const totalAssets = 4; // 3 images + 1 model
  const loadingProgress = Math.min(100, (loadedCount / totalAssets) * 100);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    if (loadedCount >= totalAssets) setAssetsLoaded(true);
  }, [loadedCount]);

  // preload team photos
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

  // model loaded callback
  const handleModelLoaded = (gltfScene) => {
    modelRef.current = gltfScene;
    setLoadedCount((c) => c + 1);
  };

  // small logo + big logo fade behavior on scroll
  const [bigLogoOpacity, setBigLogoOpacity] = useState(1);
  const [showSmallLogo, setShowSmallLogo] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const fadeStart = 20; // px
      const fadeEnd = 220; // px where big logo is fully faded
      const y = window.scrollY;
      const t = clamp((y - fadeStart) / (fadeEnd - fadeStart), 0, 1);
      setBigLogoOpacity(1 - t);
      setShowSmallLogo(t > 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // canvas sizing: keep canvas height sensible and not exceed viewport width
  const canvasStyle = {
    width: "100%",
    height: "70vh",
    maxWidth: "100vw",
    display: "block",
  };

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "radial-gradient(circle at 10% 10%, #070617 0%, #0b0820 25%, #070a16 100%)", position: "relative" }}>
      <style>{`
        .neonTitle { color: #00ffd8; text-shadow: 0 6px 20px rgba(0,255,216,0.14), 0 0 12px rgba(0,255,216,0.06); }
        h1 { margin: 12px 0; font-family: Microgramma, sans-serif; color: #ffcc00; text-shadow: 0 6px 24px rgba(255,204,0,0.12); }
        .section { max-width: 1300px; margin: 0 auto; padding: 20px; }
        .zig { text-align: left; margin: 8px 0; font-family: 'ZalandoSans', Inter, sans-serif; line-height:1.35; color: #e6f9ff; }
        @media (min-width: 900px) {
          .zig:nth-of-type(odd) { transform: translateX(-4%); }
          .zig:nth-of-type(even) { transform: translateX(4%); }
        }
      `}</style>

      {/* big centered logo (np_website.svg) — fades on scroll */}
      <div
        ref={logoRef}
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 60,
          pointerEvents: "none",
          willChange: "opacity, transform",
          opacity: bigLogoOpacity,
          transition: "opacity 220ms linear",
          filter: "drop-shadow(0 20px 40px rgba(0,255,216,0.06))",
        }}
        aria-hidden
      >
        <NPWebsiteSVG width={isMobile ? 260 : 520} />
      </div>

      {/* small basic logo top-left (npbasic.svg) */}
      <div
        ref={smallLogoRef}
        style={{
          position: "fixed",
          left: 18,
          top: 18,
          zIndex: 80,
          pointerEvents: "none",
          opacity: showSmallLogo ? 1 : 0,
          transform: showSmallLogo ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.98)",
          transition: "opacity 240ms ease, transform 240ms cubic-bezier(.2,.9,.2,1)",
          filter: "drop-shadow(0 6px 18px rgba(0,255,216,0.06))",
        }}
      >
        <NPBasic size={48} />
      </div>

      {/* Canvas */}
      <div style={{ position: "relative", zIndex: 20, pointerEvents: "none", display: "block", width: "100%", maxWidth: "100vw" }}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0, isMobile ? 120000 : 220000], fov: 7, near: 10000, far: 800000 }}
          style={canvasStyle}
          onCreated={({ gl, scene }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            try {
              if (gl.outputColorSpace !== undefined) gl.outputColorSpace = THREE.SRGBColorSpace;
              else gl.outputEncoding = THREE.sRGBEncoding;
            } catch (e) {}
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.7;
            scene.background = new THREE.Color(0x090618);
          }}
        >
          <ambientLight intensity={0.14} />
          <directionalLight intensity={0.9} position={[10, 20, 10]} color={0xffffff} />
          <directionalLight intensity={0.7} position={[-10, 12, -6]} color={0xff7aa0} />

          <Suspense fallback={null}>
            <Environment preset="sunset" background={false} />
            <Center>
              <InteractiveModel onModelLoaded={handleModelLoaded} isMobile={isMobile} baseScale={isMobile ? 200000 : 600000} />
            </Center>
            <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={12} height={12} blur={2} opacity={0.5} far={10} />
          </Suspense>

          <EffectComposer multisampling={4}>
            <SSAO samples={21} radius={60000000} intensity={20} luminanceInfluence={0.6} color="black" />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Loader overlay until all assets loaded */}
      {!assetsLoaded && <LoaderOverlay progress={loadingProgress} />}

      {/* Content (page scrolls normally) */}
      <main style={{ background: "linear-gradient(180deg, rgba(5,6,12,0.98) 0%, rgba(8,6,18,1) 100%)" }}>
        <section className="section" style={{ paddingTop: "24px" }}>
          <TeamContent />
        </section>

        <section className="section">
          <ScheduleContent />
        </section>

        <section className="section">
          <JoinUsContent />
        </section>

        <section className="section">
          <ContactContent />
        </section>

        <div style={{ height: 120 }} />
      </main>
    </div>
  );
}
