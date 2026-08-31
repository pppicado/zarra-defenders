# Plan: Valle de Ayora — Defensores del Territorio

> **Estado**: DRAFT pendiente de aprobación
> **Stack objetivo**: Three.js + WebGL vanilla, cliente puro, sin build step
> **Plataforma**: navegador desktop, compatible con pistolas de luz (mouse HID + Pointer Lock API)
> **Idioma del juego**: castellano (el Valle es monolingüe en castellano)
> **Audiencia**: vecinos del Valle + residentes extranjeros (UK/NL) + simpatizantes + público general en eventos
> **Próximo paso tras aprobación**: arrancar SDD (`/sdd-new`) para convertir este plan en proposal + specs + design + tasks

---

## 1. Resumen ejecutivo

Videojuego web 3D estilo on-rails shooter retro (House of the Dead / Time Crisis), jugable con mouse o pistola de luz, ambientado en lugares reales del Valle de Ayora-Cofrentes. El jugador encarna a un vecino/a que defiende su territorio del proyecto de macrovertedero que TRECO quiere instalar en Zarra. Los enemigos son amenazas industriales (camiones, bidones, taladros, topadoras, incineradoras), nunca personas. La pedagogía está integrada: cada nivel va precedido de un dato real del conflicto, y los power-ups son acciones cívicas (firmas, alegaciones, manifestaciones). Al terminar, pantalla final con enlaces a la plataforma vecinal.

**Lo NO es**: no es un panfleto, no caricaturiza personas, no usa violencia contra gente, no pretende "ganar" la batalla legal (símbolo: el juego no se "gana" derrotando al vertedero — se "gana" rechazándolo en la vida real).

---

## 2. Concepto

### Loop principal
1. Pantalla de nivel con dato real del conflicto (10 s).
2. Oleadas de amenazas industriales cada vez más bestias.
3. Power-ups = acciones cívicas que dan habilidades especiales.
4. Boss de nivel = una amenaza icónica del conflicto (un trailer, una incineradora, etc.).
5. Récord, vidas y munición se reinician al empezar nivel nuevo.

### Tono
- **Heroico pero esperanzado**, no catastrofista.
- Adversario = la máquina industrial impersonal, no "los malos".
- Mensaje final: el juego es un altavoz, no un sustituto. La victoria real está en la calle y en las alegaciones.

### Nombre tentativo
**"Valle de Ayora: Defensores del Territorio"** — abierto a cambio en SDD.

---

## 3. Diseño de niveles

Cinco niveles, cada uno basado en un lugar real del Valle y asociado a uno de los argumentos del rechazo.

### Nivel 1 — Las Hoyas de Caballero (Zarra)
- **Lugar real**: paraje donde TRECO proyecta el vertedero. Polígono 11 de Zarra. Terreno agrícola rodeado de masa forestal.
- **Escenario**: camino rural entre encinas y campos de almendros. Cielo naranja de atardecer manchego.
- **Amenazas**: primeros camiones de TRECO, taladros de prospección, vallas con el logo "TRECO — Complejo Medioambiental".
- **Dato entre niveles**: "El proyecto prevé 11 millones de m³ de residuos, más del doble del vertedero de Dos Aguas."
- **Boss**: una topadora gigante arrancando encinas.

### Nivel 2 — La Hoz del río Zarra (Zarra)
- **Lugar real**: "La Hoz" o Barranco del Agua, ruta de senderismo de 13 km por el río Zarra.
- **Escenario**: cañón estrecho con agua abajo, paredes rocosas, vegetación de ribera.
- **Amenazas**: bidones con lixiviados cayendo ladera abajo, drones fumigadores, tuberías clandestinas soltando líquido verdoso.
- **Dato**: "El Acuífero de la Mancha Oriental tiene 8.500 km² — una de las mayores masas de agua subterránea de Europa. Abastece a Ayora, Zarra, Teresa de Cofrentes y Jarafuel."
- **Boss**: tubería industrial gigante escupiendo lixiviados al cauce.

