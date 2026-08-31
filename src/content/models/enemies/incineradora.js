// content/models/enemies/incineradora.js
//
// Incineradora movil — industrial furnace on treads with a smokestack.
// HP=10 standard / boss-tier when `variant === 'boss'`.
//
// A7 — uniform desactivacion on ALL 5 bosses.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeIncineradora(opts = {}) {
  const group = new THREE.Group();
  group.name = "incineradora";

  const isBoss = opts.variant === "boss";

  // Treads
  const treadGeo = new THREE.BoxGeometry(2.6, 0.6, 4.0);
  const treadMat = new THREE.MeshLambertMaterial({ color: 0x1f1f1f });
  const treads = new THREE.Mesh(treadGeo, treadMat);
  treads.position.y = 0.4;
  group.add(treads);

  // Furnace body
  const bodyGeo = new THREE.BoxGeometry(2.4, 1.6, 3.0);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0x9c9a8c });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.5;
  group.add(body);

  // Fire glow at the front (mouth)
  const mouthGeo = new THREE.PlaneGeometry(1.0, 0.6);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0xff6020 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, 1.4, 1.51);
  group.add(mouth);

  // Chimney
  const chimGeo = new THREE.CylinderGeometry(0.25, 0.32, 1.6, 10);
  const chimMat = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
  const chim = new THREE.Mesh(chimGeo, chimMat);
  chim.position.set(0.9, 2.9, -0.8);
  group.add(chim);

  // Chimney cap
  const capGeo = new THREE.CylinderGeometry(0.34, 0.30, 0.12, 10);
  const capMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.set(0.9, 3.75, -0.8);
  group.add(cap);

  if (isBoss) {
    // Larger fire mouth
    const bigMouthGeo = new THREE.PlaneGeometry(1.4, 0.9);
    const bigMouthMat = new THREE.MeshBasicMaterial({ color: 0xffa040 });
    const bigMouth = new THREE.Mesh(bigMouthGeo, bigMouthMat);
    bigMouth.position.set(0, 1.4, 1.52);
    group.add(bigMouth);
  }

  applyTransform(group, opts);

  const userData = {
    hp: 10,
    puntosKey: "incineradora",
    powerupDrops: isBoss ? [] : ["alegacion", "dato"],
    bossScale: 1.8,
  };

  // A7 — desactivacion lifecycle on the boss variant only.
  if (isBoss) {
    userData.lifecycle = "desactivacion";
  }

  group.userData = userData;
  return group;
}