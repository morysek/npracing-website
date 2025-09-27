// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/**
 * Notes:
 * - Put your fonts in /public/fonts (or keep using Google Fonts).
 * - Put F1.obj in /public/models/F1.obj
 * - This file hides textual sections (per your request) and exposes only the
 *   fixed logo + 3D car reveal interaction.
 */

/* -------------------------
   Simple NP Logo component
   ------------------------- */
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
      {/* SVG body (same as before) */}
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

/* ---------------------------
   Manual OBJ loader component
   (no R3F hooks outside Canvas)
   --------------------------- */
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
        console.error("Failed to load OBJ:", err);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [onLoad, controlRef]);

  if (!obj) return null;
  return (
    <group ref={group}>
      <primitive object={obj} scale={scale} position={[0, 0, 0.5]} />
    </group>
  );
}

/* -------------------------
   Scroll-driven rotation hook
   (runs inside Canvas)
   ------------------------- */
function ScrollDrivenRotation({ modelRef, targetZRef, showCar }) {
  const currentZ = useRef(0);
  useFrame(() => {
    const obj = modelRef.current;
    if (!obj) return;
    if (!showCar) {
      // keep tiny when not revealed
      obj.scale.setScalar(0.001);
      return;
    }
    // scale in gently
    obj.scale.lerp(new THREE.Vector3(1, 1, 1), 0.07);
    // lerp rotation Z
    currentZ.current += (targetZRef.current - currentZ.current) * 0.12;
    obj.rotation.z = currentZ.current;
  });
  return null;
}

/* -------------------------
   3D canvas wrapper
   ------------------------- */
function ThreeDCar({ reveal }) {
  const modelRef = useRef();
  const [loaded, setLoaded] = useState(false);
  const targetZ = useRef(0);

  // NOTE: camera and scale are set large because the model is in its own units.
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "transparent",
        display: reveal ? "flex" : "none", // only show canvas when reveal true
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 200000], fov: 7, near: 10000, far: 500000 }}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        onCreated={({ gl, scene }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          if (gl.outputColorSpace !== undefined) gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.6;
          scene.background = new THREE.Color(0x101720);
        }}
      >
        <ambientLight intensity={0.12} />
        <directionalLight intensity={2} position={[5, 10, 5]} />

        <Suspense fallback={null}>
          <Environment preset="city" background={false} />
          <Center>
            <InteractiveModel onLoad={() => setLoaded(true)} controlRef={modelRef} scale={600000} />
          </Center>

          {/* subtle breathing */}
          <ScrollDrivenRotation modelRef={modelRef} targetZRef={targetZ} showCar={reveal} />

          <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.5} far={10} />
        </Suspense>

        <EffectComposer multisampling={4}>
          <SSAO samples={21} radius={60000000} intensity={35} luminanceInfluence={0.6} color="black" />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

/* -------------------------
   Main App — smooth/virtual scroll + fixed logo
   ------------------------- */
