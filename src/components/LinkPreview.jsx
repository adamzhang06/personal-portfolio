import { Github, Link2 } from "lucide-react";
import previews from "@/data/link-previews.json";

const hostOf = (href) => new URL(href).hostname.replace(/^www\./, "");

/* A link shown as a preview card: the page's own preview image, title and description, fetched ahead
   of time by `npm run link-previews` (src/data/link-previews.json). Where a site gives no image, the
   link's label is set as type. */
export function LinkPreview({ link }) {
  const p = previews[link.href] ?? {};
  const image = p.image ?? null;
  const title = p.title ?? link.label;
  return (
    <a className="lp" href={link.href} target="_blank" rel="noopener noreferrer">
      <span className="lp-media">
        {image ? (
          <img src={image} alt="" loading="lazy" />
        ) : (
          <span className="lp-type" aria-hidden="true">
            {link.label}
          </span>
        )}
      </span>
      <span className="lp-body">
        <span className="lp-kind">
          <span>{link.label}</span>
          <span>
            {p.domain ?? hostOf(link.href)} <span aria-hidden="true">↗</span>
          </span>
        </span>
        <b className="lp-title">{title}</b>
        {p.description && <span className="lp-desc">{p.description}</span>}
      </span>
    </a>
  );
}

// Devpost's hexagon "D" mark, drawn in Lucide's stroke style.
const Devpost = ({ size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2.5 20.25 7.25v9.5L12 21.5l-8.25-4.75v-9.5Z" />
    <path d="M9.5 8.5h2a3.5 3.5 0 0 1 0 7h-2Z" />
  </svg>
);

const ICONS = { "github.com": Github, "devpost.com": Devpost };

// Small logo + label buttons, for a project's GitHub / Devpost links (no preview card).
export function LinkButtons({ links }) {
  if (!links?.length) return null;
  return (
    <div className="lbtns-row">
      {links.map((l) => {
        const Icon = ICONS[hostOf(l.href)] ?? Link2;
        return (
          <a key={l.href} className="btn small" href={l.href} target="_blank" rel="noopener noreferrer">
            <Icon size={18} aria-hidden="true" /> {l.label} <span aria-hidden="true">↗</span>
          </a>
        );
      })}
    </div>
  );
}

export function LinkPreviews({ links, className = "" }) {
  if (!links?.length) return null;
  return (
    <div className={"lps " + className}>
      {links.map((l) => (
        <LinkPreview key={l.href} link={l} />
      ))}
    </div>
  );
}
