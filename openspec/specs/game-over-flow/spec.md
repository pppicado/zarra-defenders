# Game-Over Flow Specification

> Change: `zarra-defenders` · Status: NEW full spec (greenfield, no delta)
> REQs: REQ-11 (retry current level keeps score, return to level select, no persistent save v1)

## Purpose

Defines what happens when the player loses all lives: the game-over state, the two recovery paths (retry the current level, return to level select), and the explicit absence of persistent save in v1. The pedagogical framing is "you can always step back into the fight" — retry is a one-click recovery, not a punishment.

## Requirements

### Requirement: Game-Over Trigger

The player MUST enter the game-over state when their life count reaches 0 (i.e., after the final FIRMA-equivalent recovery would leave them at 0). The game-over overlay MUST appear within 1 second of the final hit, and pointer lock MUST be released.

#### Scenario: Last life lost

- GIVEN the player has 1 life remaining and is hit by an enemy or hazard
- WHEN the hit is registered
- THEN life MUST decrement to 0
- AND the game-over overlay MUST appear within 1 s
- AND pointer lock MUST be released.

#### Scenario: HITO 1UP prevents game-over

- GIVEN the player has 0 lives and would enter game-over
- WHEN a HITO 1UP is awarded (crossing the 5,000-pt milestone per plan §5)
- THEN life MUST increment to 1
- AND game-over MUST NOT trigger.

### Requirement: Game-Over Overlay Has Two Actions

The game-over overlay MUST present exactly two actions, vertically stacked, centered: `Reintentar nivel` and `Volver al menú de niveles`. No other interactive elements may appear.

#### Scenario: Two actions visible

- GIVEN the game-over overlay is open
- WHEN the verifier inspects the overlay
- THEN it MUST show `Reintentar nivel` and `Volver al menú de niveles`
- AND no other buttons may be present.

#### Scenario: Labels localized

- GIVEN the language is castellano
- WHEN the overlay renders
- THEN each label MUST come from `content/data.js` (e.g., `STRINGS.gameover.reintentar`, `STRINGS.gameover.menu`)
- AND MUST NOT be hard-coded in JS.

### Requirement: Retry Keeps Session Score

Selecting `Reintentar nivel` MUST restart the current level from the data screen. The session score (accumulated across all 5 levels so far) MUST persist. The level-local combo and the active-enemy list MUST reset to defaults.

#### Scenario: Retry preserves session score

- GIVEN the player has session score 8,400 from levels 1 and 2, and dies on level 3
- WHEN the player clicks Reintentar nivel
- THEN level 3 MUST restart from the data screen
- AND the menu / HUD MUST show session score 8,400
- AND the combo window MUST be ×1 with no decay timer active.

#### Scenario: Retry preserves lives baseline

- GIVEN the player retries level 3 with session score 8,400
- WHEN level 3 starts
- THEN the player MUST start with the design-defined baseline lives (e.g., 3)
- AND MUST NOT inherit the depleted 0 from game-over.

### Requirement: Return to Level Select

Selecting `Volver al menú de niveles` MUST transition the player to the title / level-select screen, dismiss the game-over overlay, and release pointer lock. The session score MUST be visible on the level-select screen.

#### Scenario: Return to menu shows session score

- GIVEN the player died on level 3 with session score 8,400
- WHEN the player clicks Volver al menú de niveles
- THEN the level-select screen MUST display 8,400
- AND pointer lock MUST remain released.

#### Scenario: Level 5 game-over

- GIVEN the player dies on the final boss of level 5
- WHEN the player clicks Reintentar nivel
- THEN level 5 MUST restart from its data screen
- AND session score from levels 1-4 MUST persist.

### Requirement: No Persistent Save (v1)

The system MUST NOT write to `localStorage`, IndexedDB, or any persistent storage to remember session score, unlocked levels, or any game-progress state. Levels are unlocked by default (all 5 selectable from the menu). Session score lives in memory only.

#### Scenario: Page reload wipes session score

- GIVEN the player has session score 12,000 mid-run
- WHEN the player reloads the page
- THEN the session score MUST be 0 on next load
- AND no console error MUST be raised about failed persistence (because no persistence is attempted).

#### Scenario: Private browsing mode works

- GIVEN `localStorage` is unavailable (private browsing or disabled)
- WHEN the game loads
- THEN the game MUST run identically
- AND MUST NOT throw on storage access.

### Requirement: Game-Over SFX and Visual

The game-over overlay MUST play the descending game-over melody per plan §7 and present the session score prominently above the two buttons. The visual MUST be a desaturated full-screen panel, not an explosion.

#### Scenario: Overlay is non-violent

- GIVEN the player just lost their last life
- WHEN the overlay appears
- THEN it MUST be a static / desaturated panel
- AND MUST NOT contain explosions, fire, debris, or particle effects.

## References

- REQ-11 (retry level keeps score, return to level select, no save v1)
- plan.md §5 — HITO 1UP cadence (every 5,000 pts)
- plan.md §7 — game-over melody
- Architectural decision A2 — overlay labels live in `content/data.js`

## Acceptance Notes

- REQ-15 (manual playthrough): verifier intentionally dies on level 2 mid-wave and confirms both buttons behave as specified; verifier also reloads the page mid-run to confirm no persistence.
- REQ-1 (Static HTTP launch, latest 2 browser versions) is verified by the reload scenario — the game MUST come back to a clean title screen on the latest 2 versions of Chrome/Firefox/Safari/Edge.
