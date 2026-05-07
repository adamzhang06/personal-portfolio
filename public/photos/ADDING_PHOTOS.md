# Adding Photos to the Portfolio

> **Shortcut:** If the original file is already in `public/photos/gallery/{year}/`, just run `/add-photo` in Claude Code and attach a macOS "Get Info" screenshot of the file. Claude will handle compression, manifest regeneration, and the code entry automatically.

## Overview

Gallery photos live in a 40-column CSS grid with aspect-ratio-derived row spans. Every photo needs an **original** file, a **compressed** copy, a **manifest entry**, and a **code entry** in `Photography.jsx`. Follow each step in order.

---

## Step 1 — Place the original file

Drop the original (full-res) file into the correct year folder:

```
public/photos/gallery/{year}/{filename}
```

The year folder must match the year it was taken (e.g. `2026`). Create the folder if it doesn't exist.

---

## Step 2 — Compress the photo

Run the sharp one-liner to create a web-optimised copy in `gallery-compressed/`. The output is always `.jpg` regardless of original extension:

```bash
node --input-type=module << 'EOF'
import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";

const src = "public/photos/gallery/{year}/{filename}";
const out = "public/photos/gallery-compressed/{year}/{basename}.jpg";

mkdirSync("public/photos/gallery-compressed/{year}", { recursive: true });

await sharp(src)
  .rotate()
  .resize({ width: 2400, withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(out);

const before = statSync(src).size;
const after  = statSync(out).size;
console.log(`${(before/1e6).toFixed(1)} MB → ${(after/1e6).toFixed(1)} MB (${Math.round((1 - after/before)*100)}% smaller)`);
EOF
```

Replace `{year}`, `{filename}` (original name + extension), and `{basename}` (name without extension).

- `.rotate()` auto-corrects EXIF orientation — always include it
- Max width is 2400px; portrait photos stay under 2400px on the long edge automatically because `withoutEnlargement` is set
- Confirm the file appears in `gallery-compressed/{year}/` before continuing

---

## Step 3 — Regenerate the manifest

```bash
npm run generate-manifest
```

This updates `src/data/photo-manifest.json` with the pixel dimensions of every file in both `gallery/` and `gallery-compressed/`. The layout algorithm needs the compressed dimensions to compute exact row spans — skipping this step causes photos to render at the wrong height.

Run it even if you're adding multiple photos; run it once after all files are in place.

---

## Step 4 — Add the photo to Photography.jsx

Open `src/pages/Photography.jsx` and find the `yearGroups` array. Locate the block for the correct year and append a new entry to its `photos` array:

```js
{
  src: "/photos/gallery-compressed/{year}/{basename}.jpg",
  alt: "Descriptive title",
  colStart: 1, colSpan: 24, rowStart: 1,
  meta: {
    camera: "Nikon Z5II",
    lens: "50mm",
    settings: ["f/1.4", "1/1000s", "ISO 100"],
    location: "City, State",   // omit entire line if unknown
    date: "May 2026",
  },
},
```

### Grid rules

- The grid is **40 columns**. `colStart + colSpan` must not exceed 41.
- `rowStart` is **relative to the year's photo area** — row 1 is the first row after the year divider, not the top of the page.
- `rowSpan` is **auto-derived** from the aspect ratio via the manifest. You never set it manually.
- Safe centered defaults if you're not sure where to place it:
  - Landscape: `colStart: 9, colSpan: 24`
  - Portrait: `colStart: 13, colSpan: 16`
  - Square: `colStart: 11, colSpan: 20`
- To place side-by-side, give both the same `rowStart` with non-overlapping `colStart`/`colSpan` ranges.

### Rough rowSpan estimate (for planning layout)

```
rowSpan ≈ round(colSpan × h/w)
```

Use this to figure out where to start the next photo's `rowStart`. Add 2 rows of breathing room between photos.

### Meta object fields

| Field | Required | Notes |
|-------|----------|-------|
| `camera` | yes | Full model name: `"Nikon Z5II"`, `"Nikon D750"`, `"Nikon F3"` |
| `lens` | yes | Focal length only: `"50mm"` |
| `settings` | digital only | `["f/1.4", "1/1000s", "ISO 100"]` |
| `film` | film only | `"Kodak Gold 200"` — replaces `settings` |
| `location` | no | `"City, State"` or `"Country"` — omit field entirely if unknown |
| `date` | yes | `"Month YYYY"` from the file's content-created date |

### Camera name mapping

| EXIF model | Use |
|---|---|
| `NIKON Z5_2` / `NIKON Z 5_2` | `Nikon Z5II` |
| `NIKON D750` | `Nikon D750` |
| `NIKON F3` | `Nikon F3` |

---

## Step 5 — Adding a new year

If the year doesn't exist in `yearGroups` yet:

1. **Add a year group** in `src/pages/Photography.jsx` at the correct position in `yearGroups` — newest year first:

```js
// ── 2027 ──────────────────────────────────────────────────────────────────────
{
  year: "2027",
  photos: [
    // photos go here
  ],
},
```

2. **Add the year to `PHOTO_YEARS`** in `src/data/photoYears.js` — newest first:

```js
export const PHOTO_YEARS = ["2027", "2026", "2025", "2024", "2023", "2022"];
```

This drives both the year-jump buttons in the navbar and the scroll-highlighting logic.

---

## Step 6 — Update the navbar prefetch list (optional)

`src/components/Navbar.jsx` has a `PHOTO_SRCS` array at the top that prefetches a handful of hero images when the user hovers over the Photography nav link. If your new photo should be one of the first visible ones in the gallery, add its compressed path to that list (keep it to ~8 entries).

```js
const PHOTO_SRCS = [
  "/photos/gallery-compressed/2026/AYZ_0111.jpg",
  // ... add new hero images here
];
```

---

## Quick checklist

- [ ] Original in `public/photos/gallery/{year}/`
- [ ] Compressed in `public/photos/gallery-compressed/{year}/` (via sharp, always `.jpg`)
- [ ] `npm run generate-manifest` run after all files are placed
- [ ] Entry added to `yearGroups` in `Photography.jsx` with `src` pointing to `gallery-compressed`
- [ ] `colStart + colSpan ≤ 40`, `rowStart` relative to year area
- [ ] New year? — add year group to `Photography.jsx` and year string to `photoYears.js`
- [ ] `alt` text filled in
