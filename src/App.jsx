// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* ------------------------
   Small reusable NP logo
   (paste your full SVG if preferred)
   ------------------------ */
function NPLogo({ size = 300 }) {
  return (
    <svg
      width={size}
      viewBox="0 0 104.1419 30.962112"
      height={(size * 30.96) / 104.14}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      {/* keep your original SVG paths here; simplified yellow mark for clarity */}
      <path style={{ fill: "#ffcc00" }} d="M10 10h84v10H10z" />
    </svg>
  );
}

/* ------------------------
   InteractiveModel (R3F, inside Canvas)
   - loads OBJ via useLoader (must be inside Canvas tree)
   - calls onModelLoaded(loadedObject) so parent can compute anchors
   ------------------------ */
function InteractiveModel({ onModelLoaded, scale = 600000 }) {
  const obj = useLoader(OBJLoader, "/models/F1.obj");

  useEffect(() => {
    if (!obj) return;
    // basic mesh cleanup
    obj.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
    onModelLoaded && onModelLoaded(obj);
  }, [obj, onModelLoaded]);

  return <primitive object={obj} scale={scale} position={[0, 0, 0]} />;
}

/* ------------------------
   LabelsFollower (inside Canvas)
   - projects local-space anchor points to screen and writes coordinates
   - writes to two shared refs: labelDomRefs and lineRefs
   ------------------------ */
function LabelsFollower({ modelObjRef, anchorsRef, labelDomRefs, lineRefs }) {
  const { camera, size } = useThree();
  const tmp = useRef(new THREE.Vector3());

  useFrame(() => {
    const model = modelObjRef.current;
    if (!model || !anchorsRef.current || !anchorsRef.current.length) return;

    anchorsRef.current.forEach((localV, i) => {
      tmp.current.copy(localV);
      model.localToWorld(tmp.current); // local -> world
      tmp.current.project(camera); // world -> NDC

      // screen coords
      const x = (tmp.current.x * 0.5 + 0.5) * size.width;
      const y = (-tmp.current.y * 0.5 + 0.5) * size.height;

      const labelEl = labelDomRefs.current[i];
      const lineEl = lineRefs.current[i];

      // Update DOM label position
      if (labelEl) {
        labelEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        // If behind camera, hide
        labelEl.style.opacity = tmp.current.z < 1 ? "1" : "0";
      }

      // Update connecting SVG line: line from label center to anchor point
      if (lineEl && labelEl) {
        // label center
        const rect = labelEl.getBoundingClientRect();
        const lx = rect.left + rect.width / 2;
        const ly = rect.top + rect.height / 2;
        // set line endpoints
        lineEl.setAttribute("x1", String(lx));
        lineEl.setAttribute("y1", String(ly));
        lineEl.setAttribute("x2", String(x));
        lineEl.setAttribute("y2", String(y));
        lineEl.setAttribute("opacity", tmp.current.z < 1 ? "1" : "0");
      }
    });
  });

  return null;
}

/* ------------------------
   Main App
   ------------------------ */
