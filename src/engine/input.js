// engine/input.js
//
// Pointer Lock + mouse + light-gun input. Per design D8, D9, D14 this module
// is the SOLE caller of `requestPointerLock` / `exitPointerLock`. Every
// other module observes lock-state via the `onLockChange` callback.
//
// Mobile input (no Pointer Lock API available):
//   The Pointer Lock API is desktop-only. On touch devices we run a
//   parallel mode: every `pointerdown` fires immediately (no lock
//   required) and the tap location drives the shot direction. main.js
//   uses `isMobileInput()` to choose between mouse-look aim and a
//   raycaster built from the tap point (per the user's
//   "tap-to-shoot at the tap position" choice).
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

/**
 * True when the runtime is a touch / coarse-pointer device. Used to
 * branch between pointer-lock mode (desktop) and tap-to-shoot mode
 * (mobile). Detection is intentionally cheap: a single `matchMedia`
 * plus a feature check, both safe to call from anywhere.
 */
export function isMobileInput() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(pointer: coarse)").matches) return true;
  if ("ontouchstart" in window) return true;
  return false;
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

// Use Pointer Events so the same handler covers mouse clicks AND touch
// taps on mobile. `mousedown` doesn't fire on touch without explicit
// `preventDefault()` on `touchstart`, which broke mobile play. The
// Pointer Events API is the unified, cross-input surface.
document.addEventListener("pointerdown", (ev) => {
  // Ignore taps that land on a visible overlay (start screen, level
  // select, pause, gameover, data screen, final, credits). Without
  // this guard the fire callback runs when the user taps a menu
  // button — wasteful and confusing on mobile.
  if (ev.target && typeof ev.target.closest === "function") {
    if (ev.target.closest('.overlay[data-state="visible"]')) return;
  }
  // Desktop mode requires pointer lock (Pointer Lock API contract).
  // Mobile mode has no pointer lock — every touch fires immediately
  // and the tap location drives the shot direction. Branch on
  // `isMobileInput()` so a desktop user who happens to have a touch
  // screen can still fall back to mobile behavior if lock fails.
  const mobile = isMobileInput();
  if (!mobile && !lockActive) return;
  // Buttons: 0 = primary (mouse left button / touch / pen tip).
  if (ev.button !== 0) return;
  // Pass pointer info so main.js can build a raycaster from the tap
  // on mobile. Desktop callers ignore pointerX/Y because aim is
  // driven by accumulated mouse-look deltas.
  for (const fn of fireCallbacks) fn({
    pointerX: ev.clientX,
    pointerY: ev.clientY,
    isMobile: mobile,
  });
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