# Proposal: zarra-defenders — Valle de Ayora: Defensores del Territorio

> **Change**: `zarra-defenders`
> **Project**: `zarra-defenders` (NEW instance at `/projects/personal/zarra-defenders/`)
> **Artifact store**: hybrid (OpenSpec file + Engram topic `sdd/zarra-defenders/proposal`)
> **Plan**: `/projects/personal/zarra-defenders/plan.md` (334 lines, user-approved, verbatim copy of original)
> **Stack**: vanilla Three.js + WebGL + Web Audio API + Pointer Lock API, no build, no npm, no test runner
> **Reference (READ-ONLY)**: archived first instance at `/projects/scratch/test01conf/zarra-game/openspec/changes/archive/2026-08-31-zarra-defenders/`

---

## Intent

This is a **second, clean instance** of the zarra-defenders change — a civic-pedagogical 3D on-rails shooter set in the Valle de Ayora-Cofrentes where the player defends recognisable places (Las Hoyas de Caballero, La Hoz del Zarra, Sierra de La Hunde, casco de Ayora, El Acuífero) from impersonal industrial threats associated with the TRECO macrovertedero project. Power-ups map to real civic actions (`FIRMA`, `ALEGACIÓN`, `MANIFESTACIÓN`, `ALIANZA`, `DATO`, `HITO`), data screens cite real facts with sources, and the final screen links to `nomacrovertederozarra.com`. The game does not "win" the conflict — the boss is "desactivated", and the call to action is the real work.

The first instance at `/projects/scratch/test01conf/zarra-game/` was implemented and archived 2026-08-31 with verdict `pass_with_warnings` (62/62 reqs, 121/121 scenarios, 5/5 verify checks, 34/34 tasks). This new instance is **not a continuation** — it is a fresh reimplementation that folds in the **3 verify SUGGESTIONs** surfaced by the original (console.log removal, URL-in-STRINGS, lifecycle desactivación on all bosses) and ships with **pre-researched pedagogical citations** (`research/fuentes.md`) instead of `TODO pedagogía` placeholders. The Valle community gets a clean, deployable artifact free of the original's known caveats.

## Context

Greenfield at `/projects/personal/zarra-defenders/`: only `plan.md`, `openspec/{README.md, config.yaml}`, `research/fuentes.md`, `.gitignore` exist. No `src/`, no `index.html`, no code. Working tree clean (2 commits: `51e8826` initial scaffolding, `a41471e` sdd-init). Plan, stack, and module layout (`src/{engine,game,content,levels}/`) are frozen in both `config.yaml` files. The original instance is **read-only reference material**; its 10 archived specs (`level-wave-system`, `boss-system`, `enemy-registry`, `combo-scoring`, `pause-menu`, `game-over-flow`, `content-strings`, `data-screen`, `ammo-system`, `hit-feedback`) and architectural decisions A1-A4 are the **starting point** for the new specs at the sdd-spec phase, not the final word.

See `openspec/changes/zarra-defenders/explore.md` (347 lines) for the full exploration: plan validation, G1-G28 cataloged gaps, R1-R16 risks, the 3 SUGGESTIONs folded in as A5-A9, and the pre-researched citation table.

## Goal

A self-contained browser game (≤2 MB, no install, no build) playable at 60 fps on 2018+ iGPU with mouse or light gun, that:
1. Lets a player beat all 5 levels end-to-end in ~15-20 min.
2. Teaches the conflict through datos with real citations and civic power-ups, without lecturing.
3. Is updatable by a non-developer (text in one file, visuals in a registry) so the game can evolve with the conflict.

## Non-goals (v1)

Multiplayer co-op · voice-over data screens · multi-language UI (Castellano only v1, `data.js` is i18n-ready) · persistent save, leaderboards, accounts · colorblind mode, reduced-motion mode, full keyboard-only mode · particle effects beyond enemy-flash · mobile/touch input · procedural music beyond 1-2 loopable patterns per level.

## Stakeholders

| Who | Role | Interest |
|---|---|---|
| **Vecinos/as del Valle** | Primary players + maintainers of `nomacrovertederozarra.com` | Accuracy of datos, recognisable places, updatable content |
| **Residentes extranjeros (UK/NL)** | Secondary players | Optional EN copy (i18n-ready from day 1) |
| **Público general en eventos** | Tertiary players | Light-gun friendliness, short play length, accessibility |
| **Author (single developer)** | Implementer + maintainer | No build step, ≤2 MB, low ceremony, single-person-deployable |
| **Pedagogía reviewer (user)** | **Sign-off before apply** | Tone, no caricature, source citation, "no se gana — se rechaza en la calle" |

