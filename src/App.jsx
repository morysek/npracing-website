import React, { useState, useRef, useEffect } from "react";
import "./App.css";

/* ------------------------
   SVG placeholders (replace contents with full <svg>...</svg> when ready)
   ------------------------ */
export const LogoSVG = () => (
  <div className="svg-placeholder svg-logo" aria-hidden>
    {/* PLACEHOLDER: paste full <svg>Logo...</svg> here */}
  </div>
);

export const ArrowDownPage1 = () => (
  <div className="svg-placeholder svg-arrow-down-big" aria-hidden>
    {/* PLACEHOLDER: paste full <svg>ArrowDownPage1...</svg> here */}
  </div>
);

export const ArrowDownSmall = ({ name = "ArrowDownSmall" }) => (
  <div className="svg-placeholder svg-arrow-small" aria-hidden>
    {/* PLACEHOLDER: paste full <svg>ArrowDownSmall...</svg> here */}
  </div>
);

export const ArrowLeftDown = () => (
  <div className="svg-placeholder svg-arrow-left-down" aria-hidden>
    {/* PLACEHOLDER: paste full <svg>ArrowLeftDown...</svg> here */}
  </div>
);

export const ArrowRightBig = () => (
  <div className="svg-placeholder svg-arrow-right-big" aria-hidden>
    {/* PLACEHOLDER: paste full <svg>ArrowRightBig...</svg> here */}
  </div>
);

/* ------------------------
   Content (from your uploaded PDF / mockup)
   Use template literals for multi-line bodies so newlines are preserved.
   ------------------------ */
const pageText = {
  page1: {
    line1: "Czechia’s only STEM Racing team",
    line3: "STEM Racing",
    logoText: `NP
Racing`,
    scroll: "Scroll",
  },
  page2: {
    heading: "The Team1",
    roles: ["Engineer", "Team leader", "Communication", "Networking"],
  },
  page3: {
    heading: "The Team1",
    role: "Engineer",
    body: `Engineers bear great responsibility, as they design
the most complicated and important part of the
STEM Racing project. Here, at NP Racing, this
responsibility rests on one person - Lukáš. Being
an engineer is very hard, since you have to posses
a unique set of skills. You not only have to be very
knowledgeable in the field aerodynamics and CAD
Design, but you also have to be very handy. Their
duty is to make the perfect car and ensure it
doesn’t have any flaws.`,
  },
  page4: {
    heading: "The Team1",
    role: "Team leader",
    body: `A good team leader is essential, when it comes to
creating something special. Not only do they have
to be hardworking, smart and organised, but they
also have to have the instinct to make the correct
decision. That is where Matěj comes in. Not only he
has all the skills needed, but he also doesn’t
hesitate to help where needed.`,
  },
  page5: {
    heading: "The Team1",
    role: "Communication",
    body: `It is very important to always have an overview
about money. Eventhough having the right
knowledge and determination plays a big role in a
succesfull project, nothing can be done without
money. Our finance administrator, Lukáš, dedicated
himself to acquiring resources needed. He reached
out to many companies and evetually secured a
major sponsorship.`,
  },
  page6: {
    heading: "The Team1",
    role: "Networking",
    body: `Marketing is fundamentally the effort to get known.
It is very important to have good marketing, as it
can greatly influence our success. Adam is in
charge of this department and he’s doing
everything in his power to make us known. He
makes entertaining content for our social media,
contributes to the graphic design of our team and
tries to build a solid brand identity.`,
  },
  page7: {
    heading: "The Car 2",
    body: `The STEM Racing Professional Class
Car is a precision-engineered
machine where science meets speed.
Every component is optimized
through data-driven design—
aerodynamic contours sculpted by
computational fluid dynamics. Built
to demonstrate the fusion of
engineering disciplines—mechanical,
and computational—it’s not just a
car; it’s a rolling laboratory. Each lap
is an experiment, a test of physics,
teamwork, and innovation. This is
STEM in motion—where theory hits
the track and innovation takes the
checkered flag.`,
  },
  page8: {
    headingMain: "Gold",
    headingNumber: "Partners3",
    sub1: "Silver",
    sub2: "Main partners",
    sub3: "Secondary partners",
  },
  page9: {
    scheduleTitle: "Schedule",
    timer: "hh:mm:ss",
    nextUp: `Next up
United
Kingdom`,
    date: "February 6-7",
    contactTitle: "Contact5",
    contactEmail: "prokopmatej@novyporg.cz",
    address: "Pod Krčským Lesem 25, Praha 4",
  },
};

