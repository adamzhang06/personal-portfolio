import { useEffect, useRef } from "react";

const clamp = (x) => Math.min(1, Math.max(0, x));

/* Film strips ([data-reel] inside root) unroll as they rise through the lower half of the window: --u runs from 0
   (rolled up in the canister) to 1 (laid flat) and the CSS animates it. A strip holding keyboard focus lies flat.
   On start, the strips already on screen unroll one after another.
   Options: self (root is its own scroller, else the window scrolls), first (the first strip is always unrolled),
   once (a strip stays unrolled once it has been), eager (a strip unrolls all the way as soon as it is on screen),
   delay / stagger (seconds between strips on start) and layout (any value that changes when the strips are re-laid
   out, so new strips are measured). A strip that has lain flat is marked [data-dev] for good (its film develops). */
export function useUnroll(rootRef, { active = true, self = false, first = false, once = false, eager = false, delay = 350, stagger = 0.22, layout } = {}) {
  const refresh = useRef(() => {});

  useEffect(() => {
    const root = rootRef.current;
    if (!active || !root) return undefined;
    const scroller = self ? root : window;
    let ready = false, raf = 0, unstagger = 0;

    const set = () => {
      const vh = window.innerHeight;
      root.querySelectorAll("[data-reel]").forEach((el, i) => {
        const top = el.getBoundingClientRect().top;
        let u = eager ? Number(top < vh * 0.92) : clamp((vh * 0.95 - top) / (vh * 0.55));
        if ((first && i === 0) || el.matches(":focus-within")) u = 1;
        if (once) u = Math.max(u, Number(el.dataset.u) || 0);
        el.dataset.u = u;
        if (u >= 0.99) el.dataset.dev = "";
        el.style.setProperty("--u", u.toFixed(3));
      });
    };
    const queue = () => {
      if (!ready) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(set);
    };
    refresh.current = queue;

    // wait a beat so the strips on screen visibly unroll, one after another
    const boot = setTimeout(() => {
      const vh = window.innerHeight;
      const shown = [...root.querySelectorAll("[data-reel]")].filter((el) => el.getBoundingClientRect().top < vh);
      shown.forEach((el, i) => (el.style.transitionDelay = `${i * stagger}s`));
      ready = true;
      set();
      unstagger = setTimeout(() => shown.forEach((el) => (el.style.transitionDelay = "")), 1500 + shown.length * stagger * 1000);
    }, delay);

    scroller.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    root.addEventListener("focusin", queue);
    return () => {
      clearTimeout(boot);
      clearTimeout(unstagger);
      cancelAnimationFrame(raf);
      refresh.current = () => {};
      scroller.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      root.removeEventListener("focusin", queue);
    };
  }, [rootRef, active, self, first, once, eager, delay, stagger]);

  useEffect(() => {
    refresh.current();
  }, [layout]);
}
