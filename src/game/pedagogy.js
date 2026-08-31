// game/pedagogy.js
//
// Pedagogy orchestrator (per data-screen spec). Owns:
//   - Pre-level dato screen (one per level, plus the final dato)
//   - Final screen (4 links + "Volver a jugar")
//   - Credits iteration
//   - DATO power-up overlay
//
// A5 — all 6 dato strings are populated from research/fuentes.md and
// shipped ready; no TODO markers remain.
// A6 - every URL the player can click is read from
// STRINGS.final.enlaces.*_url; there are NO inline URL literals
// anywhere in this file.

import { setOverlayVisible, setOverlayText } from "../engine/dom.js";
import * as audio from "../engine/audio.js";
import { STRINGS } from "../content/data.js";
import { __zarra } from "../engine/dom.js";

const LEVEL_PREFIX = "nivel";
const FINAL_KEY = "final";

// ---- Pre-level dato screen --------------------------------------------

/**
 * Show the dato screen for level `n`. Returns a Promise that resolves
 * when the player clicks "Continuar".
 */
export function showDatoScreen(n) {
  return new Promise((resolve) => {
    const key = (n >= 1 && n <= 5) ? `${LEVEL_PREFIX}${n}` : FINAL_KEY;
    const dato = STRINGS.datos[key];
    if (!dato) {
      __zarra.warn(`pedagogy: missing dato for key '${key}'`);
      resolve();
      return;
    }

    setOverlayText("data-screen", "data-texto", dato.texto);
    setOverlayText("data-screen", "data-fuente", dato.fuente);

    // Dato-screen audio: NO music; a single soft beep on entry (per
    // data-screen spec §Text-Only Audio (Optional Beep)).
    audio.stopMusic();
    audio.playBeep();

    setOverlayVisible("data-screen", true);

    const cont = document.getElementById("data-continuar");
    if (!cont) {
      // Defensive — resolve immediately if the DOM node is missing.
      resolve();
      return;
    }
    const handler = () => {
      cont.removeEventListener("click", handler);
      setOverlayVisible("data-screen", false);
      audio.startMusic();
      resolve();
    };
    cont.addEventListener("click", handler);
  });
}

// ---- Final screen -----------------------------------------------------

export function showFinalScreen() {
  const dato = STRINGS.datos[FINAL_KEY];
  const enlaces = STRINGS.final.enlaces;

  setOverlayText("final-screen", "final-texto", dato.texto);

  // 4 links: plataforma, alegaciones, asociacion, hashtag.
  //
  // A6 - every URL is read from STRINGS.final.enlaces.*_url. We
  // never embed URL literals here; pedagogy.js is a pure STRINGS
  // consumer. The verify.sh check `grep -rn "https" src/ | grep -v
  // content/data.js` MUST return zero hits.
  const links = [
    { id: "final-link-plataforma",  text: enlaces.plataforma,        url: enlaces.plataforma_url },
    { id: "final-link-alegaciones", text: enlaces.alegaciones,       url: enlaces.alegaciones_url || "#" },
    { id: "final-link-asociacion",  text: enlaces.asociacion,        url: enlaces.asociacion_url  || "#" },
  ];
  links.forEach((l) => {
    if (!l.id) return;
    const el = document.getElementById(l.id);
    if (el) {
      el.textContent = l.text;
      if (l.url) el.setAttribute("href", l.url);
    }
  });
  const hash = document.getElementById("final-link-hashtag");
  if (hash) hash.textContent = enlaces.hashtag;

  audio.stopMusic();
  setOverlayVisible("final-screen", true);
}

// ---- Credits ----------------------------------------------------------

export function showCredits() {
  const list = document.getElementById("credits-list");
  if (list) {
    list.innerHTML = "";
    for (const ent of STRINGS.creditos.entidades) {
      const li = document.createElement("li");
      li.textContent = `${ent.nombre}${ent.rol ? " \u2014 " + ent.rol : ""}`;
      list.appendChild(li);
    }
  }
  setOverlayVisible("credits-screen", true);
}

// ---- DATO overlay (per powerups.js DATO effect) ----------------------
//
// The dispatcher emits `zarra:dato-overlay` when the DATO power-up
// fires. We listen and pick a random dato for the brief inline
// overlay, then auto-dismiss after 4 s.

export function showDatoOverlay() {
  const keys = ["nivel1", "nivel2", "nivel3", "nivel4", "nivel5"];
  const pick = keys[Math.floor(Math.random() * keys.length)];
  const dato = STRINGS.datos[pick];
  if (!dato) return;

  setOverlayText("data-screen", "data-texto", dato.texto);
  setOverlayText("data-screen", "data-fuente", dato.fuente);
  const cont = document.getElementById("data-continuar");
  if (cont) cont.setAttribute("data-state", "hidden");
  setOverlayVisible("data-screen", true);
  setTimeout(() => {
    setOverlayVisible("data-screen", false);
    if (cont) cont.setAttribute("data-state", "visible");
  }, 4000);
}

// ---- Wire the dispatcher listener ------------------------------------
//
// We listen via the dispatcher bus so this module stays decoupled.
// Init is idempotent.
let wired = false;
export function wirePedagogy() {
  if (wired) return;
  wired = true;
  import("./dispatcher.js").then((d) => {
    d.on("zarra:dato-overlay", showDatoOverlay);
  });
}