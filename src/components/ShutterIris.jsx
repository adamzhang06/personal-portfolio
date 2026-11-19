import { useMemo } from "react";
import { shutterBlades } from "@/lib/iris";

/* A full-screen aperture: eight blades that meet in the middle at a = 0 and clear the screen corners at a = 1.
   Each blade carries a lit edge so it reads as metal against the dark page. */
export function ShutterIris({ a, w, h }) {
  const R = (Math.hypot(w, h) / 2) * 1.12; // the blades' outer chords stay past the corners
  const { blades, hole } = useMemo(() => shutterBlades(a, R), [a, R]);
  return (
    <svg className="sh-iris" viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`} aria-hidden="true">
      <defs>
        <linearGradient id="sh-blade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1C1A24" />
          <stop offset="1" stopColor="#0E0E12" />
        </linearGradient>
        <linearGradient id="sh-blade2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#221B33" />
          <stop offset="1" stopColor="#101015" />
        </linearGradient>
      </defs>
      {blades.map((pts, i) => (
        <polygon key={i} points={pts} fill={`url(#sh-blade${i % 2 ? "2" : ""})`} stroke="rgba(187,163,248,.22)" strokeWidth="1" strokeLinejoin="round" />
      ))}
      {a > 0.002 && a < 0.995 && <polygon points={hole} fill="none" stroke="rgba(242,239,247,.28)" strokeWidth="1.25" strokeLinejoin="round" />}
    </svg>
  );
}
