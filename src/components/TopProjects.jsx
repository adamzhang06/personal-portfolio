import { RouteLink } from "@/components/RouteLink";
import { TOP_PROJECTS, coverOf, projectBySlug } from "@/data/projects";
import { Img } from "@/components/Img";

/* The Projects page's Top 3: a small ranked list (01–03, top to bottom) set against the page's SD card in the head,
   each row a tiny cover and the project's name. A row opens that case study. Order: TOP_PROJECTS. */
export function TopProjects() {
  const top = TOP_PROJECTS.map(projectBySlug).filter(Boolean);

  return (
    <nav className="top3" aria-labelledby="top3-h">
      <p className="top3-h" id="top3-h">
        Top 3
      </p>
      <ol>
        {top.map((p, i) => {
          const cover = coverOf(p);
          return (
            <li key={p.slug}>
              <RouteLink className="top3-row" to={`/projects/${p.slug}`}>
                <span className="top3-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="top3-img" aria-hidden="true">
                  {cover && <Img src={cover.src} alt="" loading="eager" style={{ objectPosition: cover.position }} />}
                </span>
                <span className="top3-name">{p.name}</span>
              </RouteLink>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
