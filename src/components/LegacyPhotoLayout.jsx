import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ScrollToTop } from "@/components/ScrollToTop";

// The pre-v2 shell, kept only so the existing photography routes render exactly as before.
// Photography is out of scope for v2 (docs/spec-v2.md); these pages are not linked from the new UI.
export function LegacyPhotoLayout() {
  useEffect(() => {
    document.body.classList.add("legacy-photo-body");
    return () => document.body.classList.remove("legacy-photo-body");
  }, []);

  return (
    <div className="legacy-photo">
      <ScrollToTop />
      <div className="relative min-h-screen overflow-x-hidden">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}
