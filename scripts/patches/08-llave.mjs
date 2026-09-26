// Componente 08 (llave hidráulica, contrafuerza y cuñas): textos del panel de detalle. El bundle escapa los no-ASCII (`á`, `ñ`),
// por eso las cadenas a buscar con acentos usan String.raw. Cada `find` debe tener EXACTAMENTE 1 coincidencia.
export default [
  {
    name: 'componente 08: nombre "Llave hidráulica, contrafuerza y cuñas"',
    find: String.raw`llave:{n:8,name:"Llave hidr\xE1ulica y cu\xF1as"`,
    replace: 'llave:{n:8,name:"Llave hidráulica, contrafuerza y cuñas"',
  },
  {
    name: 'componente 08: función con la contrafuerza, el brazo de reacción y las cuñas (modelo genérico, datos pendientes)',
    find: String.raw`funcion:"La llave hidr\xE1ulica enrosca y desenrosca las uniones de tubing con el torque indicado. Las cu\xF1as, en la mesa, sostienen la sarta mientras se hace la conexi\xF3n."`,
    replace:
      'funcion:"La llave hidráulica enrosca y desenrosca las uniones de tubing con el torque indicado; la llave de contrafuerza (backup) sujeta la rosca opuesta y el brazo de reacción descarga contra el poste de retenida. Las cuñas manuales, en el buje del piso, sostienen la sarta mientras se hace la conexión. Modelo de tipología genérica de referencia (cabezal con garganta y dados, cilindro, manómetro de torque, mangueras con látigos y válvulas de mando): fabricante, modelo, torque, capacidad y rango de diámetros pendientes."',
  },
  {
    name: 'componente 08: peligros de referencia de la llave (pendientes de validación, no son requisitos)',
    find: String.raw`"Latigazo de mangueras hidr\xE1ulicas"],epp:`,
    replace:
      String.raw`"Latigazo de mangueras hidr\xE1ulicas",` +
      '"Aplastamiento entre el brazo de reacción y el poste de retenida al girar la llave (referencia, pendiente de validación)",' +
      '"Pinzamiento de manos en palancas, válvulas de mando y patas de apoyo con resorte (referencia, pendiente de validación)",' +
      '"Caída de la llave por falla de la línea de suspensión o del cabo doble (referencia, pendiente de validación)"],epp:',
  },
]
