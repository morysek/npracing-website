// React single-file scaffold (App.jsx) + accompanying CSS and README
// THIS FILE WAS UPDATED: I read your uploaded PDF and placed the textual content from it into the page components.
// Replace the SVG PLACEHOLDERS below with your full <svg>...</svg> blocks where indicated.

import React from 'react';
import './App.css';

// ----- SVG PLACEHOLDERS (replace these DIVs with your full SVG markup) -----
export const LogoSVG = () => (
  <div className="svg-placeholder" data-name="LogoSVG">{/* PLACEHOLDER: PASTE Logo SVG HERE */}</div>
);
export const ArrowDownPage1 = () => (
  <div className="svg-placeholder" data-name="ArrowDownPage1">{/* PLACEHOLDER: PASTE Sipka dolu (stranka 1) SVG HERE */}</div>
);
export const ArrowDownSmall = ({name='ArrowDownSmall'}) => (
  <div className="svg-placeholder" data-name={name}>{/* PLACEHOLDER: PASTE Sipka doprava dolu (2-6,8) SVG HERE */}</div>
);
export const ArrowLeftDown = () => (
  <div className="svg-placeholder" data-name="ArrowLeftDown">{/* PLACEHOLDER: PASTE Sipka doleva dolu (stranka 7) SVG HERE */}</div>
);
export const ArrowRightBig = () => (
  <div className="svg-placeholder" data-name="ArrowRightBig">{/* PLACEHOLDER: PASTE Sipka doprava (stranka 9) SVG HERE */}</div>
);

// ----- Text content pulled from your uploaded PDF (kept verbatim) -----
// Source: uploaded pdfguide.pdf. See file citation in chat. fileciteturn0file0
const pageText = {
  page1: {
    line1: "Czechia’s only STEM Racing team",
    line2: "Czechia’s only ",
    line3: "STEM Racing ",
    logoText: "NP
Racing",
    scroll: "Scroll",
  },
  page2: {
    heading: "The Team1",
    roles: ["Engineer","Team leader","Communication","Networking"],
  },
  page3: {
    heading: "The Team1",
    role: "Engineer",
    body: `\"Engineers bear great responsibility, as they design
the most complicated and important part of the
STEM Racing project. Here, at NP Racing, this
responsibility rests on one person - Lukáš. Being
an engineer is very hard, since you have to posses
a unique set of skills. You not only have to be very
knowledgeable in the field aerodynamics and CAD
Design, but you also have to be very handy. Their
duty is to make the perfect car and ensure it
doesn’t have any flaws.\"`
  },
  page4: {
    heading: "The Team1",
    role: "Team leader",
    body: `\"A good team leader is essential, when it comes to
creating something special. Not only do they have
to be hardworking, smart and organised, but they
also have to have the instinct to make the correct
decision. That is where Matěj comes in. Not only he
has all the skills needed, but he also doesn’t
hesitate to help where needed.\"`
  },
  page5: {
    heading: "The Team1",
    role: "Communication",
    body: `\"It is very important to always have an overview
about money. Eventhough having the right
knowledge and determination plays a big role in a
succesfull project, nothing can be done without
money. Our finance administrator, Lukáš, dedicated
himself to acquiring resources needed. He reached
out to many companies and evetually secured a
major sponsorship.\"`
  },
  page6: {
    heading: "The Team1",
    role: "Networking",
    body: `\"Marketing is fundamentally the effort to get known.
It is very important to have good marketing, as it
can greatly influence our success. Adam is in
charge of this department and he’s doing
everything in his power to make us known. He
makes entertaining content for our social media,
contributes to the graphic design of our team and
tries to build a solid brand identity.\"`
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
    nextUp: "Next up:
United
Kingdom",
    date: "February 6-7",
    contactNumber: "4",
    contactTitle: "Contact5",
    contactEmail: "prokopmatej@novyporg.cz",
    address: "Pod Krčským Lesem 25, Praha 4",
  }
};

// ----- Typo helper with your Canva parameters -----
function Typo({children, size, as: Component = 'div', weight = 700, lineHeight = 0.84, tracking = -26}) {
  const style = {
    fontFamily: 'HelveticaBold, Helvetica, Arial, sans-serif',
    fontWeight: weight,
    lineHeight: lineHeight,
    // Convert Canva -26 tracking to em: using -0.26em as a close conversion (adjust in CSS if needed)
    letterSpacing: `${(tracking / 100)}em`,
    fontSize: `${size}px`,
    margin: 0,
    whiteSpace: 'pre-line',
  };
  return <Component style={style}>{children}</Component>;
}

