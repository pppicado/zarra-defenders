// content/models/enemies/tubo_lixiviado.js
//
// Tubo de lixiviado — PVC green pipe. HP=3, 35 pts.
//
// When called with `{ variant: 'boss' }`, the factory produces the
// level-2 boss version (taller pipe, splash ring at the base, scaled
// up). Per A7 the boss variant sets
// `userData.lifecycle = 'desactivacion'` so the desactivacion path
// applies uniformly across all 5 bosses.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeTuboLixiviado(opts = {}) {
  const group = new THREE.Group();
  group.name = "tubo_lixiviado";

  const isBoss = opts.variant === "boss";

  // Pipe body
  const pipeGeo = new THREE.CylinderGeometry(0.5, 0.5, isBoss ? 6.0 : 3.0, 12);
  const pipeMat = new THREE.MeshLambertMaterial({ color: 0x2f7a3a });
  const pipe = new THREE.Mesh(pipeGeo, pipeMat);
  pipe.position.y = isBoss ? 3.0 : 1.5;
  group.add(pipe);

  // Joint rings
  const ringGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.18, 12);
  const ringMat = new THREE.MeshLambertMaterial({ color: 0x1a3a1f });
  for (let i = 0; i < (isBoss ? 4 : 2); i++) {
    const r = new THREE.Mesh(ringGeo, ringMat);
    r.position.y = (i + 1) * (isBoss ? 1.5 : 1.0);
    group.add(r);
  }

  // Mouth (open top)
  const mouthGeo = new THREE.CylinderGeometry(0.6, 0.5, 0.2, 12);
  const mouthMat = new THREE.MeshLambertMaterial({ color: 0x0d1a0d });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.y = isBoss ? 6.1 : 3.1;
  group.add(mouth);

  if (isBoss) {
    // Splash ring at base for boss tier (lixiviado pool)
    const splashGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.05, 16);
    const splashMat = new THREE.MeshLambertMaterial({ color: 0x3a5a2a });
    const splash = new THREE.Mesh(splashGeo, splashMat);
    splash.position.y = 0.05;
    group.add(splash);
  }

  applyTransform(group, opts);

  const userData = {
    hp: 3,
    puntosKey: "tubo_lixiviado",
    powerupDrops: ["alegacion", "dato"],
    bossScale: 1.8,
  };

  // A7 — uniform desactivacion on ALL 5 bosses. The pipe's
  // pedagogical framing is the same as the other bosses: the
  // industrial threat is "switched off", not exploded.
  if (isBoss) {
    userData.lifecycle = "desactivacion";
  }

  group.userData = userData;
  return group;
}