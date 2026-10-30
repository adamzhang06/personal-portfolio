import * as THREE from "three";

// Rear LCD: "AYZ.", the availability dot, the page name, a muted line and a page counter.
// Textures are cached per text and rebuilt once web fonts finish loading.
// The engine is built once per page and cached, so a hot update can't swap this module in: reload instead.
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());

let cache = {};

function clear() {
  Object.values(cache).forEach((t) => t.dispose());
  cache = {};
}

if (typeof document !== "undefined" && document.fonts) {
  document.fonts.ready.then(clear);
  document.fonts.addEventListener?.("loadingdone", clear);
}

export function screenTexture(page, sub, count) {
  const k = page + "|" + sub + "|" + count;
  if (cache[k]) return cache[k];
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 690;
  const x = c.getContext("2d");
  const W = 1024;
  const H = 690;
  x.fillStyle = "#0b0b10";
  x.fillRect(0, 0, W, H);
  x.fillStyle = "#BBA3F8";
  x.font = '500 32px "JetBrains Mono",monospace';
  x.fillText("AYZ.", 56, 78);
  x.font = '500 28px "JetBrains Mono",monospace';
  const aw = x.measureText("Available for work").width;
  x.fillStyle = "#52D68A";
  x.beginPath();
  x.arc(W - 56 - aw - 22, 68, 9, 0, 7);
  x.fill();
  x.fillText("Available for work", W - 56 - aw, 78);
  x.fillStyle = "#2A2A33";
  x.fillRect(56, 112, W - 112, 2);
  x.fillStyle = "#F2EFF7";
  let fs = 120;
  x.font = "700 " + fs + 'px "Bricolage Grotesque",system-ui,sans-serif';
  while (x.measureText(page).width > W - 112 && fs > 50) {
    fs -= 6;
    x.font = "700 " + fs + 'px "Bricolage Grotesque",system-ui,sans-serif';
  }
  x.fillText(page, 56, 330);
  x.fillStyle = "#A8A3B3";
  x.font = '400 40px "Hanken Grotesk",system-ui,sans-serif';
  x.fillText(sub, 56, 404);
  if (count) {
    x.fillStyle = "#6f6a7a";
    x.font = '500 30px "JetBrains Mono",monospace';
    x.fillText(count, 56, H - 60);
  }
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 8;
  cache[k] = t;
  return t;
}
