import { useState } from "react";

/* An <img> that shows a shimmer on its own box while the file loads, then fades in. Drop-in for <img>: same props.
   An image the browser already has (cached, or loaded earlier) is shown at once with no fade. A failed image stops
   shimmering. The shimmer is the img's own background (see .img-ld in site.css), so it needs no wrapper: the img must have
   a size before it loads (CSS, width/height attributes or an aspect ratio). `fallback`: a src to try if `src` fails
   (a thumbnail not generated yet falls back to the full photo). */
export function Img({ className, onLoad, onError, fallback, ...rest }) {
  const [state, setState] = useState("loading"); // loading → fade (loaded just now) | done (was already there)
  const ref = (el) => {
    if (el?.complete && el.naturalWidth) setState((s) => (s === "loading" ? "done" : s));
  };
  const cls = [className, state === "loading" && "img-ld", state === "fade" && "img-ld-in"].filter(Boolean).join(" ");
  return (
    <img
      {...rest}
      ref={ref}
      className={cls || undefined}
      onLoad={(e) => {
        setState((s) => (s === "loading" ? "fade" : s));
        onLoad?.(e);
      }}
      onError={(e) => {
        const img = e.currentTarget;
        if (fallback && !img.dataset.fellBack) {
          img.dataset.fellBack = "1";
          img.src = fallback;
          return;
        }
        setState("done");
        onError?.(e);
      }}
    />
  );
}
