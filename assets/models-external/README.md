# External 3D models — drop zone

This folder is where you place glTF (.gltf) or glb (.glb) files for the
3D models you'd like to replace the procedural ones with.

## How to add a model

1. Export your model from Blender (or Maya, etc.) as **glTF Binary (.glb)**
   for a single self-contained file. The asset stays under your control
   and the file is small.
2. Drop the file here. Examples of accepted filenames:
   - `topadora.glb`          — replaces the level-1 boss
   - `camion_treco.glb`       — replaces the basic enemy
   - `encina.glb`             — replaces the holm oak tree
   - `planta_treco.glb`       — replaces the level-5 boss
   - Any name you want, as long as you tell me which factory to swap it into.
3. Tell me which model you want replaced (e.g. "use `topadora.glb` for
   the boss of level 1") and I'll wire it in. The factory will look like:

   ```js
   // src/content/models/enemies/topadora.js (after swap)
   import { loadGltf, applyOpts } from "../_loader.js";
   import { applyTransform } from "../../../engine/model-transform.js";

   export async function makeTopadora(opts = {}) {
     const group = await loadGltf("/assets/models-external/topadora.glb");
     applyOpts(group, opts);
     applyTransform(group, opts);
     group.userData = {
       hp: 5,
       puntosKey: "topadora",
       powerupDrops: ["manifestacion", "dato"],
     };
     return group;
   }
   ```

   Note the `async` — the factory now returns a Promise. Enemies.js
   already `await`s factory.make() so the chain keeps working.

## What survives the swap

- The factory still returns a `THREE.Group`.
- `userData.hp`, `userData.puntosKey`, `userData.powerupDrops`,
  `userData.isBoss`, `userData.lifecycle` are set the same way, so all
  gameplay logic (hit detection, scoring, boss FSM, A7 desactivacion)
  keeps working unchanged.
- The wave scheduler doesn't know or care whether the model is
  procedural or glTF — it just calls `spawn(id)`.

## What you control in the model

- Vertex count (we try to stay under ~5000 triangles per level for
  low-end phones).
- Pivot position (the model's local origin should be at the bottom
  centre — we apply position offsets from the spawn call).
- Materials (Lambert/Phong/Standard — anything the loader handles).
- Animations: not yet wired, but the GLTFLoader parses animation
  clips so we can hook them up later if you want.

## Licensing

Anything you put here is your work (or work you've licensed). The game
shipped to GitHub Pages is public, so don't drop models whose license
prohibits redistribution.
