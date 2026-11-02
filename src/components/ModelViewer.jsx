import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, Stage, useGLTF, useProgress } from "@react-three/drei";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { buildCameraModel } from "./camera/CameraModel";
import { screenTexture } from "./camera/ScreenTexture";

const CAMERA_BODY_W = 13.4; // the procedural body's width (cm)
const VIEW = new THREE.Vector3(2.4, 1.5, 3.4).normalize(); // three-quarter view from a little above

// Stands the site's procedural camera where the GLB marks a camera mount (extras.cameraMount on the joint that
// carries it: position, width), lens toward +z, showing `lcd` on its rear screen.
function mountCamera(root, lcd) {
  const mounts = [];
  root.traverse((o) => o.userData.cameraMount && mounts.push(o));
  for (const o of mounts) {
    const { position, width } = o.userData.cameraMount;
    const { model, lcdMat } = buildCameraModel();
    lcdMat.map = screenTexture(lcd, "adamzhang.org", "");
    model.position.fromArray(position); // replaces its centring: built, its origin is the body's bottom centre
    model.scale.setScalar(width / CAMERA_BODY_W);
    model.rotation.y = Math.PI; // its lens points -z
    o.add(model);
  }
}

// The GLB's joints (extras.joint on a node: label, type slide | turn, axis, range in metres or radians, and step,
// its control's place in Play), as controls: joints sharing a label move together, each control running 0…1
// through every one of its joints' ranges. `rest` is where they all sit at 0, the CAD's own pose; the first joint's
// range and step are the control's.
function controlsOf(root) {
  const controls = [];
  root.traverse((o) => {
    const j = o.userData.joint;
    if (!j) return;
    o.userData.rest = { position: o.position.clone(), quaternion: o.quaternion.clone() };
    let c = controls.find((x) => x.label === j.label);
    if (!c) controls.push((c = { label: j.label, type: j.type, range: j.range, step: j.step ?? 1, rest: -j.range[0] / (j.range[1] - j.range[0]), joints: [] }));
    c.joints.push(o);
  });
  return controls;
}

const axis = new THREE.Vector3(), turn = new THREE.Quaternion();
function pose(control, t) {
  for (const o of control.joints) {
    const { type, range } = o.userData.joint, v = range[0] + (range[1] - range[0]) * t;
    axis.fromArray(o.userData.joint.axis).normalize();
    if (type === "slide") o.position.copy(o.userData.rest.position).addScaledVector(axis, v);
    else o.quaternion.copy(o.userData.rest.quaternion).multiply(turn.setFromAxisAngle(axis, v));
  }
}

// The model's true bounds, instances included. Box3.setFromObject boxes each part's rotated box (half again too
// big on some of these GLBs) or, precise, skips instance transforms. Every 4th vertex is plenty for framing.
function bounds(obj) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), w = new THREE.Matrix4();
  obj.traverse((o) => {
    if (!o.isMesh) return;
    const pos = o.geometry.attributes.position;
    for (let k = 0; k < (o.isInstancedMesh ? o.count : 1); k++) {
      if (o.isInstancedMesh) {
        o.getMatrixAt(k, m);
        w.multiplyMatrices(o.matrixWorld, m);
      } else w.copy(o.matrixWorld);
      for (let i = 0; i < pos.count; i += 4) box.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(w));
    }
  });
  return box;
}

// Loads the GLB, mounts the procedural camera if it has a mount, centres it on the origin and reports its bounds at
// rest, its controls, and how far each control reaches across its travel (each a box about that centre).
function Model({ src, lcd, values, onReady }) {
  const { scene } = useGLTF(src);
  const invalidate = useThree((s) => s.invalidate);
  const loaded = useMemo(() => {
    const r = scene.clone();
    if (lcd) mountCamera(r, lcd);
    const controls = controlsOf(r);
    const rest = bounds(r);
    const centre = rest.getCenter(new THREE.Vector3()).negate();
    for (const c of controls) {
      c.reach = rest.clone();
      for (const t of [0, 1]) {
        pose(c, t);
        c.reach.union(bounds(r));
      }
      pose(c, c.rest);
      c.reach.translate(centre);
    }
    r.position.copy(centre);
    return { root: r, controls, rest: rest.translate(centre) };
  }, [scene, lcd]);
  useEffect(() => onReady(loaded), [onReady, loaded]);
  useLayoutEffect(() => {
    if (!values) return;
    loaded.controls.forEach((c, i) => pose(c, values[i]));
    invalidate();
  }, [loaded, values, invalidate]);
  return <primitive object={loaded.root} />;
}

