// game/ammo.js
//
// 12-round magazine + 1.2s auto-reload + manual `R` reload (per
// ammo-system spec). Firing is blocked during reload. Reload click
// plays once at the moment the magazine fills.
//
// Connects to `engine/input.js` (registers an onReload callback) and to
// `engine/audio.js` (plays the click SFX). Also exposes `tryFire()` for
// the enemies hit-test loop.

import * as input from "../engine/input.js";
import * as audio from "../engine/audio.js";
import { MECANICA } from "../content/data.js";
import { state } from "./state.js";

const MAG_SIZE   = MECANICA.magazineSize;     // 12
const RELOAD_SEC = MECANICA.reloadSec;        // 1.2

export const ammo = {
  current: MAG_SIZE,
  reloading: false,
  reloadT: 0,                                 // seconds remaining
};

// ---- Public API -------------------------------------------------------

/**
 * Attempt to fire a shot. Returns `true` if a shot was consumed,
 * `false` if the shot was blocked (13th shot, or mid-reload).
 */
export function tryFire() {
  if (ammo.reloading) return false;           // ammo-system §Player fires during reload
  if (ammo.current <= 0) {
    // Spec allows a "dry fire" click. We skip the SFX to keep v1 lean.
    return false;
  }
  ammo.current -= 1;
  audio.playFire();

  if (ammo.current === 0) {
    // 1.2s auto-reload timer starts (per ammo-system §1.2s Auto-Reload)
    startReload();
  }
  return true;
}

/**
 * Trigger a manual reload (R key). If already reloading, do not
 * restart the timer (per ammo-system §Manual reload during active
 * auto-reload).
 */
export function startReload() {
  if (ammo.reloading) return;
  if (ammo.current === MAG_SIZE) return;       // already full
  ammo.reloading = true;
  ammo.reloadT = RELOAD_SEC;
}

/**
 * Per-frame update. Called from the dispatcher.
 */
export function update(dt) {
  if (!ammo.reloading) return;
  ammo.reloadT -= dt;
  if (ammo.reloadT <= 0) {
    ammo.reloading = false;
    ammo.reloadT = 0;
    ammo.current = MAG_SIZE;
    audio.playReload();
  }
}

/**
 * Reset to full magazine. Used on level start + retry (per ammo-system
 * §Ammo Does Not Persist Across Levels).
 */
export function reset() {
  ammo.current = MAG_SIZE;
  ammo.reloading = false;
  ammo.reloadT = 0;
}

// ---- Wire `R` key -----------------------------------------------------

input.onReload(() => startReload());