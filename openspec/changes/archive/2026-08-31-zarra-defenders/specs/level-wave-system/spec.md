# Level-Wave System Specification

> Change: `zarra-defenders` · Status: NEW full spec (greenfield, no delta)
> REQs: REQ-3 (5 levels tied to real Valle locations), REQ-6 (wave schema)

## Purpose

Defines how each of the 5 levels is partitioned into waves, how waves spawn and rest, the maximum concurrency cap, and how the closing wave is composed (boss + adds). This is the pacing backbone of every level; without it there is no "level", only continuous spawning.

## Requirements

### Requirement: Wave Count Per Level

Each level MUST be partitioned into exactly 4 or 5 waves. The final wave of every level MUST be the boss wave; non-final waves MUST contain only standard enemies drawn from the catalog.

#### Scenario: Level 1 uses 4 non-boss waves

- GIVEN a level whose design needs a shorter arc (e.g., nivel 1 — Las Hoyas de Caballero)
- WHEN the level is constructed
- THEN the wave list MUST contain 4 non-boss waves followed by 1 boss wave
- AND no wave other than the last may contain a boss factory.

#### Scenario: Level 3 uses 5 non-boss waves

- GIVEN a level whose design needs a longer arc (e.g., nivel 3 — Sierra de La Hunde y Palomera)
- WHEN the level is constructed
- THEN the wave list MUST contain 5 non-boss waves followed by 1 boss wave.

### Requirement: Wave Duration

A non-boss wave MUST last approximately 30 seconds of active spawn time. Wave expiry MUST be defined as "no enemies left on screen and ≥15 s elapsed" rather than a hard timer alone, so a wave with leftover enemies does not end prematurely.

#### Scenario: Normal-length wave

- GIVEN a wave configured with the standard 30 s budget
- WHEN the spawner has emitted all wave members and the last enemy is destroyed at the 22 s mark
- THEN the wave MUST end at 22 s
- AND the inter-wave rest MUST begin immediately.

#### Scenario: Lingering enemy extends the wave

- GIVEN a wave whose last enemy is still alive at the 30 s mark
- WHEN the timer would otherwise expire
- THEN the wave MUST remain active until that enemy is destroyed
- AND the 4 s inter-wave rest MUST NOT start while any enemy is on screen.

### Requirement: Inter-Wave Rest

Between consecutive waves the system MUST pause spawning for 4 seconds. During the rest, the HUD SHOULD indicate an incoming-wave warning (countdown or "¡Preparados!"), and no enemies MAY spawn.

#### Scenario: 4 s rest between waves

- GIVEN wave N has ended
- WHEN 4 s elapse with the screen clear of enemies
- THEN wave N+1 MUST begin spawning
- AND the player MUST have visual notice of the rest (countdown or text).

#### Scenario: Pause during inter-wave rest

- GIVEN the player presses ESC during the 4 s inter-wave rest
- WHEN the overlay opens
- THEN the rest timer MUST be suspended (not advance toward 0 while paused)
- AND on resume the timer MUST continue from where it stopped.

### Requirement: Maximum Concurrent Enemies

At any instant, the system MUST NOT have more than 3 enemies simultaneously active on screen (excluding the boss). If the spawner would exceed 3, it MUST queue the next spawn until one of the active enemies is destroyed.

#### Scenario: Cap respected during burst spawn

- GIVEN a wave whose spawn schedule would emit 5 enemies within a 3-second window
- WHEN 3 enemies are already active
- THEN the spawner MUST delay emissions 4 and 5 until an active enemy is destroyed
- AND the player's framerate MUST remain stable (no spawn-time hitch).

#### Scenario: Cap unaffected by boss presence

- GIVEN the boss wave (level X, wave last)
- WHEN 3 standard enemies are also active alongside the boss
- THEN the spawner MUST NOT emit additional standard enemies
- AND the boss MUST NOT count toward the 3-enemy cap.

### Requirement: Boss Wave Composition

The final wave of every level MUST contain exactly 1 boss plus 1 to 2 "add" enemies drawn from the level's enemy pool. Adds MUST NOT include another boss factory.

#### Scenario: Standard boss wave (level 1)

- GIVEN the last wave of Las Hoyas de Caballero
- WHEN the wave is emitted
- THEN exactly 1 topadora (boss variant) MUST spawn
- AND between 1 and 2 adds (e.g., `camion_treco`, `valla_publicitaria`) MUST spawn
- AND no second boss factory may spawn.

#### Scenario: Final level uses dedicated planta_treco boss

- GIVEN the last wave of nivel 5 — El Acuífero
- WHEN the wave is emitted
- THEN exactly 1 `planta_treco` (dedicated factory, not a variant of another enemy) MUST spawn
- AND between 1 and 2 adds MUST spawn.

## References

- REQ-3 (proposal §Functional requirements — 5 levels tied to real Valle locations per plan §3)
- REQ-6 (proposal §Functional requirements — 4-5 waves/level, ~30 s, max 3 concurrent, last = boss + 1-2 adds, 4 s inter-wave)
- plan.md §3 — per-level scenarios that the wave schema fills in.

## Acceptance Notes

- REQ-1 (Static HTTP launch, latest 2 browser versions) does not constrain this spec; mentioned here because the wave timer uses `performance.now()` and must run on any browser passing the launch gate.
- Manual-playthrough acceptance (REQ-15): a verifier plays each level end-to-end and observes wave count, wave duration, rest gaps, and the boss-wave composition per the requirements above.
- The spawner is expected to consult `enemy-registry` for factory handles; this spec describes behavior, not the registry call.
- Architectural decisions A1 (model registry) and the per-level enemy allocations are NOT in this spec — they are deferred to design and apply phases.
