import { bezier, expo } from "@/lib/motion";
import { useIntroClock } from "@/hooks/useIntroClock";
import { ShutterIris } from "./ShutterIris";

const easeIn = bezier(0.5, 0, 0.75, 0);
const easeOut = bezier(0.23, 1, 0.32, 1);
const clamp = (x) => Math.max(0, Math.min(1, x));

const AF_COLS = 5, AF_ROWS = 3;
const AF_UNDER_NAME = new Set([6, 7, 8]); // the middle row's centre points sit under the name: never drawn
const METER = Array.from({ length: 13 }, (_, i) => i); // −2 … +2 in thirds
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* The viewfinder loader: once per session, Home only. The screen is the viewfinder: frame corners, thirds,
   a status row and an exposure readout. AF points hunt around the name while the site loads (the percent
   follows real loading: three.js parsed, fonts ready, first camera frame); at 100% a green bracket locks
   onto the name and the meter settles on 0, then the shutter fires: the iris shuts over the viewfinder and
   opens onto Home with a flash. Skip (a click anywhere, Esc, Enter or Space) jumps to 100%. */
export function IntroIris() {
  const { active, skip, p, h, o, e } = useIntroClock({ holdS: 0.5, exitS: 0.95 });
  if (!active) return null;

  const pct = Math.floor(p * 100);
  const locked = p >= 1;
  // exit: the iris shuts over the viewfinder (0 → .3), holds, then opens onto Home (.38 → 1)
  const a = o === 0 ? 1 : o < 0.3 ? 1 - easeIn(o / 0.3) : o < 0.38 ? 0 : expo((o - 0.38) / 0.62);
  const hudGone = o >= 0.32;
  const flash = o > 0.38 ? 0.55 * (1 - easeOut(clamp((o - 0.38) / 0.45))) : 0;
  // AF hunting: a few points flick on every ~140 ms until the lock; the lock blinks twice
  const step = Math.floor(e * 7);
  const hunt = new Set([Math.floor(hash(step) * 15), Math.floor(hash(step + 99) * 15), Math.floor(hash(step + 7) * 15)]);
  const blink = locked && (h < 0.12 || (h > 0.24 && h < 0.36)) ? 0.35 : 1;
  const meterPos = -2 + 2 * easeOut(p); // the needle comes in from −2 and settles on 0

  return (
    <div className="ld" onPointerDown={skip}>
      {!hudGone && (
        <div className="vf1-hud">
          <div className="vf1-bg" />
          <div className="vf1-guides" aria-hidden="true">
            <i /><i /><i /><i /><b /><em />
          </div>
          <div className="vf1-top" aria-hidden="true">
            <span className="vf1-mode">P</span>
            <span>AF-C</span>
            <span>RAW</span>
            <span className="vf1-gap" />
            <span>adamzhang.org</span>
            <span className="vf1-bat"><i /><i /><i /></span>
          </div>
          <div className="vf1-center">
            <div className="vf1-af" aria-hidden="true">
              {Array.from({ length: AF_COLS * AF_ROWS }, (_, i) => {
                if (AF_UNDER_NAME.has(i)) return <span key={i} />;
                const on = !locked && hunt.has(i);
                return <i key={i} className={on ? "on" : ""} style={locked ? { opacity: 0.08 } : undefined} />;
              })}
            </div>
            <p className="vf1-eb">Portfolio · 2026</p>
            <div className="vf1-namewrap">
              <h1 className="vf1-name">Adam Zhang</h1>
              {locked && <span className="vf1-lock" style={{ opacity: blink }} aria-hidden="true" />}
            </div>
            <p className="vf1-line">AI · Robotics · Photography</p>
          </div>
          <div className="vf1-bottom" role="progressbar" aria-label="Loading adamzhang.org" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <span>f/1.8</span>
            <span>1/250</span>
            <span>ISO 100</span>
            <span className="vf1-meter" aria-hidden="true">
              <span className="vf1-scale">
                {METER.map((i) => (
                  <i key={i} className={i % 3 === 0 ? "maj" : ""} />
                ))}
              </span>
              <span className="vf1-needle" style={{ left: `${((meterPos + 2) / 4) * 100}%` }} />
              <span className="vf1-nums"><em>−2</em><em>0</em><em>+2</em></span>
            </span>
            <span className={"vf1-status" + (locked ? " lock" : "")}>{locked ? "● Focus lock" : `AF ${String(pct).padStart(2, "0")}%`}</span>
            <span className="vf1-frames">[{o > 0 ? 35 : 36}]</span>
          </div>
          <button type="button" className="ld-skip" style={{ opacity: locked ? 0 : 1 }} onClick={skip}>
            Skip intro <kbd>Esc</kbd>
          </button>
        </div>
      )}
      {flash > 0 && <div className="sh-flash" style={{ opacity: flash.toFixed(3) }} />}
      {o > 0 && <ShutterIris a={a} w={window.innerWidth} h={window.innerHeight} />}
    </div>
  );
}
