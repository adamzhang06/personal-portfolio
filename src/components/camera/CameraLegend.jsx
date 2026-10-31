import { useEffect, useRef } from "react";
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

/* A text list of the same actions as the camera's controls: a panel that slides in from the right edge
   above the expanded dock (with Sections as a second panel sliding in below it), or the "Camera controls"
   disclosure under the phone camera. The dock panels stay mounted so they can slide out again. */
export function CameraLegend({ variant, open = false, actions }) {
  const { dialOpen, closeDial, setDockOpen } = useUi();
  const closeRef = useRef(null);

  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true });
  }, [open]);

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

  const close = () => {
    closeDial();
    setDockOpen(false);
  };

  return (
    <div className="dockpanels">
      <div className={"legend" + (open ? " open" : "")} role="region" aria-label="Camera controls" inert={!open}>
        <span className="lt note">Camera controls</span>
        <LegendButtons keys={DOCK_LEGEND_KEYS} actions={actions} />
        <button ref={closeRef} type="button" className="lgb" onClick={close}>
          Close <em>Esc</em>
        </button>
      </div>
      <SectionsDial variant="dock" open={open && dialOpen} />
    </div>
  );
}
