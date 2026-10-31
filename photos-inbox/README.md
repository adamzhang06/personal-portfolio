# Photo inbox

Drop new originals here (JPEG, PNG, TIFF or WebP; export raw and HEIC files to JPEG first), then in Claude Code run `/add-photos`.

The skill lives at `.claude/skills/add-photos/SKILL.md`; it needs `npm install` once for `exifr`.

It reads each photo's metadata, puts it in the right roll, asks you only for what the file can't tell it (title, place, film details), and then files everything:

- compressed copy → `public/photos/gallery-compressed/<year>/`
- original → `photos-originals/<year>/` (gitignored)
- data → `src/data/photos.json` and `src/data/rolls.json`

By hand: `npm run photos:scan`, fill in `photos-inbox/pending.json`, then `npm run photos:apply`. `npm run photos:check` validates the data.

Everything in this folder except this README is ignored by git.
