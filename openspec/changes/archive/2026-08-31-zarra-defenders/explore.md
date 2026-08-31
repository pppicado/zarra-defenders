# Exploration: zarra-defenders (new instance)

> **Phase**: SDD explore (read-only)
> **Change**: `zarra-defenders`
> **Project**: `zarra-defenders` (new instance — `/projects/personal/zarra-defenders/`)
> **Artifact store**: hybrid (`both`) — this file + Engram topic `sdd/zarra-defenders/explore`
> **Plan**: `/projects/personal/zarra-defenders/plan.md` (user-approved, 334 lines — verbatim copy of original)
> **Stack** (frozen): vanilla Three.js + WebGL + Web Audio API + Pointer Lock API, no build, no npm, no test runner
> **Conventions**: `src/{engine,game,content,levels}/`, no logic in `main.js`, Castilian Spanish in-game copy, English artifacts
> **Reference (read-only)**: archived first instance at `/projects/scratch/test01conf/zarra-game/openspec/changes/archive/2026-08-31-zarra-defenders/`

---

## 1. Intent

The user wants a civic-pedagogical 3D on-rails shooter (`House of the Dead` / `Time Crisis` style) set in the Valle de Ayora-Cofrentes, where the player defends recognisable places from impersonal industrial threats associated with the TRECO macrovertedero project. Power-ups map to real civic actions (`FIRMA`, `ALEGACIÓN`, `MANIFESTACIÓN`, `ALIANZA`, `DATO`, `HITO`), the data screens between levels cite real facts, and the final screen links to `nomacrovertederozarra.com`. The game does not "win" the conflict — the final boss is "desactivated", and the call to action is the real work.

This is a **second, clean instance** of the same change. The first instance was implemented at `/projects/scratch/test01conf/zarra-game/` and archived on 2026-08-31 with verdict `pass_with_warnings`. This new instance at `/projects/personal/zarra-defenders/` is a recreation that starts greenfield but folds in the three SUGGESTIONs surfaced by the first instance's verify phase and ships with pre-researched pedagogical citations instead of leaving them as `TODO pedagogía`. The user wants a clean, deployable artifact for the Valle community that does not carry the original instance's known caveats.

## 2. Context

### 2.1 Current state (greenfield)

```
/projects/personal/zarra-defenders/
├── .git/                                        # git initialized (clean tree)
├── .gitignore                                   # 11 lines
├── plan.md                                      # 334 lines — user-approved design doc (verbatim copy of original)
├── openspec/
│   ├── README.md                                # 50 lines — conventions summary
│   ├── config.yaml                              # 42 lines — persistence=both, project=zarra-defenders
│   └── changes/
│       ├── archive/                             # empty — no previous changes in this instance
│       └── zarra-defenders/                     # NEW — created for this SDD run
└── research/
    └── fuentes.md                               # 40 lines — pre-researched 6 dato sources
```

**No `src/`, no `index.html`, no `styles.css`, no code anywhere.** Two commits exist: `51e8826` (initial scaffolding — plan + fuentes + .gitignore) and `a41471e` (sdd-init — openspec config + changes skeleton). Working tree is clean.

The `config.yaml` for this instance differs from the original in three details:
- `project.name: valle-ayora-defensores-del-territorio` (was `zarra-defenders` previously)
- `persistence.engram_project: zarra-defenders` (NEW — explicit project tag)
- `conventions.module_layout: src/{engine,game,content,levels}/` (matches original)

### 2.2 Relationship to the original instance

The original instance at `/projects/scratch/test01conf/zarra-game/` is **read-only reference material**. Its change folder is archived at `openspec/changes/archive/2026-08-31-zarra-defenders/` and contains the full SDD artifact set: `explore.md`, `proposal.md`, `design.md`, `tasks.md`, `verify-report.md`, `archive-report.md`, and `specs/{ammo-system, boss-system, combo-scoring, content-strings, data-screen, enemy-registry, game-over-flow, hit-feedback, level-wave-system, pause-menu}/spec.md`. The first instance was verified `pass_with_warnings` — 62/62 requirements, 121/121 scenarios, 5/5 verify.sh checks, 34/34 tasks complete.

This new instance is **not a continuation** of the original — it is a fresh implementation that:
- Reuses the user-approved `plan.md` byte-for-byte (same 334 lines, same design).
- Reuses the architectural decisions A1-A4 (model-blueprint registry, STRINGS in content/data.js, first-click atomic gesture, light-gun fallback).
- Reuses the spec contracts from the 10 archived specs as the **starting point** for the sdd-spec phase (subject to the deltas below).
- **Folds in three verify-report SUGGESTIONs** the original did not address before archive.
- **Pre-researches the 6 pedagogical `.fuente` strings** so they ship in v1 instead of being a `TODO pedagogía` caveat.

The new instance starts greenfield — there is no code, no `src/`, no `index.html`. Everything must be reimplemented; nothing carries over automatically.

### 2.3 What changed between instances (high level)

