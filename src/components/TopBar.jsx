import { useUi } from "@/context/uiContext";
import { useHistoryBack } from "@/hooks/useHistoryBack";
import { navPages, pageByKey, TAB_KEYS } from "@/data/pages";

// Real links (so they can open in a new tab), routed in-app on a plain click.
const routed = (go, path) => (e) => {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  go(path);
};

export function TopBar() {
  const { pageKey, setOverlay } = useUi();
  const { go } = useHistoryBack();
  return (
    <header className="top">
      <a
        className="logo"
        href="/"
        aria-label="Adam Zhang, home"
        onClick={routed(go, "/")}
      >
        AYZ<span className="dot">.</span>
      </a>
      <nav className="nav" aria-label="Main">
        {navPages.map((p) => (
          <a
            key={p.key}
            href={p.path}
            className={"navl" + (pageKey === p.key ? " on" : "")}
            aria-current={pageKey === p.key ? "page" : undefined}
            onClick={routed(go, p.path)}
          >
            {p.label}
          </a>
        ))}
      </nav>
      <button type="button" className="btn small mmenu" onClick={() => setOverlay("menu")}>
        Menu
      </button>
    </header>
  );
}

// Phone tab bar: Home · About · Projects · Experience · Photos (Leadership, Contact and the rest via Menu).
export function TabBar() {
  const { pageKey } = useUi();
  const { go } = useHistoryBack();
  const here = pageKey === "notfound" ? "home" : pageKey;
  return (
    <nav className="tabbar" aria-label="Main (mobile)">
      {TAB_KEYS.map((k) => {
        const p = pageByKey(k);
        return (
          <a
            key={k}
            href={p.path}
            className={"tab" + (here === k ? " on" : "")}
            aria-current={here === k ? "page" : undefined}
            onClick={routed(go, p.path)}
          >
            {p.tab ?? p.label}
          </a>
        );
      })}
    </nav>
  );
}
