import { useEffect, useRef, useState } from "react";
import { useUi } from "@/context/uiContext";
import { useLab, labSpeed } from "@/lib/lab";
import { FX_TIMING, beginOpening, endTransition, useTransitionState } from "@/lib/transition";
import { bezier, expo } from "@/lib/motion";
import { lcdCounter, pageByKey } from "@/data/pages";
import { PageAperture } from "@/components/PageAperture";
import { ShutterIris } from "./ShutterIris";

const easeIn = bezier(0.5, 0, 0.75, 0);
const easeOut = bezier(0.23, 1, 0.32, 1);
const clamp = (x) => Math.max(0, Math.min(1, x));

/* transitions-lab: plays the picked page transition. "Current" is the original PageAperture. */
export function PageTransition() {
  const { fx } = useLab();
  const ui = useUi();
  const st = useTransitionState();

  // a new screen has rendered behind the closed transition (or arrived by Back / forward): open onto it
  const seen = useRef(ui.screenCount);
  useEffect(() => {
    if (seen.current === ui.screenCount) return;
    seen.current = ui.screenCount;
    if (fx !== "old") beginOpening();
  }, [ui.screenCount, fx]);

  // closing finished but no new screen came (same page): open anyway
  useEffect(() => {
    if (st.phase !== "closed") return undefined;
    const t = setTimeout(beginOpening, 400);
    return () => clearTimeout(t);
  }, [st.phase]);

  useEffect(() => {
    if (st.phase !== "opening") return undefined;
    const t = FX_TIMING[fx];
    const ms = t ? (t.hold + t.open) * labSpeed() + 60 : 0;
    const timer = setTimeout(() => endTransition(st.id), ms);
    return () => clearTimeout(timer);
  }, [st.phase, st.id, fx]);

  if (fx === "old") return ui.screenCount > 0 ? <PageAperture key={ui.screenCount} /> : null;
  if (fx === "a") return <IrisFx st={st} />;
  if (fx === "b") return <FocusFx st={st} />;
  return <CurtainFx st={st} pageKey={ui.pageKey} />;
}

// rAF clock for the current phase: returns ms since the phase began, re-rendering each frame while active
function usePhaseClock(st) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (st.phase === "idle") return undefined;
    let raf = 0;
    const tick = () => {
      setNow(performance.now() - st.t0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [st.phase, st.t0]);
  return now;
}

function useViewport() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

/* A · Full-screen iris: the blades close over the old page, the route swaps while they are shut,
   then they open onto the new one. Contact (the Shutter) adds a flash that the opening reveals. */
function IrisFx({ st }) {
  const ms = usePhaseClock(st);
  const { w, h } = useViewport();
  if (st.phase === "idle") return null;
  const k = labSpeed(), T = FX_TIMING.a;
  let a = 0, flash = 0;
  if (st.phase === "closing") a = 1 - easeIn(clamp(ms / (T.close * k)));
  else if (st.phase === "opening") {
    const s = clamp((ms - (st.cold ? 0 : T.hold * k)) / (T.open * k));
    a = st.cold ? 0.18 + 0.82 * expo(s) : expo(s);
    if (st.flash) flash = 0.92 * (1 - easeOut(clamp(ms / (760 * k))));
  }
  return (
    <div className="fx-layer" aria-hidden="true">
      {flash > 0 && <div className="fx-flash" style={{ opacity: flash.toFixed(3) }} />}
      <ShutterIris a={a} w={w} h={h} />
    </div>
  );
}

/* B · Focus pull: the page itself defocuses and pulls back, and the new one racks into focus while the
   viewfinder corners settle and a green AF point confirms. No shapes cross the page. */
function FocusFx({ st }) {
  const anim = useRef(null);
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    const k = labSpeed(), T = FX_TIMING.b;
    if (st.phase === "closing") {
      anim.current?.cancel();
      main.style.transformOrigin = `50% ${window.scrollY + window.innerHeight / 2}px`;
      anim.current = main.animate(
        [
          { filter: "blur(0px)", transform: "scale(1)", opacity: 1 },
          { filter: "blur(14px)", transform: "scale(.982)", opacity: 0.25 },
        ],
        { duration: T.close * k, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" }
      );
    } else if (st.phase === "opening") {
      anim.current?.cancel();
      main.style.transformOrigin = `50% ${window.scrollY + window.innerHeight / 2}px`;
      anim.current = main.animate(
        [
          { filter: "blur(12px)", transform: "scale(1.018)", opacity: st.cold ? 0.5 : 0.25 },
          { filter: "blur(0px)", transform: "scale(1)", opacity: 1 },
        ],
        { duration: T.open * k, delay: T.hold * k, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }
      );
      anim.current.onfinish = () => {
        main.style.transformOrigin = "";
      };
    }
  }, [st.phase, st.id, st.cold]);
  useEffect(() => () => anim.current?.cancel(), []);

  if (st.phase === "idle") return null;
  const k = labSpeed(), T = FX_TIMING.b;
  return (
    <div
      key={st.id + st.phase}
      className={"fx-layer fx-focus " + st.phase}
      style={{ "--close": `${T.close * k}ms`, "--open": `${T.open * k}ms`, "--hold": `${T.hold * k}ms` }}
      aria-hidden="true"
    >
      {st.flash && st.phase === "opening" && <div className="fx-flash fx-flash-anim" />}
      <i className="fb tl" />
      <i className="fb tr" />
      <i className="fb bl" />
      <i className="fb br" />
      {st.phase === "opening" && <div className="fx-af" />}
    </div>
  );
}

/* C · Focal-plane curtain: a slatted metal curtain drops over the page, holds with the destination printed
   on it, and carries on down to reveal the new page from the top. */
function CurtainFx({ st, pageKey }) {
  const ms = usePhaseClock(st);
  if (st.phase === "idle") return null;
  const k = labSpeed(), T = FX_TIMING.c;
  let y = 0, flash = 0; // curtain offset: -100 (above) → 0 (covering) → 100 (below), in %
  if (st.phase === "closing") y = -100 * (1 - easeIn(clamp(ms / (T.close * k))));
  else if (st.phase === "opening") {
    const s = clamp((ms - (st.cold ? 0 : T.hold * k)) / (T.open * k));
    y = 100 * bezier(0.45, 0, 0.2, 1)(s);
    if (st.flash) flash = 0.9 * (1 - easeOut(clamp(ms / (700 * k))));
  }
  const page = pageByKey(pageKey === "notfound" ? "home" : pageKey);
  const labelOp = st.phase === "opening" ? 1 - clamp((ms - T.hold * k) / (T.open * k * 0.35)) : st.phase === "closed" ? 1 : clamp(ms / (T.close * k) - 0.4) * 1.6;
  return (
    <div className="fx-layer" aria-hidden="true">
      {flash > 0 && <div className="fx-flash" style={{ opacity: flash.toFixed(3) }} />}
      <div className="fx-curtain" style={{ transform: `translate3d(0,${y.toFixed(2)}%,0)` }}>
        <div className="fx-curtain-label" style={{ opacity: Math.max(0, labelOp).toFixed(3) }}>
          {st.phase !== "closing" && page && (
            <>
              <b>{page.label}</b>
              <span>{lcdCounter(pageKey)}</span>
            </>
          )}
          <em>1/250</em>
        </div>
      </div>
    </div>
  );
}
