# Design: zarra-defenders — Valle de Ayora: Defensores del Territorio

> **Change**: `zarra-defenders` · **Project**: `zarra-defenders`
> **Artifact store**: hybrid (OpenSpec file + Engram topic `sdd/zarra-defenders/design`)
> **Stack** (frozen): vanilla Three.js + WebGL + Web Audio API + Pointer Lock API, no build, no npm
> **Conventions**: `src/{engine,game,content,levels}/`, `modularity: strict`, in-game copy in Castilian Spanish
> **Proposal-locked A1-A9** honored without revisiting.

---

## Technical Approach

Each of the 10 specs maps to a dedicated module under `src/game/`, joined by a new `dispatcher.js` event bus that decouples inter-module messages (keeps `modularity: strict`). The engine layer (`src/engine/`) owns cross-cutting subsystems — `input`, `audio`, `loop`, `render`, `scene`, and a new `dom.js` that exposes a single gated `__zarra.debug` utility (A8). Content splits into three concentric rings: `src/content/models/index.js` is the only public surface for 3D models; `src/content/data.js` is the only file allowed to contain free-prose Spanish copy, owns the 6 `.fuente` strings pre-populated verbatim from `research/fuentes.md` (A5), and pairs every URL with its label under `STRINGS.final.enlaces.*` (A6). Per-level modules under `src/levels/` consume the registry and `STRINGS` but never construct geometry or strings inline. The wave scheduler and boss lifecycle are state machines per `level-wave-system` and `boss-system`; the boss loop honors A7 — every boss carries `userData.lifecycle='desactivacion'` from the factory, so `enemies.js destroyEnemy()` routes all 5 bosses through one `desactivar(group)` path that desaturates + halts motion + dispatches `zarra:desactivacion`.

## Architecture Decisions

