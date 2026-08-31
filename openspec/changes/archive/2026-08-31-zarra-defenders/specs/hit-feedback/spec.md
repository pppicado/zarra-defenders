# Hit Feedback & Input Specification

> Change: `zarra-defenders` · Status: NEW full spec (greenfield, no delta)
> REQs: REQ-2 (mouse + AimTrak / Sinden / Gun4IR / PS Move light guns), REQ-8 (hit feedback)
> Architectural decisions folded in: **A3** (first-click atomic gesture), **A4** (light-gun absolute-cursor fallback), **A8** (zero `console.*` calls in production)

## Purpose

Defines the player's visual feedback on hits (crosshair, enemy flash, screen-shake), the first-click user-gesture contract that bundles Pointer Lock + AudioContext + game-loop start, and the light-gun input fallback for cheap guns that do not report `movementX/Y`. This spec is also the canonical home for REQ-2 (mouse + AimTrak / Sinden / Gun4IR / PS Move light guns) and REQ-8 (hit feedback). Together these contracts ensure the game works on a 2018+ integrated GPU with either input device.

**Placement note**: REQ-2 (input device support — mouse + 4 light-gun families) is placed here because every input event flows through the same module that also produces hit feedback. The crosshair, the click-to-fire, the click-to-lock — all live in one input/feedback loop, so splitting REQ-2 elsewhere would fragment the contract.

## Requirements

### Requirement: Crosshair Color Flash on Hit

When the player fires and the shot intersects an enemy, the crosshair MUST change color (default: white → red) for a fixed duration (~80 ms) and return to default. A miss MUST NOT change the crosshair color.

#### Scenario: Hit on enemy

- GIVEN the player fires a shot
- WHEN the shot intersects an enemy hitbox
- THEN the crosshair MUST turn red within one frame
- AND MUST return to white within 80 ms
- AND no other HUD element may obscure the crosshair during the flash.

#### Scenario: Miss keeps crosshair white

- GIVEN the player fires a shot
- WHEN the shot does not intersect any enemy
- THEN the crosshair MUST remain white
- AND no flash may occur.

### Requirement: Enemy Flash on Hit (80 ms White)

When an enemy is hit, its mesh MUST flash white for 80 ms (per plan §6, R10 mitigation). The flash MUST be additive and MUST NOT alter the enemy's hit points or AI behavior. The flash MUST NOT use external textures or particles.

#### Scenario: Single hit flash

- GIVEN the player lands a hit on an enemy
- WHEN the hit registers
- THEN the enemy mesh's material color MUST shift to white for 80 ms
- AND MUST return to its base color after 80 ms.

#### Scenario: Rapid successive hits

- GIVEN the player lands 5 hits on the same enemy in 200 ms
- WHEN each hit registers
- THEN the flash MUST retrigger on every hit
- AND MUST NOT leave the enemy stuck white.

### Requirement: Screen-Shake on Boss Hit

When the player lands a hit on a boss, the screen MUST shake with an amplitude proportional to the current combo multiplier. The shake MUST NOT occur on standard-enemy hits. The shake MUST settle within 200 ms of the last boss hit.

#### Scenario: Boss hit at combo ×3

- GIVEN the player's combo is ×3
- WHEN the player lands a hit on a boss
- THEN the camera MUST shake with amplitude proportional to 3 (e.g., 3 px peak)
- AND MUST settle within 200 ms if no further boss hits occur.

#### Scenario: Standard enemy hit has no shake

- GIVEN the player's combo is ×4
- WHEN the player lands a hit on a standard enemy
- THEN no screen-shake MUST occur
- AND the crosshair / enemy flash MUST still play.

### Requirement: No Particles in v1

The hit-feedback system MUST NOT spawn particle effects on hit, miss, kill, or boss desactivación. The flash + shake contracts above are the entire visual vocabulary for hit events in v1.

#### Scenario: No particles on enemy kill

- GIVEN the player destroys an enemy
- WHEN the destruction animation begins
- THEN no particle emitter MUST activate
- AND the destruction MUST be conveyed via the desactivación/desaturation frame only.

#### Scenario: No particles on boss desactivación

- GIVEN any of the 5 bosses has reached 0 HP (per `boss-system` A7)
- WHEN desactivación plays
- THEN no particles MUST spawn
- AND the final dato MUST appear within 2 s (per `data-screen`) for level 5.

### Requirement: First-Click Atomic Gesture Contract (A3)

The first `mousedown` on the start screen MUST atomically trigger, in this order, on the same event tick: (1) `canvas.requestPointerLock()`, (2) `audioCtx.resume()`, (3) game loop `requestAnimationFrame` start. All three MUST succeed before any subsequent user interaction. If any of the three fails, the system MUST surface a visible error and MUST NOT start the game loop.

#### Scenario: First-click happy path

- GIVEN the player is on the start screen
- WHEN the first `mousedown` fires
- THEN `canvas.requestPointerLock()` MUST be called
- AND `audioCtx.resume()` MUST be called
- AND the game loop's first `requestAnimationFrame` MUST be queued
- AND all three MUST occur on the same tick.

#### Scenario: Pointer Lock denied

- GIVEN the player has previously declined pointer lock in the browser
- WHEN the first `mousedown` fires
- THEN pointer lock MUST be rejected
- AND the audio resume MUST still occur
- AND the game loop MUST NOT start
- AND the player MUST see a visible message (`STRINGS.start.error_lock`) explaining pointer lock is required.

#### Scenario: AudioContext suspended

