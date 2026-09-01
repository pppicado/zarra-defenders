// levels/nivel1_hoyas_caballero.js
//
// Nivel 1 - Las Hoyas de Caballero (Zarra). 4 non-boss waves + 1 boss
// wave. Boss: topadora arrancando encinas. Dato from STRINGS.datos.nivel1.
//
// Per design D5 + enemy-registry spec, the level calls
// `registry.get(id).make()` for both enemies and the boss. The boss here
// is the topadora factory with `variant: 'boss'`. A7 desactivacion
// lifecycle applies uniformly to this boss.

import { scene } from "../engine/scene.js";
import { registry } from "../content/models/index.js";
import * as waves from "../game/waves.js";

function decorateScene() {
  // Background: scattered encinas + almendros lining the path.
  const treePositions = [
    [-18,  0, -50], [-25,  0, -75], [-30,  0, -30], [-12, 0, -90],
    [ 18,  0, -55], [ 22,  0, -35], [ 28,  0, -80], [ 14, 0, -100],
    [-10,  0, -120],[ 10,  0, -130],
  ];
  for (const [x, y, z] of treePositions) {
    const t = Math.random() < 0.5
      ? registry.encina.make({ position: { x, y, z } })
      : registry.almendro.make({ position: { x, y, z } });
    scene.add(t);
  }

  // Two vallas (props) along the path.
  scene.add(registry.valla.make({ position: { x: -3, y: 0, z: -40 } }));
  scene.add(registry.valla.make({ position: { x:  3, y: 0, z: -70 } }));

  // Distant building silhouette.
  scene.add(registry.casa_ayora.make({
    position: { x: -25, y: 0, z: -150 },
    rotation: { x: 0, y: Math.PI / 6, z: 0 },
  }));
}

export function start() {
  decorateScene();

  waves.configureLevel({
    waves: [
      // Denser schedule: simultaneous spawns + tighter intervals.
      { spawns: [
        { id: "valla_publicitaria", at: 0   },
        { id: "camion_treco",       at: 0   },
        { id: "bolsa_plastico",     at: 1.5 },
        { id: "camion_treco",       at: 3   },
        { id: "bidon_lixiviado",    at: 4   },
        { id: "bolsa_plastico",     at: 5.5 },
        { id: "camion_treco",       at: 7   },
        { id: "valla_publicitaria", at: 8.5 },
        { id: "bidon_lixiviado",    at: 10  },
        { id: "bolsa_plastico",     at: 11.5 },
      ]},
      { spawns: [
        { id: "dron_fumigador",     at: 0   },
        { id: "camion_treco",       at: 0   },
        { id: "bidon_lixiviado",    at: 2   },
        { id: "bolsa_plastico",     at: 3   },
        { id: "camion_treco",       at: 4.5 },
        { id: "valla_publicitaria", at: 6   },
        { id: "dron_fumigador",     at: 7   },
        { id: "bidon_lixiviado",    at: 8.5 },
        { id: "camion_treco",       at: 10  },
        { id: "bolsa_plastico",     at: 11.5 },
      ]},
      { spawns: [
        { id: "plataforma_solar",   at: 0   },
        { id: "dron_fumigador",     at: 0   },
        { id: "camion_treco",       at: 2   },
        { id: "bolsa_plastico",     at: 3   },
        { id: "plataforma_solar",   at: 4.5 },
        { id: "bidon_lixiviado",    at: 6   },
        { id: "dron_fumigador",     at: 7   },
        { id: "camion_treco",       at: 8.5 },
        { id: "plataforma_solar",   at: 10  },
        { id: "dron_fumigador",     at: 11  },
      ]},
      { spawns: [
        { id: "sello_burocratico",  at: 0   },
        { id: "dron_fumigador",     at: 0   },
        { id: "plataforma_solar",   at: 1.5 },
        { id: "camion_treco",       at: 3   },
        { id: "sello_burocratico",  at: 4.5 },
        { id: "bidon_lixiviado",    at: 6   },
        { id: "camion_treco",       at: 7.5 },
        { id: "plataforma_solar",   at: 9   },
        { id: "topadora",           at: 10.5 },
      ]},
    ],
    bossWave: {
      bossId: "topadora",
      addIds: ["camion_treco", "valla_publicitaria", "sello_burocratico"],
    },
  });
}