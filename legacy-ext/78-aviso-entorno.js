/*
 * 78-aviso-entorno.js — aviso del entorno de locación en la card "Referencia del conjunto" (#cad-inspector).
 *
 * Los tráilers, tanques, vallado y señalización del entorno (`locacion_entorno`) son unidades SIMPLIFICADAS ubicadas según el
 * LAYOUT TKR-10: su posición sale del plano y su detalle es ilustrativo. No muestran marcas, capacidades ni textos de equipos
 * reales, y la disposición de una locación varía según operador, contratista y país.
 */
window.__rigExt.onPost(() => {
  const card = document.getElementById('cad-inspector')
  if (!card || document.getElementById('site-dressing-note')) return
  const p = document.createElement('p')
  p.id = 'site-dressing-note'
  p.style.cssText = 'margin:8px 0 0;font-size:11px;line-height:1.4;opacity:.75'
  p.textContent =
    'Entorno de locación (tráilers, tanques, vallado, señalización): unidades simplificadas ubicadas según el layout TKR-10; el detalle es ilustrativo. No muestra marcas de terceros ni capacidades de las unidades de la locación, y la disposición varía según operador, contratista y país.'
  card.appendChild(p)
})