// Frames the model so it stays whole at every turn: fits the cylinder `box` sweeps about its vertical axis, seen from
// VIEW. (Stage's own fit sizes the box at its centre's depth, so a deep model's near face spills out.) The first box
// sets the view outright; later ones (the parts moving) ease the camera to them, then let go. Zoom runs from in
// to a sixth of that framing out to all of the model's reach; zooming toward the cursor moves the target, which
// drifts back once the view is out at the full framing again.
function fitDistance(size, fov, aspect) {
  const r = Math.hypot(size.x, size.z) / 2, half = (fov * Math.PI) / 360; // turning radius; half the vertical fov
  const tall = (size.y / 2) * Math.hypot(VIEW.x, VIEW.z) + r * VIEW.y; // half its height on screen, tilted toward us
  return 1.1 * Math.max(r / Math.sin(Math.atan(Math.tan(half) * aspect)), tall / Math.sin(half));
}

function Fit({ box, reach }) {
  const get = useThree((s) => s.get);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const goal = useRef(null); // { target, distance, easing }
  const framed = useRef(false);
  useFrame(({ camera, controls, invalidate }) => {
    const g = goal.current;
    if (!g || !controls) return;
    const t = controls.target, d = controls.getDistance();
    if (g.easing) {
      const dir = camera.position.clone().sub(t).normalize();
      t.lerp(g.target, 0.12);
      camera.position.copy(t).addScaledVector(dir, d + (g.distance - d) * 0.12);
      if (t.distanceTo(g.target) < g.distance * 1e-3 && Math.abs(g.distance - d) < g.distance * 1e-3) g.easing = false;
    } else if (d >= g.distance * 0.95 && t.distanceTo(g.target) > g.distance * 1e-4) t.lerp(g.target, 0.12);
    else return;
    controls.update();
    invalidate();
  });
  useLayoutEffect(() => {
    if (!box) return;
    const { camera, controls } = get();
    const target = box.getCenter(new THREE.Vector3()), distance = fitDistance(box.getSize(new THREE.Vector3()), camera.fov, aspect);
    const far = fitDistance(reach.getSize(new THREE.Vector3()), camera.fov, aspect) * 1.2;
    camera.near = distance / 100;
    camera.far = far * 10;
    camera.updateProjectionMatrix();
    if (controls) {
      controls.minDistance = distance / 6;
      controls.maxDistance = Math.max(distance, far);
    }
    goal.current = { target, distance, easing: framed.current };
    if (framed.current) return;
    framed.current = true;
    camera.position.copy(VIEW).multiplyScalar(distance).add(target);
    controls?.target.copy(target);
    controls?.update();
  }, [box, reach, get, aspect]);
  return null;
}

// Shows a control's value in its first joint's units.
function readout(c, t) {
  const v = c.range[0] + (c.range[1] - c.range[0]) * t;
  return c.type === "slide" ? `${Math.round(v * 1000)} mm` : `${Math.round((v * 180) / Math.PI)}°`;
}

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

// A row per control (a range input and its reading), then Play (the controls out to the end of their travel, step
// by step, and back in reverse order) and Reset.
function Controls({ controls, values, onChange, label }) {
  const run = useRef(0);
  useEffect(() => () => cancelAnimationFrame(run.current), []);
  const set = (vs) => {
    cancelAnimationFrame(run.current);
    onChange(vs);
  };
  const play = () => {
    const steps = [...new Set(controls.map((c) => c.step))].sort((a, b) => a - b);
    const plan = [...steps.map((s) => [s, true]), null, ...steps.toReversed().map((s) => [s, false])]; // null: hold
    const move = steps.length > 1 ? 1100 : 1400, hold = 500;
    let i = 0, t0 = performance.now(), from = values, now = values;
    cancelAnimationFrame(run.current);
    const step = (time) => {
      const p = plan[i], length = p ? move : hold, k = ease(Math.min(1, (time - t0) / length));
      if (p) {
        now = controls.map((c, j) => (c.step === p[0] ? from[j] + ((p[1] ? 1 : c.rest) - from[j]) * k : now[j]));
        onChange(now);
      }
      if (time - t0 >= length) {
        i++;
        t0 = time;
        from = now;
        if (i === plan.length) return;
      }
      run.current = requestAnimationFrame(step);
    };
    run.current = requestAnimationFrame(step);
  };
  const atRest = controls.every((c, i) => Math.abs(values[i] - c.rest) < 1e-3);
  return (
    <div className="mt-3 grid gap-2.5" role="group" aria-label={`Move the parts of the ${label}`}>
      {controls.map((c, i) => (
        <label key={c.label} className="grid grid-cols-[76px_minmax(0,1fr)_60px] items-center gap-3 text-sm text-[#F2EFF7]">
          {c.label}
          <input type="range" min="0" max="1" step="0.001" value={values[i]} aria-valuetext={readout(c, values[i])} className="w-full accent-[#8A55E6]" onChange={(e) => set(values.map((v, k) => (k === i ? +e.target.value : v)))} />
          <span className="text-right font-['JetBrains_Mono',ui-monospace,monospace] text-xs tabular-nums text-[#A8A3B3]">{readout(c, values[i])}</span>
        </label>
      ))}
      <div className="flex gap-2">
        <button type="button" className="btn small" onClick={play}>
          Play
        </button>
        <button type="button" className="btn small disabled:opacity-40" disabled={atRest} onClick={() => set(controls.map((c) => c.rest))}>
          Reset
        </button>
      </div>
    </div>
  );
}

