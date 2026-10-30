import { useLocation } from "react-router-dom";
import { useUi } from "@/context/uiContext";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { dialPages } from "@/data/pages";

// Picker opened from the mode dial. Hovering or focusing an option turns the dial to it; clicking goes there.
// 'float' sits beside the hero camera; 'inline' is a row inside the camera legend (expanded dock, phone).
export function SectionsDial({ variant, flipped = false }) {
  const { sectionIndex, setDialPreview, closeDial } = useUi();
  const { go } = useHistoryBack();
  const { pathname } = useLocation();
  const leave = () => setDialPreview(null);

  const options = dialPages.map((p, i) => {
    const on = i === sectionIndex;
    return {
      ...p,
      i,
      on,
      letter: p.label[0],
      preview: () => setDialPreview(i),
      pick: () => {
        if (on && pathname === p.path) closeDial();
        else go(p.path);
      },
    };
  });

  if (variant === "inline") {
    return (
      <div className="dialrow" role="group" aria-label="Sections" onMouseLeave={leave}>
        {options.map((o) => (
          <button key={o.key} type="button" className="lgb" aria-current={o.on ? "page" : undefined} onMouseEnter={o.preview} onFocus={o.preview} onClick={o.pick}>
            {o.label} <em>{o.letter}</em>
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <button type="button" className="dialscrim" tabIndex={-1} aria-label="Close sections" onClick={closeDial} />
      <div
        className="dialpick"
        role="group"
        aria-label="Sections"
        style={{ left: "min(calc(50% + 440px), calc(100% - 276px))", top: flipped ? 236 : 402 }}
        onMouseLeave={leave}
      >
        <span className="mono lt">Turn to a section</span>
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            className={"dopt" + (o.on ? " on" : "")}
            aria-current={o.on ? "page" : undefined}
            autoFocus={o.on}
            onMouseEnter={o.preview}
            onFocus={o.preview}
            onClick={o.pick}
          >
            <span className="mono" aria-hidden="true">{o.letter}</span>
            {o.label}
          </button>
        ))}
      </div>
    </>
  );
}