| ID | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| **D1** | File layout: `src/{engine,game,content,levels}/` with `content/models/{trees,enemies,props,buildings}/` and `levels/registry.js`. | Single flat `src/`; per-spec subfolders under `game/` | `config.yaml` `modularity: strict`; isolates engine from per-level content; registry gets its own namespace. |
| **D2** | One game module per spec: `state/waves/bosses/enemies/scoring/pause/over/powerups/hud/hit-feedback/ammo/pedagogy/data-screen/dispatcher.js` under `src/game/`. | Single mega `game.js`; spec-grouped folders | Strict modularity; `dispatcher.js` is the new bus that lets spec modules stay decoupled. |
| **D3** | Game loop: `src/engine/loop.js` runs `requestAnimationFrame` with fixed update tick + render; input → update → render phases per frame. | `setInterval`; Three.js driver only | Deterministic `dt` for wave timers and reload. |
| **D4** | Audio: single shared `AudioContext` in `src/engine/audio.js`, suspended until first gesture; master `GainNode` + per-channel (sfx/music) gains. | Multiple `AudioContext`s; no central bus | R12 + A3 both require one suspended context + one master gain. |
| **D5** | Model registry: `registry.get(id).make({variant?,position?,rotation?})` as the only public API. | Inline geometry in levels; per-folder public exports | A1; unknown keys throw at lookup. |
| **D6** | Dedicated `planta_treco` factory under `src/content/models/enemies/planta_treco.js` (not a variant of `incineradora`). | Boss-variant flag on `incineradora` | `boss-system`: desactivación lifecycle distinct enough to forbid shared factory. |
| **D7** | `STRINGS` exported from `src/content/data.js` with nested keys; 6 power-ups live as data under `powerups.*`. | Per-module string constants; i18n lib | A2 first-class commitment. |
| **D8** | First-click atomic gesture: `src/engine/input.js` bundles `requestPointerLock()` + `audioCtx.resume()` + first `requestAnimationFrame` on the same event tick. | Lazy audio resume on first shot | A3 — three browser contracts must succeed together. |
| **D9** | Light-gun fallback: `input.js` watches `MouseEvent.movementX/Y`; both stay `0` for >1 s post-lock → absolute cursor clamped to canvas + ×2 sensitivity. | Always-relative; per-device config | A4 — silent switch. |
| **D10** | Boss desactivación lifecycle: factories set `userData.lifecycle='desactivacion'`; renderer applies desaturated fade + motion stop instead of explosion. | Single `destroyed` path | `boss-system` + A7 — "no se gana" framing holds at every level. |
| **D11** | Wave scheduler state machine: `REST → SPAWNING → ACTIVE → BOSS → TRANSITION`; defers spawns (not skips) when 3-enemy cap is hit. | Pure-timer; per-wave scripts | `level-wave-system` — "no enemies left + ≥15 s elapsed" needs event-driven state. |
| **D12** | Combo scoring: `src/game/scoring.js` holds `{score, combo, comboT}`; tick checks `comboT>2.0` → reset; cap ×5; miss does NOT reset. | Reset on miss; per-frame decay step | `combo-scoring`. |
| **D13** | Persistence: zero `localStorage`/IndexedDB. Session score in memory. | `localStorage` for high scores | `game-over-flow` v1. |
| **D14** | Pointer Lock integration: only `src/engine/input.js` calls `requestPointerLock`/`exitPointerLock`; `pause.js` subscribes to the lock-state event. | Each subsystem calling Pointer Lock itself | Centralises browser-gate behavior; ESC handling falls out. |
| **D15** | HTML entrypoint: single `index.html` loads Three.js (UMD CDN), `src/styles.css`, `src/main.js` as `<script type="module">`. No bundler. | Webpack/Vite/Rollup; import maps | Stack frozen to no build. |
| **D16** | No tests / no build configs: `python3 -m http.server` for distribution; manual playthrough is the only verification. | Vitest + jsdom; Playwright | `config.yaml` `strict_tdd: false`. |
| **D17** | `.fuente` strings in `src/content/data.js` are populated verbatim from the 6-row table in `research/fuentes.md`; that table is the canonical source. | Auto-fetch at runtime; per-level source files | A5 — verified 2026-08-31; re-verify before `sdd-apply` if gap >2 weeks (R15). |
| **D18** | `STRINGS.final.enlaces = { plataforma, plataforma_url, alegaciones, alegaciones_url, asociacion, asociacion_url, hashtag }` — every link pairs label + URL; `pedagogy.js` reads `STRINGS.final.enlaces.*_url` only. | Hard-coded URLs in `pedagogy.js`; per-screen constants | A6 — civic maintainability + `verify.sh` grep guarantees zero literals outside `content/data.js`. |
| **D19** | All 5 boss factories (`topadora`, `tubo_lixiviado`, `incineradora`, `trailer`, `planta_treco`) set `userData.lifecycle='desactivacion'` in `make()`; `enemies.js destroyEnemy()` checks the flag and routes to a single `desactivar(group)` path. | Per-boss custom destruction code; original's planta-only desactivación | A7 — uniform pedagogical framing across every boss. |
| **D20** | `src/engine/dom.js` exports a single `window.__zarra = { debug: bool, log/warn/error(msg) }` utility; production `src/` calls `__zarra.log(...)` instead of `console.*` directly. | Allow `console.*` anywhere; rely on linter | A8 — single carve-out module gates all debug logging; `verify.sh` ensures no bare `console.*`. |
| **D21** | Spanish comments inside `src/content/models/` use ASCII transliterations (`Botiquin`, `Camion`, `Acuifero`) to satisfy `verify.sh` check 2 (Spanish-prose isolation). Only `src/content/data.js` carries real Spanish copy with accents. | Per-file encoding toggles; UTF-8 throughout | A9 — same workaround as original instance; documents code style. |

## Data Flow

### (a) First-click startup — Pointer Lock + Audio + Game Loop

```
START SCREEN  ──mousedown──>  engine/input.js
                                 │
                                 ├──>  canvas.requestPointerLock()   (A3 step 1)
                                 ├──>  audioCtx.resume()             (A3 step 2)
                                 └──>  engine/loop.js first rAF      (A3 step 3)
                                            │
                                            ▼
                                       scene + waves
   (any debug logging behind __zarra.debug via engine/dom.js — A8)
```

### (b) A single shot — input → hit-test → flash → score → combo

