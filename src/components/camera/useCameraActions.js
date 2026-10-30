import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useUi } from "@/context/uiContext";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { projects } from "@/data/projects";
import { pageByKey } from "@/data/pages";

// What each camera control does, by key.
export function useCameraActions() {
  const ui = useUi();
  const { go, trayOpen, openTray, closeTray } = useHistoryBack();
  const { pathname } = useLocation();
  const { shutter, dialOpen, closeDial, setDialOpen, setOverlay, setView, highlighted } = ui; // dialogs leave the expanded camera up

  return useMemo(
    () => ({
      shutter,
      mode: () => (dialOpen ? closeDial() : setDialOpen(true)),
      record: () => setOverlay("videos"),
      // the card door toggles the Collections dock, like opening and shutting the real door
      door: () => (trayOpen ? closeTray() : openTray()),
      monitor: () => setView((v) => (v === "rear" ? "front" : "rear")),
      play: () => go(pageByKey("photography").path),
      menu: () => setOverlay("menu"),
      info: () => setOverlay("info"),
      ok: () => (pathname === "/projects" ? go(`/projects/${projects[highlighted]?.slug ?? projects[0].slug}`) : go("/projects")),
    }),
    [shutter, dialOpen, closeDial, setDialOpen, setOverlay, setView, highlighted, go, trayOpen, openTray, closeTray, pathname]
  );
}
