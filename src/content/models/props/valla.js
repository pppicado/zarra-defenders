// content/models/props/valla.js
// Wooden fence — low-poly section used as level background scenery.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeValla(opts = {}) {
  const group = new THREE.Group();
  group.name = "valla";

  const postGeo = new THREE.BoxGeometry(0.10, 1.0, 0.10);
  const postMat = new THREE.MeshLambertMaterial({ color: 0x8a6a3a });
  for (let i = 0; i < 4; i++) {
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(-1.5 + i, 0.5, 0);
    group.add(post);
  }

  // Two horizontal rails
  const railGeo = new THREE.BoxGeometry(3.0, 0.06, 0.06);
  const railMat = new THREE.MeshLambertMaterial({ color: 0x7a5a30 });
  const rail1 = new THREE.Mesh(railGeo, railMat);
  rail1.position.set(0, 0.75, 0);
  group.add(rail1);
  const rail2 = new THREE.Mesh(railGeo, railMat);
  rail2.position.set(0, 0.35, 0);
  group.add(rail2);

  applyTransform(group, opts);

  group.userData = { kind: "prop", id: "valla" };
  return group;
}