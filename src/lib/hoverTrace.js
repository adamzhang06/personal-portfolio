/* Green hover trace. While a mouse is over a bordered, interactive box, a green streak runs around its
   outline, bright at the head and fading smoothly down its tail. It is an SVG drawn to the element's own
   shape (rounded box, pill, circle) with pathLength 100, so it moves at an even pace on every shape; site.css
   sets the lap timing. One document-level listener adds the SVG inside the hovered element and removes it on
   leave; it is redrawn if the element changes size, and an outer box's trace steps aside while a traced box
   inside it is hovered. The selected item in a list (.on, aria-current) gets no trace. The camera, the top
   bar and things that move on hover (SD cards, polaroids) keep their own hover effects. */

export const TRACE_SEL = [".card", ".rrow", ".lp", ".lk", ".skbox", ".btn", ".hlink", ".lb-btn", ".lk-copy", ".mzoom", ".rewind"].join(",");
const SKIP = '.on, [aria-current="page"]';
const NS = "http://www.w3.org/2000/svg";
const S = 2; // stroke width
// The tail: N short dashes, each ending where the one in front begins, dimming from the head back.
// Every dash ends at a fixed spot in its pattern, so all of them share one plain 0 → -100 offset animation.
const TAIL = 30, N = 15;

const px = (v, of) => (v.endsWith("%") ? (parseFloat(v) / 100) * of : parseFloat(v) || 0);

// Rounded rectangle (pills and circles included) inset by half the stroke, starting at the top-left.
function roundRect(w, h, r) {
  const i = S / 2, R = Math.max(0, Math.min(r, w / 2, h / 2) - i);
  return `M${i + R},${i}H${w - i - R}A${R},${R} 0 0 1 ${w - i},${i + R}V${h - i - R}A${R},${R} 0 0 1 ${w - i - R},${h - i}` +
    `H${i + R}A${R},${R} 0 0 1 ${i},${h - i - R}V${i + R}A${R},${R} 0 0 1 ${i + R},${i}Z`;
}

// Size, offset (over the border) and outline of an element, from its layout box (transforms don't count).
function draw(el, svg) {
  const cs = getComputedStyle(el);
  const w = el.offsetWidth, h = el.offsetHeight;
  if (!w || !h) return false;
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.style.left = -parseFloat(cs.borderLeftWidth) + "px";
  svg.style.top = -parseFloat(cs.borderTopWidth) + "px";
  const d = roundRect(w, h, px(cs.borderTopLeftRadius, w));
  svg.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
  return true;
}

function build() {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "trace");
  svg.setAttribute("aria-hidden", "true");
  const seg = TAIL / N;
  for (let i = 0; i < N; i++) {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("pathLength", "100");
    // dash i covers [100 - (i+1)·seg, 100 - i·seg]: the head (i = 0) sits at the very end
    p.style.strokeDasharray = `0 ${100 - (i + 1) * seg} ${seg} ${i * seg}`;
    p.style.opacity = ((1 - i / N) ** 1.6).toFixed(3);
    svg.appendChild(p);
  }
  return svg;
}

const live = new Map(); // hovered element → { svg, ro, timer }

// an outer traced box goes quiet while a traced box inside it is hovered
function hush() {
  live.forEach(({ svg }, el) => {
    let inner = false;
    live.forEach((v, other) => (inner ||= other !== el && el.contains(other) && v.svg.classList.contains("on")));
    svg.classList.toggle("hush", inner);
  });
}

function drop(el) {
  const cur = live.get(el);
  if (!cur) return;
  clearTimeout(cur.timer);
  cur.ro.disconnect();
  cur.svg.remove();
  live.delete(el);
}

function add(el) {
  live.forEach((_, other) => !other.isConnected && drop(other));
  const cur = live.get(el);
  if (cur) {
    clearTimeout(cur.timer);
    cur.svg.classList.add("on");
    hush();
    return;
  }
  const svg = build();
  if (!draw(el, svg)) return;
  if (getComputedStyle(el).position === "static") el.style.position = "relative";
  el.appendChild(svg);
  const ro = new ResizeObserver(() => draw(el, svg));
  ro.observe(el);
  live.set(el, { svg, ro, timer: 0 });
  requestAnimationFrame(() => {
    svg.classList.add("on");
    hush();
  });
}

function remove(el, now = false) {
  const cur = live.get(el);
  if (!cur) return;
  cur.svg.classList.remove("on");
  hush();
  clearTimeout(cur.timer);
  cur.timer = setTimeout(() => drop(el), now ? 0 : 260);
}

export function installHoverTrace() {
  if (!window.matchMedia("(hover: hover)").matches) return;
  // pointerenter / pointerleave don't bubble, but a capturing listener on the document sees every one
  document.addEventListener(
    "pointerenter",
    (e) => {
      const el = e.target;
      if (e.pointerType === "mouse" && el.matches?.(TRACE_SEL) && !el.matches(SKIP)) add(el);
    },
    true
  );
  document.addEventListener("pointerleave", (e) => live.has(e.target) && remove(e.target), true);
  // clicking can select the hovered item (a role row) or swap the page: drop traces that no longer apply
  document.addEventListener("click", () => setTimeout(() => live.forEach((_, el) => (el.matches(SKIP) || !el.isConnected) && remove(el, true))), true);
}
