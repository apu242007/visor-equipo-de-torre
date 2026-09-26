/*
 * 44-meta-circulacion.js · TACKER 10 · ficha de confiabilidad del componente 10 (`circulacion`).
 *
 * `__TACKER_META` es la tabla del módulo de producto del visor (se crea DESPUÉS del bundle, ver el parche en scripts/build-legacy.mjs),
 * por eso la ficha se aplica cuando arranca (`tacker:boot`) o, si ya arrancó, de inmediato. Grado B / Parcial se mantiene: lo nuevo
 * (pileta de acumulación, equipo de cubierta, golpeador) es PENDIENTE y no sube el grado. La geometría vive en `buildCirculacion`
 * (legacy-ext/40-wellsite.js); las dimensiones de PILETA_ACUM se repiten aquí como texto y tests/circulacion.test.mjs las cruza.
 */
;(() => {
  'use strict'

  const META_CIRCULACION = {
    grade: 'B',
    status: 'Parcial',
    basis:
      'Folleto + LAYOUT TKR-10 (pileta de ensayo, bomba) + fotos de campo genéricas (tipología) + aclaración de Jorge (golpeador = recipiente rojo de la pileta de ensayo)',
    note:
      'Confirmado: pileta de ensayo 12 × 2,4 m (40 m³), cubicador 3,5 m³ y bomba triplex 6 × 2,4 m. ' +
      'Aproximado: altura, corrugado, patín, escalera, tapas, cotas del golpeador y tendidos. ' +
      'PENDIENTE: pileta de acumulación (no figura en el LAYOUT; 10 × 2,4 × 2,0 m en x −2 · z −19,4 son supuestos de referencia, ' +
      'no dato), su capacidad, la función del equipo rojo de cubierta y de la rampa, y la presión de trabajo, conexiones y ruteo ' +
      'del golpeador y de la pileta de acumulación.',
  }

  const applyMeta = () => {
    const meta = window.__TACKER_META
    if (meta && meta.circulacion) Object.assign(meta.circulacion, META_CIRCULACION)
  }
  if (window.__tackerBooted) applyMeta()
  else document.addEventListener('tacker:boot', applyMeta, { once: true })
})()
