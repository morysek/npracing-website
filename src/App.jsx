// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* -----------------------
   Simple NP Logo (SVG)
   ----------------------- */
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
      {/* full SVG content copied from your original */}
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

/* -------------------------
   Manual OBJ loader (no R3F hooks outside Canvas)
   ------------------------- */
function InteractiveModel({ onLoad, controlRef, scale }) {
  const [obj, setObj] = useState(null);
  const group = useRef();

  useEffect(() => {
    let cancelled = false;
    const loader = new OBJLoader();
    loader.load(
      "/models/F1.obj",
      (loaded) => {
        if (cancelled) return;
        loaded.traverse((c) => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
            if (c.material) {
              c.material.polygonOffset = true;
              c.material.depthWrite = true;
              c.material.polygonOffsetFactor = 5;
              c.material.polygonOffsetUnits = 5;
              c.material.needsUpdate = true;
            }
          }
        });
        setObj(loaded);
        onLoad && onLoad();
        if (controlRef) controlRef.current = group.current;
      },
      undefined,
      (err) => {
        console.error("OBJ load error:", err);
      }
    );
    return () => (cancelled = true);
  }, [onLoad, controlRef]);

  if (!obj) return null;
  return (
    <group ref={group}>
      <primitive object={obj} scale={scale} position={[0, 0, 0.5]} />
    </group>
  );
}

/* -------------------------
   Simple subtle model rotation (auto, not bound to scroll)
   ------------------------- */
function AutoRotate({ modelRef }) {
  useFrame((_, delta) => {
    const obj = modelRef.current;
    if (!obj) return;
    // slow idle rotation so the model feels alive
    obj.rotation.y += 0.002 * delta;
    obj.rotation.x += 0.001 * delta;
  });
  return null;
}

/* -------------------------
   3D Canvas wrapper (appears on reveal)
   ------------------------- */
function ThreeDCar({ reveal, scaleMultiplier = 1 }) {
  const modelRef = useRef();
  const [loaded, setLoaded] = useState(false);

  // camera based on device
  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  const cameraPos = isMobile ? [0, 0, 100000 * scaleMultiplier] : [0, 0, 200000 * scaleMultiplier];
  const modelScale = isMobile ? 300000 * scaleMultiplier : 600000 * scaleMultiplier;

  if (!reveal) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 5,
      }}
      aria-hidden
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: cameraPos, fov: 7, near: 10000, far: 500000 }}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
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
            <InteractiveModel onLoad={() => setLoaded(true)} controlRef={modelRef} scale={modelScale} />
          </Center>

          <AutoRotate modelRef={modelRef} />
          <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.45} far={10} />
        </Suspense>

        <EffectComposer multisampling={4}>
          <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

/* -------------------------
   Labels overlay (SVG)
   ------------------------- */
