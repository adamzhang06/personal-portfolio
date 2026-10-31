import { useRef, useState } from "react";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { useUnroll } from "@/hooks/useUnroll";
import { useViewportWidth } from "@/hooks/useViewportWidth";
import { coverOf, projects } from "@/data/projects";
import { PHOTOGRAPHY_ENABLED } from "@/data/site";
import { dateLabel, exposures, filmGeometry, filmVars, rollStrips, rolls } from "@/lib/rolls";
import { FilmStrip } from "@/components/photos/FilmStrip";
import { PhotoLightbox } from "@/components/photos/PhotoLightbox";
import "@/styles/photos.css";

/* Home's Latest: the newest project as a large print beside its result (the whole block opens the case study), then
   the newest roll unrolling from its canister on one strip as it comes into view. A frame opens the lightbox here;
   Open the roll goes to the Photos page with that roll open (/photos#<roll id>). */
export function Latest() {
  const { go } = useHistoryBack();
  const p = projects[0];
  const cover = coverOf(p);
  const roll = PHOTOGRAPHY_ENABLED ? rolls[0] : null;
  const g = filmGeometry(useViewportWidth());
  const strip = roll ? rollStrips(roll, g)[0] : null;
  const reels = useRef(null);
  useUnroll(reels, { active: !!roll, once: true, layout: strip?.frames.length });
  const [shown, setShown] = useState(null); // index into roll.photos, or null

  const n = roll?.photos.length ?? 0;
  return (
    <section className="latest" aria-labelledby="home-latest">
      <div className="wrap homewrap lt-in">
        <h2 id="home-latest">Latest</h2>
        <article className="lt-proj">
          <div className="lt-cover">
            {cover ? <img src={cover.src} alt={cover.alt} loading="lazy" style={{ objectPosition: cover.position }} /> : <span className="card-cover-type">{p.name}</span>}
          </div>
          <div className="lt-txt">
            <p className="eyebrow">Newest project · {p.period}</p>
            <h3>
              <button type="button" className="stretch" onClick={() => go(`/projects/${p.slug}`)}>
                {p.name}
              </button>
            </h3>
            <p className="winline">{p.result}</p>
            <p className="sum">{p.summary}</p>
            <span className="lt-go" aria-hidden="true">
              Read the case study →
            </span>
          </div>
        </article>
      </div>

      {roll && (
        <div className="lt-roll">
          <div className="wrap homewrap lt-in lt-roll-h">
            <div>
              <p className="eyebrow">Newest roll</p>
              <h3>
                {roll.name} · {roll.yearSpan}
              </h3>
              <p className="lt-when">
                {n} {n === 1 ? "photo" : "photos"}, {dateLabel(roll.photos[0].takenAt)} to {dateLabel(roll.photos.at(-1).takenAt)}
              </p>
            </div>
            <button type="button" className="btn" onClick={() => go(`/photos#${roll.id}`)}>
              Open the roll <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="reels" ref={reels} style={filmVars(g)}>
            <FilmStrip
              frames={strip.frames}
              side="left"
              H={g.H}
              can={{ kind: roll.kind, name: roll.name, year: roll.yearLabel, band: exposures(strip.upTo, n) }}
              onOpen={(ph) => setShown(roll.photos.indexOf(ph))}
            />
          </div>
          <PhotoLightbox photos={roll.photos} index={shown} onIndex={setShown} />
        </div>
      )}
    </section>
  );
}
