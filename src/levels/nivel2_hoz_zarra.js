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
      // Denser schedule: simultaneous spawns (same `at`) + tighter intervals.
      // Up to MECANICA.enemyCap (5) enemies on screen at peak.
      { spawns: [
        { id: "tubo_lixiviado",    at: 0   },
        { id: "bidon_lixiviado",   at: 0   },
        { id: "bolsa_plastico",    at: 1.5 },
        { id: "tubo_lixiviado",    at: 3   },
        { id: "bidon_lixiviado",   at: 4.5 },
        { id: "bolsa_plastico",    at: 6   },
        { id: "dron_fumigador",    at: 7.5 },
        { id: "tubo_lixiviado",    at: 9   },
        { id: "bidon_lixiviado",   at: 10.5 },
        { id: "dron_fumigador",    at: 12  },
      ]},
      { spawns: [
        { id: "dron_fumigador",    at: 0   },
        { id: "sello_burocratico", at: 0   },
        { id: "tubo_lixiviado",    at: 2   },
        { id: "bidon_lixiviado",   at: 3.5 },
        { id: "dron_fumigador",    at: 5   },
        { id: "bolsa_plastico",    at: 6.5 },
        { id: "sello_burocratico", at: 8   },
        { id: "tubo_lixiviado",    at: 9.5 },
        { id: "bidon_lixiviado",   at: 11  },
      ]},
      { spawns: [
        { id: "sello_burocratico", at: 0   },
        { id: "plataforma_solar",  at: 0   },
        { id: "tubo_lixiviado",    at: 2   },
        { id: "dron_fumigador",    at: 3.5 },
        { id: "bidon_lixiviado",   at: 5   },
        { id: "sello_burocratico", at: 6.5 },
        { id: "plataforma_solar",  at: 8   },
        { id: "tubo_lixiviado",    at: 9.5 },
        { id: "dron_fumigador",    at: 11  },
      ]},
      { spawns: [
        { id: "topadora",          at: 0   },
        { id: "dron_fumigador",    at: 0   },
        { id: "tubo_lixiviado",    at: 2   },
        { id: "sello_burocratico", at: 3   },
        { id: "bidon_lixiviado",   at: 4.5 },
        { id: "plataforma_solar",  at: 6   },
        { id: "dron_fumigador",    at: 7.5 },
        { id: "tubo_lixiviado",    at: 9   },
        { id: "sello_burocratico", at: 10.5 },
        { id: "bidon_lixiviado",   at: 12  },
      ]},
    ],
    bossWave: {
      bossId: "tubo_lixiviado",
      addIds: ["bidon_lixiviado", "dron_fumigador", "sello_burocratico"],
    },
  });
}