import { useUi } from "@/context/uiContext";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { coverOf, projects } from "@/data/projects";
import { cardByKey } from "@/data/cards";
import { CardHead } from "@/components/CardHead";

// 2 × 2 project cards led by each project's first picture (a type cover when it has none yet).
// The whole card is the link; hover / focus highlights it, and the camera's OK opens it.
export function Projects() {
  const { highlighted, setHighlighted } = useUi();
  const { go } = useHistoryBack();
  return (
    <div className="wrap page">
      <CardHead card={cardByKey("projects")} />
      <div className="cards">
        {projects.map((p, i) => {
          const cover = coverOf(p);
          return (
            <article key={p.slug} className={"card" + (i === highlighted ? " hl" : "")} onMouseEnter={() => setHighlighted(i)}>
              <div className="card-cover">
                {cover ? (
                  <img src={cover.src} alt={cover.alt} loading={i < 2 ? "eager" : "lazy"} />
                ) : (
                  <span className="card-cover-type" aria-hidden="true">
                    {p.name}
                  </span>
                )}
              </div>
              <p className="meta">{p.period}</p>
              <h3>
                <button type="button" className="stretch" onClick={() => go(`/projects/${p.slug}`)} onFocus={() => setHighlighted(i)}>
                  {p.name}
                </button>
              </h3>
              <p className="winline">{p.result}</p>
              <p className="sum">{p.summary}</p>
              <div className="tags">
                {p.tech.slice(0, 4).map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
