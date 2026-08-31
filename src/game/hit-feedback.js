// game/hit-feedback.js
//
// Crosshair flash (white->red on hit, ~80 ms), enemy mesh flash (white,
// 80 ms), boss screen-shake (amp scales with combo), master volume +
// mute.
//
// Per hit-feedback spec §No Particles in v1, this module owns ALL
// visual feedback for hits — no particles anywhere.
//
// The screen-shake state is the object read by engine/render.js — we
// expose it via `bindShakeState` in engine/render.js so the engine
// stays ignorant of game modules.
//
// A8 — any debug logging in this module MUST go through
// `__zarra.{log,warn,error}` from engine/dom.js, never bare
// `console.*`. The verify.sh check enforces this.

import * as audio from "../engine/audio.js";
import { __zarra } from "../engine/dom.js";

const crosshairEl = () => document.getElementById("crosshair");

let flashTimer = 0;            // seconds remaining on the crosshair flash
const FLASH_MS = 80 / 1000;

// ---- Screen-shake state (read by engine/render.js) -------------------

export const shake = {
  amp: 0,
  decay: 0,
  phase: 0,
};

// ---- Public API -------------------------------------------------------

/**
 * Notify hit-feedback of a successful shot. `isBoss` flips on the
 * screen-shake driver; `combo` scales the shake amplitude.
 */
export function onHit({ isBoss = false, combo = 1 }) {
  // Crosshair flash
  const el = crosshairEl();
  if (el) {
    el.classList.add("crosshair-hit");
    flashTimer = FLASH_MS;
  }
  if (isBoss) {
    // Boss shake amp scales with combo, capped at 0.25 m.
    shake.amp = Math.min(0.25, 0.04 + 0.04 * combo);
    shake.decay = 0.2;        // 200 ms settle per spec
  }
}

/**
 * Per-frame update. Clears the flash class after 80 ms and decays
 * the shake amplitude in `engine/render.js`.
 */
export function update(dt) {
  if (flashTimer > 0) {
    flashTimer -= dt;
    if (flashTimer <= 0) {
      flashTimer = 0;
      const el = crosshairEl();
      if (el) el.classList.remove("crosshair-hit");
    }
  }
}

/**
 * Flash an enemy mesh white for 80 ms. The flash is additive — the
 * material's emissive is briefly set to 1, then restored. Per spec
 * §Rapid successive hits: retrigger on every hit.
 */
const enemyFlashTimers = new WeakMap();

export function flashEnemy(mesh) {
  if (!mesh || !mesh.material) return;
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  // Snapshot base colors once per mesh so we can restore accurately.
  let snap = enemyFlashTimers.get(mesh);
  if (!snap) {
    snap = mats.map((m) => m.color ? m.color.clone() : null);
    enemyFlashTimers.set(mesh, snap);
  }
  for (const m of mats) {
    if (m && m.color) m.color.set(0xffffff);
  }
  setTimeout(() => {
    mats.forEach((m, i) => {
      if (m && m.color && snap[i]) m.color.copy(snap[i]);
    });
  }, 80);
}

// ---- Volume + mute (per hit-feedback spec §Master Volume + Mute) -----

const VOLUME_STEP = 0.05;
const VOLUME_MIN = 0;
const VOLUME_MAX = 1;

export function bumpVolume(dir) {
  const v = audio.getMasterVolume();
  const next = Math.max(VOLUME_MIN, Math.min(VOLUME_MAX, v + dir * VOLUME_STEP));
  audio.setMasterVolume(next);
  // Update HUD via document (no import of HUD module here — circular
  // risk).
  const hud = document.getElementById("hud-vol");
  if (hud) hud.textContent = `${Math.round(next * 100)}%`;
  __zarra.log("hit-feedback: master volume ->", next);
}

export function toggleMute() {
  const m = audio.isMuted();
  audio.setMuted(!m);
  const el = document.getElementById("hud-mute");
  if (el) el.setAttribute("data-state", !m ? "muted" : "unmuted");
  __zarra.log("hit-feedback: mute ->", !m);
}

// Initialise: bind our shake state to the render module.
import("../engine/render.js").then((r) => r.bindShakeState(shake));