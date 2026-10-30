import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pageByKey, pageKeyFor } from "@/data/pages";
import { projectBySlug } from "@/data/projects";

/* Back always returns to the previous screen, and an open card tray counts as a screen.
   Each history entry we push carries `state.from` (the screen it was opened from), so the
   "← <previous screen>" crumb can name it and Back is just history.back(); browser Back and
   forward stay in step. Replacing navigations (previous / next case study) keep the original
   `from`, so Back still returns to where you came from. Deep links have no `from`: a case study
   falls back to Projects, other pages show no crumb. */

function labelOf(screen) {
  if (!screen) return "";
  if (screen.tray) return "Collections";
  const m = screen.path.match(/^\/projects\/([^/]+)$/);
  if (m) return projectBySlug(m[1])?.name ?? "Projects";
  const key = pageKeyFor(screen.path);
  return key === "notfound" ? "Home" : pageByKey(key)?.label ?? "Back";
}

const historyIdx = () => window.history.state?.idx ?? 0;

export function useHistoryBack() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const trayOpen = !!state?.tray;

  const go = useCallback(
    (to, { replace = false } = {}) => {
      if (to === location.pathname && !trayOpen) {
        window.scrollTo({ top: 0, behavior: "instant" });
        return;
      }
      const from = replace ? state?.from ?? null : { path: location.pathname, tray: trayOpen };
      navigate(to, { replace, state: { from } });
    },
    [navigate, location.pathname, state, trayOpen]
  );

  const back = useCallback(() => {
    if (state?.from && historyIdx() > 0) navigate(-1);
    else navigate("/", { replace: true });
  }, [navigate, state]);

  const openTray = useCallback(() => {
    if (!trayOpen) navigate(location.pathname, { state: { ...state, tray: true } });
  }, [navigate, location.pathname, state, trayOpen]);

  const closeTray = useCallback(() => {
    if (!trayOpen) return;
    if (historyIdx() > 0) navigate(-1);
    else navigate(location.pathname, { replace: true, state: { ...state, tray: false } });
  }, [navigate, location.pathname, state, trayOpen]);

  let crumb = null;
  if (state?.from) crumb = { label: labelOf(state.from), go: back };
  else if (/^\/projects\/[^/]+$/.test(location.pathname)) crumb = { label: "Projects", go: () => navigate("/projects", { replace: true }) };

  return { go, back, crumb, trayOpen, openTray, closeTray };
}
