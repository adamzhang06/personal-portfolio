import { PHOTOGRAPHY_ENABLED } from "./site";
import { projects } from "./projects";
import { rolesIn } from "./roles";

// Counts are computed from the data files, never typed.
const items = (n) => `${String(n).padStart(2, "0")} ${n === 1 ? "item" : "items"}`;

// SD cards, in Home / tray order. Each opens its section page.
export const CARDS = [
  { key: "about", name: "About", path: "/about", c1: "#7A4FD6", c2: "#4A2D96", contents: "Education · study abroad · skills · interests", count: "Profile" },
  { key: "projects", name: "Projects", path: "/projects", c1: "#5B3AA8", c2: "#3A2470", contents: projects.map((p) => p.name).join(" · "), count: items(projects.length) },
  {
    key: "experience", name: "Experience", path: "/experience", c1: "#46308A", c2: "#2A2057",
    contents: "Raccoon Dynamics · The Data Mine · AIDA3 · WashU · SLU · FIRST Tech Challenge", count: items(rolesIn("experience").length),
  },
  {
    key: "leadership", name: "Leadership", path: "/leadership", c1: "#34343D", c2: "#22222A",
    contents: "CS 19300 TA · Purdue CS Undergraduate Student Board · Purdue Formula SAE", count: items(rolesIn("leadership").length),
  },
  { key: "photos", name: "Photos", path: "/photos", c1: "#2C2C34", c2: "#1B1B21", contents: "@ayz.nef · digital and film", count: "@ayz.nef", photography: true },
];

export const liveCards = CARDS.filter((c) => PHOTOGRAPHY_ENABLED || !c.photography);
export const cardByKey = (key) => CARDS.find((c) => c.key === key);
