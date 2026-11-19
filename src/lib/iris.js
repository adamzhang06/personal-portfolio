// Six-blade aperture in a -200…200 viewBox, shared by the loader and the page transition.
// p: how far the aperture has opened (0 → 1); o: the final opening (blades swing fully clear).
export const IRIS_R = 168;

export function irisBlades(p, o = 0) {
  const ap = 0.12 + 0.82 * p + 0.06 * o; // aperture: 12% → wide open
  const r = IRIS_R * ap, phi = ((1 - p) * 34 * Math.PI) / 180;
  const pt = (rad, a) => (rad * Math.cos(a)).toFixed(1) + "," + (rad * Math.sin(a)).toFixed(1);
  return Array.from({ length: 6 }, (_, i) => {
    const a0 = -Math.PI / 2 + (i * Math.PI) / 3, a1 = a0 + Math.PI / 3;
    return [pt(IRIS_R, a0), pt(IRIS_R, a1), pt(r, a1 + phi), pt(r, a0 + phi)].join(" ");
  });
}

export const bladeFill = (i) => (i % 2 ? "#241A3A" : "#18181E");

// A full-screen shutter iris for the lab transitions. a: aperture, 0 (shut) → 1 (clear of the screen);
// R: outer radius in px, comfortably past the screen corners. The blades tile the disk, so at a = 0 they
// meet in the middle; the opening is an n-gon twisted further the more it closes, like real blades.
export function shutterBlades(a, R, n = 8) {
  const r = R * Math.max(0, Math.min(1, a));
  const phi = ((1 - a) * 42 * Math.PI) / 180;
  const pt = (rad, ang) => (rad * Math.cos(ang)).toFixed(1) + "," + (rad * Math.sin(ang)).toFixed(1);
  const blades = [], hole = [];
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n, a1 = a0 + (2 * Math.PI) / n;
    blades.push([pt(R, a0), pt(R, a1), pt(r, a1 + phi), pt(r, a0 + phi)].join(" "));
    hole.push(pt(r, a0 + phi));
  }
  return { blades, hole: hole.join(" ") };
}
