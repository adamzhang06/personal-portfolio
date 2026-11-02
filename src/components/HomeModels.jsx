import { useLcdPeek } from "@/context/uiContext";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { models, previewOf } from "@/data/models";

/* Home's 3D models: a still of each (no WebGL here) linking to the page where it can be turned and zoomed.
   Hovering one previews it on the docked camera's LCD. */
export function HomeModels() {
  const { go } = useHistoryBack();
  const peek = useLcdPeek();
  return (
    <div className="wrap homewrap">
      <section className="block" aria-labelledby="home-models">
        <h2 id="home-models">3D models</h2>
        <div className="grid grid-cols-1 gap-6 min-[861px]:grid-cols-2 min-[1200px]:grid-cols-4">
          {models.map((m) => (
            <article key={m.src} className="card" {...peek({ page: m.title, sub: m.meta, count: "3D" })}>
              <div className="card-cover aspect-[4/3]! bg-[#111115]!">
                <img src={previewOf(m.src)} alt={`3D model of ${m.title}`} loading="lazy" />
              </div>
              <p className="meta">{m.meta}</p>
              <h3>
                <button type="button" className="stretch" onClick={() => go(m.href)}>
                  {m.title}
                </button>
              </h3>
              <span className="lt-go" aria-hidden="true">
                Learn more on the {m.page} page →
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
