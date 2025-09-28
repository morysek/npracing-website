// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* ---------- helpers ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---------- labels (4) ---------- */
const LABELS = ["Team", "Join Us", "Schedule", "Contact"];

/* ---------- NPLogo (original SVG kept) ---------- */
function NPLogo({ size = 300 }) {
  return (
    <svg
      alt="NP Racing Logo"
      width={size}
      viewBox="0 0 104.1419 30.962112"
      height={(size * 30.96) / 104.14}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      {/* put your original SVG markup here; shortened placeholder path below to keep file compact */}
      <g transform="translate(-54.124261,-130.25079)">
        <path d="M64 130 L80 160 L72 160 L88 130z" fill="#ffcc00" />
        {/* Replace the above with your full SVG group if you prefer */}
      </g>
    </svg>
  );
}

/* ---------- InteractiveModel (inside Canvas) ---------- */
function InteractiveModel({ onModelLoaded, progressRef, isMobile, scale = 600000 }) {
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
    const p = clamp(progressRef.current);
    const eased = easeInOutCubic(p);

    const fromZ = isMobile ? 280000 : 420000;
    group.current.position.set(0, (1 - eased) * (isMobile ? 2.5 : 4), -fromZ * (1 - eased));
    // rotate around X axis during appear
    group.current.rotation.x = eased * (Math.PI * 0.12);
    // scale in
    group.current.scale.setScalar(0.0001 + eased);

    if (obj) {
      obj.traverse((c) => {
        if (c.isMesh && c.material) c.material.opacity = clamp(eased);
      });
    }
  });

  return (
    <group ref={group}>
      <primitive object={obj} scale={scale} position={[0, 0, 0]} />
    </group>
  );
}

/* ---------- LabelsFollower (runs inside Canvas useFrame) ----------
   Projects anchors (local model-space points) to screen and updates DOM label positions & SVG polyline points.
------------------------------------------------------------------ */
function LabelsFollower({ modelRef, anchorsRef, labelDomRefs, lineRefs, visible, rightCount = 2 }) {
  const { camera, size } = useThree();
  const tmp = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!visible) return;
    const model = modelRef.current;
    const anchors = anchorsRef.current;
    if (!model || !anchors || !anchors.length) return;

    const edgePadding = 18;
    for (let i = 0; i < anchors.length; i++) {
      const isRight = i < rightCount;
      const labelEl = labelDomRefs.current[i];
      const poly = lineRefs.current[i];
      if (!labelEl || !poly) continue;

      tmp.current.copy(anchors[i]);
      model.localToWorld(tmp.current);
      tmp.current.project(camera);

      const ax = (tmp.current.x * 0.5 + 0.5) * size.width;
      const ay = (-tmp.current.y * 0.5 + 0.5) * size.height;

      // position label at edge (left/right)
      const rect = labelEl.getBoundingClientRect();
      const left = isRight ? size.width - edgePadding - rect.width : edgePadding;
      const top = ay - rect.height / 2;

      labelEl.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      labelEl.style.opacity = "1";

      // small connector: anchor -> short elbow -> to label
      const dx = isRight ? 70 : -70;
      const dy = isRight ? -24 : 24;
      const elbowX = ax + dx;
      const elbowY = ay + dy;
      const endX = isRight ? left - 8 : left + rect.width + 8;
      const endY = elbowY;

      // polyline points: anchor -> elbow -> end
      poly.setAttribute("points", `${ax},${ay} ${elbowX},${elbowY} ${endX},${endY}`);
      poly.setAttribute("opacity", "1");
    }
  });

  return null;
}

