# Enemy Registry Specification

> Change: `zarra-defenders` · Status: NEW full spec (greenfield, no delta)
> REQs: REQ-4 (11 enemies + 5 bosses across 5 levels)
> Architectural decisions folded in: **A1** (model-blueprint registry)

## Purpose

Defines the central registry of all 3D model factories — trees, enemies, props, and buildings — and the contract for how levels and spawners request models. This is the architectural backbone of content/code separation: a non-developer maintainer can swap or improve any model by editing one file without touching game logic. This spec formalizes Architectural decision A1 and locks the catalog (11 standard enemies + 5 bosses reusing 4 of them + 1 dedicated `planta_treco` factory + 3 trees + 3 props + 3 buildings).

## Requirements

### Requirement: Model-Blueprint Registry Layout

The system MUST expose a single registry at `src/content/models/index.js` that maps a string key to a model factory. Levels and enemy spawners MUST consume the registry exclusively; they MUST NOT construct `THREE.Group` geometry inline.

#### Scenario: Lookup by key

- GIVEN the registry exposes `camion_treco`
- WHEN a wave spawner requests `registry.get('camion_treco').make({ position: {x:0, y:0, z:-10} })`
- THEN the registry MUST return a fully-constructed `THREE.Group` placed at the requested position
- AND the spawner MUST NOT need to import any Three.js geometry constructor directly.

#### Scenario: Unknown key is a hard error

- GIVEN the registry does not expose `enemigo_inexistente`
- WHEN any code path calls `registry.get('enemigo_inexistente')`
- THEN the system MUST throw a descriptive error at module load or first lookup
- AND the missing key MUST be reported in the error message so the maintainer can fix the catalog.

### Requirement: Pure Factory Signature

Every model factory MUST accept `{ variant?, position?, rotation? }` and return a `THREE.Group`. The factory MUST be pure: invoking it twice with the same arguments MUST produce two independent `THREE.Group` instances (no shared mutable state).

#### Scenario: Factory purity

- GIVEN `makeCamionTreco({})`
- WHEN the factory is called twice
- THEN the two returned groups MUST be independent objects
- AND moving or modifying one MUST NOT affect the other.

#### Scenario: Optional variant parameter

- GIVEN the boss-capable factory `makeTopadora`
- WHEN called with `{ variant: 'boss' }`
- THEN the returned group MUST have the boss-scale geometry, HP-aware metadata, and boss-tier hitbox
- AND MUST be visually distinguishable from a `'standard'` variant of the same factory.

### Requirement: Enemy Catalog (11 Standard Enemies)

The enemies registry MUST contain exactly these 11 entries, keyed by Spanish snake_case id: `camion_treco`, `bidon_lixiviado`, `dron_fumigador`, `topadora`, `incineradora`, `trailer`, `valla_publicitaria`, `plataforma_solar`, `tubo_lixiviado`, `bolsa_plastico`, `sello_burocratico`. **`sello_burocratico` is mandatory** — added because the original model-blueprint omitted it; it represents the bureaucratic seal that approves the project (5 golpes, 40 pts, Heavy tier).

#### Scenario: All 11 enemies reachable

- GIVEN the enemy registry is fully loaded
- WHEN the verifier iterates the catalog
- THEN all 11 enemy keys MUST resolve to factories
- AND `sello_burocratico` MUST be present (Heavy tier, 5 golpes, 40 pts).

#### Scenario: Bosses reuse the same factory with `variant: 'boss'`

- GIVEN `topadora`, `tubo_lixiviado`, `incineradora`, `trailer` are 4 of the 11 entries
- WHEN a level spawns a boss
- THEN it MUST call the same factory with `{ variant: 'boss' }`
- AND MUST NOT import a separate "boss-only" file.

### Requirement: Dedicated `planta_treco` Boss Factory

The level-5 final boss MUST have a dedicated factory `makePlantaTreco` under `src/content/models/enemies/planta_treco.js`. Its lifecycle (desactivación, not destruction) is distinct enough that a boss-variant of another enemy is NOT acceptable.

#### Scenario: Planta TRECO as a dedicated factory

