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
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

/* ---------- labels (4) ---------- */
const LABELS = ["TEAM", "JOIN US", "SCHEDULE", "CONTACT"];

/* ---------- NPLogo (unchanged) ---------- */
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
      {/* ... same SVG paths as your original NPLogo ... */}
      <g transform="translate(-54.124261,-130.25079)">
        {/* (Paths omitted here in the snippet for brevity — copy your original NPLogo paths) */}
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

/* ---------- InteractiveModel (inside Canvas) ---------- */
function InteractiveModel({ onModelLoaded, progressRef, isMobile, scale = 600000, cameraFadeRef }) {
  const obj = useLoader(OBJLoader, "/models/F1.obj");
  const group = useRef();
  const baseRotation = useRef(new THREE.Euler());

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

  useFrame((state, delta) => {
    if (!group.current) return;

    // handle appear timeline
    const p = clamp(progressRef.current || 0);
    const eased = easeInOutCubic(p);

    const fromZ = isMobile ? 280000 : 420000;
    group.current.position.set(0, (1 - eased) * (isMobile ? 2.5 : 4), -fromZ * (1 - eased));

    // PARTICLE: continuous rotation around x,y,z
    // we keep a small continuous rotation even while appearing
    group.current.rotation.x += 0.001 * delta + eased * 0.001; // small drift
    group.current.rotation.y += 0.0015 * delta + eased * 0.002;
    group.current.rotation.z += 0.0009 * delta + eased * 0.0012;

    // Additional 'appearance' rotation (keeps model dynamic)
    group.current.rotation.x += eased * 0.002;

    // scale in
    const s = 0.0001 + eased;
    group.current.scale.setScalar(s);

    // When camera Fade begins (page scroll after the hero), we set absolute orientation and fade out
    const cameraFade = cameraFadeRef?.current;
    if (cameraFade) {
      // smoothly set a target rotation -> X=0, Z=0, Y=90deg
      const target = new THREE.Euler(0, Math.PI / 2, 0);
      group.current.rotation.x += (target.x - group.current.rotation.x) * 0.12;
      group.current.rotation.y += (target.y - group.current.rotation.y) * 0.12;
      group.current.rotation.z += (target.z - group.current.rotation.z) * 0.12;

      // fade out meshes progressively
      obj.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material.opacity = Math.max(0, 1 - cameraFade * 1.1);
        }
      });
    } else {
      // while not cameraFade ensure meshes fully opaque according to eased
      obj.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material.opacity = clamp(eased);
        }
      });
    }
  });

  return (
    <group ref={group}>
      <primitive object={obj} scale={scale} position={[0, 0, 0]} />
    </group>
  );
}

/* ---------- CameraController: animate camera zoom + fade overlay ---------- */
function CameraController({ cameraInitialZ, cameraFadeRef }) {
  const { camera } = useThree();
  const targetZRef = useRef(cameraInitialZ);
  useFrame(() => {
    const cameraFade = cameraFadeRef.current || 0;
    const targetZ = cameraInitialZ * (cameraFade > 0 ? 0.5 : 1); // 2x zoom => z halves
    // lerp camera.position.z
    camera.position.z += (targetZ - camera.position.z) * 0.08;
    camera.updateProjectionMatrix();
  });
  return null;
}

