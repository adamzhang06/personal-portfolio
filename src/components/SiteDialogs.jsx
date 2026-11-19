import { useUi } from "@/context/uiContext";
import { livePages } from "@/data/pages";
import { DEMO_VIDEO_LINKS, QUICK_FACTS } from "@/data/site";
import { NativeDialog } from "./NativeDialog";
import { RouteLink } from "./RouteLink";

function DialogHead({ id, title, onClose }) {
  return (
    <div className="dlg-h">
      <h2 id={id}>{title}</h2>
      <button type="button" className="btn small" data-autofocus onClick={onClose}>
        Close
      </button>
    </div>
  );
}

export function SiteMenuDialog({ open, onClose }) {
  const { pageKey } = useUi();
  return (
    <NativeDialog open={open} onClose={onClose} className="dialog" labelledBy="dlg-menu">
      <div className="dialog-in">
        <DialogHead id="dlg-menu" title="Site menu" onClose={onClose} />
        <nav className="menu" aria-label="Every page">
          {livePages.map((p) => (
            <RouteLink key={p.key} to={p.path} onClick={onClose} className={pageKey === p.key ? "on" : undefined} aria-current={pageKey === p.key ? "page" : undefined}>
              {p.label}
              <span aria-hidden="true">{pageKey === p.key ? "•" : "→"}</span>
            </RouteLink>
          ))}
        </nav>
      </div>
    </NativeDialog>
  );
}

export function QuickFactsDialog({ open, onClose }) {
  return (
    <NativeDialog open={open} onClose={onClose} className="dialog" labelledBy="dlg-info">
      <div className="dialog-in">
        <DialogHead id="dlg-info" title="Quick facts" onClose={onClose} />
        <dl className="spec">
          {QUICK_FACTS.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd className={f.status ? "ok" : undefined}>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </NativeDialog>
  );
}

export function VideosDialog({ open, onClose }) {
  return (
    <NativeDialog open={open} onClose={onClose} className="dialog" labelledBy="dlg-vid">
      <div className="dialog-in">
        <DialogHead id="dlg-vid" title="Demo videos" onClose={onClose} />
        <nav className="menu" aria-label="Demo videos">
          {DEMO_VIDEO_LINKS.map((v) => (
            <a key={v.href} href={v.href} target="_blank" rel="noopener noreferrer">
              {v.label}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
      </div>
    </NativeDialog>
  );
}

// The overlays opened from the camera, the phone Menu button and the legends.
export function SiteDialogs() {
  const { overlay, setOverlay } = useUi();
  const close = () => setOverlay(null);
  return (
    <>
      <SiteMenuDialog open={overlay === "menu"} onClose={close} />
      <QuickFactsDialog open={overlay === "info"} onClose={close} />
      <VideosDialog open={overlay === "videos"} onClose={close} />
    </>
  );
}
