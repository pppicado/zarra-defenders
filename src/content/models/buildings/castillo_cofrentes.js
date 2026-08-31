// content/models/buildings/castillo_cofrentes.js
// Cofrentes castle silhouette — skyline reference.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeCastilloCofrentes(opts = {}) {
  const group = new THREE.Group();
  group.name = "castillo_cofrentes";

  // Main keep
  const keepGeo = new THREE.BoxGeometry(6.0, 6.0, 6.0);
  const keepMat = new THREE.MeshLambertMaterial({ color: 0xb09870 });
  const keep = new THREE.Mesh(keepGeo, keepMat);
  keep.position.y = 3.0;
  group.add(keep);

  // Crenellations — 6 cubes on top
  const crenGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
  const crenMat = new THREE.MeshLambertMaterial({ color: 0x8a7558 });
  for (let i = 0; i < 6; i++) {
    const cren = new THREE.Mesh(crenGeo, crenMat);
    cren.position.set(-2.5 + i, 6.45, -3.0);
    group.add(cren);
    const cren2 = new THREE.Mesh(crenGeo, crenMat);
    cren2.position.set(-2.5 + i, 6.45, 3.0);
    group.add(cren2);
  }

  // Corner towers (4)
  const towerGeo = new THREE.CylinderGeometry(0.9, 0.9, 8.0, 10);
  const towerMat = new THREE.MeshLambertMaterial({ color: 0xa08866 });
  for (const [x, z] of [[-3.4, -3.4], [3.4, -3.4], [-3.4, 3.4], [3.4, 3.4]]) {
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(x, 4.0, z);
    group.add(tower);

    // Cone roof on each tower
    const coneGeo = new THREE.ConeGeometry(1.0, 1.4, 8);
    const coneMat = new THREE.MeshLambertMaterial({ color: 0x6a4423 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(x, 8.6, z);
    group.add(cone);
  }

  // Gate
  const gateGeo = new THREE.BoxGeometry(1.6, 2.4, 0.2);
  const gateMat = new THREE.MeshLambertMaterial({ color: 0x3a2a1f });
  const gate = new THREE.Mesh(gateGeo, gateMat);
  gate.position.set(0, 1.2, 3.05);
  group.add(gate);

  applyTransform(group, opts);

  group.userData = { kind: "building", id: "castillo_cofrentes" };
  return group;
}