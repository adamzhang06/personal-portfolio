import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC_DIR = "public/photos/gallery";
const OUT_DIR = "public/photos/gallery-compressed";
const MAX_WIDTH = 2400;
const QUALITY = 82;

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"]);

async function getYearDirs(base) {
  const entries = await readdir(base, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

async function compressYear(year) {
  const srcYear = path.join(SRC_DIR, year);
  const outYear = path.join(OUT_DIR, year);

  if (!existsSync(outYear)) {
    await mkdir(outYear, { recursive: true });
  }

  const files = await readdir(srcYear);
  const images = files.filter((f) => IMAGE_EXTS.has(path.extname(f)));

  for (const filename of images) {
    const srcPath = path.join(srcYear, filename);
    // Always output as .jpg regardless of original extension
    const outName = path.basename(filename, path.extname(filename)) + ".jpg";
    const outPath = path.join(outYear, outName);

    const { size: sizeBefore } = (await import("node:fs")).statSync(srcPath);

    await sharp(srcPath)
      .rotate() // auto-orient from EXIF
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(outPath);

    const { size: sizeAfter } = (await import("node:fs")).statSync(outPath);
    const pct = Math.round((1 - sizeAfter / sizeBefore) * 100);
    console.log(
      `  ${year}/${filename}  ${(sizeBefore / 1e6).toFixed(1)} MB → ${(sizeAfter / 1e6).toFixed(1)} MB  (${pct}% smaller)`
    );
  }
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  const years = await getYearDirs(SRC_DIR);
  console.log(`Compressing ${years.length} year(s): ${years.join(", ")}\n`);

  for (const year of years.sort()) {
    await compressYear(year);
  }

  console.log("\nDone. Compressed files are in:", OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