// What the models reflect: a neutral softbox studio (overhead key, side strips, a rim behind, a floor bounce) in a
// dim grey room, so bare metal picks up soft greys rather than black. Built here rather than fetched.
function Studio() {
  return (
    <Environment resolution={256}>
      <color attach="background" args={["#34343a"]} />
      <Lightformer intensity={1.6} position={[0, 6, 2]} scale={[10, 4, 1]} />
      <Lightformer intensity={1} position={[-6, 1, 2]} scale={[3, 9, 1]} />
      <Lightformer intensity={1.2} position={[6, 1, -1]} scale={[3, 9, 1]} />
      <Lightformer intensity={0.7} position={[0, 2, -7]} scale={[8, 3, 1]} />
      <Lightformer intensity={0.35} position={[0, -6, 0]} scale={[12, 12, 1]} />
    </Environment>
  );
}

// OrbitControls claims every touch on the element it listens to (touch-action: none); give vertical swipes back to
// the page so it still scrolls over the model. The cursor is an open hand over it, closed while dragging.
function PointerStyle() {
  const controls = useThree((s) => s.controls);
  useEffect(() => {
    const el = controls?.domElement;
    if (!el) return;
    el.style.setProperty("touch-action", "pan-y");
    el.style.setProperty("cursor", "grab");
    const down = () => el.style.setProperty("cursor", "grabbing");
    const up = () => el.style.setProperty("cursor", "grab");
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [controls]);
  return null;
}

function Progress() {
  const { progress } = useProgress();
  return (
    <span className="absolute inset-0 grid place-items-center font-['JetBrains_Mono',ui-monospace,monospace] text-xs tracking-[.04em] text-[#A8A3B3]" aria-hidden="true">
      {Math.round(progress)}%
    </span>
  );
}

/* A GLB on a studio stage. Drag to turn it; scroll or pinch over it to zoom toward the pointer (no pan). Vertical
   swipes still scroll the page. It turns slowly on its own (unless the visitor prefers reduced motion) until its
   parts are moved, and stops drawing while off screen. A GLB with joints gets controls below it; one with a camera
   mount carries the site's procedural camera, `lcd` on its screen. */
export default function ModelViewer({ src, label, lcd, active = true }) {
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");
  const touch = useMediaQuery("(pointer: coarse)");
  const [handled, setHandled] = useState(false); // the hint fades once the model's been turned or zoomed
  const [loaded, setLoaded] = useState(null);
  const [moved, setMoved] = useState(null); // control values once the visitor moves something
  const values = moved ?? loaded?.controls.map((c) => c.rest);
  // Frame what the parts reach as they move: the rest box, grown toward each control's reach by how far it's out.
  const [box, reach] = useMemo(() => {
    if (!loaded) return [null, null];
    const box = loaded.rest.clone(), reach = loaded.rest.clone();
    loaded.controls.forEach((c, i) => {
      const out = Math.abs(values[i] - c.rest) / Math.max(c.rest, 1 - c.rest);
      box.union(new THREE.Box3(loaded.rest.min.clone().lerp(c.reach.min, out), loaded.rest.max.clone().lerp(c.reach.max, out)));
      reach.union(c.reach);
    });
    return [box, reach];
  }, [loaded, values]);
  return (
    <div>
      <div role="img" aria-label={label} className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#2A2A33] bg-[#111115]" onPointerDown={() => setHandled(true)} onWheel={() => setHandled(true)}>
        <Canvas dpr={[1, 2]} gl={{ toneMapping: THREE.NeutralToneMapping }} frameloop={active && !still ? "always" : "demand"} camera={{ fov: 35 }}>
          <Suspense fallback={null}>
            {/* Model centres itself and Fit frames it, on bounds that count the GLBs' instanced parts properly */}
            <Stage adjustCamera={false} shadows={false} preset="soft" intensity={0.4} environment={null} center={{ disable: true }}>
              <Model src={src} lcd={lcd} values={values} onReady={setLoaded} />
            </Stage>
          </Suspense>
          <Studio />
          <Fit box={box} reach={reach} />
          <OrbitControls makeDefault enablePan={false} zoomToCursor autoRotate={!still && !moved} autoRotateSpeed={0.8} />
          <PointerStyle />
        </Canvas>
        {!loaded && <Progress />}
        {loaded && (
          <span className={`pointer-events-none absolute bottom-3 left-3 rounded-md bg-[#08080A]/75 px-2 py-1 font-['JetBrains_Mono',ui-monospace,monospace] text-[11px] text-[#A8A3B3] transition-opacity duration-500 ${handled ? "opacity-0" : "opacity-100"}`} aria-hidden="true">
            Drag to turn · {touch ? "Pinch" : "Scroll"} to zoom
          </span>
        )}
      </div>
      {loaded?.controls.length > 0 && <Controls controls={loaded.controls} values={values} onChange={setMoved} label={label.replace(/^3D model of (the )?/, "")} />}
    </div>
  );
}
