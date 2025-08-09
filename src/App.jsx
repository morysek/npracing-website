import React, { useEffect, useState, Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import {
  Environment,
  Center,
  ContactShadows,
} from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

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
        paddingTop: 25,
        paddingBottom: 8,
        boxSizing: "border-box",
      }}
    >
      <a
        style={{ display: "block", marginBottom: 24, cursor: "pointer" }}
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
        <NavLink page="schedule">Schedule</NavLink>
        <span style={dotStyle}>•</span>
        <NavLink page="contact">Contact</NavLink>
      </nav>
    </div>
  );
}

function TeamContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1000 }}>
      <h1 style={{ color: "#ffcc00" }}>Team</h1>
      <p>
        The Team
      </p>
      <ul>
        <li>Team Leader: Matěj Prokop</li>
        <li>Engineer: Lukáš Moravec</li>
        <li>Finance manager: Lukáš Martin</li>
        <li>Marketing manager: Veronika Lindová</li>
      </ul>
    </div>
  );
}

function ScheduleContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1000 }}>
      <h1 style={{ color: "#ffcc00" }}>Schedule</h1>
      <p>
        Next up: Poland
      </p>
      <ol>
        <li>Oct 8-10</li>
      </ol>
    </div>
  );
}

function ContactContent() {
  return (
    <div style={{ color: "#fff", padding: 20, maxWidth: 1000 }}>
      <h1 style={{ color: "#ffcc00" }}>Contact</h1>
      <p>For general inquiry: <a style={{ color: "#ffcc00" }} href="mailto:prokopmatej@novyporg.cz">prokopmatej@novyporg.cz</a></p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0,
      width: "100%", height: "100%",
      background: "#000", display: "flex",
      alignItems: "center", justifyContent: "center",
      color: "#ffcc00", fontFamily: "'Inconsolata', monospace",
      fontSize: 13, letterSpacing: 2, zIndex: 1000
    }}>
      <NPLogo size={200} />
      <div style={{ position: "absolute", alignItems: "center", paddingTop: 150 }}>Loading…</div>
    </div>
  );
}

function InteractiveModel({ onLoad, controlRef, scale }) {
  const obj = useLoader(OBJLoader, "/models/F1.obj");
  const group = useRef();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (obj && !initialized) {
      obj.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
          c.material.polygonOffset = true;
          c.material.depthWrite = true;
          c.material.polygonOffsetFactor = 5;
          c.material.polygonOffsetUnits = 5;
          c.material.needsUpdate = true;
        }
      });
      onLoad && onLoad();
      setInitialized(true);
      if (controlRef) controlRef.current = group.current;
    }
  }, [obj, initialized, onLoad, controlRef]);

  return (
    <group ref={group}>
      <primitive object={obj} scale={scale} position={[0, 0, 0.5]} />
    </group>
  );
}

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

function ThreeDCar({ show = true }) {
  const [loading, setLoading] = useState(true);
  const modelRef = useRef();
  const dragging = useRef(false);
  const prev = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [modelScale, setModelScale] = useState(600000);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setModelScale(mobile ? 250000 : 600000);
    };
    onResize();
    window.addEventListener("resize", onResize);
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
    modelRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), dx * 0.005);
    modelRef.current.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), dy * 0.005);
    prev.current = { x: e.clientX, y: e.clientY };
  };

  const cameraSettings = isMobile
    ? { position: [0, 0, modelScale * 0.33], fov: 10, near: 10000, far: 500000 }
    : { position: [0, 0, 200000], fov: 7, near: 10000, far: 500000 };

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
          gl.outputColorSpace = THREE.SRGBColorSpace;
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
          <AutoRotate modelRef={modelRef} dragging={dragging} isMobile={isMobile} />
          <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.5} far={10} />
        </Suspense>

        <EffectComposer multisampling={4}>
          <SSAO samples={31} radius={60000000} intensity={50} luminanceInfluence={0.6} color="black" />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home"); // 'home' | 'team' | 'schedule' | 'contact'
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // topbar height kept in a CSS var used by ThreeDCar and layout
  const topbarHeight = isMobile ? 80 : 60; // tweak to match your TopBar sizing
  useEffect(() => {
    document.documentElement.style.setProperty("--topbar-height", `${topbarHeight}px`);
  }, [topbarHeight]);

  const renderContent = () => {
    switch (page) {
      case "home":
        return null; // Home shows the full-screen ThreeDCar canvas — no extra content here
      case "team":
        return <TeamContent />;
      case "schedule":
        return <ScheduleContent />;
      case "contact":
        return <ContactContent />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      width: "100vw",
      minHeight: "100vh",
      background: "#000",
      overflowX: "hidden",
      fontFamily: "'Inconsolata', monospace",
      color: "#fff",
    }}>
      <TopBar currentPage={page} onNavigate={setPage} />

      {/* 3D canvas only on Home */}
      <ThreeDCar show={page === "home"} />

      {/* Content area below topbar. We push it down using the CSS variable ---topbar-height */}
      <div style={{
        position: "relative",
        marginTop: "var(--topbar-height, 160px)",
        zIndex: 2,
        display: "flex",
        justifyContent: "center",
        padding: "24px 16px",
      }}>
        <div style={{ width: "100%", maxWidth: 1200 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