/* ------------------------
   Typo helper — do not set inline fontSize here; CSS controls sizes.
   Keeps Helvetica from public/fonts/helvetica.woff2 untouched.
   ------------------------ */
function Typo({ children, as: Component = "div", style = {}, className = "", ...rest }) {
  const base = {
    fontFamily: "'HelveticaBold', Helvetica, Arial, sans-serif",
    fontWeight: 700,
    lineHeight: 0.84,
    letterSpacing: "-0.26em",
    margin: 0,
    whiteSpace: "pre-line",
  };
  return (
    <Component className={className} style={{ ...base, ...style }} {...rest}>
      {children}
    </Component>
  );
}

/* ------------------------
   Graphic helpers for CSS shapes (kept semantic)
   ------------------------ */
const VerticalRule = ({ height = "100%", width = 4 }) => (
  <div className="vertical-rule" style={{ height, width: `${width}px` }} aria-hidden />
);

const HorizontalRule = ({ thickness = 4, width = "100%" }) => (
  <div className="horizontal-rule" style={{ height: `${thickness}px`, width }} aria-hidden />
);

const BlackPanel = ({ children, width = "240px" }) => (
  <div className="black-panel" style={{ width }}>{children}</div>
);

/* ------------------------
   Page1 (CSS-drawn lines + black containers, no SVG embedding)
   ------------------------ */
function Page1() {
  return (
    <section className="page page-1" aria-label="Page 1">
      <div className="page1-content">
        <header className="top-left">
          <LogoSVG />
        </header>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-left">
              <Typo as="h1" className="p1-h1-1">
                {pageText.page1.line1}
              </Typo>

              <Typo as="h1" className="p1-h1-2">
                {pageText.page1.line3}
              </Typo>

              <div className="hero-label">
                <div className="black-block-inline">
                  <Typo as="p" className="p1-label">
                    {pageText.page1.logoText}
                  </Typo>
                </div>
              </div>

              <div className="p1-sep-wrap">
                <div className="p1-horizontal-rule" aria-hidden />
              </div>
            </div>

            <aside className="hero-right" aria-hidden>
              <div className="hero-right-inner">
                <div className="p1-vertical-rule" />
                <div className="p1-black-card" aria-hidden>
                  <span className="p1-black-card-inner" />
                </div>
              </div>
            </aside>
          </div>
        </div>

        <footer className="page-footer">
          <div className="arrow-wrap">
            <ArrowDownPage1 />
          </div>
          <div className="scroll-label">
            <Typo as="p" className="p1-scroll">
              {pageText.page1.scroll}
            </Typo>
          </div>
        </footer>
      </div>
    </section>
  );
}

/* ------------------------
   Page2 and role interactions (open overlay, scroll to section)
   ------------------------ */
function Page2({ onRoleClick = () => {} }) {
  return (
    <section className="page page-2" aria-label="Page 2">
      <div className="left-col">
        <Typo as="h1">{pageText.page2.heading}</Typo>
        <HorizontalRule thickness={4} width="60%" />
      </div>

      <div className="right-col roles">
        <BlackPanel>
          <div className="roles-inner">
            {pageText.page2.roles.map((r, i) => (
              <button key={r} className="role-button" onClick={() => onRoleClick(i)}>
                <Typo as="p" className="role-text">
                  {r}
                </Typo>
              </button>
            ))}
          </div>
        </BlackPanel>
      </div>

      <div className="nav-arrow">
        <ArrowDownSmall name="arrow-2" />
      </div>
    </section>
  );
}

/* TeamProfile supports forwarding refs so App can scroll to it */
const TeamProfile = React.forwardRef(({ data, id }, ref) => {
  return (
    <section className="page page-team" id={id} ref={ref} aria-label={data.role}>
      <div className="left-col">
        <Typo as="h1">{data.heading}</Typo>
      </div>
      <div className="right-col">
        <div className="profile-top">
          <div className="profile-label">
            <Typo as="p" className="profile-role">
              {data.role}
            </Typo>
          </div>
          <div className="profile-line">
            <HorizontalRule thickness={4} width="100%" />
          </div>
        </div>
        <div className="profile-body">
          <Typo as="p">{data.body}</Typo>
        </div>
      </div>
      <div className="nav-arrow">
        <ArrowDownSmall />
      </div>
    </section>
  );
});

