import * as THREE from "three";

// Procedural Nikon Z-style mirrorless body + 24–70 lens, ported from docs/reference/camera.js.
// Units ≈ cm; rear faces +z, lens points -z, grip on +x.
// Returns the model group, the control meshes/anchors by key (HS), the mode dial and the LCD material.

// The engine is built once per page and cached, so a hot update can't swap this module in: reload instead.
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());

const PI = Math.PI;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ---- textures ---- */
function noiseTex(size, blobs, soft) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d");
  x.fillStyle = "#808080";
  x.fillRect(0, 0, size, size);
  const id = x.getImageData(0, 0, size, size);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * (soft ? 60 : 200);
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
  }
  x.putImageData(id, 0, 0);
  for (let b = 0; b < blobs; b++) {
    const px = Math.random() * size, py = Math.random() * size, r = 1.2 + Math.random() * 3.2;
    x.fillStyle = "rgba(" + (Math.random() < 0.55 ? "0,0,0" : "255,255,255") + ",.28)";
    [-size, 0, size].forEach((dx) => {
      [-size, 0, size].forEach((dy) => {
        x.beginPath();
        x.arc(px + dx, py + dy, r, 0, 7);
        x.fill();
      });
    });
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function stripeTex(n) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 4;
  const x = c.getContext("2d");
  for (let i = 0; i < n; i++) {
    x.fillStyle = "#fff";
    x.fillRect((i * 1024) / n, 0, (1024 / n) * 0.45, 4);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

function labelTex(txt, col) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  x.fillStyle = col || "#e9e6ef";
  x.strokeStyle = col || "#e9e6ef";
  x.lineWidth = 14;
  x.lineCap = "round";
  x.lineJoin = "round";
  x.textAlign = "center";
  x.textBaseline = "middle";
  if (txt === "play") {
    x.beginPath(); x.moveTo(96, 80); x.lineTo(180, 128); x.lineTo(96, 176); x.closePath(); x.lineWidth = 12; x.stroke();
  } else if (txt === "del") {
    x.lineWidth = 11; x.strokeRect(92, 96, 72, 88);
    x.beginPath(); x.moveTo(78, 90); x.lineTo(178, 90); x.moveTo(112, 76); x.lineTo(144, 76); x.moveTo(116, 112); x.lineTo(116, 166); x.moveTo(140, 112); x.lineTo(140, 166); x.stroke();
  } else if (txt === "zin" || txt === "zout") {
    x.lineWidth = 12; x.beginPath(); x.arc(112, 112, 44, 0, 7); x.moveTo(144, 144); x.lineTo(182, 182); x.moveTo(90, 112); x.lineTo(134, 112);
    if (txt === "zin") { x.moveTo(112, 90); x.lineTo(112, 134); }
    x.stroke();
  } else if (txt === "mon") {
    x.lineWidth = 11; x.strokeRect(70, 86, 116, 78); x.beginPath(); x.moveTo(110, 186); x.lineTo(146, 186); x.stroke();
  } else if (txt === "i") {
    x.font = "italic 700 150px Georgia,serif"; x.fillText("i", 128, 136);
  } else {
    const s = txt.length <= 2 ? 110 : txt.length <= 4 ? 66 : 52;
    x.font = "700 " + s + 'px "Hanken Grotesk",system-ui,sans-serif';
    x.fillText(txt, 128, 134);
  }
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 8;
  return t;
}

/* ---- geometry helpers ---- */
function rr(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function slab(w, h, d, r, b, mat, seg) {
  const g = new THREE.ExtrudeGeometry(rr(w - 2 * b, h - 2 * b, Math.max(r - b, 0.02)), {
    depth: Math.max(d - 2 * b, 0.01), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: seg || 5, curveSegments: 14,
  });
  g.translate(0, 0, -Math.max(d - 2 * b, 0.01) / 2);
  return new THREE.Mesh(g, mat);
}
function lathe(pts, mat, seg) {
  return new THREE.Mesh(new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg || 64), mat);
}
function knurl(r, h, n, a, mat) {
  const g = new THREE.CylinderGeometry(r, r, h, n * 4, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), q = Math.hypot(x, z);
    if (q > r * 0.98) {
      const an = Math.atan2(z, x), k = 1 - a * Math.pow(0.5 - 0.5 * Math.cos(an * n), 2);
      p.setX(i, x * k);
      p.setZ(i, z * k);
    }
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}
function cyl(rt, rb, h, mat, seg, open) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 96, 1, !!open), mat);
}

