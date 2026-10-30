import { DEMO_VIDEOS, PHOTOGRAPHY_ENABLED } from "@/data/site";

// Plain-English label first; the camera term is the small mono suffix.
export const CONTROLS = {
  shutter: { label: "Contact", term: "Shutter" },
  mode: { label: "Sections", term: "Mode dial" },
  record: { label: "Demo videos", term: "Record" },
  door: { label: "Collections", term: "Card door" },
  monitor: { label: "Flip the camera", term: "Monitor" },
  play: { label: "Photography", term: "Playback ▶" },
  menu: { label: "Site menu", term: "Menu" },
  info: { label: "Quick facts", term: "i" },
  ok: { label: "Open highlighted", term: "OK" },
};

export const ariaFor = (k) => `${CONTROLS[k].label} (${CONTROLS[k].term.replace(" ▶", "")} button)`;

// Playback is hidden while photography is flagged off; Record while demo videos are off.
const enabled = (k) => (k !== "play" || PHOTOGRAPHY_ENABLED) && (k !== "record" || DEMO_VIDEOS);
const live = (list) => list.filter(enabled);

export const HOTSPOT_KEYS = live(["shutter", "mode", "door", "monitor", "play", "menu", "info", "ok", "record"]);
export const DOCK_HOTSPOT_KEYS = HOTSPOT_KEYS.filter((k) => k !== "monitor");
export const PHONE_HOTSPOT_KEYS = live(["shutter", "mode", "door", "monitor", "record"]);
export const DOCK_LEGEND_KEYS = live(["mode", "shutter", "play", "menu", "info", "record"]);
export const PHONE_LEGEND_KEYS = live(["shutter", "mode", "door", "play", "menu", "info", "record"]);

// Home leader labels, placed on the 1440 × 900 hero: left = calc(lp% + lx px), top = y px.
export const LEADERS = {
  front: live(["shutter", "record", "mode", "door"]).map((k) => ({
    k,
    ...{ shutter: { lp: 50, lx: -24, y: 236 }, record: { lp: 50, lx: 140, y: 236 }, mode: { lp: 50, lx: 510, y: 346 }, door: { lp: 50, lx: 510, y: 566 } }[k],
  })),
  rear: live(["play", "info", "menu"]).map((k) => ({
    k,
    ...{
      play: { lp: 50, lx: -40, y: 300 }, // above the camera, clear of the Polaroid
      info: { lp: 50, lx: 510, y: 526 },
      menu: { lp: 50, lx: 510, y: 646 },
    }[k],
  })),
};
