import React, { useState, useRef, useEffect } from "react";
import "./App.css";

/* SVG placeholders: zachovat classNamey, nahraď později plnými SVG bloky */
export const LogoSVG = () => (
  <div className="svg-placeholder svg-logo" aria-hidden>
    {/* PLACEHOLDER: PASTE Logo SVG HERE */}
  </div>
);
export const ArrowDownPage1 = () => (
  <div className="svg-placeholder svg-arrow-down-big" aria-hidden>
    {/* PLACEHOLDER: PASTE Sipka dolu (stranka 1) SVG HERE */}
  </div>
);
export const ArrowDownSmall = ({ name = "ArrowDownSmall" }) => (
  <div className="svg-placeholder svg-arrow-small" aria-hidden>
    {/* PLACEHOLDER: PASTE Sipka (small) HERE */}
  </div>
);
export const ArrowLeftDown = () => (
  <div className="svg-placeholder svg-arrow-left-down" aria-hidden>
    {/* PLACEHOLDER: PASTE Sipka left-down HERE */}
  </div>
);
export const ArrowRightBig = () => (
  <div className="svg-placeholder svg-arrow-right-big" aria-hidden>
    {/* PLACEHOLDER: PASTE Sipka right HERE */}
  </div>
);

/* ===== Texty (z PDF) ===== */
const pageText = {
  page1: { line1: "Czechia’s only STEM Racing team", line3: "STEM Racing", logoText: "NP\nRacing", scroll: "Scroll" },
  page2: { heading: "The Team1", roles: ["Engineer", "Team leader", "Communication", "Networking"] },
  page3: { heading: "The Team1", role: "Engineer", body: `Engineers bear great responsibility, as they design
the most complicated and important part of the
STEM Racing project. ...` },
  page4: { heading: "The Team1", role: "Team leader", body: `A good team leader is essential, when it comes to
creating something special. ...` },
  page5: { heading: "The Team1", role: "Communication", body: `It is very important to always have an overview
about money. ...` },
  page6: { heading: "The Team1", role: "Networking", body: `Marketing is fundamentally the effort to get known.
It is very important ...` },
  page7: { heading: "The Car 2", body: `The STEM Racing Professional Class
Car is a precision-engineered ...` },
  page8: { headingMain: "Gold", headingNumber: "Partners3", sub1: "Silver", sub2: "Main partners", sub3: "Secondary partners" },
  page9: { scheduleTitle: "Schedule", timer: "hh:mm:ss", nextUp: `Next up:\nUnited\nKingdom`, date: "February 6-7", contactTitle: "Contact5", contactEmail: "prokopmatej@novyporg.cz", address: "Pod Krčským Lesem 25, Praha 4" }
};

/* ===== Typo helper - nepřepisovat font (použij /public/fonts/helvetica.woff2) ===== */
function Typo({ children, size = 28, as: Component = "div", style = {}, ...rest }) {
  const base = {
    fontFamily: "'HelveticaBold', Helvetica, Arial, sans-serif",
    fontWeight: 700,
    lineHeight: 0.84,
    letterSpacing: "-0.26em",
    fontSize: `${size}px`,
    margin: 0,
    whiteSpace: "pre-line"
  };
  return (
    <Component style={{ ...base, ...style }} {...rest}>
      {children}
    </Component>
  );
}

/* ===== Graphic helpers ===== */
const VerticalRule = ({ height = "100%", width = 4 }) => (
  <div className="vertical-rule" style={{ height, width: `${width}px` }} aria-hidden />
);
const HorizontalRule = ({ thickness = 4, width = "100%" }) => (
  <div className="horizontal-rule" style={{ height: `${thickness}px`, width }} aria-hidden />
);
const BlackPanel = ({ children, width = "240px" }) => (
  <div className="black-panel" style={{ width }}>{children}</div>
);

