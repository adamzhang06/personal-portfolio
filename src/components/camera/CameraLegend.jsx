import { useUi } from "@/context/uiContext";
import { CONTROLS, DOCK_LEGEND_KEYS, PHONE_LEGEND_KEYS } from "./controls";
import { SectionsDial } from "./SectionsDial";

function LegendButtons({ keys, actions }) {
  return keys.map((k) => (
    <button key={k} type="button" className="lgb" data-door-toggle={k === "door" ? "" : undefined} onClick={actions[k]}>
      {CONTROLS[k].label} <em>{CONTROLS[k].term}</em>
    </button>
  ));
}

// A text list of the same actions as the camera's controls: above the expanded dock, or as the
// "Camera controls" disclosure under the phone camera.
export function CameraLegend({ variant, actions }) {
  const { dialOpen, setDockOpen } = useUi();

  if (variant === "phone") {
    return (
      <details className="mlegend">
        <summary>
          Camera controls <span className="pm" aria-hidden="true" />
        </summary>
        <div className="lbtns">
          <LegendButtons keys={PHONE_LEGEND_KEYS} actions={actions} />
          {dialOpen && <SectionsDial variant="inline" />}
        </div>
      </details>
    );
  }

  return (
    <div className="legend" role="region" aria-label="Camera controls">
      <span className="mono lt">Camera controls</span>
      <LegendButtons keys={DOCK_LEGEND_KEYS} actions={actions} />
      <button type="button" className="lgb" autoFocus onClick={() => setDockOpen(false)}>
        Close <em>Esc</em>
      </button>
      {dialOpen && <SectionsDial variant="inline" />}
    </div>
  );
}
