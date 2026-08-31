// game/enemies.js
//
// Active enemy lifecycle: spawn loop, raycast, 3-enemy cap, hit-test,
// drop power-ups, deactivate when destroyed.
//
// Per enemy-registry spec and design D5 / D6, this is the ONLY file
// that reads from `src/content/models/index.js`. Levels register enemy
// ids + counts and call `startWave()`; everything else is internal.
//
// A7 — uniform desactivacion on ALL 5 bosses. The `desactivar(group)`
// path is invoked whenever an enemy's `userData.lifecycle ===
// 'desactivacion'`. This covers topadora, tubo_lixiviado,
// incineradora, trailer (when called with variant: 'boss') AND
// planta_treco (always). No boss ever falls through to a generic
// destruction path; the pedagogical framing holds uniformly.
//
// The original instance at /projects/scratch/test01conf/zarra-game had
// a registry import bug (read the registry object literal instead of the
// `get(id)` function). We use the function here.

import { scene, camera } from "../engine/scene.js";
import { get as getModel } from "../content/models/index.js";
import * as hitFeedback from "./hit-feedback.js";
import * as scoring from "./scoring.js";
import * as powerups from "./powerups.js";
import * as dispatcher from "./dispatcher.js";
import { state } from "./state.js";
import { MECANICA } from "../content/data.js";
import { __zarra } from "../engine/dom.js";

const ENEMY_CAP = MECANICA.enemyCap;          // 3

export const enemies = {
  list: [],             // active THREE.Group instances
  spawnQueue: [],       // pending spawn descriptors
  pending: false,
};

let waveEmitter = null;   // callback set by waves.js
let onEnemyGone = null;   // callback when an enemy leaves (death or clean cap)
let bossActive = false;   // true when current wave includes a boss

// ---- Wave API (called from waves.js) ---------------------------------

export function setWaveEmitter(fn) { waveEmitter = fn; }
export function setOnEnemyGone(fn) { onEnemyGone = fn; }

/**
 * Spawn an enemy from the registry by id. Honours the 3-enemy cap by
 * deferring to the queue. Returns the spawned group or null if queued.
 *
 * The prior instance had a registry import bug — it reached for the
 * registry object literal instead of calling `getModel(id).make(...)`.
 * The function import (`get as getModel`) here is correct.
 */
export function spawn(enemyId, opts = {}) {
  const factory = getModel(enemyId);
  const group = factory.make(opts);

  // If cap would be exceeded, defer. Spec §3-enemy cap.
  if (enemies.list.length >= ENEMY_CAP && !opts.isBoss) {
    enemies.spawnQueue.push({ id: enemyId, opts });
    return null;
  }

  scene.add(group);
  enemies.list.push(group);
  group.userData.spawnT = performance.now() / 1000;
  return group;
}

/**
 * Spawn a boss. Bosses are tracked separately and don't count toward the
 * 3-enemy cap (per spec §Cap unaffected by boss presence).
 */
export function spawnBoss(bossId) {
  const factory = getModel(bossId);
  const group = factory.make({ variant: "boss" });
  scene.add(group);
  group.userData.isBoss = true;
  group.userData.bossId = bossId;
  enemies.list.push(group);
  bossActive = true;
  return group;
}

export function clearEnemies() {
  for (const e of enemies.list) {
    scene.remove(e);
  }
  enemies.list.length = 0;
  enemies.spawnQueue.length = 0;
  bossActive = false;
}

// ---- Hit-test (raycast) ----------------------------------------------

const raycaster = new THREE.Raycaster();
const screenNDC = new THREE.Vector2(0, 0);     // we always fire at the center of the screen

/**
 * Try to hit an enemy with a shot. The shot originates at the camera
 * position and points along `forward`. The hit is reported as the first
 * intersected enemy in `enemies.list`.
 *
 * Returns `{hit: bool, enemy: ?, enemyId: ?}`.
 */
export function tryHit(forward) {
  raycaster.set(camera.position, forward);
  raycaster.far = 100;

  const hits = raycaster.intersectObjects(enemies.list, true);
  if (hits.length === 0) {
    scoring.registerMiss();
    return { hit: false };
  }

  // Walk up the parent chain to find the group registered in `enemies.list`.
  let obj = hits[0].object;
  while (obj && enemies.list.indexOf(obj) === -1) {
    obj = obj.parent;
  }
  if (!obj) {
    scoring.registerMiss();
    return { hit: false };
  }

  applyHit(obj);
  return { hit: true, enemy: obj, enemyId: obj.userData.puntosKey };
}

