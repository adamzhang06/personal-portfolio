import { projects } from "./projects";
import { roles } from "./roles";

// Every 3D model on the site, for Home's previews: each project's `model` and each role's `models`, with the
// page that shows it live. Stills come from npm run models:previews.
export const previewOf = (src) => src.replace(/^\/models\/(.+)\.glb$/, "/models/previews/$1.webp");

export const models = [
  ...projects
    .filter((p) => p.model)
    .map((p) => ({ src: p.model, title: p.name, meta: p.period, href: `/projects/${p.slug}`, page: p.name })),
  ...roles.flatMap((r) =>
    (r.models ?? []).map((m) => ({
      src: m.src,
      title: m.name,
      meta: `${r.org} · ${m.season}`,
      href: `/${r.group}?role=${r.slug}&model=${m.season.slice(0, 4)}`,
      page: r.group === "experience" ? "Experience" : "Leadership",
    }))
  ),
];
