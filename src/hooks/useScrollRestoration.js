import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const KEY = "ayz-scroll";
const read = () => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
};

/* New screens start at the top; browser Back / forward restore where you were on that entry.
   Opening or closing the card tray (same path, its own history entry) leaves the scroll alone. */
export function useScrollRestoration() {
  const location = useLocation();
  // Every fresh page load starts with key "default", so the path is part of the slot.
  const slot = `${location.key}:${location.pathname}`;
  const navType = useNavigationType();
  const prevPath = useRef(location.pathname);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);

  useLayoutEffect(() => {
    const samePath = prevPath.current === location.pathname;
    prevPath.current = location.pathname;
    const saved = read()[slot];
    if (navType === "POP" && saved != null) window.scrollTo({ top: saved, behavior: "instant" });
    else if (!samePath) window.scrollTo({ top: 0, behavior: "instant" });
  }, [slot, location.pathname, navType]);

  useEffect(() => {
    let t = 0;
    const save = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const all = read();
        all[slot] = window.scrollY;
        sessionStorage.setItem(KEY, JSON.stringify(all));
      }, 100);
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", save);
    };
  }, [slot]);
}
