// content/models/trees/encina.js
//
// Low-poly holm oak (encina). Trunk + spherical canopy built from
// primitives per plan §6: < 200 tri per model, no external textures.
//
// `makeEncina({variant, position, rotation}) -> THREE.Group`
//
// Trees carry no `userData.hp` / `powerupDrops` — they are scenery, not
// enemies. The factory sets `userData.kind = 'tree'` for downstream
// classification if a future hit-test ever needs it.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeEncina(opts = {}) {
  const group = new THREE.Group();
  group.name = "encina";

  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.0, 8);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3520 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.5;
  group.add(trunk);

  const canopyGeo = new THREE.SphereGeometry(0.95, 10, 8);
  const canopyMat = new THREE.MeshLambertMaterial({ color: 0x2e6b3a });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.y = 1.45;
  group.add(canopy);

  // Lower secondary blob for that gnarled encina silhouette.
  const canopy2Geo = new THREE.SphereGeometry(0.6, 10, 8);
  const canopy2 = new THREE.Mesh(canopy2Geo, canopyMat);
  canopy2.position.set(0.35, 1.1, 0.1);
  group.add(canopy2);

  applyTransform(group, opts);

  group.userData = { kind: "tree", id: "encina" };
  return group;
}