# Boss System Specification

> Change: `zarra-defenders` · Status: NEW full spec (greenfield, no delta)
> REQs: REQ-7 (boss contract), REQ-14 (desactivación framing)
> Architectural decisions folded in: **A7** (every boss sets `userData.lifecycle = 'desactivacion'`)

## Purpose

Defines the lifecycle and behavior of every boss fight across the 5 levels: entry, vulnerability pattern, special move per phase, and the desactivación sequence that replaces "death" for **ALL 5 bosses** (A7). The civic-pedagogical commitment is that the game does not "win" the conflict — no boss is destroyed in an explosion; all bosses are desaturated and halted when reduced to 0 HP, and the final boss hands off to the real-world call to action via the final screen.

## Requirements

### Requirement: Boss Entry Animation

When a boss wave starts, the system MUST play a 2-second entry animation before the boss becomes hittable. During those 2 seconds, the boss MUST be invulnerable and the HUD SHOULD display the boss name.

#### Scenario: Standard boss entrance

- GIVEN the last wave of nivel 2 (tubería industrial lixiviados) has been emitted
- WHEN the boss factory has spawned the boss mesh
- THEN for 2 seconds the boss MUST be invulnerable to player shots
- AND the HUD MUST display the boss's localized label (e.g., `STRINGS.bosses.tuberia.label`).

#### Scenario: Player fires during entry animation

- GIVEN the boss entry animation is in its second second
- WHEN the player fires a hit-accurate shot
- THEN the shot MUST register visually (impact effect or "no damage" indicator)
- AND the boss hit points MUST NOT decrease.

### Requirement: Vulnerable Windows

A boss MUST have exactly 3 vulnerable windows during its fight, each separated by an invulnerable phase. A vulnerable window MUST be entered after the player has triggered the special move's tell or after a timer threshold.

#### Scenario: First vulnerable window opens after special tell

- GIVEN the boss is in invulnerable phase 1
- WHEN the boss performs its special move tell
- THEN the vulnerable window MUST open for a fixed duration (design-tunable)
- AND the boss MUST accept damage during that window.

#### Scenario: Window closes after duration

- GIVEN the boss is in vulnerable window 2 and the timer expires
- WHEN the window duration ends
- THEN the boss MUST become invulnerable again
- AND MUST transition toward window 3 or to desactivación, depending on remaining HP.

### Requirement: One Special Move Per Phase

Each invulnerable phase MUST contain exactly 1 special move performed by the boss. The special move MUST be telegraphed (visual tell) for at least 1 second before it lands, and on landing it MUST be avoidable by player movement.

#### Scenario: Special move telegraph

- GIVEN the boss is in invulnerable phase 2
- WHEN the boss is about to perform its special move
- THEN a 1 s+ visual tell MUST play (color flash, arming animation, area marker)
- AND the move MUST NOT land before the tell completes.

#### Scenario: Player avoids special move

- GIVEN the special move's tell is visible
- WHEN the player moves out of the marked area
- THEN the move MUST miss
- AND the boss MUST NOT deal damage to the player.

### Requirement: Boss Desactivación — All 5 Bosses (A7)

When ANY boss is reduced to 0 HP, the system MUST end the fight with a desactivación sequence — NOT an explosion. The boss MUST halt its attacks while the screen applies desaturation and motion stop. A7 makes this uniform across **all 5 bosses**: `topadora`, `tuberia`, `incineradora`, `trailer`, and `planta_treco`. No boss factory may use the old "destroyed" path; the pedagogical framing holds at every level.

#### Scenario: All 5 bosses use desactivación lifecycle (A7)

- GIVEN any boss factory in `src/content/models/enemies/`
- WHEN the factory is invoked with `{variant: 'boss'}`
- THEN the returned group's `userData.lifecycle` MUST equal `'desactivacion'`
- AND `src/game/bosses.js` MUST treat all 5 bosses uniformly via the desactivación path
- AND no boss factory may use the old `destroyed` path.

#### Scenario: Level-1 boss desactivación (no explosion)

- GIVEN the player has reduced `topadora` (nivel 1 boss variant) to 0 HP
- WHEN desactivación begins
- THEN the boss MUST NOT explode with fire, debris, or screen-filling particles
- AND MUST desaturate and stop motion
- AND the level-complete state MUST follow.

#### Scenario: Final boss desactivación

- GIVEN the player's shots have reduced `planta_treco` (nivel 5) to 0 HP
- WHEN the desactivación sequence begins
- THEN the boss MUST halt its attacks
- AND a silenced visual desactivation MUST play (color desaturation, motion stop)
- AND the final dato MUST appear within 2 seconds
- AND the screen MUST transition to the final screen with the link to `nomacrovertederozarra.com`.

### Requirement: Boss Hit Points and Damage

Each boss MUST have a fixed hit-point budget per level. Damage MUST only apply during vulnerable windows. Damage applied during invulnerable phases MUST be ignored (and SHOULD produce a "no damage" indicator).

#### Scenario: Damage during vulnerable window

- GIVEN the boss is in vulnerable window 1
- WHEN the player lands a hit-accurate shot
- THEN the boss's HP MUST decrease by the weapon's damage value
- AND hit feedback (crosshair flash, enemy flash) MUST play per the `hit-feedback` spec.

#### Scenario: Shot during invulnerable phase

- GIVEN the boss is between windows
- WHEN the player fires a shot that intersects the boss mesh
- THEN the boss's HP MUST NOT change
- AND the player MUST receive a brief visual cue that the hit was rejected.

## References

- REQ-7 (boss contract — 2 s entry, 3 vulnerable windows, 1 special move per phase, desactivación sequence)
- REQ-14 (final boss desactivación framing; user-facing text in one file)
- Architectural decision **A7** (every boss sets `userData.lifecycle = 'desactivacion'`) — **NEW vs original instance**
- Architectural decision A1 — boss variants and the dedicated `planta_treco` factory
- plan.md §3 — per-level boss narrative
- `hit-feedback` spec — screen-shake amplitude (combo-scaled) is triggered on boss hits

## Acceptance Notes

- The 2 s entry, 3 windows, and 1 special move/phase are minimum contracts; design MAY extend these (e.g., 4 windows on level 5) without violating this spec, provided the desactivación sequence remains.
- REQ-15 (manual playthrough) is the only acceptance mechanism; verifier observes each level's boss end-to-end and confirms:
  1. Entry animation lasts 2 s and is invulnerable.
  2. 3 vulnerable windows open on cue.
  3. Special move tells telegraph for ≥1 s.
  4. On 0 HP, every boss desaturates and halts — NO explosion, fire, debris, or particles.
  5. The final boss (nivel 5) additionally hands off to the final screen within 2 s of desactivación.
- Implementation note (allowed because A1 is in scope): boss factories accept `variant: 'standard' | 'boss'`; `planta_treco` is a dedicated factory under `src/content/models/enemies/`.
- The verify script (`verify.sh`) MUST check that all 5 boss factories set `userData.lifecycle = 'desactivacion'`; failure on any one is an archive-blocker.
