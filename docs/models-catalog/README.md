# Model catalog — Valle de Ayora: Defensores del Territorio

This folder is a **reference catalog** for every 3D model the game ships.
Each file describes:

1. **What it represents** in the real Valle de Ayora / TRECO conflict.
2. **Current implementation** — what geometries + materials the v1 code uses.
3. **What descriptions you (the pedagogue / level designer) need to write**
   if you want a richer v2 version.
4. **Visual reference notes** — what the model should *look like* in
   reference imagery.

The goal is for you to look at each entry and tell me which ones you
want upgraded, and how. I can then implement richer geometry, additional
color detail, or a separate sprite-based model.

> **No raster textures**: per the design contract the shipped game stays
> under 2 MB and ships zero external images. Every visual upgrade is
> done procedurally in `src/content/models/.../*.js` — vertex colors,
> Lambert materials, multiple BoxGeometry / CylinderGeometry primitives.

---

## How to use this catalog

For each model you want enriched, fill in the **"Your notes"** section
and tell me:

- **Visual goal** — what it should evoke in the player.
- **Detail priorities** — which of the suggested upgrades matter most.
- **Real references** — any URLs of photos / sketches you want me to
  match the silhouette of.

I'll then refactor the factory file accordingly. The catalog is meant
to be **read once** for context and **referenced** whenever you want a
specific model richer.

---

## Index

