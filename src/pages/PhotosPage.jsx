import { useRef, useState } from "react";
import { cardByKey } from "@/data/cards";
import { contact } from "@/data/contact";
import { CardHead } from "@/components/CardHead";
import { FilmStrip } from "@/components/photos/FilmStrip";
import { PhotoLightbox } from "@/components/photos/PhotoLightbox";
import { RollShelf } from "@/components/photos/RollShelf";
import { RollViewer } from "@/components/photos/RollViewer";
import { useUnroll } from "@/hooks/useUnroll";
import { useViewportWidth } from "@/hooks/useViewportWidth";
import { exposures, favorites, favoriteStrips, filmGeometry, filmVars, KINDS, rolls, totals } from "@/lib/rolls";
import "@/styles/photos.css";

const card = cardByKey("photos");
const favPhotos = favorites.filter(Boolean);

/* The Photos page (/photos), design D "Film rolls": the favorites unroll from their canisters as they scroll into
   view (the first on load), on as many strips as the window needs; then the shelves of rolls, coloured by kind, with
   a filter per kind (any number on at once; none on shows every roll). Picking a canister opens that roll over the
   page. The legacy gallery at /photography is left untouched. */
export function PhotosPage() {
  const vw = useViewportWidth();
  const g = filmGeometry(vw);
  const strips = favoriteStrips(favorites, g);
  const reels = useRef(null);
  const filters = useRef(null);
  useUnroll(reels, { first: true, layout: `${strips.length}:${g.W}` });
  const [shown, setShown] = useState(null); // index into favPhotos, or null
  const [roll, setRoll] = useState(null);
  const [picked, setPicked] = useState([]); // kinds switched on in the filter
  const toggle = (kind) => setPicked((on) => (on.includes(kind) ? on.filter((k) => k !== kind) : [...on, kind]));
  const shelf = picked.length ? rolls.filter((r) => picked.includes(r.kind)) : rolls;

  return (
    <div className="page photos">
      <div className="wrap">
        <CardHead
          card={{ ...card, count: `${totals.photos} photos · ${totals.rolls} rolls · ${totals.years}` }}
          aside={
            <a className="btn" href={contact.photos.href} target="_blank" rel="noopener noreferrer">
              {contact.photos.value} <span aria-hidden="true">↗</span>
            </a>
          }
        />
      </div>

      {strips.length > 0 && (
        <section className="reels" aria-label="Favorites" ref={reels} style={filmVars(g)}>
          {strips.map((s, k) => (
            <FilmStrip
              key={k}
              frames={s.frames}
              side={s.side}
              H={g.H}
              can={{ kind: "fav", name: "Favorites", year: "", band: exposures(s.photos.length, favPhotos.length) }}
              onOpen={(p) => setShown(favPhotos.indexOf(p))}
            />
          ))}
        </section>
      )}

      <section className="wrap rolls" aria-labelledby="rolls-h">
        <div className="rolls-h">
          <h2 id="rolls-h">Rolls</h2>
          <div className="kinds" role="group" aria-label="Show rolls by kind" ref={filters}>
            {KINDS.map((k) => {
              const on = picked.includes(k.kind);
              return (
                <button key={k.kind} type="button" className={`btn small chip${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggle(k.kind)}>
                  <span className={`swatch k-${k.kind}`} aria-hidden="true" />
                  {k.label} <span className="n">{k.count}</span>
                </button>
              );
            })}
            {picked.length > 0 && (
              <button
                type="button"
                className="btn small"
                onClick={() => {
                  setPicked([]);
                  filters.current?.querySelector("button")?.focus(); // Reset goes away; keep focus on the filters
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
        <p className="sr" aria-live="polite">
          {picked.length ? `Showing ${shelf.length} of ${rolls.length} rolls` : ""}
        </p>
        <RollShelf rolls={shelf} vw={vw} onOpen={setRoll} />
      </section>

      <PhotoLightbox photos={favPhotos} index={shown} onIndex={setShown} />
      <RollViewer roll={roll} onClose={() => setRoll(null)} />
    </div>
  );
}
