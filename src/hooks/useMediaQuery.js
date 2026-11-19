import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    [query]
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

// Phones, and phones on their side (a short touch screen of any width); the CSS phone blocks use the same query.
export const PHONE_QUERY = "(max-width: 860px), (pointer: coarse) and (max-height: 500px)";
