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
Czechia's only<br />STEM Racing<br />Team
</div>


<div className="text text--three" aria-hidden>
{/* intentionally left blank */}
</div>
</div>
</section>
))}
</div>
);
}
