// Builds link previews for every role link, and every project link that isn't GitHub or Devpost (those show as
// plain logo buttons).
// Fetches each page's Open Graph / Twitter card metadata (oEmbed for YouTube and Vimeo), saves the
// preview image resized to public/previews/, and writes src/data/link-previews.json.
// A link listed in IMAGE_FILES uses that hand-picked image (in scripts/link-preview-images/) instead of the page's own.
// Run after adding or changing links:  npm run link-previews
// Or refresh only some, keeping every other card as it is:  npm run link-previews -- <url> [<url> …]
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import process from "node:process";
import sharp from "sharp";
import { roles } from "../src/data/roles.js";
import { projects } from "../src/data/projects.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMG_DIR = path.join(ROOT, "public/previews");
const OUT = path.join(ROOT, "src/data/link-previews.json");
const IMAGE_FILES = {
  "https://engineering.purdue.edu/fsae/wordpress/": "purdue-fsae.jpg", // the site's own og:image isn't the hero
  "https://www.purdueusb.com/": "purdue-usb.jpg", // the site has no og:image
  "https://doratcalhacks.site/": "dor-site.jpg", // the site has no og:image; a screenshot of its opening screen
};
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

const BUTTON_HOSTS = ["github.com", "devpost.com"]; // as LinkButtons in src/components/LinkPreview.jsx
const host = (href) => new URL(href).hostname.replace(/^www\./, "");
const links = [
  ...new Set([
    ...roles.flatMap((x) => x.links.map((l) => l.href)),
    ...projects.flatMap((p) => p.links.map((l) => l.href)).filter((href) => !BUTTON_HOSTS.includes(host(href))),
  ]),
];
const only = process.argv.slice(2);
for (const href of only) if (!links.includes(href)) throw new Error(`${href} is not a role or project link`);

const decode = (s) =>
  s
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/\s+/g, " ").trim();

function meta(html, ...names) {
  for (const n of names) {
    const re = new RegExp(`<meta[^>]+(?:property|name)=["']${n}["'][^>]*>`, "i");
    const tag = html.match(re)?.[0];
    const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
    if (content) return decode(content);
  }
  return "";
}

async function get(url, as = "text", tries = 3) {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: as === "text" ? "text/html,*/*" : "*/*" }, redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (res.status === 429 && tries > 1) {
    await new Promise((r) => setTimeout(r, 4000)); // rate limited: back off and try again
    return get(url, as, tries - 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return as === "text" ? res.text() : Buffer.from(await res.arrayBuffer());
}

async function oembed(href) {
  const host = new URL(href).hostname;
  const api = /youtube\.com|youtu\.be/.test(host)
    ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(href)}`
    : /vimeo\.com/.test(host)
      ? `https://vimeo.com/api/oembed.json?width=1280&url=${encodeURIComponent(href)}`
      : null;
  if (!api) return null;
  const j = JSON.parse(await get(api));
  return { title: j.title, description: j.author_name ? `Video by ${j.author_name}` : "", site: j.provider_name, image: j.thumbnail_url };
}

async function scrape(href) {
  const html = await get(href);
  const title = meta(html, "og:title", "twitter:title") || decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "");
  let image = meta(html, "og:image", "og:image:url", "twitter:image", "twitter:image:src");
  if (image) image = new URL(image, href).href;
  let description = meta(html, "og:description", "twitter:description", "description");
  const gh = title.match(/^GitHub - ([^:]+)(?::\s*(.*))?$/); // "GitHub - owner/repo: About text"
  if (gh) return { title: gh[1], description: gh[2] || description.replace(/ - [\w.-]+\/[\w.-]+$/, ""), site: "GitHub", image };
  return { title, description, site: meta(html, "og:site_name"), image };
}

async function saveImage(src, href) {
  const name = crypto.createHash("sha1").update(href).digest("hex").slice(0, 12) + ".webp";
  const file = IMAGE_FILES[href];
  const buf = file ? await fs.readFile(path.join(ROOT, "scripts/link-preview-images", file)) : await get(src, "buffer");
  await sharp(buf).resize({ width: 800, height: 420, fit: "cover", position: file ? "north" : "attention" }).webp({ quality: 74 }).toFile(path.join(IMG_DIR, name));
  return `/previews/${name}`;
}

await fs.mkdir(IMG_DIR, { recursive: true });
const kept = only.length ? JSON.parse(await fs.readFile(OUT, "utf8")) : {};
const out = {};
for (const href of only.length ? only : links) {
  try {
    const data = (await oembed(href)) ?? (await scrape(href));
    let image = null;
    if (data.image || IMAGE_FILES[href]) image = await saveImage(data.image, href).catch((e) => (console.warn(`  image failed: ${e.message}`), null));
    out[href] = {
      title: data.title?.slice(0, 140) || null,
      description: data.description?.slice(0, 220) || null,
      site: data.site || null,
      domain: host(href),
      image,
    };
    console.log(`✓ ${href}${image ? "" : " (no image)"}`);
  } catch (e) {
    out[href] = { title: null, description: null, site: null, domain: host(href), image: null };
    console.warn(`✗ ${href}: ${e.message}`);
  }
}
const all = Object.fromEntries(links.map((href) => [href, out[href] ?? kept[href]]).filter(([, v]) => v));
await fs.writeFile(OUT, JSON.stringify(all, null, 2) + "\n");
console.log(`wrote ${path.relative(ROOT, OUT)} (${only.length ? `${only.length} of ` : ""}${links.length} links)`);
