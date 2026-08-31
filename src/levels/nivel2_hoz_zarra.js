// levels/nivel2_hoz_zarra.js
//
// Nivel 2 - La Hoz del rio Zarra. 4 non-boss waves + 1 boss wave.
// Boss: tuberia industrial de lixiviados (tubo_lixiviado,
// variant:'boss'). Dato from STRINGS.datos.nivel2. A7 desactivacion
// lifecycle applies uniformly to this boss.

import { scene } from "../engine/scene.js";
import { registry } from "../content/models/index.js";
import * as waves from "../game/waves.js";

function decorateScene() {
  // Walls of the hoz: pinos lining the path, rocks on the slope.
  const treePositions = [
    [-10,  0, -40], [-12, 0, -70], [-14, 0, -100], [-15, 0, -130],
    [ 10,  0, -45], [ 12, 0, -75], [ 14, 0, -105], [ 15, 0, -135],
  ];
  for (const [x, y, z] of treePositions) {
    scene.add(registry.pino.make({ position: { x, y, z } }));
  }

  // Rocky slope.
  const rockPositions = [
    [-6, 0, -50], [-8, 0, -90], [-7, 0, -120],
    [ 6, 0, -55], [ 8, 0, -95], [ 7, 0, -125],
  ];
  for (const [x, y, z] of rockPositions) {
    scene.add(registry.roca.make({ position: { x, y, z } }));
  }

  // Cartel warning.
  scene.add(registry.cartel.make({ position: { x: -3, y: 0, z: -60 } }));
}

export function start() {
  decorateScene();

  waves.configureLevel({
    waves: [
      { spawns: [
        { id: "tubo_lixiviado",    at: 0   },
        { id: "bidon_lixiviado",   at: 3   },
        { id: "bidon_lixiviado",   at: 6   },
        { id: "bolsa_plastico",    at: 9   },
        { id: "tubo_lixiviado",    at: 13 },
        { id: "bidon_lixiviado",   at: 17 },
        { id: "dron_fumigador",    at: 22 },
      ]},
      { spawns: [
        { id: "dron_fumigador",    at: 0   },
        { id: "tubo_lixiviado",    at: 4   },
        { id: "bidon_lixiviado",   at: 7   },
        { id: "bolsa_plastico",    at: 10  },
        { id: "sello_burocratico", at: 13  },
        { id: "dron_fumigador",    at: 17  },
        { id: "tubo_lixiviado",    at: 21  },
      ]},
      { spawns: [
        { id: "sello_burocratico", at: 0   },
        { id: "plataforma_solar",  at: 4   },
        { id: "tubo_lixiviado",    at: 8   },
        { id: "dron_fumigador",    at: 12  },
        { id: "sello_burocratico", at: 16  },
        { id: "plataforma_solar",  at: 20  },
      ]},
      { spawns: [
        { id: "topadora",          at: 0   },
        { id: "tubo_lixiviado",    at: 4   },
        { id: "dron_fumigador",    at: 8   },
        { id: "sello_burocratico", at: 12  },
        { id: "plataforma_solar",  at: 16  },
        { id: "bidon_lixiviado",   at: 20  },
        { id: "tubo_lixiviado",    at: 23  },
      ]},
    ],
    bossWave: {
      bossId: "tubo_lixiviado",
      addIds: ["bidon_lixiviado", "dron_fumigador"],
    },
  });
}