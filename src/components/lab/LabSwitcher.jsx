import { useState } from "react";
import { useUi } from "@/context/uiContext";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { FX_OPTIONS, LOADER_OPTIONS, setLab, useLab } from "@/lib/lab";

/* transitions-lab only: pick a page transition and a loader, slow everything down ×4, replay the intro. */
export function LabSwitcher() {
  const lab = useLab();
  const ui = useUi();
  const { go } = useHistoryBack();
  const [open, setOpen] = useState(true);

  const replay = () => {
    if (ui.pageKey !== "home") go("/");
    setTimeout(() => ui.setIntroPhase("cover"), ui.pageKey === "home" ? 0 : 1000 * (lab.slow ? 4 : 1));
  };

  const cur = `${FX_OPTIONS.find((o) => o.id === lab.fx)?.label.split(" ")[0]} + ${LOADER_OPTIONS.find((o) => o.id === lab.loader)?.label.split(" ")[0]}`;

  return (
    <div className={"lab" + (open ? " open" : "")} onPointerDown={(e) => e.stopPropagation()}>
      <button type="button" className="lab-pill" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <b>LAB</b> {cur} <span aria-hidden="true">{open ? "▾" : "▴"}</span>
      </button>
      {open && (
        <div className="lab-body">
          <p>Page transition</p>
          <div className="lab-seg">
            {FX_OPTIONS.map((o) => (
              <button key={o.id} type="button" className={lab.fx === o.id ? "on" : ""} onClick={() => setLab({ fx: o.id })}>
                {o.label}
              </button>
            ))}
          </div>
          <p>Loader</p>
          <div className="lab-seg">
            {LOADER_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={lab.loader === o.id ? "on" : ""}
                onClick={() => {
                  setLab({ loader: o.id });
                  replay();
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="lab-row">
            <label>
              <input type="checkbox" checked={lab.slow} onChange={(e) => setLab({ slow: e.target.checked })} /> Slow-mo ×4
            </label>
            <button type="button" className="lab-replay" onClick={replay}>
              ↻ Replay intro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
