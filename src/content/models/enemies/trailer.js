// content/models/enemies/trailer.js
//
// Trailer largo — convoy of 2-3 trailers. HP=8 standard / boss-tier
// when `variant === 'boss'`.
//
// A7 — uniform desactivacion on ALL 5 bosses.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeTrailer(opts = {}) {
  const group = new THREE.Group();
  group.name = "trailer";

  const isBoss = opts.variant === "boss";
  const trailerCount = isBoss ? 3 : 2;

  for (let i = 0; i < trailerCount; i++) {
    const z = i * 4.5 - (trailerCount - 1) * 2.25;

    // Cab
    const cabGeo = new THREE.BoxGeometry(1.4, 1.2, 1.6);
    const cabMat = new THREE.MeshLambertMaterial({ color: 0x9c9090 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 0.8, z + 2.0);
    group.add(cab);

    // Trailer body
    const bodyGeo = new THREE.BoxGeometry(2.6, 1.7, 4.5);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xe8e0d0 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 1.0, z - 0.4);
    group.add(body);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    for (const [x, wz] of [[-0.85, 2.2], [0.85, 2.2], [-0.85, 0.0], [0.85, 0.0], [-0.85, -2.0], [0.85, -2.0]]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.4, z + wz);
      group.add(w);
    }

    // Hazard stripes on the side (warning)
    const stripeGeo = new THREE.PlaneGeometry(2.4, 0.15);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xddb020 });
    const stripe1 = new THREE.Mesh(stripeGeo, stripeMat);
    stripe1.position.set(0, 1.7, z - 0.4 + 1.5);
    group.add(stripe1);
    const stripe2 = new THREE.Mesh(stripeGeo, stripeMat);
    stripe2.position.set(0, 1.7, z - 0.4 - 1.5);
    group.add(stripe2);
  }

  applyTransform(group, opts);

  const userData = {
    hp: 8,
    puntosKey: "trailer",
    powerupDrops: isBoss ? [] : ["firma", "alegacion"],
    bossScale: 1.5,
  };

  // A7 — desactivacion lifecycle on the boss variant only.
  if (isBoss) {
    userData.lifecycle = "desactivacion";
  }

  group.userData = userData;
  return group;
}