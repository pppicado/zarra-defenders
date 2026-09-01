// game/dispatcher.js
//
// Tiny event bus for the game layer. Decouples modules so each
// capability (waves, enemies, pedagogy, hud, powerups, ...) can
// signal state changes without importing the consumer.
//
// Per design D2: "One game module per spec... `dispatcher.js` is the
// new bus that lets spec modules stay decoupled."
//
// The bus carries events like:
//   - `zarra:desactivacion` - a boss was deactivated (A7)
//   - `zarra:dato-overlay`   - DATO power-up fired
//   - `zarra:hito`           - HITO 1UP fired
//
// Listeners register with `on(event, fn)` and receive the payload.
//
// A8 - debug logging (for handler errors) routes through __zarra.warn
// from engine/dom.js. We lazy-import the engine module to avoid a
// circular-import risk at module-load time.

const listeners = new Map();   // event -> Set<fn>

// Lazily-resolved __zarra handle. We bind it on first emit so the
// dispatcher can be imported before engine/dom.js is fully resolved.
let _zarra = null;

function getZarra() {
  if (_zarra) return _zarra;
  // Lazy require: falls back to a no-op warn() if engine/dom.js is
  // not yet available (rare; only during cyclic-init edge cases).
  return {
    warn: (...args) => {
      try {
        if (_zarra) { _zarra.warn(...args); return; }
      } catch (_) { /* swallow */ }
    },
  };
}

import("../engine/dom.js").then((dom) => { _zarra = dom.__zarra; }).catch(() => {});

/**
 * Emit `event` with `payload` to every registered listener. Listeners
 * are called synchronously in registration order; throwing handlers
 * are isolated (a single handler failure does not break the rest).
 */
export function emit(event, payload) {
  const set = listeners.get(event);
  if (!set) return;
  for (const fn of [...set]) {
    try { fn(payload); }
    catch (e) {
      getZarra().warn(`dispatcher: listener for ${event} threw:`, e);
    }
  }
}

/**
 * Register `fn` as a listener for `event`. Returns an unregister
 * function for symmetry.
 */
export function on(event, fn) {
  let set = listeners.get(event);
  if (!set) {
    set = new Set();
    listeners.set(event, set);
  }
  set.add(fn);
  return () => set.delete(fn);
}

/**
 * Drop every listener. Used in tests; production code should not
 * need it.
 */
export function reset() {
  listeners.clear();
}

// ---- Per-frame coordinator wiring ------------------------------------
//
// Keeps this module self-contained: the loop hookup registers here so
// game modules can register their per-frame `update(dt)` callbacks
// via the bus without each importing engine/loop.js directly.

const updateFns = [];
export function onUpdate(fn) { updateFns.push(fn); }

import("../engine/loop.js").then((loop) => {
  loop.onUpdate((dt) => {
    for (const fn of updateFns) {
      try { fn(dt); }
      catch (e) {
        getZarra().warn("dispatcher: per-frame update threw:", e);
      }
    }
  });
});

// ---- Level start / restart coordinator --------------------------------
//
// `startLevel(n, levelMod)` is the orchestrator invoked by
// `levels/registry.js` when the player clicks a level. It performs the
// data-screen spec sequence:
//
//   1. Show the pre-level dato screen (waits for the player to click
//      "Continuar").
//   2. Reset level-local state (lives, combo, timers).
//   3. Run `levelMod.start()` to decorate the scene + configure waves.
//   4. Track the objects the level added to the scene so `restartLevel`
//      can clean them up on retry.
//   5. Emit `zarra:level-start` so HUD, scoring, pedagogy, etc. can
//      react without importing this module.
//
// `restartLevel()` re-runs the same sequence for the currently active
// level (used by Pause > Reiniciar and Game Over > Reintentar).
//
// Why snapshot `scene.children.length`: each level module adds models
// to the global scene via `scene.add(...)` from inside `decorateScene()`.
// Asking each level to return the list of objects it added would be a
// 5-file change; the snapshot trick is local to the dispatcher and
// keeps the level modules untouched.
//
// Why the pedagogy import is dynamic: pedagogy.js statically imports
// `engine/dom`, `engine/audio`, `content/data` only, but it dynamically
// imports THIS module to wire `zarra:dato-overlay`. Symmetric dynamic
// import here keeps the load graph acyclic.

import { startLevel as stateStartLevel, resetLevelLocal } from "./state.js";
import { scene } from "../engine/scene.js";

let _currentLevelMod = null;
let _currentLevelN = 0;
let _levelObjects = [];   // scene children added by the active level

/**
 * Start level `n` (1..5). Resolves after the dato screen closes and
 * the level scene has been decorated.
 */
export async function startLevel(n, levelMod) {
  _currentLevelN = n;
  _currentLevelMod = levelMod;

  // 1. Pre-level dato screen (resolves on "Continuar" click).
  const pedagogy = await import("./pedagogy.js");
  await pedagogy.showDatoScreen(n);

  // 2. Reset state + decorate scene + configure waves.
  stateStartLevel(n);
  const before = scene.children.length;
  levelMod.start();
  _levelObjects = scene.children.slice(before);

  emit("zarra:level-start", { n });
}

/**
 * Restart the currently active level. Removes the objects the previous
 * attempt added to the scene, re-shows the dato screen, and re-runs
 * `levelMod.start()`. No-op if no level is currently active.
 */
export async function restartLevel() {
  if (!_currentLevelMod) {
    getZarra().warn("dispatcher: restartLevel called before startLevel");
    return;
  }

  // Tear down the previously-added level objects before re-decorating.
  for (const obj of _levelObjects) {
    scene.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const ms = Array.isArray(obj.material) ? obj.material : [obj.material];
      ms.forEach((m) => m.dispose());
    }
  }
  _levelObjects = [];

  // Pre-level dato screen (same flow as a fresh start).
  const pedagogy = await import("./pedagogy.js");
  await pedagogy.showDatoScreen(_currentLevelN);

  resetLevelLocal();
  const before = scene.children.length;
  _currentLevelMod.start();
  _levelObjects = scene.children.slice(before);

  emit("zarra:level-restart", { n: _currentLevelN });
}

/**
 * Exit the current level back to the menu. Synchronous so the caller
 * (main.js showLevelSelect) can chain it before the user picks a new
 * level — the next `startLevel` snapshot must see a clean scene.
 *
 * Frees every geometry + material the active level added to the scene
 * and clears the dispatcher tracking. No-op if no level is active
 * (first time the player reaches the menu).
 *
 * Emits `zarra:level-exit` so HUD/scoring modules can clear
 * level-local UI (combo timer, score popup, etc.) without importing
 * the dispatcher or state.
 */
export function exitToMenu() {
  if (!_currentLevelMod) return;

  for (const obj of _levelObjects) {
    scene.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const ms = Array.isArray(obj.material) ? obj.material : [obj.material];
      ms.forEach((m) => m.dispose());
    }
  }
  _levelObjects = [];
  _currentLevelMod = null;
  _currentLevelN = 0;

  emit("zarra:level-exit");
}