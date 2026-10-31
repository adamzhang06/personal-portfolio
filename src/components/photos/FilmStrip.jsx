import { frameWidth, photoLabel } from "@/lib/rolls";
import { FilmCanister } from "./FilmCanister";

/* One row: a canister on the left or right `side` and the film running out of it, as long as its photos plus a short
   leader and tail. It unrolls from the canister and only rotates, so photos stay rectangular; useUnroll sets --u on
   [data-reel]. Frames are drawn left to right; null is an empty (unexposed) frame. */
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
                return (
                  <button key={p.id} type="button" className="fr" aria-label={photoLabel(p)} onClick={() => onOpen(p)}>
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