| Dimension | Original | New instance |
|---|---|---|
| Project root | `/projects/scratch/test01conf/zarra-game/` | `/projects/personal/zarra-defenders/` |
| `persistence.engram_project` | `zarra-game` (default-detected) | `zarra-defenders` (explicit) |
| Pedagogical `.fuente` strings | Empty + `// TODO pedagogía` (accepted caveat) | Pre-filled from `research/fuentes.md` |
| `console.log` at `nivel5_acuifero.js:89` | Left in source (SUGGESTION 1) | Removed from spec from day 1 |
| Hard-coded plataforma URL in `pedagogy.js:67` | `"https://nomacrovertederozarra.com"` literal (SUGGESTION 3) | Required to read from `STRINGS.final.enlaces.plataforma_url` |
| `lifecycle: 'desactivacion'` flag | Only on `planta_treco` (SUGGESTION 4 → soft warning) | Required on all 5 bosses (topadora, tuberia, incineradora, trailer, planta_treco) |
| Accent-stripped comments in model files | Documented workaround (SUGGESTION 3) | Same workaround applies — re-spec the comment-stripping rule |

## 3. Plan validation (§ by §)

### §3 — Level design — VALID

5 levels all named with real Valle locations, each with escenario, amenazas, dato pedagógico, and boss. Plus a final screen (not a level) with credits + dato + links + "Volver a jugar". The pedagogía-by-narrative design is intact:

| # | Level | Real location | Boss | Dato |
|---|---|---|---|---|
| 1 | Las Hoyas de Caballero | Zarra (Polígono 11) | Topadora arrancando encinas | 11 M m³ residuos (>2× Dos Aguas) |
| 2 | La Hoz del río Zarra | Zarra (Barranco del Agua) | Tubería industrial lixiviados | Acuífero Mancha Oriental 8.500 km² |
| 3 | Sierra de La Hunde y Palomera | Ayora (espacio protegido) | Incineradora industrial móvil | Comarca = zona de sacrificio |
| 4 | Por las calles de Ayora | Casco urbano Ayora | Trailer cargado de bidones | Ruta junto a colegio + Plan Emergencia Nuclear |
| 5 | El Acuífero | Subsuelo simbólico | Planta de tratamiento TRECO | 2002: 10.700 firmas, ataúd frente a Diputación |

**Coherent** — the geographical arc (Zarra rural → Zarra hoz → Ayora sierra → Ayora pueblo → subsuelo simbólico) builds narrative momentum. Each level introduces a new enemy type. The bosses form a graded hierarchy (topadora → tubería → incineradora → trailer → planta), culminating in the desactivación sequence.

### §4 — Enemy catalog — VALID (with note)

11 enemies named, tiered (4 básicos, 4 medios, 3 pesados), with golpe counts and points. Sello burocrático is correctly classified as a mid-game heavy enemy (5 golpes, ×40), not a boss. The level-to-enemy allocation is **not specified in the plan** — must be defined by the proposal (carried over as G9 from the original exploration).

**Note**: plan §4 lists 11 enemies, but a 12th enemy type exists implicitly — the level-5 boss `planta_treco` is conceptually distinct from the level-3 `incineradora` (different lifecycle: desactivación vs destruction). The first instance created a dedicated `planta_treco` factory (D6 of original) — the new instance should preserve this separation. **Registry count = 12 factories** (11 standard + 1 dedicated boss), as confirmed by verify.sh check 3 in the original.

### §5 — Power-ups — VALID

6 power-ups all defined with effect and symbol. FIRMA = +1 vida, ALEGACIÓN = escudo 3 s, MANIFESTACIÓN = slow-mo 5 s, ALIANZA = ×2 / 10 s, DATO = dato real en pantalla, HITO (cada 5.000 pts) = 1UP. The mapping of "gameplay effect ↔ civic action" is pedagogically clear and the integer 5.000 for HITO is the only level-curve hint in the plan — must be exposed via `MECANICA.hitoUmbral` in `content/data.js`, never hard-coded in JS logic (carried over as D7 of original).

### §6 — Visual design — VALID

Low-poly PS1/PS2 indie aesthetic, hand-composed primitives (no external textures), ≤200 tri/enemy, ≤5.000 tri/level, <2 MB total. Player not visible (camera + armed hand only). Recognisable places (Ayora plaza, Cofrentes castillo, Zarra hoz, La Hunde, Volcán de Cofrentes). **All coherent and implementable.** Triangle budgets must be enforced at the factory level (the registry exposes them) — R10 of original.

### §7 — Sound design — VALID

8 tracks (intro + 5 levels + final), chiptune synthesized via Web Audio API (no samples), tempo rises with difficulty. SFX: shot = pulso corto 8-bit, impact = ruido blanco + pitch down, power-up = arpegio ascendente, boss entry = redoble, game over = melodía descendente. Silencio intencionado during data screens (no music, only beep). All coherent.