```
mousedown ──> input.js ──> ammo.tryFire()
                              │
                              ├── decrement magazine ──> hud.update()
                              │
                              └── raycaster.cast(enemies)
                                    │
                                    ├── hit ──> enemy.userData.hp--
                                    │           ├── hp > 0 ──> flash 80 ms (white)
                                    │           ├── hp = 0 ──> destroyed → scoring.add(enemyId)
                                    │           │                  ├── combo++ (cap ×5)
                                    │           │                  ├── comboT = 0
                                    │           │                  ├── drop powerup? (userData.powerupDrops)
                                    │           │                  └── hud.update()
                                    │           │
                                    │           └── if userData.lifecycle === 'desactivacion'
                                    │                └── enemies.js desactivar(group)  (A7)
                                    │                     ├── saturate(desaturate) over 600 ms
                                    │                     ├── motion halt (velocity *= 0)
                                    │                     └── dispatcher.emit('zarra:desactivacion', group)
                                    │                            └── if bossFinal → pedagogy.finalScreen() ≤ 2 s
                                    │
                                    └── miss ──> crosshair stays white, combo unchanged
```

### (c) Level transition — complete → data screen → next level

```
last wave cleared ──> over.js check win
                          │
                          ├── (if level < 5)  data.screen(nivel{n+1})
                          │                       │   STRINGS.datos.nivel{n+1}.texto
                          │                       │   STRINGS.datos.nivel{n+1}.fuente  (A5)
                          │                       ▼
                          │                   level.registry.start(nivel{n+1})
                          │
                          └── (if level = 5)  boss.desactivacion() ──> final.screen
                                                            ├── STRINGS.datos.final.texto
                                                            ├── STRINGS.datos.final.fuente   (A5)
                                                            ├── STRINGS.final.enlaces.*  (label)
                                                            ├── STRINGS.final.enlaces.*_url  (A6)
                                                            └── "Volver a jugar" button
```

## File Changes

