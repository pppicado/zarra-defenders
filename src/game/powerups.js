// game/powerups.js
//
// Six civic-action power-ups = six runtime effects (per content-strings
// spec §6 Power-Ups Defined as Data + plan §5).
//
//   FIRMA         -> +1 vida
//   ALEGACION     -> escudo (3 s)
//   MANIFESTACION -> ralentiza el tiempo (5 s)
//   ALIANZA       -> x2 pts (10 s)
//   DATO          -> overlay con un dato real
//   HITO          -> 1UP al cruzar hitoUmbral (5.000 pts)
//
// All timers read from MECANICA. The HITO cadence is driven by score
// milestones; per spec §HITO cadence documented the threshold lives in
// content/data.js and is NEVER hard-coded here.
//
// A8 — any debug logging MUST go through __zarra.{log,warn,error}.

import { state } from "./state.js";
import { MECANICA } from "../content/data.js";
import { __zarra } from "../engine/dom.js";

/**
 * Apply a power-up by id. Called by enemies.js after an enemy is
 * destroyed (the enemy carries `powerupDrops: [...]`).
 */
export function apply(powerupId) {
  switch (powerupId) {
    case "firma":         return applyFirma();
    case "alegacion":     return applyAlegacion();
    case "manifestacion": return applyManifestacion();
    case "alianza":       return applyAlianza();
    case "dato":          return applyDato();
    case "hito":          return applyHito();
    default:
      __zarra.warn(`powerups: unknown id '${powerupId}'`);
      return false;
  }
}

function applyFirma() {
  state.lives += 1;
  return true;
}

function applyAlegacion() {
  state.shieldT = MECANICA.shieldSec;        // 3.0 s
  return true;
}

function applyManifestacion() {
  state.slowT = MECANICA.slowSec;            // 5.0 s
  return true;
}

function applyAlianza() {
  state.alianzaT = MECANICA.allianceSec;     // 10.0 s
  return true;
}

function applyDato() {
  // The data overlay is rendered by pedagogy.js. We just signal here
  // via the dispatcher event so the bus keeps modules decoupled.
  import("./dispatcher.js").then((d) => d.emit("zarra:dato-overlay", null));
  return true;
}

function applyHito() {
  // Defensive: enforce spec by reading from MECANICA.
  state.lives += 1;
  import("./dispatcher.js").then((d) => d.emit("zarra:hito", state.lives));
  return true;
}

/**
 * Per-frame update — advances the active timers. The dispatcher
 * handles pausing (we don't tick while paused).
 */
export function update(dt) {
  if (state.paused) return;
  if (state.shieldT > 0) state.shieldT = Math.max(0, state.shieldT - dt);
  if (state.slowT > 0)   state.slowT   = Math.max(0, state.slowT   - dt);
  if (state.alianzaT > 0) state.alianzaT = Math.max(0, state.alianzaT - dt);

  // HITO cadence — every hitoUmbral pts past the last milestone.
  const umbral = MECANICA.hitoUmbral;
  if (state.score >= state.lastHitoScore + umbral) {
    state.lastHitoScore = Math.floor(state.score / umbral) * umbral;
    applyHito();
  }
}

/**
 * Reset level-local power-up timers (lives reset is handled by
 * state.resetLevelLocal()).
 */
export function resetLevel() {
  state.shieldT = 0;
  state.slowT = 0;
  state.alianzaT = 0;
}