import { useEffect, useState } from "react";
import { useUi } from "@/context/uiContext";
import { models, previewOf } from "@/data/models";
import { Img } from "@/components/Img";

/* The hero's "there's more below" cue: the 3D model stills as a fanned stack of prints and a bobbing arrow.
   It shows once the intro has opened, fades as soon as the page scrolls, and a click glides to the 3D models. */
export function ScrollCue() {
  const { introPhase } = useUi();
  const [top, setTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setTop(window.scrollY < 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shown = top && introPhase !== "cover" && introPhase !== "opening";
  const toModels = () => document.getElementById("home-models")?.closest("section")?.scrollIntoView({ behavior: "smooth" });

  return (
    <button type="button" className={"scue" + (shown ? " on" : "")} tabIndex={shown ? 0 : -1} onClick={toModels}>
      <span className="scue-prints" aria-hidden="true">
        {models.map((m) => (
          <span key={m.src} className="scue-print">
            <Img src={previewOf(m.src)} alt="" />
          </span>
        ))}
      </span>
      <span className="scue-txt">
        <span className="scue-k">Keep scrolling</span>
        <span className="scue-t">Spin {models.length} of my builds in 3D</span>
      </span>
      <span className="scue-arrow" aria-hidden="true">
        ↓
      </span>
    </button>
  );
}
