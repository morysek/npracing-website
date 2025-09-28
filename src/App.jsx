// src/App.jsx
import React, { useEffect, useState, Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { Environment, Center, ContactShadows } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

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
      {/* keep your original SVG content here (omitted for brevity) */}
      <g transform="translate(-54.124261,-130.25079)">
        {/* ... original paths ... */}
        <path style={{ fill: "#ffcc00" }} d="m 64.083427,130.25096 -9.959082,21.06022 h 4.532023 ..." />
      </g>
    </svg>
  );
}

/* ---------- TopBar (unchanged) ---------- */
function TopBar({ currentPage, onNavigate }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const logoSize = isMobile ? 100 : 140;
  const linkFontSize = isMobile ? 14 : 16;
  const linkSpacing = isMobile ? 8 : 12;

  const linkStyle = {
    color: "#fff",
    fontSize: linkFontSize,
    fontWeight: 600,
    letterSpacing: 1,
    margin: `0 ${linkSpacing / 2}px`,
    fontFamily: "'Inconsolata', monospace",
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
  };

  const dotStyle = {
    color: "#ffcc00",
    fontSize: linkFontSize + 2,
    margin: `0 ${linkSpacing / 2}px`,
    userSelect: "none",
    pointerEvents: "none",
  };

  const NavLink = ({ page, children }) => {
    const activeStyle = currentPage === page ? { opacity: 1 } : { opacity: 0.85 };
    return (
      <span
        onClick={() => onNavigate(page)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" ? onNavigate(page) : null)}
        style={{ ...linkStyle, ...activeStyle }}
      >
        {children}
      </span>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        background: "#000",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 8,
        boxSizing: "border-box",
      }}
    >
      <a
        style={{ display: "block", marginBottom: 12, cursor: "pointer" }}
        onClick={(e) => {
          e.preventDefault();
          onNavigate("home");
        }}
        href="/"
        aria-label="Home"
      >
        <NPLogo size={logoSize} />
      </a>

      <nav style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <NavLink page="home">Home</NavLink>
        <span style={dotStyle}>•</span>
        <NavLink page="team">Team</NavLink>
        <span style={dotStyle}>•</span>
        <NavLink page="joinus">Join Us</NavLink>
        <span style={dotStyle}>•</span>
        <NavLink page="schedule">Schedule</NavLink>
        <span style={dotStyle}>•</span>
        <NavLink page="contact">Contact</NavLink>
      </nav>
    </div>
  );
}

/* ---------- Content sections ---------- */
function TeamContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00" }}>Team</h1>
      <p>The Team</p>
      <ul>
        <li>Team Leader: Matěj Prokop</li>
        <li>Engineer: Lukáš Moravec</li>
        <li>Finance manager: Lukáš Martin</li>
        <li>Marketing manager: Veronika Lindová</li>
      </ul>

      <h1 style={{ color: "#ffcc00" }}>About Us</h1>
      <p>
        We are the only Czech team and a top contender in the prestigious international STEM racing competition.
      </p>
      <p>We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.</p>
      <p>
        Founded at Nový PORG, NP Racing unites skills in engineering, manufacturing, and marketing. We collaborate with partners like the Czech Technical University.
      </p>

      {/* Team images (now point to /images/team1.jpg etc.) */}
      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <img src="/images/team1.jpg" alt="team 1" style={{ width: 320, height: 200, objectFit: "cover", borderRadius: 6 }} />
        <img src="/images/team2.jpg" alt="team 2" style={{ width: 320, height: 200, objectFit: "cover", borderRadius: 6 }} />
        <img src="/images/team3.jpg" alt="team 3" style={{ width: 320, height: 200, objectFit: "cover", borderRadius: 6 }} />
      </div>
    </div>
  );
}

function ScheduleContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00" }}>Schedule</h1>
      <p>Next up: Poland</p>
      <ol>
        <li>Oct 11</li>
      </ol>
    </div>
  );
}

function ContactContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00" }}>Contact</h1>
      <p>
        For general inquiry:
        <a style={{ color: "#ffcc00", marginLeft: 6 }} href="mailto:prokopmatej@novyporg.cz">
          prokopmatej@novyporg.cz
        </a>
      </p>
    </div>
  );
}

function JoinUsContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1300 }}>
      <h1 style={{ color: "#ffcc00" }}>Join Us</h1>
      <p>
        Want the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!
      </p>
    </div>
  );
}

/* ---------- Loading overlay ---------- */
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
      <div style={{ textAlign: "center" }}>
        <NPLogo size={200} />
        <div style={{ marginTop: 16 }}>Loading…</div>
      </div>
    </div>
  );
}

