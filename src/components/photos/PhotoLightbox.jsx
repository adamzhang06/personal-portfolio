import { useEffect, useState } from "react";
import { Lightbox } from "@/components/MediaGrid";

// "2022-06-03T19:56" → "2022/06/03 19:56", as the camera stamps it; a film scan has only its month: "2023/03"
const stamp = (takenAt) => takenAt.replace(/-/g, "/").replace("T", " ");
const fileOf = (src) => src.split("/").pop().toUpperCase();

// The photo's luminance histogram as an SVG path in a 63 × 24 box, on a square-root scale so both ends read.
function useHistogram(src) {
  const [d, setD] = useState("");
  useEffect(() => {
    let live = true;
    const img = new Image();
    img.src = src;
    img
      .decode()
      .then(() => {
        if (!live) return;
        const w = 96, h = Math.max(1, Math.round((w * img.naturalHeight) / img.naturalWidth));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const x = c.getContext("2d", { willReadFrequently: true });
        x.drawImage(img, 0, 0, w, h);
        const px = x.getImageData(0, 0, w, h).data;
        const bins = new Array(64).fill(0);
        for (let k = 0; k < px.length; k += 4) bins[(0.2126 * px[k] + 0.7152 * px[k + 1] + 0.0722 * px[k + 2]) >> 2]++;
        const top = Math.sqrt(Math.max(...bins)) || 1;
        setD("M0,24" + bins.map((b, k) => `L${k},${(24 - (Math.sqrt(b) / top) * 23).toFixed(1)}`).join("") + "L63,24Z");
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [src]);
  return d;
}

/* The camera's playback screen: the LCD in its bezel, printed with the file name and frame count, the exposure (or
   the film stock for a scan) and lens beside a histogram, then the camera and its time stamp. The title and place
   sit under the camera as the caption. */
function Playback({ p, i, n }) {
  const hist = useHistogram(p.src);
  const readout = [...(p.exposure ? p.exposure.split(" · ") : [p.film, "Scan"]), p.lens].filter(Boolean);
  return (
    <figure className="pb">
      <div className="pb-lcd">
        <div className="pb-bar">
          <span>▶ {fileOf(p.src)}</span>
          <span>
            {i + 1}/{n}
          </span>
        </div>
        <div className="pb-scr">
          <img src={p.src} alt={p.alt} />
        </div>
        <div className="pb-bar pb-exp">
          <span className="pb-vals">
            {readout.map((v) => (
              <span key={v}>{v}</span>
            ))}
          </span>
          {hist && (
            <svg className="pb-hist" viewBox="0 0 63 24" preserveAspectRatio="none" aria-hidden="true">
              <path d={hist} />
            </svg>
          )}
        </div>
        <div className="pb-bar">
          <span>{p.camera}</span>
          <span>{stamp(p.takenAt)}</span>
        </div>
      </div>
      <figcaption>
        <strong>{p.title}</strong>
        {p.place && <span> · {p.place}</span>}
      </figcaption>
    </figure>
  );
}

// The site lightbox over a list of photos, each shown as the camera's playback screen.
export function PhotoLightbox({ photos, index, onIndex }) {
  return <Lightbox images={photos} index={index} onIndex={onIndex} render={(p, i) => <Playback key={p.id} p={p} i={i} n={photos.length} />} />;
}
