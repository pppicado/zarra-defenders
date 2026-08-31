// content/models/enemies/plataforma_solar.js
//
// Plataforma solar — panel fotovoltaico avanzando. HP=3, 25 pts.

import { applyTransform } from "../../../engine/model-transform.js";

export function makePlataformaSolar(opts = {}) {
  const group = new THREE.Group();
  group.name = "plataforma_solar";

  // Frame
  const frameGeo = new THREE.BoxGeometry(3.0, 0.15, 2.0);
  const frameMat = new THREE.MeshLambertMaterial({ color: 0x707a80 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.y = 0.5;
  group.add(frame);

  // Panel surface (blueish)
  const panelGeo = new THREE.BoxGeometry(2.8, 0.05, 1.8);
  const panelMat = new THREE.MeshLambertMaterial({ color: 0x1f2a55 });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.y = 0.65;
  group.add(panel);

  // Cell grid lines (visual hint)
  for (let i = 0; i < 5; i++) {
    const lineGeo = new THREE.BoxGeometry(0.04, 0.06, 1.8);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x101830 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.set(-1.2 + i * 0.6, 0.69, 0);
    group.add(line);
  }

  // Post legs
  const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
  const legMat = new THREE.MeshLambertMaterial({ color: 0x4a5054 });
  for (const [x, z] of [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]]) {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, 0.25, z);
    group.add(leg);
  }

  applyTransform(group, opts);

  group.userData = {
    hp: 3,
    puntosKey: "plataforma_solar",
    powerupDrops: ["manifestacion", "dato"],
  };
  return group;
}