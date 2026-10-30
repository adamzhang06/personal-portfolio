import * as THREE from "three";
import { buildCameraModel } from "./CameraModel";
import { screenTexture } from "./ScreenTexture";
import { bezier, EASE } from "@/lib/motion";

/* One scene, one WebGL renderer, drawn into each mounted 2D canvas. Ported from docs/reference/camera.js.

   A mount is an element whose data attributes describe what to draw (React sets them, the loop reads them):
     data-cam="front|rear"   target pose; changes animate (flip 1.0 s expo)
     data-page, data-sub, data-count   rear-LCD text
     data-tilt="off"         disable cursor tilt + bob
     data-fit="0.9"          framing (lower = larger camera)
     data-hotspots="off"     hide every hotspot (collapsed dock)
     data-sweep="<id>"       the buttons glow purple in sequence for each new id ("0" = none; an id seen before is not replayed)
     data-sweep-delay="500"  ms before that sweep starts
     data-dial="0..4"        mode-dial notch (H · A · P · E · L)
     data-door="open|closed" memory-card door; changes swing it on its hinge
     data-slot="lit"         the card slot behind the door pulses purple (a card is going in)
   Children it drives each frame:
     canvas[data-cam-canvas] the 2D canvas the frame is copied into
     [data-hs=key]           44 px hit targets moved over the projected control; hidden when facing away
     [data-lead=key]         leader labels (placed by layout); faded when their control faces away
     line[data-line=key], circle[data-ring=key]   leader lines inside an <svg> covering the mount

   The renderer is created while something moves and released ~2.5 s after it goes idle, leaving the last
   frame as a still, so many tabs never exceed the browser's WebGL context limit. */

// The engine is built once per page and cached, so a hot update can't swap this module in: reload instead.
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());

const PI = Math.PI;
const DIR = new THREE.Vector3(-0.62, 0.46, -1).normalize(); // front three-quarter: lens toward the viewer's lower left
const REAR = (-122 * PI) / 180; // flip angle: rear three-quarter, LCD toward the viewer
const IDLE_MS = 2500;
const INTRO_KEYS = ["shutter", "mode", "record", "monitor", "door", "play", "info", "ok", "menu"];
const expo = bezier(0.16, 1, 0.3, 1);
const springy = bezier(...EASE.press); // the door opening overshoots a touch, like a sprung hinge
const DOOR_OPEN = 1.8; // radians
const DOOR_MS = 520;

