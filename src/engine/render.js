// engine/render.js
//
// Per-frame render call + camera-shake driver. Per design D3 the loop is
// pause-aware — this module reads the shake state from hit-feedback and
// applies it to the camera, but never advances game state.
//
// The shake state is a single object {amp, decay, phase} shared with
// hit-feedback (game/hit-feedback.js). We import it lazily so
// engine/render.js can be loaded before hit-feedback is initialised.

import { scene, camera, renderer } from "./scene.js";

let shake = {
  amp: 0,            // peak amplitude (world units, ~metres)
  decay: 0,          // seconds remaining before shake stops
  phase: 0,          // animation phase (radians)
};

const seedRand = () => Math.random() * 2 - 1;

/**
 * Register the shake state object. Called once by main.js after
 * hit-feedback is loaded — keeps the engine layer ignorant of game
 * modules.
 */
export function bindShakeState(state) {
  shake = state;
}

const _tmpCameraPos = new THREE.Vector3();

/**
 * Per-frame render. Called by engine/loop.js. Returns nothing.
 *
 * If shake is active, the camera position is perturbed by `amp` along
 * x/y, decaying linearly to 0 over `decay` seconds. The shake never
 * affects `camera.position` permanently — we restore the player's "rest"
 * position before adding the perturbation each frame.
 *
 * `restPos` is the camera's "intended" position for this frame, set by
 * the level module (rails movement). When shake is zero, this is the
 * value the camera gets.
 */
let restPos = null;

export function setRestPosition(x, y, z) {
  if (!restPos) restPos = new THREE.Vector3(x, y, z);
  else restPos.set(x, y, z);
}

export function render(dt) {
  if (restPos) {
    camera.position.copy(restPos);
  }

  // Apply shake if active. We don't mutate shake.amp directly — the
  // hit-feedback module owns its lifecycle.
  if (shake.amp > 0 && shake.decay > 0) {
    shake.decay -= dt;
    if (shake.decay < 0) shake.decay = 0;
    const k = shake.amp * (shake.decay > 0 ? shake.decay : 0);
    shake.phase += dt * 60;
    const offX = Math.sin(shake.phase * 13.0) * k;
    const offY = Math.cos(shake.phase * 17.0) * k;
    camera.position.x += offX;
    camera.position.y += offY;
  }

  renderer.render(scene, camera);
}