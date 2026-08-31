# Ammo System Specification

> Change: `zarra-defenders` · Status: NEW full spec (greenfield, no delta)
> REQs: REQ-9 (12-round mag, 1.2 s auto-reload, manual `R`)

## Purpose

Defines the ammunition model: magazine size, auto-reload cadence, manual reload binding, and reload audio. The ammo system is intentionally simple — no ammo pickups, no weapon switching — so the player never loses flow to inventory management. Civic pedagogy is preserved by mapping reload clicks to the satisfying tactile gesture a light-gun player expects.

## Requirements

### Requirement: 12-Round Magazine

The player MUST start each level with a 12-round magazine. Shots MUST be capped at 12 before a reload is required (auto or manual). The current ammo count MUST be visible in the HUD at all times during gameplay.

#### Scenario: Magazine starts full

- GIVEN a level has just started
- WHEN the HUD renders
- THEN the ammo counter MUST show 12 (or "12 / 12")
- AND the player MUST be able to fire 12 shots without reload.

#### Scenario: 13th shot blocked

- GIVEN the player has fired 12 shots in the current magazine
- WHEN the player attempts a 13th shot before reload
- THEN the system MUST NOT consume the shot
- AND MAY play a "dry fire" click (audible) instead.

### Requirement: 1.2s Auto-Reload After Magazine Empties

After the 12th shot in a magazine, the system MUST start a 1.2-second auto-reload timer. During the reload, firing MUST be blocked. After 1.2 s, the magazine MUST refill to 12 and a short audible click MUST play.

#### Scenario: Auto-reload on empty mag

- GIVEN the player fires the 12th round
- WHEN 1.2 seconds elapse with no further fire
- THEN the magazine MUST refill to 12
- AND a reload click SFX MUST play
- AND the HUD MUST update from "0 / 12" to "12 / 12".

#### Scenario: Player fires during reload

- GIVEN a reload is in progress (1.2 s timer active)
- WHEN the player presses fire
- THEN the shot MUST be blocked
- AND the reload timer MUST NOT reset
- AND a "blocked" cue MAY play (or no cue — design choice).

#### Scenario: Auto-reload audible

- GIVEN the auto-reload completes
- WHEN the magazine is full again
- THEN the player MUST hear a short click sound
- AND the click MUST be clearly distinguishable from a regular fire sound.

### Requirement: Manual Reload with `R`

Pressing `R` at any time MUST trigger an immediate reload sequence. The reload MUST take 1.2 s (matching auto-reload) regardless of how many rounds remain. During the reload, firing MUST be blocked.

#### Scenario: Manual reload mid-magazine

- GIVEN the player has 5 / 12 rounds and is not under fire pressure
- WHEN the player presses `R`
- THEN the reload MUST start
- AND after 1.2 s the magazine MUST refill to 12
- AND the auto-reload cadence MUST NOT stack (only one reload at a time).

#### Scenario: Manual reload during active auto-reload

- GIVEN the player emptied the mag 0.5 s ago and the auto-reload is in progress
- WHEN the player presses `R`
- THEN the reload MUST continue with the remaining 0.7 s (not restart)
- AND no second click SFX MUST play.

### Requirement: Reload Audio Plays Once Per Reload

Exactly one reload click MUST play per reload event (auto or manual), at the moment the magazine becomes full. Reload audio MUST NOT be looped, gated, or repeated during the 1.2 s window.

#### Scenario: Single click per reload

- GIVEN a manual reload
- WHEN the 1.2 s window elapses
- THEN exactly 1 reload click MUST play
- AND no other audio event in that window may mimic the click.

#### Scenario: Reload click distinguishable from fire

- GIVEN the audio catalog
- WHEN the verifier listens to reload vs fire SFX
- THEN the two MUST be audibly distinct
- AND reload MUST be a single click (not a burst).

### Requirement: Ammo Display in HUD

The HUD MUST display the current ammo count as `{current} / 12` at all times during gameplay. The display MUST update within one frame of any state change. The ammo counter MUST be readable from a 2 m distance (event-venue lighting).

#### Scenario: HUD updates on every shot

- GIVEN the player has 12 / 12 and fires one shot
- WHEN the shot registers
- THEN the HUD MUST show "11 / 12" within the next frame
- AND no flicker or stale value may appear.

#### Scenario: HUD readable from 2 m

- GIVEN an event-venue lighting setup
- WHEN the verifier views the HUD from 2 m away
- THEN the ammo counter MUST be legible
- AND the contrast ratio MUST be sufficient (white on dark semi-transparent panel).

### Requirement: Ammo Does Not Persist Across Levels

Each level MUST start with a fresh 12-round magazine, regardless of the player's state at the end of the previous level. The session score (per `combo-scoring` and `game-over-flow`) persists, but ammo does NOT.

#### Scenario: Level transition resets ammo

- GIVEN the player finishes level 1 with 3 / 12 ammo
- WHEN level 2 begins
- THEN the HUD MUST show 12 / 12
- AND no carry-over from level 1 may occur.

#### Scenario: Retry resets ammo

- GIVEN the player retries level 2 from the pause menu or game-over
- WHEN level 2 begins
- THEN the ammo MUST be 12 / 12
- AND any partial magazine state MUST be discarded.

## References

- REQ-9 (12-round mag, 1.2 s auto-reload, manual `R`)
- plan.md §9.5 — light-gun reload contract
- `hit-feedback` — first-click contract (manual reload is also blocked until first user gesture resolves)

## Acceptance Notes

- REQ-15 (manual playthrough): verifier fires 12+ shots across a wave and confirms the auto-reload cadence and the manual `R` override.
- The "12" is a v1 design choice; if the design phase proposes a different number, this spec must be re-opened with a MODIFIED block.
