# Secuencia típica de montaje (rig-up)

**Estatus: `pendingValidation`.** Texto aportado por el usuario (2026-09-30) como secuencia típica de montaje de un equipo de
workover. No es el procedimiento de Tacker ni un requisito de empresa, cliente o legal. Se usa solo como guion visual de
`legacy-ext/76-secuencia-montaje.js`; validar contra el procedimiento de montaje vigente de Tacker antes de presentarla como requisito.

## Pasos

1. Reunión pre-tarea, ATS y asignación de responsabilidades.
2. Verificación de acceso, nivelación, capacidad portante, drenajes y anclajes de locación.
3. Descarga y alineación de componentes, respetando plan de izaje y zonas de riesgo.
4. Posicionamiento y nivelación de subestructura.
5. Montaje de malacate, motores, transmisión, cabina, BOP y equipos auxiliares.
6. Izamiento del mástil, con control de plomo, contravientos y verificación estructural.
7. Instalación de líneas de circulación, choke manifold, separador/golpeador, líneas de retorno, piletas y antorcha.
8. Pruebas funcionales, prueba de presión cuando corresponda, checklists previos a la operación y liberación para workover.

## Componentes principales del equipo (texto aportado)

El equipo de workover comprende, entre otros: sistema de izaje (torre, subestructura, bloque viajero, bloque de coronación,
gancho, cable, malacate y elevadores); sistema de circulación (bombas, tanques, stand pipe, manguera, línea de retorno,
desanders/desilters y separadores); sistema de rotación; fuente de potencia; y sistema de control de pozo con BOP, choke manifold
y líneas asociadas.

## Cómo se usa en el visor

Cada paso muestra componentes acumulativos del V2 (asignación visual orientativa, no ingeniería). Los pasos 1, 2 y 8 son documentales.
No se anima el izamiento del mástil ni se inventan tiempos, cargas o distancias. No están modelados: antorcha, separador, rotación
(power swivel "NA" en el Libro DROPS), desanders/desilters ni stand pipe.

## Aportes del experto del equipo (2026-09-30) — `pendingValidation`

- **Cabina del maquinista:** es **desmontable** y en operación va **montada fuera del carrier, entre las dos escaleras**. El modelo la ubica en
  el lado +Z (el de la escalera lateral PT-1), entre SUB-2 y PT-1, sobre ménsulas del chasis y apoyos al terreno (`legacy-ext/79-cabina-desmontable.js`).
  El lado y la separación son una lectura del modelo, no una cota.
- **Izamiento del mástil (paso 6):** el mástil tiene **dos pistones**: (1) el de **izaje del primer tramo**, que lo lleva de **0° a 90°**; (2) el de
  **izaje del segundo tramo**, que **extiende el tramo embutido en el primero**. **Después se tensan los vientos.** Animado de forma ilustrativa en
  `legacy-ext/81-izamiento-mastil.js` (sin cargas, presiones ni tiempos). Carreras y pistón interno del 2.º tramo: aproximados.
- Referencias fotográficas de equipos similares (otras marcas, no TACKER 10) confirman la cinemática: el mástil viaja acostado sobre el carrier hacia la
  cabina, pivota por la parte trasera con pistones en la base y termina vertical con vientos a los anclajes. No se copia geometría ni marcas de esas fotos.

### Decisiones tomadas de las imágenes de referencia (equipos similares de otras marcas; `pendingValidation`)

- **Posición de transporte:** en las fotos el mástil viaja acostado sobre el carrier hacia la cabina, apoyado sobre un soporte de traslado. En el V2
  el motor y el malacate quedan bajo el mástil acostado: `cad/izamiento.py` calcula el ángulo mínimo con margen libre (≈ 22° sobre la horizontal) sobre
  el perfil medido del equipo (`scripts/dump-corredor-mastil.mjs` → `cad/data/v2_corredor_mastil.json`) y dimensiona el soporte de traslado (CadQuery).
  El izamiento se anima desde ese ángulo; el piso del "0°" no es posible en este layout.
- **Pistones:** se dibujan con la fijación y el punto de empuje del V2; carrera ≈ 3,4 m (2,6 → 6,0 m), relación 2,3: más que un cilindro simple típico,
  lo que se anota como aproximación (podría ser telescópico). El pistón de extensión del 2.º tramo es interno y aproximado.
- No se copia geometría ni marcas de las fotos; los esquemas de mástil izado por cable con marco en A (Branham) no aplican a un izaje por pistones.
