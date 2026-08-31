// content/models/enemies/planta_treco.js
//
// Planta de tratamiento TRECO — level-5 FINAL BOSS.
//
// Per design D6 and the boss-system spec §Dedicated `planta_treco` Boss
// Factory, this is NOT a variant of `incineradora`. Its lifecycle is
// `desactivacion`, NOT destruction. The renderer / hit-feedback modules
// observe `userData.lifecycle` and play a desaturation + motion-stop
// frame instead of an explosion.
//
// The factory always returns a boss-tier group; the `variant` flag is
// accepted but ignored (this factory is dedicated). Power-ups: empty
// (per boss-system contract — no drops during final fight).

import { applyTransform } from "../../../engine/model-transform.js";

export function makePlantaTreco(opts = {}) {
  const group = new THREE.Group();
  group.name = "planta_treco";

  // Main industrial block
  const mainGeo = new THREE.BoxGeometry(8.0, 4.0, 6.0);
  const mainMat = new THREE.MeshLambertMaterial({ color: 0x8c8478 });
  const main = new THREE.Mesh(mainGeo, mainMat);
  main.position.set(0, 2.0, 0);
  group.add(main);

  // Roof (slanted)
  const roofGeo = new THREE.BoxGeometry(8.4, 0.3, 6.4);
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 4.15, 0);
  group.add(roof);

  // Two tall chimneys
  const chimGeo = new THREE.CylinderGeometry(0.4, 0.5, 6.0, 10);
  const chimMat = new THREE.MeshLambertMaterial({ color: 0x9c9488 });
  const chim1 = new THREE.Mesh(chimGeo, chimMat);
  chim1.position.set(-2.5, 5.0, -1.5);
  group.add(chim1);
  const chim2 = new THREE.Mesh(chimGeo, chimMat);
  chim2.position.set(2.5, 5.0, -1.5);
  group.add(chim2);

  // Chimney caps
  const capGeo = new THREE.CylinderGeometry(0.55, 0.4, 0.4, 10);
  const capMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  const cap1 = new THREE.Mesh(capGeo, capMat);
  cap1.position.set(-2.5, 8.1, -1.5);
  group.add(cap1);
  const cap2 = new THREE.Mesh(capGeo, capMat);
  cap2.position.set(2.5, 8.1, -1.5);
  group.add(cap2);

  // Side wing — taller, narrower
  const wingGeo = new THREE.BoxGeometry(3.0, 5.0, 4.0);
  const wingMat = new THREE.MeshLambertMaterial({ color: 0xa09886 });
  const wing = new THREE.Mesh(wingGeo, wingMat);
  wing.position.set(5.5, 2.5, 0.5);
  group.add(wing);

  // Loading bay doors (front)
  const bayGeo = new THREE.BoxGeometry(2.0, 2.5, 0.1);
  const bayMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  const bay1 = new THREE.Mesh(bayGeo, bayMat);
  bay1.position.set(-1.5, 1.25, 3.05);
  group.add(bay1);
  const bay2 = new THREE.Mesh(bayGeo, bayMat);
  bay2.position.set(1.5, 1.25, 3.05);
  group.add(bay2);

  // Faint "TRECO" plate
  const plateGeo = new THREE.PlaneGeometry(2.4, 0.6);
  const plateMat = new THREE.MeshBasicMaterial({ color: 0x1d5a2b });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.set(0, 3.6, 3.05);
  group.add(plate);

  applyTransform(group, { ...opts, variant: "boss" });

  // Final boss — fixed HP budget, larger than level-1-4 bosses. The
  // dedicated factory ALWAYS carries the desactivacion lifecycle (A7).
  group.userData = {
    hp: 30,
    puntosKey: "planta_treco",
    powerupDrops: [],
    lifecycle: "desactivacion",
    bossScale: 1.0,        // already large; we don't double-scale
  };
  return group;
}