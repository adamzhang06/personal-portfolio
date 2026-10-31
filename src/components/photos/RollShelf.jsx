import { useLcdPeek } from "@/context/uiContext";
import { byYear, exposures, frameWidth, shelfGeometry } from "@/lib/rolls";
import { FilmCanister } from "./FilmCanister";

/* The shelves: one kraft counter-display carton per year, newest first, seen from slightly above. Its printed header
   carries the year and what is inside; the year's canisters stand in the tray, coloured by kind, between the side
   walls and behind a front wall die-cut with a scoop under each canister. On wider screens a short leader comes straight out of each canister's slot showing the roll's peek
   frames (as many as fit) and unrolls the rest of the way on hover or focus, while the canister lifts out of the
   carton. Cartons and canisters carry view-transition names so the kind filters can animate them. A hovered or focused
   canister shows its roll (name, years, count, cameras and film) on the docked camera's LCD. */
export function RollShelf({ rolls, vw, onOpen }) {
  const s = shelfGeometry(vw);
  const peek = useLcdPeek();
  return (
    <div className={`cartons${s.phone ? " phone" : ""}`} style={{ "--scw": `${s.cw}px` }}>
      {byYear(rolls).map(({ year, rolls: rs }) => {
        const { span, per, slot } = s.box(rs.length);
        const fill = (per - (rs.length % per)) % per; // plain front wall to close off a part-filled last row
        const exp = rs.reduce((n, r) => n + r.photos.length, 0);
        const inside = `${rs.length} ${rs.length === 1 ? "roll" : "rolls"} · ${exposures(exp)}`;
        return (
          <div
            key={year}
            className="carton"
            role="group"
            aria-label={`${year}: ${inside}`}
            style={{
              viewTransitionName: `carton-${year}`,
              ...(s.phone ? { width: per * slot + s.walls } : { gridColumn: `span ${span}` }),
            }}
          >
            <div className="hdr" aria-hidden="true">
              <b>{year}</b>
              <span>{inside}</span>
            </div>
            <div className="tray" style={{ gridTemplateColumns: s.phone ? `repeat(${per}, ${slot}px)` : `repeat(${per}, minmax(0, 1fr))` }}>
              <span className="walls" aria-hidden="true">
                <i />
              </span>
              {rs.map((r, i) => {
                const n = r.photos.length;
                const gear = [...new Set(r.photos.flatMap((p) => [p.camera, p.film]).filter(Boolean))].join(" · ");
                return (
                  <button
                    key={r.id}
                    type="button"
                    className="rc"
                    aria-label={`Open roll: ${r.name} ${r.yearSpan}, ${n} ${n === 1 ? "photo" : "photos"}`}
                    onClick={() => onOpen(r)}
                    {...peek({ page: r.name, sub: `${r.yearSpan} · ${n} ${n === 1 ? "photo" : "photos"}`, count: gear })}
                    style={{ viewTransitionName: `roll-${r.id}`, "--gx": `${-(i % per) * slot}px` }}
                  >
                    {!s.phone && (
                      <span className="peek" aria-hidden="true">
                        <span className="fw">
                          <span className="film">
                            <span className="frames">
                              {s.fit(r.peek, slot).map((p) => (
                                <span key={p.id} className="fr">
                                  <img src={p.src} alt="" loading="lazy" decoding="async" style={{ width: frameWidth(p, s.peekH), height: s.peekH }} />
                                </span>
                              ))}
                            </span>
                          </span>
                          <span className="curl" />
                        </span>
                      </span>
                    )}
                    <FilmCanister kind={r.kind} name={r.name} year={r.yearLabel} band={exposures(n)} />
                    <span className="shade" aria-hidden="true">
                      <i />
                    </span>
                    <span className="lip" aria-hidden="true" />
                  </button>
                );
              })}
              {Array.from({ length: fill }, (_, k) => (
                <span key={`fill-${k}`} className="rc empty" aria-hidden="true" style={{ "--gx": `${-((rs.length + k) % per) * slot}px` }}>
                  <span className="lip" />
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