### Trees (`src/content/models/trees/`)
- [encina](#encina) — the iconic holm oak of the meseta manchega.
- [almendro](#almendro) — almond tree, common in the Valle's orchards.
- [pino](#pino) — pine, dominant in La Hunde / Palomera.

### Enemies (`src/content/models/enemies/`)
- [camion_treco](#camion_treco) — TRECO trailer, the basic enemy.
- [bidon_lixiviado](#bidon_lixiviado) — toxic leachate drum.
- [bolsa_plastico](#bolsa_plastico) — plastic bag, carried by the wind.
- [valla_publicitaria](#valla_publicitaria) — the project's euphemistic ad billboard.
- [dron_fumigador](#dron_fumigador) — fumigation quadcopter.
- [plataforma_solar](#plataforma_solar) — solar panel platform.
- [tubo_lixiviado](#tubo_lixiviado) — green PVC leachate pipe.
- [topadora](#topadora) — bulldozer (boss level 1).
- [incineradora](#incineradora) — mobile incinerator (boss level 3).
- [trailer](#trailer) — long trailer convoy (boss level 4).
- [sello_burocratico](#sello_burocratico) — bureaucratic stamp falling from the sky.
- [planta_treco](#planta_treco) — TRECO treatment plant (boss level 5, dedicated factory).

### Props (`src/content/models/props/`)
- [valla](#valla) — fence post.
- [roca](#roca) — limestone rock.
- [cartel](#cartel) — generic sign / placard.

### Buildings (`src/content/models/buildings/`)
- [casa_ayora](#casa_ayora) — typical Ayora village house.
- [castillo_cofrentes](#castillo_cofrentes) — Cofrentes castle.
- [torre_central](#torre_central) — Cofrentes nuclear plant cooling tower.

---

<a id="encina"></a>
## encina

**Real reference**: the holm oak (Quercus ilex). Gnarled, evergreen,
silver-green leaves, dark trunk. Symbol of the Spanish meseta and
central to the Valle de Ayora landscape.

**Current implementation** (v1):
- One cone for the canopy (radius 1.2, height 2.4, 8 segments).
- One cylinder for the trunk (radius 0.18, height 1.2).
- Two flat Lambert materials: dark olive canopy, brown trunk.
- Total: ~80 triangles.

**Detail priorities** for v2:
- Canopy as a cluster of 3-5 overlapping spheres or boxes (not a single
  cone) for a more organic silhouette.
- Two-tone canopy color (light top, dark underside) via vertex colors or
  a second mesh.
- Visible branch texture — a darker cylinder cluster under the canopy.

**Your notes**: _fill in here_

---

<a id="almendro"></a>
## almendro

**Real reference**: almond tree (Prunus dulcis). Lighter and more open
than encina. White-pink blossom in February-March (the Valle's most
photographed moment). In-game: represents the agricultural landscape
around Zarra.

**Current implementation** (v1):
- One cone canopy + one cylinder trunk, similar to encina but smaller
  and lighter green.

**Detail priorities** for v2:
- Multiple canopy lobes (almond trees are irregular, not conical).
- White-pink vertex-color tips to evoke blossom (seasonal).
- Slightly leaning trunk (almonds don't grow straight).

**Your notes**: _fill in here_

---

<a id="pino"></a>
## pino

**Real reference**: Aleppo pine (Pinus halepensis). Native to the
Sierra de La Hunde / Palomera (levels 3-4). Long needles, red bark,
irregular crown.

**Current implementation** (v1):
- One cone canopy + one cylinder trunk, dark green canopy.

**Detail priorities** for v2:
- More layered canopy — multiple cones stacked at different heights.
- Reddish-brown trunk (current is grey-brown).
- Visible trunk flare at the base (pines widen at ground level).

**Your notes**: _fill in here_

---

<a id="camion_treco"></a>
## camion_treco

**Real reference**: a TRECO branded articulated lorry. The most common
enemy — a generic industrial threat, the workhorse of the conflict.

**Current implementation** (v1):
- Box cab (1.4×1.2×1.6) + box trailer (2.6×1.6×4.5).
- 8 cylinder wheels (radius 0.4, 12 segments).
- Green plate on the side labelled TRECO (flat colored plane).
- HP: 1. Puntos: 10.

**Detail priorities** for v2:
- Visible cab windows (darker rectangle on the cab front).
- Headlights (small yellow cylinders).
- Exhaust pipe / chimney on top of the cab.
- Chassis detail between cab and trailer.
- A second TRECO logo on the cab door (smaller).
- Optional: subtle "TRECO — Complejo Medioambiental" text via a
  CanvasTexture (would be the first raster texture — only use if you
  accept the 2 MB budget increase).

**Your notes**: _fill in here_

---

<a id="bidon_lixiviado"></a>
## bidon_lixiviado

**Real reference**: a 200 L industrial drum (typically green for toxic
waste, with a yellow hazard label). Lixiviados are the toxic liquids
that leach out of landfills when it rains — they're the single biggest
groundwater threat.

**Current implementation** (v1):
- Cylinder drum (radius 0.5, height 1.2) + small cylinder cap on top.
- Yellow + green Lambert materials.
- HP: 1. Puntos: 15.

**Detail priorities** for v2:
- Yellow hazard label band (thin cylinder, yellow, with diagonal black
  stripes via vertex colors).
- A small dent / bulge (use BoxGeometry subtraction — or just a darker
  face on one side).
- Subtle drip coming out of the cap (small green sphere).

**Your notes**: _fill in here_

---

<a id="bolsa_plastico"></a>
## bolsa_plastico

**Real reference**: a white plastic shopping bag, windblown. The
smallest, fastest enemy — represents the everyday plastic pollution
that the Valle already lives with.

**Current implementation** (v1):
- Single white plane (0.6 × 0.8) rotated 45°.
- HP: 1. Puntos: 3.

**Detail priorities** for v2:
- Two crossed planes (X shape) for a more bag-like silhouette.
- Per-frame rotation (already wobbles via position; add rotation too).
- Slight transparency (Lambert with opacity 0.85).

**Your notes**: _fill in here_

---

<a id="valla_publicitaria"></a>
## valla_publicitaria

**Real reference**: a roadside billboard advertising the project with a
euphemistic slogan ("Complejo Medioambiental", "Modernización Verde"…).
A satirical target — the user destroys it.

**Current implementation** (v1):
- 2 vertical posts + 1 rectangular panel + 1 horizontal strut.
- Green panel with white border.
- HP: 1. Puntos: 5.

**Detail priorities** for v2:
- Larger billboard with the actual slogan "TRECO — Complejo
  Medioambiental" rendered as a CanvasTexture (raster budget hit, but
  the visual payoff is huge).
- Smaller billboard next to it (the "modernización verde" one).
- A small pile of rubble / dirt at the base.

**Your notes**: _fill in here_

---

<a id="dron_fumigador"></a>
## dron_fumigador

**Real reference**: an agricultural quadcopter (DJI Agras style) that
sprays chemicals. In the game's satirical frame, TRECO uses them to
"prepare the terrain" — but really to suppress any natural resistance.

**Current implementation** (v1):
- Central body (cylinder + box) + 4 propeller arms (thin cylinders) +
  4 propellers (thin cylinders).
- HP: 3. Puntos: 30.

**Detail priorities** for v2:
- Spinning propellers (rotate around Y axis per frame — could use a
  per-mesh animation hook).
- Visible spray nozzle underneath (small cone).
- Faint dust cloud trailing behind (3-4 transparent spheres at
  decreasing opacity).

**Your notes**: _fill in here_

---

<a id="plataforma_solar"></a>
## plataforma_solar

**Real reference**: a portable solar panel platform (the kind used in
construction sites). Represents the cumulative industrialization of the
Valle — the comarca already has the nuclear plant, wind farms, AND
solar farms ("zona de sacrificio" per the in-game dato for level 3).

**Current implementation** (v1):
- Tilted box for the panel + box base.
- HP: 3. Puntos: 25.

**Detail priorities** for v2:
- Grid pattern on the panel surface (multiple thin boxes overlaid).
- Two-tone panel (darker cells, lighter frame).
- Visible cable trailing from the panel to a small generator box.

**Your notes**: _fill in here_

---

<a id="tubo_lixiviado"></a>
## tubo_lixiviado

**Real reference**: a green PVC pipe illegally discharging leachate
into a watercourse. Real-world: photographed in multiple Spanish
environmental scandals. The boss for level 2.

**Current implementation** (v1):
- Long cylinder (radius 0.4, length 6) + 2 flange cylinders at the
  ends + 1 dark "gunk" cylinder exiting one end.
- Green + dark brown materials.
- HP: 3 (normal) / 5 (boss, level 2). Puntos: 35.

**Detail priorities** for v2:
- Visible brackets attaching the pipe to a virtual wall.
- A constant drip animation (small spheres falling from the gunk end
  with downward velocity, despawning at z < -50).
- Cracks / rust spots (darker cylinders overlapping the green one).

**Your notes**: _fill in here_

---

<a id="topadora"></a>
## topadora

**Real reference**: a tracked bulldozer ripping up encinas. The boss
for level 1 — the first "personal" threat the player faces, because
the bulldozer is destroying trees the player grew up seeing.

**Current implementation** (v1):
- Box body + 2 tread cylinders + flat blade in front + operator cabin.
- HP: 5. Puntos: 50.

**Detail priorities** for v2:
- Detail on the blade (vertical ridges to look like steel plate).
- Exhaust pipe with a tiny particle puff on top.
- An uprooted encina stuck on the blade (dramatic visual cue).
- Caterpillar tread links (multiple thin boxes per tread).

**Your notes**: _fill in here_

---

<a id="incineradora"></a>
## incineradora

**Real reference**: a mobile industrial incinerator (the kind waste
companies use to burn refused material). Boss for level 3 — the
smoke-and-ash nightmare of the Sierra.

**Current implementation** (v1):
- Box body + tall cylinder chimney + box burner door + small chimney
  cap.
- HP: 10 (highest). Puntos: 100.

**Detail priorities** for v2:
- Visible heat shimmer (semi-transparent red sphere inside the burner).
- Smoke trail from the chimney (multiple small grey spheres rising and
  fading).
- Wheels for mobility (4 large cylinders).
- A small access ladder on the side.

**Your notes**: _fill in here_

---

<a id="trailer"></a>
## trailer

**Real reference**: a long articulated trailer (2-3 carriages) loaded
with leachate drums. Boss for level 4 — represents the trucks
rumbling through Ayora's streets next to the school and the
polideportivo.

**Current implementation** (v1):
- Cab + 2 linked trailer boxes + 12 wheels.
- HP: 8. Puntos: 80.

**Detail priorities** for v2:
- Visible drum cargo poking out of each trailer (3 cylinders per
  carriage, color-coded toxic-green).
- Articulation joint between trailers (visible hinge).
- Cab mirrors (small boxes on either side).
- Mud flaps behind the wheels.

**Your notes**: _fill in here_

---

<a id="sello_burocratico"></a>
## sello_burocratico

**Real reference**: a giant rubber stamp with "AUTORIZADO" that falls
from the sky. A satirical target — the bureaucracy that approves the
project. Not a boss, but a heavy mid-level enemy.

**Current implementation** (v1):
- 2 boxes (the stamp frame + the stamp face) + a thin cylinder handle
  on top.
- Red materials.
- HP: 5. Puntos: 40.

**Detail priorities** for v2:
- "AUTORIZADO" text on the stamp face (CanvasTexture — raster budget
  hit).
- A subtle shadow underneath (flat dark circle on the ground plane).
- Stamping animation: vertical bobbing during flight, hard press on
  landing (use a transient state in userData).

**Your notes**: _fill in here_

---

<a id="planta_treco"></a>
## planta_treco

**Real reference**: the proposed treatment plant itself — a large
industrial warehouse with smokestacks, silos, and processing towers.
Dedicated boss factory (separate from `incineradora`). Boss for level 5
— the final boss that represents the whole project.

**Current implementation** (v1):
- Large box base + 2 cylindrical silos + 1 tall smokestack + 1 box
  office module + 2 smaller tanks.
- HP: 15. Puntos: 250 (boss-only).
- Special: always sets `lifecycle='desactivacion'` (uniform A7).

**Detail priorities** for v2:
- Smokestack with a slow smoke trail (like incineradora).
- Pipe network connecting the silos (multiple thin cylinders).
- A fence around the perimeter (the valla prop reused).
- Warning signs at the entrance (small boxes with red/yellow stripes).
- An ambient low rumble (use audio.js to layer a drone over the music).

**Your notes**: _fill in here_

---

<a id="valla"></a>
## valla

**Real reference**: a wooden fence post. Scene prop for the levels
(thin wire fences around fields, the kind that separate paths from
private land).

**Current implementation** (v1):
- 1 vertical post + 2 horizontal rails.
- Brown wood material.

**Detail priorities** for v2:
- A bit of barbed wire along the top (thin diagonal cylinder).
- Slight rotation variation per instance (already supported by the
  factory's `opts.rotation`).

**Your notes**: _fill in here_

---

<a id="roca"></a>
## roca

**Real reference**: a chunk of limestone (the Valle is full of them —
the geological base of the meseta). Scene prop for level 3 (Sierra de
La Hunde).

**Current implementation** (v1):
- 2 stacked irregular cylinders + 1 small box.
- Light grey Lambert.

**Detail priorities** for v2:
- More irregular silhouette (multiple small rocks clustered).
- Darker crevices (vertex colors on the underside).
- A small patch of moss (green sphere on top).

**Your notes**: _fill in here_

---

<a id="cartel"></a>
## cartel

**Real reference**: a generic sign / placard. Scene prop used as
visual filler (project signs, hazard markers).

**Current implementation** (v1):
- 1 thin box (the placard) + 2 thin posts.

**Detail priorities** for v2:
- Different placard colors per usage (yellow for hazards, green for
  project signs, white for info).
- Slight tilt (already supported via opts.rotation).

**Your notes**: _fill in here_

---

<a id="casa_ayora"></a>
## casa_ayora

**Real reference**: a typical village house in Ayora — whitewashed
walls, terracotta tile roof, small balcony. The casco urbano of level 4
features 6 of these.

**Current implementation** (v1):
- 1 box body + 1 angled box roof (rotated 30°).
- White walls, red-brown roof.

**Detail priorities** for v2:
- Visible windows (4 dark squares on each face).
- A small wooden door (rectangle on the front face).
- Chimney on the roof (small box).
- A small flower box on one window (optional, for color).

**Your notes**: _fill in here_

---

<a id="castillo_cofrentes"></a>
## castillo_cofrentes

**Real reference**: the castle of Cofrentes (Castillo de Cofrentes /
Castillo de Don Juan Manuel), 12th-century Moorish-Castilian
fortification. Appears as a background silhouette in the Sierra and
Casco levels.

**Current implementation** (v1):
- 1 main keep box + 4 corner tower cylinders + 1 wall box + 1 crenellated
  top (small box rows).

**Detail priorities** for v2:
- More crenellations along the top (multiple thin boxes).
- A flag pole on the highest tower (thin cylinder + small box).
- Visible gate (darker rectangle in the wall).

**Your notes**: _fill in here_

---

<a id="torre_central"></a>
## torre_central

**Real reference**: the cooling tower of the Cofrentes Nuclear Power
Plant (Iberdrola, operating since 1984). The hyperboloid silhouette is
iconic — it appears as a distant reference in levels 3-4. Per the
in-game dato for level 3, the comarca "ya convive con la central nuclear".

**Current implementation** (v1):
- 1 hyperboloid cylinder + 1 wider base ring.
- Grey material.

**Detail priorities** for v2:
- Visible water vapor plume from the top (transparent white sphere
  rising).
- A small access building at the base.
- A perimeter fence (the valla prop reused).

**Your notes**: _fill in here_

---

## Workflow

1. **Pick** the entries you want enriched.
2. **Fill in** the "Your notes" section with your priorities.
3. **Hand me the file** (or just point to the entries) and tell me which
   ones to upgrade.
4. I refactor the corresponding `src/content/models/.../*.js` factory
   keeping the same `userData` contract so levels don't break.

The shipped model count is **21 factories + 1 registry** under
`src/content/models/` (per the verify.sh budget check). Adding more
detail in the factories doesn't change that count — only the geometry
inside each factory.
