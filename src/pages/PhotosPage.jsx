import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
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

// Filter changes animate where the browser has view transitions: cartons and canisters slide to their new places,
// and those coming or going fade and scale (photos.css). Elsewhere the shelf just changes.
const animate = (change) => (document.startViewTransition ? document.startViewTransition(() => flushSync(change)) : change());

/* The Photos page (/photos), design D "Film rolls": the favorites unroll from their canisters as they scroll into
   view (the first on load), on as many strips as the window needs; then the shelves of rolls, coloured by kind, with
   a filter per kind (any number on at once; none on shows every roll). Picking a canister opens that roll over the
   page; /photos#<roll id> arrives with that roll open. */
export function PhotosPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const vw = useViewportWidth();
  const g = filmGeometry(vw);
  const strips = favoriteStrips(favorites, g);
  const reels = useRef(null);
  const filters = useRef(null);
  const shelfBox = useRef(null);
  useUnroll(reels, { first: true, layout: `${strips.length}:${g.W}` });
  const [shown, setShown] = useState(null); // index into favPhotos, or null
  const rollFor = (hash) => rolls.find((r) => `#${r.id}` === hash) ?? null;
  const [roll, setRoll] = useState(() => rollFor(location.hash));
  // a #roll arriving later (the address edited, or Back to it) opens that roll too
  const [seenHash, setSeenHash] = useState(location.hash);
  if (seenHash !== location.hash) {
    setSeenHash(location.hash);
    if (rollFor(location.hash)) setRoll(rollFor(location.hash));
  }
  // closing a roll that came in on the address drops the #roll, keeping this history entry and its Back crumb
  const closeRoll = () => {
    setRoll(null);
    if (location.hash) navigate(location.pathname, { replace: true, state: location.state });
  };
  const [picked, setPicked] = useState([]); // kinds switched on in the filter
  // While filters are on the shelf keeps the tallest height it has had, so a shorter shelf never pulls the page up
  // under the reader (and the view transition has nothing else to move); with every roll shown it sizes to fit again.
  const hold = () => {
    const el = shelfBox.current;
    if (el) el.style.minHeight = `${Math.max(el.offsetHeight, parseFloat(el.style.minHeight) || 0)}px`;
  };
  useEffect(() => {
    if (!picked.length && shelfBox.current) shelfBox.current.style.minHeight = "";
  }, [picked]);
  const toggle = (kind) => {
    hold();
    animate(() => setPicked((on) => (on.includes(kind) ? on.filter((k) => k !== kind) : [...on, kind])));
  };
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
              can={{ kind: "fav", name: "Favorites", year: "", band: exposures(s.upTo, favPhotos.length) }}
              onOpen={(p) => setShown(favPhotos.indexOf(p))}
            />
          ))}
        </section>
      )}

      <section className="wrap rolls" aria-labelledby="rolls-h">
        <div className="rolls-h">
          <h2 id="rolls-h">Rolls</h2>
          <div className="kinds" role="group" aria-label="Show rolls by kind" ref={filters}>
            {/* Reset sits first and keeps its place while hidden, so the filters never move */}
            <button
              type="button"
              className={`btn small reset${picked.length ? "" : " off"}`}
              onClick={() => {
                animate(() => setPicked([]));
                filters.current?.querySelector(".chip")?.focus(); // Reset hides; keep focus on the filters
              }}
            >
              Reset
            </button>
            {KINDS.map((k) => {
              const on = picked.includes(k.kind);
              return (
                <button key={k.kind} type="button" className={`btn small chip${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggle(k.kind)}>
                  <span className={`swatch k-${k.kind}`} aria-hidden="true" />
                  {k.label} <span className="n">{k.count}</span>
                </button>
              );
            })}
          </div>
        </div>
        <p className="sr" aria-live="polite">
          {picked.length ? `Showing ${shelf.length} of ${rolls.length} rolls` : ""}
        </p>
        <div ref={shelfBox}>
          <RollShelf rolls={shelf} vw={vw} onOpen={setRoll} />
        </div>
      </section>

      <PhotoLightbox photos={favPhotos} index={shown} onIndex={setShown} />
      <RollViewer roll={roll} onClose={closeRoll} />
    </div>
  );
}
