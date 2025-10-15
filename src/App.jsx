// React single-file scaffold (App.jsx) + accompanying CSS and README
// UPDATED: fine-tuned layout & graphics (lines, black containers) for pages 1–9
// NOTE: Keep CSS in src/App.css (separate file). This canvas file contains the React code and guidance only.

import React from 'react';
import './App.css';

/* ===== SVG PLACEHOLDERS =====
   Replace the content of each .svg-placeholder DIV with the exact <svg>...</svg> markup.
   - LogoSVG: logo for page1 (top-left)
   - ArrowDownPage1: big arrow for page1 footer
   - ArrowDownSmall: small arrow used across pages 2-6 and 8
   - ArrowLeftDown: arrow for page7
   - ArrowRightBig: arrow for page9
*/
export const LogoSVG = () => (
  <div className="svg-placeholder" data-name="LogoSVG" aria-hidden>
    {/* PLACEHOLDER: PASTE Logo SVG HERE */}
  </div>
);
export const ArrowDownPage1 = () => (
  <div className="svg-placeholder" data-name="ArrowDownPage1" aria-hidden>
    {/* PLACEHOLDER: PASTE Sipka dolu (stranka 1) SVG HERE */}
  </div>
);
export const ArrowDownSmall = ({name='ArrowDownSmall'}) => (
  <div className="svg-placeholder" data-name={name} aria-hidden>
    {/* PLACEHOLDER: PASTE Sipka doprava dolu (stranky 2-6,8) SVG HERE */}
  </div>
);
export const ArrowLeftDown = () => (
  <div className="svg-placeholder" data-name="ArrowLeftDown" aria-hidden>
    {/* PLACEHOLDER: PASTE Sipka doleva dolu (stranka 7) SVG HERE */}
  </div>
);
export const ArrowRightBig = () => (
  <div className="svg-placeholder" data-name="ArrowRightBig" aria-hidden>
    {/* PLACEHOLDER: PASTE Sipka doprava (stranka 9) SVG HERE */}
  </div>
);

/* ===== Text content (from uploaded PDF) ===== */
const pageText = {
  page1: { line1: "Czechia’s only STEM Racing team", line2: "Czechia’s only ", line3: "STEM Racing ", logoText: "NP\nRacing", scroll: "Scroll" },
  page2: { heading: "The Team1", roles: ["Engineer","Team leader","Communication","Networking"] },
  page3: { heading: "The Team1", role: "Engineer", body: `"Engineers bear great responsibility, as they design
the most complicated and important part of the
STEM Racing project. Here, at NP Racing, this
responsibility rests on one person - Lukáš. Being
an engineer is very hard, since you have to posses
a unique set of skills. You not only have to be very
knowledgeable in the field aerodynamics and CAD
Design, but you also have to be very handy. Their
duty is to make the perfect car and ensure it
doesn’t have any flaws."` },
  page4: { heading: "The Team1", role: "Team leader", body: `"A good team leader is essential, when it comes to
creating something special. Not only do they have
to be hardworking, smart and organised, but they
also have to have the instinct to make the correct
decision. That is where Matěj comes in. Not only he
has all the skills needed, but he also doesn’t
hesitate to help where needed."` },
  page5: { heading: "The Team1", role: "Communication", body: `"It is very important to always have an overview
about money. Eventhough having the right
knowledge and determination plays a big role in a
succesfull project, nothing can be done without
money. Our finance administrator, Lukáš, dedicated
himself to acquiring resources needed. He reached
out to many companies and evetually secured a
major sponsorship."` },
  page6: { heading: "The Team1", role: "Networking", body: `"Marketing is fundamentally the effort to get known.
It is very important to have good marketing, as it
can greatly influence our success. Adam is in
charge of this department and he’s doing
everything in his power to make us known. He
makes entertaining content for our social media,
contributes to the graphic design of our team and
tries to build a solid brand identity."` },
  page7: { heading: "The Car 2", body: `The STEM Racing Professional Class
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
checkered flag.` },
  page8: { headingMain: "Gold", headingNumber: "Partners3", sub1: "Silver", sub2: "Main partners", sub3: "Secondary partners" },
  page9: { scheduleTitle: "Schedule", timer: "hh:mm:ss", nextUp: `Next up:\nUnited\nKingdom`, date: "February 6-7", contactNumber: "4", contactTitle: "Contact5", contactEmail: "prokopmatej@novyporg.cz", address: "Pod Krčským Lesem 25, Praha 4" },
};

/* ===== Typo helper (applies Canva params) ===== */
function Typo({children, size, as: Component='div', weight=700, lineHeight=0.84, tracking=-26}){
  const style = {
    fontFamily: 'HelveticaBold, Helvetica, Arial, sans-serif',
    fontWeight: weight,
    lineHeight: lineHeight,
    letterSpacing: `${tracking/100}em`,
    fontSize: `${size}px`,
    margin:0,
    whiteSpace: 'pre-line'
  };
  return <Component style={style}>{children}</Component>;
}

