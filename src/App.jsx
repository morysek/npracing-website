// src/App.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* ---------- helpers ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ---------- labels (4) ---------- */
const LABELS = ["TEAM", "JOIN US", "SCHEDULE", "CONTACT"];

/* ---------- NPLogo (original SVG kept) ---------- */
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
      {/* ... your original SVG content here ... */}
      <g transform="translate(-54.124261,-130.25079)">
        {/* (SVG content omitted here for brevity — paste your full SVG) */}
        <path d="m 53.020878,195.78621 h -2.060221 ..." />
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
    // continuous subtle rotation along all axes (keeps it alive even when visible)
    group.current.rotation.x += 0.002; // continual X rotation
    group.current.rotation.y += 0.003; // continual Y rotation
    group.current.rotation.z += 0.0015; // continual Z rotation

    // appear animation controlled by progressRef (0..1)
    const p = clamp(progressRef.current);
    const eased = easeInOutCubic(p);

    const fromZ = isMobile ? 280000 : 420000;
    group.current.position.set(0, (1 - eased) * (isMobile ? 2.5 : 4), -fromZ * (1 - eased));

    // rotate a bit on X during appearance (keeps the effect)
    // note the continual rotation above will add on top of this
    group.current.rotation.x += eased * (Math.PI * 0.12) * 0.01; // small additive effect
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