/* ---------- InteractiveModel (GLB version) ---------- */
function InteractiveModel({ onLoad, controlRef, scale = 1 }) {
  // load GLTF
  const gltf = useLoader(GLTFLoader, "/models/F1.glb");
  const group = useRef();

  useEffect(() => {
    if (!gltf) return;
    // basic material tweaks if needed
    gltf.scene.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material) {
          c.material.depthWrite = true;
          c.material.needsUpdate = true;
        }
      }
    });

    onLoad && onLoad();
    if (controlRef) controlRef.current = group.current;
  }, [gltf, onLoad, controlRef]);

  // If the GLTF doesn't come with correct scale/orientation, you can adjust here:
  // e.g. <primitive object={gltf.scene} scale={[scale,scale,scale]} rotation={[0,Math.PI/2,0]} />
  return (
    <group ref={group}>
      <primitive object={gltf.scene} scale={scale} position={[0, 0, 0]} />
    </group>
  );
}

/* ---------- AutoRotate ---------- */
function AutoRotate({ modelRef, dragging, isMobile }) {
  const speed = isMobile ? 0.1 : 0.03;
  const speedY = isMobile ? 0.12 : 0.07;

  useFrame((_, delta) => {
    const obj = modelRef.current;
    if (!dragging.current && obj) {
      obj.rotation.x += speed * delta;
      obj.rotation.y += speedY * delta;
      obj.rotation.z += speed * delta;
    }
  });
  return null;
}

/* ---------- ThreeDCar (canvas) ---------- */
function ThreeDCar({ show = true }) {
  const [loading, setLoading] = useState(true);
  const modelRef = useRef();
  const dragging = useRef(false);
  const prev = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [modelScale, setModelScale] = useState(1);

  useEffect(() => {
    // preload Inconsolata (kept)
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setModelScale(mobile ? 0.45 : 1.0); // tweak scale for GLB
    };
    onResize();
    window.addEventListener("resize", onResize);

    // when ThreeDCar is visible we prevent body scrolling so the fixed canvas looks full screen
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, [show]);

  const onPointerDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    prev.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    e.preventDefault();
    dragging.current = false;
  };
  const onPointerMove = (e) => {
    if (!dragging.current || !modelRef.current) return;
    e.preventDefault();
    const dx = e.clientX - prev.current.x;
    const dy = e.clientY - prev.current.y;
    // rotate on world axes for intuitive dragging
    modelRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), dx * 0.005);
    modelRef.current.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), dy * 0.005);
    prev.current = { x: e.clientX, y: e.clientY };
  };

  const cameraSettings = isMobile
    ? { position: [0, 0, 900], fov: 18, near: 0.1, far: 5000 }
    : { position: [0, 0, 1200], fov: 10, near: 0.1, far: 5000 };

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
      }}
    >
      {loading && <LoadingScreen />}

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={cameraSettings}
        style={{ width: "100%", height: "100%", pointerEvents: "all" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onCreated={({ gl, scene }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          if (gl.outputColorSpace !== undefined) gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.6;
          scene.background = new THREE.Color(0x000000);
        }}
      >
        <ambientLight intensity={0.12} />
        <directionalLight
          castShadow
          intensity={1.6}
          position={[5, 10, 5]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0005}
        />

        <Suspense
          fallback={null}
        >
          <Environment preset="city" background={false} />
          <Center>
            <InteractiveModel
              onLoad={() => setLoading(false)}
              controlRef={modelRef}
              scale={modelScale}
            />
          </Center>

          <AutoRotate modelRef={modelRef} dragging={dragging} isMobile={isMobile} />
          <ContactShadows
            rotation-x={-Math.PI / 2}
            position={[0, -1, 0]}
            width={20}
            height={20}
            blur={1}
            opacity={0.5}
            far={10}
          />
        </Suspense>

        <EffectComposer multisampling={4}>
          <SSAO samples={31} radius={60000000} intensity={50} luminanceInfluence={0.6} color="black" />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

/* ---------- App (main) ---------- */
export default function App() {
  const [page, setPage] = useState("home"); // 'home' | 'team' | 'schedule' | 'contact' | 'joinus'
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // set topbar height
  const topbarHeight = isMobile ? 120 : 120;
  useEffect(() => {
    document.documentElement.style.setProperty("--topbar-height", `${topbarHeight}px`);
  }, [topbarHeight]);

  const renderContent = () => {
    switch (page) {
      case "home":
        return null; // Home shows the full-screen ThreeDCar canvas
      case "team":
        return <TeamContent />;
      case "joinus":
        return <JoinUsContent />;
      case "schedule":
        return <ScheduleContent />;
      case "contact":
        return <ContactContent />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#000",
        overflowX: "hidden",
        fontFamily: "'Inconsolata', monospace",
        color: "#fff",
      }}
    >
      <TopBar currentPage={page} onNavigate={setPage} />

      {/* 3D canvas only on Home */}
      <ThreeDCar show={page === "home"} />

      {/* Content area below topbar */}
      <div
        style={{
          position: "relative",
          marginTop: "var(--topbar-height, 160px)",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 1200 }}>{renderContent()}</div>
      </div>
    </div>
  );
}
