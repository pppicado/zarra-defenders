# Valle de Ayora: Defensores del Territorio

OpenSpec artifacts for the **Defensores del Territorio** game project — a 3D web shooter game built with vanilla Three.js + WebGL, with a civic-pedagogical framing of the TRECO macrovertedero conflict in the Valle de Ayora.

## Project location

Project root: `/projects/personal/zarra-defenders/`

## Stack summary

- **Runtime**: browser, static HTML + JS + CSS, no build step, no npm
- **Engine**: Three.js (vanilla, UMD via CDN or local bundle)
- **Audio**: Web Audio API (chiptune synthesized in real time)
- **Input**: Pointer Lock API (mouse / light gun HID)
- **Distribution**: `python3 -m http.server`

## Conventions

- Modular structure under `src/{engine,game,content,levels}/` with the registry pattern from `content/models/{trees,enemies,props,buildings}/`
- Total source-file layout (53 files under the project root):
  - `index.html` (1) + `src/styles.css` (1) + `src/main.js` (1) = 3 root entry files
  - `src/engine/` (7 modules): `audio.js`, `dom.js` (NEW — A8 `__zarra` debug gate), `input.js`, `loop.js`, `model-transform.js`, `render.js`, `scene.js`
  - `src/game/` (14 modules): `ammo.js`, `bosses.js`, `data-screen.js`, `dispatcher.js` (NEW — event bus per design D2), `enemies.js`, `hit-feedback.js`, `hud.js`, `over.js`, `pause.js`, `pedagogy.js`, `powerups.js`, `scoring.js`, `state.js`, `waves.js`
  - `src/content/data.js` (1) + `src/content/models/` (22 files = 1 `index.js` registry + 21 pure factories: 3 trees, 11 enemies + 1 dedicated `planta_treco` boss, 3 props, 3 buildings)
  - `src/levels/` (6 files): `registry.js` + `nivel{1_hoyas_caballero,2_hoz_zarra,3_sierra_hunde_palomera,4_casco_ayora,5_acuifero}.js`
  - `scripts/verify.sh` (1) + `MANUAL_PLAYTHROUGH.md` (1)
- Principle: "no logic in main.js, each capability in its own file" (`modularity: strict`)
- All copy and code comments default to English (artifact language)
- Castilian Spanish for user-facing game copy, exclusively under `src/content/data.js` (per A2 + content-strings spec §Single STRINGS Object)
- ASCII-only transliteration in `src/content/models/` comments per A9 (e.g., `rio`, `movil`, `Acuifero`, `desactivacion`, `tuberia`)

## Persistence mode

Hybrid (`both`): OpenSpec files + Engram memory. Per session preflight.

## Plan reference

Full design lives at `/projects/personal/zarra-defenders/plan.md` (user-approved, copied from original `/projects/scratch/test01conf/zarra-game/plan.md`).

## Layout

```
openspec/
├── README.md            # this file
├── config.yaml          # project-level config (testing, persistence mode)
├── changes/             # per-change artifacts (proposal, specs, design, tasks, archive)
│   └── archive/         # completed changes (YYYY-MM-DD-{change-name}/)
└── ...
```

## Testing

No test runner installed or planned for v1. `strict_tdd: false`. Verification is **manual playthrough + structural readback** of the OpenSpec artifacts.

## Sources

Pedagogical source citations for the 6 in-game dato strings live at `research/fuentes.md` (also referenced by sdd-spec / sdd-apply phases).
