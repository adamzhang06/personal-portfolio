import photoList from "@/data/photos.json";
import rollData from "@/data/rolls.json";

/* The Photos page's data, read only from photos.json and rolls.json, and the film-strip layout.
   Rolls run newest first (by their latest photo) and hold their photos in date-taken order. */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const byId = new Map(photoList.map((p) => [p.id, p]));
const photo = (id) => (id && byId.get(id)) || null;
const yearOf = (p) => p.takenAt.slice(0, 4);
const byTaken = (a, b) => a.takenAt.localeCompare(b.takenAt);
const span = (years, short) => (years.length > 1 ? `${short ? years[0].slice(2) : years[0]}–${short ? years.at(-1).slice(2) : years.at(-1)}` : years[0]);

// "2026-05-20T10:54" → "May 20, 2026"; film scans carry only a month: "2023-03" → "March 2023"
export function dateLabel(takenAt) {
  const [y, m, d] = takenAt.slice(0, 10).split("-").map(Number);
  return d ? `${MONTHS[m - 1]} ${d}, ${y}` : `${MONTHS[m - 1]} ${y}`;
}

// The hover / lightbox lines: "date · place" and "camera · lens · exposure or film stock"
export const photoWhen = (p) => [dateLabel(p.takenAt), p.place].filter(Boolean).join(" · ");
export const photoTech = (p) => [p.camera.replace("Canon PowerShot ", ""), p.lens, p.exposure ?? p.film].filter(Boolean).join(" · ");
export const photoLabel = (p) => `${p.title}, ${dateLabel(p.takenAt)}`;

export const rolls = rollData.rolls
  .map((r) => {
    const photos = r.photos.map(photo).filter(Boolean).sort(byTaken);
    const years = [...new Set(photos.map(yearOf))];
    const peek = (r.peek ?? []).map(photo).filter(Boolean);
    return { id: r.id, kind: r.kind, name: r.name, photos, years, year: years.at(-1), yearSpan: span(years), yearLabel: span(years, true), peek: peek.length ? peek : photos.slice(0, 3) };
  })
  .filter((r) => r.photos.length)
  .sort((a, b) => b.photos.at(-1).takenAt.localeCompare(a.photos.at(-1).takenAt));

// Three strips, each written left to right as drawn; null is an empty frame.
export const favorites = (rollData.favorites ?? []).map((strip) => strip.map(photo));

const allYears = [...new Set(photoList.map(yearOf))].sort();
export const totals = { photos: photoList.length, rolls: rolls.length, years: allYears.length ? span(allYears) : "" };

/* Strip geometry for a window width. The CSS reads these as custom properties (filmVars), so the room left for photos
   (W: window width minus the row inset, the canister, the film leader and a margin) matches what is drawn. */
export function filmGeometry(vw) {
  const phone = vw <= 860;
  const H = phone ? Math.max(96, Math.min(130, Math.floor((vw - 53) / 2.4))) : vw < 1240 ? 150 : 168; // photo height
  const FH = H + (phone ? 52 : 72); // film height: photo plus the sprocket margins
  const k = phone
    ? { pad: 12, can: 0.5, overlap: 0.25, lead: 0.3, edge: 12, gap: 10, tilt: 1.4, rowGap: 28, capH: 30, hole: [7, 8, 17, 22] }
    : { pad: 36, can: 0.66, overlap: 0.3, lead: 0.42, edge: 32, gap: 14, tilt: 2.1, rowGap: 40, capH: 46, hole: [9, 11, 23, 30] };
  const start = k.pad + FH * (k.can - k.overlap + k.lead);
  return { ...k, H, FH, W: Math.max(H * 1.8, vw - start - k.edge) };
}

export const filmVars = (g) => ({
  "--fh": `${g.FH}px`, "--fcw": `${g.FH * g.can}px`, "--fch": `${g.FH + g.capH}px`, "--fov": `${g.FH * g.overlap}px`, "--flead": `${g.FH * g.lead}px`,
  "--fpad": `${g.pad}px`, "--fgap": `${g.gap}px`, "--ftilt": `${g.tilt}deg`, "--frowgap": `${g.rowGap}px`,
  "--hh": `${g.hole[0]}px`, "--hw": `${g.hole[1]}px`, "--hp": `${g.hole[2]}px`, "--band": `${g.hole[3]}px`,
});

// Frame width at height H; an empty frame is drawn landscape.
export const frameWidth = (p, H) => Math.round(p ? (H * p.w) / p.h : H * 1.5);

// Lay frames along strips: a frame that would cross the screen edge starts the next strip, so nothing is cut off.
function wrap(frames, g) {
  const rows = [];
  let row = [], len = 0;
  for (const f of frames) {
    const w = frameWidth(f, g.H);
    if (row.length && len + g.gap + w > g.W) {
      rows.push(row);
      row = [];
      len = 0;
    }
    len += (row.length ? g.gap : 0) + w;
    row.push(f);
  }
  if (row.length) rows.push(row);
  return rows;
}

// An opened roll: its photos in shot order, read left to right on every strip.
export const rollStrips = (roll, g) => wrap(roll.photos, g);

/* The favorites strips. Strips alternate down the page between a left and a right canister, so each strip is laid out
   from its canister outward; one that won't fit goes on over extra strips, and then its empty frames are dropped
   (the film runs on empty instead). Each strip comes back drawn left to right, with its photos for the lightbox. */
export function favoriteStrips(favs, g) {
  const out = [];
  favs.forEach((strip, i) => {
    const photos = strip.filter(Boolean);
    const fromCan = i % 2 ? [...strip].reverse() : strip;
    let rows = wrap(fromCan, g);
    if (rows.length > 1) rows = wrap(fromCan.filter(Boolean), g);
    rows.forEach((frames) => out.push({ label: `${i + 1}/${favs.length}`, photos, frames }));
  });
  return out.map((s, k) => ({ ...s, rtl: k % 2 === 1, frames: k % 2 ? [...s.frames].reverse() : s.frames }));
}
