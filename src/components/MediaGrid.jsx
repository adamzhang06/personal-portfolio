const EMBED_SRC = {
  youtube: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
  vimeo: (id) => `https://player.vimeo.com/video/${id}`,
};

// Photos (16:10, captions), video files and YouTube / Vimeo embeds for projects and roles.
// An empty list renders nothing.
export function MediaGrid({ media }) {
  if (!media?.length) return null;
  return (
    <div className="mgrid">
      {media.map((m) => (
        <figure key={m.src ?? `${m.provider}-${m.id}`}>
          {m.type === "video" ? (
            <video controls preload="metadata" poster={m.poster} src={m.src} aria-label={m.alt || m.caption || undefined} />
          ) : m.type === "embed" ? (
            <iframe
              src={EMBED_SRC[m.provider](m.id)}
              title={m.caption || `${m.provider} video`}
              loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img src={m.src} alt={m.alt} loading="lazy" />
          )}
          {m.caption && <figcaption>{m.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
