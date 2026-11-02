#!/usr/bin/env node
/* 3D models for the case studies and the FTC role.

   1. Export the CAD assembly as a .glb (Onshape, or Fusion → Blender) into models-src/ (gitignored), named as in
      MODELS below. A new model: add a row, and point a project's `model` or a role's `models` at its output.
   2. npm run models [name…]            rebuilds public/models/<out> from models-src/<src> with real materials
                                        (below), optimised for the web: instanced, palette-merged, simplified, Draco.
   3. npm run models:previews [name…]   renders each model's viewer in Chrome (needs Google Chrome installed) to
                                        public/models/previews/<name>.webp, the stills on Home. Run after step 2.

   Materials. The CAD exports carry each part's appearance but not as glTF means it:
   - colours were written in sRGB where glTF expects linear, so everything came out washed-out and near white;
   - nothing is metallic, so aluminium and steel render as white plastic.
   So each material's colour is converted, its metalness and roughness come from its appearance name (Aluminum -
   Satin, Plastic - Matte (Black), …), and non-metal colours are kept within what real paint and plastic reflect
   (about 3 % to 80 %), so blacks aren't void and whites don't glare. Where the CAD colour only stands in for the
   real one, PHOTO_COLOURS and PARTS override it, matched to photos of the real thing.

   Moving parts. A model's `joints` keep the parts that move as their own groups (everything else is merged for
   speed), each with its motion in the group's glTF extras; the site's viewer turns those into controls. The CAD's
   mates don't survive export, so each joint names its parts and gives its axis and travel by hand. */

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRMaterialsSpecular } from "@gltf-transform/extensions";
import { dedup, getBounds, instance, palette, dequantize, join, weld, simplify, resample, prune, sparse, draco } from "@gltf-transform/functions";
import { Matrix4, Vector3 } from "three";
import { MeshoptSimplifier } from "meshoptimizer";
import draco3d from "draco3dgltf";

const SRC = "models-src";
const OUT = "public/models";
const PREVIEWS = "public/models/previews";

// simplify: meshopt's error bound (default 0.0001); the 2024 robot needs more to stay near the others' size.
// parts: per-part overrides from PARTS.
// joints: what moves. Each is { id, label, slide | turn: axis, range, pivot?, parent?, has(part) }:
//   has(part) picks the meshes that move with it, from part.in(name) (inside that CAD assembly or part),
//   part.any(prefix) (inside one whose name starts so), part.child(name) (the name of the part directly inside
//   it) and part.c (the mesh's centre, mm);
//   range is metres for a slide and degrees for a turn, from the CAD's own pose (0); pivot is where a turn's
//   axis passes (metres); parent is a joint this one rides on; step orders the controls when the viewer plays them
//   (lower steps go out first and come back last; same step, together). Joints with the same label share one
//   control, the first one's range shown on it. The deepest matching joint wins; between equals, the later one.
// mount: the part the site's procedural camera replaces (removed; its place kept on the joint that carries it).
const VIPER = [0, 0.966, 0.259]; // the 2024 Viper channels' long axis

