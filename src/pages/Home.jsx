import { useLayoutEffect } from "react";
import { useUi } from "@/context/uiContext";
import { useMediaQuery, PHONE_QUERY } from "@/hooks/useMediaQuery";
import { CameraStage } from "@/components/camera/CameraStage";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { AVAILABILITY, HEADLINE_LINES, INTRO, NAME } from "@/data/site";
import { HeroLinks } from "@/components/HeroLinks";
import { HomeModels } from "@/components/HomeModels";
import { Latest } from "@/components/Latest";
import { Polaroid } from "@/components/Polaroid";
import { Rich } from "@/components/Rich";
import { ScrollCue } from "@/components/ScrollCue";

const HERO_H = 828; // the hero's design height (site.css .hero), under the 72px top bar

/* On a laptop window shorter than the hero (900px tall with the top bar), scale the hero and its camera down to fit,
   so Flip the camera and the polaroid stay on the first screen: --hk on <html>, read by .hero and .stage.hero. */
function useHeroFit() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    // On touch devices the browser's toolbars collapse on scroll, firing height-only resizes; refitting on those made the
    // whole hero zoom in mid-scroll. There, refit only when the width changes (rotation), so scrolling just reveals more page.
    const touch = window.matchMedia("(pointer: coarse)").matches;
    let lastW = 0;
    const fit = () => {
      const w = window.innerWidth;
      if (touch && w === lastW) return;
      lastW = w;
      root.style.setProperty("--hk", Math.min(1, Math.max(0.8, (window.innerHeight - 72) / HERO_H)).toFixed(3));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => {
      window.removeEventListener("resize", fit);
      root.style.removeProperty("--hk");
    };
  }, []);
}

export function Home({ notFound = false }) {
  const { view, setView } = useUi();
  const phone = useMediaQuery(PHONE_QUERY);
  useHeroFit();
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
        {/* phones: the camera follows the headline (desktop draws it in the fixed camera layer instead) */}
        {phone && <CameraStage variant="phone" />}
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
