# Manual Playthrough — REQ-15 Acceptance

> **Change**: `zarra-defenders`
> **Project**: `zarra-defenders` (`/projects/personal/zarra-defenders/`)
> **Purpose**: Manual acceptance script for the **5-level × mouse × light-gun × all-6-power-ups** playthrough defined as REQ-15 in the proposal and as the verification gate for `sdd-verify`.

This file is the **only** acceptance mechanism for the game. There is no test runner, no Jest, no Playwright. The verifier (you, the maintainer, or the user) plays the game end-to-end and ticks each checkbox below.

---

## 0. Setup

```bash
cd /projects/personal/zarra-defenders/
python3 -m http.server 8000
# Open http://127.0.0.1:8000/ in the latest 2 versions of:
#   - Chrome (mouse + light gun via WebHID)
#   - Firefox
#   - Safari
#   - Edge
```

If the user clicks the start screen and the page errors with "Pointer Lock es necesario", a browser gesture was not granted — try clicking again, or check that the page was served over HTTP (not file://).

---

## 1. Smoke (start-screen → level select → first wave spawns)

| Check | Observation | Pass |
|---|---|---|
| Start screen renders the title "Valle de Ayora: Defensores del Territorio" | Visible | [ ] |
| First-click atomic gesture (A3) executes: pointer lock acquired + audio resumed + game loop started | Page no longer shows start screen, cursor locked, HUD appears | [ ] |
| Level select menu appears with 5 entries + session score (0) | Visible | [ ] |
| Click level 1 → dato screen renders with `datos.nivel1.texto` + `datos.nivel1.fuente` | Visible | [ ] |
| Click "Continuar" → level 1 scene loads with trees, vallas, distant casa | Visible | [ ] |
| First wave begins spawning within ~1 second of "Continuar" | New enemies appear from the horizon | [ ] |
| HUD shows `12 / 12` ammo, 3 lives, 0 puntos, ×1 combo, 80% volume | Visible | [ ] |
| Crosshair is visible at screen centre, white | Visible | [ ] |

---

## 2. Combat feedback (per `hit-feedback` spec)

For each enemy hit:

| Check | Observation | Pass |
|---|---|---|
| Crosshair turns red for ~80 ms on hit | Visible flash | [ ] |
| Enemy mesh flashes white for ~80 ms | Visible flash | [ ] |
| No particles anywhere (per spec §No Particles in v1) | Confirm none | [ ] |
| Boss hit (level 1, topadora) → screen shakes with amplitude ∝ combo | Visible shake | [ ] |
| Standard enemy hit → no screen-shake | Confirm | [ ] |
| HUD updates ammo within 1 frame of every shot | "11 / 12", "10 / 12" ... | [ ] |

---

## 3. Power-ups (per content-strings spec §6 Power-Ups)

Each power-up is dropped by destroying specific enemies. Verify each is reachable at least once across the 5-level run:

| Power-up | Effect | How to reach it | Pass |
|---|---|---|---|
| **FIRMA** | +1 vida (lives counter +1) | Drop `firma` — destroy camion_treco, bidon_lixiviado, bolsa_plastico, or trailer | [ ] |
| **ALEGACIÓN** | Shield 3 s (no lives loss when hit) | Destroy dron_fumigador, sello_burocratico, or tubo_lixiviado | [ ] |
| **MANIFESTACIÓN** | Slow-mo 5 s (enemies move ½ speed) | Destroy plataforma_solar or topadora | [ ] |
| **ALIANZA** | ×2 pts for 10 s | Destroy incineradora or trailer | [ ] |
| **DATO** | Overlay shows dato from conflict | Destroy bidon_lixiviado, plataforma_solar, tubo_lixiviado, or dron_fumigador | [ ] |
| **HITO** | 1UP every 5,000 pts | Score past 5,000 (auto-award via MECANICA.hitoUmbral) | [ ] |

---

## 4. Wave system (per `level-wave-system` spec)

For each of the 5 levels:

| Level | Wave count | ~30 s wave | 4 s rest | 3-enemy cap | Boss = 1 + 1–2 adds | Pass |
|---|---|---|---|---|---|---|
| 1 — Hoyas | 4 + boss | [ ] | [ ] | [ ] | [ ] | [ ] |
| 2 — Hoz | 4 + boss | [ ] | [ ] | [ ] | [ ] | [ ] |
| 3 — Sierra | 5 + boss | [ ] | [ ] | [ ] | [ ] | [ ] |
| 4 — Casco | 4 + boss | [ ] | [ ] | [ ] | [ ] | [ ] |
| 5 — Acuífero | 4 + boss (planta_treco dedicated) | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## 5. Boss system (per `boss-system` spec)

For each of the 5 bosses — A7 uniform desactivación:

| Boss | 2 s entry | Invulnerable entry | 3 vulnerable windows | 1 special/phase | Desactivación (no explosion) | Pass |
|---|---|---|---|---|---|---|
| topadora (nivel 1) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| tubo_lixiviado (nivel 2) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| incineradora (nivel 3) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| trailer (nivel 4) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| planta_treco (nivel 5) | [ ] | [ ] | [ ] | [ ] | [ ] (final → final screen) | [ ] |

A7 contract: every boss must desaturate and halt motion on 0 HP. NO explosion, NO fire, NO debris, NO particles.

---

## 6. Pause (per `pause-menu` spec)

| Check | Observation | Pass |
|---|---|---|
| ESC mid-wave → pause overlay appears within 1 frame | [ ] | [ ] |
| Overlay has exactly 3 buttons: Continuar / Reiniciar nivel / Salir al menú | [ ] | [ ] |
| No other interactive controls in the overlay | [ ] | [ ] |
| Continuar → pointer lock re-acquired, game resumes exactly mid-wave | [ ] | [ ] |
| Reiniciar nivel → level restarts from dato screen; session score preserved | [ ] | [ ] |
| Salir al menú → level-select screen, no game loop, no auto-start | [ ] | [ ] |
| Pause during inter-wave rest → timer frozen; resume continues | [ ] | [ ] |
| Pause labels from STRINGS.pausa.* (no hard-coded Spanish in JS) | [ ] | [ ] |

---

## 7. Game over (per `game-over-flow` spec)

| Check | Observation | Pass |
|---|---|---|
| Lose all 3 lives → game-over overlay within 1 s, pointer lock released | [ ] | [ ] |
| Overlay has exactly 2 buttons: Reintentar nivel / Volver al menú de niveles | [ ] | [ ] |
| Reintentar nivel → level restarts from dato screen with session score preserved | [ ] | [ ] |
| Volver al menú de niveles → level select, session score shown | [ ] | [ ] |
| Page reload mid-run → session score is 0 (no persistence, no localStorage) | [ ] | [ ] |
| Private browsing → game loads identically, no errors about storage | [ ] | [ ] |

---

## 8. Combo + scoring (per `combo-scoring` spec)

| Check | Observation | Pass |
|---|---|---|
| Base points awarded per enemy from STRINGS.enemigos.*.puntos | [ ] | [ ] |
| Combo increments per hit, capped at ×5 | [ ] | [ ] |
| 2 s decay timer resets combo to ×1 if no hit within window | [ ] | [ ] |
| Miss does NOT reset combo | [ ] | [ ] |
| Pause freezes combo timer | [ ] | [ ] |
| Level-complete screen shows raw score only (no accuracy / time bonus) | [ ] | [ ] |

---

## 9. Ammo (per `ammo-system` spec)

| Check | Observation | Pass |
|---|---|---|
| Magazine starts at 12 / 12 each level | [ ] | [ ] |
| 13th shot blocked (no ammo consumed) | [ ] | [ ] |
| After 12th shot, 1.2 s auto-reload, magazine fills | [ ] | [ ] |
| Reload click SFX plays once, audibly distinct from fire | [ ] | [ ] |
| `R` mid-magazine triggers reload, same 1.2 s | [ ] | [ ] |
| `R` during active auto-reload does NOT restart timer | [ ] | [ ] |

---

## 10. Final screen (per `data-screen` spec)

| Check | Observation | Pass |
|---|---|---|
| After planta_treco desactivación, final screen appears within 2 s | [ ] | [ ] |
| Final dato visible (`STRINGS.final.dato` / `datos.final.texto`) | [ ] | [ ] |
| 4 links visible: plataforma, alegaciones, asociación, hashtag | [ ] | [ ] |
| Plataforma URL = `nomacrovertederozarra.com` | [ ] | [ ] |
| Hashtag = `#NoAlMacrovertederoDeZarra` (text, selectable) | [ ] | [ ] |
| Single "Volver a jugar" button → returns to level select | [ ] | [ ] |
| No music during final screen (per spec) | [ ] | [ ] |
| A6 — all 4 URLs come from `STRINGS.final.enlaces.*_url` (no inline `https://` in `pedagogy.js`) | [ ] | [ ] |

---

## 11. Light gun (per `hit-feedback` §A4)

If you have a Sinden / AimTrak / Gun4IR / PS Move light gun:

| Check | Observation | Pass |
|---|---|---|
| Connect light gun before starting the game | [ ] | [ ] |
| Pointer lock + first-click atomic gesture (A3) succeeds | [ ] | [ ] |
| If `movementX === 0 && movementY === 0` for >1 s, absolute-cursor fallback activates silently | [ ] | [ ] |
| Aim sensitivity increases ×2 in absolute mode | [ ] | [ ] |
| Movement resumes → module switches back to relative silently | [ ] | [ ] |

---

## 12. Pedagogy sign-off (per `data-screen` spec §Pedagogical Sign-Off Before Apply)

**Note**: Each of the 6 dato strings below must be reviewed by the
pedagogy reviewer (the user) for: data accuracy, citation specificity,
no caricature, desactivación framing.

A5 contract: every `.fuente` value below is a real citation from
`research/fuentes.md` — no TODO pedagogía markers remain in the
shipped v1.

| Key | Reviewed? | Pedagogue sign-off |
|---|---|---|
| `STRINGS.datos.nivel1.texto` + `.fuente` (Las Provincias, 24/06/2026) | [ ] | [ ] |
| `STRINGS.datos.nivel2.texto` + `.fuente` (Agencia del Agua de CLM) | [ ] | [ ] |
| `STRINGS.datos.nivel3.texto` + `.fuente` (actualidadvalencia.com, 05/08/2026) | [ ] | [ ] |
| `STRINGS.datos.nivel4.texto` + `.fuente` (Las Provincias, 24/06/2026) | [ ] | [ ] |
| `STRINGS.datos.nivel5.texto` + `.fuente` (Las Provincias, 16/06/2026) | [ ] | [ ] |
| `STRINGS.datos.final.texto` + `.fuente` (Valencia Plaza, 31/07/2026) | [ ] | [ ] |

---

## 13. Asset budget (per design §Asset budget < 2 MB)

```bash
du -sh /projects/personal/zarra-defenders/
```

Expected: ≤ 2 MB (the game ships zero raster textures; everything is
procedural Three.js geometry + Web Audio synthesis + the Three.js UMD
bundle from CDN).

---

## 14. Structural readback (`scripts/verify.sh`)

Run the structural readback:

```bash
bash /projects/personal/zarra-defenders/scripts/verify.sh
```

Expected: 8 PASS / 0 WARN. The 8 checks cover:
1. STRINGS usage (positive).
2. Spanish-prose isolation (only `data.js` allowed).
3. Model catalog count == 22.
4. Asset budget ≤ 2 MB.
5. A5 — `datos.{nivel{1-5}, final}.fuente` all non-empty (6 checks).
6. A6 — zero `https://` matches in `src/` outside `content/data.js`.
7. A7 — all 5 boss factories carry `lifecycle='desactivacion'`.
8. A8 — zero `console.X` calls in `src/` outside `engine/dom.js`.

---

## Summary

When all sections above are ticked, the manual playthrough script is the
acceptance evidence for `sdd-verify`. The structural readback
(`scripts/verify.sh`) is the automated companion.