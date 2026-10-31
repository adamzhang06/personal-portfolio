import photoList from "@/data/photos.json";
import rollData from "@/data/rolls.json";

/* The Photos page's data, read only from photos.json and rolls.json, and the film-strip and shelf layout.
   Rolls run newest first (by their latest photo) and hold their photos in date-taken order. */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const byId = new Map(photoList.map((p) => [p.id, p]));
const photo = (id) => (id && byId.get(id)) || null;
const yearOf = (p) => p.takenAt.slice(0, 4);
const byTaken = (a, b) => a.takenAt.localeCompare(b.takenAt);
const clamp = (lo, x, hi) => Math.min(hi, Math.max(lo, x));
const rad = (deg) => (deg * Math.PI) / 180;

// "2026" or "2025–2026"; short: "2026" or "25–26"
export function yearSpan(photos, short = false) {
  const ys = [...new Set(photos.map(yearOf))].sort();
  if (ys.length < 2) return ys[0] ?? "";
  return short ? `${ys[0].slice(2)}–${ys.at(-1).slice(2)}` : `${ys[0]}–${ys.at(-1)}`;
}

// "2026-05-20T10:54" → "May 20, 2026"; film scans carry only a month: "2023-03" → "March 2023"
export function dateLabel(takenAt) {
  const [y, m, d] = takenAt.slice(0, 10).split("-").map(Number);
  return d ? `${MONTHS[m - 1]} ${d}, ${y}` : `${MONTHS[m - 1]} ${y}`;
}

// The lightbox lines: "date · place" and "camera · lens · exposure or film stock"
export const photoWhen = (p) => [dateLabel(p.takenAt), p.place].filter(Boolean).join(" · ");
export const photoTech = (p) => [p.camera.replace("Canon PowerShot ", ""), p.lens, p.exposure ?? p.film].filter(Boolean).join(" · ");
export const photoLabel = (p) => `${p.title}, ${dateLabel(p.takenAt)}`;
// "17 EXP" on a shelf canister; "3/10 EXP" on a strip's, counting every photo up to the end of that strip
export const exposures = (n, total) => (total == null ? `${n} EXP` : `${n}/${total} EXP`);

export const rolls = rollData.rolls
  .map((r) => {
    const photos = r.photos.map(photo).filter(Boolean).sort(byTaken);
    const peek = (r.peek ?? []).map(photo).filter(Boolean);
    return { id: r.id, kind: r.kind, name: r.name, photos, year: yearOf(photos.at(-1) ?? { takenAt: "" }), yearSpan: yearSpan(photos), yearLabel: yearSpan(photos, true), peek: peek.length ? peek : photos.slice(0, 3) };
  })
  .filter((r) => r.photos.length)
  .sort((a, b) => b.photos.at(-1).takenAt.localeCompare(a.photos.at(-1).takenAt));

// The roll kinds, each with its own canister colours (photos.css .k-*). The shelf legend lists the ones in use.
export const KINDS = [
  { kind: "trip", label: "Trips" },
  { kind: "film", label: "Film" },
  { kind: "year", label: "Digital" },
]
  .map((k) => ({ ...k, count: rolls.filter((r) => r.kind === k.kind).length }))
  .filter((k) => k.count);

// The favorites: one run of frames in order; null is an empty frame.
export const favorites = (rollData.favorites ?? []).flat().map(photo);

export const totals = { photos: photoList.length, rolls: rolls.length, years: yearSpan(photoList) };

// The widest photo; every strip must hold at least one of it. On phones a strip also holds a landscape and a portrait.
const MAX_ASPECT = Math.max(1.5, ...photoList.map((p) => p.w / p.h));
const PHONE_ROW = Math.max(MAX_ASPECT, 2.3);

/* Strip geometry for a window width. Everything scales with the photo height H, which grows with the window (on
   phones it is sized so a strip holds the widest photo, or a landscape and a portrait); the canister, leader and tail are fractions of the
   film height FH. W is the room for photos on one strip, so the film always ends on screen. Rows are spaced so a
   tilted strip's far end clears the next row's canister. The CSS reads all of it through filmVars. */
