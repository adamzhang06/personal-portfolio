import { useEffect, useState } from "react";
import { CameraContext } from "./cameraContext";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

// The faces the camera's own markings are drawn in; loaded before the textures are built.
const TEXTURE_FONTS = [
  '700 120px "Bricolage Grotesque"',
  '500 32px "JetBrains Mono"',
  '600 120px "JetBrains Mono"',
  '400 40px "Hanken Grotesk"',
  '600 44px "Hanken Grotesk"',
  '700 72px "Hanken Grotesk"',
];

function loadFonts() {
  if (!document.fonts) return Promise.resolve();
  const all = Promise.all(TEXTURE_FONTS.map((f) => document.fonts.load(f))).catch(() => {});
  return Promise.race([all, new Promise((r) => setTimeout(r, 2500))]);
}

let loading = null; // one load per page, even under StrictMode's double effects

export function CameraProvider({ children }) {
  const [supported] = useState(hasWebGL);
  const [state, setState] = useState(() => ({
    status: supported ? "loading" : "nowebgl",
    engine: null,
    moduleLoaded: false,
    fontsReady: false,
    firstFrame: false,
  }));

  useEffect(() => {
    if (!supported) return undefined;
    let alive = true;
    const set = (patch) => alive && setState((s) => ({ ...s, ...patch }));
    if (!loading) {
      const fonts = loadFonts();
      const mod = import("./engine");
      loading = { fonts, mod, engine: null, listeners: new Set() };
      loading.ready = Promise.all([fonts, mod]).then(([, { createEngine }]) => {
        loading.engine = createEngine({
          onFirstFrame: () => {
            loading.firstFrame = true;
            loading.listeners.forEach((l) => l({ firstFrame: true }));
          },
          onNoWebGL: () => loading.listeners.forEach((l) => l({ status: "nowebgl", engine: null })),
        });
        return loading.engine;
      });
    }
    loading.listeners.add(set);
    if (loading.firstFrame) set({ firstFrame: true });
    loading.fonts.then(() => set({ fontsReady: true }));
    loading.mod.then(() => set({ moduleLoaded: true }));
    loading.ready.then((engine) => set({ status: "ready", engine })).catch(() => set({ status: "nowebgl", engine: null }));
    const l = loading;
    return () => {
      alive = false;
      l.listeners.delete(set);
    };
  }, [supported]);

  return <CameraContext.Provider value={state}>{children}</CameraContext.Provider>;
}
