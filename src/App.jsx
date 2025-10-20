// File: src/App.jsx
import React from 'react';
import './App.css';


export default function App() {
// create 5 identical pages for testing
const pages = Array.from({ length: 5 });


return (
<div className="App">
{pages.map((_, i) => (
<section key={i} className={`page`}>
{/* Inner box contains ALL content now */}
<div className="inner">
{/* Text windows placed inside the inner box */}
<div className="text text--one" aria-hidden>
NP<br />Racing
</div>


<div className="text text--two">
Czechia's only<br />STEM Racing<br />team
</div>


{/* Placeholder SVG 1: bottom-right, height = 1/3 of viewport, width = viewport/1.3 */}
<svg
className="placeholder placeholder--one"
viewBox="0 0 100 100"
preserveAspectRatio="none"
aria-hidden
>
<rect x="0" y="0" width="100" height="100" />
</svg>


{/* Placeholder SVG 2: bottom-left, height = 120% of placeholder1 height, width = height * 2.1 */}
<svg
className="placeholder placeholder--two"
viewBox="0 0 100 100"
preserveAspectRatio="none"
aria-hidden
>
<rect x="0" y="0" width="100" height="100" />
</svg>


{/* Third text aligned to the top-left of placeholder one */}
<div className="text text--three">Scroll</div>


{/* Black 3px line positioned 1/30 of the site below the first text */}
<div className="line" aria-hidden />
</div>
</section>
))}
</div>
);
}
