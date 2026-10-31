import { useParams } from "react-router-dom";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { projects } from "@/data/projects";
import { Crumb } from "@/components/CardHead";
import { MediaGrid, VideoEmbed } from "@/components/MediaGrid";
import { ProjectLinks } from "@/components/LinkPreview";
import { Rich } from "@/components/Rich";
import { Home } from "./Home";

// Case study inside a rounded viewfinder frame: header with the one-line headline, write-up with a
// Built with / Demo / Links sidebar, then the gallery. Previous / next sit beside the counter at the top
// (arrows only on phones) and replace history, so Back still returns to wherever the visitor came from.
// The demo, links and gallery are omitted when the project has none.
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
          <div className="vf-nav">
            <nav className="pn" aria-label="More projects">
              <button type="button" className="btn small" aria-label={`Previous: ${prev.name}`} onClick={() => go(`/projects/${prev.slug}`, { replace: true })}>
                <span aria-hidden="true">←</span> <span className="pn-name">{prev.name}</span>
              </button>
              <button type="button" className="btn small" aria-label={`Next: ${next.name}`} onClick={() => go(`/projects/${next.slug}`, { replace: true })}>
                <span className="pn-name">{next.name}</span> <span aria-hidden="true">→</span>
              </button>
            </nav>
            <span className="note muted">
              {i + 1} / {projects.length}
            </span>
          </div>
        </div>
        <div className="vf-head">
          <div className="vf-title">
            <p className="eyebrow">{p.period}</p>
            <h1 id="case-h1">{p.name}</h1>
            <p className="rone">{p.summary}</p>
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
            <div className="it">
              {p.lede.split("\n\n").map((para) => (
                <p key={para}>
                  <Rich text={para} />
                </p>
              ))}
            </div>
            <h2>What I did</h2>
            <ul>
              {p.bullets.map((b) => (
                <li key={b}>
                  <Rich text={b} />
                </li>
              ))}
            </ul>
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
            {p.demo && (
              <>
                <h2 style={{ marginTop: 20 }}>Demo</h2>
                <VideoEmbed video={p.demo} title={`${p.name} demo video`} />
              </>
            )}
            <ProjectLinks links={p.links} />
          </aside>
        </div>
        {p.media.length > 0 && (
          <section className="case-sec">
            <h2>Gallery</h2>
            <MediaGrid media={p.media} />
          </section>
        )}
      </article>
    </div>
  );
}
