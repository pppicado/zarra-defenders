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
      { spawns: [
        { id: "trailer",           at: 0   },
        { id: "camion_treco",      at: 4   },
        { id: "bolsa_plastico",    at: 8   },
        { id: "trailer",           at: 13  },
        { id: "bidon_lixiviado",   at: 17  },
        { id: "camion_treco",      at: 21  },
      ]},
      { spawns: [
        { id: "sello_burocratico", at: 0   },
        { id: "trailer",           at: 4   },
        { id: "bolsa_plastico",    at: 8   },
        { id: "camion_treco",      at: 12  },
        { id: "sello_burocratico", at: 16  },
        { id: "trailer",           at: 20  },
        { id: "bidon_lixiviado",   at: 23  },
      ]},
      { spawns: [
        { id: "topadora",          at: 0   },
        { id: "trailer",           at: 4   },
        { id: "sello_burocratico", at: 8   },
        { id: "dron_fumigador",    at: 12  },
        { id: "camion_treco",      at: 16  },
        { id: "trailer",           at: 20  },
      ]},
      { spawns: [
        { id: "trailer",           at: 0   },
        { id: "sello_burocratico", at: 3   },
        { id: "topadora",          at: 6   },
        { id: "trailer",           at: 10  },
        { id: "dron_fumigador",    at: 14  },
        { id: "bolsa_plastico",    at: 18  },
        { id: "incineradora",      at: 22  },
      ]},
    ],
    bossWave: {
      bossId: "trailer",
      addIds: ["topadora", "sello_burocratico"],
    },
  });
}