### Nivel 3 — Sierra de La Hunde y Palomera (Ayora)
- **Lugar real**: parajes naturales protegidos al norte de Ayora, descritos como "un pulmón que hay que proteger".
- **Escenario**: pinar denso, sol entre ramas, suelo de romero y aliagas.
- **Amenazas**: motosierras, talas, plataformas solares invadiendo el monte, camiones oruga.
- **Dato**: "La comarca ya convive con la central nuclear de Cofrentes, parques eólicos y plantas fotovoltaicas. La llaman zona de sacrificio."
- **Boss**: una incineradora industrial móvil.

### Nivel 4 — Por las calles de Ayora
- **Lugar real**: casco urbano de Ayora, donde la ruta de camiones prevista pasaría junto al colegio y el polideportivo.
- **Escenario**: calles estrechas, balcones, plaza del pueblo, fuentes. Sol de mediodía.
- **Amenazas**: convoy de trailers atravesando el pueblo, humo tóxico de contenedores ardiendo, polvo, plásticos volados por el aire.
- **Dato**: "La ruta de camiones pasa junto al colegio y el polideportivo de Ayora, y atraviesa el Plan de Emergencia Nuclear de la central de Cofrentes."
- **Boss**: trailer cargado de bidones que se abre paso entre las casas.

### Nivel 5 — El Acuífero (jefe final)
- **Lugar simbólico**: el subsuelo del Valle, donde corre el Acuífero de la Mancha Oriental.
- **Escenario**: cámara subterránea estilizada con estalactitas, ríos subterráneos brillando en azul, olor a mineral.
- **Amenazas**: drones de vigilancia, extractores de agua, tuberías centrales del "Complejo Medioambiental".
- **Dato final**: "En 2002, los vecinos del Valle ya rechazaron un vertedero igual en la misma zona. 10.700 firmas, manifestación con ataúd frente a la Diputación. Se puede volver a parar."
- **Boss final**: la propia planta de tratamiento de TRECO, nave industrial enorme que escupe residuos al acuífero. Derrotarla NO la cierra — abre el mensaje final.

### Pantalla final (no es nivel)
- Créditos.
- Dato: "A fecha de hoy, la solicitud está en información pública. Puedes presentar alegaciones."
- Botones / links:
  - Plataforma vecinal: `nomacrovertederozarra.com`
  - Formulario de alegaciones (cuando lo publique la Generalitat).
  - Asociación Naturalista de Ayora y la Valle.
  - Hashtag propuesto: `#NoAlMacrovertederoDeZarra`
- Botón "Volver a jugar".

---

## 4. Catálogo de enemigos y amenazas

Cada enemigo = una amenaza industrial real del conflicto. Etiquetas visibles con texto real (en español), no caricaturas.

### Básicos
- **Camión TRECO**: trailer con el logo "TRECO". 1 golpe. Puntos ×10.
- **Bidón lixiviado**: barril verde con etiqueta "LIXIVIADO — TÓXICO". 1 golpe. Puntos ×15.
- **Valla publicitaria**: cartel con el claim eufemístico del proyecto. 1 golpe. Puntos ×5.
- **Bolsa de plástico**: arrastrada por el viento. 1 golpe. Puntos ×3.

### Medios
- **Dron fumigador**: quadricóptero soltando polvo. 3 golpes. Puntos ×30.
- **Topadora**: oruga con pala. 5 golpes. Puntos ×50.
- **Plataforma solar**: panel fotovoltaico avanzando. 3 golpes. Puntos ×25.
- **Tubo de lixiviado**: tubería de PVC verde. 3 golpes. Puntos ×35.

### Pesados
- **Trailer largo**: convoy de 2-3 tráilers. 8 golpes. Puntos ×80.
- **Incineradora móvil**: máquina industrial con chimenea. 10 golpes. Puntos ×100.
- **Sello burocrático**: enorme sello de "AUTORIZADO" que cae del cielo. 5 golpes. Puntos ×40. (Simboliza la administración que lo aprueba.)

### Jefes
- Topadora nivel 1, tubería nivel 2, incineradora nivel 3, trailer nivel 4, planta industrial nivel 5.

