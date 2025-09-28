// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
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
      {/* original SVG content (unchanged) */}
      <g transform="translate(-54.124261,-130.25079)">
        <g transform="translate(0,-2.4052947)" style={{ fontSize: 17.6389, fontFamily: "Inconsolata, monospace", fill: "#fff", strokeWidth: 0.264583 }}>
          <g transform="scale(1.1966041,0.83569829)" style={{ fontSize: 14.1111, fontFamily: "Inconsolata, monospace", letterSpacing: 5.29167, fill: "#fff", strokeWidth: 2.21112 }}>
            <path d="m 53.020878,195.78621 h -2.060221 l -2.610554,-2.65289 h -1.509887 v 2.65289 H 45.23155 v -7.02733 h 6.02544 q 1.580443,0 1.580443,1.22767 v 1.91911 q 0,0.889 -0.818444,1.22766 h -1.693332 z m -1.763888,-4.41678 v -0.84666 q 0,-0.55033 -0.465666,-0.55033 h -3.951108 v 1.96144 h 3.951108 q 0.465666,0 0.465666,-0.56445 z" />
            <path d="m 69.474419,195.78621 h -1.566332 l -0.917222,-1.53811 h -4.571996 l -0.874888,1.53811 h -1.622777 l 3.965219,-7.05555 h 1.566332 z m -3.217331,-2.82222 -1.580443,-2.86455 -1.566332,2.86455 z" />
            <path d="m 84.756759,194.1211 q 0,0.98778 -0.380999,1.32644 -0.366889,0.33867 -1.368777,0.33867 h -4.190997 q -1.001888,0 -1.382888,-0.33867 -0.366888,-0.33866 -0.366888,-1.32644 v -3.71122 q 0,-.97367 .366888,-1.31233 .381,-.35278 1.382888,-.35278 h 4.190997 q 1.693332,.0141 1.749776,1.17122 v 1.03011 h -1.636887 v -.94544 h -4.416775 v 4.45911 h 4.416775 v -1.03011 h 1.636887 z" />
            <path d="m 95.438876,195.78621 h -1.622777 v -7.05555 h 1.622777 z" />
            <path d="m 112.80966,195.78621 h -1.42522 l -5.37633,-4.93889 v 4.93889h -1.49578 v -7.05555 h 1.397 l 5.43278,4.92477 v -4.92477 h 1.46755z" />
            <path d="m 130.26509,194.1211 q 0,.98778 -.381,1.32644 -.36688,.33867 -1.36877,.33867 h -4.84011 q -1.00189,0 -1.38289,-.33867 -.36689,-.33866 -.36689,-1.32644 v -3.69711 q 0,-.98778 .36689,-1.32644 .381,-.33867 1.38289,-.33867 h 4.84011 q 1.04422,0 1.397,.36689 .35277,.35278 .35277,1.38289 h -1.59455 v -.49389 h -5.10822 v 4.445 h 5.10822 v -1.56634 h -2.94922 v -1.19944 h 4.54377 z" />
          </g>
        </g>
        <path style={{ fill: "#ffcc00", strokeWidth: 1.61928, strokeLinecap: "round" }} d="m 64.083427,130.25096 -9.959082,21.06022 h 4.532023 l 9.959082,-21.06022 z m 11.342977,0 -9.959082,21.06022 h 1.139465 4.505151 3.62872 l 9.959082,-21.06022 h -3.628719 -4.505152 z m 14.738635,0 -9.959082,21.06022 h 1.783354 v 5.1e-4 h 13.889591 l 0.535368,-1.13223 h -0.001 l 9.42371,-19.9285 H 97.007033 91.94791 Z" />
        <path style={{ fill: "#fff", strokeLinejoin: "round" }} d="m 111.60859,130.25083 c -0.96683,0.005 -1.91905,0.53479 -2.3828,1.51567 L 101.76888,147.53246 100,151.27435 h 5.85287 l 0.69867,-1.47846 h 5.2e-4 l 5.77949,-12.22045 11.88247,12.88242 c 1.27166,1.38021 3.53608,1.03468 4.33824,-0.66197 l 6.74016,-14.25185 h 16.1463 l -2.44895,5.17747 h -8.20725 l -2.50217,5.29115 h 12.38477 c 1.02253,-1.7e-4 1.95344,-0.58946 2.39107,-1.51361 l 4.95267,-10.46861 c 0.83036,-1.75547 -0.45016,-3.77762 -2.3921,-3.77755 h -21.99814 c -1.02309,-4.3e-4 -1.95475,0.58896 -2.39262,1.51361 l -5.7795,12.22096 -11.88247,-12.88294 c -0.53648,-0.58227 -1.24991,-0.85758 -1.95544,-0.85369 z" />
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

    if (gltf && gltf.scene) {
      gltf.scene.traverse((c) => {
        if (c.isMesh && c.material && "opacity" in c.material) c.material.opacity = clamp(eased);
      });
    }
  });

  return (
    <group ref={group}>
      <primitive object={gltf.scene} scale={baseScale} position={[0, 0, 0]} />
    </group>
  );
}

