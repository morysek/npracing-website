// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* ---------- helpers ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ---------- labels (commented out / no-op) ---------- */
// const LABELS = ["TEAM", "JOIN US", "SCHEDULE", "CONTACT"];

/* ---------- NPLogo ---------- */
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

/* ---------- InteractiveModel (renders previously-loaded gltf) ---------- */
function InteractiveModel({ gltf, onModelLoaded, progressRef, isMobile, scale = 600000 }) {
  const group = useRef();

  // when gltf arrives, tweak materials & notify parent
  useEffect(() => {
    if (!gltf || !gltf.scene) return;
    const scene = gltf.scene;

    scene.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        const mat = c.material;
        if (mat) {
          // color textures should be sRGB
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
          if (!("metalness" in mat)) mat.metalness = 0.05;
          if (!("roughness" in mat)) mat.roughness = 0.6;
          mat.side = THREE.FrontSide;
          mat.needsUpdate = true;
        }
      }
    });

    onModelLoaded && onModelLoaded(scene);
  }, [gltf, onModelLoaded]);

  useFrame((state) => {
    if (!group.current) return;
    const p = clamp(progressRef.current || 0);
    const eased = easeInOutCubic(p);
    const fromZ = isMobile ? 280000 : 420000;

    // slide in
    group.current.position.set(0, (1 - eased) * (isMobile ? 2.5 : 4), -fromZ * (1 - eased));
    // base appear rotation on X
    group.current.rotation.x = eased * (Math.PI * 0.12);

    // continuous idle rotation (time-based)
    const t = state.clock.getElapsedTime();
    group.current.rotation.x += 0.002 + 0.02 * Math.sin(t * 0.7) * 0.01;
    group.current.rotation.y += 0.0015 + 0.02 * Math.sin(t * 0.5) * 0.01;
    group.current.rotation.z += 0.0012 + 0.015 * Math.cos(t * 0.6) * 0.01;

    // scale in
    group.current.scale.setScalar(0.0001 + eased);

    // fade in materials if they support opacity
    if (gltf && gltf.scene) {
      gltf.scene.traverse((c) => {
        if (c.isMesh && c.material && "opacity" in c.material) {
          c.material.opacity = clamp(eased);
          c.material.transparent = c.material.opacity < 1;
        }
      });
    }
  });

  if (!gltf || !gltf.scene) return null;
  return (
    <group ref={group}>
      <primitive object={gltf.scene} scale={scale} position={[0, 0, 0]} />
    </group>
  );
}

/* ---------- LabelsFollower (commented out per request) ---------- */
// function LabelsFollower(...) { /* tags commented out */ }