## User stories

1. **Vecino/a**: "Quiero ver mi pueblo y datos correctos." → Datos cited, real locations, `data.js` updatable.
2. **Event player + light gun**: "Quiero enchufar mi Sinden y jugar sin configurar nada." → Pointer Lock + first-click + absolute-cursor fallback.
3. **Mouse-only player**: "Quiero abrir y jugar sin instrucciones." → Defaults work; HUD shows key bindings.
4. **Activist maintainer**: "Quiero cambiar un dato sin tocar JS." → Single `data.js` owns text.
5. **Foreign resident**: "Quiero traducción futura sin rehacer." → Keyed `STRINGS`; castellano ships, EN is data addition.

## Functional requirements (15)

| ID | Requirement | Note |
|---|---|---|
| REQ-1 | Latest 2 versions Chrome / Firefox / Safari / Edge — no install, no build, served by static HTTP | G12 |
| REQ-2 | Input works with mouse and with AimTrak / Sinden / Gun4IR / PS Move light guns | same as original |
| REQ-3 | 5 levels, each tied to a real Valle location + real dato | per plan §3 |
| REQ-4 | 11 enemy types + 5 bosses reachable across the 5 levels | per plan §4 |
| REQ-5 | 6 power-ups = 6 acciones cívicas reales | per plan §5 |
| REQ-6 | 4-5 waves/level, ~30 s, max 3 concurrent enemies, last wave = boss + 1-2 adds, inter-wave rest 4 s | G1 default |
| REQ-7 | 2 s entry animation, 3 vulnerable windows, 1 special move per phase, "desactivación" sequence (no explosion) | G3 — see A7 |
| REQ-8 | Crosshair flashes white→red on hit, enemy mesh flashes 80 ms white, screen-shake on boss hit (amplitude scales with combo). No particles v1 | G4 |
| REQ-9 | 12-round magazine, 1.2 s auto-reload with audible click, manual reload with `R` | G5 |
| REQ-10 | `ESC` releases pointer lock and shows overlay — `Continuar` / `Reiniciar nivel` / `Salir al menú` | G6 |
| REQ-11 | Retry current level (keeps score) or return to level select. No persistent save v1 | G7 |
| REQ-12 | Per-enemy base points (plan §4), combo multiplier up to ×5 with 2 s decay, no accuracy / time bonus v1 | G8 |
| REQ-13 | `content/data.js` exports nested-keyed `STRINGS` (`datos.nivel1`, `enemigos.camion_treco.label`, etc.). Castellano ships; other languages are data additions | G22 — **`.fuente` strings SHIPPED READY from `research/fuentes.md` (A5)** |
| REQ-14 | Final boss is "desactivated", not exploded. Final screen links to `nomacrovertederozarra.com` and alegaciones form. All user-facing text in one file | G24 — **All 5 bosses use desactivación lifecycle uniformly, not just final (A7)** |
| REQ-15 | Manual playthrough script serves as acceptance criterion — no automated test runner | R5 |

## Capabilities (10 NEW — contract with sdd-spec)

> Each becomes `openspec/specs/<name>/spec.md`. Reproduce from original archive with A5-A9 deltas folded in.

- `level-wave-system` — wave spawning, inter-wave rest, max-concurrent-enemy cap (REQ-6)
- `boss-system` — boss entry animation, vulnerable windows, special moves, desactivación sequence on **all 5 bosses** (REQ-7, A7)
- `enemy-registry` — central registry of all 11 enemy factories + 1 dedicated boss factory (`planta_treco`) + boss-variant support
- `combo-scoring` — combo multiplier with decay, base points from `content/data.js` (REQ-12)
- `pause-menu` — overlay with `Continuar` / `Reiniciar nivel` / `Salir al menú` (REQ-10)
- `game-over-flow` — retry current level or return to level select (REQ-11)
- `content-strings` — i18n-ready keyed `STRINGS` with **pre-researched `.fuente` strings** and **URL schema `final.enlaces.*`** (REQ-13, A5, A6)
- `data-screen` — pre-level dato overlay with **citation footnote below the dato** (REQ-13, A5, G23)
- `ammo-system` — 12-round magazine, auto + manual reload (REQ-9)
- `hit-feedback` — crosshair flash, enemy flash, screen-shake (REQ-8)

