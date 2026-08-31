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
      { spawns: [
        { id: "plataforma_solar", at: 0   },
        { id: "camion_treco",     at: 4   },
        { id: "bolsa_plastico",   at: 8   },
        { id: "plataforma_solar", at: 12  },
        { id: "dron_fumigador",   at: 16  },
        { id: "valla_publicitaria", at: 20 },
      ]},
      { spawns: [
        { id: "sello_burocratico", at: 0   },
        { id: "plataforma_solar", at: 4   },
        { id: "camion_treco",     at: 8   },
        { id: "dron_fumigador",   at: 12  },
        { id: "sello_burocratico", at: 16  },
        { id: "plataforma_solar", at: 20  },
      ]},
      { spawns: [
        { id: "topadora",         at: 0   },
        { id: "plataforma_solar", at: 4   },
        { id: "sello_burocratico", at: 8   },
        { id: "camion_treco",     at: 12  },
        { id: "dron_fumigador",   at: 16  },
        { id: "topadora",         at: 20  },
        { id: "plataforma_solar", at: 24  },
      ]},
      { spawns: [
        { id: "incineradora",     at: 0   },
        { id: "sello_burocratico", at: 4   },
        { id: "camion_treco",     at: 8   },
        { id: "plataforma_solar", at: 12  },
        { id: "dron_fumigador",   at: 16  },
        { id: "incineradora",     at: 20  },
        { id: "topadora",         at: 24  },
      ]},
      { spawns: [
        { id: "incineradora",     at: 0   },
        { id: "sello_burocratico", at: 3   },
        { id: "dron_fumigador",   at: 6   },
        { id: "incineradora",     at: 10  },
        { id: "plataforma_solar", at: 14  },
        { id: "topadora",         at: 18  },
        { id: "sello_burocratico", at: 22  },
      ]},
    ],
    bossWave: {
      bossId: "incineradora",
      addIds: ["topadora", "sello_burocratico"],
    },
  });
}