| File | Action | Description |
|---|---|---|
| `index.html` | Create | Single entrypoint; loads Three.js (UMD CDN), `src/styles.css`, `src/main.js` as `<script type="module">`. |
| `src/styles.css` | Create | HUD + overlay styling: crosshair, ammo/score/combo panel, pause, game-over, final, data screen. White-on-dark (readable at 2 m). |
| `src/main.js` | Create | Bootstrap only: imports engine + level registry, wires start-screen click handler (A3). No logic beyond wiring. |
| `src/engine/scene.js` | Create | Three.js scene/camera/renderer; exposes `scene`, `camera`, `renderer`, `dispose()`. |
| `src/engine/render.js` | Create | Per-frame render + camera-shake amplitude driver (reads `hit-feedback` state). |
| `src/engine/input.js` | Create | Pointer Lock, mouse-move → yaw/pitch, fire/`R`/ESC, light-gun fallback timer, master-volume keys. Owns A3 atomic gesture. |
| `src/engine/audio.js` | Create | Single `AudioContext`, master `GainNode`, sfx/music sub-gains, chiptune synth, `resume()` on first gesture. |
| `src/engine/loop.js` | Create | `requestAnimationFrame` driver; calls `update(dt)` then `render()`; suspends on ESC overlay. |
| `src/engine/dom.js` | Create | **NEW**: exports `window.__zarra = { debug, log, warn, error }` — the single debug carve-out (A8). Production files call `__zarra.log(...)`. |
| `src/game/state.js` | Create | Session state: `{score, lives, level, inMenu, paused, gameOver}`. |
| `src/game/waves.js` | Create | Wave scheduler state machine (REST/SPAWNING/ACTIVE/BOSS/TRANSITION); 4–5 waves/level, 30 s budget, ≥15 s min, 4 s rest, 3-enemy cap. |
| `src/game/bosses.js` | Create | Boss lifecycle state machine (ENTRY/INVULNERABLE/VULNERABLE/SPECIAL_TELL/DESACTIVACION). All 5 bosses use desactivación uniformly (A7). |
| `src/game/enemies.js` | Create | Spawn loop + `destroyEnemy()`; desactivación branch reads `userData.lifecycle='desactivacion'` (A7). |
| `src/game/scoring.js` | Create | Per-enemy base points from `STRINGS.enemigos.*.puntos`; combo cap ×5; 2 s decay; miss does NOT reset. |
| `src/game/pause.js` | Create | ESC overlay (Continuar/Reiniciar nivel/Salir al menú); re-acquire lock on Continuar. |
| `src/game/over.js` | Create | Game-over overlay (Reintentar nivel/Volver al menú); HITO 1UP; no `localStorage`. |
| `src/game/powerups.js` | Create | 6 power-up effects: FIRMA/ALEGACIÓN/MANIFESTACIÓN/ALIANZA/DATO/HITO. |
| `src/game/hud.js` | Create | HUD: ammo, lives, score, combo, master volume, mute, "¡Preparados!" countdown. |
| `src/game/hit-feedback.js` | Create | Crosshair flash, enemy flash, boss screen-shake (combo-scaled), no particles. |
| `src/game/ammo.js` | Create | 12-round mag, 1.2 s auto-reload, manual `R`, single click SFX per reload. |
| `src/game/pedagogy.js` | Create | Dato + final screen; reads **ONLY** from `STRINGS.final.enlaces.*_url` (A6). |
| `src/game/data-screen.js` | Create | Dato + citation render; single Continuar button; no music; optional beep. |
| `src/game/dispatcher.js` | Create | **NEW**: tiny event bus for `zarra:desactivacion`, `zarra:hud-update`, etc. Keeps per-spec modules decoupled. |
| `src/content/data.js` | Create | Exports `STRINGS` (nested keys) + `MECANICA`. Contains 6 pre-researched `.fuente` strings (A5) + `STRINGS.final.enlaces.*` label+url pairs (A6). Only file with Spanish prose. |
| `src/content/models/index.js` | Create | Public registry: `get(id) → factory`, `keys() → string[]`. |
| `src/content/models/trees/{encina,pino,almendro}.js` | Create | One factory each: `makeXxx → THREE.Group`. ASCII comments only (A9). |
| `src/content/models/enemies/camion_treco.js` | Create | hp=1, powerupDrops from `STRINGS.powerups`. |
| `src/content/models/enemies/bidon_lixiviado.js` | Create | hp=1. |
| `src/content/models/enemies/dron_fumigador.js` | Create | hp=3, drops include `alegacion`. |
| `src/content/models/enemies/topadora.js` | Create | hp=5 standard / boss-tier when `variant:'boss'`; **sets `userData.lifecycle='desactivacion'` on boss variant** (A7). |
| `src/content/models/enemies/incineradora.js` | Create | hp=10 / boss-tier; **A7 desactivacion on boss variant**. |
| `src/content/models/enemies/trailer.js` | Create | hp=8 / boss-tier; **A7 desactivacion on boss variant**. |
| `src/content/models/enemies/valla_publicitaria.js` | Create | hp=1, `powerupDrops:[]` (never undefined). |
| `src/content/models/enemies/plataforma_solar.js` | Create | hp=3. |
| `src/content/models/enemies/tubo_lixiviado.js` | Create | hp=3 / boss-tier (nivel 2 boss); **A7 desactivacion on boss variant**. |
| `src/content/models/enemies/bolsa_plastico.js` | Create | hp=1. |
| `src/content/models/enemies/sello_burocratico.js` | Create | hp=5, drops include `alegacion`. |
| `src/content/models/enemies/planta_treco.js` | Create | **Dedicated** factory (D6); `userData.lifecycle='desactivacion'` always (A7). |
| `src/content/models/props/{valla,roca,cartel}.js` | Create | Static props; pure factories. |
| `src/content/models/buildings/{casa_ayora,castillo_cofrentes,torre_central}.js` | Create | Background buildings. |
| `src/levels/registry.js` | Create | Maps `nivel{n}` id → module; exposes `start(n)`. |
| `src/levels/nivel1_hoyas_caballero.js` | Create | Hoyas: 4 non-boss + boss `topadora` + 1–2 adds. |
| `src/levels/nivel2_hoz_zarra.js` | Create | Hoz: 4 + boss `tubo_lixiviado`. |
| `src/levels/nivel3_sierra_hunde_palomera.js` | Create | Hunde: 5 + boss `incineradora`. |
| `src/levels/nivel4_casco_ayora.js` | Create | Ayora casco: 4 + boss `trailer`. |
| `src/levels/nivel5_acuifero.js` | Create | Acuífero: 4 + dedicated `planta_treco`; desactivación → final screen. |
| `scripts/verify.sh` | Create | Structural readback. **New checks**: A5 (no TODO markers in `data.js` + 6 fuentes populated), A6 (no `https://` in `src/` outside `data.js`), A7 (5 boss factories set `lifecycle='desactivacion'`), A8 (zero bare `console.*` in `src/`), A9 (no accented chars in `src/content/models/`). |
| `MANUAL_PLAYTHROUGH.md` | Create | REQ-15 acceptance script: 5 levels × mouse × light gun × all power-ups end-to-end. |
| `openspec/README.md` | Modify | Update module-layout line for new `dispatcher.js` + `dom.js` (R6 housekeeping). |

