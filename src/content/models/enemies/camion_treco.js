// content/models/enemies/camion_treco.js
//
// Camion TRECO — basic enemy, 1 HP, 10 pts.
// Box-shaped trailer with a low-poly cab. Carries the TRECO logo as a
// billboard-style plate (textured plane) on the side. Drops a powerup
// sometimes (configurable per the wave schedule, not by the factory).

import { applyTransform } from "../../../engine/model-transform.js";

export function makeCamionTreco(opts = {}) {
  const group = new THREE.Group();
  group.name = "camion_treco";

  // Cab
  const cabGeo = new THREE.BoxGeometry(1.4, 1.2, 1.6);
  const cabMat = new THREE.MeshLambertMaterial({ color: 0xd8d8d8 });
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.set(0, 0.8, 1.5);
  group.add(cab);

  // Trailer body
  const trailerGeo = new THREE.BoxGeometry(2.6, 1.6, 4.5);
  const trailerMat = new THREE.MeshLambertMaterial({ color: 0xe8e0d0 });
  const trailer = new THREE.Mesh(trailerGeo, trailerMat);
  trailer.position.set(0, 1.0, -0.7);
  group.add(trailer);

  // Wheels (4)
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const wheels = [
    [ 0.85, 0.4,  1.0],
    [-0.85, 0.4,  1.0],
    [ 0.85, 0.4,  2.4],
    [-0.85, 0.4,  2.4],
    [ 0.85, 0.4, -0.8],
    [-0.85, 0.4, -0.8],
    [ 0.85, 0.4, -2.2],
    [-0.85, 0.4, -2.2],
  ];
  for (const [x, y, z] of wheels) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, y, z);
    group.add(w);
  }

  // Logo plate (TRECO) — flat coloured panel on the trailer side.
  const logoGeo = new THREE.PlaneGeometry(2.0, 0.6);
  const logoMat = new THREE.MeshBasicMaterial({ color: 0x1d5a2b });
  const logo = new THREE.Mesh(logoGeo, logoMat);
  logo.position.set(0, 1.0, -2.95);
  group.add(logo);

  applyTransform(group, opts);

  group.userData = {
    hp: 1,
    puntosKey: "camion_treco",
    powerupDrops: ["firma", "alegacion"],
  };
  return group;
}