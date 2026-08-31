# Content Strings Specification

> Change: `zarra-defenders` · Status: NEW full spec (greenfield, no delta)
> REQs: REQ-13 (i18n-ready keyed `STRINGS`), REQ-14 (all user-facing text in one file)
> Architectural decisions folded in: **A2** (STRINGS in `content/data.js`), **A5** (pre-researched `.fuente` strings ship in v1), **A6** (all URLs in STRINGS, zero literals in code)

## Purpose

Defines the contract for ALL user-facing Spanish text in the game, the keyed `STRINGS` object exported from `src/content/data.js`, and the 6 power-up definitions (REQ-5). This is the maintainability backbone of the project: a non-developer must be able to update any dato, enemy label, power-up name, or final-screen link by editing one file. This spec formalizes Architectural decision A2, locks A5 (no `TODO pedagogía` placeholders — citations ship pre-researched from `research/fuentes.md`), and locks A6 (every URL lives in `STRINGS`, zero `https://` literals in code outside `content/data.js`).

**Placement note**: REQ-5 (6 power-ups = acciones cívicas) is defined here as data. `enemy-registry` references the same keys via `userData.powerupDrops` and treats them as opaque ids. Game logic for what each power-up DOES (FIRMA +1 vida, ALEGACIÓN escudo 3 s, etc.) lives in `src/game/powerups.js` and is NOT in this spec — this spec owns the labels and descriptions only.

## Requirements

### Requirement: Single STRINGS Object in `content/data.js`

The system MUST export a single nested `STRINGS` object from `src/content/data.js`. Every Spanish-language string visible to the player MUST be reachable via a key in this object. No other source file under `src/` MAY contain free-prose Spanish copy.

#### Scenario: Grep-verifiable isolation

- GIVEN the codebase is in a state ready for `sdd-verify`
- WHEN the verifier greps the `src/` tree for Spanish prose outside `content/data.js`
- THEN the only matches MUST be inside `content/data.js`
- AND any violation MUST be flagged as a `sdd-apply` defect.

#### Scenario: Adding a new dato is a single-file edit

- GIVEN a new dato is needed (e.g., updated dato for nivel 1)
- WHEN the maintainer edits `content/data.js`
- THEN only that file is touched
- AND no code in `src/game/`, `src/engine/`, or `src/levels/` is required to change.

### Requirement: Nested Key Structure

The `STRINGS` object MUST organize text under at least these top-level keys: `datos`, `enemigos`, `bosses`, `powerups`, `final`, `creditos`, `pausa`, `gameover`, `hud`, `mecanica`, `start`. Each level MUST have its dato under `datos.nivel{n}` with sub-keys `texto` and `fuente` for the citation. The `final` dato MUST live under `datos.final` for symmetry.

#### Scenario: Dato with citation

- GIVEN `STRINGS.datos.nivel1` is defined
- WHEN the data screen for level 1 renders
- THEN `datos.nivel1.texto` MUST display the dato
- AND `datos.nivel1.fuente` MUST display the citation (e.g., "Las Provincias, 24/06/2026")
- AND both MUST come from `content/data.js`.

#### Scenario: Final dato has handoff link

- GIVEN `STRINGS.datos.final` and `STRINGS.final.enlaces`
- WHEN the final screen renders after desactivación
- THEN `datos.final.texto` MUST display the final dato
- AND `final.enlaces.plataforma_url` MUST be reachable as a clickable link
- AND `final.enlaces.alegaciones_url`, `final.enlaces.asociacion_url`, `final.enlaces.hashtag` MUST also be present and linkable.

### Requirement: Pre-Researched `.fuente` Strings Ship in v1 (A5)

`STRINGS.datos.{nivel1, nivel2, nivel3, nivel4, nivel5, final}.fuente` MUST be populated from `research/fuentes.md` (the canonical source). All 6 citation strings MUST be non-empty and cite a named publication + date. NO empty strings and NO `// TODO pedagogía` markers are permitted.

#### Scenario: All 5 levels have datos with real citations

