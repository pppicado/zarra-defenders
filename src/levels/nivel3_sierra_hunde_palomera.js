// levels/nivel3_sierra_hunde_palomera.js
//
// Nivel 3 - Sierra de La Hunde y Palomera (Ayora). 5 non-boss waves +
// 1 boss. Boss: incineradora industrial movil (variant: 'boss'). Dato:
// STRINGS.datos.nivel3. A7 desactivacion lifecycle applies uniformly
// to this boss.

import { scene } from "../engine/scene.js";
import { registry } from "../content/models/index.js";
import * as waves from "../game/waves.js";

function decorateScene() {
  // Dense pinar.
  const treePositions = [];
  for (let i = 0; i < 24; i++) {
    const x = -16 + Math.random() * 32;
    const z = -40 - i * 5;
    treePositions.push([x, 0, z]);
  }
  for (const [x, y, z] of treePositions) {
    scene.add(registry.pino.make({ position: { x, y, z } }));
  }

  // Distant torre_central reference (Cofrentes nuclear plant silhouette).
  scene.add(registry.torre_central.make({
    position: { x: -40, y: 0, z: -200 },
  }));

  // Cartel at the trail entrance.
  scene.add(registry.cartel.make({ position: { x: 4, y: 0, z: -25 } }));
}

export function start() {
  decorateScene();

  waves.configureLevel({
    waves: [
      // Denser schedule: simultaneous spawns + tighter intervals.
      { spawns: [
        { id: "plataforma_solar",   at: 0   },
        { id: "camion_treco",       at: 0   },
        { id: "bolsa_plastico",     at: 1.5 },
        { id: "plataforma_solar",   at: 3   },
        { id: "dron_fumigador",     at: 4.5 },
        { id: "camion_treco",       at: 6   },
        { id: "bolsa_plastico",     at: 7.5 },
        { id: "plataforma_solar",   at: 9   },
        { id: "dron_fumigador",     at: 10.5 },
        { id: "valla_publicitaria", at: 12  },
      ]},
      { spawns: [
        { id: "sello_burocratico",  at: 0   },
        { id: "plataforma_solar",   at: 0   },
        { id: "camion_treco",       at: 2   },
        { id: "dron_fumigador",     at: 3.5 },
        { id: "plataforma_solar",   at: 5   },
        { id: "sello_burocratico",  at: 6.5 },
        { id: "camion_treco",       at: 8   },
        { id: "dron_fumigador",     at: 9.5 },
        { id: "plataforma_solar",   at: 11  },
      ]},
      { spawns: [
        { id: "topadora",           at: 0   },
        { id: "sello_burocratico",  at: 0   },
        { id: "plataforma_solar",   at: 2   },
        { id: "camion_treco",       at: 3.5 },
        { id: "dron_fumigador",     at: 5   },
        { id: "topadora",           at: 6.5 },
        { id: "plataforma_solar",   at: 8   },
        { id: "sello_burocratico",  at: 9.5 },
        { id: "camion_treco",       at: 11  },
      ]},
      { spawns: [
        { id: "incineradora",       at: 0   },
        { id: "sello_burocratico",  at: 0   },
        { id: "camion_treco",       at: 2   },
        { id: "plataforma_solar",   at: 3   },
        { id: "dron_fumigador",     at: 4.5 },
        { id: "incineradora",       at: 6   },
        { id: "topadora",           at: 7.5 },
        { id: "plataforma_solar",   at: 9   },
        { id: "sello_burocratico",  at: 10.5 },
      ]},
      { spawns: [
        { id: "incineradora",       at: 0   },
        { id: "dron_fumigador",     at: 0   },
        { id: "sello_burocratico",  at: 1.5 },
        { id: "incineradora",       at: 3   },
        { id: "plataforma_solar",   at: 4.5 },
        { id: "dron_fumigador",     at: 6   },
        { id: "topadora",           at: 7.5 },
        { id: "incineradora",       at: 9   },
        { id: "sello_burocratico",  at: 10.5 },
      ]},
    ],
    bossWave: {
      bossId: "incineradora",
      addIds: ["topadora", "sello_burocratico", "plataforma_solar"],
    },
  });
}