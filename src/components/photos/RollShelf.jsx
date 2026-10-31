import { exposures, frameWidth, shelfGeometry } from "@/lib/rolls";
import { FilmCanister } from "./FilmCanister";

/* The shelves: one canister per roll, newest first, standing on a run of planks, coloured by kind. A brass tag on the
   plank marks where each year starts. A short leader comes straight out of each canister's slot showing the roll's
   peek frames (as many as fit the card), and unrolls the rest of the way on hover or focus. */
export function RollShelf({ rolls, vw, onOpen }) {
  const s = shelfGeometry(vw);
  return (
    <div className="shelf" style={{ "--scw": `${s.cw}px` }}>
      {rolls.map((r, i) => {
        const first = i === 0 || rolls[i - 1].year !== r.year;
        const n = r.photos.length;
        return (
          <button
            key={r.id}
            type="button"
            className={`rc${first ? " first" : ""}`}
            aria-label={`Open roll: ${r.name} ${r.yearSpan}, ${n} ${n === 1 ? "photo" : "photos"}`}
            onClick={() => onOpen(r)}
          >
            <span className="peek" aria-hidden="true">
              <span className="fw">
                <span className="film">
                  <span className="frames">
                    {s.fit(r.peek).map((p) => (
                      <span key={p.id} className="fr">
                        <img src={p.src} alt="" loading="lazy" decoding="async" style={{ width: frameWidth(p, s.peekH), height: s.peekH }} />
                      </span>
                    ))}
                  </span>
                </span>
                <span className="curl" />
              </span>
            </span>
            <FilmCanister kind={r.kind} name={r.name} year={r.yearLabel} band={exposures(n)} />
            <span className="plank" aria-hidden="true" />
            {first && (
              <span className="ytag" aria-hidden="true">
                {r.year}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
