import { useRef } from "react";
import { useUi } from "@/context/uiContext";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { lcdCounter, pageByKey } from "@/data/pages";
import { useCamera, useCameraMount } from "./cameraContext";
import { useCameraActions } from "./useCameraActions";
import { DOCK_HOTSPOT_KEYS, HOTSPOT_KEYS, PHONE_HOTSPOT_KEYS } from "./controls";
import { CameraHotspots } from "./CameraHotspots";
import { LeaderLabels } from "./LeaderLabels";
import { SectionsDial } from "./SectionsDial";
import { CameraLegend } from "./CameraLegend";

const HOME_SUB = "Purdue AI · Robotics · ML · Photography";

function useLcd(pageKey) {
  const home = pageKey === "home" || pageKey === "notfound";
  return {
    "data-page": pageByKey(home ? "home" : pageKey).lcd,
    "data-sub": home ? HOME_SUB : "adamzhang.org",
    "data-count": lcdCounter(pageKey),
  };
}

/* The one camera. Desktop: on Home the layer sits in the page and scrolls natively with the hero; on
   every other page it is fixed and the stage glides into the bottom-right dock. It is never re-mounted.
   Phone: an inline 300 px camera at the top of Home, with a "Camera controls" disclosure. */
export function CameraStage({ variant = "layer" }) {
  const { status, firstFrame } = useCamera();
  const ui = useUi();
  const actions = useCameraActions();
  const { trayOpen, closeTray } = useHistoryBack();
  const ref = useRef(null);
  useCameraMount(ref);
  const lcd = useLcd(ui.pageKey);

  const home = ui.pageKey === "home" || ui.pageKey === "notfound";
  const docked = !home;
  const dockOpen = docked && ui.dockOpen;
  const flipped = ui.view === "rear";
  const ready = status === "ready";
  const cover = ui.introPhase === "cover" || !firstFrame;
  const dial = String(ui.dialPreview ?? ui.sectionIndex);
  const intro = ui.introPhase === "sweep" && home ? "1" : "0";
  // the card door stands open while the Collections dock is up and while a card goes in
  const door = { "data-door": trayOpen || ui.inserting ? "open" : "closed", "data-slot": ui.inserting ? "lit" : "" };

  if (status === "nowebgl") return null;

  if (variant === "phone") {
    return (
      <>
        <div ref={ref} className="mcam" data-cam={flipped ? "rear" : "front"} data-tilt="on" data-fit="0.74" data-dial={dial} data-intro={intro} {...door} {...lcd}>
          <canvas data-cam-canvas="1" className={"camcanvas camfade" + (cover ? " cover" : "")} aria-hidden="true" />
          {ready && <CameraHotspots keys={PHONE_HOTSPOT_KEYS} actions={actions} />}
        </div>
        <CameraLegend variant="phone" actions={actions} />
      </>
    );
  }

  const stageClass = "stage " + (docked ? "dock" + (dockOpen ? " open" : "") : "hero") + (cover ? " cover" : "");

  return (
    <div
      ref={ref}
      className={"camlayer" + (docked ? " docked-cam" : " on-home")}
      data-cam={docked || flipped ? "rear" : "front"}
      data-tilt="on"
      data-fit={docked ? "0.86" : "0.92"}
      data-hotspots={docked && !dockOpen ? "off" : "on"}
      data-intro={intro}
      data-dial={dial}
      {...door}
      {...lcd}
    >
      {dockOpen && <button type="button" className="dockscrim" tabIndex={-1} aria-label="Close camera controls" onClick={() => (trayOpen ? closeTray() : ui.setDockOpen(false))} />}
      <div className={stageClass}>
        <canvas data-cam-canvas="1" className="camcanvas" aria-hidden="true" />
        {docked && !dockOpen && ready && (
          <button type="button" className="dockhit" aria-label="Show camera controls" onClick={() => ui.setDockOpen(true)}>
            <span aria-hidden="true">Camera controls</span>
          </button>
        )}
      </div>
      {home && ready && <LeaderLabels view={flipped ? "rear" : "front"} actions={actions} cover={cover} />}
      {home && ui.dialOpen && <SectionsDial variant="float" flipped={flipped} />}
      {ready && <CameraHotspots keys={docked ? DOCK_HOTSPOT_KEYS : HOTSPOT_KEYS} actions={actions} tips={docked} />}
      {dockOpen && <CameraLegend variant="dock" actions={actions} />}
    </div>
  );
}
