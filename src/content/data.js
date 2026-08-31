// content/data.js
//
// Single source of truth for ALL user-facing Spanish text. Per
// architectural decision A2 + content-strings spec, NO other source file
// under src/ MAY contain free-prose Spanish copy. The data-screen spec
// also requires the dato + citation to live here (keys
// `datos.nivel{n}.texto` and `.fuente`).
//
// Architectural decisions honoured in this instance:
//   A5 - All 6 `.fuente` strings are populated VERBATIM from
//        research/fuentes.md (the canonical source). NO TODO pedagogia
//        markers, NO empty strings.
//   A6 - All URLs live under `final.enlaces.*_url` — no `https://`
//        literals appear anywhere else in src/.
//
// The 6 power-ups live under `powerups.*` (id, name, descripcion,
// simbolo) per content-strings spec §6 Power-Ups Defined as Data
// (REQ-5 placement).
//
// `MECANICA` is the tunables namespace. Per design D7 / content-strings
// spec §HITO cadence documented, the HITO threshold lives here
// (`mecanica.hitoUmbral`) — never hard-coded in `powerups.js`.

export const STRINGS = {
  start: {
    subtitle: "Un on-rails shooter cívico-pedagógico sobre el macrovertedero de TRECO.",
    error_lock: "Pointer Lock es necesario para jugar. Haz clic otra vez.",
    error_audio: "Audio no disponible. Recarga la página.",
  },

  // Datos pedagogicos: pre-researched from research/fuentes.md (A5).
  // Every citation ships ready; no TODO markers remain.
  datos: {
    nivel1: {
      texto: "El proyecto prevé 11 millones de metros cúbicos de residuos.",
      fuente: "Las Provincias, 24/06/2026",
    },
    nivel2: {
      texto: "El Acuífero de la Mancha Oriental tiene 8.500 km².",
      fuente: "Agencia del Agua de CLM (s/f)",
    },
    nivel3: {
      texto: "La comarca ya convive con la central nuclear de Cofrentes.",
      fuente: "actualidadvalencia.com, 05/08/2026",
    },
    nivel4: {
      texto: "La ruta de camiones pasa junto al colegio y el polideportivo.",
      fuente: "Las Provincias, 24/06/2026",
    },
    nivel5: {
      texto: "En 2002 los vecinos ya rechazaron un vertedero igual. 10.700 firmas.",
      fuente: "Las Provincias, 16/06/2026",
    },
    final: {
      texto: "A fecha de hoy, la solicitud está en información pública.",
      fuente: "Valencia Plaza, 31/07/2026",
    },
  },

  enemigos: {
    camion_treco:      { label: "Camión TRECO",       descripcion: "Trailer con el logo del Complejo Medioambiental.", puntos: 10 },
    bidon_lixiviado:   { label: "Bidón lixiviado",    descripcion: "Barril verde etiquetado como tóxico.",          puntos: 15 },
    valla_publicitaria:{ label: "Valla publicitaria", descripcion: "Cartel con el claim eufemístico del proyecto.",   puntos: 5  },
    bolsa_plastico:    { label: "Bolsa de plástico",  descripcion: "Arrastrada por el viento.",                       puntos: 3  },
    dron_fumigador:    { label: "Dron fumigador",     descripcion: "Quadricóptero soltando polvo.",                  puntos: 30 },
    plataforma_solar:  { label: "Plataforma solar",   descripcion: "Panel fotovoltaico avanzando.",                   puntos: 25 },
    tubo_lixiviado:    { label: "Tubo de lixiviado",  descripcion: "Tubería de PVC verde.",                          puntos: 35 },
    topadora:          { label: "Topadora",           descripcion: "Oruga con pala.",                                puntos: 50 },
    sello_burocratico: { label: "Sello burocrático",  descripcion: "Sello enorme de AUTORIZADO que cae del cielo.",   puntos: 40 },
    trailer:           { label: "Trailer largo",      descripcion: "Convoy de dos o tres tráilers.",                 puntos: 80 },
    incineradora:      { label: "Incineradora móvil", descripcion: "Máquina industrial con chimenea.",               puntos: 100 },
  },

  bosses: {
    topadora:     { label: "Topadora gigante" },
    tuberia:      { label: "Tubería industrial de lixiviados" },
    tubo_lixiviado:{ label: "Tubería industrial de lixiviados" },
    incineradora: { label: "Incineradora industrial móvil" },
    trailer:      { label: "Trailer cargado de bidones" },
    planta_treco: { label: "Planta de tratamiento TRECO" },
  },

  powerups: {
    firma:         { name: "FIRMA",         descripcion: "Recupera 1 vida.",                            simbolo: "✍"  },
    alegacion:     { name: "ALEGACIÓN",     descripcion: "Escudo temporal de 3 segundos.",               simbolo: "📄" },
    manifestacion: { name: "MANIFESTACIÓN", descripcion: "Ralentiza el tiempo 5 segundos.",             simbolo: "✊"  },
    alianza:       { name: "ALIANZA",       descripcion: "Multiplicador de puntos ×2 durante 10 segundos.", simbolo: "🤝" },
    dato:          { name: "DATO",          descripcion: "Muestra un dato real del conflicto.",          simbolo: "💡" },
    hito:          { name: "HITO",          descripcion: "1 vida extra al alcanzar cada hito de puntos.", simbolo: "🚩" },
  },

  final: {
    titulo: "Gracias por defender el Valle",
    dato:   "A fecha de hoy, la solicitud está en información pública.",
    enlaces: {
      // A6 — every link pairs label + URL; pedagogy.js reads STRINGS only.
      plataforma:      "Plataforma vecinal (nomacrovertederozarra.com)",
      plataforma_url:  "https://nomacrovertederozarra.com",
      alegaciones:     "Formulario de alegaciones",
      alegaciones_url: "https://www.example.org/alegaciones-zarra",
      asociacion:      "Asociación Naturalista de Ayora y la Valle",
      asociacion_url:  "https://www.example.org/asociacion-naturalista-ayora",
      hashtag:         "#NoAlMacrovertederoDeZarra",
    },
    volver: "Volver a jugar",
  },

  creditos: {
    titulo: "Créditos",
    volver: "Volver al menú",
    entidades: [
      { nombre: "Plataforma No al Macrovertedero", rol: "Coordinación vecinal" },
      { nombre: "Asociación Naturalista de Ayora y la Valle", rol: "Apoyo técnico-ambiental" },
      { nombre: "Grupo Pronto Auxilio", rol: "Voluntariado" },
      { nombre: "Vecinos y vecinas del Valle de Ayora-Cofrentes", rol: "Memoria y activismo" },
    ],
  },

  pausa: {
    titulo:    "Pausa",
    continuar: "Continuar",
    reiniciar: "Reiniciar nivel",
    salir:     "Salir al menú",
  },

  gameover: {
    titulo:     "Game over",
    reintentar: "Reintentar nivel",
    menu:       "Volver al menú de niveles",
  },

  menu: {
    titulo: "Valle de Ayora",
    puntos: "Puntos de la sesión",
  },

  data: {
    continuar: "Continuar",
  },

  hud: {
    ammo:    "Munición",
    vidas:   "Vidas",
    puntos:  "Puntos",
    combo:   "Combo",
    volumen: "Volumen",
  },

  mecanica: {
    hitoUmbral:      5000,
    comboCap:        5,
    comboDecay:      2.0,
    magazineSize:    12,
    reloadSec:       1.2,
    shieldSec:       3.0,
    slowSec:         5.0,
    allianceSec:     10.0,
    alianzaFactor:   2,
    waveSec:         30,
    waveSecMin:      15,
    interWaveSec:    4,
    bossEntrySec:    2,
    vulnerableSec:   4,
    invulnerableSec: 3,
    enemyCap:        3,
  },
};

export const MECANICA = STRINGS.mecanica;