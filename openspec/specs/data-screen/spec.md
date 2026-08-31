# Data Screen Specification

> Change: `zarra-defenders` · Status: NEW full spec (greenfield, no delta)
> REQs: REQ-3 (5 levels tied to real Valle location + real dato), REQ-14 (final screen links to `nomacrovertederozarra.com`; desactivación framing)
> Architectural decisions folded in: **A5** (pre-researched `.fuente` strings from `research/fuentes.md`)

## Purpose

Defines the pre-level dato screen that appears before each of the 5 levels, and the final screen that appears after the level-5 desactivación. The dato screen is the game's primary pedagogical surface: it presents a real fact from the conflict with a source citation, and (for the final screen) hands off to the real-world call to action. The screens are text-only with an optional beep — no voice-over, no narration — keeping them i18n-ready and lightweight.

## Requirements

### Requirement: Pre-Level Dato Screen Per Level

Each of the 5 levels MUST be preceded by a dato screen. The screen MUST display `STRINGS.datos.nivel{n}.texto` prominently, with `STRINGS.datos.nivel{n}.fuente` as the citation underneath. No interactive controls may be present except a "Continuar" affordance to begin the level.

#### Scenario: Dato for nivel 1

- GIVEN the player has selected nivel 1 from the level menu
- WHEN the dato screen renders
- THEN it MUST display the nivel 1 dato ("El proyecto prevé 11 millones de metros cúbicos de residuos.") in large, readable text
- AND the citation ("Las Provincias, 24/06/2026") MUST appear in smaller text below
- AND a single "Continuar" button MUST be visible.

#### Scenario: All 5 levels have datos with real citations (A5)

- GIVEN the game is fully loaded
- WHEN the verifier enumerates `STRINGS.datos`
- THEN it MUST find `nivel1`, `nivel2`, `nivel3`, `nivel4`, `nivel5`, and `final`
- AND each MUST expose non-empty `texto` and `fuente` (per A5)
- AND each `fuente` MUST cite a named publication + date from `research/fuentes.md`.

### Requirement: 6 Dato Citations Pre-Researched (A5)

The 6 dato citation strings MUST come from `research/fuentes.md` (verified 2026-08-31). The expected mapping per level is:

| Level | Texto | Fuente (from `research/fuentes.md`) |
|---|---|---|
| 1 | El proyecto prevé 11 millones de metros cúbicos de residuos. | Las Provincias, 24/06/2026 |
| 2 | El Acuífero de la Mancha Oriental tiene 8.500 km². | Agencia del Agua de CLM (s/f) |
| 3 | La comarca ya convive con la central nuclear de Cofrentes. | actualidadvalencia.com, 05/08/2026 |
| 4 | La ruta de camiones pasa junto al colegio y el polideportivo. | Las Provincias, 24/06/2026 |
| 5 | En 2002 los vecinos ya rechazaron un vertedero igual. 10.700 firmas. | Las Provincias, 16/06/2026 |
| final | A fecha de hoy, la solicitud está en información pública. | Valencia Plaza, 31/07/2026 |

#### Scenario: Citations match research/fuentes.md table

- GIVEN `STRINGS.datos.{nivel1..nivel5, final}.fuente`
- WHEN the verifier compares each value to the table in `research/fuentes.md`
- THEN each MUST match the publication + date exactly
- AND no citation may be replaced with a TODO marker or empty string.

#### Scenario: Sources are real Spanish press / official bodies

- GIVEN the 6 citations
- WHEN the verifier inspects the publisher names
- THEN they MUST include only: Las Provincias, Agencia del Agua de CLM, actualidadvalencia.com, Valencia Plaza
- AND no generic placeholder ("Wikipedia", "fuente pendiente") may appear.

### Requirement: Text-Only Audio (Optional Beep)

The dato screen MUST NOT play music. The screen MAY play a soft beep on entry, but no voice-over is permitted in v1 (D3).

#### Scenario: Silence on dato screen

- GIVEN the dato screen is visible
- WHEN the verifier listens
- THEN no music MUST be playing
- AND a single entry beep MAY sound
- AND no voice-over may play.

#### Scenario: Music resumes on level start

- GIVEN the player clicks Continuar on the dato screen
- WHEN the level begins
- THEN the level's chiptune track MUST start within 2 seconds
- AND the dato screen MUST be dismissed.

### Requirement: Citation Visible Alongside Dato

The citation `STRINGS.datos.nivel{n}.fuente` MUST be visible on the same screen as the dato text — not relegated to a scrollable credits page. The citation MUST be the small-font line beneath the dato.

#### Scenario: Citation present and not truncated