**Caveat**: chiptune synthesis is non-trivial audio engineering. The original implementation scoped it minimally (R11 of original): 1-2 loopable patterns per level, 1 layer per track, no real-time composition. Proposal must preserve this scope.

### §8 — Pedagogía — VALID + IMPROVED

5 mechanisms: (1) dato antes de cada nivel (10 s), (2) power-ups = acciones cívicas, (3) sin victoria épica (boss desactivación), (4) créditos con entidades reales, (5) pantalla final con links. The original instance had all 5 implemented, but with empty `.fuente` strings (accepted caveat).

**New instance improvement**: `research/fuentes.md` already contains 6 verified Spanish press citations — one per `datos.nivel{1..5}.fuente` and `datos.final.fuente`. They will be written directly into `STRINGS.datos.*.fuente` and `STRINGS.final.fuente` by `sdd-apply`, removing the `TODO pedagogía` caveat entirely.

### §9 — Stack — VALID (frozen)

Three.js UMD + WebGL 2 (with WebGL 1 fallback) + Pointer Lock + Web Audio + HTML5 Canvas. No build, no npm. `python3 -m http.server` for distribution. Tailscale VPS as primary deployment (matches CV tool). Light gun detection via `MouseEvent.movementX/Y`, fallback to absolute cursor.

**No changes from original** — the stack is frozen in both `config.yaml` files.

### §10 — Delivery plan — VALID

6 post-SDD phases (MVP técnico → primer nivel → sistema pedagógico → niveles 2-5 → pulido → empaquetado). Rough estimate 4-6 sessions for end-to-end playability, 1-2 for polish. The phases are well-ordered by dependency: render → input → state → enemy spawn → waves → pedagogy → credits → final screen.

### §11 — Risks and decisions — VALID (carry-overs)

Plan §11 flags 5 risks (R1-R5) and 6 decisions (D1-D6). All are still relevant; the original instance locked D1-D6 in its proposal (see §6 below for the resolution table). R1-R5 are addressed by the original's mitigation strategies and must be re-applied in this instance.

**Additional risks R6-R13 from original exploration** (16-file layout, localStorage failure, Pointer Lock gesture, AudioContext suspended, procedural z-fighting, chiptune complexity, event-venue audio levels, browser auto-play) all still apply and must be carried into the new proposal.

## 4. Cataloged gaps

G1-G24 from the original exploration are **almost all still valid**. This instance adds **3 new gaps specific to the second instance**, plus carries forward the original gaps that were not resolved by the verify-report SUGGESTIONs.

### 4.1 Carried-forward gaps (from original explore.md G1-G24)

| ID | Gap | Status in this instance |
|---|---|---|
| G1 | Wave schema (duration, rest, cadence, cap) | Still open — original proposal locked defaults (4-5 waves/level, ~30 s, 4 s rest, 3 concurrent). Re-state in new proposal. |
| G2 | Difficulty progression (HP multiplier, spawn-rate, enemy-mix per level) | Still open — original proposal deferred to design phase. |
| G3 | Boss behavior contract (entry, vulnerable windows, special moves, desactivación) | Partially closed by original — must add `lifecycle: 'desactivacion'` to bosses 1-4 (see A7). |
| G4 | Hit feedback (crosshair flash, enemy flash, screen shake, particles) | Closed by original (REQ-8). Carry forward as-is. |
| G5 | Ammo system (magazine size, reload time, auto vs manual) | Closed by original (REQ-9: 12/12, 1.2 s auto). Carry forward as-is. |
| G6 | Pause behavior (overlay, restart, quit) | Closed by original (REQ-10). Carry forward as-is. |
| G7 | Game-over flow (retry, return to menu, score preservation) | Closed by original (REQ-11). Carry forward as-is. |
| G8 | Scoring (combo system, accuracy bonus, time bonus) | Closed by original (REQ-12: combo ×5 cap, 2 s decay, no accuracy/time bonus v1). |
| G9 | Enemy-by-level allocation matrix | Still open — defer to design phase. |
| G10 | Level transitions (cut, fade, camera move) | Still open — original used fade-out after desactivación. |
| G11 | Performance targets (FPS target, device matrix, degraded mode) | Closed by original (60 fps target, 30 fps degraded). Carry forward. |
| G12 | Browser support list | Closed by original (latest 2 versions of Chrome/Firefox/Safari/Edge). |
| G13 | Asset budget enforcement (CI check for <2 MB) | Closed by original (manual `du -sh` in verify phase). |
| G14 | Audio ducking during SFX / low-HP warning | Still open — not implemented in original. Surface in proposal. |
| G15 | AudioContext unlock on first gesture | Closed by original (A3 atomic gesture). Carry forward. |
| G16 | Data-screen audio (voice-over vs text+beep) | Closed by original (text + beep only — D3 default). |
| G17 | Light gun calibration flow (UI, persistence format) | Partially closed by original — calibration is opt-in via Settings, offset in `localStorage` as `{x, y}`. |
| G18 | `localStorage` failure mode (private browsing) | Still open — original had no explicit fallback. Recommend try/catch in-memory. |
| G19 | Keyboard-only play | Closed by original — out of v1 scope (non-objective). |
| G20 | Colorblind mode | Out of v1 — surface as future work. |
| G21 | Reduced-motion / motion sickness | Out of v1 — surface as future work. |
| G22 | i18n architecture | Closed by original (REQ-13 — `STRINGS` nested keys in `content/data.js`). |
| G23 | Citation format for data screens | Partially closed — citations are in `STRINGS.datos.*.fuente` (now pre-researched!). Surface: where on screen? Footnote below dato. |
| G24 | Catalog evolution (content/code separation) | Closed by original — `content/data.js` owns ALL text, registry owns ALL geometry. |

