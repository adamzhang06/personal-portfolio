import { useEffect, useRef, useState } from "react";
import { useUi } from "@/context/uiContext";
import { useCamera } from "@/components/camera/cameraContext";
import { expo } from "@/lib/motion";
import { bladeFill, irisBlades } from "@/lib/iris";

const RING = 2 * Math.PI * 192;
const FILL_S = 2.4; // the percent never runs ahead of this pace
const OPEN_S = 0.6;
const GIVE_UP_S = 6; // past this, Home renders and the camera fades in when ready
const SPECKS = [[12, 22], [27, 71], [71, 18], [86, 64], [58, 88], [6, 84]];

// Pace curve with two short stalls (0 → 1 over 2.4 s), from the canvas loader.
function pace(e) {
  const x = Math.min(1, e / FILL_S);
  const p = x < 0.35 ? x * 1.15 : x < 0.5 ? 0.4025 + (x - 0.35) * 0.4 : x < 0.8 ? 0.4625 + (x - 0.5) * 1.2 : 0.8225 + (x - 0.8) * 0.8875;
  return Math.min(1, p);
}

/* Aperture-iris loader: once per session, Home only. The percent follows real loading
   (three.js parsed, fonts ready, first camera frame); at 100% the blades open past the screen edge
   while the cover fades and the camera fades up. The clock never jumps when a frame stalls.
   Skip (a click anywhere, Esc, Enter or Space) jumps to 100% and opens at once, as the give-up does. */
export function IntroIris() {
  const { introPhase, setIntroPhase } = useUi();
  const cam = useCamera();
  const [frame, setFrame] = useState({ p: 0, o: 0 });
  const skipped = useRef(false);
  const skip = () => {
    skipped.current = true;
  };

  const noCam = cam.status === "nowebgl";
  const loaded = 0.1 + 0.45 * (noCam || cam.moduleLoaded) + 0.2 * (noCam || cam.fontsReady) + 0.25 * (noCam || cam.firstFrame);
  const real = useRef(loaded);
  useEffect(() => {
    real.current = loaded;
  }, [loaded]);

  const active = introPhase === "cover" || introPhase === "opening";
  useEffect(() => {
    if (!active) return undefined;
    document.documentElement.style.overflow = "hidden";
    const onKey = (ev) => {
      if (ev.key === "Escape" || ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        skipped.current = true;
      }
    };
    window.addEventListener("keydown", onKey);
    const started = performance.now();
    let e = 0, last = started, p = 0, openAt = null, raf = 0;
    const tick = () => {
      const now = performance.now();
      e += Math.min(0.05, (now - last) / 1000);
      last = now;
      const gaveUp = (now - started) / 1000 >= GIVE_UP_S; // wall clock: slow frames never stretch the wait
      const target = gaveUp || skipped.current ? 1 : Math.min(real.current >= 0.999 ? 1 : real.current, pace(e));
      p = Math.max(p, target);
      if (p >= 1 && openAt === null) {
        openAt = e;
        setIntroPhase("opening");
      }
      const o = openAt === null ? 0 : expo((e - openAt) / OPEN_S);
      setFrame({ p, o });
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
  }, [active, setIntroPhase]);

  if (!active) return null;

  const { p, o } = frame;
  const txtOp = (1 - Math.min(1, o * 2.2)).toFixed(3);
  const bgOp = (1 - o).toFixed(3);
  const pct = Math.floor(p * 100);
  const b = irisBlades(p, o);

  return (
    <div className="ld" onPointerDown={skip}>
      <div className="ld-bg" style={{ opacity: bgOp }} />
      {SPECKS.map(([l, t]) => (
        <span key={l} className="speck" style={{ left: l + "%", top: t + "%", opacity: bgOp }} />
      ))}
      <div className="ld-c">
        <p className="ld-eb" style={{ opacity: txtOp }}>Adam Zhang</p>
        <div className="iris" role="progressbar" aria-label="Loading adamzhang.org" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <svg viewBox="-200 -200 400 400" aria-hidden="true">
            <g transform={`scale(${(1 + 5 * o).toFixed(3)}) rotate(${(-12 * o).toFixed(2)})`} opacity={(1 - o * o).toFixed(3)}>
              {b.map((pts, i) => (
                <polygon key={i} points={pts} fill={bladeFill(i)} stroke="#2A2A33" style={{ strokeWidth: "1px" }} />
              ))}
            </g>
            <g opacity={txtOp}>
              <circle cx="0" cy="0" r="192" fill="none" stroke="#2A2A33" style={{ strokeWidth: "2px" }} />
              <circle
                cx="0"
                cy="0"
                r="192"
                fill="none"
                stroke="#8A55E6"
                transform="rotate(-90)"
                style={{ strokeWidth: "2px", strokeLinecap: "round", strokeDasharray: `${(RING * p).toFixed(1)} ${RING.toFixed(1)}` }}
              />
            </g>
          </svg>
          <div className="pct" style={{ opacity: txtOp }}>
            <b>{pct}%</b>
            <span>IN FOCUS</span>
          </div>
        </div>
        <p className="ld-t" style={{ opacity: txtOp }}>Adam Zhang</p>
        <p className="ld-l" style={{ opacity: txtOp }}>AI · Robotics · Photography</p>
      </div>
      <button type="button" className="ld-skip" style={{ opacity: txtOp }} onClick={skip}>
        Skip intro <kbd>Esc</kbd>
      </button>
    </div>
  );
}