/* ===== App: interakce pro rozklikávání sekcí (pages 3-6) ===== */
export default function App() {
  // selectedRole: null or index 0..3 mapping to roles Engineer..Networking
  const [selectedRole, setSelectedRole] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // refs to team sections (pages 3-6) for scrollIntoView
  const teamRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]; // indexes 0..3 => pages 3..6

  useEffect(() => {
    // if overlay is opened due to click, scroll to corresponding section as well (optional)
    if (overlayOpen && selectedRole != null) {
      const ref = teamRefs[selectedRole];
      if (ref && ref.current) {
        // smooth scroll to section center
        ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [overlayOpen, selectedRole]);

  const openRole = (idx) => {
    setSelectedRole(idx);
    setOverlayOpen(true);
  };
  const closeOverlay = () => {
    setOverlayOpen(false);
    // keep selectedRole if you want or clear:
    // setSelectedRole(null);
  };

  return (
    <div className="app-root">
      <Page1 />
      <Page2 onRoleClick={openRole} />
      {/* pages 3-6 still exist in flow, but are conceptually variations of page2 */}
      <TeamProfile ref={teamRefs[0]} data={pageText.page3} id="team-3" />
      <TeamProfile ref={teamRefs[1]} data={pageText.page4} id="team-4" />
      <TeamProfile ref={teamRefs[2]} data={pageText.page5} id="team-5" />
      <TeamProfile ref={teamRefs[3]} data={pageText.page6} id="team-6" />
      <Page7 />
      <Page8 />
      <Page9 />

      {/* Overlay detail that appears when clicking a role */}
      {overlayOpen && selectedRole != null && (
        <div className="overlay" role="dialog" aria-modal="true" onClick={closeOverlay}>
          <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
            <button className="overlay-close" onClick={closeOverlay} aria-label="Close">✕</button>
            <Typo as="h1" size={83}>{pageText[`page${3 + selectedRole}`].heading}</Typo>
            <Typo as="h2" size={40} style={{ marginTop: 8 }}>{pageText[`page${3 + selectedRole}`].role}</Typo>
            <HorizontalRule thickness={4} width="80%" />
            <Typo as="p" size={28} style={{ marginTop: 12 }}>{pageText[`page${3 + selectedRole}`].body}</Typo>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Page components ===== */

function Page1() {
  return (
    <section className="page page-1" aria-label="Page 1">
      <header className="top-left"><LogoSVG /></header>
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <Typo as="h1" size={80}>{pageText.page1.line1}</Typo>
            <Typo as="h1" size={100} style={{ marginTop: 6 }}>{pageText.page1.line3}</Typo>
            <div className="hero-label" style={{ marginTop: 18 }}>
              <div className="black-block-inline"><Typo as="p" size={45}>{pageText.page1.logoText}</Typo></div>
            </div>
          </div>
          <aside className="hero-right">
            <VerticalRule height="220px" width={4} />
            <BlackPanel><Typo as="p" size={28}></Typo></BlackPanel>
          </aside>
        </div>
      </div>
      <footer className="page-footer">
        <div className="arrow-wrap"><ArrowDownPage1 /></div>
        <div className="scroll-label"><Typo as="p" size={28}>{pageText.page1.scroll}</Typo></div>
      </footer>
    </section>
  );
}

function Page2({ onRoleClick = () => {} }) {
  return (
    <section className="page page-2" aria-label="Page 2">
      <div className="left-col">
        <Typo as="h1" size={83}>{pageText.page2.heading}</Typo>
        <HorizontalRule thickness={4} width="60%" />
      </div>
      <div className="right-col roles">
        <BlackPanel>
          <div className="roles-inner">
            {pageText.page2.roles.map((r, i) => (
              <button key={r} className="role-button" onClick={() => onRoleClick(i)}>
                <Typo as="p" size={60}>{r}</Typo>
              </button>
            ))}
          </div>
        </BlackPanel>
      </div>
      <div className="nav-arrow"><ArrowDownSmall name="arrow-2" /></div>
    </section>
  );
}

// TeamProfile supports ref forwarding so App can scroll to it
const TeamProfile = React.forwardRef(({ data, id }, ref) => {
  return (
    <section className="page page-team" id={id} ref={ref} aria-label={data.role}>
      <div className="left-col">
        <Typo as="h1" size={83}>{data.heading}</Typo>
      </div>
      <div className="right-col">
        <div className="profile-top">
          <div className="profile-label"><Typo as="p" size={40}>{data.role}</Typo></div>
          <div className="profile-line"><HorizontalRule thickness={4} width="100%" /></div>
        </div>
        <div className="profile-body"><Typo as="p" size={28}>{data.body}</Typo></div>
      </div>
      <div className="nav-arrow"><ArrowDownSmall /></div>
    </section>
  );
});

function Page7() {
  return (
    <section className="page page-7">
      <div className="left-col"><Typo as="h1" size={83}>{pageText.page7.heading}</Typo></div>
      <div className="right-col car-text"><div className="car-text-inner"><Typo as="p" size={26}>{pageText.page7.body}</Typo></div></div>
      <div className="nav-arrow"><ArrowLeftDown /></div>
    </section>
  );
}

function Page8() {
  return (
    <section className="page page-8 partners">
      <div className="partners-left">
        <Typo as="h1" size={50}>{pageText.page8.headingMain}</Typo>
        <Typo as="p" size={25}>{pageText.page8.headingNumber}</Typo>
      </div>
      <div className="partners-right">
        <BlackPanel width={"320px"}>
          <div className="partners-blocks">
            <Typo as="p" size={28}>{pageText.page8.sub1}</Typo>
            <Typo as="p" size={28}>{pageText.page8.sub2}</Typo>
            <Typo as="p" size={28}>{pageText.page8.sub3}</Typo>
          </div>
        </BlackPanel>
      </div>
      <div className="nav-arrow"><ArrowDownSmall name="arrow-8" /></div>
    </section>
  );
}

function Page9() {
  return (
    <section className="page page-9 schedule">
      <div className="left-col">
        <Typo as="h1" size={70}>{pageText.page9.scheduleTitle}</Typo>
        <Typo as="p" size={20}>{pageText.page9.timer}</Typo>
      </div>
      <div className="center-col">
        <div className="nextup-wrap"><Typo as="h1" size={90}>{pageText.page9.nextUp}</Typo></div>
        <Typo as="p" size={40}>{pageText.page9.date}</Typo>
      </div>
      <div className="right-col contact">
        <BlackPanel width={"260px"}>
          <Typo as="h2" size={30}>{pageText.page9.contactTitle}</Typo>
          <Typo as="p" size={28}>{pageText.page9.contactEmail}</Typo>
          <Typo as="p" size={28}>{pageText.page9.address}</Typo>
        </BlackPanel>
      </div>
      <div className="nav-arrow"><ArrowRightBig /></div>
    </section>
  );
}
