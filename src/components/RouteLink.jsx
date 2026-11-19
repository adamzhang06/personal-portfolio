import { useHistoryBack } from "@/hooks/useHistoryBack";

/* A real link to an in-site page: a plain click routes in-app (keeping `state.from` for the crumb and Back),
   while Cmd/Ctrl/Shift/middle-click and "Copy link" behave like any link, so a page can open in a new tab.
   `replace` swaps the current history entry (previous / next case study). */
export function RouteLink({ to, replace = false, onClick, children, ...rest }) {
  const { go } = useHistoryBack();
  return (
    <a
      {...rest}
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        go(to, { replace });
      }}
    >
      {children}
    </a>
  );
}