/* ---------- LabelsFollower (projects anchors -> draws polylines; labels fixed at edge) ---------- */
function LabelsFollower({ modelRef, anchorsRef, labelDomRefs, lineRefs, visible, rightCount = 2, isMobile }) {
  const { camera, size } = useThree();
  const tmp = useRef(new THREE.Vector3());

  // compute fixed label positions per index
  const computeFixedPositions = () => {
    const positions = [];
    const w = size.width;
    const h = size.height;

    if (isMobile) {
      // mobile: two above, two below centered horizontally
      const centerX = w / 2;
      const aboveY = h * 0.22;
      const belowY = h * 0.78;
      positions.push({ x: centerX - 80, y: aboveY }); // TEAM
      positions.push({ x: centerX + 80, y: aboveY }); // JOIN US
      positions.push({ x: centerX - 80, y: belowY }); // SCHEDULE
      positions.push({ x: centerX + 80, y: belowY }); // CONTACT
    } else {
      // desktop: two on the right near top, two on the left near bottom - fixed vertical placements like the reference
      const rightX = w - 36;
      const leftX = 36;
      const topStart = h * 0.14;
      const gap = 34;
      // right (top)
      positions.push({ x: rightX, y: topStart + 0 * gap });
      positions.push({ x: rightX, y: topStart + 1 * gap });
      // left (bottom)
      const bottomStart = h - (gap * 2 + 64);
      positions.push({ x: leftX, y: bottomStart + 0 * gap });
      positions.push({ x: leftX, y: bottomStart + 1 * gap });
    }
    return positions;
  };

  useFrame(() => {
    if (!visible) {
      // hide polylines and labels gently
      labelDomRefs.current.forEach((el) => {
        if (el) {
          el.style.opacity = "0";
        }
      });
      lineRefs.current.forEach((line) => {
        if (line) line.setAttribute("opacity", "0");
      });
      return;
    }

    const model = modelRef.current;
    const anchors = anchorsRef.current;
    if (!model || !anchors || !anchors.length) return;

    const fixed = computeFixedPositions();

    for (let i = 0; i < anchors.length; i++) {
      const isRight = i < rightCount;
      const labelEl = labelDomRefs.current[i];
      const poly = lineRefs.current[i];
      if (!labelEl || !poly) continue;

      // project anchor to screen (tip)
      tmp.current.copy(anchors[i]);
      model.localToWorld(tmp.current);
      tmp.current.project(camera);

      const ax = (tmp.current.x * 0.5 + 0.5) * size.width;
      const ay = (-tmp.current.y * 0.5 + 0.5) * size.height;

      // label stays fixed
      const fixedPos = fixed[i];
      // place label text (fixed) and ensure visible
      labelEl.style.left = `${fixedPos.x}px`;
      labelEl.style.top = `${fixedPos.y}px`;
      labelEl.style.opacity = "1";
      labelEl.style.display = "block";

      // connector path: anchor -> elbow near anchor -> straight to label edge
      // calculate elbow point (closer to anchor)
      const midX = ax + (fixedPos.x - ax) * 0.35;
      const midY = ay + (fixedPos.y - ay) * 0.35;

      // small offset so line doesn't overlap text: end sits slightly before the label's left edge
      const rect = labelEl.getBoundingClientRect();
      const endX = fixedPos.x + (isRight ? -8 : rect.width + 8); // if label on right, end is slightly left; if left, right of label
      const endY = fixedPos.y + rect.height / 2;

      // polyline: anchor -> mid -> end
      poly.setAttribute("points", `${ax},${ay} ${midX},${midY} ${endX},${endY}`);
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

  const cameraFadeRef = useRef(0); // 0..1 when user scrolls past hero to zoom/fade page

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

  // small overlay text that appears after camera fade
  const [pageTextVisible, setPageTextVisible] = useState(false);

  // hero size (vh)
  const heroHeightVh = 160;

  // ----- create DOM labels & SVG overlay -----
  useEffect(() => {
    labelDomRefs.current = [];
    lineRefs.current = [];

    // cleanup previous
    const oldSvg = document.getElementById("__npr_svg_overlay_lines");
    if (oldSvg) oldSvg.remove();

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "__npr_svg_overlay_lines");
    Object.assign(svg.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "9999",
      overflow: "visible",
    });
    document.body.appendChild(svg);

    // load Inconsolata from Google for labels (inject link tag)
    // (we also include Microgramma/Zalando via @font-face below)
    if (!document.getElementById("__gfont_inconsolata")) {
      const link = document.createElement("link");
      link.id = "__gfont_inconsolata";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap";
      document.head.appendChild(link);
    }

    // create 4 labels and polylines
    LABELS.forEach((txt, i) => {
      const el = document.createElement("div");
      Object.assign(el.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        transform: "translate3d(-9999px,-9999px,0)",
        pointerEvents: "none",
        opacity: "0",
        display: "none", // until labelsVisible true
        color: "#fff",
        fontFamily: "'Inconsolata', monospace",
        fontSize: "14px",
        fontWeight: "700",
        padding: "2px 6px",
        background: "transparent",
        zIndex: 10000,
        transition: "opacity 280ms ease, transform 220ms ease",
        letterSpacing: "0.02em",
      });
      el.textContent = txt;
      document.body.appendChild(el);
      labelDomRefs.current.push(el);

      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      poly.setAttribute("fill", "none");
      poly.setAttribute("stroke", "#ffffff");
      poly.setAttribute("stroke-width", String(isMobile ? 1.6 : 2.6));
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

    // anchors in world space (helmet, front, back, wheel-like corner)
    const anchorsWorld = [];
    anchorsWorld.push(new THREE.Vector3(center.x, max.y - size.y * 0.06, max.z - size.z * 0.06)); // helmet-ish
    anchorsWorld.push(new THREE.Vector3(center.x, center.y, max.z)); // front center
    anchorsWorld.push(new THREE.Vector3(center.x, center.y, min.z)); // back center
    anchorsWorld.push(new THREE.Vector3(max.x - size.x * 0.03, min.y + size.y * 0.06, min.z + size.z * 0.08)); // wheel-ish

    // convert to object local coordinates
    anchorsRef.current = anchorsWorld.map((w) => loadedObj.worldToLocal(w.clone()));
  };

  // ----- logo RAF to update transform according to timelineProgressRef -----
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = clamp(timelineProgressRef.current || 0);
      const eased = easeInOutCubic(p);
      const wrap = logoWrapRef.current;
      const scaleEl = logoScaleRef.current;
      if (wrap && scaleEl) {
        const startSize = isMobile ? 260 : 520;
        const endSize = isMobile ? 56 : 90;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // finalLeft: **modify only this variable** to control horizontal position of the final small logo
        const finalLeft = window.innerWidth / 2; // user asked to keep final logo in the top middle — only change this variable
        const finalTop = 16; // keep distance from top
        const dx = finalLeft - centerX;
        const dy = finalTop - centerY;

        wrap.style.transform = `translate(-50%,-50%) translate(${dx * eased}px, ${dy * eased}px)`;
        const scale = (startSize + (endSize - startSize) * eased) / startSize;
        scaleEl.style.transform = `scale(${scale})`;
        scaleEl.style.transformOrigin = "left top";
        // ensure smoothness (no jumps)
        wrap.style.willChange = "transform";
        scaleEl.style.willChange = "transform";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isMobile]);

  // ----- timeline animator (tween to target)
  // If reversing (target=0) we first fade labels out, wait, then run the timeline shrink.
  async function animateTimelineTo(target = 0, duration = 700) {
    timelineTargetRef.current = clamp(target);
    if (animatingRef.current) return;
    animatingRef.current = true;

    // if reversing and labels are visible, hide them first
    if (target === 0 && labelsVisible) {
      // fade out labels visually
      setLabelsVisible(false);
      labelDomRefs.current.forEach((el) => {
        if (el) {
          el.style.opacity = "0";
        }
      });
      // hide polylines immediately
      lineRefs.current.forEach((line) => line && line.setAttribute("opacity", "0"));
      // wait for fade to finish
      await wait(300);
    }

    const startTS = performance.now();
    const from = timelineProgressRef.current || 0;
    const delta = timelineTargetRef.current - from;

    function step(now) {
      const t = Math.min(1, (now - startTS) / duration);
      timelineProgressRef.current = clamp(from + delta * easeInOutCubic(t));
      if (t < 1) requestAnimationFrame(step);
      else {
        animatingRef.current = false;
        timelineProgressRef.current = timelineTargetRef.current;
        // labels visible only if fully shown
        if (Math.abs(timelineProgressRef.current - 1) < 1e-6) {
          setLabelsVisible(true);
          // show and fade in labels & polylines
          labelDomRefs.current.forEach((el) => {
            if (el) {
              el.style.display = "block";
              // small delay then fade to 1
              requestAnimationFrame(() => (el.style.opacity = "1"));
            }
          });
          lineRefs.current.forEach((line) => line && line.setAttribute("opacity", "1"));
        } else {
          // ensure labels hidden
          setLabelsVisible(false);
          labelDomRefs.current.forEach((el) => {
            if (el) {
              el.style.opacity = "0";
              // hide after small delay to prevent flicker
              setTimeout(() => (el.style.display = "none"), 300);
            }
          });
          lineRefs.current.forEach((line) => line && line.setAttribute("opacity", "0"));
        }
      }
    }
    requestAnimationFrame(step);
  }

  // ----- scroll triggers: only process when user is within top 100px of page -----
  useEffect(() => {
    const onWheel = (e) => {
      if (window.scrollY <= 100) {
        if (e.deltaY > 0) animateTimelineTo(1, 700); // scroll down while in top -> play forward
        else if (e.deltaY < 0) animateTimelineTo(0, 700); // scroll up while top -> reverse
      } else {
        // when scrolled past hero, trigger camera fade/zoom and page text
        // simple threshold: when scrollY > hero section height, start camera fade
        const threshold = (heroHeightVh / 100) * window.innerHeight;
        if (window.scrollY > threshold) {
          cameraFadeRef.current = 1;
          setPageTextVisible(true);
        } else {
          cameraFadeRef.current = 0;
          setPageTextVisible(false);
        }
      }
    };

    // touch support (vertical swipe from top 100px)
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
      if (Math.abs(dy) > 8) {
        if (dy > 0) animateTimelineTo(1, 700);
        else animateTimelineTo(0, 700);
        touchStartY = null;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // also update cameraFade if user scrolls freely beyond threshold
    const onScroll = () => {
      const threshold = (heroHeightVh / 100) * window.innerHeight;
      if (window.scrollY > threshold) {
        cameraFadeRef.current = 1;
        setPageTextVisible(true);
      } else {
        cameraFadeRef.current = 0;
        setPageTextVisible(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // fonts: Microgramma & Zalando via @font-face (assuming you put the .woff2 files in /public/fonts)
  // and Inconsolata is loaded above via Google Fonts link injection
  const overlayTextStyle = {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    top: 96,
    zIndex: 12000,
    color: "#fff",
    textAlign: "center",
    pointerEvents: "none",
    transition: "opacity 420ms ease",
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#191919",
        position: "relative",
        fontFamily: "'ZalandoSansExpanded', 'Inter', sans-serif",
        color: "#fff",
      }}
    >
      <style>{`
        /* Microgramma & Zalando (local files) */
        @font-face {
          font-family: 'Microgramma';
          src: url('/fonts/microgramma.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'ZalandoSansExpanded';
          src: url('/fonts/ZalandoSansExpanded.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        html,body,#root { height: 100%; background: #191919; }
        body { margin:0; overflow-y: scroll; -webkit-font-smoothing:antialiased; }
        body::-webkit-scrollbar { width: 0; height: 0; } 
        body { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* HERO area */}
      <section style={{ height: `${heroHeightVh}vh`, position: "relative" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%" }}>
          {/* CENTERED LOGO — will transform smoothly (no jumps) */}
          <div
            ref={logoWrapRef}
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 40,
              pointerEvents: "none",
            }}
            aria-hidden
          >
            <div ref={logoScaleRef} style={{ transformOrigin: "left top", transition: "transform 160ms linear" }}>
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
                    cameraFadeRef={cameraFadeRef}
                  />
                </Center>
                <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.45} far={10} />
              </Suspense>

              {/* Camera controller animates camera position for page-zoom effect */}
              <CameraController cameraInitialZ={isMobile ? 120000 : 220000} cameraFadeRef={cameraFadeRef} />

              {/* LabelsFollower: polylines animate tips while label text remains fixed */}
              <LabelsFollower
                modelRef={modelRef}
                anchorsRef={anchorsRef}
                labelDomRefs={labelDomRefs}
                lineRefs={lineRefs}
                visible={labelsVisible}
                rightCount={2}
                isMobile={isMobile}
              />

              <EffectComposer multisampling={4}>
                <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
              </EffectComposer>
            </Canvas>
          </div>
        </div>
      </section>

      {/* Page text that fades in after camera fade (Team heading + paragraph) */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          top: 24,
          zIndex: 12000,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            opacity: pageTextVisible ? 1 : 0,
            transition: "opacity 420ms ease",
            textAlign: "center",
            color: "#ffcc00",
            fontFamily: "'Microgramma', sans-serif",
            fontSize: 24,
            lineHeight: 1,
          }}
        >
          Team
        </div>
        <div
          style={{
            marginTop: 8,
            opacity: pageTextVisible ? 1 : 0,
            transition: "opacity 420ms ease 120ms",
            maxWidth: 760,
            color: "#fff",
            fontFamily: "'ZalandoSansExpanded', sans-serif",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          We are the only Czech team and a top contender in the international STEM racing competition. We combine
          technical expertise, innovative design and teamwork to develop high-performance race car models.
        </div>
      </div>

      {/* small tail so page can scroll */}
      <div style={{ height: "40vh" }} />
    </div>
  );
}
