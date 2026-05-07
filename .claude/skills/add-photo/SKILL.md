---
name: add-photo
description: Adds a new photo to the personal portfolio photography page. Use when the user shares a macOS Finder "Get Info" screenshot or provides photo metadata and wants the photo added to Photography.jsx with correct placement and metadata.
---

# add-photo

## Quick start

User runs `/add-photo` and attaches a macOS "Get Info" screenshot of the photo file.

## Workflow

### 1. Extract from the image
Read the provided image and pull out:
- **Filename** — e.g. `AYZ_3399.jpg`
- **Date created** — used to determine the year (e.g. `5/3/26` → `2026`)
- **Dimensions** — `w × h`; if `h > w` it's portrait, otherwise landscape
- **Device make/model** — map to friendly name:
  - `NIKON Z5_2` or `NIKON Z 5_2` → `Nikon Z5II`
  - `NIKON D750` → `Nikon D750`
  - `NIKON F3` → `Nikon F3`
- **Lens model** — e.g. `TAKUMAR 50mm` → `50mm`
- **F number** — e.g. `f/1.4`
- **Exposure time** — e.g. `1/1,000` → `1/1000s`
- **ISO speed** — e.g. `100` → `ISO 100`
- **Focal length** — use if lens model is unclear

### 2. Verify the file exists
```bash
ls public/photos/gallery/{year}/
```
The file must be present before continuing.

### 3. Regenerate the manifest — REQUIRED, do not skip
Run this before reading dimensions from the manifest JSON:
```bash
npm run generate-manifest
```
This must be run even when adding multiple photos in one session. Without it, new photos will be missing from the manifest and the layout algorithm will fall back to a default rowSpan.

### 4. Read Photography.jsx
```
src/pages/Photography.jsx
```
Find the year group matching the photo's year. Note the last `rowStart` + approximate `rowSpan` of the final photo in that year to determine where to place the new one.

### 5. Compute default placement
- **colSpan**: `24` for landscape, `16` for portrait (safe centered default)
- **colStart**: `9` for landscape (centers a 24-span in 40 cols), `13` for portrait (centers a 16-span)
- **rowStart**: last photo's `rowStart` + estimated `rowSpan` + `2` (gap)
  - Rough rowSpan estimate: `round(colSpan * h/w)`

If the year group has no photos yet, use `rowStart: 1`.

**Confirm placement with the user before writing** if any of these are true:
- Multiple photos already exist in the year and the proposed rowStart might overlap
- The year group doesn't exist yet (user may want it in a different order)
- The computed rowStart feels arbitrary (e.g. the year has a complex layout)

Show the proposed `colStart`, `colSpan`, `rowStart` and ask: *"Does this placement look right, or would you like to adjust?"*

### 6. Ask for missing metadata
After extracting what's available from the image, check for gaps and ask the user in a single message before writing anything. Fields to check:

- **alt** text (descriptive title for the photo) — always ask, it's never in the file info
- **location** — ask if not visible in the image
- **lens** — ask if the lens model is ambiguous or missing (e.g. only focal length shown)

Group all questions into one ask: *"I need a couple things before I add this — [list the gaps]. What should I use?"*

Don't ask for things already clearly extractable (camera, settings, date, dimensions).

### 7. Build the meta object
```js
meta: {
  camera: "Nikon Z5II",
  lens: "50mm",
  settings: ["f/1.4", "1/1000s", "ISO 100"],
  location: "",        // omit if unknown
  date: "May 2026",
},
```
- Format date as `"Month YYYY"` from the content-created date
- Omit `location` field entirely if not available
- For film cameras, use `film: "Kodak Gold 200"` instead of `settings`

### 8. Insert into Photography.jsx
Add the new photo entry at the end of the matching year group's `photos` array. Use the multi-line meta format:

```js
{
  src: "/photos/gallery/2026/AYZ_3399.jpg",  // portrait
  alt: "",
  colStart: 13, colSpan: 16, rowStart: 45,
  meta: {
    camera: "Nikon Z5II",
    lens: "50mm",
    settings: ["f/1.4", "1/1000s", "ISO 100"],
    date: "May 2026",
  },
},
```

Leave `alt: ""` — the user fills it in later.

## Notes
- If the year doesn't exist yet in `yearGroups`, add a new year group in the correct chronological position (newest first)
- The grid is 40 columns; `colStart + colSpan` must not exceed 41
- `rowStart` is **relative to the year's photo area**, not the absolute grid row
- Placement is a rough default — the user will adjust `colStart`, `colSpan`, and `rowStart` manually afterward
