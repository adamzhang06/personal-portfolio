import { useEffect, useState } from "react";
import { expo } from "@/lib/motion";
import { bladeFill, irisBlades } from "@/lib/iris";

const OPEN_S = 0.6;

/* The loader's final moment, replayed on every new screen: the nearly-open iris swings outward past
   the edges and fades while a light veil lifts off the new page. Mount it with a fresh key to play it
   again; it never takes pointer events and runs on the wall clock, so a slow device never prolongs it. */
export function PageAperture() {
  const [o, setO] = useState(0);

  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const s = Math.min(1, (performance.now() - t0) / 1000 / OPEN_S);
      setO(expo(s));
      if (s < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (o >= 1) return null;
  return (
    <div className="ap" aria-hidden="true">
      <div className="ap-veil" style={{ opacity: (0.32 * (1 - o)).toFixed(3) }} />
      <svg viewBox="-200 -200 400 400">
        <g transform={`scale(${(1 + 5 * o).toFixed(3)}) rotate(${(-12 * o).toFixed(2)})`} opacity={(1 - o * o).toFixed(3)}>
          {irisBlades(1, o).map((pts, i) => (
            <polygon key={i} points={pts} fill={bladeFill(i)} stroke="#2A2A33" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
    </div>
  );
}
