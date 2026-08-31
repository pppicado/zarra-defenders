// content/models/buildings/casa_ayora.js
// Whitewashed village house — Ayora streetscape scenery.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeCasaAyora(opts = {}) {
  const group = new THREE.Group();
  group.name = "casa_ayora";

  // Walls
  const wallGeo = new THREE.BoxGeometry(4.0, 3.0, 3.5);
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xece2c8 });
  const walls = new THREE.Mesh(wallGeo, wallMat);
  walls.position.y = 1.5;
  group.add(walls);

  // Roof (terracotta)
  const roofGeo = new THREE.BoxGeometry(4.4, 0.3, 3.9);
  const roofMat = new THREE.MeshLambertMaterial({ color: 0xb85535 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 3.15;
  group.add(roof);

  // Roof triangle
  const triGeo = new THREE.BoxGeometry(4.0, 0.8, 0.4);
  const tri = new THREE.Mesh(triGeo, roofMat);
  tri.position.y = 3.65;
  tri.position.z = 1.75;
  tri.rotation.x = -0.5;
  group.add(tri);
  const tri2 = new THREE.Mesh(triGeo, roofMat);
  tri2.position.y = 3.65;
  tri2.position.z = -1.75;
  tri2.rotation.x = 0.5;
  group.add(tri2);

  // Window
  const winGeo = new THREE.PlaneGeometry(0.6, 0.7);
  const winMat = new THREE.MeshBasicMaterial({ color: 0x222244 });
  const win1 = new THREE.Mesh(winGeo, winMat);
  win1.position.set(-1.0, 1.6, 1.76);
  group.add(win1);
  const win2 = new THREE.Mesh(winGeo, winMat);
  win2.position.set(1.0, 1.6, 1.76);
  group.add(win2);

  // Door
  const doorGeo = new THREE.PlaneGeometry(0.7, 1.3);
  const doorMat = new THREE.MeshLambertMaterial({ color: 0x6a4423 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 0.7, 1.76);
  group.add(door);

  applyTransform(group, opts);

  group.userData = { kind: "building", id: "casa_ayora" };
  return group;
}