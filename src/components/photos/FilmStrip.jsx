import { frameWidth, photoLabel } from "@/lib/rolls";
import { FilmCanister } from "./FilmCanister";

/* One row of film, as long as its photos plus a short leader and tail. With `can` it runs out of a canister on the
   left or right `side`; without, it is a cut strip lined up under the first. It unrolls from the left, or from the
   right with `fromRight`, and only rotates, so photos stay rectangular; useUnroll sets --u on [data-reel].
   Frames are drawn left to right; null is an empty (unexposed) frame. */
export function FilmStrip({ frames, side = "left", can, fromRight = false, H, onOpen }) {
  return (
    <div className={`frow ${can ? `side-${side}` : "cut"}${fromRight ? " from-r" : ""}`}>
      <div className="reel" data-reel>
        {can && <FilmCanister {...can} />}
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