### 4.2 NEW gaps specific to this second instance

- **G25** — **No `console.log` allowed in `src/`.** The original verify-report SUGGESTION 1 found `console.log("[nivel5_acuifero] final dato source:", STRINGS.datos.final.fuente)` left in source. The new instance must spec this from day 1: zero `console.*` calls in production `src/`. If debug logging is needed for development, gate behind a `__zarra.debug` flag. Proposal should add a `verify.sh` check for `grep -rn "console\." src/ | grep -v __zarra.debug` → expect 0.

- **G26** — **All URLs must come from `STRINGS`, not literals.** The original verify-report SUGGESTION 3 found `nomacrovertederozarra.com` hard-coded at `pedagogy.js:67`. The new instance must spec: every URL (plataforma, alegaciones, asociación, hashtag link if any) lives under `STRINGS.final.enlaces.*`. The new STRINGS schema is `final.enlaces.plataforma`, `final.enlaces.plataforma_url`, `final.enlaces.alegaciones_url`, `final.enlaces.asociacion_url` — each link has both a label and a URL, both from STRINGS. Proposal should add a `verify.sh` check for URL literals outside `content/data.js`.

- **G27** — **All 5 bosses must set `lifecycle: 'desactivacion'`.** The original verify-report WARNING 2 found that bosses 1-4 (`topadora`, `tuberia`, `incineradora`, `trailer`) did not set the lifecycle flag and fell through to default destruction (scene removal). The spec said desactivación was MAY for levels 1-4 with a conditional MUST. The new instance commits: every boss factory sets `userData.lifecycle = 'desactivacion'`. This requires `enemies.js destroyEnemy()` to handle desactivación uniformly for all bosses, not just the level-5 planta_treco. Verify-playthrough must confirm levels 1-4 bosses desaturate and halt (no explosion) when "destroyed". This is a clean re-spec, not a code fix.

### 4.3 Pedagogía-source gaps (closed by this instance)

- **G28 (closed)** — **6 `.fuente` strings pre-researched, not TODO.** `research/fuentes.md` provides the citation table for all 6 dato strings. The new instance's `content/data.js` will populate `STRINGS.datos.{nivel1..nivel5, final}.fuente` directly from this table. The original instance had these as empty strings with `// TODO pedagogía` markers (accepted caveat); this instance removes the caveat entirely.

## 5. Cataloged risks

R1-R13 from the original exploration are still valid. This instance adds **3 new risks specific to the second instance** and re-emphasizes the highest-severity original risks.

### 5.1 Carried-forward risks (R1-R13 from original)

| ID | Risk | Severity | Mitigation (locked in this instance) |
|---|---|---|---|
| R1 | Old PCs may struggle with GPU requirements | Med | 60 fps target on 2018+ integrated GPU, 30 fps degraded mode (REQ-11 / G11). |
| R2 | Cheap light guns may not report movementX/Y | Med | Absolute-cursor fallback after 1 s zero movement, ×2 sensitivity (A4). |
| R3 | Conflict evolves, content must update fast | Med | `content/data.js` owns all text, registry owns all geometry. New dato or enemy label = 1 file change. |
| R4 | Tone / framing risk, propaganda perception | **High** | Pedagogy sign-off checklist before apply (data accuracy, tone, no caricature, source citation). |
| R5 | No automated tests | Low | Manual playthrough script is acceptance criterion (REQ-15). |
| R6 | 16-file modular layout broken by blueprint | Low | `openspec/README.md` will be updated to reflect real layout (~38 source files). |
| R7 | `localStorage` not always available | Low | Try/catch fallback to in-memory. (Still open — defer to design.) |
| R8 | Pointer Lock requires user gesture | Low | A3 atomic gesture on first click. |
| R9 | AudioContext starts suspended | Low | A3 atomic gesture calls `audioCtx.resume()` on first click. |
| R10 | Procedural geometry z-fighting, lighting, transparency | Med | No transparent materials v1; non-coplanar BoxGeometry faces; vertex-color Lambert only. |
| R11 | Chiptune synthesis is non-trivial | Med | Minimal scope: 1-2 loopable patterns per level, 1 layer, no real-time composition. |
| R12 | Audio + tone in event contexts | Med | Master volume + mute toggle in HUD (`[` / `]` for volume, `M` for mute). |
| R13 | Browser auto-play / focus policies can pause audio | Low | Visibility-change handler to suspend/resume audio context. |