/* ===== Structural helper components for graphics (lines, black rails) ===== */
const VerticalRule = ({height='100%', width=6, offset=0}) => (
  <div className="vertical-rule" style={{height, width: `${width}px`, right: offset}} aria-hidden />
);
const HorizontalRule = ({thickness=4, width='100%'}) => (
  <div className="horizontal-rule" style={{height: `${thickness}px`, width}} aria-hidden />
);
const BlackPanel = ({children, width='240px', height='auto'}) => (
  <div className="black-panel" style={{width}}>{children}</div>
);

/* ===== Page components (fine tuned with additional graphic elements) ===== */
function Page1(){
  return (
    <section className="page page-1" aria-label="Page 1">
      <header className="top-left">
        <LogoSVG />
      </header>

      <div className="hero" role="region">
        <div className="hero-inner">
          <div className="hero-left">
            <Typo as="h1" size={80}>{pageText.page1.line1}</Typo>
            <Typo as="h1" size={100} style={{marginTop:6}}>{pageText.page1.line3}</Typo>
            <div className="hero-label" style={{marginTop:18}}>
              <div className="black-block-inline"><Typo as="p" size={45}>{pageText.page1.logoText}</Typo></div>
            </div>
          </div>

          <aside className="hero-right">
            <VerticalRule height="220px" width={4} />
            <BlackPanel>
              <Typo as="p" size={28}>{/* number or short text */}</Typo>
            </BlackPanel>
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

function Page2(){
  return (
    <section className="page page-2">
      <div className="left-col">
        <Typo as="h1" size={83}>{pageText.page2.heading}</Typo>
        <HorizontalRule thickness={4} width="60%" />
      </div>
      <div className="right-col roles">
        <BlackPanel>
          <div className="roles-inner">
            {pageText.page2.roles.map((r,i)=>(<Typo as="p" size={60} key={i}>{r}</Typo>))}
          </div>
        </BlackPanel>
      </div>

      <div className="nav-arrow"><ArrowDownSmall name="arrow-2"/></div>
    </section>
  );
}

function TeamProfile({data}){
  return (
    <section className="page page-team">
      <div className="left-col">
        <Typo as="h1" size={83}>{data.heading}</Typo>
      </div>
      <div className="right-col">
        <div className="profile-top">
          <div className="profile-label"><Typo as="p" size={40}>{data.role}</Typo></div>
          <div className="profile-line"><HorizontalRule thickness={4} width="100%"/></div>
        </div>
        <div className="profile-body"><Typo as="p" size={28}>{data.body}</Typo></div>
      </div>
      <div className="nav-arrow"><ArrowDownSmall/></div>
    </section>
  );
}

function Page7(){
  return (
    <section className="page page-7">
      <div className="left-col"><Typo as="h1" size={83}>{pageText.page7.heading}</Typo></div>
      <div className="right-col car-text"><div className="car-text-inner"><Typo as="p" size={26}>{pageText.page7.body}</Typo></div></div>
      <div className="nav-arrow"><ArrowLeftDown/></div>
    </section>
  );
}

function Page8(){
  return (
    <section className="page page-8 partners">
      <div className="partners-left">
        <Typo as="h1" size={50}>{pageText.page8.headingMain}</Typo>
        <Typo as="p" size={25}>{pageText.page8.headingNumber}</Typo>
      </div>
      <div className="partners-right">
        <BlackPanel width={'320px'}>
          <div className="partners-blocks">
            <Typo as="p" size={28}>{pageText.page8.sub1}</Typo>
            <Typo as="p" size={28}>{pageText.page8.sub2}</Typo>
            <Typo as="p" size={28}>{pageText.page8.sub3}</Typo>
          </div>
        </BlackPanel>
      </div>
      <div className="nav-arrow"><ArrowDownSmall name="arrow-8"/></div>
    </section>
  );
}

function Page9(){
  return (
    <section className="page page-9 schedule">
      <div className="left-col schedule-left">
        <Typo as="h1" size={70}>{pageText.page9.scheduleTitle}</Typo>
        <Typo as="p" size={20}>{pageText.page9.timer}</Typo>
      </div>
      <div className="center-col schedule-center">
        <div className="nextup-wrap"><Typo as="h1" size={90}>{pageText.page9.nextUp}</Typo></div>
        <Typo as="p" size={40}>{pageText.page9.date}</Typo>
      </div>
      <div className="right-col contact">
        <BlackPanel width={'260px'}>
          <Typo as="h2" size={30}>{pageText.page9.contactTitle}</Typo>
          <Typo as="p" size={28}>{pageText.page9.contactEmail}</Typo>
          <Typo as="p" size={28}>{pageText.page9.address}</Typo>
        </BlackPanel>
      </div>
      <div className="nav-arrow"><ArrowRightBig/></div>
    </section>
  );
}

export default function App(){
  return (
    <div className="app-root">
      <Page1 />
      <Page2 />
      <TeamProfile data={pageText.page3} />
      <TeamProfile data={pageText.page4} />
      <TeamProfile data={pageText.page5} />
      <TeamProfile data={pageText.page6} />
      <Page7 />
      <Page8 />
      <Page9 />
    </div>
  );
}

/* ===== Instructions: create / update src/App.css with the CSS below =====
   (I will also paste the CSS content into the canvas README so you can copy it verbatim.)
*/
