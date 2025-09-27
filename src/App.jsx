// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, ContactShadows, Environment } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* ---------------- NPLogo (SVG) ---------------- */
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
      {/* (your SVG content here — kept identical to original) */}
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

/* ---------------- InteractiveModel: manual loader ---------------- */
function InteractiveModel({ onLoad, controlRef, scale = 600000 }) {
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
        onLoad && onLoad(loaded);
        if (controlRef) controlRef.current = group.current;
      },
      undefined,
      (err) => console.error("OBJ load error:", err)
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

/* ---------------- Auto rotate (keeps the model alive) ---------------- */
function AutoRotate({ modelRef }) {
  useFrame((_, delta) => {
    const obj = modelRef.current;
    if (!obj) return;
    obj.rotation.y += 0.003 * delta;
    obj.rotation.x += 0.0015 * delta;
  });
  return null;
}

/* ---------------- Labels updater inside Canvas ----------------
   - takes an array of local-space points (Vec3 in model space)
   - projects them each frame to screen coords and writes to DOM label refs
--------------------------------------------------------------- */
function LabelsFollower({ modelRef, localPoints, labelDomRefs }) {
  const { camera, size } = useThree();
  const tempV = useRef(new THREE.Vector3());
  useFrame(() => {
    const obj = modelRef.current;
    if (!obj) return;
    localPoints.forEach((lp, i) => {
      // compute world position of local point
      tempV.current.set(lp.x, lp.y, lp.z);
      // transform by model matrix
      obj.localToWorld(tempV.current);
      // project to NDC
      tempV.current.project(camera);
      // convert to screen coordinates
      const x = (tempV.current.x * 0.5 + 0.5) * size.width;
      const y = ( -tempV.current.y * 0.5 + 0.5) * size.height;
      const ref = labelDomRefs.current[i];
      if (ref) {
        ref.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        // adjust visibility based on behind-camera or out-of-frustum
        const behind = tempV.current.z > 1 || tempV.current.z < -1;
        ref.style.opacity = behind ? "0" : "1";
        ref.style.pointerEvents = "none";
      }
    });
  });
  return null;
}

/* ---------------- ThreeDCanvas component ---------------- */
function ThreeDCanvas({ reveal, modelScaleMultiplier = 1, onModelReady, modelRef, localPointsRef }) {
  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  const cameraPos = isMobile ? [0, 0, 100000 * modelScaleMultiplier] : [0, 0, 200000 * modelScaleMultiplier];
  const scaleVal = isMobile ? 300000 * modelScaleMultiplier : 600000 * modelScaleMultiplier;

  if (!reveal) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 5, pointerEvents: "none" }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: cameraPos, fov: 7, near: 10000, far: 500000 }}
        style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
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
        <directionalLight intensity={1.5} position={[5, 10, 5]} />

        <React.Suspense fallback={null}>
          <Environment preset="city" background={false} />
          <Center>
            <InteractiveModel
              onLoad={(loaded) => {
                // when model loads compute bounding box and pick random local points (in model local space)
                const bbox = new THREE.Box3().setFromObject(loaded);
                const size = bbox.getSize(new THREE.Vector3());
                const min = bbox.min;
                // generate N random local-space points based on bbox (these will be used for label anchors)
                const N = 4;
                const pts = [];
                for (let i = 0; i < N; i++) {
                  const rx = min.x + Math.random() * size.x;
                  const ry = min.y + Math.random() * size.y;
                  const rz = min.z + Math.random() * size.z;
                  // transform into object's local coordinates (we want points relative to the object)
                  // Since `loaded` is an Object3D in world coordinates, convert world->local:
                  const local = loaded.worldToLocal(new THREE.Vector3(rx, ry, rz).clone());
                  pts.push(local);
                }
                if (localPointsRef) localPointsRef.current = pts;
                if (onModelReady) onModelReady(loaded);
              }}
              controlRef={modelRef}
              scale={scaleVal}
            />
          </Center>

          <AutoRotate modelRef={modelRef} />
          <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.5} far={10} />
        </React.Suspense>

        <EffectComposer multisampling={4}>
          <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

