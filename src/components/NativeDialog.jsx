import { useEffect, useRef } from "react";

/* The page behind an open dialog must not scroll (showModal() alone doesn't stop the wheel or a touch drag).
   Counted, so a dialog opened inside another (a photo inside a roll) keeps the lock until both have closed. */
let locks = 0;
let prevOverflow = "";
function lockScroll() {
  const html = document.documentElement;
  if (locks++ === 0) {
    prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
  }
}
function unlockScroll() {
  if (locks === 0) return;
  if (--locks === 0) document.documentElement.style.overflow = prevOverflow;
}

/* Native modal <dialog>: focus moves to the element marked data-autofocus (Close), Esc and a click on
   the backdrop call onClose, focus returns to whatever opened it, and the page behind it is locked. */
export function NativeDialog({ open, onClose, className, labelledBy, label, onKeyDown, children }) {
  const ref = useRef(null);
  const returnTo = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      returnTo.current = document.activeElement;
      d.showModal();
      lockScroll();
      d.querySelector("[data-autofocus]")?.focus();
    } else if (!open && d.open) {
      d.close();
      unlockScroll();
      const back = returnTo.current;
      returnTo.current = null;
      if (back && document.contains(back) && back.checkVisibility?.() !== false) back.focus();
    }
  }, [open]);

  // Unmounted while open (e.g. a route change): release the lock.
  useEffect(
    () => () => {
      if (ref.current?.open) unlockScroll();
    },
    []
  );

  useEffect(() => {
    const d = ref.current;
    const onCancel = (e) => {
      e.preventDefault();
      onCloseRef.current();
    };
    const onClick = (e) => {
      if (e.target === d) onCloseRef.current();
    };
    d.addEventListener("cancel", onCancel);
    d.addEventListener("click", onClick);
    return () => {
      d.removeEventListener("cancel", onCancel);
      d.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <dialog ref={ref} className={className} aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : label} onKeyDown={onKeyDown}>
      {open && children}
    </dialog>
  );
}
