import { useState } from "react";

/* An <img> that shows a shimmer on its own box while the file loads, then fades in. Drop-in for <img>: same props.
   An image the browser already has (cached, or loaded earlier) is shown at once with no fade. A failed image stops
   shimmering. The shimmer is the img's own background (see .ld in site.css), so it needs no wrapper: the img must have
   a size before it loads (CSS, width/height attributes or an aspect ratio). */
export function Img({ className, onLoad, onError, ...rest }) {
  const [state, setState] = useState("loading"); // loading → fade (loaded just now) | done (was already there)
  const ref = (el) => {
    if (el?.complete && el.naturalWidth) setState((s) => (s === "loading" ? "done" : s));
  };
  const cls = [className, state === "loading" && "ld", state === "fade" && "ld-in"].filter(Boolean).join(" ");
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
        setState("done");
        onError?.(e);
      }}
    />
  );
}