### Modified Capabilities

None — greenfield project.

## Architectural decisions (A1-A9)

### Carried forward from original (unchanged)

- **A1 — Model-blueprint registry.** `src/content/models/{index.js, trees/, enemies/, props/, buildings/}`. Each model = one file exporting a pure factory `makeXxx({variant?, position?, rotation?}) → THREE.Group`. Registry is the only public API; levels and enemy spawners call `registry.get('camion_treco').make()`. **Catalog**: 3 trees (`encina`, `pino`, `almendro`), 11 enemies (`camion_treco`, `bidon_lixiviado`, `dron_fumigador`, `topadora`, `incineradora`, `trailer`, `valla_publicitaria`, `plataforma_solar`, `tubo_lixiviado`, `bolsa_plastico`, `sello_burocratico`), 3 props (`valla`, `roca`, `cartel`), 3 buildings (`casa_ayora`, `castillo_cofrentes`, `torre_central`), 1 dedicated boss (`planta_treco`). Total ≈ 23 files. Boss factories accept `variant: 'standard' | 'boss'`. **Extends plan §6** (R3 mitigation).

- **A2 — STRINGS in `content/data.js`.** All user-facing text (datos + fuentes, enemy labels, power-up names, final-screen links + URLs, button labels, error messages) lives in `src/content/data.js` exported as nested-keyed `STRINGS`. `verify.sh` check 2 confirms zero Spanish prose outside `data.js`. **R3 / G24 mitigation — first-class maintainability commitment.**

- **A3 — First-click atomic gesture.** Single `mousedown` on the start screen MUST trigger atomically: (1) `canvas.requestPointerLock()`, (2) `audioCtx.resume()`, (3) `loop.start()`. If pointer lock fails, show `STRINGS.start.error_lock` overlay and do NOT start the loop. Handler lives in `src/main.js`. **R8 / R9 mitigation.**

- **A4 — Light-gun absolute-cursor fallback.** When `MouseEvent.movementX/Y` reports zero for ≥1 s (`aim.zeroCheckWindow = 1000`), switch silently to absolute-cursor mode with ×2 sensitivity (`aim.sensitivityAbs = 0.0050` vs `sensitivityRel = 0.0025`). Switch back silently on non-zero movement. No UI banner. **R2 mitigation.**

### NEW for this instance (folded from original verify SUGGESTIONs)

- **A5 — Pre-researched `.fuente` strings ship in v1.** `research/fuentes.md` (40 lines, verified 2026-08-31) is the canonical source for `STRINGS.datos.{nivel1..nivel5}.fuente` and `STRINGS.datos.final.fuente`. All 6 citation strings populated from the table — **no empty strings, no `// TODO pedagogía` markers**. Citations render as small text below the dato on the data screen. Re-verify URLs before `sdd-apply` if the gap is >2 weeks (R15).

- **A6 — All URLs in STRINGS, zero literals in code.** `STRINGS.final.enlaces = { plataforma, plataforma_url, alegaciones, alegaciones_url, asociacion, asociacion_url }` — each link has both label AND URL from STRINGS. `pedagogy.js` reads `STRINGS.final.enlaces.*` only; no `https://...` literals anywhere in `src/` outside `content/data.js`. **NEW vs original (SUGGESTION 3)**. `verify.sh` check: `grep -rn "https\?://" src/ | grep -v content/data.js | grep -v "www.w3.org"` → 0.

- **A7 — Every boss sets `lifecycle: 'desactivacion'`.** All 5 boss factories (`topadora`, `tuberia`, `incineradora`, `trailer`, `planta_treco`) set `userData.lifecycle = 'desactivacion'` in their `make()` function. `enemies.js destroyEnemy()` checks the flag uniformly and applies desaturation + motion halt + dispatches `zarra:desactivacion`. Levels 1-4 bosses also desaturate (no explosion) when destroyed. **NEW vs original (WARNING 2 / SUGGESTION 4)**. The "no se gana — se rechaza en la calle" framing holds uniformly across all bosses.

- **A8 — Zero `console.*` calls in production `src/`.** No `console.log/warn/error` in any source file unless gated behind `__zarra.debug` flag (set via `localStorage` or query string). The original instance's debug print at `nivel5_acuifero.js:89` is NOT reproduced. **NEW vs original (SUGGESTION 1)**. `verify.sh` check: `grep -rn "console\." src/ | grep -v __zarra.debug` → 0.

