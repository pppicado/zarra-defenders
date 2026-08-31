# Combo & Scoring Specification

> Change: `zarra-defenders` · Status: NEW full spec (greenfield, no delta)
> REQs: REQ-12 (combo ×5 cap, 2 s decay, no accuracy / time bonus v1)

## Purpose

Defines how points are awarded, how the combo multiplier accrues and decays, and what bonuses are explicitly out of scope for v1. The system is intentionally minimal: base points per enemy, combo multiplier up to ×5, 2-second decay window, no accuracy or time bonuses. The pedagogical framing is that scoring celebrates persistence and civic engagement (combo = sustained attention), not mechanical perfection.

## Requirements

### Requirement: Per-Enemy Base Points

Each enemy destroyed MUST award a base point value drawn from `content/data.js` (key `STRINGS.enemigos.{enemyId}.puntos`). Base points MUST be awarded before the combo multiplier is applied.

#### Scenario: Basic enemy destroyed

- GIVEN the player destroys a `bidon_lixiviado` (base 15 pts per plan §4) with combo ×1
- WHEN the destruction event fires
- THEN the score MUST increase by exactly 15
- AND the combo MUST NOT reset (or reset only if the previous combo was 0).

#### Scenario: Unknown enemy id is a configuration error

- GIVEN an enemy id that has no `puntos` entry in `content/data.js`
- WHEN that enemy is destroyed
- THEN the system MUST default to a configurable fallback (e.g., 0 or 1) AND log a warning
- AND MUST NOT crash the game.

### Requirement: Combo Multiplier Cap

The combo multiplier MUST cap at ×5. Each successive hit increments the multiplier by 1 (or by a configurable step) up to the cap; the multiplier MUST be visible in the HUD at all times during gameplay.

#### Scenario: Combo growth to cap

- GIVEN the player starts at combo ×1
- WHEN the player lands 5 consecutive hits without a 2 s gap
- THEN the combo MUST reach ×5
- AND any further hits MUST keep the multiplier at ×5
- AND the HUD MUST display "×5" (or localized equivalent).

#### Scenario: Combo decay resets after 2 s of inactivity

- GIVEN the player's combo is ×4
- WHEN 2 seconds elapse with no enemy hit
- THEN the combo MUST reset to ×1 on the next hit
- AND a HUD tick SHOULD signal the imminent reset in the final 0.5 s (optional but recommended).

### Requirement: Combo Multiplier Decay Window

The combo timer MUST reset to 0 on every successful enemy hit. The decay window MUST be exactly 2 seconds; no other interval is allowed.

#### Scenario: Hit within the window

- GIVEN the player just destroyed an enemy 1.5 s ago and combo is ×3
- WHEN the player lands another hit
- THEN the combo MUST increment to ×4
- AND the timer MUST reset to 0.

#### Scenario: Hit exactly at the window edge

- GIVEN the player destroyed an enemy 2.0 s ago and combo is ×3
- WHEN the player lands a new hit
- THEN the combo MUST be ×1 (decay has triggered)
- AND the score MUST be awarded at ×1.

### Requirement: Combo on Miss

A miss (shot that hits no enemy) MUST NOT reset the combo. Only the 2-second timer can reset the combo. A miss MAY play a subtle audio/visual cue, but MUST NOT penalize the multiplier.

#### Scenario: Player misses during active combo

- GIVEN combo ×3 is active
- WHEN the player fires and the shot does not intersect any enemy
- THEN the combo MUST remain ×3
- AND the 2 s decay timer MUST continue from the last successful hit.

#### Scenario: Player misses after timer expired

- GIVEN combo ×3 with 2.1 s since the last hit
- WHEN the player fires and misses
- THEN on the NEXT successful hit the combo MUST be ×1.

### Requirement: No Accuracy or Time Bonus (v1)

The v1 scoring contract MUST NOT award accuracy bonuses, time bonuses, or "perfect wave" bonuses. These are explicitly out of scope and MAY be added in a future change.

#### Scenario: Accuracy does not affect score

- GIVEN the player completes a level with 50% accuracy (50 of 100 shots hit enemies)
- WHEN the level transitions to the level-complete screen
- THEN no accuracy multiplier MUST be applied
- AND the level-complete screen MUST display only the raw score.

#### Scenario: Time does not affect score

- GIVEN the player completes a level in 4 minutes vs. 8 minutes
- WHEN the level transitions to the level-complete screen
- THEN the score MUST be identical for both runs (other things equal).

### Requirement: Score Persistence Across Pause

Score and combo MUST persist across pause (ESC) and across `Continuar`. They MUST reset only when the player dies and retries the level (per `game-over-flow`) or returns to the menu.

#### Scenario: Pause does not reset score

- GIVEN the player has 5,400 points and combo ×4 mid-wave
- WHEN the player presses ESC and chooses Continuar
- THEN on resume the score MUST still be 5,400
- AND the combo MUST be reset to ×1 (paused state freezes the timer, but resume starts a fresh combo decay window).

#### Scenario: Retry level resets combo but keeps session score

- GIVEN the player chose "Reiniciar nivel" from the pause menu
- WHEN the level restarts
- THEN the level-local combo MUST reset to ×1
- AND the session score (total across all 5 levels) MUST persist per `game-over-flow`.

## References

- REQ-12 (combo ×5 max with 2 s decay, no accuracy/time bonus v1)
- plan.md §4 — per-enemy base point table
- Architectural decision A2 — base points live in `content/data.js` under `STRINGS.enemigos.{id}.puntos`
- REQ-14 — desactivación framing implies scoring celebrates engagement, not destruction

## Acceptance Notes

- REQ-15 (manual playthrough): verifier confirms by playing through a level and observing (a) base points awarded, (b) combo growth to ×5, (c) decay after 2 s, (d) no accuracy/time bonus on level-complete screen.
- The "no accuracy / time bonus" line is a v1 contract; if the design phase wants to add either, the spec must be updated to a MODIFIED block.
