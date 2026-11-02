# models-src

CAD exports the 3D models are built from. Local only (gitignored, 25–110 MB each); only this README is tracked.

| File | Exported from | Shown on |
| --- | --- | --- |
| `robot-2022.glb` | Fusion → Blender | Experience → FTC, 2022–23 |
| `robot-2023.glb` | Fusion → Blender | Experience → FTC, 2023–24 |
| `robot-2024.glb` | Fusion → Blender | Experience → FTC, 2024–25 |
| `slider.glb` | Onshape (AXI6 Slider, pan only) | Projects → AXI6 |

After replacing one: `npm run models <name>` then `npm run models:previews <name>`, e.g. `npm run models slider`.
See `scripts/models.mjs` for how materials are fixed up.
