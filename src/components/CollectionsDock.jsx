import { useCallback, useEffect, useRef, useState } from "react";
import { useUi } from "@/context/uiContext";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { liveCards } from "@/data/cards";
import { useCamera } from "./camera/cameraContext";
import { SdCard } from "./SdCard";

const INSERT_MS = 780; // with no camera on screen: the card lifts away and fades, then the page changes
const MAG_RANGE = 150; // px either side of the pointer that magnify
const MAG_EASE_MS = 20; // how quickly the cards catch up with the pointer (time constant)
// Clicks on other controls are left alone: the card door toggles the dock itself, and a link or button
// that navigates closes it by changing the screen (closing here too would race that navigation).
const leavesDockAlone = (t) => !!t?.closest?.("a,button,input,select,textarea,summary,[role=button]");

// Where the card goes in: the camera's card-door hotspot, if it is on screen, and that camera's mount.
function doorTarget() {
  for (const b of document.querySelectorAll('[data-hs="door"]')) {
    const r = b.getBoundingClientRect();
    if (r.width && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth) return { x: r.left + r.width / 2, y: r.top + r.height / 2, mount: b.closest("[data-cam]") };
  }
  return null;
}

/* The card tray as a dock that rises from the bottom of the screen, opened by the camera's card door.
   It counts as a screen in history (Back from a page opened here returns to it). Pointing magnifies the
   cards like the macOS Dock; the dot marks the section you are in. Picking a card flies it to the camera's
   card slot, turns it to line up and pushes it in, then opens that page and the door swings shut. */
