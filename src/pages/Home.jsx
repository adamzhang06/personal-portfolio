import { useUi } from "@/context/uiContext";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { AVAILABILITY, HEADLINE_LINES, INTRO, NAME } from "@/data/site";
import { HeroLinks } from "@/components/HeroLinks";
import { HomeModels } from "@/components/HomeModels";
import { Latest } from "@/components/Latest";
import { Polaroid } from "@/components/Polaroid";
import { Rich } from "@/components/Rich";
import { ScrollCue } from "@/components/ScrollCue";

export function Home({ notFound = false }) {
  const { view, setView } = useUi();
  const { go } = useHistoryBack();
  const [l1, l2, l3] = HEADLINE_LINES;

  return (
    <>
      {notFound && (
        <p className="nf" role="status">
          That page doesn’t exist.{" "}
          <button type="button" className="linkbtn" onClick={() => go("/")}>
            Go to Home
          </button>
        </p>
      )}
      <section className="hero" aria-labelledby="home-h1">
        <div className="vf-guides" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <b />
          <em />
        </div>
        <div className="intro">
          <p className="eyebrow">{NAME} · AI @ Purdue</p>
          <h1 className="h-hero" id="home-h1">
            {l1}
            <br /> {l2}
            <br /> <span className="nw">{l3}</span>
          </h1>
          <p className="lede">
            <Rich text={INTRO} />
          </p>
        </div>
        <span className="avail hero-avail">{AVAILABILITY}</span>
        <div className="hero-me">
          <HeroLinks />
          <Polaroid />
        </div>
        <div className="herofoot camonly">
          <button type="button" className="flipbtn" aria-pressed={view === "rear"} onClick={() => setView(view === "rear" ? "front" : "rear")}>
            Flip the camera <span aria-hidden="true">↻</span>
          </button>
        </div>
        <ScrollCue />
      </section>

      <Latest />
      <HomeModels />
    </>
  );
}
