import { createContext, useContext, useEffect } from "react";

// status: 'loading' | 'ready' | 'nowebgl'. moduleLoaded / fontsReady / firstFrame drive the iris percent.
export const CameraContext = createContext({ status: "nowebgl", engine: null, moduleLoaded: true, fontsReady: true, firstFrame: true });

export const useCamera = () => useContext(CameraContext);

// Registers a mount element with the engine for as long as it is rendered.
export function useCameraMount(ref) {
  const { engine } = useCamera();
  useEffect(() => {
    if (!engine || !ref.current) return undefined;
    return engine.mount(ref.current);
  }, [engine, ref]);
}
