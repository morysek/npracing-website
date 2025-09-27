import React, { useEffect, useState, Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

// --- Replace these with your actual image URLs (or pass them in as props later)
const TEAM_IMAGES = ["/images/team1.jpg", "/images/team2.jpg", "/images/team3.jpg"];

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
      {/* SVG content (unchanged) */}
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

function TopBar({ onNavigate, showSmall }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ position: "fixed", top: 12, left: 16, zIndex: 1001, transition: 'opacity 0.4s ease, transform 0.4s ease', opacity: showSmall ? 1 : 0, transform: showSmall ? 'translateY(0)' : 'translateY(-6px)' }}>
      <a
        style={{ display: "block", cursor: "pointer" }}
        onClick={(e) => {
          e.preventDefault();
          onNavigate && onNavigate("home");
        }}
        href="/"
        aria-label="Home"
      >
        <NPLogo size={isMobile ? 60 : 90} />
      </a>
    </div>
  );
}

// Team visual: small inline images with corrected aspect-ratio
function TeamVisual({ images = TEAM_IMAGES }) {
  const containerRef = useRef();
  const imgRefs = useRef([]);

  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.min(Math.max((viewportHeight - rect.top) / (viewportHeight + rect.height), 0), 1);

      imgRefs.current.forEach((img, i) => {
        if (!img) return;
        const offset = (i - (images.length - 1) / 2) * 28;
        const translateY = (1 - progress) * 40 + offset * (1 - progress);
        const opacity = Math.max(0, Math.min(1, progress * 1.4 - i * 0.05));
        const rotate = (1 - progress) * (i % 2 === 0 ? -6 : 6);
        img.style.transform = `translate3d(${offset * (1 - progress)}px, ${translateY}px, 0) rotate(${rotate}deg) scale(${1 + (1 - progress) * 0.04})`;
        img.style.opacity = opacity;
        img.style.filter = `grayscale(${Math.max(0, 1 - progress)})`;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [images.length]);

  return (
    <div ref={containerRef} style={{ position: "relative", height: 420, marginTop: 40 }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
        {images.map((src, i) => (
          <img
            key={i}
            ref={(el) => (imgRefs.current[i] = el)}
            src={src}
            alt={`team-${i}`}
            style={{
              width: 320,
              aspectRatio: '16/9',
              height: 'auto',
              objectFit: "cover",
              position: "absolute",
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              borderRadius: 8,
              transition: "transform 0.25s ease-out, opacity 0.25s ease-out, filter 0.25s ease-out",
              opacity: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function TeamContent() {
  return (
    <section id="team" style={{ color: "#fff", padding: "40px 20px", maxWidth: 900 }}>
      <h1 className="microgramma colored">Team</h1>
      <p className="zalando">The Team</p>
      <ul className="zalando">
        <li>Team Leader: Matěj Prokop</li>
        <li>Engineer: Lukáš Moravec</li>
        <li>Finance manager: Lukáš Martin</li>
        <li>Marketing manager: Veronika Lindová</li>
      </ul>

      <TeamVisual images={TEAM_IMAGES} />

      <h1 className="microgramma colored">About Us</h1>
      <p className="zalando">We are the only Czech team and a top contender in the prestigious international STEM racing competition.</p>
      <p className="zalando">We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.</p>
      <p className="zalando">Founded at Nový PORG, NP Racing unites skills in engineering, manufacturing, and marketing.</p>
      <p className="zalando">We collaborate with partners like the Czech Technical University to enhance our expertise.</p>
    </section>
  );
}

function ScheduleContent() {
  return (
    <section id="schedule" style={{ color: "#fff", padding: "40px 20px", maxWidth: 900 }}>
      <h1 className="microgramma colored">Schedule</h1>
      <p className="zalando">Next up: Poland</p>
      <ol className="zalando">
        <li>Oct 11</li>
      </ol>
    </section>
  );
}

function ContactContent() {
  return (
    <section id="contact" style={{ color: "#fff", padding: "40px 20px", maxWidth: 900 }}>
      <h1 className="microgramma colored">Contact</h1>
      <p className="zalando">
        For general inquiry: <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">prokopmatej@novyporg.cz</a>
      </p>
    </section>
  );
}

function JoinUsContent() {
  return (
    <section id="joinus" style={{ color: "#fff", padding: "40px 20px", maxWidth: 900 }}>
      <h1 className="microgramma colored">Join Us</h1>
      <p className="zalando">Want the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>
    </section>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffcc00",
        fontFamily: "'Inconsolata', monospace",
        fontSize: 13,
        letterSpacing: 2,
        zIndex: 1000,
      }}
    >
      <NPLogo size={200} />
      <div style={{ position: "absolute", alignItems: "center", paddingTop: 150 }}>Loading…</div>
    </div>
  );
}

// Manual loader (no useLoader hook) so we never call R3F hooks outside Canvas
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

function AutoRotate({ modelRef }) {
  // subtle breathing rotation on X/Y
  useFrame((_, delta) => {
    const obj = modelRef.current;
    if (!obj) return;
    obj.rotation.x += 0.005 * delta;
    obj.rotation.y += 0.003 * delta;
  });
  return null;
}

// This component runs inside the Canvas and animates the Z rotation
function ScrollDrivenRotation({ modelRef, targetZRef, showCar }) {
  const currentZ = useRef(0);
  useFrame(() => {
    const obj = modelRef.current;
    if (!obj) return;
    // if the car hasn't been revealed yet, keep it hidden/invisible by scaling down
    if (!showCar) {
      obj.scale.setScalar(0.001);
      return;
    }

    // once revealed, ensure the model scales to normal and apply rotation
    obj.scale.lerp(new THREE.Vector3(1, 1, 1), 0.07);

    // lerp currentZ -> targetZ
    currentZ.current += (targetZRef.current - currentZ.current) * 0.12;
    obj.rotation.z = currentZ.current;
  });
  return null;
}

function ThreeDCar({ show = true, reveal }) {
  const [loading, setLoading] = useState(true);
  const modelRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const [modelScale, setModelScale] = useState(600000);

  // scroll-driven Z rotation state (kept outside of any R3F hooks)
  const targetZ = useRef(0);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setModelScale(mobile ? 250000 : 600000);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // scroll -> set targetZ proportionally to scroll progress
  useEffect(() => {
    const scrollContainer = document.getElementById("center-scroll");
    const getScrollInfo = () => {
      if (scrollContainer) {
        const scrollTop = scrollContainer.scrollTop;
        const maxScroll = Math.max(scrollContainer.scrollHeight - scrollContainer.clientHeight, 1);
        return { scrollTop, maxScroll };
      }
      const scrollTop = window.scrollY || window.pageYOffset;
      const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      return { scrollTop, maxScroll };
    };

    const onScroll = () => {
      const { scrollTop, maxScroll } = getScrollInfo();
      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      // rotate up to 1.5 * PI radians around Z as user scrolls from top -> bottom
      targetZ.current = progress * Math.PI * 1.5;
    };

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }

    onScroll();
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    };
  }, []);

  // when reveal flips to true, snap the model into its reveal orientation (45deg Y)
  useEffect(() => {
    if (!modelRef.current) return;
    if (reveal) {
      // set a nice preview angle: tilt slightly down and rotate to 45deg
      modelRef.current.rotation.set(-0.25, Math.PI / 4, 0);
      modelRef.current.scale.set(0.001, 0.001, 0.001); // start small and scale in via ScrollDrivenRotation
    }
  }, [reveal]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "var(--topbar-height, 140px)",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        touchAction: "none",
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      {loading && <LoadingScreen />}

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={isMobile ? { position: [0, 0, modelScale * 0.33], fov: 10, near: 10000, far: 500000 } : { position: [0, 0, 200000], fov: 7, near: 10000, far: 500000 }}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        onCreated={({ gl, scene }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          if (gl.outputColorSpace !== undefined) gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.6;
          scene.background = new THREE.Color(0x000000);
        }}
      >
        <ambientLight intensity={0.1} />
        <directionalLight
          castShadow
          intensity={2}
          position={[5, 10, 5]}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0005}
          shadow-camera-near={1}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-radius={4}
        />

        <Suspense fallback={null}>
          <Environment preset="city" background={false} />
          <Center>
            <InteractiveModel onLoad={() => setLoading(false)} controlRef={modelRef} scale={modelScale} />
          </Center>

          <AutoRotate modelRef={modelRef} />
          <ScrollDrivenRotation modelRef={modelRef} targetZRef={targetZ} showCar={reveal} />
          <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.5} far={10} />
        </Suspense>

        <EffectComposer multisampling={4}>
          <SSAO samples={31} radius={60000000} intensity={50} luminanceInfluence={0.6} color="black" />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

// overlay labels that point to parts of the car
function LabelsOverlay({ show }) {
  // coordinates are relative to the center of viewport
  const size = { w: window.innerWidth, h: window.innerHeight };
  const centerX = size.w / 2;
  const centerY = size.h / 2;

  // simple positions for 4 labels around the car
  const labels = [
    { text: 'Team', x: centerX - 380, y: centerY - 120, toX: centerX - 80, toY: centerY - 60 },
    { text: 'Schedule', x: centerX + 220, y: centerY - 160, toX: centerX + 60, toY: centerY - 20 },
    { text: 'Contact', x: centerX - 420, y: centerY + 60, toX: centerX - 60, toY: centerY + 60 },
    { text: 'Join Us', x: centerX + 240, y: centerY + 80, toX: centerX + 80, toY: centerY + 80 },
  ];

  if (!show) return null;

  return (
    <svg style={{ position: 'fixed', inset: 0, zIndex: 4, pointerEvents: 'none' }}>
      {labels.map((l, i) => (
        <g key={i}>
          <line
            x1={l.x}
            y1={l.y}
            x2={l.toX}
            y2={l.toY}
            stroke="#ffcc00"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.9}
          />
          <rect x={l.x - 6} y={l.y - 18} rx={3} ry={3} width={80} height={28} fill="#000" opacity={0.6} />
          <text x={l.x + 8} y={l.y} fill="#ffcc00" fontFamily="'Zalando Sans Expanded', sans-serif" fontSize={14} fontWeight={600}>
            {l.text}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [isMobile, setIsMobile] = useState(false);
  const [showSmallLogo, setShowSmallLogo] = useState(false);
  const [revealCar, setRevealCar] = useState(false);

  const centerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const topbarHeight = isMobile ? 90 : 80;
  useEffect(() => {
    document.documentElement.style.setProperty("--topbar-height", `${topbarHeight}px`);
  }, [topbarHeight]);

  // inject Google Fonts for Zalando Sans Expanded
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Zalando+Sans+Expanded:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // observe hero to toggle small top-left logo visibility (we still keep hero visible but shrinking)
  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // If hero is mostly visible, hide small logo. When hero shrinks away, show small one
        setShowSmallLogo(!entry.isIntersecting);
      });
    }, { threshold: 0.15 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // scroll handler on the center container to animate logo -> top-left and reveal car
  useEffect(() => {
    const container = centerRef.current;
    if (!container) return;

    const onScroll = () => {
      const hero = document.getElementById('hero');
      if (!hero) return;
      const heroRect = hero.getBoundingClientRect();
      // progress 0..1 where 0 = top-of-hero, 1 = hero collapsed to its final small state
      const start = 0; // hero top
      const end = heroRect.height * 0.6; // when scrolled 60% of hero height
      const scrollTop = container.scrollTop;
      const progress = Math.min(Math.max(scrollTop / Math.max(end, 1), 0), 1);

      // when progress passes 0.18 reveal the car
      if (progress > 0.18) setRevealCar(true);
      else setRevealCar(false);

      // transform the hero logo: scale and translate
      const logoEl = document.getElementById('hero-logo');
      if (logoEl) {
        const startSize = isMobile ? 260 : 520;
        const endSize = isMobile ? 60 : 90;
        const size = startSize + (endSize - startSize) * progress;
        logoEl.style.transform = `translate3d(${ - (window.innerWidth / 2 - 56) * progress}px, ${- (heroRect.height / 2 - 28) * progress}px, 0) scale(${size / startSize})`;
        logoEl.style.transition = 'transform 0s';
        logoEl.style.transformOrigin = 'center left';
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isMobile]);

  const renderScrollableCenter = () => (
    // This is the centered scrollable area the user asked for
    <div
      id="center-scroll"
      ref={centerRef}
      style={{
        height: `calc(100vh)`,
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        overflowY: "auto",
        padding: "0",
        boxSizing: "border-box",
        zIndex: 2,
        position: "relative",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* HERO: only huge logo visible on first view; keeps sticky so user doesn't scroll past it */}
      <section id="hero" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', position: 'relative' }}>
        <div id="hero-logo" style={{ willChange: 'transform', transition: 'transform 0.15s linear' }}>
          <NPLogo size={isMobile ? 260 : 520} />
        </div>
      </section>

      {/* Content columns — these will scroll inside the centered container */}
      <div style={{ padding: '40px 20px', background: '#000' }}>
        <div style={{ minHeight: 20 }} />
        <TeamContent />
        <ScheduleContent />
        <JoinUsContent />
        <ContactContent />
        <div style={{ height: 140 }} />
      </div>
    </div>
  );

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#000",
        overflowX: "hidden",
        fontFamily: "'Zalando Sans Expanded', 'Inconsolata', sans-serif",
        color: "#fff",
      }}
    >
      <style>{`
        html { scroll-behavior: smooth; }
        body { background: #000; }
        @font-face {
          font-family: 'MicrogrammaBold';
          src: url('/fonts/microgramma.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        .microgramma { font-family: 'MicrogrammaBold', 'Inconsolata', sans-serif; font-weight: 700; letter-spacing: 0.6px; }
        .zalando { font-family: 'Zalando Sans Expanded', 'Inconsolata', sans-serif; }

        /* remove visible scrollbar for the centered scroll container */
        #center-scroll::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
        #center-scroll { scrollbar-width: none; -ms-overflow-style: none; }

        /* colored titles */
        .colored { color: #ffcc00; }

        /* ensure hero logo transforms smoothly */
        #hero-logo svg { display: block; }
      `}</style>

      {/* top-left small logo appears only after hero is out of view */}
      <TopBar onNavigate={setPage} showSmall={showSmallLogo} />

      {/* fixed 3D canvas. reveal prop toggles appearance once logo moves */}
      <ThreeDCar show={page === "home"} reveal={revealCar} />

      {/* labels that point to parts of the car (appear when car revealed) */}
      <LabelsOverlay show={revealCar} />

      {/* Centered scrollable text column */}
      <main style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "0px", zIndex: 2 }}>
        {renderScrollableCenter()}
      </main>
    </div>
  );
}
