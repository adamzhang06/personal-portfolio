import { PHOTOGRAPHY_ENABLED } from "./site";
import { projectBySlug } from "./projects";

// Every top-level screen, in LCD-counter order. `dial` is the mode-dial notch (H · A · P · E · L).
export const PAGES = [
  { key: "home", label: "Home", lcd: "Adam Zhang", path: "/", dial: 0 },
  { key: "about", label: "About", lcd: "About", path: "/about", dial: 1, nav: true },
  { key: "projects", label: "Projects", lcd: "Projects", path: "/projects", dial: 2, nav: true },
  { key: "experience", label: "Experience", lcd: "Experience", path: "/experience", dial: 3, nav: true },
  { key: "leadership", label: "Leadership", lcd: "Leadership", path: "/leadership", dial: 4, nav: true },
  { key: "photography", label: "Photography", lcd: "Photography", path: "/photos", nav: true, photography: true },
  { key: "contact", label: "Contact", lcd: "Contact", path: "/contact", nav: true },
];

export const livePages = PAGES.filter((p) => PHOTOGRAPHY_ENABLED || !p.photography);
export const navPages = livePages.filter((p) => p.nav);
export const dialPages = PAGES.filter((p) => p.dial !== undefined).sort((a, b) => a.dial - b.dial);
export const pageByKey = (key) => PAGES.find((p) => p.key === key);

export const TAB_KEYS = ["home", "about", "projects", "experience", "contact"];

// Route → page key. Case studies belong to Projects; anything unknown is Home with the not-found pill.
export function pageKeyFor(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return "home";
  const caseSlug = path.match(/^\/projects\/([^/]+)$/)?.[1];
  if (caseSlug) return projectBySlug(caseSlug) ? "projects" : "notfound";
  const page = PAGES.find((p) => p.path === path);
  return page ? page.key : "notfound";
}

export function lcdCounter(key) {
  const k = key === "notfound" ? "home" : key;
  const i = livePages.findIndex((p) => p.key === k);
  if (i < 0) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(i + 1)} / ${pad(livePages.length)}`;
}
