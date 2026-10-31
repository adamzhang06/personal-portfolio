import { frameWidth } from "@/lib/rolls";
import { FilmCanister } from "./FilmCanister";

const PEEK_H = 104;

/* The shelves: one canister per roll, newest first, standing on a run of planks. A brass tag on the plank marks where
   each year starts. A short leader comes straight out of each canister's slot showing the roll's peek frames, and
   unrolls a little further on hover or focus. */
export function RollShelf({ rolls, onOpen }) {
  return (
    <div className="shelf">
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
                    {r.peek.map((p) => (
                      <span key={p.id} className="fr">
                        <img src={p.src} alt="" loading="lazy" decoding="async" style={{ width: frameWidth(p, PEEK_H), height: PEEK_H }} />
                      </span>
                    ))}
                  </span>
                </span>
                <span className="curl" />
              </span>
            </span>
            <FilmCanister name={r.name} year={r.yearLabel} band={`${n} EXP`} />
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
