// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* -----------------------------
   Utilities
   ----------------------------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* -----------------------------
   Labels (match the reference layout)
   ----------------------------- */
const RIGHT_TAGS = ["waapi", "timeline", "stagger", "svg", "spring", "animation"];
const LEFT_TAGS = ["timer", "easings", "draggable", "scroll", "scope"];

/* -----------------------------
   NP Logo (unchanged paths)
   ----------------------------- */
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

/* -----------------------------
   3D model appears from center (scroll-based over full range)
   ----------------------------- */
function InteractiveModel({ onModelLoaded, progress, scale = 600000, isMobile }) {
  const obj = useLoader(OBJLoader, "/models/F1.obj");
  const group = useRef();

  useEffect(() => {
    if (!obj) return;
    obj.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material) c.material.transparent = true;
      }
    });
    onModelLoaded && onModelLoaded(obj);
  }, [obj, onModelLoaded]);

  useFrame(() => {
    if (!group.current) return;

    // Whole animation plays across the entire scroll [0..1]
    const p = easeInOutCubic(clamp(progress));

    // Scale up from 0 and move from deep Z toward camera
    const fromZ = isMobile ? 280000 : 420000;
    group.current.position.set(0, (1 - p) * (isMobile ? 2.5 : 4), -fromZ * (1 - p));
    group.current.rotation.y = (1 - p) * 0.45;
    group.current.scale.setScalar(0.0001 + p);

    if (obj) {
      obj.traverse((c) => {
        if (c.isMesh && c.material) c.material.opacity = clamp(p);
      });
    }
  });

  return (
    <group ref={group}>
      <primitive object={obj} scale={scale} position={[0, 0, 0]} />
    </group>
  );
}

/* -----------------------------
   Edge labels + connectors (now white, 20px)
   ----------------------------- */
function LabelsFollower({
  modelObjRef,
  anchorsRef,
  labelDomRefs,
  lineRefs,
  alpha = 1,
  rightCount,
}) {
  const { camera, size } = useThree();
  const tmp = useRef(new THREE.Vector3());

  useFrame(() => {
    const model = modelObjRef.current;
    const anchors = anchorsRef.current;
    if (!model || !anchors || !anchors.length) return;

    const edgePadding = 20;
    const linePadToText = 14;
    const a = clamp(alpha);

    for (let i = 0; i < anchors.length; i++) {
      const isRight = i < rightCount;
      const labelEl = labelDomRefs.current[i];
      const poly = lineRefs.current[i];
      if (!labelEl || !poly) continue;

      // Project anchor to screen
      tmp.current.copy(anchors[i]);
      model.localToWorld(tmp.current);
      tmp.current.project(camera);

      const ax = (tmp.current.x * 0.5 + 0.5) * size.width;
      const ay = (-tmp.current.y * 0.5 + 0.5) * size.height;

      // Label at edge
      const labelRect = labelEl.getBoundingClientRect();
      const left = isRight ? size.width - edgePadding - labelRect.width : edgePadding;
      const top = ay - labelRect.height / 2;

      labelEl.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      labelEl.style.opacity = tmp.current.z < 1 ? String(a) : "0";

      // Connector: anchor → elbow → horizontal to label
      const dx = isRight ? 120 : -120;
      const dy = isRight ? -60 : 60;
      const elbowX = ax + dx;
      const elbowY = ay + dy;
      const endX = isRight ? left - linePadToText : left + labelRect.width + linePadToText;
      const endY = elbowY;

      poly.setAttribute("points", `${ax},${ay} ${elbowX},${elbowY} ${endX},${endY}`);
      poly.setAttribute("opacity", tmp.current.z < 1 ? String(a) : "0");
    }
  });

  return null;
}

/* -----------------------------
   App: scroll-based timeline over the full hero
   - Logo starts perfectly centered
   - Entire animation scrubs with scroll 0→1
   - Lines + labels visible (white, 20px)
   - Scrollbars hidden but scrolling works
   ----------------------------- */
