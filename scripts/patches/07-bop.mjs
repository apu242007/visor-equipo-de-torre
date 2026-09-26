// Componente 07 (BOP + acumulador + choke manifold): textos del panel de detalle. El bundle escapa los no-ASCII (`ó`, `₂`),
// por eso las cadenas a buscar con acentos usan String.raw.
export default [
  {
    name: 'componente 07: nombre "BOP, acumulador y choke manifold"',
    find: 'at.bop.name="BOP y acumulador";',
    replace: 'at.bop.name="BOP, acumulador y choke manifold";',
  },
  {
    name: 'componente 07: descripción con el choke manifold (tipología genérica, datos pendientes)',
    find: 'Acumulador de 3.000 psi con cinco botellones.',
    replace:
      'Acumulador de 3.000 psi con cinco botellones. Choke manifold (subconjunto, tipología genérica de referencia): entrada desde la línea de choke del BOP, dos válvulas en serie, cruz de distribución y tres ramales (choke ajustable, choke fijo y línea directa) hacia un colector de salida; posición en locación confirmada, presión de trabajo y detalle pendientes.',
  },
  {
    name: 'componente 07: peligros de referencia del choke manifold (pendientes de validación, no son requisitos)',
    find: String.raw`"Proyecci\xF3n de fluido a presi\xF3n en conexiones"],epp:`,
    replace:
      String.raw`"Proyecci\xF3n de fluido a presi\xF3n en conexiones",` +
      '"Erosión o lavado del choke por fluido a presión (referencia, pendiente de validación)",' +
      '"Gas en el retorno del choke manifold, incl. H₂S (referencia, pendiente de validación)",' +
      '"Golpe de ariete al maniobrar válvulas del choke manifold (referencia, pendiente de validación)"],epp:',
  },
]
