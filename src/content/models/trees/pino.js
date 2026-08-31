// content/models/trees/pino.js
//
// Low-poly pine tree (pino). Tall conical canopy stacked in 2 tiers.

import { applyTransform } from "../../../engine/model-transform.js";

export function makePino(opts = {}) {
  const group = new THREE.Group();
  group.name = "pino";

  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.9, 6);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3a20 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.45;
  group.add(trunk);

  const greenMat = new THREE.MeshLambertMaterial({ color: 0x1f5a2b });
  const c1Geo = new THREE.ConeGeometry(0.85, 1.0, 8);
  const c1 = new THREE.Mesh(c1Geo, greenMat);
  c1.position.y = 1.4;
  group.add(c1);

  const c2Geo = new THREE.ConeGeometry(0.6, 0.8, 8);
  const c2 = new THREE.Mesh(c2Geo, greenMat);
  c2.position.y = 2.1;
  group.add(c2);

  applyTransform(group, opts);

  group.userData = { kind: "tree", id: "pino" };
  return group;
}