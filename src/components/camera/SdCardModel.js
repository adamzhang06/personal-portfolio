import * as THREE from "three";

// The SD card that goes into the camera's card slot: the Collections card (src/components/SdCard.jsx, compact)
// as a 24 × 32 × 2.1 mm slab in the model's cm. Its origin is the middle of the contact edge, which leads into
// the slot; the label faces +z. paint(card) redraws the label for that card.

// The engine is built once per page and cached, so a hot update can't swap this module in: reload instead.
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());

export const SD = { w: 2.4, h: 3.2, t: 0.21 };

// The card's outline: corner cut top right (18% across, 13.5% down, as the DOM card's clip-path), the
// other corners rounded.
function outline(w, h, r) {
  const s = new THREE.Shape(), x0 = -w / 2, x1 = w / 2, y0 = -h, y1 = 0;
  s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r);
  s.lineTo(x1, y1 - 0.135 * h); s.lineTo(x0 + 0.82 * w, y1);
  s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r);
  s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
  return s;
}

function chamfered(x, l, t, w, h, r) {
  x.beginPath();
  x.moveTo(l + r, t); x.lineTo(l + 0.82 * w, t); x.lineTo(l + w, t + 0.135 * h);
  x.lineTo(l + w, t + h - r); x.quadraticCurveTo(l + w, t + h, l + w - r, t + h);
  x.lineTo(l + r, t + h); x.quadraticCurveTo(l, t + h, l, t + h - r);
  x.lineTo(l, t + r); x.quadraticCurveTo(l, t, l + r, t);
  x.closePath();
}

// The label, laid out like the compact DOM card (sizes in cqw: 1/100 of the card's width).
function drawLabel(x, card, W, H) {
  const u = W / 100, e = 2.4 * u;
  x.clearRect(0, 0, W, H);
  x.fillStyle = "#A99BD6"; // the thin lavender edge; the geometry gives the silhouette
  x.fillRect(0, 0, W, H);
  const iw = W - 2 * e, ih = H - 2 * e;
  // 160deg gradient across the inner panel
  const dx = Math.sin((160 * Math.PI) / 180), dy = -Math.cos((160 * Math.PI) / 180), len = Math.abs(iw * dx) + Math.abs(ih * dy);
  const g = x.createLinearGradient(W / 2 - (dx * len) / 2, H / 2 - (dy * len) / 2, W / 2 + (dx * len) / 2, H / 2 + (dy * len) / 2);
  g.addColorStop(0, card.c1);
  g.addColorStop(1, card.c2);
  x.fillStyle = g;
  chamfered(x, e, e, iw, ih, 7 * u);
  x.fill();

  // contacts: 9 long across the top, the last one short and dropped; 8 short below, one column in
  const pl = e + 6 * u, pw = iw - 12 * u, gap = 1.4 * u, col = (pw - 17 * gap) / 18, pt = e + 6 * u;
  const pin = (c, y, h) => {
    const px = pl + c * (col + gap), w = 2 * col + gap;
    const pg = x.createLinearGradient(0, y, 0, y + h);
    pg.addColorStop(0, "#F0D995");
    pg.addColorStop(0.38, "#D4B675");
    pg.addColorStop(1, "#B08F4F");
    x.fillStyle = pg;
    x.beginPath();
    x.roundRect(px, y, w, h, 0.9 * u);
    x.fill();
  };
  for (let i = 0; i < 9; i++) (i < 8 ? pin(2 * i, pt, 17 * u) : pin(16, pt + 7 * u, 10 * u));
  for (let i = 0; i < 8; i++) pin(1 + 2 * i, pt + 19.2 * u, 9 * u);

  // name in the middle of the space left between the contacts and "AYZ"
  const pinsEnd = pt + 28.2 * u, smallTop = H - e - 8 * u - 6.7 * u;
  x.textBaseline = "middle";
  x.fillStyle = "#F2EFF7";
  x.font = `500 ${11 * u}px "JetBrains Mono",monospace`;
  x.fillText(card.name.toUpperCase(), e + 7 * u, (pinsEnd + smallTop) / 2);
  x.fillStyle = "rgba(242,239,247,.72)";
  x.font = `400 ${5.6 * u}px "JetBrains Mono",monospace`;
  x.fillText("AYZ", e + 7 * u, smallTop + 3.35 * u);
}

export function buildSdCard() {
  const c = document.createElement("canvas");
  c.width = 384;
  c.height = 512;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const shape = outline(SD.w, SD.h, 0.2);
  const face = new THREE.ShapeGeometry(shape, 8);
  // the label spans the outline: u across the card, v up from the bottom edge
  const p = face.attributes.position, uv = face.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / SD.w + 0.5, p.getY(i) / SD.h + 1);
  const shell = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.1 });
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: SD.t, bevelEnabled: false, curveSegments: 8 }), shell);
  body.position.z = -SD.t / 2;
  const label = new THREE.Mesh(face, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  label.position.z = SD.t / 2 + 0.004;
  const group = new THREE.Group();
  group.add(body, label);
  group.visible = false;
  return {
    group,
    paint(card) {
      drawLabel(c.getContext("2d"), card, c.width, c.height);
      tex.needsUpdate = true;
      shell.color.set(card.c2);
    },
  };
}
