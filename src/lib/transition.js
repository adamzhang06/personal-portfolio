import { useSyncExternalStore } from "react";

/* The page-transition gate. The iris has to shut over the old page before the route changes, so in-app
   navigation goes through transit(): it starts 'closing', waits out the close, then navigates ('closed').
   PageAperture sees the new screen and plays 'opening', then 'idle'. Browser Back / forward never pass
   through here, so they play only the opening half. */

export const IRIS_TIMING = { close: 240, hold: 70, open: 560 }; // ms

let state = { phase: "idle", id: 0, t0: 0, flash: false, cold: false };
const subs = new Set();

function set(patch) {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
}

let closeTimer = 0;
export function transit(navigate, { flash = false } = {}) {
  if (state.phase === "closing" || state.phase === "closed") return; // a second click mid-close changes nothing
  clearTimeout(closeTimer);
  set({ phase: "closing", id: state.id + 1, t0: performance.now(), flash, cold: false });
  closeTimer = setTimeout(() => {
    set({ phase: "closed", t0: performance.now() });
    navigate();
  }, IRIS_TIMING.close);
}

// Called by PageAperture when a new screen has rendered.
export function beginOpening() {
  const cold = state.phase !== "closing" && state.phase !== "closed";
  if (state.phase === "closing") clearTimeout(closeTimer);
  set({ phase: "opening", id: cold ? state.id + 1 : state.id, t0: performance.now(), cold, flash: cold ? false : state.flash });
}

export function endTransition(id) {
  if (state.id === id && state.phase === "opening") set({ phase: "idle", flash: false });
}

const subscribe = (f) => {
  subs.add(f);
  return () => subs.delete(f);
};
export const useTransitionState = () => useSyncExternalStore(subscribe, () => state);
