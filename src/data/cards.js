import { PHOTOGRAPHY_ENABLED } from "./site";
import { projects } from "./projects";
import { rolesIn } from "./roles";

// Counts are computed from the data files, never typed.
const items = (n) => `${n} ${n === 1 ? "item" : "items"}`;

// SD cards, in Home / tray order. Each opens its section page; `sub` is the line under that page's heading.
export const CARDS = [
  { key: "about", name: "About", path: "/about", c1: "#7A4FD6", c2: "#4A2D96", contents: "Education · study abroad · skills · interests", count: "Profile",
    sub: "Who I am, where I study, and what I work with." },
  { key: "projects", name: "Projects", path: "/projects", c1: "#5B3AA8", c2: "#3A2470", contents: projects.map((p) => p.name).join(" · "), count: items(projects.length),
    sub: "What I’ve built, and the part I played in each." },
  {
    key: "experience", name: "Experience", path: "/experience", c1: "#46308A", c2: "#2A2057",
    contents: "Raccoon Dynamics · The Data Mine · AIDA3 · WashU · SLU · FIRST Tech Challenge", count: items(rolesIn("experience").length),
    sub: "Where I’ve worked and done research, newest first.",
  },
  {
    key: "leadership", name: "Leadership", path: "/leadership", c1: "#34343D", c2: "#22222A",
    contents: "CS 19300 TA · Purdue CS Undergraduate Student Board · Purdue Formula SAE", count: items(rolesIn("leadership").length),
    sub: "Where I’ve led, served, and taught outside of class.",
  },
  { key: "photos", name: "Photos", path: "/photos", c1: "#2C2C34", c2: "#1B1B21", contents: "@ayz.nef · digital and film", count: "@ayz.nef", photography: true,
    sub: "A collection of moments I’ve captured. Digital and film." },
];

export const liveCards = CARDS.filter((c) => PHOTOGRAPHY_ENABLED || !c.photography);
export const cardByKey = (key) => CARDS.find((c) => c.key === key);
