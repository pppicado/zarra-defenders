// content/models/props/cartel.js
// Wooden signpost — used at level boundaries and as ambient signage.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeCartel(opts = {}) {
  const group = new THREE.Group();
  group.name = "cartel";

  // Post
  const postGeo = new THREE.BoxGeometry(0.15, 2.0, 0.15);
  const postMat = new THREE.MeshLambertMaterial({ color: 0x6a4423 });
  const post = new THREE.Mesh(postGeo, postMat);
  post.position.y = 1.0;
  group.add(post);

  // Sign board
  const signGeo = new THREE.BoxGeometry(1.6, 1.0, 0.10);
  const signMat = new THREE.MeshLambertMaterial({ color: 0xc8a070 });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.y = 1.6;
  group.add(sign);

  // Painted stripe on the sign
  const stripeGeo = new THREE.PlaneGeometry(1.4, 0.20);
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0x2c2c2c });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0, 1.6, 0.06);
  group.add(stripe);

  applyTransform(group, opts);

  group.userData = { kind: "prop", id: "cartel" };
  return group;
}