/* ---------- LabelsFollower (runs inside Canvas useFrame) ---------- */
function LabelsFollower({ modelRef, anchorsRef, labelDomRefs, lineRefs, visible, rightCount = 2 }) {
  const { camera, size } = useThree();
  const tmp = useRef(new THREE.Vector3());

  useFrame(() => {
    // only update connector tips when visible
    if (!visible) {
      // also ensure connectors hidden
      if (lineRefs.current) {
        for (let ln of lineRefs.current) if (ln) ln.setAttribute("opacity", "0");
      }
      return;
    }

    const model = modelRef.current;
    const anchors = anchorsRef.current;
    if (!model || !anchors || !anchors.length) return;

    const edgePadding = 18;
    for (let i = 0; i < anchors.length; i++) {
      const isRight = i < rightCount;
      const labelEl = labelDomRefs.current[i];
      const poly = lineRefs.current[i];
      if (!labelEl || !poly) continue;

      // anchor world position
      tmp.current.copy(anchors[i]);
      model.localToWorld(tmp.current);
      tmp.current.project(camera);

      const ax = (tmp.current.x * 0.5 + 0.5) * size.width;
      const ay = (-tmp.current.y * 0.5 + 0.5) * size.height;

      // label end (text) position should remain fixed at edge (we only move the tip/connector)
      // keep label text at left/right edges (or above/below on mobile)
      if (window.innerWidth <= 768) {
        // mobile: place two labels above, two below the model (centered)
        const isTop = i < 2;
        const left = (size.width / 2) - 60; // centered-ish
        const top = isTop ? size.height * 0.12 : size.height * 0.88 - labelEl.offsetHeight;
        labelEl.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      } else {
        const rect = labelEl.getBoundingClientRect();
        const left = isRight ? size.width - edgePadding - rect.width : edgePadding;
        const top = ay - rect.height / 2;
        labelEl.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      }

      labelEl.style.opacity = "1";

      // connector: tip anchored to model -> small elbow -> end at label edge
      const dx = isRight ? 70 : -70;
      const dy = isRight ? -24 : 24;
      const elbowX = ax + dx;
      const elbowY = ay + dy;

      // endpoint where the connector meets the text box edge
      let endX, endY;
      if (window.innerWidth <= 768) {
        // mobile: endpoint near top/bottom text centers
        const isTop = i < 2;
        endX = (size.width / 2);
        endY = isTop ? size.height * 0.12 + labelEl.offsetHeight / 2 : size.height * 0.88;
      } else {
        const rect = labelEl.getBoundingClientRect();
        endX = isRight ? parseFloat(rect.left) - 8 : parseFloat(rect.left + rect.width) + 8;
        endY = ay;
      }

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

  // create DOM labels & SVG overlay
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

    // load Roboto via link (for labels) and Inconsolata for other text if needed
    const gLinkId = "__npr_google_fonts";
    if (!document.getElementById(gLinkId)) {
      const link = document.createElement("link");
      link.id = gLinkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inconsolata:wght@700&family=Roboto:wght@400;700&display=swap";
      document.head.appendChild(link);
    }

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
        fontFamily: "'Inconsolata', 'Roboto', sans-serif", // label font: Roboto, fallback Inconsolata
        fontSize: "16px",
        fontWeight: "700",
        padding: "0 8px",
        background: "transparent",
        borderLeft: "0px solid rgba(255,255,255,0.0)",
        zIndex: 10000,
        letterSpacing: "0.02em",
      });
      el.textContent = txt;
      document.body.appendChild(el);
      labelDomRefs.current.push(el);

      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      poly.setAttribute("fill", "none");
      poly.setAttribute("stroke", "#ffffff");
      poly.setAttribute("stroke-width", String(isMobile ? 1.5 : 2.2));
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

  // compute anchors when model loads (pin to semantic parts)
  const handleModelLoaded = (loadedObj) => {
    modelRef.current = loadedObj;

    // bounding box
    const bbox = new THREE.Box3().setFromObject(loadedObj);
    const size = bbox.getSize(new THREE.Vector3());
    const min = bbox.min;
    const max = bbox.max;
    const center = bbox.getCenter(new THREE.Vector3());

    // Points: helmet, front, back, wheel-like
    const anchorsWorld = [];
    anchorsWorld.push(new THREE.Vector3(center.x, max.y - size.y * 0.06, max.z - size.z * 0.06)); // helmet
    anchorsWorld.push(new THREE.Vector3(center.x, center.y, max.z)); // front
    anchorsWorld.push(new THREE.Vector3(center.x, center.y, min.z)); // back
    anchorsWorld.push(new THREE.Vector3(max.x - size.x * 0.03, min.y + size.y * 0.06, min.z + size.z * 0.08)); // wheel
    anchorsRef.current = anchorsWorld.map((w) => loadedObj.worldToLocal(w.clone()));
  };

  // timeline RAF to update logo transform
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

        // finalLeft controls horizontal placement of small logo at end.
        // The user asked: "make the small logo at the end of the animation sit at the top of the page in the middle but keep the same distance from the top, only modify the finalLeft variable"
        // To put it centered horizontally, set finalLeft = centerX.
        const finalLeft = centerX; // <-- changed to place small logo centered horizontally (user-request)
        const finalTop = 14; // fixed distance from top

        const dx = finalLeft - centerX;
        const dy = finalTop - centerY;

        // transform wrapper from center toward final position
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
        // set labels visibility only when fully shown
        if (Math.abs(timelineProgressRef.current - 1) < 1e-6) {
          setLabelsVisible(true);
          labelDomRefs.current.forEach((el) => {
            if (el) {
              el.style.display = "block";
              // fade in
              el.style.transition = "opacity 260ms ease";
              requestAnimationFrame(() => (el.style.opacity = "1"));
            }
          });
          lineRefs.current.forEach((line) => line && line.setAttribute("opacity", "1"));
        } else {
          setLabelsVisible(false);
          labelDomRefs.current.forEach((el) => {
            if (el) {
              // fade out & hide
              el.style.transition = "opacity 200ms ease";
              el.style.opacity = "0";
              setTimeout(() => {
                if (el) el.style.display = "none";
              }, 220);
            }
          });
          lineRefs.current.forEach((line) => line && line.setAttribute("opacity", "0"));
        }
      }
    }
    requestAnimationFrame(step);
  }

  // helper to hide labels + any .site-text before performing reverse animation
  function hideLabelsWithFade(delayWhenHidden = 220, cb) {
    // fade out DOM labels
    labelDomRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transition = "opacity 180ms ease";
      el.style.opacity = "0";
    });
    // fade out any site text (elements you may mark with .site-text)
    const texts = document.querySelectorAll(".site-text");
    texts.forEach((t) => {
      t.style.transition = "opacity 180ms ease";
      t.style.opacity = "0";
    });

    // after fade completes, hide display and call callback
    setTimeout(() => {
      labelDomRefs.current.forEach((el) => {
        if (!el) return;
        el.style.display = "none";
      });
      texts.forEach((t) => {
        t.style.display = "none";
      });
      // update state
      setLabelsVisible(false);
      if (typeof cb === "function") cb();
    }, delayWhenHidden);
  }

  // scroll triggering: only process when user is within top 100px of page
  useEffect(() => {
    const onWheel = (e) => {
      // only active when near page top
      if (window.scrollY <= 100) {
        if (e.deltaY > 0) {
          // scroll down -> play forward immediately (labels will show at end)
          animateTimelineTo(1, 700);
        } else if (e.deltaY < 0) {
          // scroll up -> hide labels first, then play reversed timeline
          hideLabelsWithFade(220, () => animateTimelineTo(0, 700));
        }
      }
    };

    // touch support: detect vertical swipe direction when starting near top
    let touchStartY = null;
    const onTouchStart = (ev) => {
      if (window.scrollY <= 100) touchStartY = ev.touches ? ev.touches[0].clientY : null;
      else touchStartY = null;
    };
    const onTouchMove = (ev) => {
      if (touchStartY == null) return;
      const y = ev.touches ? ev.touches[0].clientY : null;
      if (y == null) return;
      const dy = touchStartY - y;
      if (Math.abs(dy) > 12) {
        if (dy > 0) {
          // swipe up => play forward
          animateTimelineTo(1, 700);
        } else {
          // swipe down => hide then reverse
          hideLabelsWithFade(220, () => animateTimelineTo(0, 700));
        }
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

  // initial CSS + hide scrollbar (still allow scroll)
  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#191919",
        position: "relative",
        fontFamily: "'Microgramma', sans-serif",
      }}
    >
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
        /* you can mark visible site text that should fade with class .site-text */
        .site-text { transition: opacity 160ms ease; }
      `}</style>

      {/* HERO area (sticky canvas & centered logo) */}
      <section style={{ height: "160vh", position: "relative" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%" }}>
          {/* CENTERED LOGO — will transform to small centered top variant */}
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
                  <InteractiveModel
                    onModelLoaded={handleModelLoaded}
                    progressRef={timelineProgressRef}
                    isMobile={isMobile}
                    scale={isMobile ? 300000 : 600000}
                  />
                </Center>
                <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.45} far={10} />
              </Suspense>

              <LabelsFollower
                modelRef={modelRef}
                anchorsRef={anchorsRef}
                labelDomRefs={labelDomRefs}
                lineRefs={lineRefs}
                visible={labelsVisible}
                rightCount={2}
              />

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