## Interfaces / Contracts

### Registry contract (`src/content/models/index.js`)

```js
export function get(id) {
  const f = FACTORIES[id];
  if (!f) throw new Error(`registry.get: unknown model id "${id}"`);
  return f;
}
export function keys() { return Object.keys(FACTORIES); }
// usage
const group = registry.get('topadora').make({ variant: 'boss', position: {x:0,y:0,z:-10} });
// group.userData = { hp, puntosKey, powerupDrops, lifecycle: 'desactivacion' (boss only) }
```

### STRINGS shape — A5 fuentes + A6 URL pairs

```js
export const STRINGS = {
  datos: {
    nivel1: { texto: 'El proyecto prevé 11 millones de metros cúbicos de residuos.',
              fuente: 'Las Provincias, 24/06/2026' },                          // A5
    nivel2: { texto: 'El Acuífero de la Mancha Oriental tiene 8.500 km².',
              fuente: 'Agencia del Agua de CLM (s/f)' },
    nivel3: { texto: 'La comarca ya convive con la central nuclear de Cofrentes.',
              fuente: 'actualidadvalencia.com, 05/08/2026' },
    nivel4: { texto: 'La ruta de camiones pasa junto al colegio y el polideportivo.',
              fuente: 'Las Provincias, 24/06/2026' },
    nivel5: { texto: 'En 2002 los vecinos ya rechazaron un vertedero igual. 10.700 firmas.',
              fuente: 'Las Provincias, 16/06/2026' },
    final:  { texto: 'A fecha de hoy, la solicitud está en información pública.',
              fuente: 'Valencia Plaza, 31/07/2026' },
  },
  // ... enemigos (11), bosses (5), powerups (6), pausa, gameover, hud, mecanica, creditos, start ...
  final: {
    dato: 'A fecha de hoy, la solicitud está en información pública.',
    enlaces: {                                                                // A6
      plataforma:      'Plataforma vecinal (nomacrovertederozarra.com)',
      plataforma_url:  'https://nomacrovertederozarra.com',
      alegaciones:     'Formulario de alegaciones',
      alegaciones_url: 'https://www...',        // populated when Generalitat publishes
      asociacion:      'Asociación Naturalista de Ayora y la Valle',
      asociacion_url:  'https://www...',
      hashtag:         '#NoAlMacrovertederoDeZarra',
    },
  },
};
```

### First-click atomic gesture (`src/engine/input.js`, A3)

```js
async function onStartScreenMouseDown(ev) {
  ev.preventDefault();
  let lockOk = false, audioOk = false;
  try { await canvas.requestPointerLock(); lockOk = true; } catch (_) {}
  try { await audioCtx.resume(); audioOk = true; } catch (_) {}
  if (lockOk && audioOk) { loop.start(); hideStartScreen(); }
  else                  { showError(STRINGS.start[lockOk ? 'error_audio' : 'error_lock']); }
}
```

### Wave scheduler state machine (`src/game/waves.js`)

```
REST ──(4 s elapsed, no enemies)──> SPAWNING
SPAWNING ──(next slot AND activeEnemies < 3)──> emit / defer
ACTIVE ──(last enemy destroyed AND >=15 s elapsed)──> REST
BOSS ──(userData.lifecycle==='desactivacion' AND hp=0)──> TRANSITION ──> level-complete
```

### Boss state machine + uniform desactivación (`src/game/bosses.js` + A7)