// ----- Page components laid out to match mockup flow -----
function Page1(){
  return (
    <section className="page page-1">
      <header className="top-left">
        <LogoSVG />
      </header>
      <div className="hero">
        <Typo as="h1" size={80}>{pageText.page1.line1}</Typo>
        <Typo as="h1" size={100}>{pageText.page1.line3}</Typo>
        <Typo as="p" size={45}>{pageText.page1.logoText}</Typo>
      </div>
      <footer className="page-footer">
        <ArrowDownPage1 />
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
      </div>
      <div className="right-col roles">
        {pageText.page2.roles.map((r,i)=> (
          <Typo as="p" size={60} key={i}>{r}</Typo>
        ))}
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
        <Typo as="h3" size={28}>{data.role}</Typo>
        <Typo as="p" size={28}>{data.body}</Typo>
      </div>
      <div className="nav-arrow"><ArrowDownSmall/></div>
    </section>
  );
}

function Page7(){
  return (
    <section className="page page-7">
      <div className="left-col">
        <Typo as="h1" size={83}>{pageText.page7.heading}</Typo>
      </div>
      <div className="right-col car-text">
        <Typo as="p" size={26}>{pageText.page7.body}</Typo>
      </div>
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
        <Typo as="p" size={28}>{pageText.page8.sub1}</Typo>
        <Typo as="p" size={28}>{pageText.page8.sub2}</Typo>
        <Typo as="p" size={28}>{pageText.page8.sub3}</Typo>
      </div>
      <div className="nav-arrow"><ArrowDownSmall name="arrow-8"/></div>
    </section>
  );
}

