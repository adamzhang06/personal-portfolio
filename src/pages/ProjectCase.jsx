import { useParams } from "react-router-dom";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { coverOf, projects } from "@/data/projects";
import { Crumb } from "@/components/CardHead";
import { MediaGrid } from "@/components/MediaGrid";
import { LinkPreviews } from "@/components/LinkPreview";
import { Home } from "./Home";

const pad = (n) => String(n).padStart(2, "0");

// Case study inside a rounded viewfinder frame. Previous / next replace history, so Back still returns
// to wherever the visitor came from. Links and media blocks are omitted when empty.
export function ProjectCase() {
  const { slug } = useParams();
  const { go } = useHistoryBack();
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) return <Home notFound />;
  const p = projects[i];
  const prev = projects[(i + projects.length - 1) % projects.length];
  const next = projects[(i + 1) % projects.length];

  return (
    <div className="wrap page">
      <article className="vf" aria-labelledby="case-h1">
        <div className="vf-top">
          <Crumb />
          <span className="mono muted">
            {pad(i + 1)} / {pad(projects.length)}
          </span>
        </div>
        <div className="vf-head">
          <div>
            <p className="eyebrow">{p.period}</p>
            <h1 id="case-h1">{p.name}</h1>
            <p className="sub">{p.result}</p>
          </div>
          <div className="result">
            <p className="eyebrow">Result</p>
            <b>{p.big}</b>
            <span>{p.bigSub}</span>
          </div>
        </div>
        <div className="case">
          <div>
            <h2>What it is</h2>
            <p className="it">{p.lede}</p>
            <h2>What I did</h2>
            <ul>
              {p.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            {p.media.length > 0 && (
              <>
                <h2 style={{ marginTop: 32 }}>Media</h2>
                <MediaGrid media={p.media} />
              </>
            )}
          </div>
          <aside>
            <h2>Built with</h2>
            <div className="tags">
              {p.tech.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
            {p.links.length > 0 && (
              <>
                <h2 style={{ marginTop: 20 }}>Links</h2>
                <LinkPreviews links={p.links} fallback={{ image: coverOf(p)?.src, title: p.name }} />
              </>
            )}
          </aside>
        </div>
        <nav className="pn" aria-label="More projects">
          <button type="button" className="btn" onClick={() => go(`/projects/${prev.slug}`, { replace: true })}>
            <span aria-hidden="true">←</span> {prev.name}
          </button>
          <button type="button" className="btn" onClick={() => go(`/projects/${next.slug}`, { replace: true })}>
            {next.name} <span aria-hidden="true">→</span>
          </button>
        </nav>
      </article>
    </div>
  );
}
