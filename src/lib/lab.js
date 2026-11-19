import { useSyncExternalStore } from "react";

/* transitions-lab only: which page transition and loader are on, picked from the LAB switcher or the URL
   (?fx=old|a|b|c&loader=old|1|2&slow=1) and kept in localStorage so it survives navigation and reloads. */

export const FX_OPTIONS = [
  { id: "old", label: "Current" },
  { id: "a", label: "A · Iris" },
  { id: "b", label: "B · Focus" },
  { id: "c", label: "C · Curtain" },
];
export const LOADER_OPTIONS = [
  { id: "old", label: "Current" },
  { id: "1", label: "1 · Viewfinder" },
  { id: "2", label: "2 · Lens" },
];

const KEY = "ayz-lab";
const DEFAULTS = { fx: "a", loader: "1", slow: false };

function init() {
  let lab = { ...DEFAULTS };
  try {
    lab = { ...lab, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    /* private window: defaults */
  }
  const q = new URLSearchParams(window.location.search);
  if (FX_OPTIONS.some((o) => o.id === q.get("fx"))) lab.fx = q.get("fx");
  if (LOADER_OPTIONS.some((o) => o.id === q.get("loader"))) lab.loader = q.get("loader");
  if (q.has("slow")) lab.slow = q.get("slow") === "1";
  save(lab);
  return lab;
}

function save(lab) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lab));
  } catch {
    /* ignore */
  }
}

let lab = init();
const subs = new Set();

export const getLab = () => lab;
export const labSpeed = () => (lab.slow ? 4 : 1); // every duration is multiplied by this

export function setLab(patch) {
  lab = { ...lab, ...patch };
  save(lab);
  subs.forEach((f) => f());
}

const subscribe = (f) => {
  subs.add(f);
  return () => subs.delete(f);
};

export const useLab = () => useSyncExternalStore(subscribe, getLab);