function Page9(){
  return (
    <section className="page page-9 schedule">
      <div className="left-col">
        <Typo as="h1" size={70}>{pageText.page9.scheduleTitle}</Typo>
        <Typo as="p" size={20}>{pageText.page9.timer}</Typo>
      </div>
      <div className="center-col">
        <Typo as="h1" size={90}>{pageText.page9.nextUp}</Typo>
        <Typo as="p" size={40}>{pageText.page9.date}</Typo>
      </div>
      <div className="right-col contact">
        <Typo as="h2" size={30}>{pageText.page9.contactTitle}</Typo>
        <Typo as="p" size={28}>{pageText.page9.contactEmail}</Typo>
        <Typo as="p" size={28}>{pageText.page9.address}</Typo>
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

/* ===== App.css (place this in the same folder as App.jsx) =====
   This CSS attempts to match the mockup structure: black blocks, lines and spacing.
   It loads Helvetica from /fonts/helvetica.woff2 which you stated exists in public/fonts/. */

/* Put this CSS content into src/App.css (or keep it inline if you prefer) */

/* App.css content: */

:root{
  --canva-tracking: -0.26em; /* adjust if you want different conversion */
}

@font-face{
  font-family: 'HelveticaBold';
  src: url('/fonts/helvetica.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

*{ box-sizing: border-box; }
html,body,#root{ height:100%; margin:0; }
.app-root{ font-family: 'HelveticaBold', Helvetica, Arial, sans-serif; color:#000; }

.page{ display:flex; padding:96px 88px; min-height:820px; gap:24px; align-items:flex-start; }

/* Shared columns */
.left-col{ flex:1; }
.right-col{ flex:1; }
.center-col{ flex:1; }
.partners-left{ flex:1; }
.partners-right{ flex:1; }

/* Hero on page 1: stacked headings */
.page-1{ background: #fff; position:relative; }
.page-1 .hero{ display:flex; flex-direction:column; gap:8px; }
.page-1 .top-left{ position:absolute; left:88px; top:32px; }

/* black containers and dividing lines (approx from mockup) */
.page-2, .page-team, .page-7, .page-8, .page-9{ background:#fff; }

/* Example of a black block to the right column used for e.g. partners / numbers */
.black-block{ background:#000; color:#fff; padding:24px; }

/* Arrows placeholders styling */
.svg-placeholder{ display:inline-block; border:1px dashed rgba(0,0,0,0.12); padding:8px; min-width:48px; min-height:48px; }

/* Footer area where arrows live */
.page-footer{ display:flex; gap:12px; align-items:center; justify-content:center; margin-top:24px; }

/* Fine tune typography for sizes declared by you */
h1,h2,h3,p{ margin:0; }

/* For responsiveness */
@media (max-width: 1100px){ .page{ flex-direction:column; padding:48px; } }

/* Helpers to make lines and containers for pixel-perfect tuning */
.line{ height:2px; background:#000; margin:16px 0; }
.container-black{ background:#000; color:#fff; padding:20px; }

/* End of App.css */

/* ===== README snippet =====
1) Save this file as src/App.jsx and create src/App.css with the content above.
2) Make sure your Helvetica font file is in public/fonts/helvetica.woff2.
3) Replace each SVG PLACEHOLDER DIV with the exact <svg>...</svg> block you provided earlier.
4) For pixel-perfect alignment, open each PNG from your GitHub repo and tune padding, font-size and --canva-tracking in App.css.

I used the exact text from your uploaded PDF and populated the components accordingly. File source: pdfguide.pdf. fileciteturn0file0
*/// React single-file scaffold (App.jsx) + accompanying CSS and README
// PASTE the full <svg>...</svg> blocks into the placeholders noted below.

/* ===== App.jsx ===== */
import React from 'react';
import './App.css';

// ----- SVG PLACEHOLDERS -----
// Replace the string contents of each const with the FULL <svg>...</svg> markup you provided.
// Example: const LogoSVG = () => (<>{/* paste <svg ...>...</svg> here */}</>);

export const LogoSVG = () => (
  <div className="svg-placeholder" data-name="LogoSVG">{/* PLACEHOLDER: PASTE Logo SVG HERE */}</div>
);

export const ArrowDownPage1 = () => (
  <div className="svg-placeholder" data-name="ArrowDownPage1">{/* PLACEHOLDER: PASTE Sipka dolu (stranka 1) SVG HERE */}</div>
);

export const ArrowDownSmall = ({name='ArrowDownSmall'}) => (
  <div className="svg-placeholder" data-name={name}>{/* PLACEHOLDER: PASTE Sipka doprava dolu (2-6,8) SVG HERE */}</div>
);

export const ArrowLeftDown = () => (
  <div className="svg-placeholder" data-name="ArrowLeftDown">{/* PLACEHOLDER: PASTE Sipka doleva dolu (stranka 7) SVG HERE */}</div>
);

export const ArrowRightBig = () => (
  <div className="svg-placeholder" data-name="ArrowRightBig">{/* PLACEHOLDER: PASTE Sipka doprava (stranka 9) SVG HERE */}</div>
);

// ----- Utility: Text block that respects the Canva typographic rules you listed -----
function Typo({children, size, as: Component = 'div', weight = 700, lineHeight = 0.84, tracking = -26}) {
  // tracking in Canva is "-26" — we're exposing it as CSS variable --tracking which you can tune.
  // In CSS we convert to px/em later; for now we just set inline style using CSS custom properties.
  const style = {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: weight,
    lineHeight: lineHeight,
    // we'll use a conversion: Canva -26 -> -0.26em by default; adjust in App.css if you want exact px
    letterSpacing: `${(tracking / 100)}em`,
    fontSize: `${size}px`,
    margin: 0,
  };
  return <Component style={style}>{children}</Component>;
}

// ----- Pages according to your size specs -----
function Page1() {
  return (
    <section className="page page-1">
      <header className="page-header">
        <LogoSVG />
      </header>

      <main className="page-main">
        <Typo as="h1" size={100}>NADPIS 100</Typo>
        <Typo as="h2" size={80}>Sekundární 80</Typo>
        <Typo as="p" size={45}>Menší text 45</Typo>
      </main>

      <footer className="page-footer">
        <ArrowDownPage1 />
      </footer>
    </section>
  );
}

function Page2() {
  return (
    <section className="page page-2">
      <main>
        <Typo as="h1" size={83}>Nadpis (83)</Typo>
        <Typo as="p" size={60}>Podnadpis (60)</Typo>
      </main>
      <aside className="nav-arrow"><ArrowDownSmall name="arrow-2" /></aside>
    </section>
  );
}

function Page3to6({index}){
  return (
    <section className={`page page-3to6 p-${index}`}>
      <Typo as="h2" size={28}>Sekce {index}</Typo>
      <div className="nav-arrow"><ArrowDownSmall name={`arrow-${index}`} /></div>
    </section>
  );
}

function Page7(){
  return (
    <section className="page page-7">
      <Typo as="h2" size={28}>Sekce 7</Typo>
      <div className="car-info">
        <Typo as="p" size={26}>O autě — text velikost 26</Typo>
      </div>
      <div className="nav-arrow"><ArrowLeftDown /></div>
    </section>
  );
}

function Page8(){
  return (
    <section className="page page-8">
      <Typo as="h1" size={50}>Velký 50</Typo>
      <Typo as="p" size={25}>Menší 25</Typo>
      <div className="nav-arrow"><ArrowDownSmall name="arrow-8" /></div>
    </section>
  );
}

function Page9(){
  return (
    <section className="page page-9">
      <Typo as="h1" size={70}>Hlavní 70</Typo>
      <Typo as="p" size={20}>Malý 20</Typo>
      <Typo as="h2" size={90}>Velký 90</Typo>
      <Typo as="p" size={40}>Střední 40</Typo>
      <Typo as="p" size={30}>Doplňující 30</Typo>
      <div className="nav-arrow"><ArrowRightBig /></div>
    </section>
  );
}

export default function App(){
  return (
    <div className="app-root">
      {/* The layout below is a simple vertical stack of the 9 pages to match the PNG mockup flow. */}
      <Page1 />
      <Page2 />
      <Page3to6 index={3} />
      <Page3to6 index={4} />
      <Page3to6 index={5} />
      <Page3to6 index={6} />
      <Page7 />
      <Page8 />
      <Page9 />
    </div>
  );
}

/* ===== App.css =====

.app-root {
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.page {
  padding: 80px 64px;
  min-height: 820px; /* adjust to match PNG viewport */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header { display:flex; align-items:center; }
.page-main { flex:1; display:flex; flex-direction:column; gap:16px; }
.page-footer { display:flex; justify-content:center; padding-top:32px }

/* Placeholder styling to make it obvious where to paste SVGs */
.svg-placeholder{
  width: fit-content;
  display:inline-block;
  border: 1px dashed rgba(0,0,0,0.12);
  padding: 12px;
  min-width:48px; min-height:48px;
}

/* Utility to make headlines feel like Canva's tight tracking. */
h1,h2,p{ margin:0; }

/* Responsive helpers — you will tune pixel-perfect in your CSS adjustments */
@media (max-width: 1024px){
  .page{ padding: 40px; }
}

/* ===== README (instructions) =====
1) Ve svém projektu vložte tento soubor jako src/App.jsx a přidejte src/App.css podle výše.
2) NA MÍSTA označená komentářem "PLACEHOLDER: PASTE ... SVG HERE" vložte přesně celý <svg>...</svg> blok, který jste mi poskytl.
   - LogoSVG  -> Logo na stránce 1 (vložte celý XML svg blok)
   - ArrowDownPage1 -> Sipka dolu na strance 1
   - ArrowDownSmall -> Sipka doprava dolu pro stranky 2-6 a 8
   - ArrowLeftDown -> Sipka doleva dolu (strana 7)
   - ArrowRightBig -> Sipka doprava (strana 9)
3) Font: použijte Helvetica Bold (pokud nemáte, použijte systémovou Helvetica/Arial a poté v Canva exportu zkontrolujte). V CSS je nastaveno font-weight:700.
4) Typografická pravidla: Canva tracking "-26" jsem ve funkci Typo převedl na letter-spacing: -0.26em. Pokud chcete přesně -26px nebo jiný převod, upravte to v App.css nebo přímo v komponentě Typo.
5) PNG reference: v repozitáři GitHubu máte obrázky 1-9.png; použijte je lokálně pro přesné porovnání a úpravy.

Tip: pro pixel-perfect ladění otevřete paralelně PNG a upravujte paddingy, velikosti písma a letter-spacing v App.css.

*/


/* AUTO-APPEND: TEXT EXTRACTION & ASSET-PLACEMENT INSTRUCTIONS */

/* I attempted to read the mockups (PNG/SVG) from the GitHub repository you mentioned: https://github.com/morysek/githubmrdky. The repository listing was reachable but this environment could not fetch the raw SVG/PNG programmatically. */

/* Please paste the exact textual content of pages 1–9 (or upload the PNGs). Paste full <svg>...</svg> blocks into the SVG placeholders in the file. */

/* PAGE TEXT PLACEHOLDERS: replace these with verbatim page text from your mockups */
/* PAGE 1 */
/* [PASTE PAGE 1 TEXT HERE] */

/* PAGE 2 */
/* [PASTE PAGE 2 TEXT HERE] */

/* PAGE 3 */
/* [PASTE PAGE 3 TEXT HERE] */

/* PAGE 4 */
/* [PASTE PAGE 4 TEXT HERE] */

/* PAGE 5 */
/* [PASTE PAGE 5 TEXT HERE] */

/* PAGE 6 */
/* [PASTE PAGE 6 TEXT HERE] */

/* PAGE 7 */
/* [PASTE PAGE 7 TEXT HERE] */

/* PAGE 8 */
/* [PASTE PAGE 8 TEXT HERE] */

/* PAGE 9 */
/* [PASTE PAGE 9 TEXT HERE] */

/* If you upload the PNGs 1-9.png here I will OCR them and insert the text into the components immediately. */
