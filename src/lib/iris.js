// The full-screen shutter iris shared by the loader and the page transition. a: aperture, 0 (shut) → 1 (clear of the screen);
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
