# Valle de Ayora: Defensores del Territorio

> On-rails shooter 3D web, cívico-pedagógico, sobre el conflicto del
> macrovertedero que la empresa TRECO quiere instalar en Zarra (Valle de
> Ayora-Cofrentes, Valencia).

Juego web 3D estilo *House of the Dead* / *Time Crisis*, jugable con
mouse o pistola de luz. Los enemigos son amenazas industriales (camiones,
bidones, taladros, incineradoras), nunca personas. Los power-ups son
acciones cívicas reales:

| Power-up | Efecto | Símbolo cívico |
| --- | --- | --- |
| FIRMA | +1 vida | Firma vecinal |
| ALEGACIÓN | Escudo 3 s | Documento oficial |
| MANIFESTACIÓN | Slow-mo 5 s | Pancarta |
| ALIANZA | ×2 puntos 10 s | Manos entrelazadas |
| DATO | Dato del conflicto en pantalla | Bombilla informativa |
| HITO | 1UP cada 5 000 pts | Bandera del Valle |

El jefe final **no muere en una explosión** — se *desactiva*. La
pantalla final enlaza a la plataforma vecinal real
([nomacrovertederozarra.com](https://nomacrovertederozarra.com)).

---

## Stack

- **Three.js r128** (UMD desde CDN, sin build step)
- **Web Audio API** → chiptune sintetizado en tiempo real, cero peso
- **Pointer Lock API** → mouse o pistola de luz HID
- HTML + JS + CSS vanilla. Sin npm, sin webpack, sin Vite.
- Tamaño total: < 2 MB.

## Cómo jugar (local)

```bash
cd /projects/personal/zarra-defenders/
python3 -m http.server 8000
# Abrí http://127.0.0.1:8000/ en Chrome, Firefox, Safari o Edge
```

Necesita servirse por HTTP — `file://` no permite Pointer Lock.

## Controles

| Acción | Tecla / botón |
| --- | --- |
| Apuntar | Mouse (movimiento relativo) |
| Disparar | Click izquierdo |
| Recargar | `R` (o auto tras 12 disparos, 1.2 s) |
| Pausa | `Esc` |
| Subir / bajar volumen | Rueda del mouse |
| Mute | `M` |
| Salir al menú | `Q` o botón en HUD |

## Pistolas de luz compatibles

AimTrak, Sinden Lightgun, Gun4IR, PS Move adaptado. Pointer Lock cubre
el 95 % de los casos; si la pistola no reporta `movementX/Y`, el módulo
de input cambia a cursor absoluto con sensibilidad ×2 automáticamente.

## Estructura del proyecto

```
zarra-defenders/
├── index.html              # Entry point + loader
├── src/
│   ├── main.js             # Bootstrap (cero lógica)
│   ├── styles.css          # HUD, menús, crosshair
│   ├── engine/             # 7 módulos: renderer, input, audio, loop, scene, dom, model-transform
│   ├── game/               # 14 módulos: state, scoring, waves, enemies, bosses, powerups, hud, pause, pedagogy, ...
│   ├── content/
│   │   ├── data.js         # STRINGS centralizado (único archivo con prosa en castellano)
│   │   └── models/         # 22 archivos: 1 registry + 21 fábricas low-poly (3 árboles, 11 enemigos, 3 props, 3 edificios, 1 boss dedicado)
│   └── levels/             # 5 niveles + registry
├── openspec/
│   ├── specs/              # 10 specs vivos
│   └── changes/archive/    # Ciclo SDD completo (2026-08-31-zarra-defenders)
├── scripts/verify.sh       # 8 chequeos estructurales automatizados
├── MANUAL_PLAYTHROUGH.md   # Script de aceptación manual (REQ-15)
├── plan.md                 # Diseño original aprobado por el usuario
└── research/fuentes.md     # Citas pedagógicas verificadas
```

Convención: **`main.js` solo cablea**. Cada capacidad vive en su propio
archivo (`modularity: strict`). Todo el texto en castellano vive en
`src/content/data.js`; el resto del código es inglés.

## Verificación

Hay dos gates:

1. **Estructural** (automatizado):

   ```bash
   bash scripts/verify.sh
   ```

   8 chequeos: STRINGS, presupuesto de assets ≤ 2 MB, las 5 fuentes
   pedagógicas no vacías, sin `console.log` fuera de `engine/dom.js`,
   los 5 bosses con `lifecycle='desactivacion'`, etc.

2. **Manual** (playthrough):

   ```bash
   $EDITOR MANUAL_PLAYTHROUGH.md
   ```

   Playthrough de los 5 niveles × mouse × pistola de luz × los 6
   power-ups. Es la única aceptación formal del juego.

## Fuentes pedagógicas

Los 6 "datos" que aparecen en el juego están citados en
`research/fuentes.md` (Las Provincias, Valencia Plaza, Agencia del
Agua de CLM, actualidadvalencia.com). Las citas se firmaron antes de
mergear — no quedan marcadores `TODO pedagogía` en `v1`.

## Créditos cívicos

Nombres de las entidades vecinales reales que luchan contra el
macrovertedero:

- Plataforma No al Macrovertedero de Zarra
- Asociación Naturalista de Ayora y la Valle
- Grupo Pronto Auxilio

Hashtag propuesto: `#NoAlMacrovertederoDeZarra`.

## Recursos para la comunidad

QR imprimible para folletos, pancartas y eventos vecinales (apunta a
`https://pppicado.github.io/zarra-defenders/`):

- `assets/qr-zarra-defenders.svg` — vectorial, infinitely escalable
  (ideal para Roll-ups, A3, A2).
- `assets/qr-zarra-defenders.png` — 600×600 px (ideal para folletos
  A5/A4, pegatinas, tarjetas).

Regenerar con cualquier encoder QR estándar si cambia la URL.

---

## Licencia

Proyecto cívico-pedagógico. Si lo querés reutilizar, forkear o
adaptar, contactate con la plataforma vecinal antes de publicarlo.

Desarrollado con SDD (Spec-Driven Development) y asistencia de IA
bajo supervisión humana directa.
