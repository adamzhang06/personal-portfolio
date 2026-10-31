import { Lightbox } from "@/components/MediaGrid";
import { photoTech, photoWhen } from "@/lib/rolls";

// The site lightbox over a list of photos, captioned with title, date, place and camera details.
export function PhotoLightbox({ photos, index, onIndex }) {
  const images = photos.map((p) => ({
    src: p.src,
    alt: p.alt,
    caption: (
      <>
        <strong>{p.title}</strong> · {photoWhen(p)} · {photoTech(p)}
      </>
    ),
  }));
  return <Lightbox images={images} index={index} onIndex={onIndex} />;
}
