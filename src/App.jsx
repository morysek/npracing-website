import React, { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, Center, useGLTF, useProgress } from "@react-three/drei";
import { EffectComposer, SSAO } from "@react-three/postprocessing";

/* ----------------- Helpers ----------------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ----------------- Interactive GLB Model ----------------- */
function InteractiveModel({ progressRef, isMobile }) {
  // load GLB
  const gltf = useGLTF("/models/F1.glb");
  const group = useRef();

  useEffect(() => {
    if (!gltf || !gltf.scene) return;
    // ensure textures use sRGB encoding and tune materials for visible texture
    gltf.scene.traverse((c) => {
      if (c.isMesh && c.material) {
        if (c.material.map) {
          c.material.map.encoding = THREE.sRGBEncoding;
          c.material.map.needsUpdate = true;
        }
        if (c.material.emissiveMap) {
          c.material.emissiveMap.encoding = THREE.sRGBEncoding;
          c.material.emissiveMap.needsUpdate = true;
        }
        // gentle material tuning
        if ("metalness" in c.material) c.material.metalness = c.material.metalness ?? 0.12;
        if ("roughness" in c.material) c.material.roughness = c.material.roughness ?? 0.45;
        c.material.needsUpdate = true;
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
  }, [gltf]);

  useFrame((state) => {
    if (!group.current) return;

    // idle rotation (continual along x,y,z)
    const t = state.clock.getElapsedTime();
    group.current.rotation.x = 0.08 * Math.sin(t * 0.25) + 0.2 * Math.sin(t * 0.13) * 0.02;
    group.current.rotation.y += 0.002 + 0.004 * Math.sin(t * 0.4);
    group.current.rotation.z += 0.001 + 0.003 * Math.cos(t * 0.3);

    // keep same size as "final state" to avoid jumps
    const p = clamp(progressRef.current ?? 1);
    const eased = easeInOutCubic(p);
    const baseScale = isMobile ? 250000 : 600000;
    const mobileScaleFactor = isMobile ? (window.innerWidth / 1200) : 1;
    const finalScale = (0.0001 + eased) * (baseScale / baseScale) * mobileScaleFactor;
    group.current.scale.setScalar(finalScale);
  });

  return <primitive ref={group} object={gltf.scene} position={[0, 0, 0]} />;
}

/* ----------------- Loader Overlay ----------------- */
function LoaderScreen({ visible }) {
  const { active, progress, errors, item, loaded, total } = useProgress();
  // If you prefer external preloading of images, merge that progress into this visible flag.
  if (!visible) return null;
  return (
    <div className="loader-overlay" aria-hidden={!visible}>
      <div className="loader-inner">
        <img src="/images/npbasic.svg" alt="NP Racing" className="loader-logo" />
        <div className="loader-bar">
          <div className="loader-fill" style={{ width: `${Math.round(progress)}%` }} />
        </div>
        <div className="loader-percent">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}

/* ----------------- Main App ----------------- */
export default function App() {
  // fonts injection (Microgramma + Zalando)
  useEffect(() => {
    const id = "__npr_injected_fonts";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.innerHTML = `
      @font-face {
        font-family: 'Microgramma';
        src: url('/fonts/microgramma.woff2') format('woff2');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'ZalandoSans';
        src: url('/fonts/zalando-sans-expanded.woff2') format('woff2');
        font-weight: 300 800;
        font-style: normal;
        font-display: swap;
      }
      html,body,#root { height:100%; background:#0b0b0d; margin:0; }
      body { font-family: 'ZalandoSans', Inter, system-ui, -apple-system, sans-serif; color:#fff; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
      ::-webkit-scrollbar { width:0; height:0; }
      body { scrollbar-width: none; -ms-overflow-style: none; }
    `;
    document.head.appendChild(s);
  }, []);

  // track whether hero is still visible (intro not passed)
  const [heroVisible, setHeroVisible] = useState(true);
  const heroRef = useRef(null);

  // timeline progress (0..1) to indicate "intro" — keep at 1 to avoid jumps later
  const timelineProgressRef = useRef(1); // keep final by default to avoid jumping during content scroll
  // We will not animate the intro now (user asked to cancel main hero animation earlier) — but we keep this to maintain scale/size handling.

  // loading state relies on drei's useProgress; however we also want to wait for images. For simplicity we show loader while useProgress < 100.
  const [showLoader, setShowLoader] = useState(true);

  // IntersectionObserver to watch hero and show small logo when scrolled past
  const [smallLogo, setSmallLogo] = useState(false);
  useEffect(() => {
    const rootMargin = "-1px 0px -80% 0px"; // triggers when hero leaves top of viewport significantly
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setHeroVisible(entry.isIntersecting);
          // if not intersecting -> scrolled past -> show small logo
          setSmallLogo(!entry.isIntersecting);
        });
      },
      { threshold: 0.01, rootMargin }
    );
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  // Keep canvas size stable: we use a wrapper that is fixed while heroVisible, then becomes relative when scrolled past.
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // track GLTF loading progress with drei hook. We'll show LoaderScreen until progress===100.
  // To do that we mount a small component that uses useProgress. For convenience we'll mount a helper that toggles showLoader.
  function ProgressWatcher() {
    const { progress } = useProgress();
    useEffect(() => {
      if (progress >= 100) {
        // small delay so visuals settle
        const t = setTimeout(() => setShowLoader(false), 400);
        return () => clearTimeout(t);
      } else {
        setShowLoader(true);
      }
    }, [progress]);
    return null;
  }

  /* ----------------- logo warp (mouse-driven) ----------------- */
  const logoRef = useRef(null);
  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;
    let raf = 0;
    function onPointerMove(e) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width; // -0.5..0.5 range-ish
      const dy = (e.clientY - cy) / r.height;
      // Map to small tilt/skew values
      el.style.setProperty("--rx", `${(-dy * 8).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(dx * 12).toFixed(2)}deg`);
      el.style.setProperty("--skew", `${(dx * 6).toFixed(2)}deg`);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // small continuous subtle transform applied via CSS variables
      });
    }
    function onLeave() {
      el.style.setProperty("--rx", `0deg`);
      el.style.setProperty("--ry", `0deg`);
      el.style.setProperty("--skew", `0deg`);
    }
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ----------------- content components (Team/Schedule/Join/Contact) ----------------- */
  function TeamContent() {
    return (
      <section id="team" className="section">
        <div className="container">
          <h2 className="title">Team</h2>
          <div className="team-grid">
            <div className="team-text">
              <p className="zig">The Team</p>
              <ul>
                <li>Team Leader: Matěj Prokop</li>
                <li>Engineer: Lukáš Moravec</li>
                <li>Finance manager: Lukáš Martin</li>
                <li>Marketing manager: Veronika Lindová</li>
              </ul>
            </div>
            <div className="team-photos">
              <img src="/images/team1.jpg" alt="team1" />
              <img src="/images/team2.jpg" alt="team2" />
              <img src="/images/team3.jpg" alt="team3" />
            </div>
          </div>

          <h2 className="title" style={{ marginTop: 24 }}>About Us</h2>
          <div>
            <p className="zig">We are the only Czech team and a top contender in the prestigious international STEM racing competition.</p>
            <p className="zig">We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.</p>
            <p className="zig">Founded at Nový PORG, a prestigious school, NP Racing unites skills in engineering, manufacturing, and marketing.</p>
            <p className="zig">We collaborate with partners like the Czech Technical University to enhance our expertise.</p>
          </div>
        </div>
      </section>
    );
  }
  function ScheduleContent() {
    return (
      <section id="schedule" className="section">
        <div className="container">
          <h2 className="title">Schedule</h2>
          <p className="zig">Next up: Poland</p>
          <ol>
            <li>Oct 11</li>
          </ol>
        </div>
      </section>
    );
  }
  function JoinUsContent() {
    return (
      <section id="join" className="section">
        <div className="container">
          <h2 className="title">Join Us</h2>
          <p className="zig">Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>
        </div>
      </section>
    );
  }
  function ContactContent() {
    return (
      <section id="contact" className="section">
        <div className="container">
          <h2 className="title">Contact</h2>
          <p className="zig">For general inquiry: <a className="accent" href="mailto:prokopmatej@novyporg.cz">prokopmatej@novyporg.cz</a></p>
        </div>
      </section>
    );
  }

  /* ----------------- canvas wrapper styles driven by heroVisible ----------------- */
  const canvasWrapperStyle = {
    position: heroVisible ? "fixed" : "relative",
    inset: heroVisible ? 0 : "auto",
    zIndex: 2,
    width: "100%",
    height: heroVisible ? "100vh" : "60vh",
    pointerEvents: "none",
    top: 0,
  };

  return (
    <div className="app-root">
      {/* header with main centered logo (in hero) and small basic logo top-left */}
      <header className="site-header">
        <div className="header-inner">
          <div
            ref={logoRef}
            className={`logo-main-wrap ${heroVisible ? "centered" : "tucked"}`}
            style={{ pointerEvents: "auto" /* for hover interactions */ }}
          >
            <img
              src="/images/np_logo.svg"
              alt="NP Racing"
              className="logo-main"
              style={{ transformOrigin: "center" }}
            />
          </div>

          <nav className="nav">
            <a href="#team">Team</a>
            <a href="#join">Join Us</a>
            <a href="#schedule">Schedule</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>

        {/* small basic top-left logo appears after hero is scrolled past */}
        <img src="/images/npbasic.svg" alt="NP" className={`logo-basic ${smallLogo ? "visible" : ""}`} />
      </header>

      {/* HERO (canvas lives here) */}
      <section ref={heroRef} className="hero-section" style={{ minHeight: "100vh" }}>
        <div style={canvasWrapperStyle}>
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 0, isMobile ? 120000 : 220000], fov: 7, near: 10000, far: 800000 }}
            onCreated={({ gl, scene }) => {
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
              try {
                if (gl.outputColorSpace !== undefined) gl.outputColorSpace = THREE.SRGBColorSpace;
                else gl.outputEncoding = THREE.sRGBEncoding;
              } catch (e) {}
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 0.6;
              scene.background = new THREE.Color(0x0b0b0d);
            }}
            style={{ width: "100%", height: "100%", maxWidth: "100vw" }}
          >
            <ambientLight intensity={0.12} />
            <directionalLight intensity={0.8} position={[10, 20, 10]} color={0xffffff} />
            <directionalLight intensity={0.8} position={[-10, 12, -6]} color={0xffb27a} />

            <Suspense fallback={null}>
              <Environment preset="city" background={false} />
              <Center>
                <InteractiveModel progressRef={timelineProgressRef} isMobile={isMobile} />
              </Center>
              <ContactShadows rotation-x={-Math.PI / 2} position={[0, -1, 0]} width={20} height={20} blur={1} opacity={0.45} far={10} />
            </Suspense>

            <EffectComposer multisampling={4}>
              <SSAO samples={21} radius={60000000} intensity={30} luminanceInfluence={0.6} color="black" />
            </EffectComposer>

            {/* progress watcher toggles loader visibility */}
            <ProgressWatcher />
          </Canvas>
        </div>

        {/* hero overlay copy (headline + CTA) - centered and neonized */}
        <div className={`hero-overlay ${heroVisible ? "visible" : "faded"}`}>
          <div className="hero-inner">
            <h1 className="hero-title">
              NP Racing — <span className="neon">Retro</span> Performance
            </h1>
            <p className="hero-sub">Engineering, design and speed — Czech team competing internationally.</p>
          </div>
        </div>

        {/* loader overlay */}
        <LoaderScreen visible={showLoader} />
      </section>

      {/* CONTENT (keeps canvas height stable) */}
      <main className="site-content" style={{ background: "#0b0b0d" }}>
        <TeamContent />
        <ScheduleContent />
        <JoinUsContent />
        <ContactContent />
        <div style={{ height: 180 }} />
      </main>

      {/* styles (scoped here for convenience) */}
      <style>{`
        /* basic layout */
        .app-root { min-height: 100vh; background: #0b0b0d; color: #fff; }
        .site-header { position: fixed; left: 0; right: 0; top: 0; z-index: 60; pointer-events: none; height: 84px; display:flex; align-items:center; justify-content:center; }
        .header-inner { width:100%; max-width:1300px; padding:12px 24px; display:flex; align-items:center; justify-content:space-between; pointer-events: auto; }
        .nav a { color: rgba(255,255,255,0.7); text-decoration:none; margin-left:18px; font-weight:600; letter-spacing:0.06em; }
        .nav a:hover { color: #ffcc00; }

        /* main branded logo */
        .logo-main-wrap { display:flex; align-items:center; justify-content:center; transition: transform 360ms cubic-bezier(.2,.8,.2,1), filter 220ms ease; will-change: transform, filter; }
        .logo-main { width: ${isMobile ? "220px" : "420px"}; height: auto; display:block; filter: drop-shadow(0 16px 48px rgba(255,204,0,0.06)); transition: transform 220ms ease; transform-origin: center; }
        .logo-main-wrap.centered { transform: translateY(0) scale(1); }
        .logo-main-wrap.tucked { transform: translateY(-14px) scale(0.68); }

        /* warp via CSS variables set by pointer movement */
        .logo-main-wrap { --rx: 0deg; --ry: 0deg; --skew: 0deg; }
        .logo-main-wrap:hover { cursor: pointer; filter: drop-shadow(0 20px 60px rgba(255,204,60,0.08)); }
        .logo-main-wrap:hover .logo-main {
          transform: perspective(600px) rotateX(var(--rx)) rotateY(var(--ry)) skewX(var(--skew)) scale(1.02);
        }

        /* small basic logo top-left */
        .logo-basic { position: fixed; left: 18px; top: 14px; width: 36px; height: auto; opacity: 0; transform: translateY(-6px); transition: all 280ms ease; pointer-events: none; z-index: 100; }
        .logo-basic.visible { opacity: 1; transform: translateY(0); }

        /* hero overlay text */
        .hero-overlay { position: absolute; inset: 0; display:flex; align-items:center; justify-content:center; pointer-events:none; z-index: 20; }
        .hero-overlay.faded { opacity: 0; transition: opacity 320ms ease; }
        .hero-overlay.visible { opacity: 1; transition: opacity 420ms ease 120ms; }
        .hero-inner { text-align:center; max-width: 980px; padding-top: 60px; }
        .hero-title { font-family: 'Microgramma', sans-serif; font-size: clamp(26px, 5vw, 56px); margin: 0; letter-spacing: 0.08em; color: #fff; }
        .hero-title .neon { color:#ffcc00; text-shadow: 0 8px 40px rgba(255,204,0,0.10); }
        .hero-sub { margin-top: 14px; color: rgba(255,255,255,0.78); font-size: 16px; }

        /* content */
        .site-content { position: relative; z-index: 3; background: #070709; }
        .section { padding: 48px 20px; border-top: 1px solid rgba(255,255,255,0.02); }
        .container { max-width: 1300px; margin: 0 auto; }
        .title { color: #ffcc00; font-family: 'Microgramma'; font-size: 28px; margin: 6px 0; }
        .zig { color: #fff; margin: 8px 0; font-family: 'ZalandoSans', Inter, sans-serif; line-height: 1.35; }
        @media (min-width:900px) {
          .zig:nth-of-type(odd) { transform: translateX(-4%); }
          .zig:nth-of-type(even) { transform: translateX(4%); }
        }

        .team-grid { display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap; }
        .team-text { flex:1 1 360px; }
        .team-photos { flex:1 1 420px; display:grid; grid-template-columns: 1fr; gap:12px; }
        .team-photos img { width:100%; height:auto; object-fit:cover; border-radius:8px; max-height:380px; }

        /* loader overlay */
        .loader-overlay { position: fixed; inset: 0; z-index: 99999; display:flex; align-items:center; justify-content:center; background: linear-gradient(180deg, rgba(5,6,8,0.96), rgba(10,10,12,0.96)); }
        .loader-inner { text-align:center; color:#fff; max-width:420px; padding:24px; }
        .loader-logo { width:180px; height:auto; display:block; margin: 0 auto 14px; }
        .loader-bar { width: 320px; height:10px; background: rgba(255,255,255,0.06); border-radius: 8px; overflow:hidden; margin: 8px auto; }
        .loader-fill { height:100%; background: linear-gradient(90deg,#ffcc00,#ffd47a); transition: width 220ms ease; }

        /* ensure canvas never exceeds viewport width */
        canvas { max-width: 100vw !important; display:block; }

        /* responsive tweaks */
        @media (max-width: 768px) {
          .logo-main { width: 260px; }
          .canvas-fixed { position: fixed; inset:0; }
          .team-photos img { max-height: 220px; }
          .hero-inner { padding-top: 30px; }
        }
      `}</style>
    </div>
  );
}

/* ProgressWatcher used inside Canvas to control loader state (must be outside App for React hooks ordering) */
function ProgressWatcher() {
  const { progress } = useProgress();
  useEffect(() => {
    // no op here; App reads progress via this hook through side effect (in our App we used ProgressWatcher inside Canvas)
  }, [progress]);
  return null;
}