### Lo que NO es enemigo
- Personas (ni vecinos, ni guardias civiles, ni políticos, ni trabajadores de TRECO).
- Animales del Valle (cabras montesas, jabalíes, águilas — son aliados ambientales, no aparecen como daño).
- Patrimonio (castillos, iglesias — pueden aparecer de fondo, nunca como daño).

---

## 5. Power-ups = acciones cívicas

Cuando el jugador destruye ciertos enemigos o completa oleadas, sueltan power-ups que **reemplazan los clichés del género** (no hay "estrella de doble daño" — hay "firma"):

| Power-up | Efecto | Símbolo |
|---|---|---|
| **FIRMA** | Recupera 1 vida | Mano con bolígrafo |
| **ALEGACIÓN** | Escudo temporal (3 s) | Documento oficial |
| **MANIFESTACIÓN** | Ralentiza el tiempo (5 s) | Pancarta |
| **ALIANZA** | Multiplicador de puntos ×2 (10 s) | Manos entrelazadas |
| **DATO** | Muestra el dato real del conflicto en pantalla | Bombilla informativa |
| **HITO** (cada 5.000 pts) | 1UP | Bandera del Valle |

**Por qué esto importa pedagógicamente**: cada power-up es una acción REAL que el jugador puede hacer fuera del juego. La asociación FIRMA = vida es intuitiva y memorable.

---

## 6. Diseño visual

### Estilo
**Low-poly retro saturado, estética PS1/PS2 indie**. No pixel-art 2D, no foto-realismo. Pocos polígonos, colores planos, sin texturas pesadas. Aspecto deliberadamente "arcade" para que el mensaje no se lea como documental serio.

### Paleta de colores
- **Cielo diurno**: azul saturado con nubes blancas de geometría simple.
- **Vegetación**: verde medio con toques amarillos (romero, aliaga). Encinas en verde oscuro.
- **Tierra**: ocre / naranja manchego.
- **Amenazas**: gris metálico sucio, óxido, verde tóxico para los lixiviados.
- **Power-ups**: dorado brillante con halo.
- **HUD**: blanco sobre negro semi-transparente, tipografía pixel art.

### Identidad visual del jugador
El personaje **no se ve** (es cámara en primera/tercera persona hombro). Sí se ve la **mano armada** con una pistola de luz estilizada low-poly.

### Lugares reconocibles (resumen)
- **Ayora**: plaza, balcones, calles estrechas.
- **Cofrentes**: castillo (al fondo, en algún nivel), torre de la central nuclear como skyline (referencia).
- **Zarra**: Hoz del río Zarra, Atalayas, Cerro Gordo.
- **Sierras**: La Hunde, Palomera, Atalayas (niveles con sus formas reconocibles).
- **Río Júcar**: presente en el nivel de Cofrentes o en cinemáticas.
- **Volcán de Cofrentes**: cameo en el fondo de algún nivel (guiño al patrimonio geológico local).

### Modelos
- Low-poly creados a mano en código (BoxGeometry, CylinderGeometry, etc.) o con primitivas compuestas.
- Enemigos: máximo 200 triángulos cada uno.
- Escenarios: máximo 5.000 triángulos por nivel.

### Texturas
- Cero texturas raster externas. Todo vertex colors + Lambert/Phong simple.
- Reducción brutal de peso: el juego entero debería pesar <2 MB.

---

## 7. Diseño sonoro

### Música (chiptune)
- 8 tracks, una por nivel + intro + final.
- Estilo: chiptune retro alegre-heroico (no tétrico). Pensar en la BSO de arcade tipo "Metal Slug" o "Final Fight".
- Generada con la Web Audio API en tiempo real (sin samples externos) → cero peso, cero licencias.
- Tempo sube con la dificultad.

### Efectos
- Disparo: pulso corto 8-bit.
- Impacto: ruido blanco corto + pitch down.
- Power-up: arpegio ascendente.
- Boss: redoble percusivo al entrar.
- Game over: melodía descendente simple.
- "Dato" entre niveles: voz en off (opcional) o texto con beep de fondo.

### Silencio intencionado
Los momentos de dato entre niveles NO tienen música — solo el beep del texto. Da solemnidad al contraste informativo.

