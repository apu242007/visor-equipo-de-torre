# Piletas · referencias visuales y estado de los datos

Componente 10 del visor V2: **sistema de circulación** (`legacy-ext/40-wellsite.js`, función `buildCirculacion`; constante
`PILETA_ACUM`; textos en `scripts/patches/10-circulacion.mjs`; ficha en `legacy-ext/44-meta-circulacion.js`). Este trabajo:

1. rediseña la **pileta de ensayo** (tanque contenedor corrugado, patín de vigas, escalera, cubierta con barandas, equipo rojo de
   cubierta, bocas de inspección, visor de nivel, cubicador) y su **golpeador**;
2. agrega la **pileta de acumulación** como subconjunto nuevo (`pileta_acumulacion`), **con dimensiones y ubicación PENDIENTES**;
3. concilia el desgasificador anterior con el golpeador: es **un solo equipo** (se rediseñó el existente, no se agregó otro).

## Imágenes de referencia (unidades de campo genéricas)

**No son el equipo del TACKER 10.** Sirven para la tipología y el nivel de detalle, nunca como cota as-built. Origen y licencia sin
verificar: **no están versionadas en git** (la copia local vive en `.tmp/refs-png/piletas/` del checkout principal).

| Archivo                                        | Qué muestra                                                                                                                                              | Se usó para                                                                                                            |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `PILETA_DE_ENSAYO1.png`                        | **Pileta de ensayo con golpeador** (Jorge confirmó que la pileta de ensayo es la pileta con golpeador): tanque blanco, recipiente vertical rojo al costado, cañería roja con válvulas, equipo rojo en cubierta con barandas amarillas y una rampa/escalón | Golpeador (vertical rojo, cuello de ganso, válvulas), equipo rojo de cubierta, rampa, regla graduada, barandas de cubierta |
| `33d74e_2fed708fbd354904b8e236a05f6b55c4_mv2.png` | Pileta de acumulación sin cañerías rojas: tanque blanco corrugado, barandas amarillas, escalera vertical, dos bocas de descarga con válvula mariposa y patín negro | Corrugado, barandas superiores, escalera de extremo, bocas de descarga con palanca azul, patín de vigas con rodillos      |
| `33d74e_9e671446a1c64a66892492c0f611f0f9_mv2.png` | Pileta de acumulación con cañería roja vertical/horizontal, válvulas y recipiente rojo en cubierta; cajón blanco de cubierta                              | Cañería roja que sube por fuera de la baranda, la cruza y baja al recipiente rojo; cajón blanco; unión de martillo      |
| `4468_1725288301.png`                          | Pileta de acumulación con colector rojo horizontal en el costado (válvulas, ramales ascendentes), recipiente rojo en cubierta, barandas azules              | Colector rojo en el costado −z con válvulas de compuerta, tés con unión, ménsulas y entrada al tanque                   |

## Interpretación del usuario (confirmada)

- **La pileta de ensayo es la "pileta con golpeador"** (`PILETA_DE_ENSAYO1.png`).
- Las otras tres fotos son la **pileta de acumulación** (dos con cañerías rojas y recipiente rojo).
- El recipiente vertical rojo de la foto (**golpeador**) es el mismo equipo que el "gas buster"/desgasificador que el visor ya
  dibujaba: se rediseñó (antes: cilindro suelto a 1 m del costado, x −4,5 · z −16,9; ahora: sobre una ménsula del patín, pegado al
  costado −z, x −6,9 · z −16,68, conectado al tanque). No hay dos equipos.

## Estado de los datos

