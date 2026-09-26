/*
 * 44-meta-circulacion.js · TACKER 10 · ficha de confiabilidad del componente 10 (`circulacion`).
 *
 * `__TACKER_META` es la tabla del módulo de producto del visor (se crea DESPUÉS del bundle, ver el parche en scripts/build-legacy.mjs),
 * por eso la ficha se aplica cuando arranca (`tacker:boot`) o, si ya arrancó, de inmediato. Grado B / Parcial se mantiene: lo nuevo
 * (equipo de cubierta, golpeador) es PENDIENTE y no sube el grado. La geometría vive en `buildCirculacion` (legacy-ext/40-wellsite.js).
 */
;(() => {
  'use strict'

  const META_CIRCULACION = {
    grade: 'B',
    status: 'Parcial',
    basis:
      'Folleto + LAYOUT TKR-10 (pileta de ensayo, bomba) + fotos de campo genéricas (tipología) + aclaración de Jorge (la pileta de ensayo es la pileta con golpeador; golpeador = recipiente rojo de la foto: interpretación pendiente de confirmar)',
    note:
      'Confirmado: pileta de ensayo 12 × 2,4 m (40 m³), cubicador 3,5 m³ y bomba triplex 6 × 2,4 m. ' +
      'Aproximado: altura, corrugado, patín, escalera, tapas, cotas del golpeador y tendidos. ' +
      'PENDIENTE: la función del equipo rojo de cubierta y de la rampa, y la presión de trabajo, conexiones y ruteo del golpeador.',
  }

  const applyMeta = () => {
    const meta = window.__TACKER_META
    if (meta && meta.circulacion) Object.assign(meta.circulacion, META_CIRCULACION)
  }
  if (window.__tackerBooted) applyMeta()
  else document.addEventListener('tacker:boot', applyMeta, { once: true })
})()
