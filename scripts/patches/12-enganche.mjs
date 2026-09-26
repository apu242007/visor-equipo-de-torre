// Componente 12 (escalera y plataforma del enganchador): textos del panel de detalle. El bundle escapa los no-ASCII (`ó`, `í`),
// por eso las cadenas a buscar con acentos usan String.raw. Los peligros nuevos son "de referencia, pendiente de validación":
// no se presentan como requisitos (CLAUDE.md, QHSE).
export default [
  {
    name: 'componente 12: descripción con el detalle del piso (aproximado, referencia CAD genérica)',
    find: String.raw`Accesos y dimensiones aproximados a partir de una \xFAnica fotograf\xEDa.`,
    replace:
      String.raw`Accesos y dimensiones aproximados a partir de una \xFAnica fotograf\xEDa.` +
      ' Detalle del piso (aproximado; tipología de una referencia CAD genérica, no cota as-built): chapa antideslizante, peines de tubulares con dedos individuales, paneles laterales con barandas de caños horizontales, arco tubular de contención del lado del mástil, patines de apoyo, trampolín y puertas de ingreso con cadenas de retención.',
  },
  {
    name: 'componente 12: peligros de referencia del piso (pendientes de validación, no son requisitos)',
    find: String.raw`"Ca\xEDda de objetos hacia el piso"]`,
    replace:
      String.raw`"Ca\xEDda de objetos hacia el piso",` +
      '"Atrapamiento de manos entre los dedos del peine al acomodar tubulares (referencia, pendiente de validación)",' +
      '"Caída de tubulares desde los peines por vuelco del tiro (referencia, pendiente de validación)",' +
      '"Puerta de ingreso o cadena de retención mal cerrada (referencia, pendiente de validación)"]',
  },
]
