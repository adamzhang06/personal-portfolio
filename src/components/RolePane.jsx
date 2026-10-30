import { useRef, useState } from "react";
import { MediaGrid } from "./MediaGrid";
import { LinkPreviews } from "./LinkPreview";

const pad = (n) => String(n).padStart(2, "0");

/* Experience and Leadership: a list on the left and a sticky detail panel on the right.
   The most recent role (index 0) is selected on load; click a row or press ↑ ↓ to change it.
   On phones the panel sits under the list and picking a row scrolls to it. */
export function RolePane({ roles, label }) {
  const [sel, setSel] = useState(0);
  const listRef = useRef(null);
  const detailRef = useRef(null);
  const role = roles[sel] ?? roles[0];

  const pick = (i) => {
    setSel(i);
    if (window.matchMedia("(max-width: 860px)").matches) {
      setTimeout(() => detailRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }), 30);
    }
  };

  const onKey = (e) => {
    let i = sel;
    if (e.key === "ArrowDown") i = Math.min(roles.length - 1, sel + 1);
    else if (e.key === "ArrowUp") i = Math.max(0, sel - 1);
    else return;
    e.preventDefault();
    setSel(i);
    listRef.current?.querySelectorAll("button")[i]?.focus();
  };

  return (
    <div className="rpane">
      <ol className="rlist" aria-label={label} ref={listRef} onKeyDown={onKey}>
        {roles.map((r, i) => (
          <li key={r.slug}>
            <button
              type="button"
              className={"rrow" + (r.current ? " now" : "") + (i === sel ? " on" : "")}
              aria-current={i === sel ? "true" : undefined}
              aria-controls="role-detail"
              onClick={() => pick(i)}
            >
              <span className="dt">{r.dates}</span>
              <b>{r.role}</b>
              <span className="ro">{r.org}</span>
            </button>
          </li>
        ))}
      </ol>
      <article className="rdetail" id="role-detail" ref={detailRef} aria-live="polite">
        <p className="dt">{role.dates}</p>
        <h2>{role.role}</h2>
        <p className="rorg">{role.org}</p>
        {role.oneLine && <p className="rone">{role.oneLine}</p>}
        {role.bullets.length > 0 && (
          <ul>
            {role.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
        <LinkPreviews links={role.links} className="lps-grid" />
        <MediaGrid media={role.media} />
        <p className="rhint mono">
          {pad(sel + 1)} / {pad(roles.length)} · ↑ ↓ to browse
        </p>
      </article>
    </div>
  );
}
