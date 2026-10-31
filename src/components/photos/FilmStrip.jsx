import { frameWidth, isMono, photoLabel } from "@/lib/rolls";
import { FilmCanister } from "./FilmCanister";

/* One row: a canister on the left or right `side` and the film running out of it, as long as its photos plus a short
   leader and tail. It unrolls from the canister and only rotates, so photos stay rectangular; useUnroll sets --u on
   [data-reel]. Frames are drawn left to right; null is an empty (unexposed) frame. Film photos come out as negatives
   and develop once the strip lies flat, frame by frame from the canister outward (--j counts from the canister). */
export function FilmStrip({ frames, side = "left", can, H, onOpen }) {
  return (
    <div className={`frow side-${side}`}>
      <div className="reel" data-reel>
        <FilmCanister {...can} />
        <div className="fw">
          <div className="film">
            <div className="frames">
              {frames.map((p, j) => {
                const size = { width: frameWidth(p, H), height: H };
                if (!p) return <span key={`blank-${j}`} className="fr blank" aria-hidden="true"><i style={size} /></span>;
                const neg = p.film ? (isMono(p) ? " neg mono-neg" : " neg") : "";
                const fromCan = side === "left" ? j : frames.length - 1 - j;
                return (
                  <button key={p.id} type="button" className={"fr" + neg} style={{ "--j": fromCan }} aria-label={photoLabel(p)} onClick={() => onOpen(p)}>
                    <img src={p.src} alt="" width={p.w} height={p.h} loading="lazy" decoding="async" style={size} />
                  </button>
                );
              })}
            </div>
          </div>
          <span className="curl" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
