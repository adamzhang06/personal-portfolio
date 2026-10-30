import { CONTROLS, ariaFor } from "./controls";

// Transparent 44 × 44 px buttons (64 px for the mode dial and card door). The engine moves each one over
// its control every frame and hides it, removing it from the tab order, while the control faces away.
// They start hidden and out of the tab order until the engine has placed them.
export function CameraHotspots({ keys, actions, tips = false }) {
  return keys.map((k) => (
    <button key={k} type="button" className="hs" data-hs={k} tabIndex={-1} aria-label={ariaFor(k)} onClick={actions[k]}>
      {tips && (
        <span className="tip" aria-hidden="true">
          {CONTROLS[k].label}
          <em>{CONTROLS[k].term}</em>
        </span>
      )}
    </button>
  ));
}