- GIVEN `STRINGS.datos` is fully populated
- WHEN the verifier enumerates `STRINGS.datos`
- THEN it MUST find `nivel1`, `nivel2`, `nivel3`, `nivel4`, `nivel5`, and `final`
- AND each MUST expose non-empty `texto` and `fuente` (per A5)
- AND each `fuente` MUST cite a named publication + date from `research/fuentes.md`
- AND the citations MUST be: Las Provincias 24/06/2026, Agencia del Agua CLM, actualidadvalencia.com 05/08/2026, Las Provincias 24/06/2026, Las Provincias 16/06/2026, Valencia Plaza 31/07/2026.

#### Scenario: No TODO markers in data.js

- GIVEN the production `src/content/data.js`
- WHEN the verifier greps for `TODO pedagogía` (or any `// TODO` containing "pedagogía" / "fuente" / "citation")
- THEN it MUST find zero matches
- AND every `datos.*.fuente` value MUST be a real citation string.

### Requirement: All URLs in STRINGS Keys (A6)

Every URL the player may click — plataforma vecinal, alegaciones form, asociación — MUST live under `STRINGS.final.enlaces.*` with both label AND URL in STRINGS. No `https://` literals are allowed in `src/` outside `src/content/data.js`.

#### Scenario: STRINGS.final.enlaces schema

- GIVEN `STRINGS.final.enlaces`
- WHEN the verifier enumerates its keys
- THEN it MUST contain at minimum: `plataforma`, `plataforma_url`, `alegaciones`, `alegaciones_url`, `asociacion`, `asociacion_url`, `hashtag`
- AND `plataforma_url` MUST equal `https://nomacrovertederozarra.com`
- AND the schema MAY add more pairs (label + url) without violating this spec.

#### Scenario: All URLs in STRINGS keys (A6)

- GIVEN the production `src/` tree
- WHEN the verifier greps for `https://` in `src/`
- THEN it MUST find zero matches outside `src/content/data.js`
- AND `STRINGS.final.enlaces.plataforma_url`, `alegaciones_url`, `asociacion_url` MUST exist with real URLs.

#### Scenario: pedagogy.js reads STRINGS only

- GIVEN `src/game/pedagogy.js` builds the final screen
- WHEN the verifier inspects the source
- THEN every URL it uses MUST come from `STRINGS.final.enlaces.*_url`
- AND no URL literal may be present in that file.

### Requirement: Per-Enemy Labels and Points

Each of the 11 enemies MUST have its `label`, `descripcion`, and `puntos` (base points) defined in `STRINGS.enemigos.{enemyId}`. The label is the HUD name when the enemy is on screen; `puntos` is the base score per `combo-scoring`.

#### Scenario: All 11 enemies have entries

- GIVEN the enemy registry exposes 11 keys
- WHEN the verifier checks `STRINGS.enemigos`
- THEN it MUST find a `label`, `descripcion`, and `puntos` entry for each of the 11 enemy ids
- AND each `puntos` MUST be a positive integer.

#### Scenario: Boss labels under STRINGS.bosses

- GIVEN the 5 bosses (topadora nivel 1, tuberia nivel 2, incineradora nivel 3, trailer nivel 4, planta_treco nivel 5)
- WHEN the HUD shows a boss name on entry
- THEN the label MUST come from `STRINGS.bosses.{bossId}.label`
- AND the boss entry animation MUST display this label.

### Requirement: 6 Power-Ups Defined as Data (REQ-5 placement)

The 6 civic-action power-ups MUST be defined as data in `STRINGS.powerups`: `firma`, `alegacion`, `manifestacion`, `alianza`, `dato`, `hito`. Each MUST have `name`, `descripcion`, and `simbolo` (the HUD glyph or short visual identifier).

#### Scenario: All 6 power-ups present

- GIVEN the power-up catalog
- WHEN the verifier enumerates `STRINGS.powerups`
- THEN it MUST contain exactly 6 entries matching the 6 acciones cívicas in plan §5
- AND each MUST expose `name`, `descripcion`, and `simbolo`.

#### Scenario: HITO cadence is documented

- GIVEN `STRINGS.powerups.hito`
- WHEN the system awards the 1UP
- THEN the threshold (e.g., every 5,000 points per plan §5) MUST be a constant in `content/data.js` (e.g., `mecanica.hito.umbral_pts`)
- AND MUST NOT be hard-coded in `src/game/powerups.js`.