- GIVEN the level-5 boss wave
- WHEN the wave spawner emits the boss
- THEN it MUST call `registry.get('planta_treco').make({ variant: 'boss' })`
- AND the resulting group MUST carry metadata that disables its destruction animation in favor of desactivación.

#### Scenario: Planta TRECO is not a variant of another enemy

- GIVEN the registry exposes `incineradora` and `planta_treco` as separate entries
- WHEN the verifier searches for cross-references
- THEN `planta_treco` MUST NOT be reachable as a `variant` of `incineradora`
- AND the lifecycle code MUST distinguish the two.

### Requirement: Per-Category Folders

Model files MUST be organized under `src/content/models/{trees,enemies,props,buildings}/`. The `index.js` MUST be the single public API; sub-folders MUST NOT be imported directly by levels or game logic.

#### Scenario: Folder layout

- GIVEN the registry layout
- WHEN the verifier inspects `src/content/models/`
- THEN it MUST find sub-folders `trees/`, `enemies/`, `props/`, `buildings/`
- AND each MUST contain one file per model in the catalog.

#### Scenario: Levels do not import sub-folders

- GIVEN any file under `src/levels/` or `src/game/`
- WHEN the verifier greps for `content/models/trees/` or `content/models/enemies/`
- THEN it MUST find no matches
- AND all such access MUST go through `content/models/index.js`.

### Requirement: Power-Up Drop Compatibility

Enemy factories SHOULD be able to declare which power-up they may drop on destruction (FIRMA, ALEGACIÓN, MANIFESTACIÓN, ALIANZA, DATO). The actual drop probability is configured at the wave level, but the factory MUST expose the list so spawners can read it.

#### Scenario: Factory exposes drop list

- GIVEN `makeDronFumigador({})`
- WHEN the spawner inspects the returned group's `userData.powerupDrops`
- THEN the list MUST be readable
- AND MUST contain at least one of the 6 power-up ids from `content-strings`.

#### Scenario: Factory with no drops

- GIVEN an enemy that drops nothing (e.g., `valla_publicitaria`)
- WHEN the spawner inspects `userData.powerupDrops`
- THEN the list MUST be empty
- AND MUST NOT be `undefined`.

### Requirement: All 5 Bosses Set `lifecycle: 'desactivacion'` (A7)

Every boss factory — including the 4 reused (`topadora`, `tubo_lixiviado`, `incineradora`, `trailer`) and the dedicated `planta_treco` — MUST set `userData.lifecycle = 'desactivacion'` in its `make()` function when called with `{ variant: 'boss' }`. `src/game/enemies.js destroyEnemy()` MUST check the flag uniformly and apply desaturation + motion halt + dispatch `zarra:desactivacion`. No boss factory may fall through to the standard destruction path.

#### Scenario: All 5 bosses carry the desactivación flag

- GIVEN the 5 boss-capable factories
- WHEN each is invoked with `{ variant: 'boss' }`
- THEN the returned group's `userData.lifecycle` MUST equal `'desactivacion'` for all 5
- AND `src/game/bosses.js` MUST treat them via the same desactivación code path.

## References

- REQ-4 (11 enemy types + 5 bosses across 5 levels)
- Architectural decision A1 — model-blueprint registry
- plan.md §3 (level-boss narrative) and §4 (enemy catalog)
- Architectural decision **A7** (boss desactivación on all 5) — referenced in `boss-system` and enforced here at the factory level
- REQ-5 (power-ups) — referenced via the `userData.powerupDrops` contract; canonical power-up definitions live in `content-strings` per REQ-13

## Acceptance Notes

- REQ-15 (manual playthrough): all 11 enemy types + 5 bosses must be observed spawning at least once across a 5-level run.
- The 11th-enemy addition (`sello_burocratico`) is the highest-leverage correction from the exploration phase; if it is missing at archive time, the change must be reopened.
- `verify.sh` MUST confirm: (a) all 11 standard enemy keys resolve, (b) `planta_treco` is its own factory, and (c) every boss factory sets `userData.lifecycle = 'desactivacion'`. Failure on any of these is an archive-blocker.
