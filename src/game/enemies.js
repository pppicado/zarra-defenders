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
import * as bosses from "./bosses.js";
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
 * 3-enemy cap (per spec §Cap unaffected by boss presence). The boss
 * FSM (entry animation, vulnerability windows, banner label) is owned
 * by `bosses.js` and starts here.
 */
export function spawnBoss(bossId) {
  const factory = getModel(bossId);
  const group = factory.make({ variant: "boss" });
  scene.add(group);
  group.userData.isBoss = true;
  group.userData.bossId = bossId;
  enemies.list.push(group);
  bossActive = true;
  // Kick off the FSM: 2 s ENTRY (banner visible, invulnerable) ->
  // INVULNERABLE -> SPECIAL_TELL -> VULNERABLE, looping 3 windows.
  bosses.start(bossId, group);
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

// ---- Hit-test (sphere-distance, raycast-free) -------------------------
//
// The original implementation used a mesh raycast (THREE.Raycaster) on
// every enemy. That broke down once enemies started to wobble
// laterally — the player aims at the crosshair (center of screen),
// the enemy wobbles off-axis, and the ray misses the mesh by a few
// units even though the enemy is clearly "in the player's face".
//
// The replacement uses bounding-sphere distance from each enemy's
// world-position center to the ray. If the closest enemy is within
// its sphere radius × 1.25 (a generous forgiveness multiplier), the
// hit lands. Same UX (point at the enemy and shoot), way more
// forgiving for the on-rails genre.
//
// Performance: linear scan over `enemies.list` (max MECANICA.enemyCap =
// 5). The Box3/Sphere computation is cached per-enemy on spawn so we
// only do it once per lifetime, not per shot.

const _tmpSphere = new THREE.Sphere();
const _tmpBox = new THREE.Box3();
const _tmpCenter = new THREE.Vector3();

function computeHitSphere(enemyGroup) {
  // Cache the bounding sphere on the group's userData so we only
  // compute it once per enemy.
  if (!enemyGroup.userData._hitSphere) {
    _tmpBox.setFromObject(enemyGroup);
    _tmpBox.getBoundingSphere(_tmpSphere);
    // Translate the sphere into world space by adding the enemy's
    // world position to the local center.
    enemyGroup.getWorldPosition(_tmpCenter);
    _tmpSphere.center.copy(_tmpCenter);
    _tmpSphere.radius *= 1.25;   // forgiveness for off-axis wobble
    enemyGroup.userData._hitSphere = {
      cx: _tmpSphere.center.x,
      cy: _tmpSphere.center.y,
      cz: _tmpSphere.center.z,
      r: _tmpSphere.radius,
    };
  }
  return enemyGroup.userData._hitSphere;
}

/**
 * Squared distance from a point P to a ray (origin + t*direction for t >= 0).
 * Avoids sqrt for the hot path.
 */
function pointToRayDistSq(px, py, pz, ox, oy, oz, dx, dy, dz) {
  // Vector from origin to point.
  const vx = px - ox, vy = py - oy, vz = pz - oz;
  // Project onto the ray direction.
  const t = vx * dx + vy * dy + vz * dz;
  if (t < 0) return Infinity;            // behind the camera
  // Closest point on the ray.
  const cx = ox + dx * t, cy = oy + dy * t, cz = oz + dz * t;
  // Distance squared.
  const ex = px - cx, ey = py - cy, ez = pz - cz;
  return ex * ex + ey * ey + ez * ez;
}

/**
 * Try to hit an enemy with a shot. The shot originates at the camera
 * position and points along `forward`. The hit is reported as the
 * closest enemy whose bounding sphere is within the ray.
 *
 * Returns `{hit: bool, enemy: ?, enemyId: ?}`.
 */
export function tryHit(forward) {
  const ox = camera.position.x, oy = camera.position.y, oz = camera.position.z;
  const dx = forward.x, dy = forward.y, dz = forward.z;

  let bestEnemy = null;
  let bestDistSq = Infinity;

  for (const enemyGroup of enemies.list) {
    if (enemyGroup.userData.lifecycleHalt) continue;
    const sphere = computeHitSphere(enemyGroup);
    const distSq = pointToRayDistSq(
      sphere.cx, sphere.cy, sphere.cz,
      ox, oy, oz, dx, dy, dz
    );
    const r = sphere.r;
    if (distSq < r * r && distSq < bestDistSq) {
      bestDistSq = distSq;
      bestEnemy = enemyGroup;
    }
  }

  if (!bestEnemy) {
    scoring.registerMiss();
    return { hit: false };
  }

  applyHit(bestEnemy);
  return { hit: true, enemy: bestEnemy, enemyId: bestEnemy.userData.puntosKey };
}

function applyHit(enemyGroup) {
  // Flash white on EVERY hit attempt (visual feedback regardless of
  // whether the shot connected).
  enemyGroup.traverse((child) => {
    if (child.isMesh) hitFeedback.flashEnemy(child);
  });

  // ---- Boss hits: route through the FSM (vulnerability windows) ----
  //
  // Per boss-system spec §Vulnerable Windows, shots during ENTRY /
  // INVULNERABLE / SPECIAL_TELL are rejected. The FSM in bosses.js
  // decrements HP only during VULNERABLE. When HP hits 0 the FSM
  // transitions to DESACTIVACION and we destroy the enemy here.
  if (enemyGroup.userData.isBoss) {
    if (bosses.bosses.current !== enemyGroup) {
      // Stale boss reference (already deactivated or cleared). Treat
      // as a no-op hit.
      return;
    }
    const accepted = bosses.registerHit();
    if (accepted) {
      // Sync HP into userData for any reader that wants to inspect it.
      enemyGroup.userData.hp = bosses.bosses.hp;
      hitFeedback.onHit({ isBoss: true, combo: state.combo });
      if (bosses.bosses.state === "DESACTIVACION") {
        destroyEnemy(enemyGroup);
      }
    } else {
      // Shot during an invulnerable phase. Play the crosshair flash
      // (already above) + a small SFX cue via hitFeedback onHit with
      // combo=0 (no screen-shake because the spec says invulnerable
      // shots are visual-only).
      hitFeedback.onHit({ isBoss: false, combo: 0 });
    }
    return;
  }

  // ---- Standard enemy HP decrement + destruction ----
  enemyGroup.userData.hp = (enemyGroup.userData.hp || 1) - 1;
  if (enemyGroup.userData.hp <= 0) {
    destroyEnemy(enemyGroup);
    return;
  }

  // Hit registered but not destroyed.
  hitFeedback.onHit({
    isBoss: false,
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

// Enemies that cross this z (camera is at z=0) are considered to have
// "reached" the player. They either cost a life or get absorbed by an
// active ALEGACION shield (visual feedback only).
const PASS_THRESHOLD_Z = 2;

// Per-enemy phase offset for lateral wobble — assigned at spawn time so
// each enemy bobs independently and the wave looks organic, not a
// straight conveyor belt of identical trajectories. Amplitude is
// deliberately small (0.2-0.5 units) so the enemy stays within the
// crosshair's effective hit zone while still adding visual variety.
function assignWobble(group) {
  if (typeof group.userData.wobblePhase !== "number") {
    group.userData.wobblePhase = Math.random() * Math.PI * 2;
    group.userData.wobbleAmp = 0.2 + Math.random() * 0.3;   // 0.2 - 0.5 units
    group.userData.baseX = group.position.x;
  }
}

export function update(dt) {
  // Slow-motion (MANIFESTACION) reduces effective dt for enemy motion.
  const slowFactor = state.slowT > 0 ? 0.5 : 1.0;
  const effectiveDt = dt * slowFactor;
  const t = performance.now() / 1000;

  // Walk the list backwards so splice() doesn't break the iteration.
  for (let i = enemies.list.length - 1; i >= 0; i--) {
    const e = enemies.list[i];

    // A7 — halted bosses do not move. NOTE: `lifecycle === 'desactivacion'`
    // is a STATIC marker on bosses (set at spawn per A7) that tells the
    // destruction path to use the desaturation animation. It is NOT a
    // runtime "halt" signal. Only `lifecycleHalt` (set by `desactivar()`
    // after HP reaches 0) freezes the boss. Skipping on `lifecycle`
    // alone was a Bug that let bosses pass the camera without costing
    // a life.
    if (e.userData.lifecycleHalt) continue;

    assignWobble(e);

    // Standard enemies move toward the camera at a constant speed.
    const speed = e.userData.isBoss ? 1.0 : 4.0;
    e.position.z += speed * effectiveDt;

    // Lateral wobble — sinusoidal x around the spawn-time base, so
    // enemies drift side-to-side instead of flying dead-straight.
    e.position.x = e.userData.baseX + Math.sin(t * 1.4 + e.userData.wobblePhase) * e.userData.wobbleAmp;

    // Enemy passed the camera. Lose a life (or absorb via ALEGACION).
    if (e.position.z > PASS_THRESHOLD_Z) {
      const shielded = state.shieldT > 0;
      if (shielded) {
        // ALEGACION absorbed the hit — visual cue only, no life lost.
        // Pop the enemy off the scene with a small desaturate.
        scene.remove(e);
        e.traverse((child) => {
          if (child.material && child.material.color) {
            const c = child.material.color;
            const avg = (c.r + c.g + c.b) / 3;
            child.material.color.setRGB(avg * 1.5, avg * 1.5, avg * 1.5);
          }
        });
        enemies.list.splice(i, 1);
      } else {
        // Real hit — lose a life, dispose, game-over if lives reach 0.
        scene.remove(e);
        e.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            const ms = Array.isArray(child.material) ? child.material : [child.material];
            ms.forEach((m) => m.dispose());
          }
        });
        enemies.list.splice(i, 1);
        loseLife();
      }
    }
  }
}

function loseLife() {
  state.lives -= 1;
  if (state.lives <= 0) {
    state.lives = 0;
    state.gameOver = true;
    // Trigger game-over overlay. Dynamic import avoids a load-time
    // cycle with game/over.js.
    import("./over.js").then((o) => o.show());
  }
}

export function isBossActive() { return bossActive; }
export function activeCount() { return enemies.list.length; }