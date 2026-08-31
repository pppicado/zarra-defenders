// content/models/buildings/torre_central.js
// Cofrentes nuclear plant cooling tower silhouette — distant landmark.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeTorreCentral(opts = {}) {
  const group = new THREE.Group();
  group.name = "torre_central";

  // Hyperboloid shape approximated by stacked truncated cones
  const segCount = 6;
  const baseR = 2.4;
  const waistR = 1.8;
  const topR = 1.0;
  const totalH = 12.0;
  const segH = totalH / segCount;

  const towerMat = new THREE.MeshLambertMaterial({ color: 0xd5ccbe });

  for (let i = 0; i < segCount; i++) {
    const t0 = i / segCount;
    const t1 = (i + 1) / segCount;
    const r0 = baseR + (waistR - baseR) * Math.sin(t0 * Math.PI);
    const r1 = baseR + (waistR - baseR) * Math.sin(t1 * Math.PI);
    const geo = new THREE.CylinderGeometry(r1, r0, segH, 16);
    const seg = new THREE.Mesh(geo, towerMat);
    seg.position.y = segH * i + segH / 2;
    group.add(seg);
  }

  // Top opening rim
  const rimGeo = new THREE.TorusGeometry(topR * 1.05, 0.12, 8, 24);
  const rim = new THREE.Mesh(rimGeo, towerMat);
  rim.position.y = totalH;
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  // Steam plume (small white box)
  const steamGeo = new THREE.SphereGeometry(0.6, 8, 8);
  const steamMat = new THREE.MeshLambertMaterial({
    color: 0xeeeeee,
    transparent: true,
    opacity: 0.7,
  });
  const steam = new THREE.Mesh(steamGeo, steamMat);
  steam.position.y = totalH + 0.6;
  group.add(steam);

  applyTransform(group, opts);

  group.userData = { kind: "building", id: "torre_central" };
  return group;
}