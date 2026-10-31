import { useEffect, useRef, useState } from "react";
import { usePeek, useUi } from "@/context/uiContext";
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

// The LCD shows the page, or what is hovered on it (a project, role or roll) while the camera is docked.
function useLcd(pageKey, peek) {
  const home = pageKey === "home" || pageKey === "notfound";
  if (peek && !home) return { "data-page": peek.page, "data-sub": peek.sub, "data-count": peek.count ?? "" };
  return {
    "data-page": pageByKey(home ? "home" : pageKey).lcd,
    "data-sub": home ? HOME_SUB : "adamzhang.org",
    "data-count": lcdCounter(pageKey),
  };
}

const LEARNED = "ayz-cam-learned"; // someone has opened the docked camera: no more hints
const learned = () => {
  try {
    return localStorage.getItem(LEARNED) === "1";
  } catch {
    return false;
  }
};
const SWEEP_MS = 2200; // a hint sweep, start to finish
let sweepEnds = 0; // when the running hint sweep finishes; outlives page changes so fast hops don't restart it

/* A gentle hint that the docked camera opens: 1.5 s after each page with the docked camera settles, its
   buttons sweep purple, until someone opens it once. A page change during a sweep lets it finish rather
   than starting it over. Returns the hint's sweep id (0 = none yet). */
function useDockNudge(active, dockOpen, screen) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!dockOpen) return;
    try {
      localStorage.setItem(LEARNED, "1");
    } catch {
      /* storage blocked */
    }
  }, [dockOpen]);
  useEffect(() => {
    if (!active || learned() || performance.now() < sweepEnds) return undefined;
    const t = setTimeout(() => {
      sweepEnds = performance.now() + SWEEP_MS;
      setN((x) => x + 1);
    }, 1500);
    return () => clearTimeout(t);
  }, [active, screen]);
  return n;
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
  const lcd = useLcd(ui.pageKey, usePeek());

  const home = ui.pageKey === "home" || ui.pageKey === "notfound";
  const docked = !home;
  const dockOpen = docked && ui.dockOpen;
  const flipped = ui.view === "rear";
  const ready = status === "ready";
  const cover = ui.introPhase === "cover" || !firstFrame;
  const dial = String(ui.dialPreview ?? ui.sectionIndex);
  // the buttons sweep purple on every arrival at Home (after the first visit's intro), every time the
  // docked camera opens, and as a hint until it has been opened once; each sweep gets a new id
  const [opens, setOpens] = useState({ open: dockOpen, n: 0 });
  if (opens.open !== dockOpen) setOpens({ open: dockOpen, n: opens.n + (dockOpen ? 1 : 0) });
  const nudge = useDockNudge(variant === "layer" && docked && ready && !dockOpen && !trayOpen && !ui.overlay, dockOpen, ui.screenCount);
  const sweep = home ? (ui.introPhase === "sweep" || ui.introPhase === "done" ? `home-${ui.screenCount}` : "0") : dockOpen ? `dock-${opens.n}` : nudge ? `nudge-${nudge}` : "0";
  const sweepDelay = home ? "1300" : dockOpen ? "500" : "200"; // Home lets the page settle first; a hint has already waited
  // the card door stands open while the Collections dock is up and while a card goes in
  const door = { "data-door": trayOpen || ui.inserting ? "open" : "closed", "data-slot": ui.inserting ? "lit" : "" };

  if (status === "nowebgl") return null;

  if (variant === "phone") {
    return (
      <>
        <div ref={ref} className="mcam" data-cam={flipped ? "rear" : "front"} data-tilt="on" data-fit="0.74" data-dial={dial} data-sweep={sweep} data-sweep-delay={sweepDelay} {...door} {...lcd}>
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
      data-sweep={sweep}
      data-sweep-delay={sweepDelay}
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
      {docked && ready && <CameraLegend variant="dock" open={dockOpen} actions={actions} />}
    </div>
  );
}