export default function App() {
  // virtual scroll
  const containerRef = useRef(null);
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);
  const rafRef = useRef(null);

  // reveal flags
  const [revealCar, setRevealCar] = useState(false);

  // set up Google font for Zalando Expanded (optional)
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Zalando+Sans+Expanded:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // create a big scroll area to let user scroll and drive the animation
  // we hide textual content — per your request — so we only provide space for scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // hide native scrollbar visually
    el.style.scrollbarWidth = "none";
    el.style.msOverflowStyle = "none";

    // update target on native scroll
    const onScroll = () => {
      targetScroll.current = el.scrollTop;
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    // animation frame loop: lerp currentScroll -> targetScroll, compute progress
    const tick = () => {
      currentScroll.current += (targetScroll.current - currentScroll.current) * 0.12;
      const heroHeight = el.clientHeight; // use viewport height as hero size
      const progress = Math.min(Math.max(currentScroll.current / Math.max(heroHeight * 0.6, 1), 0), 1); // 0..1
      // trigger reveal when logo starts shrinking (small threshold)
      setRevealCar(progress > 0.05);
      // compute a desired Z rotation for the car (we store it on window so ThreeDCar can read if needed)
      // but instead we'll place it into a shared ref via window (or a custom event). Simpler: expose on window.
      // (Better: we could use a context or prop drilling — but ThreeDCar uses its own internal targetZ ref; we'll set it via a small custom event)
      window.__NPRACING_scroll_progress = progress;

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // cleanup
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // For ThreeDCar rotation we will poll window.__NPRACING_scroll_progress inside a small RAF hook
  // We'll pass the targetZ via a global ref the ThreeDCar's ScrollDrivenRotation can access.
  // But to keep things self-contained, we'll update a small global target used by ScrollDrivenRotation.
  useEffect(() => {
    // provide a small updater that transforms progress -> targetZ and writes to window.__NPRACING_targetZ
    const loop = () => {
      const progress = window.__NPRACING_scroll_progress || 0;
      const z = progress * Math.PI * 1.5; // same mapping as before
      window.__NPRACING_targetZ = z;
      requestAnimationFrame(loop);
    };
    const id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  /* Logo transform calculation:
     - logo is a fixed element so it never disappears
     - we lerp its transform based on the smoothed scroll progress (window.__NPRACING_scroll_progress)
  */
  useEffect(() => {
    // small RAF loop to apply logo transform smoothly (uses same virtual progress value)
    let raf = null;
    const el = document.getElementById("fixed-logo");
    const loop = () => {
      const p = window.__NPRACING_scroll_progress || 0; // 0..1
      // ease the progress a bit
      const eased = Math.min(1, Math.pow(p, 0.9));
      if (el) {
        // interpolate size from big to small
        const startSize = window.innerWidth <= 768 ? 260 : 520;
        const endSize = window.innerWidth <= 768 ? 60 : 90;
        const size = startSize + (endSize - startSize) * eased;
        // compute translation: move from center to top-left (we'll offset center -> left 56px, top 28px)
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const targetLeft = 56; // final left margin
        const targetTop = 28; // final top margin
        // when at eased=0: translate to center with scale 1
        // when at eased=1: translate to top-left with scale endSize/startSize
        // compute translation in px; easier to compute a transform with translate and scale:
        // compute deltaX from center to targetLeft
        const dx = targetLeft - centerX;
        const dy = targetTop - centerY;
        // We will translate by dx*eased, dy*eased and scale by (size/startSize)
        const scale = size / startSize;
        el.style.transform = `translate3d(${dx * eased}px, ${dy * eased}px, 0) scale(${scale})`;
        // ensure transform origin top-left-ish for a nicer look
        el.style.transformOrigin = "center left";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Render
     - fixed logo always visible and independent of scroll container
     - scroll container exists to provide scroll interaction
     - hide textual content (per your ask)
  */
  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#101720",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Zalando Sans Expanded', 'Inconsolata', sans-serif",
        color: "#fff",
      }}
    >
      {/* Inject small CSS: hide native scrollbars from the center container, etc. */}
      <style>{`
        /* hide scrollbar for the centered scroll container */
        #center-scroll::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
        #center-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* Fixed logo that is always on screen (separate from the scroll container) */}
      <div
        id="fixed-logo"
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate3d(-50%, -50%, 0) scale(1)",
          zIndex: 10,
          pointerEvents: "none",
          transition: "transform 0.12s linear",
          willChange: "transform",
        }}
        aria-hidden
      >
        <NPLogo size={520} />
      </div>

      {/* ThreeDCar: reveal when logo starts shrinking */}
      <ThreeDCar reveal={revealCar} />

      {/* Centered scroll container provides the scroll energy to drive the reveal.
          We intentionally hide textual sections. A large spacer is used so the user can scroll
          and move the logo — you can reduce/increase spacerHeight to control how much scroll is required. */}
      <div
        id="center-scroll"
        ref={containerRef}
        style={{
          height: "100vh",
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
          overflowY: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* HERO area (visually empty since the logo is fixed) */}
        <section id="hero" style={{ height: "100vh", background: "transparent" }} />

        {/* Hidden textual content — we keep this area empty / hidden per your request.
            Put content here later when you're ready. */}
        <section style={{ height: 1600 /* big scrollable spacer */ }} />

      </div>
    </div>
  );
}
