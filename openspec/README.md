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
- Total source-file layout: `index.html`, `src/main.js`, 4 engine modules (`audio`, `input`, `loop`, `render`), 7+ game modules (`ammo`, `bosses`, `data-screen`, `dispatcher`, `enemies`, `hit-feedback`, `hud`, `over`, `pause`, `pedagogy`, `powerups`, `scoring`, `state`, `waves`), 1 `src/content/data.js`, content registry, 6 level modules (`levels/registry.js` + 5 `nivel*.js`)
- Principle: "no logic in main.js, each capability in its own file" (`modularity: strict`)
- All copy and code comments default to English (artifact language)
- Castilian Spanish for user-facing game copy, exclusively under `src/content/data.js` (per A2 + content-strings spec §Single STRINGS Object)

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
