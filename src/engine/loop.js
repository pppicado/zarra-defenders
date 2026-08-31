// engine/loop.js
//
// requestAnimationFrame driver. Per design D3, this is the single place
// that ticks the game. It calls `update(dt)` then `render(dt)` per frame,
// and is pause-aware — when `paused` is true (set by pause.js), it skips
// update and only renders.
//
// The loop is exposed to game modules as a small API:
//
//   loop.start()    - begin ticking (A3 step 3: first rAF is queued here)
//   loop.stop()     - halt ticking; game returns to a static state
//   loop.pause(bool)- freeze update phase without halting render
//   loop.onUpdate(fn) - register a per-frame callback (dt seconds)
//   loop.onRender(fn) - register a per-frame callback (dt seconds) after update

import { render } from "./render.js";

let running = false;
let paused = false;
let lastT = 0;

const updateCallbacks = [];
const renderCallbacks = [];

export function onUpdate(fn) { updateCallbacks.push(fn); }
export function onRender(fn) { renderCallbacks.push(fn); }

function tick(now) {
  if (!running) return;
  const dt = lastT === 0 ? 0 : Math.min(0.1, (now - lastT) / 1000);
  lastT = now;

  if (!paused) {
    for (const fn of updateCallbacks) fn(dt);
  }

  for (const fn of renderCallbacks) fn(dt);
  render(dt);

  requestAnimationFrame(tick);
}

export function start() {
  if (running) return;
  running = true;
  paused = false;
  lastT = 0;
  requestAnimationFrame(tick);
}

export function stop() {
  running = false;
  paused = false;
  lastT = 0;
}

export function pause(p) {
  paused = !!p;
}

export function isPaused() { return paused; }
export function isRunning() { return running; }