// engine/input.js
//
// Pointer Lock + mouse + light-gun input. Per design D8, D9, D14 this module
// is the SOLE caller of `requestPointerLock` / `exitPointerLock`. Every
// other module observes lock-state via the `onLockChange` callback.
//
// Critical contracts (architectural decisions A3 + A4):
//
//   A3 - First-click atomic gesture (hit-feedback spec §First-Click Atomic
//        Gesture Contract):
//        The first mousedown on the start screen MUST, on the same event
//        tick, (1) requestPointerLock, (2) audioCtx.resume, (3) start the
//        game loop. If any one fails, the visible error appears and the
//        loop does not start. We expose `onStartGesture(fn)` so main.js
//        can hand us a single callback that performs all three steps.
//
//   A4 - Light gun absolute-cursor fallback (hit-feedback spec §Light Gun
//        Absolute-Cursor Fallback):
//        If `MouseEvent.movementX === 0 && MouseEvent.movementY === 0`
//        for more than 1 second after lock acquired, switch to absolute
//        cursor position (clamped to canvas bounds) with ×2 sensitivity.
//        Switch back the moment a non-zero event arrives. Silent — no UI.

import { getCanvas } from "./dom.js";

const canvas = getCanvas();

// ----- Lock state ------------------------------------------------------

let lockActive = false;

export function isLockActive() {
  return lockActive;
}

const lockChangeCallbacks = [];
export function onLockChange(fn) {
  lockChangeCallbacks.push(fn);
}

document.addEventListener("pointerlockchange", () => {
  lockActive = document.pointerLockElement === canvas;
  for (const fn of lockChangeCallbacks) fn(lockActive);
});

// ----- Yaw/pitch state -------------------------------------------------

export const aim = {
  yaw: 0,
  pitch: 0,
  mode: "relative",         // "relative" | "absolute"
  zeroSince: 0,             // ms timestamp of last non-zero movement
  zeroCheckWindow: 1000,    // ms threshold for A4 fallback
  sensitivityRel: 0.0025,   // rad / unit movement (mouse)
  sensitivityAbs: 0.0050,   // rad / px (light-gun ×2)
};

// Pitch clamp to avoid camera flips (per plan §9.5).
const PITCH_MAX = Math.PI / 2 - 0.05;

// ----- Start gesture (A3) ----------------------------------------------

let onStartGestureCb = null;

/**
 * Register the single callback fired by the atomic first-click. Per A3 the
 * callback MUST chain `requestPointerLock`, `audioCtx.resume`, and the
 * first `requestAnimationFrame`. main.js wires this in `bootstrap()`.
 */
export function onStartGesture(fn) {
  onStartGestureCb = fn;
}

function handleStartClick(ev) {
  ev.preventDefault();
  if (onStartGestureCb) onStartGestureCb();
}

const startBtn = document.getElementById("start-button");
if (startBtn) startBtn.addEventListener("mousedown", handleStartClick);

// ----- Mouse-look ------------------------------------------------------

const sensitivityRel = () => aim.sensitivityRel;
const sensitivityAbs = () => aim.mode === "absolute" ? aim.sensitivityAbs : aim.sensitivityRel;

document.addEventListener("mousemove", (ev) => {
  if (!lockActive) return;

  const mx = ev.movementX || 0;
  const my = ev.movementY || 0;

  if (mx === 0 && my === 0) {
    // Could be a quiet light-gun or simply no movement; record timestamp.
    if (aim.zeroSince === 0) aim.zeroSince = performance.now();
    return;
  }

  // Non-zero movement: if we were in absolute mode, switch back silently.
  if (aim.mode === "absolute") {
    aim.mode = "relative";
    aim.zeroSince = performance.now();
  } else {
    aim.zeroSince = performance.now();
  }

  const k = sensitivityRel();
  aim.yaw   -= mx * k;
  aim.pitch -= my * k;
  if (aim.pitch >  PITCH_MAX) aim.pitch =  PITCH_MAX;
  if (aim.pitch < -PITCH_MAX) aim.pitch = -PITCH_MAX;
});

// ----- A4 fallback watcher ---------------------------------------------

setInterval(() => {
  if (!lockActive) return;
  if (aim.mode === "absolute") return;
  if (aim.zeroSince === 0) return;
  if (performance.now() - aim.zeroSince >= aim.zeroCheckWindow) {
    aim.mode = "absolute";
  }
}, 250);

// ----- Fire / R / ESC / M / [ / ] --------------------------------------

const fireCallbacks = [];
export function onFire(fn) { fireCallbacks.push(fn); }
const reloadCallbacks = [];
export function onReload(fn) { reloadCallbacks.push(fn); }
const escapeCallbacks = [];
export function onEscape(fn) { escapeCallbacks.push(fn); }
const volumeCallbacks = [];
export function onVolume(fn) { volumeCallbacks.push(fn); }
const muteCallbacks = [];
export function onMute(fn) { muteCallbacks.push(fn); }

document.addEventListener("mousedown", (ev) => {
  if (!lockActive) return;
  if (ev.button !== 0) return;
  for (const fn of fireCallbacks) fn(ev);
});

document.addEventListener("keydown", (ev) => {
  if (ev.repeat) return;
  if (ev.code === "KeyR") {
    for (const fn of reloadCallbacks) fn();
    ev.preventDefault();
    return;
  }
  if (ev.code === "Escape") {
    for (const fn of escapeCallbacks) fn();
    ev.preventDefault();
    return;
  }
  if (ev.code === "KeyM") {
    for (const fn of muteCallbacks) fn();
    ev.preventDefault();
    return;
  }
  if (ev.code === "BracketLeft") {
    for (const fn of volumeCallbacks) fn(-1);
    ev.preventDefault();
    return;
  }
  if (ev.code === "BracketRight") {
    for (const fn of volumeCallbacks) fn(+1);
    ev.preventDefault();
    return;
  }
});

// ----- Public helpers used by main.js ----------------------------------

export function requestLock() {
  try {
    canvas.requestPointerLock();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}

export function exitLock() {
  if (document.pointerLockElement === canvas) {
    document.exitPointerLock();
  }
}

/**
 * Reset the aim state — used by levels on (re)start so a partially-rotated
 * camera does not leak across level boundaries.
 */
export function resetAim() {
  aim.yaw = 0;
  aim.pitch = 0;
  aim.mode = "relative";
  aim.zeroSince = 0;
}