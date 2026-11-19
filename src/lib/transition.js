import { useSyncExternalStore } from "react";
import { getLab, labSpeed } from "./lab";

/* The page-transition gate. A transition with a closing half (A, B, C) has to cover the old page before the
   route changes, so in-app navigation goes through transit(): it starts 'closing', waits out the close, then
   navigates ('closed'). The shell's PageTransition sees the new screen and plays 'opening', then 'idle'.
   Browser Back / forward never pass through here, so they play only the opening half. */

// ms; multiplied by the lab's slow-motion factor
export const FX_TIMING = {
  a: { close: 240, hold: 70, open: 560 },
  b: { close: 220, hold: 40, open: 600 },
  c: { close: 260, hold: 90, open: 520 },
};

let state = { phase: "idle", id: 0, t0: 0, flash: false, cold: false };
const subs = new Set();

function set(patch) {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
}

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

let closeTimer = 0;
export function transit(navigate, { flash = false } = {}) {
  const t = FX_TIMING[getLab().fx];
  if (!t || reduced()) {
    navigate();
    return;
  }
  if (state.phase === "closing" || state.phase === "closed") return; // a second click mid-close changes nothing
  clearTimeout(closeTimer);
  set({ phase: "closing", id: state.id + 1, t0: performance.now(), flash, cold: false });
  closeTimer = setTimeout(() => {
    set({ phase: "closed", t0: performance.now() });
    navigate();
  }, t.close * labSpeed());
}

// Called by PageTransition when a new screen has rendered.
export function beginOpening() {
  const cold = state.phase !== "closing" && state.phase !== "closed";
  if (state.phase === "closing") clearTimeout(closeTimer);
  set({ phase: "opening", id: cold ? state.id + 1 : state.id, t0: performance.now(), cold, flash: cold ? false : state.flash });
}

export function endTransition(id) {
  if (state.id === id && state.phase === "opening") set({ phase: "idle", flash: false });
}

export const transitionPhase = () => state.phase;

const subscribe = (f) => {
  subs.add(f);
  return () => subs.delete(f);
};
export const useTransitionState = () => useSyncExternalStore(subscribe, () => state);
