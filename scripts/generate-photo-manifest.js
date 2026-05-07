import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";
import { imageSize } from "image-size";

const __dirname = dirname(fileURLToPath(import.meta.url));
const photosDir = join(__dirname, "..", "public", "photos");
const dataDir = join(__dirname, "..", "src", "data");
const outputFile = join(dataDir, "photo-manifest.json");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

mkdirSync(dataDir, { recursive: true });

function walkDir(dir, prefix = "") {
  const manifest = {};
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      Object.assign(manifest, walkDir(join(dir, entry.name), rel));
    } else if (IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
      try {
        const buf = readFileSync(join(dir, entry.name));
        const { width, height } = imageSize(buf);
        manifest[rel] = { w: width, h: height };
      } catch {
        console.warn(`Skipping ${rel}: could not read dimensions`);
      }
    }
  }
  return manifest;
}

const manifest = walkDir(photosDir);

writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
console.log(`✓ Manifest generated for ${Object.keys(manifest).length} photos`);
