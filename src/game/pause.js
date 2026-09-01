// game/pause.js
//
// Pause overlay (per pause-menu spec). ESC releases pointer lock + shows
// overlay with exactly three buttons: Continuar / Reiniciar nivel /
// Salir al menu. Continuar re-acquires pointer lock.
//
// We import the DOM helpers from engine/dom.js. Pointer-lock release is
// handled via the `input` module which already exposes `exitLock()`.

import * as input from "../engine/input.js";
import * as loop from "../engine/loop.js";
import { setOverlayVisible } from "../engine/dom.js";
import { state } from "./state.js";

const OVERLAY = "pause-overlay";

export function show() {
  input.exitLock();
  state.paused = true;
  loop.pause(true);
  setOverlayVisible(OVERLAY, true);
}

export function hide() {
  state.paused = false;
  loop.pause(false);
  setOverlayVisible(OVERLAY, false);
}

// Wire ESC + the three buttons exactly once (idempotent if imported
// twice).
let wired = false;
export function wire() {
  if (wired) return;
  wired = true;

  input.onEscape(() => {
    if (state.inMenu || state.gameOver) return;
    show();
  });

  const continuar = document.getElementById("pause-continuar");
  if (continuar) continuar.addEventListener("click", () => {
    hide();
    input.requestLock();
  });

  const reiniciar = document.getElementById("pause-reiniciar");
  if (reiniciar) reiniciar.addEventListener("click", () => {
    hide();
    import("./dispatcher.js").then((d) => d.restartLevel());
  });

  const salir = document.getElementById("pause-salir");
  if (salir) salir.addEventListener("click", () => {
    hide();
    // Reuse the main.js showLevelSelect() flow: tear down the scene
    // AND show the level-select overlay. main.js wires both via
    // exitToMenu() + setOverlayVisible("level-select", true).
    import("./dispatcher.js").then((d) => d.returnToMenu());
    setOverlayVisible("level-select", true);
  });
}