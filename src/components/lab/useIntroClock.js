import { useEffect, useRef, useState } from "react";
import { useUi } from "@/context/uiContext";
import { useCamera } from "@/components/camera/cameraContext";
import { labSpeed } from "@/lib/lab";

const FILL_S = 2.4; // the percent never runs ahead of this pace
const GIVE_UP_S = 6;

// The original loader's pace curve with two short stalls (0 → 1 over 2.4 s).
function pace(e) {
  const x = Math.min(1, e / FILL_S);
  const p = x < 0.35 ? x * 1.15 : x < 0.5 ? 0.4025 + (x - 0.35) * 0.4 : x < 0.8 ? 0.4625 + (x - 0.5) * 1.2 : 0.8225 + (x - 0.8) * 0.8875;
  return Math.min(1, p);
}

/* The lab loaders' shared clock. p: loading (follows real loading, never ahead of the pace); at 100% a
   hold (h: 0 → 1 over holdS) for the lock moment, then the exit (o: 0 → 1 over exitS, linear: the loader
   eases it). 'opening' is set as the exit starts (the camera fades up), 'sweep' when it ends.
   Skip (click, Esc, Enter, Space) jumps p to 1. e: seconds since start, for idle motion. */
export function useIntroClock({ holdS, exitS }) {
  const { introPhase, setIntroPhase } = useUi();
  const cam = useCamera();
  const [frame, setFrame] = useState({ p: 0, h: 0, o: 0, e: 0 });
  const skipped = useRef(false);

  const noCam = cam.status === "nowebgl";
  const loaded = 0.1 + 0.45 * (noCam || cam.moduleLoaded) + 0.2 * (noCam || cam.fontsReady) + 0.25 * (noCam || cam.firstFrame);
  const real = useRef(loaded);
  useEffect(() => {
    real.current = loaded;
  }, [loaded]);

  const active = introPhase === "cover" || introPhase === "opening";
  useEffect(() => {
    if (!active) return undefined;
    skipped.current = false;
    document.documentElement.style.overflow = "hidden";
    const onKey = (ev) => {
      if (ev.key === "Escape" || ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        skipped.current = true;
      }
    };
    window.addEventListener("keydown", onKey);
    const k = labSpeed();
    const started = performance.now();
    let e = 0, last = started, p = 0, lockAt = null, openAt = null, raf = 0;
    const tick = () => {
      const now = performance.now();
      e += Math.min(0.05, (now - last) / 1000);
      last = now;
      const gaveUp = (now - started) / 1000 >= GIVE_UP_S;
      const target = gaveUp || skipped.current ? 1 : Math.min(real.current >= 0.999 ? 1 : real.current, pace(e));
      p = Math.max(p, target);
      if (p >= 1 && lockAt === null) lockAt = e;
      const h = lockAt === null ? 0 : Math.min(1, (e - lockAt) / (holdS * k));
      if (h >= 1 && openAt === null) {
        openAt = e;
        setIntroPhase("opening");
      }
      const o = openAt === null ? 0 : Math.min(1, (e - openAt) / (exitS * k));
      setFrame({ p, h, o, e });
      if (o >= 1) {
        setIntroPhase("sweep");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [active, setIntroPhase, holdS, exitS]);

  const skip = () => {
    skipped.current = true;
  };
  return { active, skip, ...frame };
}