- **A9 — Comment-stripping workaround for `verify.sh` check 2.** Spanish comments in `src/content/models/` use ASCII transliterations ("Botiquin" not "Botiquín", "Camion" not "Camión") to keep the Spanish-prose-isolation check passing. Only `content/data.js` carries real Spanish copy with accents. Documented in code style. **NEW vs original (SUGGESTION 3-related)**.

## Design decisions (D1-D6, all carried over from original)

| ID | Decision | Resolution (auto-mode) | Surfaced? |
|---|---|---|---|
| **D1** | Game name | `"Valle de Ayora: Defensores del Territorio"` (already in `openspec/README.md:1`) | **Yes — surfaced to user but not blocking** |
| **D2** | Music source | Generated chiptune via Web Audio API (zero weight, zero licensing) | Yes |
| **D3** | Data screens | Text only + optional beep SFX (i18n-ready, no recording) | Yes |
| **D4** | Translations | Castellano only v1; `data.js` is i18n-ready (keyed `STRINGS`) | Yes |
| **D5** | Publication | Tailscale VPS first (matches CV tool, QR-friendly for events) | Yes |
| **D6** | Multiplayer | NO v1 — single-player focus | Yes |

Auto-mode proceeds with the recommendation on all six. D1 is surfaced-but-not-blocking — orchestrator confirms with user before sdd-apply if user wishes to override.

## Risks (top 5)

| ID | Risk | Likelihood / Impact | Mitigation |
|---|---|---|---|
| **R4** | Tone reads as propaganda / caricature | Med / High | Pedagogy sign-off checklist before sdd-apply: data accuracy, source citation on every dato, no caricature, "no se gana — se rechaza en la calle" framing. **Apply is blocked until signed off.** |
| **R14** | Spec drift from original — 3 SUGGESTIONs must be folded in | Med / High | This proposal explicitly enumerates A5-A9 deltas; **sdd-spec must apply them when reproducing the 10 specs** from the original archive. Original archive is read-only — do NOT modify it. |
| **R3** | Conflict evolves, content must update fast | Med / Med | A1 (model registry) + A2 (`data.js` first-class). Single-file edit per dato / link / label. Pre-researched `.fuente` table proves the design supports fast updates. |
| **R2** | Cheap light guns don't report `movementX/Y` | Med / Med | A4 (absolute-cursor fallback after 1 s of zero movement, clamped to canvas). |
| **R12** | Event-venue sound levels (loud or silent rooms) | Med / Low | Master volume + mute toggle in HUD (`[` / `]` for volume, `M` for mute). Chiptune scales cleanly to silence without losing rhythm. |

## Affected areas

| Area | Impact | Notes |
|---|---|---|
| `src/content/models/` | New (~23 files) | A1 registry + per-model factories (trees, enemies, props, buildings) |
| `src/content/data.js` | New | A2 owns ALL text; A5 fuentes pre-filled from `research/fuentes.md`; A6 URL schema `final.enlaces.*` |
| `src/content/credits.js` | New | credits entidades (Plataforma, Asociación Naturalista, etc.) |
| `src/engine/input.js` | New | A3 first-click contract + A4 light-gun fallback |
| `src/engine/audio.js` | New | `audioCtx.resume()` on first gesture; chiptune synth (R11 minimal scope) |
| `src/engine/renderer.js` | New | Three.js + WebGL 2 with WebGL 1 fallback |
| `src/game/waves.js` | New | REQ-6 wave schema (G1 defaults) |
| `src/game/bosses.js` | New | REQ-7 + **A7 lifecycle on ALL 5 bosses (NEW vs original)** |
| `src/game/enemies.js` | New | registry consumer + `destroyEnemy()` desactivación handler (A7) |
| `src/game/scoring.js` | New | REQ-12 combo + base points |
| `src/game/pause.js` | New | REQ-10 pause overlay |
| `src/game/over.js` | New | REQ-11 game-over flow |
| `src/game/pedagogy.js` | New | data screens + final screen; reads **ONLY** from STRINGS (A6, NEW vs original) |
| `src/game/state.js` | New | global state (vidas, score, nivel) |
| `src/levels/level{1..5}_*.js` | New | per plan §3 (Hoyas / Hoz / Hunde / Ayora / Acuífero) |
| `src/main.js` | New | bootstrap + atomic first-click (A3) |
| `index.html` | New | entry + loader |
| `styles.css` | New | HUD, menus, crosshair |
| `verify.sh` | New | manual + structural checks including **A5/A6/A7/A8/A9 verifications** |
| `openspec/README.md` | Modified | update "~38-file modular layout" line (R6, was inaccurate in original) |