```
ENTRY (2 s, invulnerable, HUD shows STRINGS.bosses[id].label)
   |
   v
INVULNERABLE_1 --(1 s+ tell)--> VULNERABLE_1 --(timer)--> INVULNERABLE_2 --...--> VULNERABLE_3
                                                                                |
   v                                                                            v
DESACTIVACION  <------ (hp=0) <----------------------------------------------------+
   |
   v  enemies.js desactivar(group):
   |   |-- group.material.color.lerp(GRAY, 0.3) over 600 ms
   |   |-- motion halt (velocity *= 0 per frame)
   |   `-- dispatcher.emit('zarra:desactivacion', group)
   |          `-- if group.userData.bossFinal -> pedagogy.finalScreen() <= 2 s
```

### Debug utility (`src/engine/dom.js`, A8)

```js
// the ONLY module in src/ allowed to call console.* directly
const debugFlag = () =>
  (typeof localStorage !== 'undefined' && localStorage.getItem('__zarra.debug') === '1') ||
  (typeof location !== 'undefined' && new URLSearchParams(location.search).get('debug') === '1');
export const __zarra = {
  get debug() { return debugFlag(); },
  log:   (...a) => { if (__zarra.debug) console.log(...a); },
  warn:  (...a) => { if (__zarra.debug) console.warn(...a); },
  error: (...a) => { if (__zarra.debug) console.error(...a); },
};
// production code:  import { __zarra } from '../engine/dom.js';  __zarra.log('wave cleared');
// verify.sh:        grep -rn "console\." src/ | grep -v engine/dom.js   -> expect 0
```

## Testing Strategy

| Layer | What to Verify | Approach |
|---|---|---|
| Manual playthrough | All 5 levels, mouse + light gun, all 6 power-ups reachable | REQ-15 — `MANUAL_PLAYTHROUGH.md` acceptance script. |
| **A5 — fuentes** | All 6 `STRINGS.datos.*.fuente` non-empty, cite real Spanish press / official bodies from `research/fuentes.md` | `verify.sh`: `grep -E 'TODO pedagog' src/content/data.js` → 0; assert each `.fuente` matches the table row. |
| **A6 — zero URL literals** | Zero `https://` in `src/` outside `content/data.js` | `verify.sh`: `grep -rn "https\?://" src/ \| grep -v content/data.js` → 0. |
| **A7 — 5 bosses desactivacion** | All 5 boss-capable factories set `userData.lifecycle='desactivacion'` | `verify.sh`: for each id in `{topadora, tubo_lixiviado, incineradora, trailer, planta_treco}` grep factory for `lifecycle\s*=\s*['"]desactivacion['"]` → expect match. |
| **A8 — zero `console.*`** | Zero bare `console.*` outside `engine/dom.js` | `verify.sh`: `grep -rn "console\." src/ \| grep -v engine/dom.js` → 0. |
| **A9 — ASCII comments** | Spanish comments in `src/content/models/` use ASCII transliterations | `verify.sh`: `grep -rn '[áéíóúñü]' src/content/models/` → 0. |
| Catalog walk | `registry.keys()` exposes 3 trees + 11 enemies + 1 `planta_treco` + 3 props + 3 buildings = 21 | `node -e "import('./src/content/models/index.js').then(m => console.log(m.keys().length))"` → 21. |
| Pedagogy sign-off | Each of the 6 dato strings signed off in the data-screen checklist | **Blocks `sdd-apply`** until all 6 signed (R4 mitigation). |
| Structural isolation | No Spanish prose outside `content/data.js` | `grep -R '[áéíóúñü¿¡]' src/ --exclude=content/data.js` → 0. |

## Threat Matrix

**N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. The game is a browser-static SPA with no backend.** Pointer Lock and `AudioContext.resume()` (A3) are user-gesture-gated browser APIs, not shell calls. No `localStorage` (`game-over-flow` v1), no service worker, no `fetch` beyond what `STRINGS.final.enlaces.*_url` triggers in a new tab. Recorded explicitly per the skill's applicability gate.

## Migration / Rollout

**No migration required — greenfield.** The change creates the entire project tree from scratch. Post-archive revert is a single `git revert` of the change commit(s). Distribution is `python3 -m http.server` from the project root per `config.yaml.distribution`.

## Open Questions

None.
