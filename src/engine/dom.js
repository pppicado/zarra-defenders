// engine/dom.js
//
// Two responsibilities:
//   1. DOM helpers — canvas lookup, overlay visibility, overlay text set.
//   2. The SINGLE permitted carve-out for `console.*` calls in src/ (A8).
//      Production modules import `__zarra.{log,warn,error}` from here; the
//      functions gate behind the `__zarra.debug` flag (set via
//      `localStorage.__zarra.debug = "1"` or `?debug=1` query string).
//
// `verify.sh` checks `grep -rn "console\." src/ | grep -v engine/dom.js`
// and expects zero matches outside this module — every other source file
// MUST use `__zarra.{log,warn,error}` instead of bare `console.*`.

// ---- Debug flag (gated console.* export) -------------------------------

function debugFlag() {
  try {
    if (typeof localStorage !== "undefined" && localStorage.getItem("__zarra.debug") === "1") return true;
    if (typeof location !== "undefined" && new URLSearchParams(location.search).get("debug") === "1") return true;
  } catch (_) {
    // private browsing / sandboxed iframe — fall through to false
  }
  return false;
}

export const __zarra = {
  get debug() { return debugFlag(); },
  log:   (...a) => { if (__zarra.debug) console.log(...a); },
  warn:  (...a) => { if (__zarra.debug) console.warn(...a); },
  error: (...a) => { if (__zarra.debug) console.error(...a); },
};

// ---- DOM helpers -------------------------------------------------------

/**
 * Returns the #game canvas. Centralised so engine/game modules all reach
 * the canvas through the same accessor — avoids id-typo bugs and gives
 * one place to swap to `document.querySelector('[data-canvas]')` later if
 * the markup changes.
 */
export function getCanvas() {
  const c = document.getElementById("game");
  if (!c) {
    throw new Error("engine/dom: #game canvas not found in DOM");
  }
  return c;
}

/**
 * Toggle a single overlay visible/hidden by flipping its `data-state`
 * attribute. Used by pause.js, over.js, data-screen.js, the start screen
 * handler, and the level-select menu.
 */
export function setOverlayVisible(id, visible) {
  const el = document.getElementById(id);
  if (!el) return;
  el.setAttribute("data-state", visible ? "visible" : "hidden");
}

/**
 * Set text content on a child of a given overlay. Returns the element so
 * callers can chain attribute tweaks (e.g., href for final-screen links).
 */
export function setOverlayText(overlayId, childId, text) {
  const el = document.getElementById(childId);
  if (!el) {
    throw new Error(`engine/dom: #${childId} not found inside #${overlayId}`);
  }
  el.textContent = text;
  return el;
}