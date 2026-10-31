# adamzhang.org — Domain Glossary

How the site is built today (Oct 30, 2026). When this file and an older doc disagree, this file and the code win.

## Docs status

- `docs/spec-v3.md` — the current spec (the site as built, plus the photography redesign as it is decided). Local only: `docs/` is gitignored.
- `docs/spec-v2.md` — **out of date.** The Camera UI hand-off spec; the code has moved past it (dor, hover trace, slide-in camera panels, photography switched on).
- `docs/adr/0001-cloudinary-for-photo-hosting.md` — deferred; photos are still self-hosted.
- Claude Design canvas "adamzhang.org — Camera UI" — out of date; the code is the reference for the camera UI. Photography is being designed in its own canvas.

## The shell

### Camera UI
The v2 site (every route except the legacy photography routes) runs inside `SiteShell`: one procedural three.js camera (`src/components/camera/`), a dark theme (`src/styles/site.css`), and a top bar. Pages never import camera code.

### Camera stage
The single camera canvas. On **Home** it sits in the hero and scrolls with the page; on every other page it is **docked** bottom right (rear view). It is never re-mounted. Phones get an inline camera on Home only, plus a "Camera controls" disclosure.

### Docked camera / camera controls
Clicking the docked camera expands it; **Camera controls** and **Sections** slide in as two panels from the right. The camera's buttons sweep purple when it opens and as a hint on each page until it has been opened once.

### Control
A camera button with a plain-English action: Shutter → Contact, Mode dial → Sections, Card door → Collections, Monitor → Flip, Playback ▶ → Photography, MENU → Site menu, i → Quick facts, OK → Home, Record → Demo videos (off: `DEMO_VIDEOS = false`). Defined in `controls.js`.

### Sections dial
The mode dial's picker: H · A · P · E · L (Home, About, Projects, Experience, Leadership). Photography and Contact have no notch.

### Collections / SD card
The five section cards (About, Projects, Experience, Leadership, Photos) in `src/data/cards.js`. On Home they sit below the hero; the card door opens the **Collections dock**, which rises from the bottom like the macOS Dock and flies the picked card into the camera's card slot. Counts are computed from data, never typed.

### LCD counter
The rear screen shows the page name, a muted line and "NN / 07" over the live pages (`src/data/pages.js`).

### Hover trace
Bordered interactive boxes lift slightly and a green streak runs around their outline (`src/lib/hoverTrace.js`). The camera and top bar keep purple hovers.

## Content

All copy and facts live in `src/data/` (`site.js`, `projects.js`, `roles.js`, `skills.js`, `cards.js`, `contact.js`, `pages.js`); one fact, one file edit. Projects and roles share a media schema (`image` | `video` | `embed`) rendered by `MediaGrid` with a lightbox. Role link cards come from `npm run link-previews` (`src/data/link-previews.json`, images in `public/previews/`).

## Photography (being redesigned)

### Photos page
`/photos` — the Photography entry point in the Camera UI. Switched on (`PHOTOGRAPHY_ENABLED = true` in `src/data/site.js`): nav item, Photos SD card, Playback hotspot and the seventh LCD page all lead here. Today it is a stub: the card head and an @ayz.nef Instagram button. Its design is the open work in `docs/spec-v3.md`.

### Legacy gallery
`/photography` (Gallery) and `/photography/portraits` (Portraits), rendered by `LegacyPhotoLayout` with the pre-v2 navbar on a cream background. Not linked from the Camera UI.

- **Gallery** — 43 photos (2022–2026; Nikon Z5II, D750, F3, FE2, Canon SX50) in `yearGroups` inside `src/pages/Photography.jsx`, newest year first, with a year divider and scroll-jump year navigation.
- **Portraits** — named sessions (`sessions` in `src/pages/Portraits.jsx`); currently empty.

### Photo slot (as built)
One gallery entry: `src` (compressed path), `alt`, `colStart`, `colSpan`, `rowStart` (relative to the year), `meta` (camera, lens, settings or film, location, date). Placement is **manual** in a 40-column grid; `rowSpan` is derived from the photo's aspect ratio via `src/data/photo-manifest.json`.

### Photo intake (new, for `/photos`)
Data lives in `src/data/photos.json` (one entry per photo) and `src/data/rolls.json` (three favorites strips plus the rolls: `trip`, `film` per camera and year, or a `year` roll for other digital photos). Drop originals into `photos-inbox/` (gitignored except its README), then run the `add-photos` Claude Code skill, or by hand: `npm run photos:scan` → fill `photos-inbox/pending.json` → `npm run photos:apply` → `npm run photos:check`. The script reads EXIF (date, camera, lens, exposure, GPS), suggests a roll, compresses to `public/photos/gallery-compressed/<year>/` and moves the original to `photos-originals/<year>/`. Nothing is placed by hand. The skill's source is `scripts/skills/add-photos/SKILL.md`; it must sit at `.claude/skills/add-photos/SKILL.md` to load.

### Image files
- **Originals:** `photos-originals/<year>/` at the repo root. **Gitignored, local only** — never deployed. (Older commits still contain them in history.)
- **Compressed (served):** `public/photos/gallery-compressed/<year>/`, 2400 px wide, JPEG q82, made by `npm run compress-photos`.
- **Manifest:** `npm run generate-manifest` records the pixel size of every file under `public/photos/`.
- **Adding a photo to the legacy gallery:** original → compress → regenerate manifest → hand-placed entry in `Photography.jsx` → new year in `photoYears.js`. See `public/photos/ADDING_PHOTOS.md` or the `/add-photo` skill.

## Avoid these terms

| Avoid | Use instead |
|---|---|
| "card tray" | "Collections dock" |
| "landing page" (for `/photos`) | "Photos page" |
| "Gallery" for `/photos` | "Photos page" (the Gallery is the legacy `/photography`) |
| "filter" (for year navigation) | "scroll-jump" or "year navigation" |
