import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Navbar } from "@/layout/Navbar";
import { Hero } from "@/sections/Hero";
import { Experience } from "@/sections/Experience";
import { Skills } from "@/sections/Skills";
import { Projects } from "@/sections/Projects";
import { Contact } from "@/sections/Contact";
import { Photography } from "@/pages/Photography";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageBackground } from "@/components/PageBackground";
import { PageDots } from "@/components/PageDots";

function Portfolio() {
  return (
    <main>
      <Hero />
      <Projects />
      <Experience />
      <Skills />
      <Contact />
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageBackground />
      <div className="relative min-h-screen overflow-x-hidden">
        <PageDots />
        <Navbar />
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/photography" element={<Photography />} />
        </Routes>
      </div>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