/* ---------- App (main) ---------- */
export default function App() {
  // fonts: Microgramma and Inconsolata pre-registered earlier — keep Microgramma as local.
  useEffect(() => {
    // Inconsolata still in head for code if you want
    const id1 = "__npr_google_inconsolata";
    if (!document.getElementById(id1)) {
      const l = document.createElement("link");
      l.id = id1;
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap"; // fallback
      document.head.appendChild(l);
    }
    // also load Roboto for earlier requests (not necessary if you removed)
    // keep Microgramma local via @font-face below (user had it locally)
  }, []);

  // refs & state
  const logoWrapRef = useRef(null);
  const scrollRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);

  // loading states
  const totalAssets = 4; // 3 images + 1 glb
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const [gltf, setGltf] = useState(null);

  // timeline (animation) state -- scroll triggers in header area will animate this
  const timelineProgressRef = useRef(0);
  const timelineTargetRef = useRef(0);
  const animatingRef = useRef(false);
  const [labelsVisible, setLabelsVisible] = useState(false);

  const modelRef = useRef(null);
  const anchorsRef = useRef([]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // -------------------------
  // Preload images + GLB and track progress (simple counter)
  // -------------------------
  useEffect(() => {
    let cancelled = false;

    const inc = () => setLoadedCount((n) => {
      const next = n + 1;
      setLoadingPercent(Math.round((next / totalAssets) * 100));
      if (next >= totalAssets && !cancelled) {
        // small delay so user sees 100%
        setTimeout(() => setIsLoaded(true), 250);
      }
      return next;
    });

    // load images
    const imagePaths = ["/images/team1.jpg", "/images/team2.jpg", "/images/team3.jpg"];
    imagePaths.forEach((src) => {
      const img = new Image();
      img.onload = () => inc();
      img.onerror = () => inc();
      img.src = src;
    });

    // load GLB
    const loader = new GLTFLoader();
    loader.load(
      "/models/F1.glb",
      (g) => {
        // ensure textures encoding
        try {
          g.scene.traverse((c) => {
            if (c.isMesh && c.material) {
              const m = c.material;
              if (m.map) {
                m.map.encoding = THREE.sRGBEncoding;
                m.map.needsUpdate = true;
              }
              if (m.emissiveMap) {
                m.emissiveMap.encoding = THREE.sRGBEncoding;
                m.emissiveMap.needsUpdate = true;
              }
              if (!("metalness" in m)) m.metalness = 0.05;
              if (!("roughness" in m)) m.roughness = 0.6;
              m.needsUpdate = true;
            }
          });
        } catch (err) {
          // ignore
        }
        setGltf(g);
        inc();
      },
      // progress callback
      undefined,
      () => {
        // on error, still increment so page doesn't hang
        inc();
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  // lock page body scrolling and use our scroll container; hide native scrollbar
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow || "";
      document.body.style.overflow = prevBodyOverflow || "";
    };
  }, []);

  // when model loads, compute anchors (same semantic points as before)
  const handleModelLoaded = (loadedScene) => {
    modelRef.current = loadedScene;
    try {
      const bbox = new THREE.Box3().setFromObject(loadedScene);
      const size = bbox.getSize(new THREE.Vector3());
      const min = bbox.min;
      const max = bbox.max;
      const center = bbox.getCenter(new THREE.Vector3());

      const anchorsWorld = [];
      anchorsWorld.push(new THREE.Vector3(center.x, max.y - size.y * 0.06, max.z - size.z * 0.06)); // helmet
      anchorsWorld.push(new THREE.Vector3(center.x, center.y, max.z)); // front
      anchorsWorld.push(new THREE.Vector3(center.x, center.y, min.z)); // back
      anchorsWorld.push(new THREE.Vector3(max.x - size.x * 0.03, min.y + size.y * 0.06, min.z + size.z * 0.08)); // wheel

      anchorsRef.current = anchorsWorld.map((w) => loadedScene.worldToLocal(w.clone()));
    } catch (err) {
      // ignore if something odd
      anchorsRef.current = [];
    }
  };

  // timeline animation tween (for initial appear triggered by wheel in top area)
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

  // timeline -> logo transform RAF (combines translate+scale so no jumps)
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = clamp(timelineProgressRef.current);
      const eased = easeInOutCubic(p);
      const wrap = logoWrapRef.current;
      if (wrap) {
        const startSize = isMobile ? 260 : 520;
        const endSize = isMobile ? 56 * 2 : 90;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const finalLeft = window.innerWidth / 2;
        const finalTop = 100;
        const dx = finalLeft - centerX;
        const dy = finalTop - centerY;
        const scale = (startSize + (endSize - startSize) * eased) / startSize;
        wrap.style.transform = `translate(-50%,-50%) translate(${dx * eased}px, ${dy * eased}px) scale(${scale})`;
        wrap.style.transformOrigin = "center top";
        wrap.style.opacity = "1";
        if (isMobile && eased > 0.999) wrap.style.padding = "0";
        else wrap.style.padding = "";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isMobile]);

  // scroll handling & smooth inertia for our scroll container
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;

    // stateful variables for inertia
    let raf = null;
    let velocity = 0;
    let target = sc.scrollTop;
    let isPointerDown = false;
    let lastTouchY = null;

    // sensitivity & damping tuned for gentler start + inertia
    const sensitivity = 0.6; // how much wheel changes velocity
    const damping = 0.92; // per-frame damping (0..1) - closer to 1 = longer glide
    const minVelocity = 0.02;

    const animate = () => {
      // update position
      target += velocity;
      // clamp
      if (target < 0) {
        target = 0;
        velocity = 0;
      }
      const maxScroll = sc.scrollHeight - sc.clientHeight;
      if (target > maxScroll) {
        target = maxScroll;
        velocity = 0;
      }
      // lerp to target position for smoothness
      const cur = sc.scrollTop;
      const next = cur + (target - cur) * 0.14;
      sc.scrollTop = next;

      // apply damping
      velocity *= damping;

      // stop when velocity tiny
      if (Math.abs(velocity) < minVelocity) velocity = 0;

      raf = requestAnimationFrame(animate);
    };

    // wheel handler: when container is locked we still allow timeline triggers if at top
    const onWheel = (e) => {
      // if animation not finished (locked), allow wheel to trigger animation when at top
      const locked = timelineProgressRef.current < 0.999;
      if (locked && sc.scrollTop <= 100) {
        if (e.deltaY > 0) animateTimelineTo(1, 700);
        else if (e.deltaY < 0) animateTimelineTo(0, 700);
        return;
      }

      // if unlocked, consume wheel and apply inertial velocity
      if (sc.style.overflowY === "auto") {
        e.preventDefault();
        // push velocity (note sign)
        velocity += e.deltaY * sensitivity;
        if (!raf) raf = requestAnimationFrame(animate);
      }
    };

    // touch start/move for mobile inertial
    const onTouchStart = (ev) => {
      const locked = timelineProgressRef.current < 0.999;
      if (locked && sc.scrollTop <= 100) {
        lastTouchY = ev.touches ? ev.touches[0].clientY : null;
        return;
      }
      isPointerDown = true;
      lastTouchY = ev.touches ? ev.touches[0].clientY : null;
      velocity = 0;
      if (raf === null) raf = requestAnimationFrame(animate);
    };
    const onTouchMove = (ev) => {
      if (lastTouchY == null) return;
      const y = ev.touches ? ev.touches[0].clientY : null;
      if (y == null) return;
      const dy = lastTouchY - y;
      lastTouchY = y;
      // treat as wheel
      velocity += dy * 1.0;
    };
    const onTouchEnd = () => {
      isPointerDown = false;
      lastTouchY = null;
    };

    sc.addEventListener("wheel", onWheel, { passive: false });
    sc.addEventListener("touchstart", onTouchStart, { passive: true });
    sc.addEventListener("touchmove", onTouchMove, { passive: true });
    sc.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      sc.removeEventListener("wheel", onWheel);
      sc.removeEventListener("touchstart", onTouchStart);
      sc.removeEventListener("touchmove", onTouchMove);
      sc.removeEventListener("touchend", onTouchEnd);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // enable internal scroll only when animation finished (same logic as earlier)
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const sc = scrollRef.current;
      if (sc) {
        const p = timelineProgressRef.current;
        if (p >= 0.999 && isLoaded) {
          sc.style.overflowY = "auto";
        } else {
          sc.style.overflowY = "hidden";
          if (sc.scrollTop !== 0) sc.scrollTop = 0;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isLoaded]);

  // scroll triggers in top area to control timeline (also allow touch)
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const onWheelTop = (e) => {
      // only when container is at top and animation not finished
      if (sc.scrollTop <= 100 && timelineProgressRef.current < 0.999) {
        if (e.deltaY > 0) animateTimelineTo(1, 700);
        else if (e.deltaY < 0) animateTimelineTo(0, 700);
      }
    };
    sc.addEventListener("wheel", onWheelTop, { passive: true });
    let touchStartY = null;
    const onTouchStart = (ev) => {
      if (sc.scrollTop <= 100 && timelineProgressRef.current < 0.999) touchStartY = ev.touches ? ev.touches[0].clientY : null;
      else touchStartY = null;
    };
    const onTouchMoveTop = (ev) => {
      if (touchStartY == null) return;
      const y = ev.touches ? ev.touches[0].clientY : null;
      if (!y) return;
      const dy = touchStartY - y;
      if (Math.abs(dy) > 8) {
        if (dy > 0) animateTimelineTo(1, 700);
        else animateTimelineTo(0, 700);
        touchStartY = null;
      }
    };
    sc.addEventListener("touchstart", onTouchStart, { passive: true });
    sc.addEventListener("touchmove", onTouchMoveTop, { passive: true });

    return () => {
      sc.removeEventListener("wheel", onWheelTop);
      sc.removeEventListener("touchstart", onTouchStart);
      sc.removeEventListener("touchmove", onTouchMoveTop);
    };
  }, []);

  // hide page scrollbar via CSS and ensure background color consistent
  useEffect(() => {
    document.body.style.background = "#191919";
  }, []);

  /* ---------- UI & JSX ---------- */
  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#191919", position: "relative", color: "#fff" }}>
      {/* fonts */}
      <style>{`
        @font-face {
          font-family: 'Microgramma';
          src: url('/fonts/microgramma.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        /* hide native scrollbars as much as possible */
        ::-webkit-scrollbar { width: 0; height: 0; }
        html, body, #root { height: 100%; background: #191919; }
      `}</style>

      {/* Loading overlay (blocks everything until isLoaded true) */}
      {!isLoaded && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#0f0f0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#fff",
            fontFamily: "Inconsolata, sans-serif",
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 12 }}>Loading — {loadingPercent}%</div>
          <div style={{ width: "60%", height: 6, background: "#222", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ width: `${loadingPercent}%`, height: "100%", background: "#ffcc00", transition: "width 200ms linear" }} />
          </div>
        </div>
      )}

      {/* The scroll container (internal) - locked until animation done */}
      <div
        ref={scrollRef}
        className="scroll-container"
        style={{
          height: "100vh",
          overflowY: "hidden", // starts locked; JS will flip to auto when ready
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* HERO: sticky area with canvas and centered logo */}
        <section style={{ height: "100vh", position: "relative" }}>
          <div style={{ position: "relative", height: "100%", width: "100%" }}>
            {/* CENTERED LOGO — stays visible and tucks to top-center (combined transform/scale applied) */}
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

            {/* Canvas in normal flow so it will scroll with content when unlocked */}
            <div style={{ position: "relative", width: "100%", height: "100vh", zIndex: 40, pointerEvents: "none" }}>
              <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ position: [0, 0, isMobile ? 120000 : 220000], fov: 7, near: 10000, far: 800000 }}
                style={{ width: "100%", height: "100%" }}
                onCreated={({ gl, scene }) => {
                  gl.shadowMap.enabled = true;
                  gl.shadowMap.type = THREE.PCFSoftShadowMap;
                  if (gl.outputColorSpace !== undefined && THREE.SRGBColorSpace) {
                    try {
                      gl.outputColorSpace = THREE.SRGBColorSpace;
                    } catch (err) {}
                  } else if (gl.outputEncoding !== undefined) {
                    gl.outputEncoding = THREE.sRGBEncoding;
                  }
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
                      gltf={gltf}
                      onModelLoaded={handleModelLoaded}
                      progressRef={timelineProgressRef}
                      isMobile={isMobile}
                      scale={isMobile ? 300000 : 600000}
                    />
                  </Center>

                  <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.45} far={10} />
                </Suspense>

                {/* Labels / Tags are commented out as requested */}
                {/* <LabelsFollower ... /> */}

                <EffectComposer multisampling={4}>
                  <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
                </EffectComposer>
              </Canvas>
            </div>
          </div>
        </section>

        {/* AFTER the rotating model canvas: the real page content (Team, Join Us, Schedule, Contact) */}
        <main style={{ position: "relative", zIndex: 70, pointerEvents: "auto", background: "#191919", paddingBottom: 64 }}>
          <section
            style={{
              padding: isMobile ? "20px 12px" : "40px 80px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <h1 style={{ fontFamily: "Microgramma, Inconsolata, monospace", color: "#ffcc00", margin: 0 }}>Team</h1>

            {/* zig-zag paragraphs */}
            <div style={{ marginTop: 12 }}>
              <p style={{ fontFamily: "Zalando, system-ui, sans-serif", color: "#e6e6e6", maxWidth: 820 }}>
                <span style={{ display: "inline-block", transform: "translateX(0)" }}>
                  We are a small but fierce team building racing experiences for the web.
                </span>
              </p>
              <p style={{ fontFamily: "Zalando, system-ui, sans-serif", color: "#e6e6e6", maxWidth: 820, marginLeft: isMobile ? 0 : 40 }}>
                <span style={{ display: "inline-block", transform: "translateX(20px)" }}>
                  Our backgrounds cross engineering, design, and motorsport. We ship daily.
                </span>
              </p>
            </div>

            {/* images: horizontally on desktop, stacked on mobile, always fit */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 16,
                flexDirection: isMobile ? "column" : "row",
                alignItems: "stretch",
              }}
            >
              <img
                src="/images/team1.jpg"
                alt="team1"
                style={{
                  width: isMobile ? "100%" : 320,
                  height: isMobile ? "48vh" : 180,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
              <img
                src="/images/team2.jpg"
                alt="team2"
                style={{
                  width: isMobile ? "100%" : 320,
                  height: isMobile ? "48vh" : 180,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
              <img
                src="/images/team3.jpg"
                alt="team3"
                style={{
                  width: isMobile ? "100%" : 320,
                  height: isMobile ? "48vh" : 180,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
            </div>
          </section>

          <section style={{ padding: isMobile ? "20px 12px" : "40px 80px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <h1 style={{ fontFamily: "Microgramma, Inconsolata, monospace", color: "#ffcc00", margin: 0 }}>Join Us</h1>
            <p style={{ fontFamily: "Zalando, system-ui, sans-serif", color: "#e6e6e6" }}>
              <span style={{ display: "inline-block", transform: isMobile ? "translateX(0)" : "translateX(-6px)" }}>
                We're hiring drivers, devs and dreamers. Become part of the crew.
              </span>
            </p>
          </section>

          <section style={{ padding: isMobile ? "20px 12px" : "40px 80px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <h1 style={{ fontFamily: "Microgramma, Inconsolata, monospace", color: "#ffcc00", margin: 0 }}>Schedule</h1>
            <p style={{ fontFamily: "Zalando, system-ui, sans-serif", color: "#e6e6e6" }}>
              <span style={{ display: "inline-block", transform: isMobile ? "translateX(0)" : "translateX(6px)" }}>
                See upcoming track days, livestreams and community events right here.
              </span>
            </p>
          </section>

          <section style={{ padding: isMobile ? "20px 12px" : "40px 80px" }}>
            <h1 style={{ fontFamily: "Microgramma, Inconsolata, monospace", color: "#ffcc00", margin: 0 }}>Contact</h1>
            <p style={{ fontFamily: "Zalando, system-ui, sans-serif", color: "#e6e6e6" }}>
              <span style={{ display: "inline-block", transform: isMobile ? "translateX(0)" : "translateX(-6px)" }}>
                Get in touch about partnerships, media, and racing.
              </span>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
