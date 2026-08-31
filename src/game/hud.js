// game/hud.js
//
// HUD: ammo / lives / score / combo / volume / mute / countdown.
// All labels from STRINGS.hud / STRINGS.mecanica (per content-strings
// spec §HUD Strings Localized). No hard-coded Spanish in this file.

import { state } from "./state.js";
import { ammo as ammoState } from "./ammo.js";
import { MECANICA } from "../content/data.js";

const els = {
  ammo:      () => document.getElementById("hud-ammo"),
  lives:     () => document.getElementById("hud-lives"),
  score:     () => document.getElementById("hud-score"),
  combo:     () => document.getElementById("hud-combo"),
  vol:       () => document.getElementById("hud-vol"),
  mute:      () => document.getElementById("hud-mute"),
  panel:     () => document.getElementById("hud-panel"),
};

export function show() {
  const p = els.panel();
  if (p) p.setAttribute("data-state", "visible");
}

export function hide() {
  const p = els.panel();
  if (p) p.setAttribute("data-state", "hidden");
}

export function update(dt) {
  const a = els.ammo();      if (a) a.textContent = `${ammoState.current} / ${MECANICA.magazineSize}`;
  const l = els.lives();     if (l) l.textContent = String(state.lives);
  const s = els.score();     if (s) s.textContent = String(state.score);
  const c = els.combo();     if (c) c.textContent = `\u00d7${state.combo}`;
}