# Tasks: Valle de Ayora — Defensores del Territorio

## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

Forecast: 3680–5280 lines (54 new + 1 modified); single-pr size:exception recommended.

## Phase 1: Foundation

- [ ] 1.1 `index.html` — Three.js r128 UMD + `styles.css` + module script.
- [ ] 1.2 `src/styles.css` — crosshair + HUD + overlays.
- [ ] 1.3 `src/main.js` — bootstrap; start-screen mousedown (A3).
- [ ] 1.4 `src/engine/{scene,render}.js` — scene/camera/renderer+dispose; render + camera-shake.
- [ ] 1.5 `src/engine/input.js` — Pointer Lock; A3; A4 (1 s zero→absolute ×2); `R`/`[`/`]`/`M`.
- [ ] 1.6 `src/engine/audio.js` — suspended AudioContext + sfx/music + chiptune.
- [ ] 1.7 `src/engine/loop.js` — rAF; update→render; pause-aware.
- [ ] 1.8 `src/engine/dom.js` — `window.__zarra = { debug, log, warn, error }` (A8).
- [ ] 1.9 STRINGS skeleton `src/content/data.js` — 6 `.fuente` from `research/fuentes.md` (A5).

## Phase 2: Content + Models

- [ ] 2.1 `src/content/data.js` — all STRINGS keys; `datos.{nivel{1-5},final}.{texto,fuente}`; `final.enlaces.*` (A6).
- [ ] 2.2 `src/content/models/index.js` — `get/keys()`; throws on unknown.
- [ ] 2.3 `models/trees/{encina,pino,almendro}.js` — pure factories; ASCII (A9).
- [ ] 2.4 `models/enemies/{camion_treco,bidon_lixiviado,bolsa_plastico,valla_publicitaria}.js` hp=1; valla drops=[].
- [ ] 2.5 `models/enemies/{plataforma_solar,tubo_lixiviado,dron_fumigador,sello_burocratico}.js` hp 3/3/3/5; dron/sello drops=[alegacion].
- [ ] 2.6 `models/enemies/{topadora,incineradora,trailer}.js` hp 5/10/8; `lifecycle='desactivacion'` (A7).
- [ ] 2.7 `models/enemies/planta_treco.js` — DEDICATED; `lifecycle='desactivacion'` always (A7); hp=30.
- [ ] 2.8 `models/props/{valla,roca,cartel}.js` + `buildings/{casa_ayora,castillo_cofrentes,torre_central}.js`.

## Phase 3: Game Modules

- [ ] 3.1 `src/game/state.js` — `{score, lives, level, inMenu, paused, gameOver}`.
- [ ] 3.2 `src/game/enemies.js` — spawn + raycast + 3-cap + uniform `destroyEnemy()` via `desactivar(group)` (A7).
- [ ] 3.3 `src/game/ammo.js` — 12-round mag, 1.2 s auto-reload, `R` manual.
- [ ] 3.4 `src/game/scoring.js` — base pts from STRINGS; combo ×5; 2 s decay.
- [ ] 3.5 `src/game/hit-feedback.js` — flash 80 ms; boss shake amp=combo; emits via `__zarra` (A8).
- [ ] 3.6 `src/game/waves.js` — REST/SPAWNING/ACTIVE/BOSS/TRANSITION FSM; 4-5 waves, ~30 s, 4 s rest, 3-cap.
- [ ] 3.7 `src/game/bosses.js` — ENTRY/INVULNERABLE/VULNERABLE/SPECIAL_TELL/DESACTIVACION FSM; all 5 desaturate (A7).
- [ ] 3.8 `src/game/powerups.js` — 6 effects: FIRMA/ALEGACIÓN/MANIFESTACIÓN/ALIANZA/DATO/HITO.
- [ ] 3.9 `src/game/{pause,over,hud}.js` — overlays; session score preserved; NO `localStorage`.
- [ ] 3.10 `src/game/{pedagogy,data-screen,dispatcher}.js` — dato + final 4 links (`final.enlaces.*` A6) + credits + bus.

## Phase 4: Levels + Integration

- [ ] 4.1 `src/levels/registry.js` — slug-based loader `start(n)`.
- [ ] 4.2 `nivel{1_hoyas,2_hoz,3_sierra,4_casco}_*.js` — 4-5 waves + boss; desaturate (A7).
- [ ] 4.3 `nivel5_acuifero.js` — 4 waves + `planta_treco`; desactivación → final screen.
- [ ] 4.4 No `console.*` in `src/` (A8) — `grep "console\." src/ | grep -v engine/dom.js` → 0.
- [ ] 4.5 Smoke — `python3 -m http.server 8765` → 200; first wave spawns.

## Phase 5: Verification

- [ ] 5.1 `openspec/README.md` line 19 — "16-file modular" → real ~54-file layout (R6).
- [ ] 5.2 `MANUAL_PLAYTHROUGH.md` — REQ-15 acceptance script.
- [ ] 5.3 `scripts/verify.sh` — STRINGS > 0; Spanish isolation; catalog == 22; ≤ 2 MB; A5 fuentes non-empty; A6 zero `https://` outside `data.js`; A7 all 5 bosses `lifecycle.*desactivacion`; A8 zero `console.*` outside `engine/dom.js`.
- [ ] 5.4 `bash scripts/verify.sh` → 8 PASS / 0 WARN.