---

## 8. Pedagogía integrada

### Mecanismos
1. **Dato antes de cada nivel**: 10 segundos con dato real del conflicto, fuente citada discretamente.
2. **Power-ups como acciones cívicas**: опис arriba.
3. **Sin victoria épica**: el último boss NO muere en una explosión. Se "desactiva" mientras suena el dato final, y la pantalla cambia al mensaje de acción real.
4. **Créditos**: nombres de las entidades vecinales reales que luchan (Plataforma No al Macrovertedero, Asociación Naturalista, Grupo Pronto Auxilio, etc.).
5. **Pantalla final**: links a nomacrovertederozarra.com y a la web de alegaciones.

### Lenguaje
- Castellano del Valle (sin valencianismo forzado, sin ceceo impostado).
- Textos cortos y directos. Sin jerga administrativa copiada.
- Algunos textos opcionales en inglés para residentes extranjeros.

---

## 9. Stack técnico

### Core
- **Three.js** (UMD desde CDN o bundle local, sin npm).
- **WebGL 2** (con fallback a WebGL 1).
- **Pointer Lock API** para control FPS.
- **Web Audio API** para chiptune + efectos (síntesis en tiempo real).
- **HTML5 Canvas** (solo si necesitamos HUD aparte del DOM).

### Sin build
- HTML + JS + CSS, sin npm, sin webpack/vite.
- Servido por `python3 -m http.server` o equivalente.
- Compatible con Tailscale / VPS del usuario (igual que CV tool).

### Distribución de archivos
```
zarra-game/
├── index.html                    # Entry point + loader
├── styles.css                    # HUD, menús, crosshair
├── plan.md                       # Este documento
├── README.md                     # Cómo jugar, controles, light gun
├── src/
│   ├── main.js                   # Bootstrap, ciclo de juego
│   ├── engine/
│   │   ├── renderer.js           # Three.js setup
│   │   ├── input.js              # Pointer lock + mouse + light gun
│   │   ├── audio.js              # Web Audio chiptune
│   │   └── loader.js             # Carga de niveles
│   ├── game/
│   │   ├── state.js              # Estado global (vidas, score, nivel)
│   │   ├── levels.js             # Definición de los 5 niveles
│   │   ├── enemies.js            # Spawn + comportamiento
│   │   ├── powerups.js           # Lógica de FIRMA / ALEGACIÓN / etc.
│   │   ├── hud.js                # HUD, crosshair, contador
│   │   └── pedagogy.js           # Datos entre niveles, pantalla final
│   ├── content/
│   │   ├── data.js               # Los datos del conflicto (texto)
│   │   └── credits.js            # Créditos
│   └── levels/                   # Cada nivel como módulo
│       ├── level1_hoyas.js
│       ├── level2_hoz.js
│       ├── level3_hunde.js
│       ├── level4_ayora.js
│       └── level5_acuifero.js
└── assets/                       # Vacío por ahora (todo procedural)
```

### Light gun (input.js)
1. **Detección**: al primer click, comprobar si `MouseEvent.movementX/Y` se mueve (las pistolas de luz modernas SÍ envían eventos mouse estándar).
2. **Pointer Lock**: `canvas.requestPointerLock()` con fallback a ESC para salir.
3. **Crosshair**: SVG centrado fijo, sigue al puntero cuando NO está en lock.
4. **Calibración opcional**: pantalla inicial "apunta al centro, dispara". Guarda offset en `localStorage`.
5. **Disparo**: `mousedown` izquierdo. Recargar con `R` o automático tras N disparos.
6. **Pausa**: `ESC` libera pointer lock automáticamente.
7. **Salir**: `Q` o botón en HUD.

### Compatibilidad light gun probada
- AimTrak, Sinden Lightgun, Gun4IR, pistolas PS3/PS4 Move adaptadas.
- Cualquier mouse HID funciona sin configuración extra.
- Pointer Lock cubre el 95% de los casos.

---

## 10. Plan de entrega (orientativo para SDD)

