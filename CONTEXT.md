# adamzhang.org — Domain Glossary

How the site is built today (Oct 30, 2026). When this file and an older doc disagree, this file and the code win.

## Docs status

- `docs/spec-v3.md` — the current spec (the site as built, plus the photography redesign as it is decided). Local only: `docs/` is gitignored.
- `docs/spec-v2.md` — **out of date.** The Camera UI hand-off spec; the code has moved past it (dor, hover trace, slide-in camera panels, photography switched on).
- `docs/adr/0001-cloudinary-for-photo-hosting.md` — deferred; photos are still self-hosted.
- Claude Design canvas "adamzhang.org — Camera UI" — out of date; the code is the reference for the camera UI. Photography is being designed in its own canvas.

## The shell

### Camera UI
Every route runs inside `SiteShell`: one procedural three.js camera (`src/components/camera/`), a dark theme (`src/styles/site.css`), and a top bar. Pages never import camera code.

### Camera stage
The single camera canvas. On **Home** it sits in the hero and scrolls with the page; on every other page it is **docked** bottom right (rear view). It is never re-mounted. Phones get an inline camera on Home only, plus a "Camera controls" disclosure.

### Docked camera / camera controls
Clicking the docked camera expands it; **Camera controls** and **Sections** slide in as two panels from the right. The camera's buttons sweep purple when it opens and as a hint on each page until it has been opened once.

### Control
A camera button with a plain-English action: Shutter → Contact, Mode dial → Sections, Card door → Collections, Monitor → Flip, Playback ▶ → Photography, MENU → Site menu, i → Quick facts, OK → Home, Record → Demo videos (off: `DEMO_VIDEOS = false`). Defined in `controls.js`.

### Sections dial
The mode dial's picker: H · A · P · E · L (Home, About, Projects, Experience, Leadership). Photography and Contact have no notch.

### Collections / SD card
The five section cards (About, Projects, Experience, Leadership, Photos) in `src/data/cards.js`. On Home they sit below the hero; the card door opens the **Collections dock**, which rises from the bottom like the macOS Dock and flies the picked card into the camera's card slot. Counts are computed from data, never typed ("4 items" on the page, printed "04 ITEMS" on the card).

### Latest
Home's last section (`src/components/Latest.jsx`): the newest project as a large print beside its result (opens the case study), then the newest roll unrolling from its canister on one strip; **Open the roll** goes to `/photos#<roll id>`, which arrives with that roll open. The Home **polaroid** develops like instant film once per page load, after the intro and once it is on screen.

### LCD counter
The rear screen shows the page name, a muted line and "NN / 07" over the live pages (`src/data/pages.js`). **LCD preview:** while a project card, role row or roll canister is hovered or focused, the docked camera's LCD shows it instead (name, a line about it, a detail). Pages set it with `useLcdPeek()` from `src/context/uiContext.js`, never by importing camera code.

### Hover trace
Bordered interactive boxes lift slightly and a green streak runs around their outline (`src/lib/hoverTrace.js`). The camera and top bar keep purple hovers.

## Content

All copy and facts live in `src/data/` (`site.js`, `projects.js`, `roles.js`, `skills.js`, `cards.js`, `contact.js`, `pages.js`); one fact, one file edit. Projects and roles share a media schema (`image` | `video` | `embed`) rendered by `MediaGrid` with a lightbox. Every case study has a Links section: GitHub and Devpost as logo buttons, any other project link (dor's live site) as a preview card. Role and those project link cards come from `npm run link-previews` (`src/data/link-previews.json`, images in `public/previews/`; `npm run link-previews -- <url>` refreshes just that card); a link listed in the script's `IMAGE_FILES` uses a hand-picked image from `scripts/link-preview-images/` (Purdue Formula SAE, Purdue USB and dor's site do).

## Photography (being redesigned)

### Photos page
`/photos` — the Photography entry point in the Camera UI. Switched on (`PHOTOGRAPHY_ENABLED = true` in `src/data/site.js`): nav item, Photos SD card, Playback hotspot and the seventh LCD page all lead here. Built as design D, **Film rolls** (`PhotosPage` + `src/components/photos/`, data via `src/lib/rolls.js`, styles in `src/styles/photos.css`): the favorites unroll from their canisters as they scroll into view, on as many strips as the window needs; below, one kraft counter-display carton per year, drawn in perspective from slightly above (newest first; the year and its contents printed on the header, which rises from the narrower back wall; a die-cut scoop in the front wall under each canister) holds that year's canisters, with Trips / Film / Digital filters (any number on, animated with view transitions; Reset, left of the filters, or turning the last one off shows all). Canister colours mark the kind: gold favorites, purple trips, cream film, steel-blue pixel-grid digital. A canister opens the roll in a see-through overlay whose strips each come from their own canister on alternating sides; Rewind, Esc or a click off the film closes it; `/photos#<roll id>` opens that roll on arrival. Film photos come off the canister as **negatives** (colour stock under its orange mask, B&W plain) and develop once their strip lies flat. Any photo opens on the camera's **playback screen** (`PhotoLightbox`): file name, frame count, exposure or film stock, lens, a histogram, camera and time stamp, with the title and place under it. A strip's band counts up, "n/total EXP" with n the photos up to the end of that strip (3/10, then 10/10); a shelf canister's reads "N EXP".

### Old gallery (removed)
The pre-v2 gallery (`/photography`, `/photography/portraits`) was deleted on Oct 30, 2026; both addresses redirect to `/photos`. Its 43 photos all live on in `photos.json`.

### Photo intake
Data lives in `src/data/photos.json` (one entry per photo) and `src/data/rolls.json` (the favorites, one run of frames with `null` for an empty frame, plus the rolls: `trip`, `film` per camera and year (named "Film"), or a `year` roll for other digital photos). Drop originals into `photos-inbox/` (gitignored except its README), then run the `add-photos` Claude Code skill, or by hand: `npm run photos:scan` → fill `photos-inbox/pending.json` → `npm run photos:apply` → `npm run photos:check`. The script reads EXIF (date, camera, lens, exposure, GPS), suggests a roll, compresses to `public/photos/gallery-compressed/<year>/` and moves the original to `photos-originals/<year>/`. Nothing is placed by hand. The skill is `.claude/skills/add-photos/SKILL.md`.

### Image files
- **Originals:** `photos-originals/<year>/` at the repo root. **Gitignored, local only** — never deployed. (Older commits still contain them in history.)
- **Compressed (served):** `public/photos/gallery-compressed/<year>/`, 2400 px wide, JPEG q82, made by `npm run photos:apply` (or `npm run compress-photos` for a whole originals folder).

## Avoid these terms

| Avoid | Use instead |
|---|---|
| "card tray" | "Collections dock" |
| "landing page" (for `/photos`) | "Photos page" |
| "Gallery" for `/photos` | "Photos page" |
| "filter" (for year navigation) | "scroll-jump" or "year navigation" |
