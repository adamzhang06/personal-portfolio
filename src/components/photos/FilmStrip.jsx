import { frameWidth, photoLabel, photoTech, photoWhen } from "@/lib/rolls";
import { FilmCanister } from "./FilmCanister";

/* One row: a canister on the left (or right, rtl) and the amber strip running out of it to past the screen edge.
   The strip only rotates, so photos stay rectangular; useUnroll sets --u on [data-reel]. Frames are drawn left to
   right; null is an empty frame. `info` shows each photo's title, date, place and camera on hover. */
export function FilmStrip({ frames, rtl, can, H, info = false, onOpen }) {
  return (
    <div className={`frow ${rtl ? "rtl" : "ltr"}`}>
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
                    {info && (
                      <span className="info" aria-hidden="true">
                        <b>{p.title}</b>
                        <span>{photoWhen(p)}</span>
                        <span>{photoTech(p)}</span>
                      </span>
                    )}
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
