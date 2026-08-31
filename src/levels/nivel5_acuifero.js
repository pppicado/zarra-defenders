// levels/nivel5_acuifero.js
//
// Nivel 5 - El Acuifero (jefe final). 4 non-boss waves + 1 boss wave.
// Boss: planta_treco (DEDICATED factory, lifecycle: 'desactivacion').
// On desactivacion -> final screen (per data-screen spec §Final Screen).
//
// Per design D6 + boss-system spec, the planta_treco factory is invoked
// here with `variant: 'boss'`. Its lifecycle flag triggers
// desaturation + motion-stop, NOT an explosion. Per A7 the same
// desactivacion path applies uniformly to all 5 bosses.
//
// Final screen links are sourced from STRINGS.final.enlaces (A6): the
// level module never embeds https:// literals.

import { scene } from "../engine/scene.js";
import { registry } from "../content/models/index.js";
import * as waves from "../game/waves.js";

function decorateScene() {
  // Underground cave feel — dark blue/grey rocks lining the path.
  const rockPositions = [];
  for (let i = 0; i < 16; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (8 + Math.random() * 6);
    const z = -40 - i * 8;
    rockPositions.push([x, 0, z]);
  }
  for (const [x, y, z] of rockPositions) {
    scene.add(registry.roca.make({ position: { x, y, z } }));
  }

  // Distant castillo + torre silhouetted at the cave mouth.
  scene.add(registry.torre_central.make({
    position: { x: 30, y: 0, z: -180 },
  }));

  // Subtle warning cartel.
  scene.add(registry.cartel.make({ position: { x: -3, y: 0, z: -55 } }));
}

export function start() {
  decorateScene();

  waves.configureLevel({
    waves: [
      { spawns: [
        { id: "dron_fumigador",     at: 0   },
        { id: "tubo_lixiviado",     at: 4   },
        { id: "dron_fumigador",     at: 8   },
        { id: "sello_burocratico",  at: 12  },
        { id: "bidon_lixiviado",    at: 16  },
        { id: "dron_fumigador",     at: 20  },
      ]},
      { spawns: [
        { id: "topadora",           at: 0   },
        { id: "dron_fumigador",     at: 4   },
        { id: "tubo_lixiviado",     at: 8   },
        { id: "sello_burocratico",  at: 12  },
        { id: "incineradora",       at: 16  },
        { id: "dron_fumigador",     at: 20  },
        { id: "topadora",           at: 24  },
      ]},
      { spawns: [
        { id: "incineradora",       at: 0   },
        { id: "sello_burocratico",  at: 4   },
        { id: "dron_fumigador",     at: 8   },
        { id: "trailer",            at: 12  },
        { id: "topadora",           at: 16  },
        { id: "incineradora",       at: 20  },
        { id: "sello_burocratico",  at: 24  },
      ]},
      { spawns: [
        { id: "trailer",            at: 0   },
        { id: "topadora",           at: 4   },
        { id: "dron_fumigador",     at: 8   },
        { id: "incineradora",       at: 12  },
        { id: "sello_burocratico",  at: 16  },
        { id: "trailer",            at: 20  },
        { id: "tubo_lixiviado",     at: 24  },
      ]},
    ],
    bossWave: {
      bossId: "planta_treco",
      addIds: ["incineradora", "sello_burocratico"],
    },
  });
}