| Dato                                                                                   | Estado      | Fuente / nota                                                                                                      |
| -------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| Pileta de ensayo 12 × 2,4 m en planta, 40 m³                                           | confirmado  | Folleto TACKER 10 rev. 26/06/2024; LAYOUT TKR-10. Sin cambios                                                       |
| Cubicador 3,5 m³ (cilindro vertical Ø 1,3 × 2,4 m)                                     | confirmado (capacidad) / aproximado (forma) | Folleto / LAYOUT. Forma, faldón, tubo de nivel y conexión a la pileta: aproximado               |
| Barandas y rodapié (PIL-2), luminarias (PIL-1)                                         | confirmado  | Libro DROPS p.21. Se conservan los grupos `drops_PIL-1` / `drops_PIL-2`. La baranda queda abierta 0,8 m en la escalera |
| La pileta de ensayo es la pileta con golpeador                                         | confirmado  | Aclaración de Jorge                                                                                                 |
| Golpeador = el recipiente vertical rojo (desgasificador) de la foto                    | interpretación | Inferido de la foto `PILETA_DE_ENSAYO1.png`; pendiente de confirmar con Jorge                                     |
| Golpeador: Ø 0,6 × 2,3 m, posición, cañerías, válvulas, cuello de ganso                | aproximado  | Tipología de la foto; cotas heredadas del desgasificador anterior. Presión, caudal y conexiones: **pendiente**      |
| Altura de cubierta 2,0 m, corrugado cada 0,3 m, patín de vigas, escalera, tapas, bocas de inspección, regla de nivel | aproximado  | Estético; tipología de las fotos                                                                                    |
| Equipo rojo de cubierta (módulo con capó y dos motores)                                | pendiente   | Solo se ve en la foto; **función y tamaño sin dato**                                                               |
| Rampa/escalón (chapa inclinada bajo el borde de la cubierta)                           | pendiente   | Interpretación de la foto; función sin dato                                                                         |
| Existencia de una pileta de acumulación en el TACKER 10                                | pendiente   | El LAYOUT TKR-10 no la muestra (solo una "planta de efluentes" sin cotas)                                          |
| Ubicación de la pileta de acumulación (`cx −2 · cz −19,4`)                             | pendiente   | Supuesto: costado −z de la pileta de ensayo, 3,2 m entre costados                                                   |
| Dimensiones de la pileta de acumulación (`L 10 · W 2,4 · H 2,0 m`)                     | pendiente   | Orden de magnitud de la pileta de ensayo, **sin declararlo dato**                                                   |
| Capacidad (m³) de la pileta de acumulación                                             | pendiente   | Sin dato; no se calcula                                                                                             |
| Bocas de descarga, válvulas mariposa, colector rojo, recipiente rojo, escalera, barandas de la acumulación | aproximado  | Tipología de 3 fotos de campo; función, presión y ruteo pendientes                                                  |
| Color de barandas de la acumulación (amarillo), palancas (azul)                        | pendiente   | Colores de las fotos (una lleva barandas azules); color real sin dato                                              |
| Ruteo de cañerías del choke manifold → pileta y bomba → kill                           | pendiente (sin cambios) | Definido en el componente 07 (`CHOKE_ROUTING`); no se toca. Solo se agregaron bridas en los extremos de la pileta  |
| Posición de la bomba triplex 6 × 2,4 m                                                 | confirmado (sin cambios) | No se toca                                                                                                         |

Peligros nuevos agregados al panel (rotulados "referencia, pendiente de validación", nunca requisitos): gas o vapores en el
golpeador y su venteo (incl. H₂S), rebalse de las piletas, ingreso a espacio confinado por las bocas de inspección, proyección de
fluido a presión en cañerías y válvulas del golpeador. La ficha de confiabilidad se mantiene en **B / Parcial**.

## Ubicación de la pileta de acumulación

`PILETA_ACUM = { cx: -2, cz: -19.4, L: 10, W: 2.4, H: 2.0 }` (constante en `buildCirculacion`). Se eligió el costado −z de la pileta
de ensayo (lado opuesto al pozo): el lado +z está ocupado por las líneas de matar (z −12,9) y de llegada del choke (z −12,7), y el
extremo +x por el cubicador y la torre de luz de (13, −12). Cambiar `cx`/`cz` reubica todo el subconjunto (cañerías, escalera y
recipiente incluidos, porque se construyen relativos a la constante).

## Chequeo de interferencias

Triángulo contra caja (SAT) sobre toda la escena (`.tmp/measure.mjs --env x0,x1,z0,z1,h,y0`; el suelo se excluye con y0 = 0,1 m).

| Envolvente                                                                 | Colisiones | Objeto más cercano                                                                          |
| -------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| Pileta de acumulación: x −7,5…4,95 · z −20,9…−18,1 · y 0,1…3,9             | ninguna    | Cono de tránsito (−8, −22): 0,94 m · ménsula del golpeador: 1,0 m · pileta de ensayo: 1,43 m |
| Golpeador (con ménsula): x −8,1…−5,5 · z −17,2…−15,98 · y 0,1…3,9          | ninguna    | Mástil de luminaria PIL-1 (−8,2, −15,7): 0,18 m · manguera de servicio: 0,47 m · acumulación: 0,97 m |
| Pileta de ensayo completa: x −8,5…5,6 · z −16,0…−13,4 · y 0,1…3,2          | solo contactos previstos | Extremos de las cañerías de succión (x −8) y de llegada (z −13,5) sobre el costado; calcomanía TACKER sobre el costado; 15 triángulos de una piedra suelta del entorno que **ya estaba bajo el patín en el original** |