const MODELS = [
  {
    src: "robot-2022.glb",
    out: "robot-2022-final.glb",
    // 3-stage REV slide, side by side in x: the back stage is fixed, and the carriage with the claw climbs the front
    // one as the stages extend (a cascade), ending at the very top.
    joints: [
      { id: "lift", label: "Lift", slide: [0, 1, 0], range: [0, 0.7], has: (p) => p.in("Linear Slide Assembly v8") && p.c[0] >= 35 },
      { id: "lift-mid", label: "Lift", slide: [0, 1, 0], range: [0, 0.35], has: (p) => p.in("Linear Slide Assembly v8") && p.c[0] >= 18 && p.c[0] < 35 },
      { id: "carriage", label: "Lift", slide: [0, 1, 0], range: [0, 0.92], has: (p) => p.in("Cam v10") || (p.in("Linear Slide Assembly v8") && p.c[0] >= 46 && p.c[1] < 200) },
    ],
  },
  {
    src: "robot-2023.glb",
    out: "robot-2023-final.glb",
    // The arm swings up and back over the robot about the rear end of its two extrusions. The climbing hooks ride
    // the middle linear slide (on the winch), three stages front to back in z: the back one fixed, the middle one
    // half the way, the front one (holders, weights, hooks) all of it. The hook goes up only once the arm is out of
    // its way (step 2).
    joints: [
      { id: "arm", label: "Arm", turn: [-1, 0, 0], pivot: [0, 0.2935, -0.198], range: [0, 150], has: (p) => p.in("Arm v7") },
      { id: "hook", label: "Hook", slide: [0, 1, 0], range: [0, 0.34], step: 2, has: (p) => p.in("Hook Assembley v4") || (p.in("LS v5") && p.c[2] > -52) },
      { id: "hook-mid", label: "Hook", slide: [0, 1, 0], range: [0, 0.17], step: 2, has: (p) => p.in("LS v5") && p.c[2] > -68 && p.c[2] <= -52 },
    ],
  },
  {
    src: "robot-2024.glb",
    out: "robot-2024-final.glb",
    simplify: 0.003,
    // Viper slides: four nested stages per side, leaning back 15° (along their channels), the bucket and specimen
    // claw on the innermost; the intake (with its servos and front mounts) runs forward (−z) on the inner rails of
    // its own drawer slides.
    joints: [
      { id: "lift", label: "Lift", slide: VIPER, range: [0, 0.78], has: (p) => viperStage(p) === 3 },
      { id: "lift-2", label: "Lift", slide: VIPER, range: [0, 0.52], has: (p) => viperStage(p) === 2 },
      { id: "lift-1", label: "Lift", slide: VIPER, range: [0, 0.26], has: (p) => viperStage(p) === 1 },
      {
        id: "intake",
        label: "Intake",
        slide: [0, 0, -1],
        range: [0, 0.24],
        has: (p) => {
          const part = p.child("New Horizontal Extenstion v50");
          if (!part) return false;
          if (part.startsWith("2500-0014-0336")) return p.any("2500-0014-0336 Inside"); // the drawer slides' inner rails
          return p.c[2] < 200 && !part.startsWith("Back Viper Mount"); // the intake, its servos and their mounts
        },
      },
      // their ball cages travel half as far
      { id: "intake-cage", label: "Intake", slide: [0, 0, -1], range: [0, 0.12], has: (p) => p.in("New Horizontal Extenstion v50") && (p.any("Ball Cage for 2500") || p.any("Ball Bearing for 2500")) },
    ],
  },
  {
    src: "slider.glb",
    out: "slider-final.glb",
    parts: "axi6",
    joints: [
      { id: "carriage", label: "Carriage", slide: [1, 0, 0], range: [-0.34, 0.37], has: (p) => p.in("Carriage <1>") },
      { id: "pan", label: "Pan", turn: [0, 1, 0], pivot: [0.463, 0, 0.092], range: [-180, 180], parent: "carriage", has: (p) => p.in("Pan <1>") || p.in("occurrence of Fujifilm X100VI") },
    ],
    mount: { part: "Fujifilm X100VI", width: 0.128 },
  },
];

// 2024 Viper lift: which stage a part rides (0 fixed … 3 innermost), by its distance in x from the robot's centre
// line (the two slides mirror about it). Stage extrusions and the pulleys on their tops go by stage; the bucket,
// specimen claw and their servos ride the innermost.
function viperStage(p) {
  if (["Bucket", "Specimen", "Hook", "Pivot Bracket"].some((n) => p.child("Vertical Extension v22")?.startsWith(n))) return 3;
  if (["3202-0001-2501", "Axon_MAX", "1202-0001-0003"].some((n) => p.child("Viper Slide System")?.startsWith(n))) return 3;
  const slide = p.in("Viper Slide L (3210-0003-0004) v1") || p.in("Viper Slide R (3210-0003-0004) v1");
  if (!slide) return 0;
  const d = Math.abs(p.c[0] + 16.5);
  const byStage = d < 104 ? 3 : d < 116 ? 2 : d < 128 ? 1 : 0;
  const part = p.child("Viper Slide L (3210-0003-0004) v1") ?? p.child("Viper Slide R (3210-0003-0004) v1");
  if (part?.startsWith("2500-0014-0336") || p.c[1] > 0) return byStage;
  return d < 92 ? 3 : 0;
}

