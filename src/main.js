// main.js
//
// Bootstrap only — no game logic. Per openspec/config.yaml
// `modularity: strict` and design D1, this file is a wiring layer that
// imports the engine modules and (lazily) the level registry + game
// modules.
//
// Note: game + level modules are loaded via dynamic import so that the
// engine layer (Phase 1) compiles and runs without the rest of the game
// tree being present. Each click handler resolves its target on demand.

import * as input from "./engine/input.js";
import * as audio from "./engine/audio.js";
import * as loop from "./engine/loop.js";
import { setOverlayVisible } from "./engine/dom.js";
import { STRINGS } from "./content/data.js";
import * as ammo from "./game/ammo.js";
import * as enemies from "./game/enemies.js";
import { camera } from "./engine/scene.js";

// ---- HUD strings from STRINGS (data-strings attribute) -----------------

function bindString(el) {
  const key = el.getAttribute("data-strings");
  if (!key) return;
  const value = key.split(".").reduce((acc, k) => acc && acc[k], STRINGS);
  if (typeof value === "string") el.textContent = value;
}
document.querySelectorAll("[data-strings]").forEach(bindString);

// ---- First-click atomic gesture (A3) ----------------------------------

audio.initAudio();

function showStartError(msg) {
  const el = document.getElementById("start-error");
  if (el) {
    el.textContent = msg;
    el.setAttribute("data-state", "visible");
  }
}

input.onStartGesture(() => {
  // Step 1 — request pointer lock on desktop only. (A3)
  // Pointer Lock API is desktop-only; calling it on mobile either
  // throws or silently no-ops, and either way the player sees a
  // misleading "no se pudo bloquear el puntero" error. On mobile we
  // skip the lock and run in tap-to-shoot mode (see onFire below).
  const mobile = input.isMobileInput();
  let lockResult = { ok: true };
  if (!mobile) {
    lockResult = input.requestLock();
  }
  // Step 2 — resume the audio context. (A3)
  const audioPromise = audio.resumeAudio();

  if (!lockResult.ok) {
    showStartError(STRINGS.start.error_lock);
    return;
  }

  // Step 3 — start the game loop. The lock acquisition is async on most
  // browsers; we kick the loop optimistically. Gameplay modules can gate
  // input on `isLockActive()`.
  audioPromise.finally(() => {
    setOverlayVisible("start-screen", false);
    loop.start();
    showLevelSelect();
  });
});

// ---- Fire handler (Bug D fix) -----------------------------------------
//
// The engine's mousedown handler (engine/input.js) iterates a list of
// `fireCallbacks`. This is the ONLY registered callback — without it,
// every click would silently do nothing. We:
//   1. Consume one round of ammo (no-op if reloading or empty mag).
//   2. Build the world-space forward vector from the camera position +
//      the input.aim yaw/pitch (input.js maintains yaw/pitch from
//      mousemove deltas).
//   3. Hand the forward vector to enemies.tryHit() — a raycast that
//      hits the first enemy under the crosshair.
//
// THREE is loaded as a UMD global from index.html (r128), so it's
// available here without an import.

input.onFire((ev) => {
  if (!ammo.tryFire()) return;

  let forward;
  if (ev && ev.isMobile) {
    // Tap-to-shoot: build a raycaster from the camera through the tap
    // point on the canvas. This lets mobile players hit enemies
    // anywhere on screen instead of being stuck at dead-center.
    const canvas = document.getElementById("game");
    const rect = canvas.getBoundingClientRect();
    const ndcX =  ((ev.pointerX - rect.left) / rect.width)  * 2 - 1;
    const ndcY = -((ev.pointerY - rect.top)  / rect.height) * 2 + 1;
    const ndc = new THREE.Vector2(ndcX, ndcY);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    forward = raycaster.ray.direction;
  } else {
    // Desktop: use the aim yaw/pitch from mouse-look (input.js
    // maintains yaw/pitch from mousemove deltas). Three.js camera
    // default forward is -Z. Yaw around Y, pitch around X.
    //   x = -sin(yaw) * cos(pitch)
    //   y =  sin(pitch)
    //   z = -cos(yaw) * cos(pitch)
    const aim = input.aim;
    const cp = Math.cos(aim.pitch);
    const sp = Math.sin(aim.pitch);
    const cy = Math.cos(aim.yaw);
    const sy = Math.sin(aim.yaw);
    forward = new THREE.Vector3(-sy * cp, sp, -cy * cp);
  }

  enemies.tryHit(forward);
});

// ---- Pause / Game-over overlays (Bug E + H fix) ----------------------
//
// The pause.js and over.js modules own their own state mutation
// (state.paused, loop.pause()) — main.js used to have its own
// incomplete copies that didn't actually pause the loop. We delegate
// entirely to the modules' `wire()` so a single source of truth owns
// pause + game-over semantics.

import("./game/pause.js").then((p) => p.wire());
import("./game/over.js").then((o) => o.wire());

// ---- Volume + mute wiring (per hit-feedback spec) --------------------

input.onVolume((dir) => {
  import("./game/hit-feedback.js").then((hf) => hf.bumpVolume(dir));
});
input.onMute(() => {
  import("./game/hit-feedback.js").then((hf) => hf.toggleMute());
});

// ---- Level-select menu -----------------------------------------------

function showLevelSelect() {
  ["start-screen", "pause-overlay", "gameover-overlay",
   "data-screen", "final-screen", "credits-screen"].forEach((id) => {
    setOverlayVisible(id, false);
  });
  // Tear down the active level's scene objects before showing the menu.
  // Synchronous so the next `startLevel` snapshots a clean scene.
  import("./game/dispatcher.js").then((d) => d.exitToMenu());
  import("./game/state.js").then((s) => {
    const el = document.getElementById("menu-session-score");
    if (el) el.textContent = String(s.state.score);
  });
  setOverlayVisible("level-select", true);
}

document.querySelectorAll(".menu-level").forEach((btn) => {
  btn.addEventListener("click", () => {
    const n = Number(btn.getAttribute("data-level"));
    setOverlayVisible("level-select", false);
    import("./levels/registry.js").then((r) => r.start(n));
  });
});

const finalVolver = document.getElementById("final-volver");
if (finalVolver) finalVolver.addEventListener("click", () => {
  setOverlayVisible("final-screen", false);
  showLevelSelect();
});

const creditsVolver = document.getElementById("credits-screen");
if (creditsVolver) creditsVolver.addEventListener("click", () => {
  setOverlayVisible("credits-screen", false);
  showLevelSelect();
});

// ---- Initial UI state -------------------------------------------------

setOverlayVisible("start-screen", true);
setOverlayVisible("level-select", false);

// ---- Wire pedagogy listeners once at startup --------------------------
//
// `wirePedagogy()` is idempotent and lazy-loads the dispatcher. It
// binds the DATO power-up overlay AND the level-5 boss desactivacion
// -> final screen handoff. Must be called after the start screen is
// mounted so the overlay elements exist by the time the listener fires.
import("./game/pedagogy.js").then((p) => p.wirePedagogy());

// ---- Wire per-frame game-module updates -------------------------------
//
// `wireGameUpdates()` registers every game module's `update(dt)` with
// the dispatcher so the engine loop actually ticks them each frame.
// Without this, the scene renders but nothing inside it moves.
import("./game/wire-updates.js").then((w) => w.wireGameUpdates());
