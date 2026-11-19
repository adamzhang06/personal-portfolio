import { useLab } from "@/lib/lab";
import { bezier, expo } from "@/lib/motion";
import { IntroIris } from "@/components/IntroIris";
import { ShutterIris } from "./ShutterIris";
import { useIntroClock } from "./useIntroClock";

const easeIn = bezier(0.5, 0, 0.75, 0);
const easeOut = bezier(0.23, 1, 0.32, 1);
const clamp = (x) => Math.max(0, Math.min(1, x));

/* transitions-lab: the picked loader. "Current" is the original IntroIris. */
export function IntroLoader() {
  const { loader } = useLab();
  if (loader === "1") return <ViewfinderIntro />;
  if (loader === "2") return <LensIntro />;
  return <IntroIris />;
}

function SkipButton({ onClick, style }) {
  return (
    <button type="button" className="ld-skip" style={style} onClick={onClick}>
      Skip intro <kbd>Esc</kbd>
    </button>
  );
}

/* ── 1 · Viewfinder ─────────────────────────────────────────────────────────────────────────────
   The screen is the viewfinder: frame corners, thirds, a top status row and an exposure readout. AF points
   hunt around the name while the site loads, the centre ones lock green at 100%, the meter settles on 0,
   then the shutter fires: the iris shuts over the viewfinder and opens onto Home with a flash. */
const AF_COLS = 5, AF_ROWS = 3;
const AF_UNDER_NAME = new Set([6, 7, 8]); // the middle row's centre points sit under the name: never drawn
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const METER = Array.from({ length: 13 }, (_, i) => i); // −2 … +2 in thirds

function ViewfinderIntro() {
  const { active, skip, p, h, o, e } = useIntroClock({ holdS: 0.5, exitS: 0.95 });
  if (!active) return null;

  const pct = Math.floor(p * 100);
  const locked = p >= 1;
  // exit: the iris shuts over the viewfinder (0 → .3), holds, then opens onto Home (.38 → 1)
  const a = o === 0 ? 1 : o < 0.3 ? 1 - easeIn(o / 0.3) : o < 0.38 ? 0 : expo((o - 0.38) / 0.62);
  const hudGone = o >= 0.32;
  const flash = o > 0.38 ? 0.55 * (1 - easeOut(clamp((o - 0.38) / 0.45))) : 0;
  // AF hunting: two points flick on every ~140 ms until the lock; the lock blinks twice
  const step = Math.floor(e * 7);
  const hunt = new Set([Math.floor(hash(step) * 15), Math.floor(hash(step + 99) * 15), Math.floor(hash(step + 7) * 15)]);
  const blink = locked && (h < 0.12 || (h > 0.24 && h < 0.36)) ? 0.35 : 1;
  const meterPos = -2 + 2 * easeOut(p); // the needle comes in from −2 and settles on 0

  return (
    <div className="ld vf1" onPointerDown={skip}>
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
          <SkipButton onClick={skip} style={{ opacity: locked ? 0 : 1 }} />
        </div>
      )}
      {flash > 0 && <div className="fx-flash" style={{ opacity: flash.toFixed(3) }} />}
      {o > 0 && <ShutterIris a={a} w={window.innerWidth} h={window.innerHeight} />}
    </div>
  );
}

/* ── 2 · Lens focus ─────────────────────────────────────────────────────────────────────────────
   Type only. The name starts out of focus and racks sharp as the site loads, while the lens's distance
   scale turns under a fixed index from ∞ to 1.2 m and the depth-of-field marks close in. At 100% the
   line under the name appears, then the cover lifts and the name drifts forward as it fades. */
const DIST = ["∞", "10", "5", "3", "2", "1.5", "1.2", "1", "0.8", "0.6", "0.45"];
const STOP = 6; // 1.2 m
const GAP = 68; // px between distance marks

function LensIntro() {
  const { active, skip, p, h, o, e } = useIntroClock({ holdS: 0.45, exitS: 0.8 });
  if (!active) return null;

  const pct = Math.floor(p * 100);
  const locked = p >= 1;
  const f = easeOut(p);
  const idx = STOP * f + Math.sin(e * 7) * 0.08 * (1 - p); // a little focus hunting until it settles
  const blur = 16 * Math.pow(1 - p, 1.3);
  const bgOp = 1 - easeOut(o);
  const outOp = 1 - clamp(o * 2.6);
  const dof = 14 + 90 * (1 - f);

  return (
    <div className="ld ln2" onPointerDown={skip}>
      <div className="ln2-bg" style={{ opacity: bgOp.toFixed(3) }} />
      <div className="ln2-c">
        <p className="ln2-eb" style={{ opacity: outOp }}>
          AF · {DIST[Math.round(Math.min(STOP, idx))]}
          {Math.round(idx) > 0 ? " m" : ""} · f/1.8
        </p>
        <h1
          className="ln2-name"
          style={{
            filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none",
            opacity: (Math.min(1, 0.3 + 0.7 * p) * (1 - clamp(o * 1.5))).toFixed(3),
            transform: `scale(${(1 + 0.07 * expo(o)).toFixed(4)})`,
            letterSpacing: `${(-0.02 + 0.08 * (1 - f)).toFixed(4)}em`,
          }}
        >
          Adam Zhang
        </h1>
        <p className="ln2-line" style={{ opacity: (easeOut(h) * outOp).toFixed(3), transform: `translateY(${(6 * (1 - easeOut(h))).toFixed(2)}px)` }}>
          AI · Robotics · Photography
        </p>
        <div className="ln2-scale" style={{ opacity: outOp }} role="progressbar" aria-label="Loading adamzhang.org" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="ln2-strip" style={{ transform: `translate3d(${(-idx * GAP).toFixed(2)}px,0,0)` }} aria-hidden="true">
            {DIST.map((d, i) => (
              <span key={d} className={"ln2-mark" + (i === STOP ? " stop" : "")} style={{ left: i * GAP }}>
                <i />
                <b>{d}</b>
              </span>
            ))}
            {DIST.slice(1).map((d, i) =>
              [0.25, 0.5, 0.75].map((t) => <i key={d + t} className="ln2-minor" style={{ left: (i + t) * GAP }} />)
            )}
          </div>
          <i className="ln2-dof" style={{ transform: `translateX(${-dof}px)` }} aria-hidden="true" />
          <i className="ln2-dof" style={{ transform: `translateX(${dof}px)` }} aria-hidden="true" />
          <i className="ln2-index" aria-hidden="true" />
        </div>
        <p className={"ln2-status" + (locked ? " lock" : "")} style={{ opacity: outOp }}>
          {locked ? "● In focus" : `Focusing ${String(pct).padStart(2, "0")}%`}
        </p>
      </div>
      <SkipButton onClick={skip} style={{ opacity: locked ? 0 : 1 }} />
    </div>
  );
}