- GIVEN the dato screen renders
- WHEN the verifier inspects the visible text
- THEN the citation MUST be readable
- AND MUST NOT be elided, replaced by "...", or hidden behind hover.

#### Scenario: Citation from named sources

- GIVEN the conflict's verified sources per `research/fuentes.md` and plan §12
- WHEN the dato screen renders
- THEN at least one source per dato MUST cite a named publication or entity
- AND the citation MUST be specific (date + outlet, not just "Wikipedia").

### Requirement: Final Screen Handoff to nomacrovertederozarra.com

After the level-5 desactivación sequence, the system MUST transition to a final screen that displays the final dato AND links to `nomacrovertederozarra.com` (via `STRINGS.final.enlaces.plataforma_url`). The link MUST be reachable in one click.

#### Scenario: Final screen after desactivación

- GIVEN the player has just deactivated the level-5 boss
- WHEN the desactivación sequence ends
- THEN the final screen MUST appear within 2 seconds
- AND the final dato MUST be visible
- AND a clickable link to `nomacrovertederozarra.com` MUST be present.

#### Scenario: Final screen links come from STRINGS (A6)

- GIVEN the final screen renders
- WHEN the verifier inspects the source
- THEN every link label MUST come from `STRINGS.final.enlaces.*` (e.g., `final.enlaces.plataforma`, `final.enlaces.alegaciones`, `final.enlaces.asociacion`)
- AND every link URL MUST come from `STRINGS.final.enlaces.*_url`
- AND NO URL may be hard-coded in `src/game/pedagogy.js` or any other JS file.

### Requirement: Final Screen Has 4 Links Minimum

The final screen MUST surface at minimum: the platform (`nomacrovertederozarra.com`), the alegaciones form (URL when published), the Asociación Naturalista de Ayora y la Valle, and the hashtag `#NoAlMacrovertederoDeZarra`. Each link MUST be reachable.

#### Scenario: All 4 final links visible

- GIVEN the final screen is open
- WHEN the verifier enumerates the link elements
- THEN exactly 4 (or more) link entries MUST be visible
- AND each MUST point to the resource declared in `STRINGS.final.enlaces`.

#### Scenario: Hashtag is text, not a live URL

- GIVEN `#NoAlMacrovertederoDeZarra`
- WHEN the final screen renders the hashtag
- THEN it MUST be visible as text (no live Twitter/X link required in v1)
- AND MUST be selectable for copy.

### Requirement: Final Screen Has a "Volver a Jugar" Button

The final screen MUST include a single "Volver a jugar" button that returns the player to the title / level-select screen. No other action buttons may be present on the final screen.

#### Scenario: Single return button

- GIVEN the final screen renders
- WHEN the verifier counts interactive elements
- THEN exactly 1 button (`Volver a jugar`) MUST be present
- AND it MUST return to the level-select screen.

### Requirement: Pedagogical Sign-Off Before Apply

The dato text for all 5 levels + final MUST be pedagogy-signed-off before `sdd-apply` starts. The sign-off covers: data accuracy, citation specificity, no caricature, "no se gana — se rechaza en la calle" framing. R4 mitigation.

#### Scenario: Sign-off check

- GIVEN `sdd-apply` is about to start
- WHEN the orchestrator runs the pedagogy checklist
- THEN each of the 6 dato strings MUST be marked as signed-off
- AND any unsigned dato MUST block `sdd-apply` from starting.

## References

- REQ-3 (5 levels tied to real Valle location + real dato)
- REQ-14 (final screen links to `nomacrovertederozarra.com`; desactivación framing)
- plan.md §3 (per-level dato content), §8 (5-stage pedagogy)
- `content-strings` spec — owns the actual dato text and citations
- Architectural decision A2 — dato text and citations live in `content/data.js`
- Architectural decision **A5** — pre-researched `.fuente` strings from `research/fuentes.md` (NEW vs original)
- Architectural decision **A6** — URLs in STRINGS, zero literals (referenced for the final screen link contract)
- R4 (tone risk) and its mitigation

## Acceptance Notes

- REQ-15 (manual playthrough): the verifier walks through levels 1-5 and observes the dato screen text, citation, and (on level 5) the final-screen links.
- REQ-1 (Static HTTP launch) does not constrain this spec.
- This spec is closely paired with `content-strings`: changes to dato text happen in `content/data.js`, not in this spec's source.
- The `verify.sh` check for A5 (citations match `research/fuentes.md`) is a MANDATORY archive gate; failure blocks archive.
- Re-verify `research/fuentes.md` URLs before `sdd-apply` if the gap is more than 2 weeks (R15 — time-sensitive date references in Valencia Plaza 31/07/2026 source).