/* Page7/8/9 simple renderers */
function Page7() {
  return (
    <section className="page page-7" aria-label="Page 7">
      <div className="left-col">
        <Typo as="h1">{pageText.page7.heading}</Typo>
      </div>
      <div className="right-col car-text">
        <div className="car-text-inner">
          <Typo as="p">{pageText.page7.body}</Typo>
        </div>
      </div>
      <div className="nav-arrow">
        <ArrowLeftDown />
      </div>
    </section>
  );
}

function Page8() {
  return (
    <section className="page page-8 partners" aria-label="Page 8">
      <div className="partners-left">
        <Typo as="h1">{pageText.page8.headingMain}</Typo>
        <Typo as="p">{pageText.page8.headingNumber}</Typo>
      </div>
      <div className="partners-right">
        <BlackPanel width={"320px"}>
          <div className="partners-blocks">
            <Typo as="p">{pageText.page8.sub1}</Typo>
            <Typo as="p">{pageText.page8.sub2}</Typo>
            <Typo as="p">{pageText.page8.sub3}</Typo>
          </div>
        </BlackPanel>
      </div>
      <div className="nav-arrow">
        <ArrowDownSmall name="arrow-8" />
      </div>
    </section>
  );
}

function Page9() {
  return (
    <section className="page page-9 schedule" aria-label="Page 9">
      <div className="left-col schedule-left">
        <Typo as="h1">{pageText.page9.scheduleTitle}</Typo>
        <Typo as="p">{pageText.page9.timer}</Typo>
      </div>

      <div className="center-col schedule-center">
        <div className="nextup-wrap">
          <Typo as="h1">{pageText.page9.nextUp}</Typo>
        </div>
        <Typo as="p">{pageText.page9.date}</Typo>
      </div>

      <div className="right-col contact">
        <BlackPanel width={"260px"}>
          <Typo as="h2">{pageText.page9.contactTitle}</Typo>
          <Typo as="p">{pageText.page9.contactEmail}</Typo>
          <Typo as="p">{pageText.page9.address}</Typo>
        </BlackPanel>
      </div>

      <div className="nav-arrow">
        <ArrowRightBig />
      </div>
    </section>
  );
}

/* ------------------------
   App: handles overlay & scrolling to team sections (pages 3-6)
   ------------------------ */
export default function App() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const teamRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (overlayOpen && selectedRole != null) {
      const r = teamRefs[selectedRole];
      if (r && r.current) {
        r.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [overlayOpen, selectedRole]);

  const openRole = (idx) => {
    setSelectedRole(idx);
    setOverlayOpen(true);
  };

  const closeOverlay = () => {
    setOverlayOpen(false);
  };

  return (
    <div className="app-root">
      <Page1 />
      <Page2 onRoleClick={openRole} />
      <TeamProfile ref={teamRefs[0]} data={pageText.page3} id="team-3" />
      <TeamProfile ref={teamRefs[1]} data={pageText.page4} id="team-4" />
      <TeamProfile ref={teamRefs[2]} data={pageText.page5} id="team-5" />
      <TeamProfile ref={teamRefs[3]} data={pageText.page6} id="team-6" />
      <Page7 />
      <Page8 />
      <Page9 />

      {overlayOpen && selectedRole != null && (
        <div className="overlay" role="dialog" aria-modal="true" onClick={closeOverlay}>
          <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
            <button className="overlay-close" onClick={closeOverlay} aria-label="Close">
              ✕
            </button>
            <Typo as="h1" style={{ marginBottom: 8 }}>
              {pageText[`page${3 + selectedRole}`].heading}
            </Typo>
            <Typo as="h2" style={{ marginBottom: 12 }}>
              {pageText[`page${3 + selectedRole}`].role}
            </Typo>
            <HorizontalRule thickness={4} width="80%" />
            <div style={{ marginTop: 12 }}>
              <Typo as="p">{pageText[`page${3 + selectedRole}`].body}</Typo>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