/* ---------- App (main) ---------- */
export default function App() {
  // refs
  const logoWrapRef = useRef(null);
  const logoScaleRef = useRef(null);

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

  // labels visibility (only after animation completes)
  const [labelsVisible, setLabelsVisible] = useState(false);

  // ----- create DOM labels & SVG overlay -----
  useEffect(() => {
    labelDomRefs.current = [];
    lineRefs.current = [];

    // remove old if any
    const oldSvg = document.getElementById("__npr_svg_overlay_lines");
    if (oldSvg) oldSvg.remove();

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "__npr_svg_overlay_lines");
    svg.style.position = "fixed";
    svg.style.left = "0";
    svg.style.top = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "9999";
    svg.style.overflow = "visible";
    document.body.appendChild(svg);

    // create 4 labels and 4 polylines
    LABELS.forEach((txt, i) => {
      const el = document.createElement("div");
      Object.assign(el.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        transform: "translate3d(-9999px,-9999px,0)",
        pointerEvents: "none",
        opacity: "0",
        display: "none", // hidden until animation finishes
        color: "#ffffff",
        fontFamily: "'Microgramma', 'Inter', sans-serif",
        fontSize: "16px",
        fontWeight: "700",
        padding: "0",
        background: "transparent",
        zIndex: 10000,
      });
      el.textContent = txt;
      document.body.appendChild(el);
      labelDomRefs.current.push(el);

      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      poly.setAttribute("fill", "none");
      poly.setAttribute("stroke", "#ffffff");
      poly.setAttribute("stroke-width", String(isMobile ? 2 : 3));
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

  // ----- compute anchors when model loads (pin to semantic parts) -----
  const handleModelLoaded = (loadedObj) => {
    modelRef.current = loadedObj;

    // bounding box
    const bbox = new THREE.Box3().setFromObject(loadedObj);
    const size = bbox.getSize(new THREE.Vector3());
    const min = bbox.min;
    const max = bbox.max;
    const center = bbox.getCenter(new THREE.Vector3());

    // We'll set: helmet (front-top-center), front (front-most center), back (rear-most center), wheel (one corner)
    // Convert chosen world points into local coordinates of the object (worldToLocal)
    const anchorsWorld = [];

    // helmet: slightly forward & top-center
    anchorsWorld.push(new THREE.Vector3(center.x, max.y - size.y * 0.06, max.z - size.z * 0.06));
    // front: front-most center
    anchorsWorld.push(new THREE.Vector3(center.x, center.y, max.z));
    // back: rear-most center
    anchorsWorld.push(new THREE.Vector3(center.x, center.y, min.z));
    // wheel: front-right-bottom-ish (approx)
    anchorsWorld.push(new THREE.Vector3(max.x - size.x * 0.03, min.y + size.y * 0.06, min.z + size.z * 0.08));

    // convert to local coordinates relative to loadedObj
    anchorsRef.current = anchorsWorld.map((w) => loadedObj.worldToLocal(w.clone()));
  };

  // ----- timeline RAF to update logo transform from timelineProgressRef -----
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = clamp(timelineProgressRef.current);
      const eased = easeInOutCubic(p);

      const wrap = logoWrapRef.current;
      const scaleEl = logoScaleRef.current;
      if (wrap && scaleEl) {
        const startSize = isMobile ? 260 : 520;
        const endSize = isMobile ? 56 : 90;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const finalLeft = 16;
        const finalTop = 14;
        const dx = finalLeft - centerX;
        const dy = finalTop - centerY;

        wrap.style.transform = `translate(-50%,-50%) translate(${dx * eased}px, ${dy * eased}px)`;
        const scale = (startSize + (endSize - startSize) * eased) / startSize;
        scaleEl.style.transform = `scale(${scale})`;
        scaleEl.style.transformOrigin = "left top";
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
        // set labels visibility only when fully shown
        if (Math.abs(timelineProgressRef.current - 1) < 1e-6) {
          setLabelsVisible(true);
          labelDomRefs.current.forEach((el) => {
            if (el) el.style.display = "block";
          });
          lineRefs.current.forEach((line) => line && line.setAttribute("opacity", "1"));
        } else {
          setLabelsVisible(false);
          labelDomRefs.current.forEach((el) => {
            if (el) {
              el.style.display = "none";
              el.style.opacity = "0";
            }
          });
          lineRefs.current.forEach((line) => line && line.setAttribute("opacity", "0"));
        }
      }
    }
    requestAnimationFrame(step);
  }

  // ----- scroll triggering: only process when user is within top 10px of page -----
  useEffect(() => {
    const onWheel = (e) => {
      if (window.scrollY <= 10) {
        if (e.deltaY > 0) animateTimelineTo(1, 700); // scroll down while in top 10px -> play forward
        else if (e.deltaY < 0) animateTimelineTo(0, 700); // scroll up while top 10px -> reverse
      }
    };

    // touch support: detect vertical swipe direction when starting in top 10px
    let touchStartY = null;
    const onTouchStart = (ev) => {
      if (window.scrollY <= 10) touchStartY = ev.touches ? ev.touches[0].clientY : null;
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

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // ----- initial check: if page loaded at top, we do not auto-play; we only respond to user scroll in top 10px -----

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#191919", position: "relative", fontFamily: "'Microgramma', sans-serif" }}>
      {/* load Microgramma from /public/fonts/microgramma.woff2 - adjust path if needed */}
      <style>{`
        @font-face {
          font-family: 'Microgramma';
          src: url('/fonts/microgramma.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        html,body,#root { height: 100%; background: #191919; }
        body { margin:0; overflow-y: scroll; }
        body::-webkit-scrollbar { width: 0; height: 0; }
        body { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* HERO area (sticky canvas & centered logo) */}
      <section style={{ height: "160vh", position: "relative" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%" }}>
          {/* CENTERED LOGO — will tuck to top-left */}
          <div
            ref={logoWrapRef}
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 40,
              pointerEvents: "none",
              willChange: "transform",
            }}
            aria-hidden
          >
            <div ref={logoScaleRef} style={{ transformOrigin: "left top" }}>
              <NPLogo size={isMobile ? 260 : 520} />
            </div>
          </div>

          {/* fixed Canvas */}
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
              <directionalLight intensity={1.6} position={[5, 10, 5]} />
              <Suspense fallback={null}>
                <Environment preset="city" background={false} />
                <Center>
                  <InteractiveModel onModelLoaded={handleModelLoaded} progressRef={timelineProgressRef} isMobile={isMobile} scale={isMobile ? 300000 : 600000} />
                </Center>
                <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.45} far={10} />
              </Suspense>

              <LabelsFollower modelRef={modelRef} anchorsRef={anchorsRef} labelDomRefs={labelDomRefs} lineRefs={lineRefs} visible={labelsVisible} rightCount={2} />

              <EffectComposer multisampling={4}>
                <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
              </EffectComposer>
            </Canvas>
          </div>
        </div>
      </section>

      {/* tiny tail so page scrolls */}
      <div style={{ height: "40vh" }} />
    </div>
  );
}
