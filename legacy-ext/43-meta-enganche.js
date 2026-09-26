/*
 * TACKER 10 · 43-meta-enganche.js — ficha de confiabilidad del componente 12 (escalera y plataforma del enganchador).
 *
 * `window.__TACKER_META` (tabla del módulo de producto) se crea DESPUÉS del bundle: se aplica cuando el visor
 * arranca (`window.__tackerBooted` o evento `tacker:boot`), igual que la ficha del componente 07 en 40-wellsite.js.
 * Grado C / Aproximado: el detalle del piso se modela con una referencia CAD genérica (tipología), no con cotas del equipo.
 */
;(() => {
  'use strict'
  const META_ENGANCHE = {
    grade: 'C',
    status: 'Aproximado',
    basis: 'Referencia fotográfica + referencia CAD genérica (tipología, no cota as-built)',
    note:
      'Altura nominal del piso (18,5 m, boardHeight del visor) y huella heredadas: aproximadas. Detalle del piso (chapa antideslizante, ' +
      'peines de 8 dedos, paneles con barandas, arco de contención, patines, trampolín y puertas con cadenas) tomado de una referencia CAD ' +
      'genérica. Pendientes: cotas reales del piso y del peine (paso y ancho de dedos), espesor y tipo de chapa, capacidad de carga, ' +
      'geometría del arco y de los patines, y validación de peligros de referencia.',
  }
  const applyMeta = () => {
    const meta = window.__TACKER_META
    if (meta && meta.enganche) Object.assign(meta.enganche, META_ENGANCHE)
  }
  if (window.__tackerBooted) applyMeta()
  else document.addEventListener('tacker:boot', applyMeta, { once: true })
})()