export function CollectionsDock() {
  const { trayOpen, closeTray, go } = useHistoryBack();
  const { pageKey, setInserting } = useUi();
  const { engine } = useCamera();
  const [fly, setFly] = useState(null);
  const dockRef = useRef(null);
  const flyRef = useRef(null);
  const returnTo = useRef(null);
  const mag = useRef({ items: [], rest: [], m: [], target: null, raf: 0, last: 0 });
  const open = trayOpen && !fly;

  // focus in on open, back to the opener on a plain close; Esc and a click elsewhere close it
  useEffect(() => {
    const dock = dockRef.current;
    if (!open || !dock) return undefined;
    returnTo.current = document.activeElement;
    const first = dock.querySelector(".cd-item.here .cd-card") ?? dock.querySelector(".cd-card");
    const t = setTimeout(() => first?.focus({ preventScroll: true }), 60);
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeTray();
      }
    };
    const onDown = (e) => {
      if (!dock.contains(e.target) && !leavesDockAlone(e.target)) closeTray();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      const back = returnTo.current;
      if (back && document.contains(back) && dock.contains(document.activeElement)) back.focus({ preventScroll: true });
    };
  }, [open, closeTray]);

  /* Magnifying: each card's size comes from the pointer's distance to where that card sits at rest (measured on
     open, from the dock's centre, which stays put as the dock grows), so a growing card never moves itself out
     from under the pointer. One frame loop eases every card toward its size. */
  useEffect(() => {
    const g = mag.current, dock = dockRef.current;
    if (!open || !dock) return undefined;
    const list = dock.querySelector(".cd-list");
    g.items = [...dock.querySelectorAll(".cd-item")];
    g.items.forEach((it) => it.style.setProperty("--m", "0"));
    g.m = g.items.map(() => 0);
    g.target = null;
    const mid = list.offsetLeft + list.offsetWidth / 2;
    g.rest = g.items.map((it) => it.offsetLeft + it.offsetWidth / 2 - mid);
    return () => {
      cancelAnimationFrame(g.raf);
      g.raf = 0;
    };
  }, [open]);

  const step = (t) => {
    const g = mag.current;
    const k = g.last ? 1 - Math.exp(-Math.min(64, t - g.last) / MAG_EASE_MS) : 0;
    g.last = t;
    let moving = false;
    g.items.forEach((it, i) => {
      const to = g.target?.[i] ?? 0;
      let m = g.m[i] + (to - g.m[i]) * k;
      if (Math.abs(to - m) < 0.002) m = to;
      else moving = true;
      if (m !== g.m[i]) it.style.setProperty("--m", m.toFixed(3));
      g.m[i] = m;
    });
    g.raf = moving ? requestAnimationFrame(step) : 0;
    if (!moving) g.last = 0;
  };
  const kick = () => {
    if (!mag.current.raf) mag.current.raf = requestAnimationFrame(step);
  };
  const magnify = (e) => {
    const g = mag.current, list = dockRef.current?.querySelector(".cd-list");
    if (e.pointerType !== "mouse" || !list || !g.rest.length) return;
    const r = list.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2);
    g.target = g.rest.map((c) => Math.cos((Math.min(1, Math.abs(x - c) / MAG_RANGE) * Math.PI) / 2));
    kick();
  };
  const endFlight = useCallback(() => setFly(null), []);
  const settle = () => {
    mag.current.target = null;
    kick();
  };

  const pick = (card, btn) => {
    if (fly) return;
    const from = btn.querySelector(".sd").getBoundingClientRect();
    const fx = from.left + from.width / 2, fy = from.top + from.height / 2;
    const door = doorTarget();
    const to = door ?? { x: fx, y: fy - 220 };
    // the camera flies the card in itself; it says how long that takes
    const inMs = (door?.mount && engine?.insertCard(door.mount, { card, from, fly: flyRef })) || 0;
    returnTo.current = null; // the page is about to change; don't send focus back to the opener
    settle();
    setInserting(true);
    setFly({ card, from, dx: to.x - fx, dy: to.y - fy, to, hasDoor: !!door, inMs });
    setTimeout(() => go(card.path), inMs || INSERT_MS);
  };

  return (
    <>
      <div
        ref={dockRef}
        className={"cdock" + (open ? " open" : "")}
        role="dialog"
        aria-label="Collections"
        aria-hidden={!open}
        onPointerMove={magnify}
        onPointerLeave={settle}
      >
        <ul className="cd-list">
          {liveCards.map((c, i) => {
            const here = c.key === pageKey || (c.key === "photos" && pageKey === "photography");
            return (
              <li key={c.key} className={"cd-item" + (here ? " here" : "")} style={{ "--i": i }}>
                <button
                  type="button"
                  className="cd-card"
                  tabIndex={open ? undefined : -1}
                  aria-label={`${c.name}, ${c.count}${here ? " (this page)" : ""}`}
                  onClick={(e) => pick(c, e.currentTarget)}
                >
                  <SdCard card={c} compact />
                  <span className="cd-tip" aria-hidden="true">
                    {c.name}
                    <em>{c.count}</em>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {fly && <CardFlight key={fly.card.key + fly.from.left} ref={flyRef} fly={fly} onDone={endFlight} />}
    </>
  );
}

// The picked card, its contacts lighting in sequence as it lifts. With a camera on screen the engine moves it
// (see insertCard in camera/engine.js) and a ring pings on the door as it clicks home; otherwise it flies up
// toward where the slot would be, shrinking and fading.
function CardFlight({ ref, fly, onDone }) {
  useEffect(() => {
    const { dx, dy, inMs } = fly;
    if (inMs) {
      const t = setTimeout(onDone, inMs + 450);
      return () => clearTimeout(t);
    }
    const a = ref.current.animate(
      [
        { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx * 0.12}px, ${dy * 0.05 - 56}px) scale(1.14) rotate(-5deg)`, opacity: 1, offset: 0.24, easing: "cubic-bezier(.5,0,.3,1)" },
        { transform: `translate(${dx}px, ${dy}px) scale(.34) rotate(0deg)`, opacity: 1, offset: 0.74, easing: "cubic-bezier(.6,0,.4,1)" },
        { transform: `translate(${dx}px, ${dy}px) scale(.12) rotate(0deg)`, opacity: 0 },
      ],
      { duration: INSERT_MS, easing: "cubic-bezier(.3,.1,.3,1)", fill: "forwards" }
    );
    const t = setTimeout(onDone, INSERT_MS + 450);
    return () => {
      a.cancel();
      clearTimeout(t);
    };
  }, [ref, fly, onDone]);

  const { from, to, card, hasDoor, inMs } = fly;
  return (
    <>
      <div ref={ref} className="cd-fly" aria-hidden="true" style={{ left: from.left, top: from.top, width: from.width, height: from.height }}>
        <SdCard card={card} compact />
      </div>
      {hasDoor && <span className="cd-ping" aria-hidden="true" style={{ left: to.x, top: to.y, animationDelay: inMs ? `${inMs - 100}ms` : undefined }} />}
    </>
  );
}
