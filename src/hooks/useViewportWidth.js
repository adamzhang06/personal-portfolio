import { useSyncExternalStore } from "react";

const subscribe = (cb) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};

// The page's width without the scrollbar, updated on resize.
export function useViewportWidth() {
  return useSyncExternalStore(subscribe, () => document.documentElement.clientWidth, () => 1440);
}