La pileta de ensayo ya no tiene la franja roja lateral (la calcomanía "TACKER" roja del Libro DROPS p.21 sigue). Las nervaduras
llegan al mismo plano (±1,2 m) que el costado original; la calcomanía flota a ±1,222 m.

## Presupuesto de rendimiento

| Métrica                 | Antes (HEAD) | Después | Límite  |
| ----------------------- | ------------ | ------- | ------- |
| Triángulos renderizados | 105.254      | 116.714 | +14.000 |
| Draw calls              | 349          | 353     | +4      |
| Meshes                  | 355          | 359     | —       |

Delta: **+11.460 triángulos, +4 draw calls.** Mallas del componente 10 (triángulos): `pileta_ensayo_pintura` 2.208 ·
`pileta_ensayo_acero` 2.804 · `golpeador_pintura` 2.144 · `pileta_acumulacion_pintura` 3.696 · `pileta_acumulacion_acero` 1.464 ·
`PIL-2_barandas` 592 · `PIL-1_luminarias` 420 · `circulacion_pintura` 404 · `circulacion_acero` 2.436 · `circulacion_mangueras` 384.

Para no pasar de +4 draw calls, `PIL-1_soportes` se fusionó dentro de `PIL-1_luminarias` (un solo mesh con el material de pintura;
el nombre `PIL-1_soportes` desaparece). Todo lo demás es un mesh por material y subconjunto (`Batch` → `flush`). Nodos con nombre
visibles en el GLB: `pileta_ensayo`, `golpeador`, `pileta_acumulacion` y sus mallas `_pintura` / `_acero`.

## Ambigüedades detectadas

1. **Lado del golpeador.** En la foto está al extremo del tanque, sobre el patín. Aquí va en el costado −z (cerca del extremo −x) porque
   el +z está ocupado por las líneas de matar y de llegada. Se ve bien desde el lado −z o al orbitar; desde el lado pozo queda tapado.
2. **Equipo rojo de cubierta.** Puede ser una zaranda, una bomba o un módulo de control de sólidos; se dibuja como bloque rojo genérico.
3. **Rampa/escalón.** Se interpretó como chapa inclinada colgada bajo el borde de la cubierta (lado −z); podría ser una tolva o una
   ménsula triangular.
4. **"Planta de efluentes" del LAYOUT.** Podría ser la pileta de acumulación, pero el layout no da cotas ni lo dice: no se asumió.
5. **Fotos con y sin cañerías rojas.** Se combinó lo visible en las tres (colector lateral + cañería que cruza la baranda + recipiente
   rojo); el equipo real puede tener solo una de esas variantes.
6. **Cañería de llegada de la línea D.** Termina sobre el costado +z de la pileta de ensayo (z −13,5); se le agregó una brida. La
   posición no se cambió (ruteo del choke fuera de alcance).
7. **Encabezado de `40-wellsite.js`.** Su descripción del componente 10 ("desgasificador") no se actualizó para no chocar con los
   otros trabajos en paralelo sobre ese archivo; la descripción vigente está en el comentario de `buildCirculacion` y en este README.

## Verificación

Standalone y `?embedded` (Chrome headless): sin errores ni advertencias de consola; selección por clic y hover sobre los tres
subconjuntos (`circulacion`); ficha y peligros en el panel; despiece 0 → 1 → 0; aislar; medición (2 puntos sobre las cubiertas de ambas
piletas: 4,70 m); modos EXPLORE / OPERATION / QHSE / TRAINING y capa DROPS activa en QHSE; grupos `drops_PIL-1` / `drops_PIL-2`
presentes; exportación GLB con los nodos nuevos. Pruebas: `tests/circulacion.test.mjs`.

## Capturas (`docs/preview/`)

`10-piletas-antes.png` · `10-piletas-despues.png` · `10-piletas-ensayo.png` · `10-piletas-golpeador.png` (con la acumulación oculta) ·
`10-piletas-acumulacion.png` · `10-piletas-acumulacion-descarga.png`.