## Rollback plan

Greenfield — `git revert` of the change commit(s). No database, no migrations, no deploy hooks. Pre-archive, any code is removed with the commit; post-archive, revert is one operation.

## Dependencies

- WebGL 2 with WebGL 1 fallback.
- Pointer Lock API (latest 2 versions of Chrome, Firefox, Safari, Edge).
- Web Audio API (gesture-resume pattern, no `AudioContext` restriction).
- Three.js r128 UMD via CDN (no npm, no build).
- `localStorage` (optional — light-gun calibration only; try/catch fallback to in-memory per R7/G18).

**No new libraries, build tools, or frameworks introduced.**

## Success criteria (sdd-verify)

Same as original PLUS the new A5-A9 verifications:

- [ ] All 5 levels playable start-to-finish (mouse + light gun, all 6 power-ups reachable).
- [ ] All 11 enemy types + 5 bosses spawn at least once across the 5 levels.
- [ ] `content/data.js` contains ALL user-facing text (verify.sh check 2 confirms zero Spanish prose in any other source file).
- [ ] **All 6 `.fuente` strings non-empty and cite real sources from `research/fuentes.md` (A5).**
- [ ] **No `console.log` calls in production `src/` (A8).**
- [ ] **No `https://` literals in `src/` outside `content/data.js` (A6).**
- [ ] **All 5 boss factories set `userData.lifecycle = 'desactivacion'` (A7).**
- [ ] Model registry exposes 11 enemies + 3 trees + 3 props + 3 buildings + dedicated `planta_treco` boss.
- [ ] First click → pointer lock + audio resumed + game loop starts (single contract, A3).
- [ ] Light gun fallback activates within 1 s of zero movement (A4).
- [ ] Manual asset-budget check: `du -sh` of project root ≤ 2 MB.
- [ ] Pedagogy sign-off checklist completed and signed before sdd-apply starts (R4).
- [ ] 60 fps target on 2018+ integrated GPU; graceful 30 fps degraded mode (REQ-11 / G11).
- [ ] Manual playthrough script (5 levels × mouse × light gun × all power-ups) executed end-to-end (REQ-15 / R5).

## Phasing (per plan §10.2)

1. **MVP técnico** — pointer lock + scene + one enemy that spawns and dies. Proves the loop.
2. **Nivel 1 jugable** — Hoyas de Caballero complete: waves, score, 2 enemy types, 1 power-up.
3. **Sistema pedagógico** — inter-level datos (with citations from `research/fuentes.md`), credits, final screen with links to `nomacrovertederozarra.com`.
4. **Niveles 2-5** — replicate level-1 pattern with variation (Hoz del Zarra, Sierra de La Hunde, casco de Ayora, El Acuífero).
5. **Pulido** — balance, chiptune composition, light gun calibration flow, FPS tuning.
6. **Empaquetado final** — README, deploy to Tailscale VPS, QR for event play.

## Ready for sdd-spec

**NO BLOCKER.** Auto-mode applies D1-D6 defaults. D1 (game name) surfaced-but-not-blocking — orchestrator confirms with user before sdd-apply if user wishes to override.

sdd-spec must:
1. Reproduce the 10 archived specs at `/projects/scratch/test01conf/zarra-game/openspec/changes/archive/2026-08-31-zarra-defenders/specs/{...}/spec.md` as the starting point.
2. Fold in A5-A9 deltas explicitly (boss-system gets `lifecycle: 'desactivacion'` on all 5; content-strings gets `.fuente` non-empty + `final.enlaces.*` schema; pedagogy/pedagogy-strings spec gets STRINGS-only URL contract; verify script gets A6/A7/A8 checks).
3. **NOT modify the original archive** (read-only). Write fresh specs into `openspec/changes/zarra-defenders/specs/{...}/spec.md`.

Re-verify `research/fuentes.md` URLs before sdd-apply if the gap is >2 weeks (R15, time-sensitive date references in Valencia Plaza 31/07/2026 source).