#### Scenario: Power-up drop keys referenced by registry

- GIVEN `enemy-registry` declares `userData.powerupDrops` for an enemy
- WHEN the spawner picks a drop
- THEN the drop id MUST be one of the 6 keys under `STRINGS.powerups`
- AND unknown ids MUST be flagged as a configuration error.

### Requirement: Credits and Final-Screen Links

`STRINGS.creditos.entidades[]` MUST be an array of real, named local entities that the credits screen iterates over. `STRINGS.final.enlaces` MUST include at minimum: `plataforma` (Plataforma vecinal — nomacrovertederozarra.com), `plataforma_url`, `alegaciones` (form label), `alegaciones_url`, `asociacion` (Asociación Naturalista de Ayora y la Valle), `asociacion_url`, and `hashtag` (`#NoAlMacrovertederoDeZarra`).

#### Scenario: Credits iterate the array

- GIVEN the credits screen renders
- WHEN the system iterates `STRINGS.creditos.entidades`
- THEN each entry MUST be displayed (name + optional role)
- AND the list MUST contain at least the entities mentioned in plan §8 (Plataforma No al Macrovertedero, Asociación Naturalista, Grupo Pronto Auxilio).

#### Scenario: Final screen has 4+ links

- GIVEN the final screen renders
- WHEN the verifier inspects `STRINGS.final.enlaces`
- THEN at minimum `plataforma`, `alegaciones`, `asociacion`, `hashtag` MUST be present
- AND each MUST pair a label with a URL (A6).

### Requirement: HUD Strings Localized

HUD labels (ammo counter, life count, score, combo multiplier, master-volume hint) MUST come from `STRINGS.hud` and `STRINGS.mecanica`. The HUD MUST NOT contain hard-coded Spanish in `src/game/hud.js`.

#### Scenario: HUD labels from STRINGS

- GIVEN any HUD element visible during gameplay
- WHEN the verifier inspects the source
- THEN the text MUST come from a key in `STRINGS.hud` or `STRINGS.mecanica`
- AND any inline Spanish literal in `src/game/hud.js` is a violation.

### Requirement: Pedagogical Tone Constraints

Strings in `datos`, `enemigos`, `bosses`, `powerups`, `final`, and `creditos` MUST be written in Castilian castellano (per `openspec/config.yaml` `user_facing_language: es-ES`). Valencianismos forzados, ceceo impostado, and administrative jargon are NOT permitted.

#### Scenario: Tone is Valle castellano

- GIVEN any string under the pedagogical keys
- WHEN the pedagogy reviewer reads the text
- THEN it MUST be in Castilian castellano
- AND MUST be short, direct, and free of bureaucratic jargon
- AND MUST avoid caricature or propaganda tone (R4 mitigation).

## References

- REQ-13 (i18n-ready keyed `STRINGS`, castellano ships v1)
- REQ-14 (final boss desactivación framing; all user-facing text in one file)
- Architectural decision A2 — first-class commitment to `content/data.js` ownership
- Architectural decision **A5** — pre-researched `.fuente` strings from `research/fuentes.md` (NEW vs original)
- Architectural decision **A6** — all URLs in STRINGS, zero literals (NEW vs original)
- Architectural decision A1 — power-up drops referenced by the enemy registry
- REQ-5 (6 power-ups = acciones cívicas) — PLACED HERE as data definition
- plan.md §4 (enemy points), §5 (power-ups), §8 (pedagogy)
- `openspec/config.yaml` — `user_facing_language: es-ES`
- `research/fuentes.md` — canonical citation table for the 6 `.fuente` strings

## Acceptance Notes

- REQ-15 (manual playthrough): the manual playthrough is itself the only way to verify that no Spanish prose is hard-coded in `src/` outside `content/data.js` — combined with a `grep -R` over `src/`.
- REQ-1 (Static HTTP launch) does not constrain this spec.
- This spec is the **single most important maintainability contract** in the project. Any deviation in `sdd-apply` MUST be flagged at `sdd-verify`.
- The `verify.sh` checks for A5 (no `TODO pedagogía` markers, all 6 fuentes populated from `research/fuentes.md`) and A6 (zero `https://` literals outside `content/data.js`) are MANDATORY archive gates.
