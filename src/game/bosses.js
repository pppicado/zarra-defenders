// game/bosses.js
//
// Boss lifecycle state machine (per boss-system spec).
//
// States:
//   IDLE             -> no boss active
//   ENTRY            -> 2 s entry, invulnerable, HUD shows STRINGS.bosses[id].label
//   INVULNERABLE     -> invulnerable phase between vulnerable windows
//   SPECIAL_TELL     -> 1 s+ visual tell before each special move
//   VULNERABLE       -> damage-accepting windows (design-tunable duration)
//   DESACTIVACION    -> hp=0; no explosion, just desaturation + motion stop
//
// In v1 the boss FSM is mostly driven by elapsed timers since the boss
// is a static-ish mesh in the arena. The render module reads
// `bosses.current` for the boss banner label and shake state.
//
// A7 — all 5 bosses use desactivacion uniformly (topadora,
// tubo_lixiviado, incineradora, trailer, planta_treco). The
// desactivacion path is dispatched via `dispatcher.emit(
// 'zarra:desactivacion', bossGroup)` from `enemies.js destroyEnemy()`,
// not by this module — this FSM only manages ENTRY / INVULNERABLE /
// VULNERABLE / SPECIAL_TELL and hands off to the renderer for the
// actual desaturation.

import { state } from "./state.js";
import { STRINGS } from "../content/data.js";
import { MECANICA } from "../content/data.js";

const ENTRY_SEC         = MECANICA.bossEntrySec;     // 2
const VULNERABLE_SEC    = MECANICA.vulnerableSec;    // 4
const INVULNERABLE_SEC  = MECANICA.invulnerableSec;  // 3

export const bosses = {
  current: null,            // boss group reference
  state: "IDLE",            // IDLE | ENTRY | INVULNERABLE | SPECIAL_TELL | VULNERABLE | DESACTIVACION
  stateT: 0,                // seconds in current state
  windowIndex: 0,           // 0..2
  hitCount: 0,              // shots during current window
  maxHp: 0,
  hp: 0,
  pendingWindow: null,
};

const bossBannerEl = () => document.getElementById("boss-banner");
const bossBannerTextEl = () => document.getElementById("boss-banner-text");

/**
 * Begin a boss fight. `bossId` is the registry id (e.g., 'topadora',
 * 'planta_treco'). Sets the boss group, max HP, and enters ENTRY.
 */
export function start(bossId, bossGroup) {
  bosses.current = bossGroup;
  bosses.maxHp = bossGroup.userData.hp || 10;
  bosses.hp = bosses.maxHp;
  bosses.windowIndex = 0;
  bosses.hitCount = 0;
  bosses.state = "ENTRY";
  bosses.stateT = 0;

  // Show boss label banner.
  const label = getBossLabel(bossId);
  const banner = bossBannerEl();
  const text = bossBannerTextEl();
  if (banner && text) {
    text.textContent = label;
    banner.setAttribute("data-state", "visible");
  }
}

/**
 * Register a successful shot on the active boss. Only consumes HP if
 * the boss is in a VULNERABLE state. Returns true if the shot was
 * registered.
 */
export function registerHit() {
  if (!bosses.current) return false;
  if (bosses.state !== "VULNERABLE") {
    // Shots during invulnerable phases are visual-only (per spec
    // §Shot during invulnerable phase). We play a "no damage" cue
    // via the crosshair flash staying white and a brief rejected
    // SFX.
    return false;
  }
  bosses.hp -= 1;
  bosses.hitCount += 1;
  if (bosses.hp <= 0) {
    enterDesactivacion();
  }
  return true;
}

export function isVulnerable() {
  return bosses.state === "VULNERABLE";
}

/**
 * Per-frame update — advances the boss FSM timer.
 */
export function update(dt) {
  if (!bosses.current) return;
  if (state.paused) return;
  bosses.stateT += dt;

  switch (bosses.state) {
    case "ENTRY":
      if (bosses.stateT >= ENTRY_SEC) {
        bosses.state = "INVULNERABLE";
        bosses.stateT = 0;
      }
      break;
    case "INVULNERABLE":
      if (bosses.stateT >= 1.5) {
        bosses.state = "SPECIAL_TELL";
        bosses.stateT = 0;
      }
      break;
    case "SPECIAL_TELL":
      if (bosses.stateT >= 1.0) {
        // After the tell, open the vulnerable window.
        bosses.state = "VULNERABLE";
        bosses.stateT = 0;
      }
      break;
    case "VULNERABLE":
      // After the vulnerable window closes, advance to the next
      // INVULNERABLE phase. The boss FSM loops indefinitely — only
      // HP depletion (handled by registerHit -> enterDesactivacion)
      // ends the fight. If the player can't defeat the boss in time,
      // they lose lives via the standard "enemy reaches the camera"
      // path and eventually game-over.
      if (bosses.stateT >= VULNERABLE_SEC) {
        bosses.windowIndex += 1;
        bosses.state = "INVULNERABLE";
        bosses.stateT = 0;
      }
      break;
    case "DESACTIVACION":
      // The desaturation + motion-stop happens in enemies.js when hp
      // hits 0 (via the A7 lifecycle flag). Here we just transition
      // the FSM and hide the banner.
      hideBanner();
      bosses.current = null;
      bosses.state = "IDLE";
      break;
  }
}

function enterDesactivacion() {
  bosses.state = "DESACTIVACION";
  bosses.stateT = 0;
  // The actual desaturation + motion-stop is driven by enemies.js
  // destroyEnemy() when hp hits 0 (lifecycle === 'desactivacion').
  // We just transition the FSM here; the dispatcher event is fired
  // from enemies.js so other modules can listen.
  hideBanner();
}

function hideBanner() {
  const banner = bossBannerEl();
  if (banner) banner.setAttribute("data-state", "hidden");
}

function getBossLabel(bossId) {
  const map = {
    topadora:     "topadora",
    tuberia:      "tuberia",
    tubo_lixiviado: "tuberia",
    incineradora: "incineradora",
    trailer:      "trailer",
    planta_treco: "planta_treco",
  };
  const key = map[bossId] || bossId;
  return (STRINGS.bosses[key] && STRINGS.bosses[key].label) || bossId;
}