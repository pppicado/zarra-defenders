// game/wire-updates.js
//
// Wires every game module's per-frame `update(dt)` through the
// dispatcher bus. Without this, `engine/loop.js` ticks every frame but
// `loop.updateCallbacks` stays empty — the scene renders but nothing
// inside it moves (no wave progression, no enemy motion, no HUD update,
// no camera shake decay, no reload timer, no combo decay).
//
// Per design D2 ("one game module per spec, decoupled via the bus"),
// each game module owns its per-frame logic and exports an `update(dt)`.
// This module is the single place that tells the dispatcher to call
// them every frame.
//
// Idempotent: safe to call more than once.
//
// Lazy imports so the engine layer can boot before any game module
// loads. The dispatcher handles the dynamic-import ordering on its
// end too (it loads `engine/loop.js` lazily to register the
// per-frame tick).

let wired = false;

export function wireGameUpdates() {
  if (wired) return;
  wired = true;

  // The dispatcher proxies `onUpdate` -> `loop.onUpdate`. We import
  // each game module lazily and register its `update` synchronously
  // (the module's top-level code runs on first import, including any
  // listener wiring like `d.on("zarra:desactivacion", ...)`).
  Promise.all([
    import("./dispatcher.js"),
    import("./waves.js"),
    import("./enemies.js"),
    import("./bosses.js"),
    import("./hit-feedback.js"),
    import("./powerups.js"),
    import("./ammo.js"),
    import("./hud.js"),
    import("./scoring.js"),
  ]).then(([d, waves, enemies, bosses, hitFeedback, powerups, ammo, hud, scoring]) => {
    d.onUpdate(waves.update);
    d.onUpdate(enemies.update);
    d.onUpdate(bosses.update);
    d.onUpdate(hitFeedback.update);
    d.onUpdate(powerups.update);
    d.onUpdate(ammo.update);
    d.onUpdate(hud.update);
    d.onUpdate(scoring.update);
  });
}
