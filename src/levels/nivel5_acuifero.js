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
// level module never embeds URL literals.

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
      // Denser schedule: simultaneous spawns + tighter intervals.
      { spawns: [
        { id: "dron_fumigador",     at: 0   },
        { id: "tubo_lixiviado",     at: 0   },
        { id: "bidon_lixiviado",    at: 1.5 },
        { id: "dron_fumigador",     at: 3   },
        { id: "sello_burocratico",  at: 4.5 },
        { id: "tubo_lixiviado",     at: 6   },
        { id: "dron_fumigador",     at: 7.5 },
        { id: "bidon_lixiviado",    at: 9   },
        { id: "tubo_lixiviado",     at: 10.5 },
        { id: "dron_fumigador",     at: 12  },
      ]},
      { spawns: [
        { id: "topadora",           at: 0   },
        { id: "dron_fumigador",     at: 0   },
        { id: "tubo_lixiviado",     at: 2   },
        { id: "sello_burocratico",  at: 3.5 },
        { id: "incineradora",       at: 5   },
        { id: "dron_fumigador",     at: 6.5 },
        { id: "topadora",           at: 8   },
        { id: "tubo_lixiviado",     at: 9.5 },
        { id: "dron_fumigador",     at: 11  },
      ]},
      { spawns: [
        { id: "incineradora",       at: 0   },
        { id: "sello_burocratico",  at: 0   },
        { id: "dron_fumigador",     at: 2   },
        { id: "trailer",            at: 3.5 },
        { id: "topadora",           at: 5   },
        { id: "incineradora",       at: 6.5 },
        { id: "sello_burocratico",  at: 8   },
        { id: "trailer",            at: 9.5 },
        { id: "dron_fumigador",     at: 11  },
      ]},
      { spawns: [
        { id: "trailer",            at: 0   },
        { id: "topadora",           at: 0   },
        { id: "dron_fumigador",     at: 2   },
        { id: "incineradora",       at: 3.5 },
        { id: "sello_burocratico",  at: 5   },
        { id: "trailer",            at: 6.5 },
        { id: "tubo_lixiviado",     at: 8   },
        { id: "dron_fumigador",     at: 9.5 },
        { id: "trailer",            at: 11  },
        { id: "incineradora",       at: 12.5 },
      ]},
    ],
    bossWave: {
      bossId: "planta_treco",
      addIds: ["incineradora", "sello_burocratico", "dron_fumigador"],
    },
  });
}