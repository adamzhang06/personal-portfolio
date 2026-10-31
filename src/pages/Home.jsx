import { useUi } from "@/context/uiContext";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { AVAILABILITY, HEADLINE_LINES, INTRO, NAME } from "@/data/site";
import { liveCards } from "@/data/cards";
import { HeroLinks } from "@/components/HeroLinks";
import { Latest } from "@/components/Latest";
import { Polaroid } from "@/components/Polaroid";
import { Rich } from "@/components/Rich";
import { SdCard } from "@/components/SdCard";

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
          <p className="eyebrow">{NAME} · Purdue AI</p>
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
      </section>

      <div className="wrap homewrap">
        <section className="block" aria-labelledby="home-coll">
          <p className="eyebrow">Card door</p>
          <h2 id="home-coll">Collections</h2>
          <div className="sds">
            {liveCards.map((c) => (
              <button key={c.key} type="button" className="sdlink" aria-label={`${c.name}, ${c.count}`} onClick={() => go(c.path)}>
                <SdCard card={c} />
              </button>
            ))}
          </div>
        </section>
      </div>
      <Latest />
    </>
  );
}
