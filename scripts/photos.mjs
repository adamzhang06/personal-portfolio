#!/usr/bin/env node
/* Photo intake for /photos.

   1. Drop originals (JPEG, PNG, TIFF, HEIC; export raw files to JPEG first) into photos-inbox/.
   2. npm run photos:scan   reads each file's EXIF, suggests a roll and writes photos-inbox/pending.json,
                            listing what is still missing for each photo.
   3. Fill the gaps in pending.json (the add-photos skill does this with you).
   4. npm run photos:apply  compresses each complete photo into public/photos/gallery-compressed/<year>/,
                            moves its original to photos-originals/<year>/ (gitignored), and records it in
                            src/data/photos.json and src/data/rolls.json. Incomplete entries stay in the inbox.
   5. npm run photos:check  validates both data files against the image files.

   Nothing is guessed: a field the file can't answer stays empty and is listed under "missing". */

import { readdir, readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const INBOX = 'photos-inbox';
const ORIGINALS = 'photos-originals';
const OUT = 'public/photos/gallery-compressed';
const PHOTOS = 'src/data/photos.json';
const ROLLS = 'src/data/rolls.json';
const PENDING = path.join(INBOX, 'pending.json');
const IMAGE = /\.(jpe?g|png|tiff?|webp)$/i;
const RAW = /\.(nef|nrw|cr2|cr3|arw|raf|dng|orf|rw2|heic|heif)$/i; // export these to JPEG first
const MAX_WIDTH = 2400;
const QUALITY = 82;
const TRIP_SLACK_DAYS = 2; // a photo within this many days of a trip roll's first/last photo is suggested for that trip

// EXIF model → the name shown on the site
const CAMERAS = {
  'NIKON Z 5_2': 'Nikon Z5II', 'NIKON Z5_2': 'Nikon Z5II', 'NIKON Z5II': 'Nikon Z5II',
  'NIKON D750': 'Nikon D750', 'NIKON F3': 'Nikon F3', 'NIKON FE2': 'Nikon FE2',
  'CANON POWERSHOT SX50 HS': 'Canon PowerShot SX50 HS',
  'AC006': 'DJI Osmo Action 6',
};

const readJson = async (f, fallback) => (existsSync(f) ? JSON.parse(await readFile(f, 'utf8')) : fallback);
const writeJson = (f, v) => writeFile(f, JSON.stringify(v, null, 2) + '\n');
const slug = (s) => s.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pad = (n) => String(n).padStart(2, '0');
const yearOf = (takenAt) => (takenAt || '').slice(0, 4);
const day = (takenAt) => new Date(takenAt.length === 7 ? takenAt + '-15T12:00' : takenAt.slice(0, 10) + 'T12:00').getTime();

function cameraName(make, model) {
  if (!model) return '';
  const key = model.trim().toUpperCase();
  if (CAMERAS[key]) return CAMERAS[key];
  const m = model.trim(), mk = (make || '').trim();
  const full = mk && !m.toUpperCase().startsWith(mk.toUpperCase().split(' ')[0]) ? `${mk} ${m}` : m;
  return full.replace(/\bNIKON\b/i, 'Nikon').replace(/\bCORPORATION\b/i, '').replace(/\s+/g, ' ').trim();
}

function shutter(t) {
  if (!t) return '';
  return t >= 1 ? `${+t.toFixed(1)}s` : `1/${Math.round(1 / t)}s`;
}

// The camera's own wall-clock time ("2026:05:20 10:54:30" → "2026-05-20T10:54"), never shifted by time zone.
function localStamp(raw) {
  const m = typeof raw === 'string' && raw.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})/);
  return m && m[1] !== '0000' ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}` : '';
}

async function readMeta(file) {
  const { default: exifr } = await import('exifr');
  const { default: sharp } = await import('sharp');
  let ex = {}, gps = null;
  try {
    // raw values keep dates as the camera wrote them; some files leave IFD0 tags under their numeric ids
    const r = (await exifr.parse(file, { reviveValues: false })) || {};
    ex = { ...r, Make: r.Make ?? r[271], Model: r.Model ?? r[272], DateTimeOriginal: r.DateTimeOriginal ?? r[36867], CreateDate: r.CreateDate ?? r[36868] ?? r[306] };
    gps = (await exifr.gps(file).catch(() => null)) || null;
  } catch {
    ex = {};
  }
  // some cameras (e.g. DJI without a phone link) write 0, 0 when they had no fix
  if (gps && (Math.abs(gps.latitude) > 1e-3 || Math.abs(gps.longitude) > 1e-3)) { ex.latitude = gps.latitude; ex.longitude = gps.longitude; }
  const meta = await sharp(file).metadata();
  const turned = meta.orientation >= 5 && meta.orientation <= 8;
  const w = turned ? meta.height : meta.width, h = turned ? meta.width : meta.height;
  // A camera file has exposure data. A film scan doesn't; its make/model and date (if any) are the scanner's, not the shot's.
  const digital = Boolean(ex.Model && (ex.FNumber || ex.ExposureTime));
  const fileDate = localStamp(ex.DateTimeOriginal || ex.CreateDate);
  return {
    w, h,
    takenAt: digital ? fileDate : '',
    camera: digital ? cameraName(ex.Make, ex.Model) : '',
    lens: digital && ex.FocalLength ? `${Math.round(ex.FocalLength)}mm` : '',
    exposure: digital ? [ex.FNumber && `f/${+ex.FNumber.toFixed(1)}`, shutter(ex.ExposureTime), ex.ISO && `ISO ${ex.ISO}`].filter(Boolean).join(' · ') : '',
    likelyFilm: !digital,
    hint: digital ? null : { scanner: [ex.Make, ex.Model].filter(Boolean).join(' ') || null, fileDate: fileDate || null },
    gps: ex.latitude != null && ex.longitude != null ? { lat: +ex.latitude.toFixed(5), lon: +ex.longitude.toFixed(5) } : null,
  };
}

// What still has to be filled in before a photo can be added.
function missingFor(e, rollIds) {
  const miss = [];
  if (!e.title) miss.push('title');
  if (!e.alt) miss.push('alt');
  if (!/^\d{4}-\d{2}(-\d{2}T\d{2}:\d{2})?$/.test(e.takenAt || '')) miss.push('takenAt');
  if (!e.camera) miss.push('camera');
  if (e.isFilm === null) miss.push('isFilm');
  if (e.isFilm && !e.film) miss.push('film');
  if (e.possibleDuplicateOf && !e.keepDuplicate) miss.push('duplicate'); // remove the file, or set keepDuplicate: true
  if (!e.roll) miss.push('roll');
  else if (!rollIds.has(e.roll) && !(e.newRoll && e.newRoll.name && e.newRoll.kind)) miss.push('newRoll');
  return miss;
}

// Suggest a roll: an existing trip whose dates it falls inside; else the film roll for that camera and year; else the year's digital roll.
function suggestRoll(e, photos, rolls) {
  const byId = new Map(photos.map((p) => [p.id, p]));
  const year = yearOf(e.takenAt);
  if (e.takenAt) {
    const t = day(e.takenAt), slack = TRIP_SLACK_DAYS * 864e5;
    for (const r of rolls.rolls.filter((x) => x.kind === 'trip')) {
      const ts = r.photos.map((id) => byId.get(id)).filter(Boolean).map((p) => day(p.takenAt));
      if (ts.length && t >= Math.min(...ts) - slack && t <= Math.max(...ts) + slack) return { roll: r.id, why: `taken during the ${r.name} trip` };
    }
  }
  if (!year) return { roll: '', why: 'no date yet' };
  if (e.isFilm) {
    const id = `film-${slug(e.camera || 'camera')}-${year}`;
    const exists = rolls.rolls.some((r) => r.id === id);
    return { roll: id, why: exists ? `${e.camera} film from ${year}` : `new film roll for ${e.camera || 'this camera'}, ${year}`, newRoll: exists ? null : { kind: 'film', name: 'Film' } };
  }
  const id = `digital-${year}`;
  const exists = rolls.rolls.some((r) => r.id === id);
  return { roll: id, why: exists ? `the ${year} digital roll` : `new digital roll for ${year}`, newRoll: exists ? null : { kind: 'year', name: 'Digital' } };
}

async function scan() {
  if (!existsSync(INBOX)) await mkdir(INBOX, { recursive: true });
  const photos = await readJson(PHOTOS, []);
  const rolls = await readJson(ROLLS, { favorites: [], rolls: [] });
  const prev = await readJson(PENDING, { photos: [] });
  const keep = new Map(prev.photos.map((e) => [e.file, e]));
  const taken = new Set(photos.map((p) => p.id));
  const rollIds = new Set(rolls.rolls.map((r) => r.id));
  const files = (await readdir(INBOX, { withFileTypes: true }))
    .filter((d) => d.isFile() && !d.name.startsWith('.') && d.name !== 'pending.json' && d.name !== 'README.md')
    .map((d) => d.name).sort();
  const out = [], skipped = [];

  for (const file of files) {
    if (RAW.test(file)) { skipped.push(`${file}: raw file, export a JPEG first`); continue; }
    if (!IMAGE.test(file)) { skipped.push(`${file}: not an image`); continue; }
    const old = keep.get(file);
    const meta = await readMeta(path.join(INBOX, file));
    let e;
    if (old) {
      e = { ...old, w: meta.w, h: meta.h }; // keep answers already given; refresh only what the file decides
    } else {
      let id = slug(file), n = 2;
      while (taken.has(id)) id = `${slug(file)}-${n++}`;
      e = {
        file, id, w: meta.w, h: meta.h,
        title: '', alt: '', place: '',
        takenAt: meta.takenAt, camera: meta.camera, lens: meta.lens, exposure: meta.exposure,
        isFilm: meta.likelyFilm ? null : false, film: '', // a file with no exposure data is probably a scan: confirm
        gps: meta.gps, hint: meta.hint, roll: '', newRoll: null, suggestion: '', missing: [],
      };
    }
    taken.add(e.id);
    // same camera, same minute: probably a photo that's already on the site
    const twin = e.takenAt && e.takenAt.length > 7 && photos.find((p) => p.takenAt === e.takenAt && p.camera === e.camera);
    e.possibleDuplicateOf = twin ? twin.id : null;
    if (!e.roll) {
      const s = suggestRoll(e, photos, rolls);
      e.roll = s.roll; e.suggestion = s.why; if (s.newRoll && !e.newRoll) e.newRoll = s.newRoll;
    }
    e.missing = missingFor(e, rollIds);
    out.push(e);
  }

  await writeJson(PENDING, {
    note: 'Fill in every field listed under "missing", then run npm run photos:apply. takenAt is "YYYY-MM-DDTHH:MM", or "YYYY-MM" for film. isFilm true needs film (the stock, e.g. "Kodak Gold 200"). A roll id that does not exist yet needs newRoll {"kind": "trip" | "film" | "year", "name": "…"}. After filling a date, camera or isFilm, run npm run photos:scan again to refresh the roll suggestion (answers are kept; clear "roll" to get a new suggestion).',
    rolls: rolls.rolls.map((r) => ({ id: r.id, kind: r.kind, name: r.name })),
    photos: out,
  });

  console.log(`\n${out.length} photo(s) in ${INBOX}/ → ${PENDING}\n`);
  for (const e of out) {
    console.log(`  ${e.file}  →  ${e.id}`);
    console.log(`     ${e.takenAt || 'no date'} · ${e.camera || 'no camera'}${e.exposure ? ' · ' + e.exposure : ''}${e.gps ? ` · GPS ${e.gps.lat}, ${e.gps.lon}` : ''}`);
    console.log(`     roll: ${e.roll || '—'}${e.suggestion ? ` (${e.suggestion})` : ''}`);
    if (e.possibleDuplicateOf) console.log(`     looks like ${e.possibleDuplicateOf}, already on the site (same camera and minute)`);
    console.log(`     missing: ${e.missing.length ? e.missing.join(', ') : 'nothing, ready to apply'}`);
  }
  for (const s of skipped) console.log(`  skipped ${s}`);
  if (!out.length && !skipped.length) console.log(`  The inbox is empty. Drop photos into ${INBOX}/ and run this again.`);
}

async function apply() {
  const pending = await readJson(PENDING, null);
  if (!pending) throw new Error(`No ${PENDING}. Run npm run photos:scan first.`);
  const { default: sharp } = await import('sharp');
  const photos = await readJson(PHOTOS, []);
  const rolls = await readJson(ROLLS, { favorites: [], rolls: [] });
  const rollIds = new Set(rolls.rolls.map((r) => r.id));
  const left = [], added = [];

  for (const e of pending.photos) {
    e.missing = missingFor(e, rollIds);
    const src = path.join(INBOX, e.file);
    if (e.missing.length || !existsSync(src)) {
      if (existsSync(src)) left.push(e);
      continue;
    }
    if (photos.some((p) => p.id === e.id)) throw new Error(`${e.id} is already in ${PHOTOS}; rename it in pending.json`);
    const year = yearOf(e.takenAt);
    await mkdir(path.join(OUT, year), { recursive: true });
    await mkdir(path.join(ORIGINALS, year), { recursive: true });
    const outFile = path.join(OUT, year, `${e.id}.jpg`);
    const info = await sharp(src).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true }).jpeg({ quality: QUALITY, mozjpeg: true }).toFile(outFile);
    let dest = path.join(ORIGINALS, year, e.file), n = 2;
    while (existsSync(dest)) dest = path.join(ORIGINALS, year, e.file.replace(/(\.[^.]+)$/, `-${n++}$1`));
    await rename(src, dest);

    photos.push({
      id: e.id, src: `/${path.posix.join('photos/gallery-compressed', year, `${e.id}.jpg`)}`, w: info.width, h: info.height,
      title: e.title, alt: e.alt, takenAt: e.takenAt, camera: e.camera,
      lens: e.lens || null, exposure: e.isFilm ? null : e.exposure || null, film: e.isFilm ? e.film : null, place: e.place || null,
    });
    let roll = rolls.rolls.find((r) => r.id === e.roll);
    if (!roll) {
      roll = { id: e.roll, kind: e.newRoll.kind, name: e.newRoll.name, photos: [], peek: [] };
      rolls.rolls.push(roll);
      rollIds.add(roll.id);
    }
    roll.photos.push(e.id);
    added.push(`${e.id} → ${roll.name} (${roll.id})`);
  }

  // keep everything in date order: photos by date taken, each roll's photos likewise, rolls newest first
  const at = new Map(photos.map((p) => [p.id, p.takenAt]));
  photos.sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  for (const r of rolls.rolls) {
    r.photos.sort((a, b) => (at.get(a) || '').localeCompare(at.get(b) || ''));
    if (!r.peek || !r.peek.length) r.peek = r.photos.slice(0, 3);
  }
  const last = (r) => r.photos.map((id) => at.get(id) || '').sort().pop() || '';
  rolls.rolls.sort((a, b) => last(b).localeCompare(last(a)));

  await writeJson(PHOTOS, photos);
  await writeJson(ROLLS, rolls);
  await writeJson(PENDING, { ...pending, photos: left });
  console.log(`\nAdded ${added.length} photo(s):`);
  for (const a of added) console.log(`  ${a}`);
  if (left.length) console.log(`\n${left.length} still need info (see ${PENDING}): ${left.map((e) => `${e.file} [${e.missing.join(', ')}]`).join('; ')}`);
  await check();
}

async function check() {
  const photos = await readJson(PHOTOS, []);
  const rolls = await readJson(ROLLS, { favorites: [], rolls: [] });
  const issues = [];
  const ids = new Set();
  for (const p of photos) {
    if (ids.has(p.id)) issues.push(`duplicate photo id ${p.id}`);
    ids.add(p.id);
    for (const k of ['title', 'alt', 'takenAt', 'camera', 'src']) if (!p[k]) issues.push(`${p.id}: no ${k}`);
    if (!p.film && !p.exposure) issues.push(`${p.id}: digital photo with no exposure`);
    if (!existsSync(path.join('public', p.src))) issues.push(`${p.id}: missing file public${p.src}`);
  }
  const seen = new Map();
  for (const r of rolls.rolls) {
    if (!['trip', 'film', 'year'].includes(r.kind)) issues.push(`roll ${r.id}: kind must be trip, film or year`);
    for (const id of r.photos) {
      if (!ids.has(id)) issues.push(`roll ${r.id}: unknown photo ${id}`);
      if (seen.has(id)) issues.push(`${id} is in two rolls (${seen.get(id)}, ${r.id})`);
      seen.set(id, r.id);
    }
    for (const id of r.peek || []) if (!r.photos.includes(id)) issues.push(`roll ${r.id}: peek photo ${id} is not in the roll`);
  }
  for (const id of ids) if (!seen.has(id)) issues.push(`${id} is in no roll`);
  (rolls.favorites || []).flat().filter(Boolean).forEach((id) => { if (!ids.has(id)) issues.push(`favorites: unknown photo ${id}`); });
  if (issues.length) {
    console.log(`\n${issues.length} problem(s):`);
    for (const i of issues) console.log(`  ${i}`);
    process.exitCode = 1;
  } else {
    console.log(`\nOK: ${photos.length} photos in ${rolls.rolls.length} rolls.`);
  }
}

const cmd = process.argv[2];
const run = { scan, apply, check }[cmd];
if (!run) {
  console.log('usage: node scripts/photos.mjs scan | apply | check');
  process.exit(1);
}
run().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
