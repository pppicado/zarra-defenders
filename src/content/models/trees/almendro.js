// content/models/trees/almendro.js
//
// Low-poly almond tree (almendro). Trunk + fluffy pink-white canopy.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeAlmendro(opts = {}) {
  const group = new THREE.Group();
  group.name = "almendro";

  const trunkGeo = new THREE.CylinderGeometry(0.10, 0.14, 0.8, 6);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.4;
  group.add(trunk);

  const canopyMat = new THREE.MeshLambertMaterial({ color: 0xf3d6dd });
  const canopyGeo = new THREE.SphereGeometry(0.85, 10, 8);
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.y = 1.05;
  canopy.scale.set(1.0, 0.85, 1.0);
  group.add(canopy);

  applyTransform(group, opts);

  group.userData = { kind: "tree", id: "almendro" };
  return group;
}