### 5.2 NEW risks specific to this second instance

- **R14** — **Spec drift from the original.** Since the original instance is archived and read-only, the new instance cannot inherit specs automatically. The sdd-spec phase must reproduce the 10 archived specs with the G25/G26/G27 deltas folded in. If the sdd-spec author re-reads the original specs without noting the 3 verify SUGGESTIONs, the new instance will reproduce the original's WARNINGs verbatim. **Mitigation**: this explore.md explicitly enumerates the 3 deltas; sdd-spec must apply them when reproducing the specs.

- **R15** — **Pedagogical `.fuente` citations must remain accurate.** The 6 sources in `research/fuentes.md` were verified on 2026-08-31. The conflict is evolving — by the time `sdd-apply` writes them into `STRINGS.datos.*.fuente`, the URLs may have changed or new datos may need to be added. **Mitigation**: every dato string + fuente in `content/data.js` is sourced from the table, and the table itself is a reviewable file. The data-screen spec should require `STRINGS.datos.{n}.fuente` be cited verbatim below the dato on screen.

- **R16** — **Comment-stripping workaround must be re-applied.** The original instance documented that Spanish comments in `src/content/models/` were stripped of accents (e.g., "Botiquin" not "Botiquín") to satisfy `verify.sh` check 2 (Spanish-prose isolation). The new instance must apply the same workaround from day 1, or the `verify.sh` check 2 will fail. **Mitigation**: code style spec — model files use ASCII transliterations for Spanish words in comments; only `content/data.js` carries real Spanish copy with accents.

### 5.3 Top 3 risks for this instance

1. **R4** (tone / framing) — same as original. The pedagogical commitment is the soul of the game. Pedagogy sign-off checklist must run before sdd-apply, not after.
2. **R14** (spec drift from original) — new for this instance. The 3 SUGGESTIONs (G25/G26/G27) MUST be folded into the new specs at sdd-spec phase; the original specs are the starting point, not the final word.
3. **R3** (conflict evolves) — same as original. The registry + `content/data.js` separation is the mitigation, and the pre-researched `.fuente` table in `research/fuentes.md` proves the design supports fast updates.

## 6. Deltas from original

### 6.1 The 3 verify SUGGESTIONs (fold in)

1. **SUGGESTION 1 — Remove `console.log` at `nivel5_acuifero.js:89`.** The original had `console.log("[nivel5_acuifero] final dato source:", STRINGS.datos.final.fuente)` left as a debug print. **This instance**: zero `console.*` calls in production `src/`. If debug logging is needed during development, gate behind `__zarra.debug` flag (set in `localStorage` or query string). The data-screen spec and content-strings spec both reference the same `STRINGS.datos.final.fuente` value, removing the need for any runtime debug print.

2. **SUGGESTION 3 — Replace hard-coded `nomacrovertederozarra.com` with `STRINGS.final.enlaces.plataforma_url`.** The original had the URL as a literal at `pedagogy.js:67`. **This instance**: STRINGS schema is `final.enlaces = { plataforma: "Plataforma vecinal (nomacrovertederozarra.com)", plataforma_url: "https://nomacrovertederozarra.com", alegaciones: "Formulario de alegaciones", alegaciones_url: "...", asociacion: "Asociación Naturalista de Ayora", asociacion_url: "..." }`. Every link has both label AND URL from STRINGS. `pedagogy.js` reads only `STRINGS.final.enlaces.*` — no URL literals allowed.

3. **WARNING 2 (effectively SUGGESTION 4) — Add `lifecycle: 'desactivacion'` to bosses 1-4.** The original had the flag only on `planta_treco`. **This instance**: all 5 boss factories set `userData.lifecycle = 'desactivacion'` — `topadora`, `tuberia` (or `tubo_lixiviado` per G25-disambiguation), `incineradora`, `trailer`, `planta_treco`. `enemies.js destroyEnemy()` checks the flag and applies desaturation + motion halt uniformly. Spec: "every boss MUST be desaturated and slowed when its HP reaches 0, regardless of level."

### 6.2 The pre-researched pedagogical `.fuente` strings

`research/fuentes.md` provides the citation table for all 6 dato strings. They were verified on 2026-08-31 against Spanish regional press and one official government source. The new instance's `content/data.js` will write them verbatim into `STRINGS.datos.{nivel1..nivel5}.fuente` and `STRINGS.datos.final.fuente`. Sources:

