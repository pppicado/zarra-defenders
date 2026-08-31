// content/models/enemies/bolsa_plastico.js
//
// Bolsa de plastico — small, light, drag-prone. HP=1, 3 pts.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeBolsaPlastico(opts = {}) {
  const group = new THREE.Group();
  group.name = "bolsa_plastico";

  const bodyGeo = new THREE.PlaneGeometry(0.8, 1.0);
  const bodyMat = new THREE.MeshLambertMaterial({
    color: 0xeaeaea,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.8;
  group.add(body);

  applyTransform(group, opts);

  group.userData = {
    hp: 1,
    puntosKey: "bolsa_plastico",
    powerupDrops: ["firma"],
  };
  return group;
}