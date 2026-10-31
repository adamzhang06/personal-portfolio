import { createContext, useContext } from "react";

export const UiContext = createContext(null);

export const useUi = () => useContext(UiContext);

// What the docked camera's LCD previews while a project, role or roll is hovered or focused: { page, sub, count } or
// null. Kept apart from UiContext so a hover never re-renders the pages, which only hold the (stable) setter.
export const PeekContext = createContext(null);
export const SetPeekContext = createContext(() => {});

export const usePeek = () => useContext(PeekContext);

// Props that show `lcd` on the LCD while the element is hovered with a mouse or holds focus.
export function useLcdPeek() {
  const setPeek = useContext(SetPeekContext);
  return (lcd) => ({
    onPointerEnter: (e) => e.pointerType === "mouse" && setPeek(lcd),
    onPointerLeave: () => setPeek(null),
    onFocus: () => setPeek(lcd),
    onBlur: () => setPeek(null),
  });
}