// Colours the CAD only stands in for: team 16498's lime-green prints, from the photos on /photos.
const PHOTO_COLOURS = [[/Plastic - Matte \(Green\)/, "#78c050"]];

// Per-part overrides where the CAD colours don't say what a part is made of.
// AXI6 (Onshape, matched to the project photo): custom parts left at Onshape's default grey and the yellow spacers
// are orange prints, the rails are carbon fibre, and the belts and feet are rubber.
const PARTS = {
  axi6: (make) => {
    const orange = make("Printed PLA (Orange)", "#f25a14", 0, 0.55);
    const carbon = make("Carbon Fibre", "#161618", 0, 0.28);
    const rubber = make("Rubber (Black)", "#141414", 0, 0.85);
    const printed = /^(Carriage|150T Pan Gear|Belt Clamp|Clamp Plate|Slider Pulley|30T Pan Pinion|16T Pan Pulley|Helical 1M 12T|Part (28|29|34))$|Custom HTD/;
    return (part, colour) => {
      if (part === "Carbon Tube") return carbon;
      if (/Belt$/.test(part) || part === "Part 31") return rubber;
      if (colour === "0.98,0.71,0.00" || (printed.test(part) && /^0\.2[25],/.test(colour))) return orange;
    };
  },
};

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const hexLin = (hex) => [0, 2, 4].map((i) => lin(parseInt(hex.slice(i + 1, i + 3), 16) / 255));

// Non-metals reflect between ~3 % (black plastic) and ~80 % (white paint); keep the hue, scale into that range.
function albedo(rgb, metal) {
  if (metal >= 0.5) return rgb;
  const y = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  if (y >= 0.03 && y <= 0.8) return rgb;
  if (y < 1e-4) return [0.03, 0.03, 0.03];
  const k = (y < 0.03 ? 0.03 : 0.8) / y;
  return rgb.map((c) => Math.min(1, c * k));
}

// Metalness and roughness from the appearance name; unnamed colours (vendor STEP parts, Onshape) by colour.
function look(name, [r, g, b]) {
  const n = name.toLowerCase();
  const fin = (polished, satin, rough) => (/polish|chrome|glossy/.test(n) ? polished : /rough|cast|brushed/.test(n) ? rough : satin);
  if (/alumin|steel|silver|chrome|titanium|brass|copper|zinc|nickel/.test(n)) return { metal: 1, rough: /anodiz/.test(n) ? fin(0.3, 0.42, 0.55) : fin(0.18, 0.35, 0.55) };
  if (/paint - metallic/.test(n)) return { metal: 0.6, rough: 0.35 };
  if (/polycarbonate|clear|glass|acrylic/.test(n)) return { metal: 0, rough: 0.08, alpha: 0.35 };
  if (/kapton|polyimide|polymide/.test(n)) return { metal: 0, rough: 0.3 };
  if (/plastic|abs|pla|petg|nylon|rubber|rev |orange/.test(n)) return { metal: 0, rough: /glossy/.test(n) ? 0.25 : 0.62 };
  // neutral light-to-mid greys are bare aluminium hardware
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0;
  if (sat < 0.12 && mx >= 0.45) return { metal: 0.85, rough: 0.4 };
  return { metal: 0, rough: mx < 0.3 ? 0.65 : 0.5 };
}

