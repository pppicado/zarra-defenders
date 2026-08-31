// content/models/enemies/topadora.js
//
// Topadora — bulldozer with blade. HP=5 standard / boss-tier when
// `variant === 'boss'`.
//
// A7 — uniform desactivacion on ALL 5 bosses. The boss variant sets
// `userData.lifecycle = 'desactivacion'` so the destruction-vs-
// desactivacion code path in `game/enemies.js destroyEnemy()` applies
// the same desaturation + motion-stop to this boss as to the others.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeTopadora(opts = {}) {
  const group = new THREE.Group();
  group.name = "topadora";

  const isBoss = opts.variant === "boss";

  // Track body
  const trackGeo = new THREE.BoxGeometry(2.6, 0.6, 3.6);
  const trackMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  const tracks = new THREE.Mesh(trackGeo, trackMat);
  tracks.position.y = 0.4;
  group.add(tracks);

  // Track wheels (4)
  const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 12);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x707070 });
  for (const [x, y, z] of [
    [ 1.1, 0.4,  1.2],
    [-1.1, 0.4,  1.2],
    [ 1.1, 0.4, -1.2],
    [-1.1, 0.4, -1.2],
    [ 1.1, 0.4,  0.0],
    [-1.1, 0.4,  0.0],
  ]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, y, z);
    group.add(w);
  }

  // Cabin
  const cabinGeo = new THREE.BoxGeometry(1.6, 1.2, 1.4);
  const cabinMat = new THREE.MeshLambertMaterial({ color: 0xd8a020 });
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 1.3, -0.6);
  group.add(cabin);

  // Blade
  const bladeGeo = new THREE.BoxGeometry(3.4, 1.4, 0.3);
  const bladeMat = new THREE.MeshLambertMaterial({ color: 0xc8b020 });
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  blade.position.set(0, 1.1, 1.8);
  group.add(blade);

  // Engine hood
  const hoodGeo = new THREE.BoxGeometry(1.6, 0.7, 1.0);
  const hood = new THREE.Mesh(hoodGeo, cabinMat);
  hood.position.set(0, 1.0, 0.6);
  group.add(hood);

  if (isBoss) {
    // Spikes on the blade for boss-tier visual
    const spikeGeo = new THREE.ConeGeometry(0.15, 0.5, 6);
    const spikeMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(spikeGeo, spikeMat);
      s.position.set(-1.6 + i * 0.8, 1.95, 1.95);
      s.rotation.x = -Math.PI / 2;
      group.add(s);
    }
  }

  applyTransform(group, opts);

  const userData = {
    hp: 5,
    puntosKey: "topadora",
    powerupDrops: isBoss ? [] : ["manifestacion", "dato"],
    bossScale: 1.8,
  };

  // A7 — desactivacion lifecycle on the boss variant only.
  if (isBoss) {
    userData.lifecycle = "desactivacion";
  }

  group.userData = userData;
  return group;
}