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
import { favorites, favoriteStrips, filmGeometry, filmVars, rolls, totals } from "@/lib/rolls";
import "@/styles/photos.css";

const card = cardByKey("photos");

/* The Photos page (/photos), design D "Film rolls": three favorites strips that unroll from their canisters as they
   scroll into view (the first on load), then the shelves of rolls. Picking a canister opens that roll over the page.
   The legacy gallery at /photography is left untouched. */
export function PhotosPage() {
  const g = filmGeometry(useViewportWidth());
  const strips = favoriteStrips(favorites, g);
  const reels = useRef(null);
  useUnroll(reels, { first: true, layout: `${strips.length}:${g.W}` });
  const [lb, setLb] = useState(null); // { photos, index } while the lightbox is open
  const [roll, setRoll] = useState(null);

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
          {strips.map((s, k) => {
            const n = s.frames.filter(Boolean).length;
            return (
              <FilmStrip
                key={k}
                frames={s.frames}
                rtl={s.rtl}
                H={g.H}
                can={{ name: "Favorites", year: s.label, band: `${n} ${n === 1 ? "PHOTO" : "PHOTOS"}` }}
                onOpen={(p) => setLb({ photos: s.photos, index: s.photos.indexOf(p) })}
              />
            );
          })}
        </section>
      )}

      <section className="wrap rolls" aria-labelledby="rolls-h">
        <h2 id="rolls-h">Rolls</h2>
        <RollShelf rolls={rolls} onOpen={setRoll} />
      </section>

      <PhotoLightbox photos={lb?.photos ?? []} index={lb?.index ?? null} onIndex={(i) => setLb(i == null ? null : { ...lb, index: i })} />
      <RollViewer roll={roll} onClose={() => setRoll(null)} />
    </div>
  );
}
