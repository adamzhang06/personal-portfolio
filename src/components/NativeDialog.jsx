import { useEffect, useRef } from "react";

/* Native modal <dialog>: focus moves to the element marked data-autofocus (Close), Esc and a click on
   the backdrop call onClose, and focus returns to whatever opened it. */
export function NativeDialog({ open, onClose, className, labelledBy, children }) {
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
      d.querySelector("[data-autofocus]")?.focus();
    } else if (!open && d.open) {
      d.close();
      const back = returnTo.current;
      returnTo.current = null;
      if (back && document.contains(back) && back.checkVisibility?.() !== false) back.focus();
    }
  }, [open]);

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
    <dialog ref={ref} className={className} aria-labelledby={labelledBy}>
      {open && children}
    </dialog>
  );
}