async function build(model) {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });
  const doc = await io.read(path.join(SRC, model.src));

  for (const m of doc.getRoot().listMaterials()) {
    const f = m.getBaseColorFactor(), name = m.getName() || "";
    const { metal, rough, alpha } = look(name, f);
    const photo = PHOTO_COLOURS.find(([re]) => re.test(name));
    m.setBaseColorFactor([...albedo(photo ? hexLin(photo[1]) : [lin(f[0]), lin(f[1]), lin(f[2])], metal), alpha ?? f[3]]);
    m.setMetallicFactor(metal).setRoughnessFactor(rough);
    if (alpha != null) m.setAlphaMode("BLEND");
    m.setExtension(KHRMaterialsSpecular.EXTENSION_NAME, null); // the exporter's specular overrides (2× on one robot)
  }
  doc.getRoot().listExtensionsUsed().filter((e) => e.extensionName === KHRMaterialsSpecular.EXTENSION_NAME).forEach((e) => e.dispose());

  if (model.parts) {
    const make = (name, hex, metal, rough) => doc.createMaterial(name).setBaseColorFactor([...albedo(hexLin(hex), metal), 1]).setMetallicFactor(metal).setRoughnessFactor(rough);
    const pick = PARTS[model.parts](make);
    for (const n of doc.getRoot().listNodes()) {
      const part = n.getName().replace(/ <\d+>$/, "");
      for (const prim of n.getMesh()?.listPrimitives() ?? []) {
        // Onshape names materials by colour: "0.250980_0.250980_0.250980_…"
        const colour = (prim.getMaterial()?.getName() ?? "").split("_").slice(0, 3).map((x) => (+x).toFixed(2)).join(",");
        const m = pick(part, colour);
        if (m) prim.setMaterial(m);
      }
    }
  }

  await doc.transform(dedup());
  // Instance only the parts that stay put: instancing would pull a joint's repeated parts out to the scene root.
  const joints = rig(doc, model);
  const scene = doc.getRoot().listScenes()[0];
  joints.forEach((j) => scene.removeChild(j));
  await doc.transform(instance({ min: 5 }));
  joints.forEach((j) => scene.addChild(j));
  await doc.transform(
    palette({ min: 5 }),
    dequantize(),
    join(), // joins siblings, so each joint's parts merge among themselves
    weld(),
    simplify({ simplifier: MeshoptSimplifier, error: model.simplify ?? 0.0001 }),
    resample(),
    prune({ keepExtras: true }),
    sparse(),
    draco(),
  );
  await io.write(path.join(OUT, model.out), doc);
}

// What flatten() does, but keeping the joints: every mesh moves to the scene root, or (if a joint has it) under that
// joint's node, which sits at the joint's pivot and carries its motion in extras: { joint: { label, type, axis,
// range, step? } }, range in metres or radians. The mount part is removed and its place recorded as extras.cameraMount.
function rig(doc, model) {
  const scene = doc.getRoot().listScenes()[0];
  const meshes = [];
  const walk = (n, names) => {
    const path = [...names, n.getName()];
    if (n.getMesh()) {
      const b = getBounds(n);
      meshes.push({ n, path, world: new Matrix4().fromArray(n.getWorldMatrix()), c: b.min.map((v, i) => ((v + b.max[i]) / 2) * 1000) });
    }
    n.listChildren().forEach((ch) => walk(ch, path));
  };
  scene.listChildren().forEach((n) => walk(n, []));

  const joints = new Map();
  for (const j of model.joints ?? []) {
    const parent = j.parent && joints.get(j.parent);
    const pivot = j.pivot ?? [0, 0, 0];
    const turn = Boolean(j.turn);
    const node = doc
      .createNode(`joint:${j.id}`)
      .setTranslation(parent ? pivot.map((v, i) => v - parent.pivot[i]) : pivot)
      .setExtras({ joint: { label: j.label, type: turn ? "turn" : "slide", axis: j.turn ?? j.slide, range: turn ? j.range.map((d) => (d * Math.PI) / 180) : j.range, ...(j.step && { step: j.step }) } });
    (parent ? parent.node : scene).addChild(node);
    joints.set(j.id, { ...j, node, pivot, depth: parent ? parent.depth + 1 : 0, world: new Matrix4().makeTranslation(...pivot), count: 0 });
  }

  for (const m of meshes) {
    const at = (name) => m.path.indexOf(name);
    const part = { c: m.c, in: (name) => at(name) >= 0, any: (prefix) => m.path.some((n) => n.startsWith(prefix)), child: (name) => (at(name) >= 0 ? m.path[at(name) + 1] : undefined) };
    const j = [...joints.values()].filter((jt) => jt.has(part)).reduce((best, jt) => (!best || jt.depth >= best.depth ? jt : best), null);
    if (model.mount && m.path.includes(model.mount.part)) {
      if (j && m.n.getName() === model.mount.part) {
        const spot = new Vector3().setFromMatrixPosition(new Matrix4().copy(j.world).invert().multiply(m.world));
        j.node.setExtras({ ...j.node.getExtras(), cameraMount: { position: spot.toArray(), width: model.mount.width } });
      }
      m.n.setMesh(null);
      continue;
    }
    const local = j ? new Matrix4().copy(j.world).invert().multiply(m.world) : m.world;
    m.n.listChildren().forEach((ch) => m.n.removeChild(ch)); // children were collected separately
    m.n.setMatrix(local.toArray());
    (j ? j.node : scene).addChild(m.n);
    if (j) j.count++;
  }
  for (const j of joints.values()) console.log(`    joint ${j.id}: ${j.count} parts${j.node.getExtras().cameraMount ? " + camera mount" : ""}`);
  return [...joints.values()].filter((j) => !j.parent).map((j) => j.node);
}

