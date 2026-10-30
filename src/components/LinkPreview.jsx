import previews from "@/data/link-previews.json";

const hostOf = (href) => new URL(href).hostname.replace(/^www\./, "");

/* A link shown as a preview card: the page's own preview image, title and description, fetched ahead
   of time by `npm run link-previews` (src/data/link-previews.json). Where a site gives no preview,
   `fallback` (the project's cover and name) fills in, else the link's label is set as type. */
export function LinkPreview({ link, fallback }) {
  const p = previews[link.href] ?? {};
  const image = p.image ?? fallback?.image ?? null;
  const title = p.title ?? fallback?.title ?? link.label;
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

export function LinkPreviews({ links, fallback, className = "" }) {
  if (!links?.length) return null;
  return (
    <div className={"lps " + className}>
      {links.map((l) => (
        <LinkPreview key={l.href} link={l} fallback={fallback} />
      ))}
    </div>
  );
}
