import { useState } from "react";
import { NativeDialog } from "./NativeDialog";

const EMBED_SRC = {
  youtube: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
  vimeo: (id) => `https://player.vimeo.com/video/${id}`,
};

const Embed = ({ provider, id, title }) => (
  <iframe
    src={EMBED_SRC[provider](id)}
    title={title}
    loading="lazy"
    allow="autoplay; fullscreen; picture-in-picture"
    allowFullScreen
  />
);

// A project's demo video: one YouTube / Vimeo player at 16:9.
export function VideoEmbed({ video, title }) {
  return (
    <div className="video">
      <Embed {...video} title={title} />
    </div>
  );
}

/* One photo at full size over the page. ← → step through the grid's photos, wrapping; Esc, Close or a
   click outside the photo closes it. Also used by the Photos page, whose `render` draws each photo as the camera's
   playback screen in place of the plain figure. */
export function Lightbox({ images, index, onIndex, render }) {
  const m = images[index];
  const step = (d) => onIndex((index + d + images.length) % images.length);
  const onKey = (e) => {
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  };
  return (
    <NativeDialog open={index != null} onClose={() => onIndex(null)} className="lbox">
      {m && (
        <div className="lbox-in" onKeyDown={onKey}>
          {render ? (
            render(m, index)
          ) : (
            <figure>
              <img src={m.src} alt={m.alt} />
              <figcaption>
                {m.caption && <span>{m.caption}</span>}
                {images.length > 1 && (
                  <span className="note">
                    {index + 1} / {images.length}
                  </span>
                )}
              </figcaption>
            </figure>
          )}
          {images.length > 1 && (
            <>
              <button type="button" className="lb-btn lb-prev" aria-label="Previous photo" onClick={() => step(-1)}>
                ←
              </button>
              <button type="button" className="lb-btn lb-next" aria-label="Next photo" onClick={() => step(1)}>
                →
              </button>
            </>
          )}
          <button type="button" className="lb-btn lb-close" aria-label="Close" data-autofocus onClick={() => onIndex(null)}>
            ✕
          </button>
        </div>
      )}
    </NativeDialog>
  );
}

// Photos (16:10 unless they set an aspect, captions), video files and YouTube / Vimeo embeds for
// projects and roles. Photos open in a lightbox. An empty list renders nothing.
export function MediaGrid({ media }) {
  const [shown, setShown] = useState(null); // index into images, or null when the lightbox is closed
  if (!media?.length) return null;
  const images = media.filter((m) => m.type === "image");
  return (
    <>
      <div className="mgrid">
        {media.map((m) => (
          <figure key={m.src ?? `${m.provider}-${m.id}`}>
            {m.type === "video" ? (
              <video controls preload="metadata" poster={m.poster} src={m.src} aria-label={m.alt || m.caption || undefined} />
            ) : m.type === "embed" ? (
              <Embed provider={m.provider} id={m.id} title={m.caption || `${m.provider} video`} />
            ) : (
              <button type="button" className="mzoom" aria-label={`Enlarge photo: ${m.alt}`} onClick={() => setShown(images.indexOf(m))}>
                <img src={m.src} alt="" loading="lazy" style={m.aspect ? { aspectRatio: m.aspect } : undefined} />
              </button>
            )}
            {m.caption && <figcaption>{m.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <Lightbox images={images} index={shown} onIndex={setShown} />
    </>
  );
}