function applyHit(enemyGroup) {
  // Flash white (hit-feedback §Enemy Flash on Hit)
  enemyGroup.traverse((child) => {
    if (child.isMesh) hitFeedback.flashEnemy(child);
  });

  // HP decrement
  enemyGroup.userData.hp = (enemyGroup.userData.hp || 1) - 1;

  if (enemyGroup.userData.hp <= 0) {
    destroyEnemy(enemyGroup);
    return;
  }

  // Hit registered but not destroyed: hit-feedback fires for the
  // crosshair flash + (on bosses) screen-shake, but scoring only runs
  // on destruction (per combo-scoring §Per-Enemy Base Points).
  hitFeedback.onHit({
    isBoss: !!enemyGroup.userData.isBoss,
    combo: state.combo,
  });
}

/**
 * Destroy an enemy. The prior instance routed bosses through the
 * standard destruction path; per A7 ALL bosses instead pass through
 * `desactivar(group)` so they desaturate + halt motion instead of
 * exploding. The condition is `userData.lifecycle === 'desactivacion'`
 * — which is set by the boss factories (topadora/tubo_lixiviado/
 * incineradora/trailer when called with variant:'boss', and
 * planta_treco always).
 */
function destroyEnemy(enemyGroup) {
  // Score the kill (only on destruction).
  const id = enemyGroup.userData.puntosKey;
  const awarded = scoring.registerHit(id);
  hitFeedback.onHit({
    isBoss: !!enemyGroup.userData.isBoss,
    combo: state.combo,
  });

  // Power-up drop
  const drops = enemyGroup.userData.powerupDrops || [];
  if (drops.length > 0) {
    // Per-wave probability is the wave schedule's concern; we always
    // drop exactly one if any drops are listed.
    const pick = drops[Math.floor(Math.random() * drops.length)];
    powerups.apply(pick);
  }

  // A7 — uniform desactivacion. ALL bosses (5) carry the lifecycle
  // flag and route through `desactivar(group)`. No boss ever falls
  // through to the old destruction path.
  if (enemyGroup.userData.lifecycle === "desactivacion") {
    desactivar(enemyGroup);
  }

  // Remove from scene + list
  scene.remove(enemyGroup);
  const idx = enemies.list.indexOf(enemyGroup);
  if (idx >= 0) enemies.list.splice(idx, 1);

  // Drain the spawn queue if cap is now under the limit.
  if (enemies.spawnQueue.length > 0 && enemies.list.length < ENEMY_CAP) {
    const next = enemies.spawnQueue.shift();
    spawn(next.id, next.opts);
  }

  if (enemyGroup.userData.isBoss) bossActive = false;
  if (onEnemyGone) onEnemyGone(enemyGroup);
}

/**
 * A7 - desactivacion lifecycle. Per boss-system spec §Boss
 * Desactivacion - All 5 Bosses: the boss halts its attacks, the
 * screen applies desaturation + motion halt. NO explosion, NO fire,
 * NO debris, NO particles. The pedagogical framing holds for every
 * boss uniformly.
 *
 * Steps:
 *  1. Mark group.userData.lifecycleHalt = true so the per-frame
 *     `update()` skips motion (defensive — the wave FSM also stops
 *     emitting enemies once the boss is down).
 *  2. Desaturate the material colors (greyscale-ish tone).
 *  3. Dispatch 'zarra:desactivacion' so pedagogy.js can hand off to
 *     the final screen for level 5.
 */
function desactivar(bossGroup) {
  // 1. Motion halt — per-frame update() reads this and skips motion.
  bossGroup.userData.lifecycleHalt = true;

  // 2. Desaturate.
  bossGroup.traverse((child) => {
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        if (m && m.color) {
          const c = m.color;
          const avg = (c.r + c.g + c.b) / 3;
          m.color.setRGB(avg, avg, avg);
        }
      });
    }
  });

  // 3. Dispatch event so pedagogy.js can show the final screen if
  // this is the level-5 boss.
  __zarra.log("enemies: desactivacion applied to", bossGroup.userData.bossId || bossGroup.name);
  dispatcher.emit("zarra:desactivacion", bossGroup);
}

// ---- Per-frame update -----------------------------------------------

export function update(dt) {
  // Slow-motion (MANIFESTACION) reduces effective dt for enemy motion.
  const slowFactor = state.slowT > 0 ? 0.5 : 1.0;
  const effectiveDt = dt * slowFactor;

  for (const e of enemies.list) {
    // A7 — halted bosses do not move.
    if (e.userData.lifecycleHalt) continue;
    if (e.userData.lifecycle === "desactivacion") continue;
    // Standard enemies move toward the camera at a constant speed.
    const speed = e.userData.isBoss ? 1.0 : 4.0;
    e.position.z += speed * effectiveDt;
  }
}

export function isBossActive() { return bossActive; }
export function activeCount() { return enemies.list.length; }