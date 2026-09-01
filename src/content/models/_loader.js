// content/models/_loader.js
//
// Helper for integrating user-provided 3D models in glTF / glb format
// (Blender, Maya, etc. export these natively). Three.js core doesn't
// ship loaders, so GLTFLoader is loaded globally from the CDN in
// index.html.
//
// Usage from a factory file:
//
//   import { loadGltf } from "./_loader.js";
//   export async function makeTopadora(opts = {}) {
//     const group = await loadGltf("/assets/models-external/topadora.glb");
//     applyTransform(group, opts);
//     group.userData = { hp: 5, puntosKey: "topadora", powerupDrops: [...] };
//     return group;
//   }
//
// Why this lives in its own module:
//   - Centralises the loader-instance so we don't fetch THREE.GLTFLoader
//     more than once.
//   - Returns a THREE.Group (not a THREE.Scene) so factories can use it
//     like any procedurally-built group (the loader wraps the scene's
//     root in a Group if the glTF has one root, or returns the first
//     child if it has multiple).
//   - Surfaces load failures through __zarra.warn (per A8: no
//     console.X outside engine/dom.js).

import { __zarra } from "../../engine/dom.js";

let _loader = null;
function getLoader() {
  if (_loader) return _loader;
  if (typeof THREE === "undefined" || !THREE.GLTFLoader) {
    throw new Error(
      "GLTFLoader: THREE.GLTFLoader is not available. Did index.html load the GLTFLoader script?"
    );
  }
  _loader = new THREE.GLTFLoader();
  return _loader;
}

/**
 * Load a glTF (.gltf) or glb (.glb) file from a URL.
 *
 * Resolves to a THREE.Group ready to be added to the scene. If the file
 * has a single root node the Group is the root; if it has multiple
 * roots they're wrapped in a new Group.
 *
 * @param {string} url - the URL of the model (relative to the page).
 * @returns {Promise<THREE.Group>}
 */
export function loadGltf(url) {
  return new Promise((resolve, reject) => {
    const loader = getLoader();
    loader.load(
      url,
      (gltf) => {
        // gltf.scene is a THREE.Scene or THREE.Group depending on
        // whether the file was exported with a single root.
        const root = gltf.scene;
        if (!root) {
          reject(new Error(`GLTFLoader: ${url} has no scene`));
          return;
        }
        // If it's already a Group, return it directly.
        if (root.isGroup) {
          resolve(root);
          return;
        }
        // Otherwise wrap in a Group.
        const wrap = new THREE.Group();
        wrap.name = root.name || "gltf-wrapper";
        wrap.add(root);
        resolve(wrap);
      },
      // Progress callback — no-op for now (could surface to a loader UI).
      undefined,
      (err) => {
        __zarra.warn(`GLTFLoader: failed to load ${url}:`, err);
        reject(err);
      }
    );
  });
}

/**
 * Apply user-provided opts (position, rotation, scale, variant) to a
 * loaded Group. Mirrors the contract of the procedural factories.
 */
export function applyOpts(group, opts = {}) {
  if (opts.position) {
    group.position.set(
      opts.position.x ?? 0,
      opts.position.y ?? 0,
      opts.position.z ?? 0
    );
  }
  if (opts.rotation) {
    group.rotation.set(
      opts.rotation.x ?? 0,
      opts.rotation.y ?? 0,
      opts.rotation.z ?? 0
    );
  }
  if (opts.scale) {
    if (typeof opts.scale === "number") {
      group.scale.setScalar(opts.scale);
    } else {
      group.scale.set(
        opts.scale.x ?? 1,
        opts.scale.y ?? 1,
        opts.scale.z ?? 1
      );
    }
  }
  if (opts.variant === "boss") {
    group.userData.isBoss = true;
  }
}
