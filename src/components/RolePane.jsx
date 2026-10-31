import { useRef, useState } from "react";
import { useLcdPeek } from "@/context/uiContext";
import { PHONE_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import { MediaGrid } from "./MediaGrid";
import { LinkPreviews } from "./LinkPreview";
import { Rich } from "./Rich";

const hasBody = (r) => Boolean(r.oneLine || r.bullets.length || r.links.length || r.media.length);

function RoleBody({ role }) {
  return (
    <>
      {role.oneLine && <p className="rone">{role.oneLine}</p>}
      {role.bullets.length > 0 && (
        <ul>
          {role.bullets.map((b) => (
            <li key={b}>
              <Rich text={b} />
            </li>
          ))}
        </ul>
      )}
      <LinkPreviews links={role.links} className="lps-grid" />
      <MediaGrid media={role.media} />
    </>
  );
}

/* Experience and Leadership: a list on the left and a sticky detail panel on the right.
   The most recent role (index 0) is selected on load; click a row or press ↑ ↓ to change it. Hovering a row
   previews it on the docked camera's LCD.
   On phones there is no panel: the picked row opens in place, accordion-style, and tapping it again closes it. */
export function RolePane({ roles, label }) {
  const phone = useMediaQuery(PHONE_QUERY);
  const [sel, setSel] = useState(0); // -1 = every row closed (phones only)
  const listRef = useRef(null);
  const peek = useLcdPeek();
  const shown = phone ? sel : Math.max(sel, 0);
  const role = roles[shown] ?? roles[0];

  const pick = (i, row) => {
    if (!phone) return setSel(i);
    setSel(i === sel ? -1 : i);
    // Closing a longer row above pulls this one up, possibly out of view; bring it back.
    requestAnimationFrame(() => row.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  };

  const onKey = (e) => {
    let i = shown;
    if (e.key === "ArrowDown") i = Math.min(roles.length - 1, shown + 1);
    else if (e.key === "ArrowUp") i = Math.max(0, shown - 1);
    else return;
    e.preventDefault();
    setSel(i);
    listRef.current?.querySelectorAll(".rrow")[i]?.focus();
  };

  return (
    <div className="rpane">
      <ol className="rlist" aria-label={label} ref={listRef} onKeyDown={onKey}>
        {roles.map((r, i) => {
          const on = i === shown;
          const fold = phone && hasBody(r);
          return (
            <li key={r.slug}>
              <button
                type="button"
                className={"rrow" + (r.current ? " now" : "") + (on ? " on" : "") + (fold ? " fold" : "")}
                aria-current={!phone && on ? "true" : undefined}
                aria-expanded={fold ? on : undefined}
                aria-controls={phone ? (fold && on ? `role-${r.slug}` : undefined) : "role-detail"}
                onClick={(e) => pick(i, e.currentTarget)}
                {...peek({ page: r.role, sub: r.org, count: r.dates })}
              >
                <span className="dt">{r.dates}</span>
                <b>{r.role}</b>
                <span className="ro">{r.org}</span>
              </button>
              {fold && on && (
                <div className="rdetail rfold" id={`role-${r.slug}`}>
                  <RoleBody role={r} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {!phone && (
        <article className="rdetail" id="role-detail" aria-live="polite">
          <p className="dt">{role.dates}</p>
          <h2>{role.role}</h2>
          <p className="rorg">{role.org}</p>
          <RoleBody role={role} />
          <p className="rhint note">
            {shown + 1} / {roles.length} · ↑ ↓ to browse
          </p>
        </article>
      )}
    </div>
  );
}
