import { useEffect, useRef, useState } from "react";
import { useUi } from "@/context/uiContext";
import { NAME } from "@/data/site";

let developed = false; // the portrait develops once per page load

/* The Home portrait as an instant print. On the first Home of a visit it develops like instant film: a pale blank
   that the picture comes up through, starting once the intro has opened and the print is on screen. */
export function Polaroid() {
  const { introPhase } = useUi();
  const [develop] = useState(() => !developed);
  const [seen, setSeen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    developed = true;
    if (!develop || !ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.5 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [develop]);

  const waiting = introPhase === "cover" || introPhase === "opening" || !seen;
  return (
    <figure ref={ref} className={"polaroid" + (develop ? " dev" : "") + (develop && waiting ? " wait" : "")}>
      <img src="/assets/portrait.jpg" alt="Adam Zhang smiling outdoors in a black Purdue quarter-zip, trees behind him" width="216" height="216" />
      <figcaption>{NAME}</figcaption>
    </figure>
  );
}
