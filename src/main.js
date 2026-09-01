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
  // Step 1 — request pointer lock. (A3)
  const lockResult = input.requestLock();
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

// ---- Pause overlay wiring ---------------------------------------------

input.onEscape(() => {
  input.exitLock();
  setOverlayVisible("pause-overlay", true);
});

const pauseCont = document.getElementById("pause-continuar");
if (pauseCont) pauseCont.addEventListener("click", () => {
  input.requestLock();
  setOverlayVisible("pause-overlay", false);
});

const pauseReiniciar = document.getElementById("pause-reiniciar");
if (pauseReiniciar) pauseReiniciar.addEventListener("click", () => {
  input.exitLock();
  setOverlayVisible("pause-overlay", false);
  import("./game/dispatcher.js").then((d) => d.restartLevel());
});

const pauseSalir = document.getElementById("pause-salir");
if (pauseSalir) pauseSalir.addEventListener("click", () => {
  input.exitLock();
  setOverlayVisible("pause-overlay", false);
  showLevelSelect();
});

// ---- Game-over overlay wiring -----------------------------------------

const gameoverReintentar = document.getElementById("gameover-reintentar");
if (gameoverReintentar) gameoverReintentar.addEventListener("click", () => {
  setOverlayVisible("gameover-overlay", false);
  import("./game/dispatcher.js").then((d) => d.restartLevel());
});

const gameoverMenu = document.getElementById("gameover-menu");
if (gameoverMenu) gameoverMenu.addEventListener("click", () => {
  setOverlayVisible("gameover-overlay", false);
  showLevelSelect();
});

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

const creditsVolver = document.getElementById("credits-volver");
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