Cuando apruebes este plan, abrimos SDD y generamos:
- **proposal.md**: introducción + objetivos + alcance + no-objetivos.
- **specs/**: 1 spec por capacidad (motor de juego, sistema de input, sistema de enemigos, sistema pedagógico, niveles, HUD, audio, pantalla final).
- **design.md**: arquitectura técnica detallada, decisiones de stack, contratos.
- **tasks.md**: tareas concretas con criterios de aceptación.
- **apply**: implementación.
- **verify**: validación contra los specs.
- **archive**: cierre.

### Fases naturales (post-SDD)
1. **MVP técnico**: pointer lock, escena básica, un cubo que se mueve, un enemigo que aparece y muere. Demostrar que el loop funciona.
2. **Primer nivel jugable**: nivel 1 (Las Hoyas) completo con oleadas, score, 2 tipos de enemigo, 1 power-up.
3. **Sistema pedagógico**: datos entre niveles, créditos, pantalla final con links.
4. **Niveles 2-5**: replicar el patrón del nivel 1 con variación.
5. **Pulido**: balance, música, optimizaciones, calibración light gun.
6. **Empaquetado final**: README, deploy en VPS Tailscale, QR para jugar en eventos.

### Estimación rough
- **MVP**: 1 sesión de trabajo enfocada.
- **Juego completo jugable de inicio a fin**: 4-6 sesiones.
- **Pulido y deploy**: 1-2 sesiones.

---

## 11. Riesgos y decisiones pendientes

### Riesgos
- **R1**: Tres.js tiene requisitos de GPU modestos pero no nulos. Hay que probar en PCs viejos.
- **R2**: Las pistolas de luz más baratas no siempre reportan bien `movementX/Y`. Hay que tener fallback a posición absoluta del cursor.
- **R3**: El conflicto puede evolucionar (aprobación, rechazo, nuevas noticias). El juego debe poder actualizarse rápido — el contenido (datos) debe estar separado del código.
- **R4**: Cuidado con tono y framing — un paso en falso y se lee como propaganda. El iterado con el usuario es clave.
- **R5**: Sin tests automatizados significativos (es un juego, no se testea igual que una webapp). La verificación será manual + playthrough.

### Decisiones pendientes para discutir en SDD
- **D1**: ¿Nombre definitivo del juego? "Defensores del Territorio" es provisional.
- **D2**: ¿Música chiptune generada o usar tracks libres con licencia? Recomiendo generada (cero peso, cero licencias), pero el usuario puede preferir tracks reales.
- **D3**: ¿Voces en off para los datos entre niveles, o solo texto? Texto es más simple y multilingüe.
- **D4**: ¿Traducción al inglés/valenciano además de castellano? Recomiendo empezar solo en castellano y añadir inglés si el tiempo lo permite.
- **D5**: ¿Dónde se publica? VPS Tailscale del usuario (como CV tool) o dominio propio. Recomiendo VPS Tailscale primero, dominio después si hay tracción.
- **D6**: ¿Multiplayer cooperativo en algún nivel? Probablemente no en v1 — foco en single-player bien hecho.

---

## 12. Próximos pasos

1. **Tú**: revisas este plan y lo apruebas o ajustas.
2. **Yo, tras tu aprobación**: lanzo `/sdd-new zarra-defenders` (o el nombre que elijas) para arrancar el flujo SDD.
3. **SDD**: genera proposal + specs + design + tasks.
4. **Revisión conjunta**: validamos los artifacts de SDD antes de empezar a codear.
5. **Implementación**: tareas en orden de dependencias.

---

## Fuentes verificadas del conflicto

- Wikipedia: Zarra (Valencia), Valle de Ayora, Cofrentes.
- Valencia Plaza (09/07/2026): "Zarra se planta ante el vertedero que amenaza uno de los mayores acuíferos de Europa".
- Las Provincias (16/06/2026): "El Valle de Ayora-Cofrentes se moviliza contra el macrovertedero proyectado en Zarra".
- El Periódico (08/06/2026): "El proyecto que inquieta a todo un valle valenciano: camiones, residuos y miedo al fuego".
- Plataforma vecinal: nomacrovertederozarra.com.