export function createEngine({ onFirstFrame, onNoWebGL } = {}) {
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const scene = new THREE.Scene();
  const cam3 = new THREE.PerspectiveCamera(28, 1.2, 1, 500);
  const rig = new THREE.Group(), flip = new THREE.Group();
  const { model, HS, modeDial, doorPivot, slotMat, lcdMat, radius: RAD } = buildCameraModel();
  const SLOT_LIT = new THREE.Color(0x9a6cf0);
  rig.add(flip);
  flip.add(model);
  scene.add(rig);

  const key = new THREE.DirectionalLight(0xffffff, 0.6);
  key.position.set(-10, 22, 16);
  scene.add(key);
  const key2 = new THREE.DirectionalLight(0xffffff, 0.35);
  key2.position.set(14, 18, -18);
  scene.add(key2);
  const rimL = new THREE.DirectionalLight(0xd9ceff, 0.9);
  rimL.position.set(-20, 8, -14);
  scene.add(rimL);

  /* ---- renderer lifecycle ---- */
  let gl = null, glCanvas = null, envTex = null, glFailed = 0, firstFrameSent = false;

  function buildEnv() {
    // softbox environment: overhead key, right strip, left fill, floor bounce, back light, front strip
    const pm = new THREE.PMREMGenerator(gl), es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.BoxGeometry(80, 80, 80), new THREE.MeshBasicMaterial({ color: 0x020203, side: THREE.BackSide })));
    const panel = (w, h, p, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffffff").multiplyScalar(i), side: THREE.DoubleSide }));
      m.position.set(p[0], p[1], p[2]);
      m.lookAt(0, 0, 0);
      es.add(m);
    };
    panel(34, 14, [-6, 30, 14], 2.4); // overhead key
    panel(8, 34, [30, 6, 18], 1.6); // right strip
    panel(8, 30, [-30, 4, 10], 0.9); // left fill
    panel(26, 8, [0, -26, 14], 0.12); // very dim floor bounce
    panel(16, 16, [0, 10, -34], 0.8); // back light
    panel(10, 30, [26, 4, -24], 1.1); // front strip (front three-quarter)
    if (envTex) envTex.dispose();
    envTex = pm.fromScene(es, 0.035).texture;
    pm.dispose();
    scene.environment = envTex;
  }
  function acquire() {
    if (gl) return true;
    if (glFailed > 3) return false;
    try {
      glCanvas = document.createElement("canvas");
      gl = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true });
      gl.setPixelRatio(1);
      gl.setClearColor(0, 0);
      gl.outputEncoding = THREE.sRGBEncoding;
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 0.92;
      glCanvas.addEventListener("webglcontextlost", (e) => {
        e.preventDefault();
        release(true);
      });
      buildEnv();
      return true;
    } catch {
      gl = null;
      glFailed++;
      if (glFailed > 3) onNoWebGL?.();
      return false;
    }
  }
  function release(lost) {
    if (!gl) return;
    try {
      if (!lost) gl.forceContextLoss();
      gl.dispose();
    } catch {
      /* already gone */
    }
    gl = null;
    glCanvas = null;
    envTex = null;
    scene.environment = null;
  }

  /* ---- pointer ---- */
  let mx = 0, my = 0, lastPoke = performance.now();
  const poke = () => {
    lastPoke = performance.now();
  };
  function track(e) {
    if (e.clientX == null) return;
    mx = Math.max(-1, Math.min(1, (e.clientX / Math.max(1, innerWidth)) * 2 - 1));
    my = Math.max(-1, Math.min(1, (e.clientY / Math.max(1, innerHeight)) * 2 - 1));
    poke();
  }
  const onTouch = (e) => {
    if (e.touches && e.touches[0]) track(e.touches[0]);
  };
  ["pointermove", "mousemove", "pointerover"].forEach((t) => document.addEventListener(t, track, { passive: true, capture: true }));
  document.addEventListener("touchmove", onTouch, { passive: true, capture: true });

  /* ---- mounts ---- */
  const mounts = [];
  function mount(el) {
    const m = { el, yaw: el.getAttribute("data-cam") === "rear" ? REAR : 0, from: 0, to: 0, t0: 0, tx: 0, ty: 0, vis: true, flash: {}, hot: null, dialYaw: 0, door: 0, doorFrom: 0, doorTo: 0, doorT0: -1e9 };
    m.to = m.from = m.yaw;
    const keyOf = (t) => {
      const e = t && t.closest && t.closest("[data-hs],[data-lead]");
      return e ? e.getAttribute("data-hs") || e.getAttribute("data-lead") : null;
    };
    const on = {
      mouseover: (e) => { m.hot = keyOf(e.target); poke(); },
      mouseleave: () => { m.hot = null; },
      focusin: (e) => { m.hot = keyOf(e.target); poke(); },
      focusout: () => { m.hot = null; },
    };
    const onClick = (e) => {
      const k = keyOf(e.target);
      if (k && HS[k]) {
        HS[k].t = performance.now();
        poke();
      }
    };
    Object.entries(on).forEach(([t, f]) => el.addEventListener(t, f));
    el.addEventListener("click", onClick, true);
    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((es) => {
        m.vis = es[es.length - 1].isIntersecting;
      });
      io.observe(el);
    }
    mounts.push(m);
    poke();
    start();
    return () => {
      Object.entries(on).forEach(([t, f]) => el.removeEventListener(t, f));
      el.removeEventListener("click", onClick, true);
      io?.disconnect();
      const i = mounts.indexOf(m);
      if (i >= 0) mounts.splice(i, 1);
    };
  }

  /* ---- per-frame draw ---- */
  const q = new THREE.Quaternion(), wp = new THREE.Vector3(), n = new THREE.Vector3(), view = new THREE.Vector3();
  function rectIn(el, base, s) {
    const r = el.getBoundingClientRect();
    return { x: (r.left - base.left) / s, y: (r.top - base.top) / s, w: r.width / s, h: r.height / s };
  }

  function renderMount(m, t) {
    const el = m.el, cv = el.querySelector("canvas[data-cam-canvas]");
    if (!cv) return false;
    const W = cv.clientWidth, H = cv.clientHeight;
    if (W < 8 || H < 8) return false;
    const mr = el.getBoundingClientRect(), s = el.offsetWidth ? mr.width / el.offsetWidth || 1 : 1;
    const cr = rectIn(cv, mr, s);
    const pw = Math.round(W * DPR), ph = Math.round(H * DPR);
    if (cv.width !== pw || cv.height !== ph) {
      cv.width = pw;
      cv.height = ph;
    }
    if (glCanvas.width !== pw || glCanvas.height !== ph) gl.setSize(pw, ph, false);
    cam3.aspect = W / H;
    cam3.updateProjectionMatrix();
    const fit = parseFloat(el.getAttribute("data-fit") || "0.9");
    const tf = Math.tan((cam3.fov * PI) / 360), d = Math.max(RAD / tf, RAD / (tf * cam3.aspect)) * fit;
    cam3.position.copy(DIR).multiplyScalar(d);
    cam3.lookAt(0, 0, 0);

    // flip
    const want = el.getAttribute("data-cam") === "rear" ? REAR : 0;
    if (want !== m.to) {
      m.from = m.yaw;
      m.to = want;
      m.t0 = t;
    }
    m.yaw = m.from + (m.to - m.from) * expo(Math.min(1, (t - m.t0) / 1000));
    flip.rotation.y = m.yaw;

    // tilt (±0.15 rad yaw, ±0.07 rad pitch, damped 0.05 per frame, softer on phones) + 0.12 cm bob on a 1.4 s sine
    if (el.getAttribute("data-tilt") !== "off") {
      const small = innerWidth < 860;
      m.tx += (mx * (small ? 0.07 : 0.15) - m.tx) * 0.05;
      m.ty += (my * 0.1 - m.ty) * 0.05;
      rig.rotation.y = m.tx;
      rig.rotation.x = m.ty * 0.7;
      rig.position.y = Math.sin(t / 1400) * 0.12;
    } else {
      rig.rotation.set(0, 0, 0);
      rig.position.y = 0;
    }

    // lcd
    const tex = screenTexture(el.getAttribute("data-page") || "Adam Zhang", el.getAttribute("data-sub") || "adamzhang.org", el.getAttribute("data-count") || "");
    if (lcdMat.map !== tex) {
      lcdMat.map = tex;
      lcdMat.needsUpdate = true;
    }

    // glow sweep: the buttons glow once in sequence, 160 ms apart, for each new data-sweep id
    const sweep = el.getAttribute("data-sweep") || "0";
    if (sweep !== m.sweep) {
      m.sweep = sweep;
      m.swept ??= new Set();
      if (sweep !== "0" && !m.swept.has(sweep)) {
        m.swept.add(sweep);
        const delay = parseFloat(el.getAttribute("data-sweep-delay")) || 500;
        INTRO_KEYS.forEach((k, i) => {
          m.flash[k] = t + delay + i * 160;
        });
        m.t0b = t + delay - 500; // keep drawing until the sweep has finished
      }
    }

    // mode dial rests on the current section; data-dial may preview another notch
    let di = parseFloat(el.getAttribute("data-dial") || "0");
    if (isNaN(di)) di = 0;
    const dialTarget = (-di * PI) / 4;
    m.dialYaw += (dialTarget - m.dialYaw) * 0.22;
    modeDial.rotation.y = m.dialYaw;
    if (Math.abs(dialTarget - m.dialYaw) > 1e-3) m.dialMoving = t;

    // card door swings open / shut
    const doorWant = el.getAttribute("data-door") === "open" ? DOOR_OPEN : 0;
    if (doorWant !== m.doorTo) {
      m.doorFrom = m.door;
      m.doorTo = doorWant;
      m.doorT0 = t;
    }
    const dp = Math.min(1, (t - m.doorT0) / DOOR_MS);
    m.door = m.doorFrom + (m.doorTo - m.doorFrom) * (m.doorTo > m.doorFrom ? springy(dp) : expo(dp));
    doorPivot.rotation.y = m.door;
    if (el.getAttribute("data-slot") === "lit") slotMat.color.copy(SLOT_LIT).multiplyScalar(0.65 + 0.35 * Math.sin(t / 70));
    else slotMat.color.setHex(0x000000);

    // per-control glow + press (0.09 cm for 260 ms)
    const now = performance.now();

    Object.keys(HS).forEach((k) => {
      const h = HS[k];
      const pr = h.t ? Math.max(0, 1 - (now - h.t) / 260) : 0;
      const dd = pr > 0 ? Math.sin(Math.min(1, (now - h.t) / 260) * PI) * 0.09 : 0;
      h.g.position.copy(h.base).addScaledVector(h.ax, -dd);
      const fl = m.flash[k] ? Math.max(0, 1 - Math.abs(t - m.flash[k]) / 350) : 0;
      const glow = Math.max(m.hot === k ? 1 : 0, fl, pr);
      if (k === "record") h.m.emissive.setHex(glow ? 0x8a55e6 : 0x000000);
      else h.m.emissive.setHex(0x8a55e6);
      // an open door shows its inner face; keep that dark rather than a flat lit panel
      h.m.emissiveIntensity = glow * 0.85 * (k === "door" ? 1 - 0.85 * Math.min(1, Math.max(0, m.door / DOOR_OPEN)) : 1);
    });

    rig.updateMatrixWorld(true);
    gl.render(scene, cam3);
    const c2 = cv.getContext("2d");
    c2.clearRect(0, 0, pw, ph);
    c2.drawImage(glCanvas, 0, 0, pw, ph);

    // hotspots, leader labels
    const hsOff = el.getAttribute("data-hotspots") === "off";
    flip.getWorldQuaternion(q);
    Object.keys(HS).forEach((k) => {
      const h = HS[k];
      h.a.getWorldPosition(wp);
      n.copy(h.a.userData.n).applyQuaternion(q);
      view.copy(cam3.position).sub(wp).normalize();
      const face = n.dot(view);
      wp.project(cam3);
      const x = cr.x + (wp.x * 0.5 + 0.5) * W, y = cr.y + (-wp.y * 0.5 + 0.5) * H;
      const vis = face > 0.12 && !hsOff && !(h.frontOnly && Math.abs(m.yaw) > 0.6);
      el.querySelectorAll('[data-hs="' + k + '"]').forEach((b) => {
        b.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
        b.style.opacity = vis ? "1" : "0";
        b.style.pointerEvents = vis ? "auto" : "none";
        b.style.visibility = vis ? "visible" : "hidden";
        if (vis) b.removeAttribute("tabindex");
        else b.setAttribute("tabindex", "-1");
      });
      const lead = el.querySelector('[data-lead="' + k + '"]'), line = el.querySelector('[data-line="' + k + '"]'), ring = el.querySelector('[data-ring="' + k + '"]');
      if (!lead) return;
      const lv = face > 0.12;
      lead.style.opacity = lv ? "1" : "0";
      lead.style.pointerEvents = lv ? "auto" : "none";
      lead.style.visibility = lv ? "visible" : "hidden";
      if (lv) lead.removeAttribute("tabindex");
      else lead.setAttribute("tabindex", "-1");
      if (line) {
        // the line attaches to the label's nearest edge and ends at the ring
        const lr = rectIn(lead, mr, s);
        const cands = [[lr.x, lr.y + lr.h / 2], [lr.x + lr.w, lr.y + lr.h / 2], [lr.x + lr.w / 2, lr.y], [lr.x + lr.w / 2, lr.y + lr.h]];
        let best = cands[0], bd = 1e9;
        cands.forEach((c) => {
          const dd2 = (c[0] - x) * (c[0] - x) + (c[1] - y) * (c[1] - y);
          if (dd2 < bd) {
            bd = dd2;
            best = c;
          }
        });
        const ax = best[0], ay = best[1];
        const dx = x - ax, dy = y - ay, len = Math.hypot(dx, dy) || 1, ex = x - (dx / len) * 5, ey = y - (dy / len) * 5;
        line.setAttribute("x1", ax.toFixed(1));
        line.setAttribute("y1", ay.toFixed(1));
        line.setAttribute("x2", ex.toFixed(1));
        line.setAttribute("y2", ey.toFixed(1));
        line.style.opacity = lv ? (m.hot === k ? "1" : "0.6") : "0";
      }
      if (ring) {
        ring.setAttribute("cx", x.toFixed(1));
        ring.setAttribute("cy", y.toFixed(1));
        ring.style.opacity = lv ? "1" : "0";
      }
    });
    return true;
  }

  function signature(m) {
    const el = m.el, cv = el.querySelector("canvas[data-cam-canvas]");
    if (!cv) return "";
    const r = cv.getBoundingClientRect(), mr = el.getBoundingClientRect();
    return [
      el.getAttribute("data-cam"), el.getAttribute("data-page"), el.getAttribute("data-count"), el.getAttribute("data-hotspots"), el.getAttribute("data-sweep"),
      el.getAttribute("data-sub"), el.getAttribute("data-dial"), el.getAttribute("data-door"), el.getAttribute("data-slot"),
      Math.round(r.left - mr.left), Math.round(r.top - mr.top), Math.round(r.width), Math.round(r.height),
      el.querySelectorAll("[data-lead]").length, el.querySelectorAll("[data-hs]").length, m.hot,
    ].join("|");
  }

  let raf = 0, lastRender = 0, lastBusy = 0;
  function loop(t) {
    if (!mounts.length) {
      raf = 0;
      release();
      return;
    }
    raf = requestAnimationFrame(loop);
    const now = performance.now();
    if (document.hidden) return;
    let need = false, busy = now - lastPoke < IDLE_MS;
    const hsAnim = Object.keys(HS).some((k) => HS[k].t && now - HS[k].t < 400);
    for (const m of mounts) {
      if (!m.vis) continue;
      const sig = signature(m);
      if (sig !== m.sig) {
        m.sig = sig;
        m.changed = now;
      }
      if (now - (m.changed || 0) < 700 || Math.abs(m.yaw - m.to) > 1e-3 || t - m.t0 < 1100 || (m.t0b && t - m.t0b < 3000) || (m.dialMoving && t - m.dialMoving < 200) || t - m.doorT0 < DOOR_MS + 100 || !m.drawn || hsAnim) busy = true;
      need = true;
    }
    if (!need) {
      if (gl && now - lastRender > 1500) release();
      return;
    }
    if (busy) lastBusy = now;
    else {
      if (gl && now - lastBusy > IDLE_MS) release();
      return;
    }
    if (!acquire()) return;
    let drew = false;
    for (const m of mounts) {
      if (m.vis && renderMount(m, t)) {
        m.drawn = true;
        drew = true;
      }
    }
    lastRender = now;
    if (drew && !firstFrameSent) {
      firstFrameSent = true;
      onFirstFrame?.();
    }
  }
  function start() {
    if (!raf) raf = requestAnimationFrame(loop);
  }

  return { mount, poke };
}