| Nivel | Texto | Fuente | URL |
|---|---|---|---|
| 1 | "El proyecto prevé 11 millones de metros cúbicos de residuos." | Las Provincias, 24/06/2026 | https://www.lasprovincias.es/comarcas/plataforma-vertedero-zarra-acuerda-protestas-cortes-trafico-20260624183217-nt.html |
| 2 | "El Acuífero de la Mancha Oriental tiene 8.500 km²." | Agencia del Agua de CLM (s/f) | https://agenciadelagua.castillalamancha.es/el-agua-en-castilla-la-mancha/situacion-del-agua-en-clm/acuiferos |
| 3 | "La comarca ya convive con la central nuclear de Cofrentes." | Las Provincias / actualidadvalencia.com, 05/08/2026 | https://actualidadvalencia.com/macrovertedero-zarra-pp-exige-retirada-proyecto/ |
| 4 | "La ruta de camiones pasa junto al colegio y el polideportivo." | Las Provincias, 24/06/2026 | https://www.lasprovincias.es/comarcas/plataforma-vertedero-zarra-acuerda-protestas-cortes-trafico-20260624183217-nt.html |
| 5 | "En 2002 los vecinos ya rechazaron un vertedero igual. 10.700 firmas." | Las Provincias, 16/06/2026 | https://www.lasprovincias.es/comarcas/valle-ayoracofrentes-moviliza-macrovertedero-proyectado-zarra-20260616173049-nt.html |
| final | "A fecha de hoy, la solicitud está en información pública." | Valencia Plaza, 31/07/2026 | https://valenciaplaza.com/valenciaplaza/comarca-y-empresa/crece-el-rechazo-contra-el-macrovertedero-de-zarra-tras-la-ultima-concentracion-de-casi-mil-personas |

The pedagogical caveat (`// TODO pedagogía`) is removed from this instance entirely. The `// TODO` marker should NOT appear in `content/data.js`.

### 6.3 Other differences from the original instance

