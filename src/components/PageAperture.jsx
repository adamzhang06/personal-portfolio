import { useEffect, useRef, useState } from "react";
import { useUi } from "@/context/uiContext";
import { IRIS_TIMING, beginOpening, endTransition, useTransitionState } from "@/lib/transition";
import { bezier, expo } from "@/lib/motion";
import { ShutterIris } from "./ShutterIris";

const easeIn = bezier(0.5, 0, 0.75, 0);
const easeOut = bezier(0.23, 1, 0.32, 1);
const clamp = (x) => Math.max(0, Math.min(1, x));

/* The page transition: a full-screen iris shuts over the old page (src/lib/transition.js holds navigation
   until it is shut), the route swaps behind it, then it opens onto the new screen. The Shutter (Contact) adds
   a flash the opening reveals. Back / forward arrive with the iris nearly shut and open it. Never takes clicks. */
export function PageAperture() {
  const ui = useUi();
  const st = useTransitionState();
  const [clock, setClock] = useState({ t0: 0, ms: 0 });

  // a new screen has rendered behind the shut iris (or arrived by Back / forward): open onto it
  const seen = useRef(ui.screenCount);
  useEffect(() => {
    if (seen.current === ui.screenCount) return;
    seen.current = ui.screenCount;
    beginOpening();
  }, [ui.screenCount]);

  // shut but no new screen came: open anyway
  useEffect(() => {
    if (st.phase !== "closed") return undefined;
    const t = setTimeout(beginOpening, 400);
    return () => clearTimeout(t);
  }, [st.phase]);

  useEffect(() => {
    if (st.phase !== "opening") return undefined;
    const t = setTimeout(() => endTransition(st.id), IRIS_TIMING.hold + IRIS_TIMING.open + 60);
    return () => clearTimeout(t);
  }, [st.phase, st.id]);

  // the clock for the current phase, one render per frame while the iris moves
  useEffect(() => {
    if (st.phase === "idle") return undefined;
    let raf = 0;
    const tick = () => {
      setClock({ t0: st.t0, ms: performance.now() - st.t0 });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [st.phase, st.t0]);

  if (st.phase === "idle") return null;
  const ms = clock.t0 === st.t0 ? clock.ms : 0; // a phase's first frame starts at 0, not where the last one ended
  const T = IRIS_TIMING;
  let a = 0, flash = 0;
  if (st.phase === "closing") a = 1 - easeIn(clamp(ms / T.close));
  else if (st.phase === "opening") {
    const s = clamp((ms - (st.cold ? 0 : T.hold)) / T.open);
    a = st.cold ? 0.18 + 0.82 * expo(s) : expo(s);
    if (st.flash) flash = 0.92 * (1 - easeOut(clamp(ms / 760)));
  }
  return (
    <div className="ap" aria-hidden="true">
      {flash > 0 && <div className="sh-flash" style={{ opacity: flash.toFixed(3) }} />}
      <ShutterIris a={a} w={window.innerWidth} h={window.innerHeight} />
    </div>
  );
}
