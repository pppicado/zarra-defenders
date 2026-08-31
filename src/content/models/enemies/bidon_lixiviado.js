// content/models/enemies/bidon_lixiviado.js
//
// Bidon lixiviado — toxic-green barrel. HP=1, 15 pts.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeBidonLixiviado(opts = {}) {
  const group = new THREE.Group();
  group.name = "bidon_lixiviado";

  const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.0, 12);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2f7a3a });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.5;
  group.add(body);

  // Cap
  const capGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 12);
  const capMat = new THREE.MeshLambertMaterial({ color: 0x202020 });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 1.06;
  group.add(cap);

  // "TOXICO" warning band — yellow ring on the barrel
  const bandGeo = new THREE.CylinderGeometry(0.405, 0.405, 0.18, 12);
  const bandMat = new THREE.MeshLambertMaterial({ color: 0xd9b03a });
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.position.y = 0.65;
  group.add(band);

  applyTransform(group, opts);

  group.userData = {
    hp: 1,
    puntosKey: "bidon_lixiviado",
    powerupDrops: ["firma", "dato"],
  };
  return group;
}