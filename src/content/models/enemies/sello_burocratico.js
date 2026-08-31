// content/models/enemies/sello_burocratico.js
//
// Sello burocratico — huge "AUTORIZADO" rubber stamp falling from the
// sky. HP=5, 40 pts. Heavy tier (per plan §4 / enemy-registry spec).

import { applyTransform } from "../../../engine/model-transform.js";

export function makeSelloBurocratico(opts = {}) {
  const group = new THREE.Group();
  group.name = "sello_burocratico";

  // Stamp handle
  const handleGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12);
  const handleMat = new THREE.MeshLambertMaterial({ color: 0x6a4423 });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = 1.1;
  group.add(handle);

  // Stamp base
  const baseGeo = new THREE.BoxGeometry(1.6, 0.4, 1.6);
  const baseMat = new THREE.MeshLambertMaterial({ color: 0x4a3020 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.65;
  group.add(base);

  // Stamp face — red rubber with "AUTORIZADO" as a coloured plane
  const faceGeo = new THREE.PlaneGeometry(1.5, 1.5);
  const faceMat = new THREE.MeshLambertMaterial({
    color: 0xaa2030,
    side: THREE.DoubleSide,
  });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.y = 0.45;
  face.rotation.x = -Math.PI / 2;
  group.add(face);

  // Decorative star in the middle of the stamp face
  const starGeo = new THREE.PlaneGeometry(0.6, 0.6);
  const starMat = new THREE.MeshBasicMaterial({
    color: 0xffd040,
    side: THREE.DoubleSide,
  });
  const star = new THREE.Mesh(starGeo, starMat);
  star.position.y = 0.46;
  star.rotation.x = -Math.PI / 2;
  group.add(star);

  applyTransform(group, opts);

  group.userData = {
    hp: 5,
    puntosKey: "sello_burocratico",
    powerupDrops: ["alegacion"],
  };
  return group;
}