/* ---------- App (main) ---------- */
export default function App() {
  // fonts: Microgramma + Zalando (must place .woff2 files in /public/fonts)
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
        body { font-family: 'ZalandoSans', Inter, sans-serif; background: #191919; margin: 0; }
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

  // final canvas height (px) — computed once and updated on resize
  const [finalHeight, setFinalHeight] = useState(Math.round(window.innerHeight * 0.6));
  useEffect(() => {
    const onResize = () => setFinalHeight(Math.round(window.innerHeight * 0.6));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // timeline
  const timelineProgressRef = useRef(0);
  const timelineTargetRef = useRef(0);
  const animatingRef = useRef(false);

  // loader / assets states (kept from your previous setup)
  const [loadedCount, setLoadedCount] = useState(0);
  const totalAssets = 4;
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    if (loadedCount >= totalAssets) setAssetsLoaded(true);
  }, [loadedCount]);

  // introComplete when timeline fully played
  const [introComplete, setIntroComplete] = useState(false);
  useEffect(() => {
    const check = () => {
      if (timelineProgressRef.current >= 0.9999) setIntroComplete(true);
      else setIntroComplete(false);
    };
    let raf = 0;
    const loop = () => {
      check();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // keep body scrolling locked until intro + assets done (same as before)
  useEffect(() => {
    document.body.style.overflow = introComplete && assetsLoaded ? "auto" : "hidden";
  }, [introComplete, assetsLoaded]);

  // logo RAF (keeps same behaviour as before)
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
        // apply transform w/o jumps
        wrap.style.transform = `translate(-50%,-50%) translate(${dx * eased}px, ${dy * eased}px) scale(${scale})`;
        wrap.style.transformOrigin = "center top";
        wrap.style.opacity = "1";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isMobile]);

  // timeline animator (unchanged)
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

  // scroll triggers (only allow control when assets loaded)
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

  // preload images + count loaded
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

  // simulate model loaded callback (if you already call setLoadedCount in handleModelLoaded, remove this)
  const handleModelLoaded = (gltfScene) => {
    modelRef.current = gltfScene;
    setLoadedCount((c) => c + 1);
    // anchors calculation kept (unchanged)
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

  // Styling helpers derived from finalHeight and introComplete
  const scale = introComplete ? 1 : Math.max(1, window.innerHeight / Math.max(1, finalHeight));
  // Canvas wrapper: keep height == finalHeight ALWAYS to reserve layout space
  const canvasWrapperStyle = {
    position: introComplete ? "relative" : "fixed",
    inset: introComplete ? "auto" : 0,
    zIndex: 2,
    pointerEvents: "none",
    width: "100%",
    height: `${finalHeight}px`, // important: final height reserved
    top: introComplete ? undefined : 0,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    overflow: "hidden",
  };

  // Visual inner canvas container that is scaled while intro is running
  const canvasInnerStyle = {
    width: "100%",
    height: `${finalHeight}px`,
    transformOrigin: "top center",
    transform: `scale(${scale})`,
    transition: introComplete ? "transform 420ms cubic-bezier(.2,.9,.2,1)" : "transform 120ms linear",
    maxWidth: "100vw",
  };

  // Keep content below canvas in same place (use finalHeight to avoid jump)
  const contentContainerStyle = {
    background: "#191919",
    color: "#fff",
    paddingTop: `${finalHeight}px`, // reserve final canvas height so no jump
  };

  // render (LoaderOverlay omitted for brevity — keep your loader if needed)
  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#191919", position: "relative" }}>
      <style>{`
        html, body, #root { height: 100%; background: #191919; }
        body { margin: 0; }
        body::-webkit-scrollbar { width: 0; height: 0; }
        body { scrollbar-width: none; -ms-overflow-style: none; }
        h1 { margin: 12px 0; }
        .section { max-width: 1300px; margin: 0 auto; padding: 28px 20px; }
        .zig { text-align: left; margin: 8px 0; font-family: 'ZalandoSans', Inter, sans-serif; line-height:1.35 }
        @media (min-width: 900px) {
          .zig:nth-of-type(odd) { transform: translateX(-6%); }
          .zig:nth-of-type(even) { transform: translateX(6%); }
        }
      `}</style>

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

      {/* Canvas wrapper reserves finalHeight for layout always. inner gets scaled to fill viewport during intro. */}
      <div style={canvasWrapperStyle}>
        <div style={canvasInnerStyle}>
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
                <InteractiveModel onModelLoaded={handleModelLoaded} progressRef={timelineProgressRef} isMobile={isMobile} baseScale={isMobile ? 300000 : 600000} />
              </Center>
              <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.45} far={10} />
            </Suspense>

            <EffectComposer multisampling={4}>
              <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
            </EffectComposer>
          </Canvas>
        </div>
      </div>

      <div style={contentContainerStyle}>
        <div className="section">
          {/* TeamContent etc. - paste your components here */}
          <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Team</h1>
          <p className="zig">The Team</p>
          {/* ... keep your TeamContent markup ... */}
        </div>

        <div className="section">
          <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Schedule</h1>
          <p className="zig">Next up: Poland</p>
        </div>

        <div className="section">
          <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Join Us</h1>
          <p className="zig">Want to have the chance to compete? Contact us!</p>
        </div>

        <div className="section">
          <h1 style={{ color: "#ffcc00", fontFamily: "Microgramma" }}>Contact</h1>
          <p className="zig">
            For general inquiry: <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">prokopmatej@novyporg.cz</a>
          </p>
        </div>

        <div style={{ height: 200 }} />
      </div>
    </div>
  );
}
