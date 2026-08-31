// engine/scene.js
//
// Three.js scene/camera/renderer setup. Level-agnostic — owns the
// canonical scene graph the level modules mutate. Per design D1/D3 the
// engine layer exposes `scene`, `camera`, `renderer`, and `dispose()`.
//
// The scene is an empty THREE.Scene; levels are responsible for adding
// their background models (trees, buildings) into it.

import { getCanvas } from "./dom.js";

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b6c6);  // saturated daytime blue, per plan §6
scene.fog = new THREE.Fog(0x87b6c6, 30, 220);

// First-person camera anchored at the player's shoulder. Position is set
// by the active level (each level may have a different rail spawn point).
export const camera = new THREE.PerspectiveCamera(
  72,                                          // fov
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 1.6, 0);                // ~ eye height (1.6 m)

const renderer = new THREE.WebGLRenderer({
  canvas: getCanvas(),
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);

// One global ambient light is enough for the low-poly flat-color look
// (per plan §6 — Lambert/Phong simple, no textured lights). Levels may
// add directional lights of their own to set time-of-day mood.
const ambient = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambient);

// Resize handler keeps the canvas crisp on window resize.
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

/**
 * Frees WebGL resources. Call when returning to the menu so the next
 * session starts clean (per pause-menu / game-over-flow restart
 * semantics).
 */
export function dispose() {
  renderer.dispose();
  scene.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });
}

export { renderer };