// game/over.js
//
// Game-over overlay (per game-over-flow spec). Two buttons: Reintentar
// nivel / Volver al menu de niveles. Session score preserved on retry.
//
// Per spec §No Persistent Save (v1), this module MUST NOT touch
// localStorage / IndexedDB / sessionStorage. The session score lives
// in state.score and dies on page reload.

import * as input from "../engine/input.js";
import * as loop from "../engine/loop.js";
import * as audio from "../engine/audio.js";
import { setOverlayVisible } from "../engine/dom.js";
import { state } from "./state.js";

const OVERLAY = "gameover-overlay";

export function show() {
  input.exitLock();
  state.gameOver = true;
  state.paused = true;
  loop.pause(true);
  audio.playGameOver();
  audio.stopMusic();

  const el = document.getElementById("gameover-score");
  if (el) el.textContent = String(state.score);

  setOverlayVisible(OVERLAY, true);
}

export function hide() {
  state.gameOver = false;
  state.paused = false;
  loop.pause(false);
  setOverlayVisible(OVERLAY, false);
}

let wired = false;
export function wire() {
  if (wired) return;
  wired = true;

  const reintentar = document.getElementById("gameover-reintentar");
  if (reintentar) reintentar.addEventListener("click", () => {
    hide();
    import("./dispatcher.js").then((d) => d.restartLevel());
  });

  const menu = document.getElementById("gameover-menu");
  if (menu) menu.addEventListener("click", () => {
    hide();
    import("./dispatcher.js").then((d) => d.returnToMenu());
    setOverlayVisible("level-select", true);
  });
}