export function filmGeometry(vw) {
  const phone = vw <= 860;
  const k = phone
    ? { pad: 12, can: 0.5, overlap: 0.25, lead: 0.3, tail: 0.18, edge: 4, gap: 10, tilt: 1.4, capH: 30, film: 52, hole: [7, 8, 17, 22] }
    : { pad: 36, can: 0.62, overlap: 0.3, lead: 0.4, tail: 0.22, edge: 8, gap: 14, tilt: 1.8, capH: 46, film: 72, hole: [9, 11, 23, 30] };
  const reach = k.can - k.overlap + k.lead + k.tail; // canister, leader and tail, per unit of film height
  const fixed = 2 * k.pad + k.edge;
  const H = Math.round(phone ? clamp(90, (vw - fixed - k.film * reach) / (PHONE_ROW + reach), 130) : clamp(124, vw * 0.112, 172));
  const FH = H + k.film;
  const len = vw - 2 * k.pad; // the longest a strip gets, canister to tail
  return { ...k, H, FH, W: vw - fixed - FH * reach, rowGap: Math.ceil(len * Math.sin(rad(k.tilt)) + k.capH / 2 + 14) };
}

export const filmVars = (g) => ({
  "--fh": `${g.FH}px`, "--fcw": `${g.FH * g.can}px`, "--fch": `${g.FH + g.capH}px`, "--fov": `${g.FH * g.overlap}px`,
  "--flead": `${g.FH * g.lead}px`, "--ftail": `${g.FH * g.tail}px`, "--fpad": `${g.pad}px`, "--fgap": `${g.gap}px`,
  "--ftilt": `${g.tilt}deg`, "--frowgap": `${g.rowGap}px`,
  "--hh": `${g.hole[0]}px`, "--hw": `${g.hole[1]}px`, "--hp": `${g.hole[2]}px`, "--band": `${g.hole[3]}px`,
});

// Frame width at height H; an empty frame is drawn landscape.
export const frameWidth = (p, H) => Math.round(p ? (H * p.w) / p.h : H * 1.5);

// Each strip's photo count so far, from the first strip through this one (for the canister bands).
const counted = (strips) => {
  let n = 0;
  return strips.map((s) => ({ ...s, upTo: (n += s.frames.filter(Boolean).length) }));
};

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

// An opened roll: its photos in shot order on strips from canisters on alternating sides, read left to right on each.
export const rollStrips = (roll, g) => counted(wrap(roll.photos, g).map((frames, k) => ({ side: k % 2 ? "right" : "left", frames })));

/* The favorites: the run of frames wraps onto as many strips as the window needs, each from its own canister,
   alternating left and right down the page and laid out from the canister outward. Empty frames only fill out the
   last strip with photos on it; a strip of nothing but empty frames is dropped. Frames come back drawn left to right. */
export function favoriteStrips(frames, g) {
  return counted(
    wrap(frames, g)
      .filter((row) => row.some(Boolean))
      .map((row, k) => ({ side: k % 2 ? "right" : "left", frames: k % 2 ? [...row].reverse() : row }))
  );
}

/* Shelf sizes for a window width: the card width follows .wrap and the grid's columns (photos.css), the canister scales
   with it, and each leader shows only the peek frames that fit inside its card when fully drawn out. */
export function shelfGeometry(vw) {
  const pad = vw <= 860 ? 20 : vw <= 1240 ? 48 : 80;
  const cols = vw <= 860 ? 1 : vw <= 1180 ? 2 : 4;
  const card = (Math.min(vw, 1520) - 2 * pad) / cols;
  const cw = Math.round(clamp(100, card * 0.36, 124));
  const peekH = Math.round(cw * 0.75);
  const room = card - (16 + cw * 0.95) - 22 - 8;
  const fit = (peek) => {
    const out = [];
    let used = -9;
    for (const p of peek) {
      used += 9 + frameWidth(p, peekH);
      if (out.length && used > room) break;
      out.push(p);
    }
    return out;
  };
  return { cw, peekH, fit };
}
