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