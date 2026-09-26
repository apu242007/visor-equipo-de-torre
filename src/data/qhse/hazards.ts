import type { BarrierType, HazardKind, QhseStatus } from '@/types'

/** Catálogo de categorías de peligro a visualizar. Solo etiquetas: sin distancias ni requisitos. */
export const HAZARD_LABELS: Record<HazardKind, string> = {
  lineOfFire: 'Línea de fuego',
  droppedObjects: 'Caída de objetos',
  highPressure: 'Alta presión',
  suspendedLoad: 'Carga suspendida',
  mobileEquipment: 'Equipos móviles',
  workingAtHeight: 'Trabajo en altura',
  pinchPoints: 'Puntos de atrapamiento',
  rotatingEquipment: 'Equipos rotantes',
  wellControl: 'Control de pozo',
  chemicals: 'Químicos',
  noise: 'Ruido',
  emergencyRoutes: 'Rutas de emergencia',
}

export const QHSE_STATUS_LABELS: Record<QhseStatus, string> = {
  confirmed: 'Confirmado',
  procedure: 'Procedimiento',
  goodPractice: 'Buena práctica',
  pendingValidation: 'Pendiente de validación',
}

/**
 * Centinela para `Risk.event` / `Risk.consequence` de un riesgo `pendingValidation` sin texto
 * documentado (no se inventa). Solo válido con `pendingValidation`; la UI lo rotula como pendiente.
 * Vive aquí (sin importar el schema) para evitar ciclos: `schema.ts` importa de este módulo.
 */
export const PENDING_TEXT = 'Pendiente de definición'

/** Solo `confirmed` y `procedure` pueden presentarse como requisito. */
export const isMandatoryStatus = (status: QhseStatus): boolean =>
  status === 'confirmed' || status === 'procedure'

export const BARRIER_TYPE_LABELS: Record<BarrierType, string> = {
  preventive: 'Preventiva',
  mitigative: 'Mitigativa',
}

/**
 * Texto de redacción para la UI según el respaldo. Solo confirmed/procedure se presentan como
 * requisito (`isMandatoryStatus`); una buena práctica o un dato pendiente nunca.
 */
export const describeEvidence = (status: QhseStatus): string => {
  if (isMandatoryStatus(status)) {
    return status === 'confirmed' ? 'Requisito confirmado' : 'Requisito de procedimiento'
  }
  return status === 'goodPractice' ? 'Buena práctica (no obligatoria)' : 'Pendiente de validación'
}
