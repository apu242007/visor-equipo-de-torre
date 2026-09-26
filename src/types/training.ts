import type { QhseBasis } from './qhse'

export interface TrainingStep {
  id: string
  rigId: string
  order: number
  title: string
  instruction: string
  componentIds: string[]
  riskIds?: string[]
  /** Un paso de entrenamiento no es un procedimiento aprobado salvo que `basis.status` lo indique. */
  basis: QhseBasis
}