// Every model the site shows, with the viewer props it's shown with.
async function shown() {
  const { projects } = await import("../src/data/projects.js");
  const { roles } = await import("../src/data/roles.js");
  return [
    ...projects.filter((p) => p.model).map((p) => ({ src: p.model, lcd: p.name })),
    ...roles.flatMap((r) => (r.models ?? []).map((m) => ({ src: m.src }))),
  ];
}

// Renders scripts/model-preview.html (the real ModelViewer, still, at its resting view) for each model.
async function previews(names) {
  const { createServer } = await import("vite");
  const { chromium } = await import("playwright-core");
  const sharp = (await import("sharp")).default;
  const server = await createServer({ logLevel: "error", server: { port: 0 } });
  await server.listen();
  const base = server.resolvedUrls.local[0];
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    await mkdir(PREVIEWS, { recursive: true });
    for (const m of await shown()) {
      const name = path.basename(m.src, ".glb");
      if (names.length && !names.some((n) => name.startsWith(n))) continue;
      const page = await browser.newPage({ viewport: { width: 800, height: 700 }, deviceScaleFactor: 1.5, reducedMotion: "reduce" });
      const q = new URLSearchParams({ src: m.src, ...(m.lcd && { lcd: m.lcd }) });
      await page.goto(`${base}scripts/model-preview.html?${q}`);
      // loaded: the canvas is up and the loading percentage gone
      await page.waitForFunction(() => document.querySelector("[role=img] canvas") && ![...document.querySelectorAll("[role=img] span")].some((s) => s.textContent.endsWith("%")), null, { timeout: 120000 });
      await page.waitForTimeout(1500); // the studio lighting and the first frames
      const png = await page.locator("[role=img] canvas").screenshot();
      await writeFile(path.join(PREVIEWS, `${name}.webp`), await sharp(png).webp({ quality: 82 }).toBuffer());
      console.log(`  ${name}.webp`);
      await page.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

const [cmd, ...names] = process.argv.slice(2);
if (cmd === "build") {
  for (const m of MODELS) {
    if (names.length && !names.some((n) => m.src.startsWith(n))) continue;
    if (!existsSync(path.join(SRC, m.src))) {
      console.log(`  skipped ${m.src}: not in ${SRC}/`);
      continue;
    }
    await build(m);
    console.log(`  ${m.src} → ${OUT}/${m.out}`);
  }
} else if (cmd === "previews") await previews(names);
else console.log("usage: node scripts/models.mjs build|previews [name…]");
