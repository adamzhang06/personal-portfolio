import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { hasWebGL } from "@/lib/webgl";

const ModelViewer = lazy(() => import("./ModelViewer"));

// ModelViewer's frame, held empty until it arrives.
const FRAME = "aspect-[4/3] w-full rounded-xl border border-[#2A2A33] bg-[#111115]";

/* A ModelViewer that costs nothing until it's near the screen: three.js and the GLB load once the frame comes
   within 200 px of the viewport, and the frame holds its 4:3 shape meanwhile so nothing shifts. Without WebGL
   it renders nothing. Off screen again, the viewer stops drawing. */
export function LazyModel(props) {
  const ref = useRef(null);
  const [gl] = useState(() => typeof document !== "undefined" && hasWebGL());
  const [near, setNear] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window)); // no observer: load now
  const [seen, setSeen] = useState(near);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (es) => {
        const on = es[es.length - 1].isIntersecting;
        setNear(on);
        if (on) setSeen(true);
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [gl]);

  if (!gl) return null;
  return (
    <div ref={ref}>
      {seen ? (
        <Suspense fallback={<div className={FRAME} />}>
          <ModelViewer {...props} active={near} />
        </Suspense>
      ) : (
        <div className={FRAME} />
      )}
    </div>
  );
}
