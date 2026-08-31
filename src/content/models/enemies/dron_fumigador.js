// content/models/enemies/dron_fumigador.js
//
// Dron fumigador — quadcopter dropping dust. HP=3, 30 pts. Drops
// ALEGACION.

import { applyTransform } from "../../../engine/model-transform.js";

export function makeDronFumigador(opts = {}) {
  const group = new THREE.Group();
  group.name = "dron_fumigador";

  // Central body
  const bodyGeo = new THREE.BoxGeometry(0.8, 0.25, 0.8);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.5;
  group.add(body);

  // Four rotor arms
  const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6);
  const armMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const arms = [
    [ 0.7, 0.5,  0.7,  0,  Math.PI / 4],
    [ 0.7, 0.5, -0.7,  0, -Math.PI / 4],
    [-0.7, 0.5,  0.7,  0, -Math.PI / 4],
    [-0.7, 0.5, -0.7,  0,  Math.PI / 4],
  ];
  for (const [x, y, z, _rx, rz] of arms) {
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(x, y, z);
    arm.rotation.z = rz;
    group.add(arm);
  }

  // Four rotors (thin discs)
  const rotorGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.02, 12);
  const rotorMat = new THREE.MeshBasicMaterial({ color: 0x707880 });
  for (const [x, z] of [[ 1.1,  1.1], [ 1.1, -1.1], [-1.1,  1.1], [-1.1, -1.1]]) {
    const r = new THREE.Mesh(rotorGeo, rotorMat);
    r.position.set(x, 0.62, z);
    group.add(r);
  }

  // Dust plume
  const dropGeo = new THREE.ConeGeometry(0.3, 0.7, 6);
  const dropMat = new THREE.MeshLambertMaterial({
    color: 0xa8a070,
    transparent: true,
    opacity: 0.65,
  });
  const drop = new THREE.Mesh(dropGeo, dropMat);
  drop.position.y = 0.0;
  drop.rotation.x = Math.PI;
  group.add(drop);

  applyTransform(group, opts);

  group.userData = {
    hp: 3,
    puntosKey: "dron_fumigador",
    powerupDrops: ["alegacion", "dato"],
  };
  return group;
}