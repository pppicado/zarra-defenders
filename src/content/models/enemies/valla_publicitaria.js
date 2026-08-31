// content/models/enemies/valla_publicitaria.js
//
// Valla publicitaria — billboard carrying the project's eufemistic
// claim. HP=1, 5 pts. `powerupDrops: []` (per enemy-registry spec
// §Factory with no drops — empty array, not undefined).

import { applyTransform } from "../../../engine/model-transform.js";

export function makeVallaPublicitaria(opts = {}) {
  const group = new THREE.Group();
  group.name = "valla_publicitaria";

  // Two posts
  const postGeo = new THREE.BoxGeometry(0.15, 2.0, 0.15);
  const postMat = new THREE.MeshLambertMaterial({ color: 0x554433 });
  const post1 = new THREE.Mesh(postGeo, postMat);
  post1.position.set(-1.2, 1.0, 0);
  group.add(post1);
  const post2 = new THREE.Mesh(postGeo, postMat);
  post2.position.set(1.2, 1.0, 0);
  group.add(post2);

  // Billboard panel
  const panelGeo = new THREE.PlaneGeometry(2.6, 1.4);
  const panelMat = new THREE.MeshLambertMaterial({
    color: 0xf3efe1,
    side: THREE.DoubleSide,
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 1.7, 0);
  group.add(panel);

  // Eufemismo stripe (the claim band)
  const stripeGeo = new THREE.PlaneGeometry(2.4, 0.3);
  const stripeMat = new THREE.MeshBasicMaterial({
    color: 0x2c7a2c,
    side: THREE.DoubleSide,
  });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0, 1.85, 0.01);
  group.add(stripe);

  applyTransform(group, opts);

  group.userData = {
    hp: 1,
    puntosKey: "valla_publicitaria",
    powerupDrops: [],
  };
  return group;
}