// game/scoring.js
//
// Per-enemy base points (drawn from STRINGS.enemigos.*.puntos) + combo
// multiplier up to x5, 2 s decay window. Miss does NOT reset combo.
//
// Per combo-scoring spec §Per-Enemy Base Points and §Combo Multiplier
// Cap:
//
//   base_pts = STRINGS.enemigos[id].puntos
//   if combo > cap: combo = cap
//   score += base_pts * combo
//   combo++ on success
//   comboT = 0 on success
//
// Decay: if comboT > comboDecay, on next hit reset combo to 1. Pause
// freezes the timer (per §Score Persistence Across Pause).
//
// Hit feedback (crosshair + enemy flash) is wired by hit-feedback.js;
// scoring.js calls `hitFeedbackCb({...})` after each successful shot.
// We don't import hit-feedback here — the dispatcher wires the callback
// in `initGame()` so scoring.js stays decoupled.

import { STRINGS, MECANICA } from "../content/data.js";
import { state } from "./state.js";
import { __zarra } from "../engine/dom.js";

const COMBO_CAP   = MECANICA.comboCap;        // 5
const COMBO_DECAY = MECANICA.comboDecay;      // 2.0 seconds

let hitFeedbackCb = null;
export function onHit(cb) { hitFeedbackCb = cb; }

/**
 * Register a successful hit on `enemyId` (the string id from the
 * registry). Returns the points awarded (after combo multiplier).
 *
 * Called from enemies.js on hit-test success.
 */
export function registerHit(enemyId) {
  const entry = STRINGS.enemigos[enemyId];
  let base = 0;
  if (entry && typeof entry.puntos === "number") {
    base = entry.puntos;
  } else {
    __zarra.warn(`scoring: unknown enemy id '${enemyId}', awarding 0`);
  }

  // Combo decay check (per spec §Hit exactly at the window edge)
  if (state.comboT >= COMBO_DECAY) {
    state.combo = 1;
  }
  let combo = state.combo;
  if (combo > COMBO_CAP) combo = COMBO_CAP;

  const factor = state.alianzaT > 0 ? MECANICA.alianzaFactor : 1;
  const awarded = base * combo * factor;
  state.score += awarded;

  state.combo = combo + 1;
  if (state.combo > COMBO_CAP) state.combo = COMBO_CAP;
  state.comboT = 0;
  state.hitsLanded += 1;

  if (hitFeedbackCb) hitFeedbackCb({ isBoss: false, combo: state.combo });
  return awarded;
}

/**
 * Called from the enemies module when the raycast missed every enemy.
 * Misses do NOT reset combo (per combo-scoring §Combo on Miss).
 */
export function registerMiss() {
  // intentionally no-op for the combo; let the decay timer do its job.
}

/**
 * Per-frame update. Advances the combo decay clock; freezes if paused.
 */
export function update(dt) {
  if (state.paused) return;
  state.comboT += dt;
}

/**
 * Pause entry. We snapshot comboT so resume doesn't include the
 * paused interval (per combo-scoring §Retry level resets combo but
 * keeps session score, and §Pause does not reset score).
 */
export function onPause() {
  state.pausedAt = state.comboT;
}
export function onResume() {
  // The pause offset is restored in update() when not paused — for
  // now, simple: just continue advancing from where we left off,
  // since we don't tick during pause.
  state.pausedAt = 0;
}

/**
 * Reset level-local combo only (per combo-scoring §Retry level resets
 * combo but keeps session score).
 */
export function resetCombo() {
  state.combo = 1;
  state.comboT = 0;
}