- GIVEN the browser has suspended the `AudioContext`
- WHEN the first `mousedown` fires
- THEN `audioCtx.resume()` MUST succeed (because the gesture is the unlock)
- AND no audio glitches MUST occur during level start.

### Requirement: Light Gun Absolute-Cursor Fallback (A4)

If `MouseEvent.movementX === 0 && MouseEvent.movementY === 0` for more than 1 second after pointer lock is acquired, the input module MUST switch to absolute cursor position (clamped to canvas bounds) with a higher sensitivity. The switch MUST be silent — no UI banner, no flicker.

#### Scenario: Zero-movement fallback

- GIVEN pointer lock is acquired on a cheap light gun that does not report movement
- WHEN 1.0 s elapses with `movementX === 0 && movementY === 0`
- THEN the input module MUST switch to absolute-cursor mode
- AND aim sensitivity MUST be increased by a factor of 2 (configurable, default ×2)
- AND the player MUST be able to aim and shoot normally.

#### Scenario: Movement resumes

- GIVEN the input module has switched to absolute mode
- WHEN a `movementX/Y` non-zero event arrives (e.g., the gun momentarily reports movement)
- THEN the module MUST switch back to movement-relative mode
- AND MUST NOT flicker between modes during normal play.

### Requirement: Mouse + Light Gun Compatibility (REQ-2 placement)

The system MUST accept input from standard mouse HID and from AimTrak, Sinden Lightgun, Gun4IR, and PS Move (adapted) light guns. Pointer Lock + the absolute-cursor fallback covers all five input sources without per-device configuration.

#### Scenario: Standard mouse

- GIVEN the player uses a desktop mouse
- WHEN pointer lock is acquired
- THEN `movementX/Y` events MUST drive the camera aim
- AND the fallback MUST NOT activate (movement is non-zero from frame 1).

#### Scenario: AimTrak / Sinden / Gun4IR / PS Move

- GIVEN the player uses any of the 4 listed light-gun families
- WHEN pointer lock is acquired
- THEN the system MUST accept input without per-device configuration
- AND the absolute-cursor fallback MUST activate within 1 s if `movementX/Y` are zero
- AND no driver / calibration step MUST be required for basic play.

### Requirement: Master Volume + Mute in HUD

The HUD MUST provide a master volume slider and a mute toggle, both reachable via keyboard (e.g., `[` / `]` for volume, `M` for mute) and via mouse click. Volume changes MUST persist within the session but MUST NOT persist across reloads (no `localStorage`, per `game-over-flow` v1 contract).

#### Scenario: Volume slider works

- GIVEN the player is mid-game
- WHEN the player presses `]` 3 times
- THEN the master volume MUST increase
- AND the audible chiptune MUST be louder
- AND the change MUST apply to SFX and music equally.

#### Scenario: Mute toggle works

- GIVEN the player presses `M`
- WHEN the toggle fires
- THEN all audio MUST be silenced
- AND pressing `M` again MUST restore the previous volume level.

### Requirement: No Console Calls in Production (A8)

The production `src/` tree MUST NOT contain `console.log`, `console.warn`, `console.error`, `console.info`, or `console.debug` calls unless they are gated behind a `__zarra.debug` flag. This prevents leaking internal state to event-venue consoles and removes the debug-print pattern that crept into the original instance (`nivel5_acuifero.js:89`).

#### Scenario: No console calls in production (A8)

- GIVEN the production `src/` tree
- WHEN the verifier greps for `console\.(log|warn|error|info|debug)` in `src/`
- THEN it MUST find zero matches outside `src/engine/dom.js` (debug utility)
- AND any new `console.*` call MUST be gated behind `__zarra.debug`.

#### Scenario: Debug flag opt-in

- GIVEN the developer sets `localStorage.__zarra.debug = "1"` or appends `?debug=1` to the URL
- WHEN the game boots
- THEN any `console.*` calls gated behind `__zarra.debug` MUST activate
- AND without the flag, the same calls MUST be no-ops.

## References

- REQ-8 (hit feedback — crosshair, enemy flash, screen-shake, no particles v1)
- REQ-2 (mouse + 4 light-gun families — PLACED HERE)
- Architectural decision **A3** (first-click atomic gesture)
- Architectural decision **A4** (light-gun absolute-cursor fallback after 1 s of zero movement)
- Architectural decision **A8** (zero `console.*` calls in production `src/`) — **NEW vs original**
- `combo-scoring` (screen-shake amplitude scales with combo)
- `boss-system` (screen-shake only on boss hits; desactivación on all 5 per A7)
- `ammo-system` (manual reload `R` lives in input module)
- R10 (z-fighting / transparency mitigated by no-particles contract)
- R12 (event-venue sound levels mitigated by master volume + mute)

## Acceptance Notes

- REQ-15 (manual playthrough): verifier plays with both mouse AND a light gun (any of the 4 supported families) and confirms crosshair flash, enemy flash, boss screen-shake, master volume, and mute.
- REQ-1 (Static HTTP launch, latest 2 browser versions): the first-click contract is the highest-leverage spot where browser-version differences could break the game. The contract is the gate — if it works on the latest 2 versions of Chrome / Firefox / Safari / Edge, the launch gate is satisfied.
- This spec is the convergence point for input, audio gating, and hit feedback. Any change to the first-click contract or the light-gun fallback MUST be propagated to the design and apply phases.
- The `verify.sh` check for A8 (`grep -rn "console\." src/ | grep -v __zarra.debug | grep -v "// "`) is a MANDATORY archive gate; failure blocks archive.
