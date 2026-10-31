import { Outlet } from "react-router-dom";
import { UiProvider } from "@/context/UiProvider";
import { useUi } from "@/context/uiContext";
import { CameraProvider } from "@/components/camera/CameraProvider";
import { useCamera } from "@/components/camera/cameraContext";
import { CameraStage } from "@/components/camera/CameraStage";
import { useMediaQuery, PHONE_QUERY } from "@/hooks/useMediaQuery";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { DOMAIN, NAME } from "@/data/site";
import { TopBar, TabBar } from "./TopBar";
import { CollectionsDock } from "./CollectionsDock";
import { SiteDialogs } from "./SiteDialogs";
import { IntroIris } from "./IntroIris";
import { PageAperture } from "./PageAperture";

function Shell() {
  useScrollRestoration();
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
        {phone && home && <CameraStage variant="phone" />}
        <Outlet />
      </main>
      <footer className="foot">
        <span>
          © {new Date().getFullYear()} {NAME}
        </span>
        <span>{DOMAIN}</span>
      </footer>
      {!phone && <CameraStage />}
      <TabBar />
      <CollectionsDock />
      <SiteDialogs />
      <div className={"toast" + (ui.toast.on ? " show" : "")} role="status" aria-live="polite">
        {ui.toast.text}
      </div>
      <div className={"flash" + (ui.flash ? " on" : "")} aria-hidden="true" />
      {ui.screenCount > 0 && <PageAperture key={ui.screenCount} />}
      <IntroIris />
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
