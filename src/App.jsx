import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/layout/Navbar";
import { Hero } from "@/sections/Hero";
import { Projects } from "@/sections/Projects";
import { Experience } from "@/sections/Experience";
import { Contact } from "@/sections/Contact";
import { Photography } from "@/pages/Photography";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageBackground } from "@/components/PageBackground";
import { PageDots } from "@/components/PageDots";

function Portfolio() {
  return (
    <main>
      <Hero />
      <Experience />
      <Projects />
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
    </BrowserRouter>
  );
}

export default App;
