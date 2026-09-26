/*
 * 41-meta-aparejo.js · ficha de confiabilidad (`__TACKER_META`) del componente 04 `aparejo`.
 * La tabla META la crea el módulo de producto DESPUÉS del bundle: se aplica cuando el visor arranca (`tacker:boot`) o de inmediato si ya arrancó.
 * Grado B / Parcial: las capacidades son del folleto, pero la forma es aproximada (fotos de unidades genéricas) y el elevador de varillas es nuevo.
 */
;(() => {
  'use strict'

  const META_APAREJO = {
    grade: 'B',
    status: 'Parcial',
    basis: 'Folleto (capacidades) + referencia fotográfica genérica',
    note:
      'IDECO 110 t · 6 líneas · amelas 150 t · elevador 100 t (folleto). Forma del bloque, gancho, amelas y elevador de tubing aproximada (unidades genéricas). ' +
      'Pendientes: color real, modelo del elevador y de las amelas, existencia y ubicación del elevador de varillas, cotas as-built.',
  }

  const applyMeta = () => {
    const meta = window.__TACKER_META
    if (meta && meta.aparejo) Object.assign(meta.aparejo, META_APAREJO)
  }
  if (window.__tackerBooted) applyMeta()
  else document.addEventListener('tacker:boot', applyMeta, { once: true })
})()