export default function App() {
  const heroRef = useRef(null);

  const heroLogoRef = useRef(null);
  const modelObjRef = useRef(null);
  const anchorsRef = useRef([]);

  const labelDomRefs = useRef([]);
  const lineRefs = useRef([]);

  const [isMobile, setIsMobile] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Scroll progress across the hero section
  useEffect(() => {
    const onScroll = () => {
      const el = heroRef.current;
      if (!el) return;
      const vh = window.innerHeight;
      const total = el.offsetHeight - vh; // scrollable distance within hero
      const y = clamp(window.scrollY, 0, total);
      const t = total > 0 ? y / total : 0;
      setProgress(clamp(t));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Logo transform based on full-range progress
  useEffect(() => {
    const el = heroLogoRef.current;
    if (!el) return;

    // Always start perfectly centered
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.top = "50%";
    el.style.pointerEvents = "none";
    el.style.zIndex = "40";

    const startSize = isMobile ? 260 : 520;
    const endSize = isMobile ? 56 : 90;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const finalLeft = 16;
    const finalTop = 14;

    const dx = finalLeft - centerX;
    const dy = finalTop - centerY;

    const p = easeInOutCubic(clamp(progress));
    const size = startSize + (endSize - startSize) * p;
    const scale = size / startSize;

    // Keep the initial center translation permanently, then add the path offset
    el.style.transform = `translate(-50%, -50%) translate(${dx * p}px, ${dy * p}px) scale(${scale})`;
    el.style.transformOrigin = "center center";
  }, [progress, isMobile]);

  // SVG overlay + labels (white, 20px)
  useEffect(() => {
    labelDomRefs.current = [];
    lineRefs.current = [];

    const old = document.getElementById("__npr_svg_overlay_lines");
    if (old) old.remove();

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "__npr_svg_overlay_lines");
    svg.style.position = "fixed";
    svg.style.left = "0";
    svg.style.top = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "35"; // above canvas, below logo
    svg.style.overflow = "visible";
    document.body.appendChild(svg);

    const baseLabelCSS = {
      position: "fixed", // fixed so they follow the viewport
      left: "0px",
      top: "0px",
      transform: "translate3d(-9999px,-9999px,0)",
      pointerEvents: "none",
      opacity: "0",
      color: "#ffffff", // WHITE
      fontFamily:
        "'Inter', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
      fontWeight: 700,
      letterSpacing: "0.01em",
      textTransform: "lowercase",
      fontSize: "20px", // ~20 as requested
      lineHeight: "1",
      padding: "0",
      background: "transparent",
      border: "none",
      textShadow: "none",
      zIndex: 36,
    };

    const texts = [...RIGHT_TAGS, ...LEFT_TAGS];
    texts.forEach((text) => {
      const label = document.createElement("div");
      Object.assign(label.style, baseLabelCSS);
      label.textContent = text;
      document.body.appendChild(label);
      labelDomRefs.current.push(label);

      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      poly.setAttribute("fill", "none");
      poly.setAttribute("stroke", "#ffffff"); // WHITE lines
      poly.setAttribute("stroke-width", String(isMobile ? 1.5 : 2));
      poly.setAttribute("stroke-linecap", "round");
      poly.setAttribute("stroke-linejoin", "round");
      poly.setAttribute("opacity", "0");
      poly.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(poly);
      lineRefs.current.push(poly);
    });

    return () => {
      labelDomRefs.current.forEach((el) => el && el.remove());
      svg.remove();
    };
  }, [isMobile]);

  // Anchors on model (RIGHT first, then LEFT)
  const handleModelLoaded = (loadedObj) => {
    const bbox = new THREE.Box3().setFromObject(loadedObj);
    const size = bbox.getSize(new THREE.Vector3());
    const min = bbox.min;
    const max = bbox.max;

    const anchors = [];

    // RIGHT (upper spread)
    for (let i = 0; i < RIGHT_TAGS.length; i++) {
      const t = (i + 1) / (RIGHT_TAGS.length + 1);
      const x = max.x - size.x * 0.02;
      const y = max.y - t * size.y;
      const z = min.z + 0.45 * size.z;
      anchors.push(new THREE.Vector3(x, y, z));
    }

    // LEFT (lower spread)
    for (let i = 0; i < LEFT_TAGS.length; i++) {
      const t = (i + 1) / (LEFT_TAGS.length + 1);
      const x = min.x + size.x * 0.02;
      const y = min.y + t * size.y * 0.85;
      const z = min.z + 0.55 * size.z;
      anchors.push(new THREE.Vector3(x, y, z));
    }

    anchorsRef.current = anchors;
    modelObjRef.current = loadedObj;
  };

  // Hide scrollbars but keep page scrollable
  const heroHeightVh = 220;

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#191919", position: "relative" }}>
      <style>{`
        html, body, #root { height: 100%; background: #191919; }
        body { margin: 0; overflow-y: scroll; overscroll-behavior-y: none; }
        /* Hide scrollbars while keeping scrolling functional */
        body::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
        body { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* HERO section drives the scroll progress */}
      <section ref={heroRef} style={{ height: `${heroHeightVh}vh`, position: "relative" }}>
        {/* Sticky stack */}
        <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%" }}>
          {/* Site-level logo (centered at start; scrubs to top-left) */}
          <div
            ref={heroLogoRef}
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 40,
              pointerEvents: "none",
              willChange: "transform",
            }}
            aria-hidden
          >
            <NPLogo size={isMobile ? 260 : 520} />
          </div>

          {/* Canvas */}
          <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none" }}>
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
              <directionalLight intensity={1.8} position={[5, 10, 5]} />
              <Suspense fallback={null}>
                <Environment preset="city" background={false} />
                <Center>
                  <InteractiveModel
                    onModelLoaded={handleModelLoaded}
                    progress={progress} // full-range scroll
                    isMobile={isMobile}
                    scale={isMobile ? 300000 : 600000}
                  />
                </Center>
                <ContactShadows
                  rotation-x={-Math.PI / 2}
                  position={[0, -1, 0]}
                  width={20}
                  height={20}
                  blur={1}
                  opacity={0.45}
                  far={10}
                />
              </Suspense>

              {/* White edge labels + lines (visible across the range) */}
              <LabelsFollower
                modelObjRef={modelObjRef}
                anchorsRef={anchorsRef}
                labelDomRefs={labelDomRefs}
                lineRefs={lineRefs}
                alpha={Math.max(0, Math.min(1, (progress - 0.2) / 0.2))} // fade in around 20% scroll
                rightCount={RIGHT_TAGS.length}
              />

              <EffectComposer multisampling={4}>
                <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
              </EffectComposer>
            </Canvas>
          </div>
        </div>
      </section>

      {/* Minimal content after hero to allow scrolling beyond it (optional) */}
      <div style={{ height: "40vh" }} />
    </div>
  );
}
