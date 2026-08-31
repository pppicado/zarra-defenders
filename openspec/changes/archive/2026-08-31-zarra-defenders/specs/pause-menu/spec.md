# Pause Menu Specification

> Change: `zarra-defenders` · Status: NEW full spec (greenfield, no delta)
> REQs: REQ-10 (ESC releases pointer lock, 3-action overlay)

## Purpose

Defines the pause flow triggered by ESC: the overlay, the three available actions, and what state survives vs. resets across pause/resume. The pause menu exists so a player at an event venue (loud room, interrupted, needs a break) can step out without losing their run or locking themselves out of pointer lock.

## Requirements

### Requirement: ESC Releases Pointer Lock

Pressing ESC MUST release pointer lock AND display the pause overlay. While the overlay is visible, pointer lock MUST remain released; the game loop MUST be suspended (no enemy updates, no spawns, no scoring timers advancing).

#### Scenario: Player presses ESC mid-wave

- GIVEN the player is mid-wave with pointer lock active
- WHEN the player presses ESC
- THEN pointer lock MUST be released within one frame
- AND the pause overlay MUST be visible
- AND no enemy MUST spawn, move, or fire while the overlay is up.

#### Scenario: Pause during inter-wave rest

- GIVEN the player presses ESC during the 4 s inter-wave rest
- WHEN the overlay opens
- THEN the rest timer MUST be suspended (not advance toward 0 while paused)
- AND on resume the timer MUST continue from where it stopped.

### Requirement: Overlay Shows Three Actions

The pause overlay MUST present exactly three actions, vertically stacked, centered: `Continuar`, `Reiniciar nivel`, `Salir al menú`. Each action MUST be keyboard-accessible (Tab + Enter) AND pointer-accessible (mouse click).

#### Scenario: Three actions visible

- GIVEN the pause overlay is open
- WHEN the verifier inspects the overlay
- THEN it MUST show `Continuar`, `Reiniciar nivel`, `Salir al menú` in that order
- AND no other action buttons may be present.

#### Scenario: Action labels are localized

- GIVEN the player has set the language to castellano
- WHEN the overlay renders
- THEN each label MUST come from `content/data.js` (e.g., `STRINGS.pausa.continuar`, `STRINGS.pausa.reiniciar`, `STRINGS.pausa.salir`)
- AND MUST NOT be hard-coded Spanish in any JS source file.

### Requirement: Continuar Resumes

Selecting `Continuar` MUST re-acquire pointer lock, dismiss the overlay, and resume the game loop from the exact state (HP, ammo, score, combo, active enemies) at the moment of pause.

#### Scenario: Continuar returns to mid-wave state

- GIVEN the player paused with 3 active enemies, 8/12 ammo, score 4,200, combo ×3
- WHEN the player clicks Continuar
- THEN pointer lock MUST be re-acquired
- AND the same 3 enemies MUST be on screen
- AND the score / ammo / combo MUST be unchanged.

#### Scenario: Continuar via keyboard

- GIVEN the overlay is open with focus on `Continuar`
- WHEN the player presses Enter
- THEN the game MUST resume identically to a mouse click on Continuar.

### Requirement: Reiniciar Nivel Restarts Current Level

Selecting `Reiniciar nivel` MUST restart the current level from the data screen, with the session score preserved (per `game-over-flow`) but the level-local state (current wave, active enemies, level-combo window) reset to defaults.

#### Scenario: Restart keeps session score

- GIVEN the player paused at level 3 with session score 12,000
- WHEN the player clicks Reiniciar nivel
- THEN level 3 MUST restart from the data screen
- AND the session score MUST remain 12,000 (per `game-over-flow`)
- AND the level-local combo MUST reset to ×1.

#### Scenario: Confirmation prompt for restart

- GIVEN the player is about to click Reiniciar nivel
- WHEN the focus is on that button
- THEN a single-step confirmation MAY be required (e.g., press Enter twice within 2 s) to prevent accidental restart
- AND MUST be implemented consistently across levels.

### Requirement: Salir al Menú Returns to Title

Selecting `Salir al menú` MUST transition the player to the title / level-select screen, dismiss the pause overlay, and release pointer lock. The session score MUST persist across this transition (the menu displays it).

#### Scenario: Salir keeps session score visible

- GIVEN the player paused at level 4 with session score 18,500
- WHEN the player clicks Salir al menú
- THEN the level-select screen MUST show session score 18,500
- AND pointer lock MUST remain released (no auto-relock).

#### Scenario: Returning to menu does not auto-start a level

- GIVEN the player is on the level-select screen after Salir
- WHEN the screen renders
- THEN no game loop MUST be running
- AND no wave MUST be spawned until the player explicitly chooses a level.

### Requirement: No Logic Outside Three Buttons

The pause overlay MUST NOT contain any other interactive controls (e.g., settings, calibration, quit-to-desktop) in v1. Master volume and mute live in the HUD per `hit-feedback`; not in the pause overlay.

#### Scenario: Overlay contains only the three buttons

- GIVEN the pause overlay is open
- WHEN the verifier counts interactive elements
- THEN the count MUST be exactly 3
- AND no slider, toggle, or link may be present.

## References

- REQ-10 (ESC releases pointer lock, three actions)
- plan.md §9.5 — light-gun / pause contract
- Architectural decision A2 — overlay labels live in `content/data.js`
- Related: `game-over-flow` (retry semantics), `hit-feedback` (HUD master volume)

## Acceptance Notes

- REQ-15 (manual playthrough): verifier pauses 3 times across a 5-level run — mid-wave, inter-wave, on the data screen — and confirms the three buttons behave as specified.
- REQ-1 (Static HTTP launch, latest 2 browser versions) implicitly verified: pause overlay uses no APIs unavailable in those browsers.