export function buildCameraModel() {
  const model = new THREE.Group();
  const add = (m, p, rot) => {
    if (p) m.position.set(p[0], p[1], p[2]);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    model.add(m);
    return m;
  };

  const fineN = noiseTex(256, 0, true), leatherN = noiseTex(256, 1400);
  fineN.repeat.set(0.6, 0.6);
  leatherN.repeat.set(0.9, 0.9);

  /* ---- materials ---- */
  const M = {
    body: new THREE.MeshPhysicalMaterial({ color: 0x0e0e10, roughness: 0.46, metalness: 0.1, clearcoat: 0.25, clearcoatRoughness: 0.45, bumpMap: fineN, bumpScale: 0.006 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.86, metalness: 0, bumpMap: leatherN, bumpScale: 0.03 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x09090a, roughness: 0.92, metalness: 0 }),
    btn: new THREE.MeshPhysicalMaterial({ color: 0x141417, roughness: 0.34, metalness: 0.25, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xc4c4cc, roughness: 0.26, metalness: 1 }),
    dmetal: new THREE.MeshStandardMaterial({ color: 0x34343a, roughness: 0.32, metalness: 0.9 }),
    satin: new THREE.MeshStandardMaterial({ color: 0x0f0f11, roughness: 0.42, metalness: 0.3 }),
    red: new THREE.MeshPhysicalMaterial({ color: 0xc4242c, roughness: 0.3, clearcoat: 0.6 }),
    accent: new THREE.MeshStandardMaterial({ color: 0x8a55e6, roughness: 0.35, metalness: 0.6, emissive: 0x3a1d78, emissiveIntensity: 0.6 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x07080c, roughness: 0.04, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.8 }),
    coat: new THREE.MeshPhysicalMaterial({ color: 0x1a0f2e, roughness: 0.12, metalness: 0.6, emissive: 0x0d0820, clearcoat: 1 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x050507, roughness: 0.5, metalness: 0 }),
  };

  /* ---- body ---- */
  add(slab(13.4, 8.0, 3.8, 1.05, 0.55, M.body, 7), [0, 4.0, 0]);
  // stepped top deck: two shoulders either side of the EVF break up the box silhouette
  add(slab(3.2, 0.9, 3.5, 0.35, 0.28, M.body, 6), [-5.0, 8.05, 0.05]); // mode-dial shoulder
  add(slab(4.3, 0.9, 3.5, 0.35, 0.28, M.body, 6), [3.95, 8.05, 0.05]); // top-LCD / shutter shoulder
  add(slab(3.8, 0.5, 3.3, 0.25, 0.2, M.body, 5), [-1.2, 8.1, 0.05]); // bridge under the EVF
  // front panel band around the mount, slightly proud of the shell, and a thin bright trim under the EVF
  add(slab(6.9, 7.0, 0.1, 0.9, 0.04, M.satin), [-1.2, 4.2, -1.93]);
  add(new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.05, 0.05), M.dmetal), [-1.2, 8.32, -1.95]);
  add(slab(3.0, 6.6, 0.16, 0.5, 0.06, M.leather), [-5.25, 3.9, -1.98]);
  {
    // sculpted leather grip
    const s = new THREE.Shape();
    s.moveTo(2.9, -0.6); s.lineTo(3.1, -3.4); s.bezierCurveTo(3.2, -4.9, 4.5, -5.25, 5.5, -5.05); s.bezierCurveTo(6.1, -4.9, 6.3, -4.3, 6.3, -3.6); s.lineTo(6.3, -0.6); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 7.35, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.45, bevelSegments: 6, curveSegments: 24 });
    g.rotateX(PI / 2);
    g.translate(0, 7.95, 0);
    add(new THREE.Mesh(g, M.leather));
  }
  {
    // EVF hump
    const s = new THREE.Shape();
    s.moveTo(-2.85, 0); s.lineTo(2.85, 0); s.lineTo(2.05, 2.15); s.quadraticCurveTo(1.85, 2.6, 1.35, 2.6); s.lineTo(-1.35, 2.6); s.quadraticCurveTo(-1.85, 2.6, -2.05, 2.15); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 3.7, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.28, bevelSegments: 5, curveSegments: 12 });
    g.translate(-1.2, 7.85, -2.0);
    add(new THREE.Mesh(g, M.body));
  }
  {
    // AYZ. wordmark printed on the front of the EVF hump, where the maker's logo sits on a real body
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const x = c.getContext("2d");
    x.font = '700 200px "Bricolage Grotesque",system-ui,sans-serif';
    x.textBaseline = "alphabetic";
    const wAYZ = x.measureText("AYZ").width, wDot = x.measureText(".").width;
    const left = (1024 - wAYZ - wDot) / 2;
    x.fillStyle = "#E6E3EC";
    x.fillText("AYZ", left, 196);
    x.fillStyle = "#A57CF2"; // a touch brighter than the UI purple so the dot survives the dark finish
    x.fillText(".", left + wAYZ, 196);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    const logo = new THREE.Mesh(
      new THREE.PlaneGeometry(2.9, 0.725),
      new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.45, metalness: 0.1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
    );
    logo.position.set(-1.2, 9.3, -2.315); // just proud of the hump's front face (z = -2.3)
    logo.rotation.y = PI; // face forward (-z), reading left to right from the front
    model.add(logo);
  }
  add(new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.22, 2.1), M.dmetal), [-1.2, 10.82, -0.2]);
  add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 1.6), M.dark), [-1.2, 10.95, -0.2]);
  {
    // eyecup + EVF glass
    const s = rr(3.9, 3.0, 0.9);
    s.holes.push(rr(2.5, 1.7, 0.35));
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.75, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.16, bevelSegments: 4, curveSegments: 12 });
    g.translate(-1.2, 9.15, 1.95);
    add(new THREE.Mesh(g, M.rubber));
    add(new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.7), M.glass), [-1.2, 9.15, 2.1]);
  }
  // strap lugs
  add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.1, 12, 28), M.metal), [-6.9, 7.3, -0.2], [0, PI / 2, 0]);
  add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.1, 12, 28), M.metal), [6.9, 7.3, -0.2], [0, PI / 2, 0]);
  // lens-release button + front AF lamp
  add(lathe([[0, 0], [0.32, 0], [0.32, 0.12], [0.28, 0.18], [0, 0.19]], M.btn, 32), [2.2, 2.3, -1.9], [-PI / 2, 0, 0]);
  add(cyl(0.2, 0.2, 0.08, M.glass, 24), [2.55, 7.3, -1.92], [PI / 2, 0, 0]);

  /* ---- body details ---- */
  // front/rear shell seam: a slightly larger dark band reads as the parting line between the two shells
  add(slab(13.48, 8.48, 0.07, 1.07, 0.02, M.dark), [0, 4.2, 0.85]);
  {
    // lens mount: chrome bayonet throat + white index dot
    const throat = new THREE.Mesh(new THREE.RingGeometry(2.98, 3.42, 96), M.metal);
    throat.position.set(-1.2, 4.35, -1.925);
    throat.rotation.y = PI;
    model.add(throat);
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    dot.position.set(-1.2 + 3.2 * Math.cos(1.0), 4.35 + 3.2 * Math.sin(1.0), -1.93);
    dot.rotation.y = PI;
    model.add(dot);
  }
  // two front function buttons beside the mount (grip side)
  add(lathe([[0, 0], [0.26, 0], [0.26, 0.1], [0.22, 0.15], [0, 0.16]], M.btn, 32), [2.45, 1.35, -1.9], [-PI / 2, 0, 0]);
  add(lathe([[0, 0], [0.26, 0], [0.26, 0.1], [0.22, 0.15], [0, 0.16]], M.btn, 32), [2.45, 0.62, -1.9], [-PI / 2, 0, 0]);
  // stereo mic holes on top of the EVF hump, front edge
  [-2.35, -0.05].forEach((mxp) => {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) add(cyl(0.045, 0.045, 0.03, M.dark, 10), [mxp + (i - 1) * 0.14, 10.47, -1.55 + j * 0.14]);
  });
  // hot shoe rails + contacts
  add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 2.0), M.metal), [-2.27, 10.98, -0.2]);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 2.0), M.metal), [-0.13, 10.98, -0.2]);
  for (let hc = 0; hc < 5; hc++) add(cyl(0.06, 0.06, 0.03, M.metal, 12), [-1.2 + (hc - 2) * 0.22, 11.0, -0.35]);
  // diopter knob on the grip side of the eyecup + eye sensor above the eyepiece
  add(knurl(0.26, 0.22, 14, 0.15, M.satin), [1.0, 9.6, 1.55], [0, 0, PI / 2]);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.03), new THREE.MeshPhysicalMaterial({ color: 0x040405, roughness: 0.05, clearcoat: 1 })), [-1.2, 10.55, 2.72]);
  // rear thumb rest + speaker grille under the playback buttons
  add(slab(1.3, 1.6, 0.16, 0.45, 0.06, M.leather), [5.65, 6.15, 1.95]);
  for (let sg = 0; sg < 5; sg++) add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.03), M.dark), [-5.0, 6.6 - sg * 0.12, 1.92]);
  // rubber port cover on the grip side, with a hinge line
  add(slab(1.5, 3.4, 0.14, 0.35, 0.05, M.rubber), [6.76, 4.4, 1.0], [0, PI / 2, 0]);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 3.0, 0.04), M.dark), [6.84, 4.4, 1.55]);
  // tripod socket + battery door outline on the base
  add(cyl(0.34, 0.34, 0.04, M.metal, 32), [-1.2, 0.0, 0.1]);
  add(slab(3.2, 2.6, 0.06, 0.3, 0.02, M.satin), [3.8, 0.0, 0.2], [PI / 2, 0, 0]);

  /* ---- memory-card door (left side, -x face; faces the viewer in the front three-quarter) ----
     The leaf swings outward on a vertical hinge at its rear edge (doorPivot.rotation.y > 0 opens it),
     uncovering a recessed compartment with the card slot. */
  const doorMat = M.satin.clone();
  doorMat.color.setHex(0x101013);
  doorMat.roughness = 0.5;
  const doorG = new THREE.Group();
  const doorPivot = new THREE.Group();
  doorPivot.position.set(0, 0, 1.03); // the hinge line
  const leaf = new THREE.Group();
  leaf.position.set(0, 0, -1.03);
  const door = slab(2.1, 4.3, 0.14, 0.3, 0.05, doorMat);
  door.rotation.y = PI / 2;
  leaf.add(door);
  const latch = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.9), M.dmetal);
  latch.position.set(-0.08, -1.7, 0);
  leaf.add(latch);
  for (let rb = 0; rb < 6; rb++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.2), M.dmetal);
    rib.position.set(-0.09, 0.9 + rb * 0.16, 0);
    leaf.add(rib);
  }
  doorPivot.add(leaf);
  doorG.add(doorPivot);
  const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 4.0, 0.06), M.dark);
  hinge.position.set(-0.07, 0, 1.03);
  doorG.add(hinge);
  doorG.position.set(-6.74, 4.3, 0.2);
  model.add(doorG);
  // compartment behind the door: a satin-metal recess (lighter than the body so the opening reads),
  // the black card slot and its guide rails
  add(new THREE.Mesh(new THREE.BoxGeometry(0.03, 4.0, 1.85), new THREE.MeshStandardMaterial({ color: 0x3a3a44, roughness: 0.4, metalness: 0.6 })), [-6.69, 4.3, 0.2]);
  const slotMat = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }); // lights up while a card goes in
  add(new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.7, 0.22), slotMat), [-6.71, 4.45, 0.2]);
  [-0.2, 0.6].forEach((dz) => add(new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.0, 0.05), M.metal), [-6.7, 4.3, 0.2 + dz]));

  /* ---- rear LCD module ---- */
  add(slab(8.9, 6.25, 0.42, 0.55, 0.13, M.satin), [-1.65, 3.55, 2.12]);
  const lcdMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  add(new THREE.Mesh(new THREE.PlaneGeometry(8.1, 5.46), lcdMat), [-1.65, 3.55, 2.335]);
  add(
    new THREE.Mesh(
      new THREE.PlaneGeometry(8.4, 5.75),
      new THREE.MeshPhysicalMaterial({ color: 0, roughness: 0.03, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.22, envMapIntensity: 2.5, depthWrite: false })
    ),
    [-1.65, 3.55, 2.345]
  );

  /* ---- top plate ---- */
  {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 360;
    const x = c.getContext("2d");
    x.fillStyle = "#0b0c0e";
    x.fillRect(0, 0, 512, 360);
    x.fillStyle = "#8b8f86";
    x.font = '600 120px "JetBrains Mono",monospace';
    x.fillText("AYZ", 70, 170);
    x.font = '500 60px "JetBrains Mono",monospace';
    x.fillText("[ r 24 ]", 80, 290);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    add(slab(2.6, 1.85, 0.12, 0.18, 0.04, M.satin), [3.15, 8.53, 0.35], [PI / 2, 0, 0]);
    add(new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.6), new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.08, clearcoat: 1 })), [3.15, 8.6, 0.35], [-PI / 2, 0, 0]);
  }
  // mode dial
  const modeDial = new THREE.Group();
  {
    const g = modeDial;
    g.add(knurl(1.0, 0.82, 56, 0.05, M.satin.clone()));
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const x = c.getContext("2d");
    x.fillStyle = "#17171a";
    x.beginPath(); x.arc(256, 256, 256, 0, 7); x.fill();
    x.fillStyle = "#e8e6ee";
    x.textAlign = "center";
    x.textBaseline = "middle";
    // H · A · P · E · L  (Home, About, Projects, Experience, Leadership), 45° apart; the remaining arc carries tick marks
    ["H", "A", "P", "E", "L"].forEach((s, i) => {
      const a = PI / 2 - (i * PI) / 4;
      x.save();
      x.translate(256 + Math.cos(a) * 186, 256 + Math.sin(a) * 186);
      x.rotate(a - PI / 2);
      x.font = '700 72px "Hanken Grotesk",sans-serif';
      x.fillStyle = i === 0 ? "#BBA3F8" : "#e8e6ee";
      x.fillText(s, 0, 0);
      x.restore();
    });
    for (let tk = 5; tk < 8; tk++) {
      const ta = PI / 2 - (tk * PI) / 4;
      x.save();
      x.translate(256 + Math.cos(ta) * 196, 256 + Math.sin(ta) * 196);
      x.rotate(ta - PI / 2);
      x.fillStyle = "#55555f";
      x.fillRect(-4, -18, 8, 36);
      x.restore();
    }
    x.fillStyle = "#232328";
    x.beginPath(); x.arc(256, 256, 110, 0, 7); x.fill();
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    const top = new THREE.Mesh(new THREE.CircleGeometry(0.98, 64), new THREE.MeshStandardMaterial({ map: t, roughness: 0.45, metalness: 0.2 }));
    top.rotation.x = -PI / 2;
    top.position.y = 0.411;
    g.add(top);
    const lock = cyl(0.3, 0.3, 0.18, M.btn, 32);
    lock.position.y = 0.5;
    g.add(lock);
    g.position.set(-5.35, 8.5 + 0.41, 0.2);
    model.add(g);
  }
  // dial index mark on the top plate (rear side of the dial) + its lock collar
  add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.34), new THREE.MeshBasicMaterial({ color: 0xe8e6ee })), [-5.35, 8.51, 1.46]);
  add(cyl(1.12, 1.12, 0.12, M.dmetal, 64), [-5.35, 8.55, 0.2]);
  // rear command dial: horizontal thumbwheel recessed under the top-plate shoulder, its knurled edge showing at the back
  add(knurl(0.74, 0.36, 44, 0.08, M.satin), [5.3, 8.08, 1.42]); // wheel: only its rear edge clears the shell
  add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.46, 0.04), M.dark), [5.3, 8.08, 1.8]); // recess shadow behind the exposed edge
  add(knurl(0.75, 0.42, 36, 0.06, M.satin), [4.4, 6.9, -2.05], [PI / 2, 0, 0]); // front sub-dial
  // shutter (collar + button) on the grip
  const shutter = new THREE.Group();
  {
    shutter.add(knurl(0.78, 0.26, 36, 0.05, M.dmetal));
    const nub = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.35), M.dmetal);
    nub.position.set(0.85, 0, 0);
    shutter.add(nub);
    const b = lathe([[0, 0], [0.5, 0], [0.5, 0.12], [0.47, 0.22], [0.36, 0.29], [0, 0.31]], M.btn.clone(), 48);
    b.position.y = 0.13;
    shutter.add(b);
    shutter.position.set(4.95, 8.45 + 0.13, -3.55);
    model.add(shutter);
  }
  const recordMat = M.red.clone();
  const record = add(lathe([[0, 0], [0.22, 0], [0.22, 0.1], [0.18, 0.15], [0, 0.16]], recordMat, 32), [3.35, 8.5, -1.15]);

  /* ---- buttons with hotspots ---- */
  const HS = {};
  function button(o) {
    const g = new THREE.Group(), m = (o.mat || M.btn).clone();
    const r = o.r, h = o.h || 0.2;
    g.add(lathe([[0, 0], [r, 0], [r, h * 0.55], [r * 0.94, h * 0.88], [r * 0.78, h], [0, h]], m, 48));
    if (o.label) {
      const d = new THREE.Mesh(
        new THREE.CircleGeometry(r * 0.74, 40),
        new THREE.MeshStandardMaterial({ map: labelTex(o.label, o.col), transparent: true, roughness: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
      );
      d.rotation.x = -PI / 2;
      d.position.y = h + 0.004;
      g.add(d);
    }
    if (o.axis !== "y") g.rotation.x = PI / 2;
    g.position.set(o.p[0], o.p[1], o.p[2]);
    model.add(g);
    if (o.k) HS[o.k] = { g, m, base: g.position.clone(), ax: o.axis === "y" ? V(0, 1, 0) : V(0, 0, 1), top: h, anchor: h * 0.45 };
    return g;
  }
  const RZ = 1.9;
  button({ k: "play", label: "play", r: 0.36, p: [-5.55, 7.42, RZ] });
  button({ label: "del", r: 0.36, p: [-4.45, 7.42, RZ] });
  button({ label: "DISP", r: 0.42, p: [1.75, 7.38, RZ] });
  button({ label: "AF-ON", r: 0.46, p: [4.85, 7.05, RZ] });
  add(lathe([[0, 0], [0.42, 0], [0.42, 0.08], [0, 0.08]], M.dmetal, 32), [4.85, 5.8, RZ], [PI / 2, 0, 0]);
  add(knurl(0.27, 0.34, 16, 0.12, M.btn), [4.85, 5.8, RZ + 0.17], [PI / 2, 0, 0]); // joystick
  button({ k: "info", label: "i", r: 0.4, p: [4.7, 4.6, RZ] });
  add(lathe([[0.5, 0], [1.02, 0], [1.02, 0.12], [0.98, 0.19], [0.86, 0.22], [0.52, 0.2], [0.5, 0.14]], M.btn, 72), [4.7, 2.95, RZ], [PI / 2, 0, 0]); // d-pad ring
  button({ k: "ok", label: "OK", r: 0.42, h: 0.24, p: [4.7, 2.95, RZ] });
  button({ label: "zin", r: 0.37, p: [3.7, 1.6, RZ] });
  button({ label: "zout", r: 0.37, p: [3.7, 0.68, RZ] });
  button({ k: "menu", label: "MENU", r: 0.42, p: [5.35, 1.25, RZ] });
  button({ label: "ISO", r: 0.26, h: 0.16, axis: "y", p: [4.05, 8.5, -1.75] });
  button({ label: "+/-", r: 0.26, h: 0.16, axis: "y", p: [4.0, 8.5, -0.9] });
  button({ label: "Fn", r: 0.3, p: [-4.0, 8.0, RZ + 0.0] });
  button({ k: "monitor", label: "mon", r: 0.3, h: 0.18, axis: "y", p: [2.25, 8.5, -1.3] });
  HS.mode = { g: modeDial, m: modeDial.children[0].material, base: modeDial.position.clone(), ax: V(0, 1, 0), top: 0.5, anchor: 0, faceN: V(0, 1, 0) };
  HS.shutter = { g: shutter, m: shutter.children[2].material, base: shutter.position.clone(), ax: V(0, 1, 0), top: 0.45, anchor: 0.3 };
  HS.record = { g: record, m: recordMat, base: record.position.clone(), ax: V(0, 1, 0), top: 0.16, anchor: 0.1 };
  HS.monitor.frontOnly = true; // hidden behind the EVF hump from the rear
  HS.door = { g: doorG, m: doorMat, base: doorG.position.clone(), ax: V(-1, 0, 0), top: 0.08 };

  /* ---- lens (built along +y, then rotated to point -z) ---- */
  {
    const L = new THREE.Group();
    const at = (m, y) => {
      m.position.y = y;
      L.add(m);
      return m;
    };
    at(cyl(2.98, 2.98, 0.3, M.metal), 0.15);
    at(cyl(3.28, 3.3, 0.8, M.satin), 0.7);
    const cr = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.55, metalness: 0.2, bumpMap: stripeTex(180), bumpScale: 0.02 });
    at(cyl(3.48, 3.48, 1.6, cr), 1.9);
    at(cyl(3.72, 3.52, 0.3, M.satin), 2.85);
    const bc = document.createElement("canvas");
    bc.width = 2048;
    bc.height = 96;
    {
      const x = bc.getContext("2d");
      x.fillStyle = "#16161a";
      x.fillRect(0, 0, 2048, 96);
      x.fillStyle = "#ecebef";
      x.font = '600 44px "Hanken Grotesk",sans-serif';
      x.textAlign = "center";
      [["24", -0.085], ["28", -0.045], ["35", 0], ["50", 0.045], ["70", 0.085]].forEach((a) => {
        const px = ((a[1] + 1) % 1) * 2048;
        x.fillText(a[0], px, 62);
        if (a[1] < 0) x.fillText(a[0], px - 2048, 62);
      });
    }
    const bt = new THREE.CanvasTexture(bc);
    bt.encoding = THREE.sRGBEncoding;
    bt.anisotropy = 8;
    at(cyl(3.78, 3.78, 0.55, new THREE.MeshStandardMaterial({ map: bt, roughness: 0.5, metalness: 0.2 })), 3.275); // 24–70 band
    at(knurl(3.86, 2.45, 90, 0.035, M.rubber), 4.775); // ribbed zoom ring
    at(cyl(3.74, 3.74, 1.2, M.satin), 6.6);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.755, 0.05, 10, 128), M.accent); // purple accent ring
    ring.rotation.x = PI / 2;
    at(ring, 6.12);
    at(cyl(3.5, 3.7, 1.3, M.satin, 96, true), 7.85);
    // focus ring (fine ribs) just behind the front barrel
    at(knurl(3.66, 0.5, 120, 0.02, M.rubber), 7.0);
    // front name ring: focal range, aperture and filter size printed around the glass
    const rc = document.createElement("canvas");
    rc.width = rc.height = 1024;
    {
      const x = rc.getContext("2d");
      x.fillStyle = "#121215";
      x.fillRect(0, 0, 1024, 1024);
      x.translate(512, 512);
      const txt = "24–70mm  1:4  S   ·   Ø72   ·   AYZ  OPTICS   ·   ", R = (3.18 / 3.5) * 512, n = txt.length;
      x.fillStyle = "#d9d7df";
      x.font = '600 30px "Hanken Grotesk",sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      const step = (PI * 2 * 0.62) / n;
      for (let i = 0; i < n; i++) {
        const a = -PI * 0.92 + i * step;
        x.save();
        x.rotate(a);
        x.translate(0, -R);
        x.fillText(txt[i], 0, 0);
        x.restore();
      }
      x.strokeStyle = "#2c2c33";
      x.lineWidth = 4;
      x.beginPath();
      x.arc(0, 0, (2.92 / 3.5) * 512, 0, 7);
      x.stroke();
    }
    const rt = new THREE.CanvasTexture(rc);
    rt.encoding = THREE.sRGBEncoding;
    rt.anisotropy = 8;
    const face = new THREE.Mesh(new THREE.RingGeometry(2.85, 3.5, 128), new THREE.MeshStandardMaterial({ map: rt, roughness: 0.55, metalness: 0.15 }));
    face.rotation.x = -PI / 2;
    at(face, 8.505);
    // filter thread lip + inner retaining rings
    const lip = new THREE.Mesh(new THREE.TorusGeometry(3.47, 0.035, 8, 128), M.dmetal);
    lip.rotation.x = PI / 2;
    at(lip, 8.51);
    const lip2 = new THREE.Mesh(new THREE.TorusGeometry(2.86, 0.03, 8, 128), M.metal);
    lip2.rotation.x = PI / 2;
    at(lip2, 8.5);
    at(cyl(2.88, 2.88, 2.2, M.dark, 64, true), 7.4);
    [[2.7, 7.9], [2.45, 7.2], [2.1, 6.6]].forEach((a) => {
      const r2 = new THREE.Mesh(new THREE.TorusGeometry(a[0], 0.06, 8, 96), M.dmetal);
      r2.rotation.x = PI / 2;
      at(r2, a[1]);
    });
    {
      // aperture: six blades leaving a hexagonal opening (the same iris as the loader)
      const sh = new THREE.Shape();
      sh.absarc(0, 0, 2.3, 0, PI * 2, false);
      const hole = new THREE.Path();
      for (let i = 0; i < 6; i++) {
        const a = (i * PI) / 3 + 0.25, px = Math.cos(a) * 1.05, py = Math.sin(a) * 1.05;
        if (i) hole.lineTo(px, py);
        else hole.moveTo(px, py);
      }
      hole.closePath();
      sh.holes.push(hole);
      const ig = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false, curveSegments: 48 });
      ig.rotateX(-PI / 2);
      at(new THREE.Mesh(ig, new THREE.MeshStandardMaterial({ color: 0x2a2236, roughness: 0.28, metalness: 0.85 })), 6.3);
      for (let b = 0; b < 6; b++) {
        const a0 = (b * PI) / 3 + 0.25;
        const bl = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.02, 0.03), new THREE.MeshBasicMaterial({ color: 0x0a080e }));
        bl.position.set(Math.cos(a0) * 1.05 + Math.cos(a0 + PI / 2) * 0.72, 0.045, -(Math.sin(a0) * 1.05 + Math.sin(a0 + PI / 2) * 0.72));
        bl.rotation.y = -(a0 + PI / 2);
        const holder = new THREE.Group();
        holder.add(bl);
        at(holder, 6.3);
      }
    }
    // see-through coated front glass
    const glassF = M.glass.clone();
    glassF.transparent = true;
    glassF.opacity = 0.26;
    glassF.depthWrite = false;
    glassF.color.setHex(0x0a0b12);
    const th = Math.asin(2.86 / 9);
    at(new THREE.Mesh(new THREE.SphereGeometry(9, 64, 12, 0, PI * 2, 0, th), glassF), 7.98 - 9 * Math.cos(th));
    const coatT = M.coat.clone();
    coatT.transparent = true;
    coatT.opacity = 0.3;
    coatT.depthWrite = false;
    const th2 = Math.asin(2 / 5);
    at(new THREE.Mesh(new THREE.SphereGeometry(5, 48, 10, 0, PI * 2, 0, th2), coatT), 7.2 - 5 * Math.cos(th2));
    // AF / MF switch on the barrel
    const sw = slab(0.5, 0.9, 0.18, 0.12, 0.04, M.satin);
    sw.position.set(3.32 * Math.cos(-0.35), 1.15, 3.32 * Math.sin(-0.35));
    sw.rotation.y = 0.35 + PI / 2;
    L.add(sw);
    L.rotation.x = -PI / 2;
    L.position.set(-1.2, 4.35, -1.92);
    model.add(L);
  }

  /* ---- centre + anchors ---- */
  const box = new THREE.Box3().setFromObject(model);
  const cen = box.getCenter(V());
  model.position.copy(cen).multiplyScalar(-1);
  const radius = box.getSize(V()).length() / 2;
  // Each control gets an anchor on its surface (≈45% up a button; the mode dial at its centre) with the
  // outward normal used for the facing test.
  Object.keys(HS).forEach((k) => {
    const h = HS[k], a = new THREE.Object3D();
    a.position.copy(h.base).addScaledVector(h.ax, h.anchor !== undefined ? h.anchor : h.top + 0.02);
    a.userData.n = (h.faceN || h.ax).clone();
    model.add(a);
    h.a = a;
  });

  return { model, HS, modeDial, doorPivot, slotMat, lcdMat, radius };
}
