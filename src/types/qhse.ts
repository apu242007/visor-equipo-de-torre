/**
 * QHSE: nunca convertir una buena práctica en requisito obligatorio.
 * Cada entrada declara el estatus de su respaldo y, salvo `pendingValidation`, su fuente.
 */

export type QhseStatus = 'confirmed' | 'procedure' | 'goodPractice' | 'pendingValidation'

export type HazardKind =
  | 'lineOfFire'
  | 'droppedObjects'
  | 'highPressure'
  | 'suspendedLoad'
  | 'mobileEquipment'
  | 'workingAtHeight'
  | 'pinchPoints'
  | 'rotatingEquipment'
  | 'wellControl'
  | 'chemicals'
  | 'noise'
  | 'emergencyRoutes'

export interface QhseBasis {
  status: QhseStatus
  /** Obligatorio cuando status !== 'pendingValidation'. */
  sourceId?: string
  note?: string
}

/**
 * Modelo bow-tie: peligro (`hazard`) -> evento (`event`) -> consecuencia (`consequence`),
 * con barreras que previenen el evento (`preventive`) o mitigan la consecuencia (`mitigative`).
 *
 * Ni el evento ni la consecuencia se inventan: si no hay documento que los respalde,
 * el riesgo va `pendingValidation` (sin fuente) y la UI lo rotula así. En ese caso `event` /
 * `consequence` pueden ser el centinela `'Pendiente de definición'` (`PENDING_TEXT` en
 * `src/data/qhse/hazards.ts`) en vez de texto inventado; los campos siguen siendo `string` y la UI
 * debe rotular el centinela como pendiente (no como contenido). Un riesgo `confirmed`/`procedure`/
 * `goodPractice` exige texto real: el schema rechaza el centinela.
 * Estatus de barreras y zonas nunca superan el de su riesgo (confirmed = procedure > goodPractice >
 * pendingValidation).
 * Las relaciones se mantienen por id (normalizadas): `componentIds` aquí y `Barrier.riskId`.
 */
export interface Risk {
  id: string
  rigId: string
  hazard: HazardKind
  title: string
  description?: string
  /** Qué puede pasar (evento no deseado). No vacío; en `pendingValidation` puede ser `'Pendiente de definición'`. */
  event: string
  /** Qué produce el evento (daño/pérdida). No vacío; en `pendingValidation` puede ser `'Pendiente de definición'`. */
  consequence: string
  componentIds: string[]
  basis: QhseBasis
}

/** `preventive` reduce la probabilidad del evento; `mitigative` reduce su consecuencia. */
export type BarrierType = 'preventive' | 'mitigative'

export interface Barrier {
  id: string
  riskId: string
  title: string
  description?: string
  type: BarrierType
  /**
   * Texto libre sobre el desempeño (p. ej. "verificación semanal según procedimiento X").
   * NUNCA un valor numérico de desempeño inventado (eficacia, PFD, %, etc.): solo lo que diga la fuente.
   */
  performanceNote?: string
  basis: QhseBasis
}

/** Conjunto QHSE de un rig: riesgos, barreras y zonas (validado por `qhseDatasetSchema`). */
export interface QhseDataset {
  rigId: string
  risks: Risk[]
  barriers: Barrier[]
  zones: ExclusionZone[]
}

export type ZoneShape =
  | { type: 'circle'; center: [number, number]; radiusM: number }
  | { type: 'rect'; center: [number, number]; sizeM: [number, number]; rotationRad?: number }
  | { type: 'polygon'; pointsM: [number, number][] }

/**
 * La geometría es opcional: sin dato confirmado no se dibuja ni se inventa una distancia.
 * Excepción: una zona `illustrative` (pendingValidation) puede dibujarse como envolvente gráfica,
 * siempre bajo la leyenda "ILUSTRATIVA — SIN VALIDAR" y sin mostrar su medida como requisito.
 */
export interface ExclusionZone {
  id: string
  riskId: string
  title: string
  hazard: HazardKind
  shape?: ZoneShape
  illustrative?: boolean
  basis: QhseBasis
}
