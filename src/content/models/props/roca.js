// content/models/props/roca.js
// Low-poly rock — used as level decoration in mountainous sections.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeRoca(opts = {}) {
  const group = new THREE.Group();
  group.name = "roca";

  const rockGeo = new THREE.DodecahedronGeometry(1.0, 0);
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x7a7060 });
  const rock = new THREE.Mesh(rockGeo, rockMat);
  rock.position.y = 0.5;
  rock.scale.set(1.0, 0.6, 1.0);
  group.add(rock);

  // Smaller companion rock
  const rock2Geo = new THREE.DodecahedronGeometry(0.5, 0);
  const rock2 = new THREE.Mesh(rock2Geo, rockMat);
  rock2.position.set(0.8, 0.3, 0.3);
  rock2.scale.set(1.0, 0.6, 1.0);
  group.add(rock2);

  applyTransform(group, opts);

  group.userData = { kind: "prop", id: "roca" };
  return group;
}