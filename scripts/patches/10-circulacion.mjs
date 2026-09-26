// Componente 10 (sistema de circulación: piletas de ensayo y acumulación, golpeador, bomba, cañerías): textos del panel de detalle.
// El bundle escapa los no-ASCII (`ó`, `³`), por eso las cadenas a buscar con acentos usan String.raw. La cadena `funcion` está entre
// comillas dobles: el texto nuevo usa comillas simples.
export default [
  {
    name: 'componente 10: nombre "Sistema de circulación y piletas"',
    find: String.raw`name:"Sistema de circulaci\xF3n",family:"circulacion"`,
    replace: 'name:"Sistema de circulación y piletas",family:"circulacion"',
  },
  {
    name: 'componente 10: función con golpeador y pileta de acumulación (pendiente)',
    find: String.raw`at.circulacion.funcion="Folleto: pileta de ensayo 40 m\xB3 con desgasificador y cubicador 3,5 m\xB3;`,
    replace:
      "at.circulacion.funcion=\"Folleto: pileta de ensayo 40 m³ con cubicador 3,5 m³ y desgasificador ('golpeador': recipiente vertical rojo, confirmado como el de la foto de la pileta de ensayo; es el mismo equipo, no otro adicional). " +
      'Pileta de acumulación: subconjunto NUEVO con tipología tomada de fotos de campo (tanque contenedor corrugado, barandas, escalera y bocas de descarga); el layout no la muestra: dimensiones y ubicación PENDIENTES;',
  },
  {
    name: 'componente 10: peligros de referencia de golpeador y piletas (pendientes de validación, no son requisitos)',
    find: String.raw`Ca\xEDda dentro de piletas o desde pasarelas"],epp:`,
    replace:
      String.raw`Ca\xEDda dentro de piletas o desde pasarelas",` +
      '"Gas o vapores en el golpeador y su venteo, incl. H₂S (referencia, pendiente de validación)",' +
      '"Rebalse de la pileta de ensayo o de la pileta de acumulación (referencia, pendiente de validación)",' +
      '"Ingreso a espacio confinado por las bocas de inspección de las piletas (referencia, pendiente de validación)",' +
      '"Proyección de fluido a presión en cañerías y válvulas del golpeador (referencia, pendiente de validación)"],epp:',
  },
]
