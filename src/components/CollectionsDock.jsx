import { useCallback, useEffect, useRef, useState } from "react";
import { useUi } from "@/context/uiContext";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { liveCards } from "@/data/cards";
import { SdCard } from "./SdCard";

const INSERT_MS = 780; // card flight + read, then the page changes (and the door shuts)
const MAG_RANGE = 150; // px either side of the pointer that magnify
// Clicks on other controls are left alone: the card door toggles the dock itself, and a link or button
// that navigates closes it by changing the screen (closing here too would race that navigation).
const leavesDockAlone = (t) => !!t?.closest?.("a,button,input,select,textarea,summary,[role=button]");

// Where the card goes in: the camera's card-door hotspot, if it is on screen.
function doorTarget() {
  for (const b of document.querySelectorAll('[data-hs="door"]')) {
    const r = b.getBoundingClientRect();
    if (r.width && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return null;
}

/* The card tray as a dock that rises from the bottom of the screen, opened by the camera's card door.
   It counts as a screen in history (Back from a page opened here returns to it). Pointing magnifies the
   cards like the macOS Dock; the dot marks the section you are in. Picking a card flies it into the
   camera's card slot while its contacts read, then opens that page and the door swings shut. */
export function CollectionsDock() {
  const { trayOpen, closeTray, go } = useHistoryBack();
  const { pageKey, setInserting } = useUi();
  const [fly, setFly] = useState(null);
  const dockRef = useRef(null);
  const returnTo = useRef(null);
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

  const magnify = (e) => {
    if (e.pointerType !== "mouse") return;
    dockRef.current?.querySelectorAll(".cd-item").forEach((it) => {
      const r = it.getBoundingClientRect();
      const d = Math.min(1, Math.abs(e.clientX - (r.left + r.width / 2)) / MAG_RANGE);
      it.style.setProperty("--m", Math.cos((d * Math.PI) / 2).toFixed(3));
    });
  };
  const endFlight = useCallback(() => setFly(null), []);
  const settle = () => dockRef.current?.querySelectorAll(".cd-item").forEach((it) => it.style.setProperty("--m", "0"));

  const pick = (card, btn) => {
    if (fly) return;
    const from = btn.querySelector(".sd").getBoundingClientRect();
    const fx = from.left + from.width / 2, fy = from.top + from.height / 2;
    const door = doorTarget();
    const to = door ?? { x: fx, y: fy - 220 };
    returnTo.current = null; // the page is about to change; don't send focus back to the opener
    settle();
    setInserting(true);
    setFly({ card, from, dx: to.x - fx, dy: to.y - fy, to, hasDoor: !!door });
    setTimeout(() => go(card.path), INSERT_MS);
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
      {fly && <CardFlight key={fly.card.key + fly.from.left} fly={fly} onDone={endFlight} />}
    </>
  );
}

// The picked card lifts, flies to the card slot shrinking as it goes, reads (its contacts light in
// sequence) and slips in; a ring pings on the door. Under a second in all.
function CardFlight({ fly, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    const { dx, dy } = fly;
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
  }, [fly, onDone]);

  const { from, to, card, hasDoor } = fly;
  return (
    <>
      <div ref={ref} className="cd-fly" aria-hidden="true" style={{ left: from.left, top: from.top, width: from.width, height: from.height }}>
        <SdCard card={card} compact />
      </div>
      {hasDoor && <span className="cd-ping" aria-hidden="true" style={{ left: to.x, top: to.y }} />}
    </>
  );
}