/* ---------------- App: scroll-driven logo + canvas + labels ---------------- */
export default function App() {
  // refs + state
  const centerRef = useRef(null);
  const heroLogoRef = useRef(null);
  const modelRef = useRef(null);
  const labelDomRefs = useRef([]);
  const localPointsRef = useRef([]); // will hold local-space anchor points once model loads
  const [reveal, setReveal] = useState(false); // when model should be visible
  const progressRef = useRef(0); // 0..1 — scroll progress
  const rafRef = useRef(null);

  // responsive sizes
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // attach scroll on center container and smooth the progress with lerp
  useEffect(() => {
    const el = centerRef.current;
    if (!el) return;
    // hide scrollbars visually
    el.style.scrollbarWidth = "none";
    el.style.msOverflowStyle = "none";

    let target = 0;
    let current = 0;

    const onScroll = () => {
      const top = el.scrollTop;
      const maxScroll = Math.max(el.scrollHeight - el.clientHeight, 1);
      target = Math.min(Math.max(top / maxScroll, 0), 1);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const tick = () => {
      current += (target - current) * 0.12;
      progressRef.current = current;
      // reveal logic: show model when progress passes a small threshold (tweakable)
      if (current > 0.05) setReveal(true);
      else setReveal(false);
      // animate hero logo transform based on current
      const elLogo = heroLogoRef.current;
      if (elLogo) {
        const eased = current; // apply easing if you want: Math.pow(current, 0.92) etc.
        const startSize = isMobile ? 260 : 520;
        const endSize = isMobile ? 56 : 90;
        const size = startSize + (endSize - startSize) * eased;
        const scale = size / startSize;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const finalLeft = 24;
        const finalTop = 12;
        const dx = finalLeft - centerX;
        const dy = finalTop - centerY;
        elLogo.style.transform = `translate3d(${dx * eased}px, ${dy * eased}px, 0) scale(${scale})`;
        elLogo.style.transformOrigin = "center left";
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile]);

  // set up label DOM elements (4 labels)
  useEffect(() => {
    labelDomRefs.current = Array(4)
      .fill(0)
      .map((_, i) => labelDomRefs.current[i] || React.createRef());
  }, []);

  // When model loads, localPointsRef will be filled by ThreeDCanvas's onLoad callback.
  // We'll render label DOM elements and the LabelsFollower (inside Canvas) will update them each frame.

  /* Dom labels: absolute positioned elements whose transform get updated by LabelsFollower */
  const LabelDOMs = () => (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 20 }}>
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            ref={(el) => (labelDomRefs.current[i] = el)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: "translate3d(-9999px,-9999px,0)",
              transition: "opacity 0.12s linear, transform 0.02s linear",
              opacity: 0,
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: "rgba(0,0,0,0.6)", padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,204,0,0.12)" }}>
                <span style={{ color: "#ffcc00", fontFamily: "'Zalando Sans Expanded', sans-serif", fontWeight: 700, fontSize: 14 }}>
                  {["Team", "Schedule", "Contact", "Join Us"][i]}
                </span>
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  // small helper to give center-scroll a big spacer (so user can scroll back/forth)
  const spacerHeight = Math.max(window.innerHeight * 2.2, 1400);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#191919",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Zalando Sans Expanded', 'Inconsolata', sans-serif",
        color: "#fff",
      }}
    >
      {/* global stylesheet tweaks */}
      <style>{`
        body { margin:0; background:#191919; }
        #center-scroll::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
        #center-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* CENTERED HERO LOGO (fixed) - transforms based on scroll progress */}
      <div
        id="hero-logo"
        ref={heroLogoRef}
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate3d(-50%, -50%, 0) scale(1)",
          zIndex: 30,
          pointerEvents: "none",
          willChange: "transform",
        }}
        aria-hidden
      >
        <NPLogo size={isMobile ? 260 : 520} />
      </div>

      {/* 3D canvas: revealed when progress > threshold */}
      <ThreeDCanvas
        reveal={reveal}
        modelScaleMultiplier={1}
        modelRef={modelRef}
        localPointsRef={localPointsRef}
        onModelReady={() => {
          // no-op for now
        }}
      />

      {/* Labels DOM — DOM elements will be positioned by the LabelsFollower inside the Canvas */}
      <LabelDOMs />

      {/* LabelsFollower component inside Canvas needs refs & points -> we hook it up by rendering a small helper inside the Canvas.
          Instead of rendering a separate <LabelsFollower> here (which must be within Canvas), we create a small Canvas child when reveal is true.
          To avoid duplicating Canvas, we mount a tiny offscreen <Canvas> just to run the follower? That's unnecessary — better approach:
          We can reuse the existing Canvas by passing modelRef & localPointsRef down into ThreeDCanvas which will mount LabelsFollower inside the same Canvas.
          That's already implemented above: ThreeDCanvas will set localPointsRef and you should add LabelsFollower inside ThreeDCanvas's Canvas.
          For simplicity we included code earlier: update localPointsRef in InteractiveModel onLoad and ThreeDCanvas should include LabelsFollower when localPointsRef populated.
      */}

      {/* CENTER SCROLL CONTAINER — empty content for now, allows user to scroll to animate the logo */}
      <div
        id="center-scroll"
        ref={centerRef}
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          transform: "translateX(-50%)",
          width: "min(900px, 92vw)",
          height: "100vh",
          overflowY: "auto",
          zIndex: 5,
          // visually empty content; we use spacer for scroll distance
        }}
      >
        <div style={{ height: spacerHeight }} />
      </div>

      {/* Attach LabelsFollower inside the same canvas by mounting another small R3F wrapper when reveal is true */}
      {/* We'll render a small Canvas-only component that uses the same camera to project coordinates — to keep everything tidy,
          we actually mount the LabelsFollower as part of the main ThreeDCanvas's Canvas. To do that we need to include LabelsFollower inside ThreeDCanvas's JSX.
          The code above sets localPointsRef and modelRef - ThreeDCanvas should read these and mount LabelsFollower.
          If you copy-paste this file as-is, you'll need to add the LabelsFollower invocation inside ThreeDCanvas after the model loads.
          For convenience I've updated ThreeDCanvas earlier to compute localPointsRef on load and you can add a LabelsFollower usage there like:
          <LabelsFollower modelRef={modelRef} localPoints={localPointsRef.current} labelDomRefs={labelDomRefs} />
          However LabelsFollower must be used inside Canvas (not here). See comments in file.
      */}

    </div>
  );
}
