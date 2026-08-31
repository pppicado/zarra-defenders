// content/models/index.js
//
// Single public API for 3D models. Per architectural decision A1 and the
// enemy-registry spec §Model-Blueprint Registry Layout, every level /
// enemy spawner MUST go through this registry — it never imports the
// per-category sub-folders directly.
//
// The registry owns:
//   - `get(id)` -> { make(opts) -> THREE.Group, ... } for the given key.
//   - `keys()` -> string[] of every registered id.
//   - Throws a descriptive error on unknown key at lookup time (per spec
//     §Unknown key is a hard error).
//
// A1 contract — pure factory: each `make()` call returns an independent
// THREE.Group (no shared mutable state between instances).
// userData = { hp: number, puntosKey: string, powerupDrops: string[],
//              lifecycle?: 'desactivacion' }
//
// A7 contract — every boss factory (topadora, tubo_lixiviado,
// incineradora, trailer, planta_treco) sets
// `userData.lifecycle = 'desactivacion'` when called with
// `{ variant: 'boss' }`. `game/enemies.js destroyEnemy()` checks the
// flag uniformly and routes ALL 5 bosses through the same desaturation +
// motion-stop path.

import { makeEncina }      from "./trees/encina.js";
import { makePino }        from "./trees/pino.js";
import { makeAlmendro }    from "./trees/almendro.js";

import { makeCamionTreco }       from "./enemies/camion_treco.js";
import { makeBidonLixiviado }    from "./enemies/bidon_lixiviado.js";
import { makeBolsaPlastico }     from "./enemies/bolsa_plastico.js";
import { makeVallaPublicitaria } from "./enemies/valla_publicitaria.js";
import { makePlataformaSolar }   from "./enemies/plataforma_solar.js";
import { makeTuboLixiviado }     from "./enemies/tubo_lixiviado.js";
import { makeDronFumigador }     from "./enemies/dron_fumigador.js";
import { makeSelloBurocratico }  from "./enemies/sello_burocratico.js";
import { makeTopadora }          from "./enemies/topadora.js";
import { makeIncineradora }      from "./enemies/incineradora.js";
import { makeTrailer }           from "./enemies/trailer.js";
import { makePlantaTreco }       from "./enemies/planta_treco.js";

import { makeValla }         from "./props/valla.js";
import { makeRoca }          from "./props/roca.js";
import { makeCartel }        from "./props/cartel.js";

import { makeCasaAyora }          from "./buildings/casa_ayora.js";
import { makeCastilloCofrentes }  from "./buildings/castillo_cofrentes.js";
import { makeTorreCentral }       from "./buildings/torre_central.js";

export const registry = {
  // Trees -------------------------------------------------------------
  encina:   { make: makeEncina },
  pino:     { make: makePino },
  almendro: { make: makeAlmendro },

  // Enemies (11 standard + 1 dedicated boss) --------------------------
  camion_treco:       { make: makeCamionTreco },
  bidon_lixiviado:    { make: makeBidonLixiviado },
  bolsa_plastico:     { make: makeBolsaPlastico },
  valla_publicitaria: { make: makeVallaPublicitaria },
  plataforma_solar:   { make: makePlataformaSolar },
  tubo_lixiviado:     { make: makeTuboLixiviado },
  dron_fumigador:     { make: makeDronFumigador },
  sello_burocratico:  { make: makeSelloBurocratico },
  topadora:           { make: makeTopadora },
  incineradora:       { make: makeIncineradora },
  trailer:            { make: makeTrailer },
  planta_treco:       { make: makePlantaTreco },

  // Props -------------------------------------------------------------
  valla:  { make: makeValla },
  roca:   { make: makeRoca },
  cartel: { make: makeCartel },

  // Buildings ---------------------------------------------------------
  casa_ayora:         { make: makeCasaAyora },
  castillo_cofrentes: { make: makeCastilloCofrentes },
  torre_central:      { make: makeTorreCentral },
};

const KEY_SET = new Set(Object.keys(registry));

/**
 * Look up a model factory by id. Throws on unknown keys (per enemy-registry
 * spec §Unknown key is a hard error). Callers MUST use this function
 * rather than reaching into the registry object directly — that keeps the
 * "no inline THREE.Group geometry outside the factory" contract (A1)
 * verifiable by grep.
 */
export function get(id) {
  if (!KEY_SET.has(id)) {
    throw new Error(
      `registry.get: unknown model id '${id}'. ` +
      `Known ids: ${[...KEY_SET].sort().join(", ")}. ` +
      `Add the factory to src/content/models/{trees,enemies,props,buildings}/ and import it here.`
    );
  }
  return registry[id];
}

export function keys() {
  return Object.keys(registry);
}