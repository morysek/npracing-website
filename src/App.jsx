import React, { useEffect, useRef, useState } from "react";
import "./App.css"; // we'll include CSS below (or paste into global CSS)

function Header({ smallLogoVisible }) {
  return (
    <header className={`site-header ${smallLogoVisible ? "shrink" : ""}`}>
      <div className="header-inner">
        <div className="logo-wrap">
          <img src="/images/np_logo.svg" alt="NP Racing" className="logo-main" />
        </div>
        <nav className="nav">
          <a href="#work">Work</a>
          <a href="#team">Team</a>
          <a href="#join">Join Us</a>
          <a href="#schedule">Schedule</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>

      {/* small top-left basic logo that appears after hero fades */}
      <img src="/images/npbasic.svg" alt="NP" className={`logo-basic ${smallLogoVisible ? "visible" : ""}`} />
    </header>
  );
}

function Hero({ onScrolledPast, smallLogoVisible, setSmallLogoVisible }) {
  const heroRef = useRef();

  useEffect(() => {
    // observe when user scrolls past the hero area
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) {
            // scrolled past
            setSmallLogoVisible(true);
            onScrolledPast && onScrolledPast(true);
          } else {
            setSmallLogoVisible(false);
            onScrolledPast && onScrolledPast(false);
          }
        });
      },
      { root: null, threshold: 0.01 }
    );
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, [onScrolledPast, setSmallLogoVisible]);

  return (
    <section ref={heroRef} className="hero">
      <div className="hero-inner">
        <h1 className="headline">
          We create <span className="accent">difference</span> that delivers
        </h1>
        <p className="sub">We build brands that perform and performance that amplifies brands.</p>
        <div className="hero-cta">
          <a href="#team" className="cta">Explore Team</a>
        </div>
        {/* accent client row (replace or extend) */}
        <div className="clients-row">
          <div className="client">Featured in:</div>
          <div className="client-logos">
            {/* example placeholders — swap with actual client logos if desired */}
            <div className="client-logo">AdAge</div>
            <div className="client-logo">Forbes</div>
            <div className="client-logo">FastCo</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Content sections (Team, Schedule, JoinUs, Contact) — uses your TeamContent etc. */
function TeamContent() {
  return (
    <div id="team" className="section container">
      <h2 className="section-title">Team</h2>
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

      <h3 className="section-title">About Us</h3>
      <div className="about">
        <p className="zig">We are the only Czech team and a top contender in the prestigious international STEM racing competition.</p>
        <p className="zig">We combine technical expertise, innovative design, and teamwork to develop high-performance race car models.</p>
        <p className="zig">Founded at Nový PORG, a prestigious school, NP Racing unites skills in engineering, manufacturing, and marketing.</p>
        <p className="zig">We collaborate with partners like the Czech Technical University to enhance our expertise.</p>
      </div>
    </div>
  );
}

function ScheduleContent() {
  return (
    <div id="schedule" className="section container">
      <h2 className="section-title">Schedule</h2>
      <p className="zig">Next up: Poland</p>
      <ol>
        <li>Oct 11</li>
      </ol>
    </div>
  );
}

function JoinUsContent() {
  return (
    <div id="join" className="section container">
      <h2 className="section-title">Join Us</h2>
      <p className="zig">Want to have the chance to compete for a scholarship in a prestigious Formula One-backed competition? Contact us!</p>
    </div>
  );
}

function ContactContent() {
  return (
    <div id="contact" className="section container">
      <h2 className="section-title">Contact</h2>
      <p className="zig">For general inquiry: <a className="accent-link" href="mailto:prokopmatej@novyporg.cz">prokopmatej@novyporg.cz</a></p>
    </div>
  );
}

export default function App() {
  const [smallLogoVisible, setSmallLogoVisible] = useState(false);

  // prevent scroll until "loaded" — simple simulated loader; replace with real loader if desired
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 700); // tiny simulated delay
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`site-wrap ${loaded ? "loaded" : "loading"}`}>
      <Header smallLogoVisible={smallLogoVisible} />
      <main>
        <Hero onScrolledPast={() => {}} smallLogoVisible={smallLogoVisible} setSmallLogoVisible={setSmallLogoVisible} />

        {/* IMPORTANT: put the 3D canvas or animation below the hero if you have it; for now hero covers full-viewport */}
        <section className="canvas-placeholder">
          {/* If you want the actual 3D Canvas, mount it here (react-three-fiber) and style to match */}
          <div className="canvas-faux">3D Model area (replace with Canvas)</div>
        </section>

        {/* content sections */}
        <TeamContent />
        <ScheduleContent />
        <JoinUsContent />
        <ContactContent />
      </main>

      {!loaded && (
        <div className="global-loader">
          <div className="loader-inner">
            <img src="/images/np_logo.svg" alt="loading logo" className="loader-logo" />
            <div className="loader-bar" />
            <div style={{marginTop:12}}>Loading…</div>
          </div>
        </div>
      )}
    </div>
  );
}
