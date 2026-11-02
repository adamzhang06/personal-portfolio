// Whether this browser can draw WebGL at all (checked once; the probe context is released straight away).
let webgl;
export function hasWebGL() {
  if (webgl === undefined) {
    try {
      const gl = document.createElement("canvas").getContext("webgl2") || document.createElement("canvas").getContext("webgl");
      webgl = Boolean(gl);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl = false;
    }
  }
  return webgl;
}
