---
name: add-photos
description: Add new photos to adamzhang.org's /photos page. Use when Adam has dropped photos into photos-inbox/ or asks to add, import or upload photos. Reads EXIF, sorts each photo into the right roll, asks only for what the files can't tell, then compresses and records them in src/data/photos.json and src/data/rolls.json.
---

# Add photos

Photos for `/photos` live in two data files, and nothing is placed by hand:

- `src/data/photos.json`: one entry per photo (`id`, `src`, `w`, `h`, `title`, `alt`, `takenAt`, `camera`, `lens`, `exposure` or `film`, `place`).
- `src/data/rolls.json`: `favorites` (one run of frames in order, `null` = an empty frame still to fill; the page wraps them onto as many strips as the screen needs) and `rolls` (`id`, `kind`: `trip` | `film` | `year`, `name`, `photos` in shot order, `peek`: the 2–3 frames that stick out of the canister on the shelf).

Grouping rule: a trip gets its own roll (e.g. `japan-china-2026`); film gets a roll per camera and year (`film-nikon-f3-2023`); every other digital photo goes in its year's roll (`digital-2026`). Themed rolls (e.g. Formula SAE) are trips in this sense: only when Adam asks for one.

## Steps

1. **Check the inbox.** List `photos-inbox/`. If it's empty, tell Adam to drop the originals there (JPEG, PNG, TIFF or WebP; raw and HEIC files need a JPEG export first) and stop.
2. **Make sure the tools are installed.** If `node_modules/exifr` is missing, run `npm install`.
3. **Scan.** Run `npm run photos:scan`. It writes `photos-inbox/pending.json` with what each file's EXIF says (date taken, camera, lens, exposure, GPS), a suggested roll and why, and a `missing` list per photo. It never guesses: anything the file can't answer stays empty.
4. **Look at every photo.** Open each image in the inbox (Read the file) so you can describe it.
   - Draft `alt` yourself: what is visibly in the frame, one sentence, under about 120 characters, no "photo of".
   - Draft a short `title` suggestion in Adam's style (existing titles: "Bell Tower and Plane", "7-11 Shutter Drag", "PF26 Slow Shutter").
   - If `gps` is present, work out the likely place ("City, State" or "City, Country") as a suggestion only.
5. **Ask Adam only what's missing or uncertain.** Use AskUserQuestion when it's available (at most 4 questions per call; batch photos together), otherwise ask in one plain message. Always show which photo each question is about (file name and your one-line description). Ask about:
   - **Titles**: offer your drafts; Adam can accept, edit or replace them.
   - **Places**: offer the GPS-based guess, or ask when there's no GPS. A place may be left empty if Adam says so.
   - **Film scans** (`isFilm` is `null`, no camera or date): confirm it's film, then ask for the camera, the film stock (e.g. "Kodak Gold 200") and the month taken (`YYYY-MM`). `hint` shows the scanner and the file's date, which is usually the scan date, not the shot date.
   - **Rolls**: confirm the suggestion when it's a trip match or a new roll. If a photo might belong to a trip that doesn't exist yet, ask whether to start one, and for its name.
   - **Possible duplicates** (`possibleDuplicateOf`): ask whether it's the same photo. If it is, leave it out (tell Adam to delete it from the inbox, or move it to `photos-inbox/skipped/` yourself only if he agrees); if not, set `keepDuplicate: true`.
   - **Favorites**: don't change them unless Adam asks.
   Don't ask about anything the EXIF already answers (date, camera, lens, exposure) unless it looks wrong, e.g. a date years off from the folder or trip it came with. Flag those plainly.
6. **Write the answers into `photos-inbox/pending.json`** (edit the JSON; keep every field the scan wrote). `takenAt` is `YYYY-MM-DDTHH:MM`, or `YYYY-MM` for film. A roll id that doesn't exist yet needs `newRoll: { "kind": "trip" | "film" | "year", "name": "…" }`. If you filled in a date, camera or `isFilm`, run `npm run photos:scan` again to refresh the roll suggestion (answers are kept; clear `roll` first if you want a new suggestion).
7. **Apply.** Run `npm run photos:apply`. For each complete photo it writes a 2400 px JPEG to `public/photos/gallery-compressed/<year>/<id>.jpg`, moves the original to `photos-originals/<year>/` (gitignored, never committed), adds the photo to `photos.json` and its roll, and re-sorts everything by date taken. Incomplete photos stay in the inbox. It finishes with `photos:check`.
8. **Report back** in a few lines: what was added to which roll, anything left in the inbox and why, and any check problems. Don't commit or push unless Adam asks.

## Rules

- Never invent a title, place, film stock or date: draft, then confirm.
- Never commit anything in `photos-inbox/` or `photos-originals/`.
- `npm run photos:check` must pass before you call it done.
