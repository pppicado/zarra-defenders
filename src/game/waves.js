// game/waves.js
//
// Wave scheduler state machine (per level-wave-system spec).
//
// States:
//   REST         -> 4 s rest between waves, no enemies, countdown visible
//   SPAWNING     -> emit enemies respecting 3-enemy cap; defer when full
//   ACTIVE       -> enemies on screen, awaiting last kill
//   BOSS         -> boss wave, 1 boss + 1-2 adds
//   TRANSITION   -> after boss desactivacion, fade out -> level complete
//
// Wave expiry per spec §Wave Duration: "no enemies left + >=15 s
// elapsed". Boss wave emission per §Boss Wave Composition: 1 boss +
// 1-2 adds.
//
// The prior instance at /projects/scratch/test01conf/zarra-game had a
// wave spawn deferral bug: it incremented `spawnIdx` BEFORE the spawn
// fired, so any spawn that was deferred by the 3-enemy cap was
// permanently skipped. The corrected pattern (used below) increments
// `spawnIdx` AFTER the spawn fires, and walks the queue with a
// `while + break` so the deferred spawn resumes as soon as the cap
// drops.

import * as enemies from "./enemies.js";
import * as hitFeedback from "./hit-feedback.js";
import { state } from "./state.js";
import { MECANICA } from "../content/data.js";
import { __zarra } from "../engine/dom.js";

const ENEMY_CAP        = MECANICA.enemyCap;        // 3
const WAVE_SEC         = MECANICA.waveSec;         // 30
const WAVE_SEC_MIN     = MECANICA.waveSecMin;      // 15
const INTER_WAVE_SEC   = MECANICA.interWaveSec;    // 4

export const waveFSM = {
  state: "REST",          // REST | SPAWNING | ACTIVE | BOSS | TRANSITION
  currentWave: 0,
  waveStartT: 0,
  activeT: 0,
  restT: 0,
  spawns: [],             // [{id, at}] schedule for the current wave
  bossWave: null,         // { bossId, addIds: [] }
  onLevelComplete: null,  // callback set by dispatcher
};

let spawnIdx = 0;

export function setOnLevelComplete(fn) { waveFSM.onLevelComplete = fn; }

/**
 * Configure a level: list of waves, each is `{ spawns: [{id, at}] }`,
 * plus one boss wave with `bossId` + `addIds`. Called by the level
 * module at level start.
 */
export function configureLevel({ waves: waveList, bossWave }) {
  waveFSM.state = "REST";
  waveFSM.currentWave = 0;
  waveFSM.activeT = 0;
  waveFSM.restT = 0;
  waveFSM.spawns = [];
  spawnIdx = 0;
  waveFSM.waves = waveList;
  waveFSM.bossWave = bossWave;
  beginNextWave();
}

function beginNextWave() {
  waveFSM.currentWave += 1;
  if (waveFSM.currentWave > waveFSM.waves.length) {
    // All non-boss waves done -> start the boss wave
    startBossWave();
    return;
  }
  waveFSM.state = "SPAWNING";
  waveFSM.spawns = waveFSM.waves[waveFSM.currentWave - 1].spawns;
  spawnIdx = 0;
  waveFSM.waveStartT = performance.now() / 1000;
  waveFSM.activeT = 0;
}

function startBossWave() {
  waveFSM.state = "BOSS";
  enemies.clearEnemies();

  const boss = waveFSM.bossWave;
  if (!boss) {
    // Defensive — no boss configured. Skip to transition.
    enterTransition();
    return;
  }

  enemies.spawnBoss(boss.bossId);

  const adds = boss.addIds || [];
  for (const id of adds.slice(0, 2)) {
    enemies.spawn(id);
  }
  waveFSM.waveStartT = performance.now() / 1000;
}

function enterTransition() {
  waveFSM.state = "TRANSITION";
  setTimeout(() => {
    if (waveFSM.onLevelComplete) waveFSM.onLevelComplete();
  }, 800);
}

/**
 * Per-frame update.
 */
export function update(dt) {
  if (state.paused) return;
  if (!waveFSM.waves) return;        // not configured yet (pre-dato-screen)

  const now = performance.now() / 1000;
  const elapsed = now - waveFSM.waveStartT;
  waveFSM.activeT += dt;

  switch (waveFSM.state) {
    case "REST":
      waveFSM.restT += dt;
      if (waveFSM.restT >= INTER_WAVE_SEC && enemies.activeCount() === 0) {
        waveFSM.restT = 0;
        beginNextWave();
      }
      break;

    case "SPAWNING":
      // CORRECTED pattern (vs. the prior instance's bug):
      //
      //   - We walk the queue with `while` (not `if`) so any spawns
      //     deferred by the 3-enemy cap fire as soon as the cap
      //     drops.
      //   - We increment `spawnIdx` AFTER the spawn fires, not before.
      //     If we incremented before, a deferred (capped) spawn would
      //     be silently skipped — that was the bug.
      //   - We `break` out of the loop when the next spawn's `at`
      //     time hasn't been reached yet, OR when the cap is hit.
      while (spawnIdx < waveFSM.spawns.length && enemies.activeCount() < ENEMY_CAP) {
        const spec = waveFSM.spawns[spawnIdx];
        if (elapsed < (spec.at || 0)) break;     // not yet — break, do not advance
        spawnIdx += 1;                           // AFTER fire, not before
        const x = (Math.random() - 0.5) * 8;
        const result = enemies.spawn(spec.id, { position: { x, y: 0, z: -40 } });
        if (!result) {
          // Cap deferred; rewind spawnIdx so this spawn retries next frame.
          spawnIdx -= 1;
          break;
        }
      }
      // Wave is active if any spawns remain OR enemies are on screen.
      if (spawnIdx >= waveFSM.spawns.length && enemies.activeCount() === 0) {
        waveFSM.state = "ACTIVE";
        waveFSM.waveStartT = now;
      } else if (enemies.activeCount() > 0) {
        waveFSM.state = "ACTIVE";
      }
      break;

    case "ACTIVE":
      // Wave expiry: no enemies left + >=15 s elapsed.
      if (enemies.activeCount() === 0 && waveFSM.activeT >= WAVE_SEC_MIN) {
        // Move to REST
        waveFSM.state = "REST";
        waveFSM.restT = 0;
        waveFSM.activeT = 0;
        // Trigger inter-wave countdown HUD via document event.
        window.dispatchEvent(new CustomEvent("zarra:rest-start"));
      }
      break;

    case "BOSS":
      // Boss wave ends when the boss has been deactivated AND all
      // adds are gone.
      if (!enemies.isBossActive() && enemies.activeCount() === 0) {
        enterTransition();
      }
      break;

    case "TRANSITION":
      // Wait for the level-complete callback to clear this state.
      break;
  }
}

// ---- Boss desactivacion -> TRANSITION --------------------------------
//
// The dispatcher emits `zarra:desactivacion` when an enemy with
// `userData.lifecycle === 'desactivacion'` (i.e., a boss per A7)
// reaches 0 HP. We listen and advance the FSM. The pedagogy module
// separately listens for the same event to display the final screen.

export function onDesactivacion(bossGroup) {
  __zarra.log("waves: boss desactivacion received ->", bossGroup && bossGroup.userData && bossGroup.userData.bossId);
  if (waveFSM.state === "BOSS") {
    enterTransition();
  }
}

// Initialise the listener against the dispatcher once.
import("./dispatcher.js").then((d) => d.on("zarra:desactivacion", onDesactivacion));