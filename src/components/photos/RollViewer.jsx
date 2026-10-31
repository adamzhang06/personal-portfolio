import { useEffect, useRef, useState } from "react";
import { NativeDialog } from "@/components/NativeDialog";
import { useUnroll } from "@/hooks/useUnroll";
import { useViewportWidth } from "@/hooks/useViewportWidth";
import { exposures, filmGeometry, filmVars, rollStrips } from "@/lib/rolls";
import { FilmStrip } from "./FilmStrip";
import { PhotoLightbox } from "./PhotoLightbox";

const REWIND_MS = 750; // strips roll up (0.55 s), then the sheet fades

/* An opened roll: a see-through sheet over the page with the roll's name and photo count. Its photos unroll in
   zig-zag strips, each from its own canister on alternating sides, whose band counts the photos so far out of the
   roll's (3/10, then 10/10). The page behind is locked and the sheet scrolls on its own. Rewind (or Esc, or a click anywhere off the film) rolls the strips back up and closes;
   focus returns to the canister, and the shelf never moved. A photo opens the lightbox with its details. */
export function RollViewer({ roll, onClose }) {
  const [closing, setClosing] = useState(false);
  const [shown, setShown] = useState(null); // index into roll.photos, or null
  const scroller = useRef(null);
  const timer = useRef(0);
  const g = filmGeometry(useViewportWidth());
  const strips = roll ? rollStrips(roll, g) : [];
  useUnroll(scroller, { active: !!roll && !closing, self: true, once: true, eager: true, delay: 150, stagger: 0.25, layout: strips.length });

  useEffect(() => {
    if (!roll) return undefined;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [roll]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const rewind = () => {
    if (closing) return;
    scroller.current?.querySelectorAll("[data-reel]").forEach((el) => {
      el.style.transitionDelay = "0s";
      el.style.transitionDuration = ".55s";
      el.style.setProperty("--u", "0");
    });
    setClosing(true);
    timer.current = setTimeout(() => {
      setClosing(false);
      setShown(null);
      onClose();
    }, REWIND_MS);
  };

  // a click off the film and photos (the lightbox handles its own) leaves the roll
  const onSheetClick = (e) => {
    if (!e.target.closest(".film, button, .lbox")) rewind();
  };

  const n = roll?.photos.length ?? 0;
  return (
    <NativeDialog open={!!roll} onClose={rewind} className={`rollview${closing ? " out" : ""}`} labelledBy="rv-h">
      {roll && (
        <div className="rv-scroll" ref={scroller} onClick={onSheetClick}>
          <div className="rv-head">
            <h2 id="rv-h">
              {roll.name} · {roll.yearSpan}
            </h2>
            <p className="count">
              {n} {n === 1 ? "photo" : "photos"}
            </p>
          </div>
          <button type="button" className="rewind" data-autofocus onClick={rewind}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
            Rewind
          </button>
          <div className="reels" style={filmVars(g)}>
            {strips.map((s, i) => (
              <FilmStrip
                key={i}
                frames={s.frames}
                side={s.side}
                H={g.H}
                can={{ kind: roll.kind, name: roll.name, year: roll.yearLabel, band: exposures(s.upTo, n) }}
                onOpen={(p) => setShown(roll.photos.indexOf(p))}
              />
            ))}
          </div>
          <PhotoLightbox photos={roll.photos} index={shown} onIndex={setShown} />
        </div>
      )}
    </NativeDialog>
  );
}
