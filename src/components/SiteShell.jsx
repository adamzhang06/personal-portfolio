import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { UiProvider } from "@/context/UiProvider";
import { useUi } from "@/context/uiContext";
import { CameraProvider } from "@/components/camera/CameraProvider";
import { useCamera } from "@/components/camera/cameraContext";
import { CameraStage } from "@/components/camera/CameraStage";
import { useMediaQuery, PHONE_QUERY } from "@/hooks/useMediaQuery";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { DOMAIN, NAME } from "@/data/site";
import { titleFor } from "@/data/pages";
import { TopBar, TabBar } from "./TopBar";
import { CollectionsDock } from "./CollectionsDock";
import { SiteDialogs } from "./SiteDialogs";
import { IntroLoader } from "./lab/IntroLoaders";
import { PageTransition } from "./lab/PageTransition";
import { LabSwitcher } from "./lab/LabSwitcher";

function Shell() {
  useScrollRestoration();
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = titleFor(pathname, NAME);
  }, [pathname]);
  const { status } = useCamera();
  const ui = useUi();
  const phone = useMediaQuery(PHONE_QUERY);
  const home = ui.pageKey === "home" || ui.pageKey === "notfound";
  const camOn = status !== "nowebgl";

  return (
    <div className={`site bd-viewfinder ${camOn ? "cam-on" : "cam-off"}${camOn && !home ? " docked" : ""}${camOn && !home && !phone && ui.dockOpen ? " cam-expanded" : ""}`}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <TopBar />
      <main className="main" id="main" tabIndex={-1}>
        <Outlet />
      </main>
      {/* before the footer so its controls come before the footer in Tab order */}
      {!phone && <CameraStage />}
      <footer className="foot">
        <span>
          © {new Date().getFullYear()} {NAME}
        </span>
        <span>{DOMAIN}</span>
      </footer>
      <TabBar />
      <CollectionsDock />
      <SiteDialogs />
      <div className={"toast" + (ui.toast.on ? " show" : "")} role="status" aria-live="polite">
        {ui.toast.text}
      </div>
      <div className={"flash" + (ui.flash ? " on" : "")} aria-hidden="true" />
      <PageTransition />
      <IntroLoader />
      <LabSwitcher />
    </div>
  );
}

// Every route: one camera, one stage, never re-mounted per page.
export function SiteShell() {
  return (
    <CameraProvider>
      <UiProvider>
        <Shell />
      </UiProvider>
    </CameraProvider>
  );
}
