import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { UiContext } from "./uiContext";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { pageByKey, pageKeyFor } from "@/data/pages";
import { DURATION } from "@/lib/motion";

const INTRO_KEY = "ayz-intro-seen";
const ENTRY_PATH = window.location.pathname; // where this visit started

// The iris plays once per session, and only when the visit starts on Home (deep links go straight in).
function initialIntroPhase() {
  try {
    return ENTRY_PATH === "/" && !sessionStorage.getItem(INTRO_KEY) ? "cover" : "done";
  } catch {
    return "done";
  }
}

/* Screen-level UI state shared by the shell, the pages and the camera:
   overlay (dialog: 'menu' | 'info' | 'videos'), whether the docked camera is expanded (it stays expanded
   under dialogs and the Collections dock), camera view (front / rear), the Sections dial,
   the highlighted project (camera OK), toast, shutter flash, the intro phase
   ('cover' → 'opening' → 'sweep' → 'done') and a counter that ticks on every new screen
   (it replays the aperture transition). */
export function UiProvider({ children }) {
  const location = useLocation();
  const { go } = useHistoryBack();
  const [overlay, setOverlay] = useState(null);
  const [dockOpen, setDockOpen] = useState(false);
  const [dockLinger, setDockLinger] = useState(false); // keep it expanded through a card-door page change
  const [view, setView] = useState("front");
  const [dialOpen, setDialOpen] = useState(false);
  const [dialPreview, setDialPreview] = useState(null);
  const [highlighted, setHighlighted] = useState(0);
  const [screenCount, setScreenCount] = useState(0);
  const [inserting, setInserting] = useState(false); // a card from the Collections dock is going into the camera
  const [toast, setToast] = useState({ text: "", on: false });
  const [flash, setFlash] = useState(false);
  const [introPhase, setIntroPhase] = useState(initialIntroPhase);

  // A new screen closes overlays, faces the camera front and closes the dial.
  // The dial rests on the current section; Contact and unknown routes keep the last one.
  const pageKey = pageKeyFor(location.pathname);
  const dialHere = pageKey === "notfound" ? 0 : pageByKey(pageKey)?.dial;
  const [lastSection, setLastSection] = useState(dialHere ?? 0);
  const [seenPath, setSeenPath] = useState(location.pathname);
  if (seenPath !== location.pathname) {
    setSeenPath(location.pathname);
    setScreenCount((n) => n + 1);
    setInserting(false);
    setOverlay(null);
    // a page opened from the Collections dock keeps the big camera up while its door swings shut
    if (inserting && dockOpen) setDockLinger(true);
    else setDockOpen(false);
    setView("front");
    setDialOpen(false);
    setDialPreview(null);
    if (dialHere !== undefined) setLastSection(dialHere);
  }
  const sectionIndex = dialHere ?? lastSection;

  const toastTimer = useRef(0);
  const showToast = useCallback((text) => {
    clearTimeout(toastTimer.current);
    setToast({ text, on: true });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, on: false })), DURATION.toast);
  }, []);

  const flashTimer = useRef(0);
  const shutter = useCallback(() => {
    setFlash(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => {
      go("/contact");
      setFlash(false);
    }, DURATION.flash);
  }, [go]);

  const closeDial = useCallback(() => {
    setDialOpen(false);
    setDialPreview(null);
  }, []);

  // Esc closes the Sections dial first, then the expanded dock. Native dialogs handle their own Esc.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (overlay) return; // the open dialog closes itself and the camera stays expanded
      if (dialOpen) {
        e.preventDefault();
        closeDial();
      } else if (dockOpen && !document.querySelector(".cdock.open")) {
        e.preventDefault();
        setDockOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialOpen, overlay, dockOpen, closeDial]);

  useEffect(() => {
    if (!dockLinger) return undefined;
    const t = setTimeout(() => {
      setDockOpen(false);
      setDockLinger(false);
    }, 1100);
    return () => clearTimeout(t);
  }, [dockLinger]);

  useEffect(() => {
    if (introPhase === "opening") sessionStorage.setItem(INTRO_KEY, "1");
    if (introPhase !== "sweep") return undefined;
    const t = setTimeout(() => setIntroPhase("done"), 3500); // the glow sweep has finished by then
    return () => clearTimeout(t);
  }, [introPhase]);

  useEffect(() => () => {
    clearTimeout(toastTimer.current);
    clearTimeout(flashTimer.current);
  }, []);

  const value = useMemo(
    () => ({
      pageKey,
      overlay, setOverlay,
      dockOpen, setDockOpen,
      view, setView,
      dialOpen, setDialOpen, dialPreview, setDialPreview, closeDial, sectionIndex,
      highlighted, setHighlighted,
      screenCount,
      inserting, setInserting,
      toast, showToast,
      flash, shutter,
      introPhase, setIntroPhase,
    }),
    [pageKey, overlay, dockOpen, view, dialOpen, dialPreview, closeDial, sectionIndex, highlighted, screenCount, inserting, toast, showToast, flash, shutter, introPhase]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}
