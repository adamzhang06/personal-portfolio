import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SiteShell } from "@/components/SiteShell";
import { LegacyPhotoLayout } from "@/components/LegacyPhotoLayout";
import { Home } from "@/pages/Home";
import { About } from "@/pages/About";
import { Projects } from "@/pages/Projects";
import { ProjectCase } from "@/pages/ProjectCase";
import { Roles } from "@/pages/Roles";
import { Contact } from "@/pages/Contact";
import { PhotosPage } from "@/pages/PhotosPage";
import { PHOTOGRAPHY_ENABLED } from "@/data/site";
import { Photography } from "@/pages/Photography";
import { Portraits } from "@/pages/Portraits";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LegacyPhotoLayout />}>
          <Route path="/photography" element={<Photography />} />
          <Route path="/photography/portraits" element={<Portraits />} />
        </Route>
        <Route element={<SiteShell />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectCase />} />
          <Route path="experience" element={<Roles key="experience" group="experience" />} />
          <Route path="leadership" element={<Roles key="leadership" group="leadership" />} />
          {PHOTOGRAPHY_ENABLED && <Route path="photos" element={<PhotosPage />} />}
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<Home notFound />} />
        </Route>
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