function LabelsOverlay({ visible, mobileScale = 1 }) {
  if (!visible) return null;

  // Positions are approximate and relative to viewport center; adjust to taste.
  const w = typeof window !== "undefined" ? window.innerWidth : 1200;
  const h = typeof window !== "undefined" ? window.innerHeight : 900;
  const cx = w / 2;
  const cy = h / 2;

  // Points outward from the car center toward labels
  const labels = [
    { text: "Team", x: cx - 360 * mobileScale, y: cy - 120 * mobileScale, toX: cx - 80 * mobileScale, toY: cy - 40 * mobileScale },
    { text: "Schedule", x: cx + 240 * mobileScale, y: cy - 170 * mobileScale, toX: cx + 60 * mobileScale, toY: cy - 20 * mobileScale },
    { text: "Contact", x: cx - 420 * mobileScale, y: cy + 60 * mobileScale, toX: cx - 60 * mobileScale, toY: cy + 60 * mobileScale },
    { text: "Join Us", x: cx + 260 * mobileScale, y: cy + 90 * mobileScale, toX: cx + 80 * mobileScale, toY: cy + 80 * mobileScale },
  ];

  return (
    <svg style={{ position: "fixed", inset: 0, zIndex: 10, pointerEvents: "none" }}>
      {labels.map((l, i) => (
        <g key={i}>
          <line x1={l.x} y1={l.y} x2={l.toX} y2={l.toY} stroke="#ffcc00" strokeWidth={2} strokeLinecap="round" opacity={0.95} />
          <rect x={l.x - 8} y={l.y - 20} rx={4} ry={4} width={88} height={28} fill="#000" opacity={0.6} />
          <text x={l.x + 8} y={l.y - 1} fill="#ffcc00" fontFamily="'Zalando Sans Expanded', sans-serif" fontSize={14} fontWeight={700}>
            {l.text}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* -------------------------
   Main App — one-time animation
   ------------------------- */
export default function App() {
  const fixedLogoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [revealCar, setRevealCar] = useState(false);

  // responsive sizes
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // load Google font (optional)
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Zalando+Sans+Expanded:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // compute transform endpoints for logo: center -> top-left
  function computeLogoMotion() {
    const startSize = isMobile ? 260 : 520;
    const endSize = isMobile ? 56 : 90; // small top-left logo size
    // starting center position
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    // final top-left position (absolute coordinates relative to viewport)
    const finalLeft = 24; // px from left
    const finalTop = 16; // px from top
    // delta from center to final target
    const dx = finalLeft - centerX;
    const dy = finalTop - centerY;
    return { startSize, endSize, dx, dy, centerX, centerY };
  }

  // one-time animation: lerp progress 0 -> 1 over duration ms
  function startOneTimeAnimation(duration = 900) {
    if (animationStarted) return;
    setAnimationStarted(true);
    const start = performance.now();
    const { startSize, endSize, dx, dy } = computeLogoMotion();
    const el = fixedLogoRef.current;
    if (!el) {
      // fallback: just reveal car
      setRevealCar(true);
      setAnimationDone(true);
      return;
    }

    // animation loop
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      // ease - smoothstep-like
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      // compute scale and translation
      const size = startSize + (endSize - startSize) * eased;
      const scale = size / startSize;
      const translateX = dx * eased;
      const translateY = dy * eased;
      el.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
      if (t >= 0.18 && !revealCar) {
        // reveal car once logo begins moving (small threshold)
        setRevealCar(true);
      }
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        // finalize
        setAnimationDone(true);
      }
    }
    requestAnimationFrame(frame);
  }

  // attach first-user interaction listeners to trigger the one-time animation
  useEffect(() => {
    function onFirstInteraction() {
      startOneTimeAnimation(900);
      // remove listeners (one-time)
      window.removeEventListener("wheel", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("mousedown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    }
    window.addEventListener("wheel", onFirstInteraction, { passive: true });
    window.addEventListener("touchstart", onFirstInteraction, { passive: true });
    window.addEventListener("mousedown", onFirstInteraction);
    window.addEventListener("keydown", onFirstInteraction);
    // also allow clicking the centered logo
    const logo = fixedLogoRef.current;
    if (logo) logo.addEventListener("click", onFirstInteraction);
    return () => {
      window.removeEventListener("wheel", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("mousedown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      if (logo) logo.removeEventListener("click", onFirstInteraction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // small top-left logo is always visible; we show it in top-left absolutely.
  // center logo is fixed and will animate to top-left.
  // when animationDone true we can hide the center-logo's pointer-events (already none) — it's fine.

  // mobile scale pass to overlays
  const mobileScale = isMobile ? 0.7 : 1;

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#191919",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Zalando Sans Expanded', 'Inconsolata', sans-serif",
        color: "#fff",
      }}
    >
      {/* global styles */}
      <style>{`
        body { background: #191919; margin:0; }
      `}</style>

      {/* top-left logo (always present, absolute to top) */}
      <div style={{ position: "fixed", left: 16, top: 12, zIndex: 40, pointerEvents: "none" }} aria-hidden>
        <NPLogo size={isMobile ? 56 : 90} />
      </div>

      {/* centered fixed logo (the big one that animates to top-left once) */}
      <div
        id="centered-logo"
        ref={fixedLogoRef}
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate3d(-50%, -50%, 0) scale(1)",
          zIndex: 30,
          pointerEvents: "auto", // allow click to trigger animation
          willChange: "transform",
          touchAction: "manipulation",
        }}
        onClick={() => {
          // clicking the big logo should trigger the one-time animation too
          startOneTimeAnimation(900);
        }}
      >
        <NPLogo size={isMobile ? 260 : 520} />
      </div>

      {/* 3D model (appears when revealCar turns true) */}
      <ThreeDCar reveal={revealCar} scaleMultiplier={isMobile ? 0.9 : 1} />

      {/* labels overlay (show only after reveal) */}
      <LabelsOverlay visible={revealCar} mobileScale={mobileScale} />

      {/* NOTE: textual content removed/hidden per request; nothing else rendered */}
    </div>
  );
}
