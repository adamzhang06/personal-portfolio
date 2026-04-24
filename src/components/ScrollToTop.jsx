import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Handles two cases:
// 1. No hash (e.g. /photography) → snap to top of page
// 2. Hash present (e.g. /#about from another route) → smooth scroll to section after render
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      // Delay lets React finish rendering the target section before scrolling
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]); // Only fires on page navigation, not on same-page hash clicks

  return null;
};
