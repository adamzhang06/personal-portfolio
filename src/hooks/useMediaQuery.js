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

export const PHONE_QUERY = "(max-width: 860px)";