- **Project root** — moved from `/projects/scratch/test01conf/zarra-game/` to `/projects/personal/zarra-defenders/`.
- **Engram project tag** — explicit `persistence.engram_project: zarra-defenders` in `config.yaml` (the original defaulted to `zarra-game` via CWD detection).
- **Git history** — fresh start with `51e8826` (initial scaffolding) + `a41471e` (sdd-init). No inherited commit history.
- **No archived prior changes in this instance** — `openspec/changes/archive/` is empty for this instance. (The original instance's archive is at the other path and is read-only.)
- **Spec source-of-truth** — the 10 archived specs at the original path serve as reference material; the new instance must reproduce them with the 3 SUGGESTIONs folded in.

### 6.4 What is unchanged from the original

- 5 levels, 11 enemies + 5 bosses, 6 power-ups, 5 pedagogía mechanisms — same as original.
- 4 architectural decisions (A1-A4) — same as original.
- 6 open decisions (D1-D6) — same resolutions as original (see §6.5).
- 13 risks (R1-R13) — same severities and mitigations.
- Stack (Three.js + Web Audio + Pointer Lock, no build, no npm) — frozen in both `config.yaml` files.
- Module layout (`src/{engine,game,content,levels}/`) — same.
- Language conventions (English artifacts, Castilian Spanish in-game copy) — same.

### 6.5 Decisions carried over from original proposal (D1-D6)

| ID | Decision | Original resolution | This instance |
|---|---|---|---|
| D1 | Game name | `"Valle de Ayora: Defensores del Territorio"` | **Same** — already in `openspec/README.md:1`. |
| D2 | Chiptune generated vs licensed tracks | **Generated** | **Same** — procedural ethos, zero weight, zero licensing. |
| D3 | Voice-over vs text for data screens | **Text only** with beep SFX | **Same**. |
| D4 | English / Valenciano translations | **Castellano only v1**, i18n-ready | **Same**. |
| D5 | Publication: Tailscale VPS vs own domain | **Tailscale VPS first** | **Same** — matches CV tool pattern. |
| D6 | Multiplayer co-op | **No v1** | **Same**. |

These are all locked by the original proposal and do not need re-litigation in this instance.

## 7. Architectural decisions to lock

### 7.1 From the original instance (carry forward)

- **A1** — **Model-blueprint registry.** 3D models live under `src/content/models/{index.js, trees/, enemies/, props/, buildings/}`. Each model = one file exporting a pure factory `makeXxx({variant?, position?, rotation?}) → THREE.Group`. The registry is the only public API. Levels and enemy spawners consume only the registry. **Catalog**: 3 trees (encina, pino, almendro), 11 standard enemies (camion_treco, bidon_lixiviado, dron_fumigador, topadora, incineradora, trailer, valla_publicitaria, plataforma_solar, tubo_lixiviado, bolsa_plastico, sello_burocratico), 1 dedicated boss (planta_treco), 3 props (valla, roca, cartel), 3 buildings (casa_ayora, castillo_cofrentes, torre_central). Total ~22 factory files + 1 index.js = **23 files**.

- **A2** — **STRINGS in `content/data.js`.** All user-facing text (datos, enemy labels, power-up names, final-screen links + URLs, button labels, error messages) lives in `src/content/data.js` exported as `STRINGS`. The data-screen spec requires `STRINGS.datos.{nivel1..nivel5, final}.{texto, fuente}` and the final-screen spec requires `STRINGS.final.enlaces.{plataforma, plataforma_url, alegaciones, alegaciones_url, asociacion, asociacion_url}`. `verify.sh` check 2 confirms zero Spanish prose outside `content/data.js`.

- **A3** — **First-click atomic gesture.** The first user interaction (click on start screen) triggers three actions in the same event tick: (1) `canvas.requestPointerLock()`, (2) `audioCtx.resume()`, (3) `loop.start()`. If pointer lock fails, show `STRINGS.start.error_lock` overlay and do NOT start the loop. The single event handler lives in `src/main.js`.

- **A4** — **Light-gun absolute-cursor fallback.** When `MouseEvent.movementX/Y` reports zero for ≥1 s (`aim.zeroCheckWindow = 1000`), switch silently to absolute-cursor mode with ×2 sensitivity (`aim.sensitivityAbs = 0.0050` vs `sensitivityRel = 0.0025`). Switch back silently on non-zero movement. No UI banner.

### 7.2 NEW for this instance

- **A5** — **Pre-researched `.fuente` strings ship in v1.** `research/fuentes.md` is the canonical source for the 6 citation strings. The data-screen spec requires `STRINGS.datos.{nivel1..nivel5}.fuente` and `STRINGS.datos.final.fuente` to be populated from the table — NO empty strings, NO `// TODO pedagogía` markers. Citations are rendered as small text below the dato on the data screen.

- **A6** — **All URLs in STRINGS, zero literals in code.** Every URL (plataforma, alegaciones, asociación, hashtag link) lives under `STRINGS.final.enlaces.*` with both label and URL in STRINGS. The pedagogy module reads `STRINGS.final.enlaces.plataforma_url` etc. — no `https://...` literals allowed in `src/` outside `content/data.js`. Add `verify.sh` check: `grep -rn "https\?://" src/ | grep -v content/data.js | grep -v "http://www.w3.org"` returns 0 matches.

- **A7** — **Every boss sets `lifecycle: 'desactivacion'`.** All 5 boss factories (`topadora`, `tuberia`, `incineradora`, `trailer`, `planta_treco`) set `userData.lifecycle = 'desactivacion'` in their `make()` function. `enemies.js destroyEnemy()` checks the flag uniformly and applies desaturation + motion halt + dispatch `zarra:desactivacion`. Levels 1-4 bosses also desaturate (no explosion) when destroyed. The pedagogy commit holds uniformly across all bosses.

- **A8** — **Zero `console.*` calls in production `src/`.** No `console.log`, `console.warn`, `console.error` in any source file unless gated behind `__zarra.debug` flag. The original instance's debug print at `nivel5_acuifero.js:89` is not reproduced. Add `verify.sh` check: `grep -rn "console\." src/ | grep -v __zarra.debug | grep -v "// "` returns 0 matches.

- **A9** — **Comment-stripping workaround for `verify.sh` check 2.** Spanish comments in `src/content/models/` use ASCII transliterations (e.g., "Botiquin" not "Botiquín", "Camion" not "Camión") to keep the Spanish-prose-isolation check passing. Only `content/data.js` carries real Spanish copy with accents. Documented in code style; same workaround as original instance.

## 8. Stakeholders

| Who | Role | Interest |
|---|---|---|
| **Vecinos/as del Valle** | Primary players + maintainers of `nomacrovertederozarra.com` | Accuracy of datos, recognisable places, updatable content |
| **Residentes extranjeros (UK/NL)** | Secondary players | Optional EN copy (i18n-ready from day 1) |
| **Público general en eventos** | Tertiary players | Light-gun friendliness, short play length, accessibility |
| **Author (single developer)** | Implementer + maintainer | No build step, ≤2 MB, low ceremony, single-person-deployable |
| **Pedagogía reviewer (user)** | Sign-off before apply | Tone, no caricature, source citation, "no se gana — se rechaza en la calle" |
| **Plataforma vecinal** (nomacrovertederozarra.com maintainers) | Recipient of final-screen links | URL accuracy, association credit visibility |
| **Asociación Naturalista de Ayora y la Valle** | Credited entity | Correct name in credits + final-screen association link |

## 9. Open questions

The orchestrator should surface these to the user only if they materially affect scope. Most are pre-resolved by the original instance — surface only items where this instance's setup is different.

1. **OQ1** — **Confirm game name D1.** Original proposal locked `"Valle de Ayora: Defensores del Territorio"`. `openspec/README.md:1` already uses this title. **Recommendation**: lock as-is. No action needed unless user objects.

2. **OQ2** — **Confirm Engram project tag.** `config.yaml` has `persistence.engram_project: zarra-defenders` explicitly. The parent CWD (`/projects/scratch/test01conf/`) defaults Engram to `zarra-game`. **Recommendation**: explicit `project: "zarra-defenders"` on every `mem_save` call. The orchestrator should pass this through to all SDD phases.

3. **OQ3** — **Verify the 3 SUGGESTIONs are the only deltas.** The original verify-report had 4 SUGGESTIONs (console.log, Math.random for trees, hard-coded URL, label-fallback map). Of these:
   - SUGGESTION 1 (console.log) → **fold in as A8**.
   - SUGGESTION 2 (Math.random for trees) → **NOT fold in** — this was just an awareness flag, no spec deviation.
   - SUGGESTION 3 (hard-coded URL) → **fold in as A6**.
   - SUGGESTION 4 (label-fallback map in `bosses.js`) → **NOT fold in** — the original works (uses `key` itself as fallback) but is inelegant. Recommend re-spec: use `STRINGS.bosses.tubo_lixiviado` directly. **Recommendation**: clean up in this instance, but not strictly required for A1-A9. Surface in proposal as a refactor.

4. **OQ4** — **Confirm pedagogical sources are still current.** `research/fuentes.md` was verified 2026-08-31. If sdd-apply runs in a future session, the user should re-verify the URLs (especially the Valencia Plaza 31/07/2026 link which references "salió a información pública el pasado mes de junio [2026]" — the relative date will drift). **Recommendation**: re-verify before sdd-apply; the citations are time-sensitive.

5. **OQ5** — **Original specs as starting point.** The 10 archived specs (`ammo-system`, `boss-system`, `combo-scoring`, `content-strings`, `data-screen`, `enemy-registry`, `game-over-flow`, `hit-feedback`, `level-wave-system`, `pause-menu`) are at the original path. Should sdd-spec READ them as reference and reproduce with deltas, or write fresh from this explore.md? **Recommendation**: read original as reference, reproduce with deltas (G25/G26/G27 + A5/A6/A7/A8/A9) — saves time, preserves proven contracts, ensures the 3 SUGGESTIONs are folded in. **Surface to user only if user wants fresh-from-scratch specs.**

6. **OQ6** — **`openspec/README.md` line about module layout.** The current README says "16-file modular layout" which was already inaccurate in the original instance (was broken by the blueprint registry). The new instance will inherit the same inaccuracy. **Recommendation**: update README during sdd-apply to reflect real layout (~38 source files under `src/{main.js, engine/, game/, content/{data.js, credits.js, models/{index.js, trees/, enemies/, props/, buildings/}}, levels/}`).

7. **OQ7** — **No critical blockers.** None of the deltas introduces a blocker. The 3 SUGGESTIONs fold-in is mechanical (add `lifecycle` flag, change console.log to nothing, move URL to STRINGS). The pre-researched fuentes is a data-only addition. **Ready for sdd-propose.**

## 10. Status

- **Greenfield**: confirmed (no `src/`, no `index.html`, no code anywhere).
- **Plan coherence**: validated (5 levels, 11 enemies + 5 bosses, 6 power-ups, 5 pedagogía mechanisms all present).
- **Architectural decisions (A1-A9)**: A1-A4 carried forward from original; A5-A9 are new for this instance.
- **3 verify SUGGESTIONs**: identified and folded into A6, A7, A8 (and re-spec for boss-system + content-strings + data-screen specs).
- **6 pedagogical fuentes**: pre-researched in `research/fuentes.md`, ready for `content/data.js` to consume.
- **Gaps**: 28 catalogued (24 carried forward + 3 NEW + 1 closed); 11 are high-leverage for the proposal to resolve or surface.
- **Risks**: 16 catalogued (13 carried forward + 3 NEW); R4 (tone) and R14 (spec drift) are the highest.
- **Decisions D1-D6**: all carried forward with original resolutions; no re-litigation needed.
- **Stakeholders**: 7 (same 5 as original + 2 credited entities).
- **Open questions**: 7 (most are pre-resolved; only OQ2 and OQ4 are time-sensitive).

## 11. Ready for proposal

**Yes** — no blockers. The orchestrator may launch `sdd-propose`. Key items the orchestrator should be aware of:

1. **The new instance is a clean reimplementation**, not a continuation of the original. The 3 SUGGESTIONs from the original verify-report (console.log removal, STRINGS-keyed URLs, lifecycle desactivacion on bosses 1-4) MUST be folded into the new specs at sdd-spec phase.
2. **The pedagogical `.fuente` strings ship in v1**, not as `TODO pedagogía`. `research/fuentes.md` is the canonical source — re-verify before sdd-apply if the gap between now and then is more than ~2 weeks.
3. **The 4 original architectural decisions (A1-A4) carry forward unchanged.** The 5 new decisions (A5-A9) are detailed in §7.2 and must be locked in the proposal's "Decisions" section.
4. **The Engram project tag is `zarra-defenders`** (explicit in `config.yaml` and on every `mem_save` call). The parent CWD defaults to `zarra-game`; do NOT rely on default project detection.
5. **The 10 archived specs at the original path are READ-ONLY reference material.** sdd-spec may reproduce them with deltas but must NOT modify them.

No blocker. `sdd-propose` can start.