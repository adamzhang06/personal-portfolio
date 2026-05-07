# Photography Portfolio — Domain Glossary

## Core concepts

### Gallery
The personal photography section, living at `/photography`. This is the primary entry point to the photography pages — there is no separate landing page. Contains all personal photos regardless of medium (film or digital), displayed on the white canvas and organized chronologically. Navigated by year via scroll-jump.

> Do not call this a "landing page." The gallery IS the photography entry point.

### Portraits
The professional photography section at `/photography/portraits`. Contains portrait sessions (grad, individual, group), displayed newest-first as named sessions. Signals availability for paid work via a blurb at the top of the page.

### Session
A named group of portrait photos from a single shoot. Defined by a name (e.g. "Chelsea · March 2026"), a date, and 2–4 representative photos. Sessions have a `paid` boolean field in the data that is not surfaced visually until there are enough paid sessions to warrant it.

### Photo Slot
A single photo entry in the gallery grid. Defined by:
- `src` — Cloudinary URL
- `aspect` — ratio string e.g. `"2/3"`, drives row span calculation
- `size` — `"large"` | `"medium"` | `"small"`, maps to col span in the 20-column grid
- `alt` — description
- `meta` — camera, lens, film, settings, location, date (optional fields)

> Do not use manual `col` and `row` coordinates for new photo slots. Use `size` + `aspect` and let the layout algorithm handle placement.

### White Canvas
The `bg-white` container used for photo display in both Gallery and Portraits. A core aesthetic element — preserved across the revamp. Photos sit inside it on a clean white background with minimal surrounding UI.

### Photography Sub-Navbar
A secondary navigation bar shared between the Gallery and Portraits pages. Contains two items: **Gallery** and **Portraits**. Distinct from the main site navbar. Conveys which section is currently active.

### Year Tick Mark
A minimal side-margin marker in the Gallery that indicates where a new year's photos begin. Serves as the scroll-jump anchor for the year filter. Rendered as a tiny year label + tick mark in the margin of the white canvas.

> The year filter is scroll-jump (scrolls to the year's tick mark anchor), not hide/show (does not remove photos from the DOM).

## Avoid these terms

| Avoid | Use instead |
|---|---|
| "landing page" (for `/photography`) | "Gallery" or "the gallery page" |
| "filter" (for the year navigation) | "scroll-jump" or "year navigation" |
| "film vs digital split" | There is no such split in the Gallery |
| "col / row coordinates" | "size + aspect placement" |

## Image hosting

Photos are served as static files from Vercel's CDN. Originals live in `public/photos/gallery/<year>/` and are never committed compressed. Compressed versions (run `npm run compress-photos`) live in `public/photos/gallery-compressed/<year>/` — these are what the site actually serves. Static assets (hero background, profile photo) follow the same pattern: originals in `public/assets/`, compressed in `public/assets/compressed/`.

## Layout algorithm (Gallery grid)

The Gallery uses a 20-column CSS grid with square cells (row height = column width). Given a photo slot's `size` and `aspect`:

- `size` maps to a col span: `small` → ~6–7 cols, `medium` → ~10–12 cols, `large` → 16–20 cols
- `rowSpanOf(colSpan, aspect)` computes the row span to maintain correct proportions
- The algorithm packs slots row by row without requiring manual `col` / `row` specification