export default function App() {
  // refs
  const heroLogoRef = useRef(null);
  const centerScrollRef = useRef(null);
  const modelObjRef = useRef(null); // reference to loaded Object3D inside Canvas
  const anchorsRef = useRef([]); // Array<THREE.Vector3> local-space anchors
  const labelDomRefs = useRef([]); // DOM refs for 4 labels
  const lineRefs = useRef([]); // SVG <line> refs for 4 connecting lines

  // state
  const [animationPlayed, setAnimationPlayed] = useState(false); // whether full animation has run
  const [revealModel, setRevealModel] = useState(false); // show canvas / model
  const [isMobile, setIsMobile] = useState(false);

  // responsive
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // create and attach DOM label elements + svg lines
  useEffect(() => {
    // create 4 labels and 4 svg lines
    labelDomRefs.current = [];
    lineRefs.current = [];

    // svg overlay container for lines
    let svg = document.getElementById("__npr_svg_overlay_lines");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("id", "__npr_svg_overlay_lines");
      svg.style.position = "fixed";
      svg.style.left = "0";
      svg.style.top = "0";
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.pointerEvents = "none";
      svg.style.zIndex = "9999";
      document.body.appendChild(svg);
    }

    for (let i = 0; i < 4; i++) {
      const label = document.createElement("div");
      label.style.position = "absolute";
      label.style.left = "0px";
      label.style.top = "0px";
      label.style.transform = "translate3d(-9999px,-9999px,0)";
      label.style.pointerEvents = "none";
      label.style.opacity = "0";
      label.style.transition = "opacity 120ms linear, transform 40ms linear";
      label.style.background = "rgba(0,0,0,0.6)";
      label.style.padding = "6px 10px";
      label.style.borderRadius = "8px";
      label.style.border = "1px solid rgba(255,204,0,0.12)";
      label.style.fontFamily = "'Zalando Sans Expanded', sans-serif";
      label.style.color = "#ffcc00";
      label.style.fontWeight = "700";
      label.style.fontSize = isMobile ? "12px" : "14px";
      label.innerText = ["Team", "Schedule", "Contact", "Join Us"][i];
      document.body.appendChild(label);
      labelDomRefs.current.push(label);

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("stroke", "#ffcc00");
      line.setAttribute("stroke-width", String(isMobile ? 1.2 : 2));
      line.setAttribute("stroke-linecap", "round");
      line.setAttribute("opacity", "0");
      svg.appendChild(line);
      lineRefs.current.push(line);
    }

    return () => {
      // cleanup DOM elements on unmount
      labelDomRefs.current.forEach((el) => el && el.remove());
      if (svg && svg.parentNode) svg.parentNode.removeChild(svg);
    };
  }, [isMobile]);

  // compute random anchors once model loads
  const handleModelLoaded = (loadedObj) => {
    modelObjRef.current = loadedObj;
    // compute bounding box in model local space
    const bbox = new THREE.Box3().setFromObject(loadedObj);
    const size = bbox.getSize(new THREE.Vector3());
    const min = bbox.min;
    // create 4 anchors inside bbox (local space)
    const pts = [];
    for (let i = 0; i < 4; i++) {
      const rx = min.x + Math.random() * size.x;
      const ry = min.y + Math.random() * size.y;
      const rz = min.z + Math.random() * size.z;
      // convert world->local to ensure anchor is local to object: the loader gives object in world coords,
      // so transform world point to local space of the loaded object
      const worldPoint = new THREE.Vector3(rx, ry, rz);
      const local = loadedObj.worldToLocal(worldPoint.clone());
      pts.push(local);
    }
    anchorsRef.current = pts;
  };

  // detect first meaningful scroll and play the full animation once
  useEffect(() => {
    if (animationPlayed) return;

    let played = false;
    const onFirstScroll = (e) => {
      if (played) return;
      played = true;
      window.removeEventListener("wheel", onFirstScroll, { passive: true });
      window.removeEventListener("touchstart", onFirstScroll, { passive: true });
      window.removeEventListener("keydown", onFirstScroll);
      // run full animation
      playFullLogoAnimation().then(() => {
        setAnimationPlayed(true);
        setRevealModel(true); // reveal the model after animation fully completes
      });
    };

    window.addEventListener("wheel", onFirstScroll, { passive: true });
    window.addEventListener("touchstart", onFirstScroll, { passive: true });
    window.addEventListener("keydown", onFirstScroll);

    return () => {
      window.removeEventListener("wheel", onFirstScroll);
      window.removeEventListener("touchstart", onFirstScroll);
      window.removeEventListener("keydown", onFirstScroll);
    };
  }, [animationPlayed]);

  // helper: perform full animation of logo from center to top-left (returns Promise that resolves on finish)
  function playFullLogoAnimation(duration = 900) {
    const el = heroLogoRef.current;
    if (!el) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const start = performance.now();
      const startSize = isMobile ? 260 : 520;
      const endSize = isMobile ? 56 : 90;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const finalLeft = 16;
      const finalTop = 12;
      const dx = finalLeft - centerX;
      const dy = finalTop - centerY;

      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        // ease in-out (smooth)
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const size = startSize + (endSize - startSize) * eased;
        const scale = size / startSize;
        el.style.transform = `translate3d(${dx * eased}px, ${dy * eased}px, 0) scale(${scale})`;
        el.style.transformOrigin = "center left";

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          // finalize: position absolutely at top-left (avoid fractional transforms)
          el.style.transition = "none";
          el.style.left = `${finalLeft}px`;
          el.style.top = `${finalTop}px`;
          el.style.transform = `translate(0,0) scale(${endSize / startSize})`;
          el.style.transformOrigin = "center left";
          el.style.position = "fixed";
          resolve();
        }
      }

      requestAnimationFrame(step);
    });
  }

  // create a small scrollable spacer so user can scroll to trigger the animation
  const spacerHeight = typeof window !== "undefined" ? Math.max(window.innerHeight * 1.6, 1200) : 1200;

  /* ------------------------
     Render
     ------------------------ */
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#191919", overflow: "hidden", position: "relative" }}>
      <style>{`
        body { margin:0; background:#191919; }
        #center-scroll::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
        #center-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* fixed centered logo (will animate to absolute top-left on first full scroll-triggered animation) */}
      <div
        ref={heroLogoRef}
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate3d(-50%,-50%,0) scale(1)",
          zIndex: 40,
          pointerEvents: "none",
          willChange: "transform",
        }}
        aria-hidden
      >
        <NPLogo size={isMobile ? 260 : 520} />
      </div>

      {/* Canvas & model: only show after the full animation finishes */}
      {revealModel && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none" }}>
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 0, isMobile ? 100000 : 200000], fov: 7, near: 10000, far: 500000 }}
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
                <InteractiveModel onModelLoaded={handleModelLoaded} scale={isMobile ? 300000 : 600000} />
              </Center>
              <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.45} far={10} />
            </Suspense>

            {/* LabelsFollower must be inside the Canvas (uses useFrame & camera) */}
            <LabelsFollower modelObjRef={modelObjRef} anchorsRef={anchorsRef} labelDomRefs={labelDomRefs} lineRefs={lineRefs} />

            <EffectComposer multisampling={4}>
              <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
            </EffectComposer>
          </Canvas>
        </div>
      )}

      {/* SVG lines are added to the DOM in useEffect; labels too (so here we only keep the scroll spacer) */}
      <div
        id="center-scroll"
        ref={centerScrollRef}
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          transform: "translateX(-50%)",
          width: "min(900px, 92vw)",
          height: "100vh",
          overflowY: "auto",
          zIndex: 5,
        }}
      >
        <div style={{ height: spacerHeight }} />
      </div>
    </div>
  );
}
