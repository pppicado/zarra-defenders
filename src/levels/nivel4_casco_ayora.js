// levels/nivel4_casco_ayora.js
//
// Nivel 4 - Casco de Ayora. 4 non-boss waves + 1 boss wave. Boss:
// trailer cargado de bidones (variant: 'boss'). Dato: STRINGS.datos.nivel4.
// A7 desactivacion lifecycle applies uniformly to this boss.

import { scene } from "../engine/scene.js";
import { registry } from "../content/models/index.js";
import * as waves from "../game/waves.js";

function decorateScene() {
  // Village street: casa_ayora buildings lining both sides.
  const buildingOffsets = [
    [-8, 0, -50], [-8, 0, -90], [-8, 0, -130],
    [ 8, 0, -55], [ 8, 0, -95], [ 8, 0, -135],
  ];
  for (const [x, y, z] of buildingOffsets) {
    scene.add(registry.casa_ayora.make({
      position: { x, y, z },
      rotation: { x: 0, y: x < 0 ? -Math.PI / 2 : Math.PI / 2, z: 0 },
    }));
  }

  // Distant castillo_cofrentes silhouette on the horizon.
  scene.add(registry.castillo_cofrentes.make({
    position: { x: -50, y: 0, z: -200 },
  }));

  // Carteles + vallas along the street.
  scene.add(registry.cartel.make({ position: { x: -3, y: 0, z: -65 } }));
  scene.add(registry.valla.make({ position: { x: 4, y: 0, z: -110 } }));
}

export function start() {
  decorateScene();

  waves.configureLevel({
    waves: [
      // Denser schedule: simultaneous spawns + tighter intervals.
      { spawns: [
        { id: "trailer",           at: 0   },
        { id: "camion_treco",      at: 0   },
        { id: "bolsa_plastico",    at: 1.5 },
        { id: "trailer",           at: 3   },
        { id: "bidon_lixiviado",   at: 4.5 },
        { id: "camion_treco",      at: 6   },
        { id: "bolsa_plastico",    at: 7.5 },
        { id: "trailer",           at: 9   },
        { id: "bidon_lixiviado",   at: 10.5 },
        { id: "camion_treco",      at: 12  },
      ]},
      { spawns: [
        { id: "sello_burocratico", at: 0   },
        { id: "trailer",           at: 0   },
        { id: "bolsa_plastico",    at: 2   },
        { id: "camion_treco",      at: 3.5 },
        { id: "sello_burocratico", at: 5   },
        { id: "trailer",           at: 6.5 },
        { id: "bidon_lixiviado",   at: 8   },
        { id: "bolsa_plastico",    at: 9.5 },
        { id: "trailer",           at: 11  },
      ]},
      { spawns: [
        { id: "topadora",          at: 0   },
        { id: "trailer",           at: 0   },
        { id: "sello_burocratico", at: 2   },
        { id: "dron_fumigador",    at: 3.5 },
        { id: "camion_treco",      at: 5   },
        { id: "trailer",           at: 6.5 },
        { id: "topadora",          at: 8   },
        { id: "sello_burocratico", at: 9.5 },
        { id: "trailer",           at: 11  },
      ]},
      { spawns: [
        { id: "trailer",           at: 0   },
        { id: "sello_burocratico", at: 0   },
        { id: "topadora",          at: 1.5 },
        { id: "trailer",           at: 3   },
        { id: "dron_fumigador",    at: 4.5 },
        { id: "bolsa_plastico",    at: 6   },
        { id: "trailer",           at: 7.5 },
        { id: "incineradora",      at: 9   },
        { id: "sello_burocratico", at: 10.5 },
        { id: "camion_treco",      at: 12  },
      ]},
    ],
    bossWave: {
      bossId: "trailer",
      addIds: ["topadora", "sello_burocratico", "camion_treco"],
    },
  });
}