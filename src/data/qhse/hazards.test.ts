import { describe, expect, it } from 'vitest'
import { barrierTypeSchema, qhseStatusSchema } from '../schema'
import { BARRIER_TYPE_LABELS, describeEvidence, isMandatoryStatus } from './hazards'

describe('BARRIER_TYPE_LABELS', () => {
  it('cubre los tipos de barrera del schema', () => {
    expect(Object.keys(BARRIER_TYPE_LABELS).sort()).toEqual([...barrierTypeSchema.options].sort())
    expect(BARRIER_TYPE_LABELS.preventive).toBe('Preventiva')
    expect(BARRIER_TYPE_LABELS.mitigative).toBe('Mitigativa')
  })
})

describe('describeEvidence', () => {
  it('devuelve el texto de redacción por estatus', () => {
    expect(describeEvidence('confirmed')).toBe('Requisito confirmado')
    expect(describeEvidence('procedure')).toBe('Requisito de procedimiento')
    expect(describeEvidence('goodPractice')).toBe('Buena práctica (no obligatoria)')
    expect(describeEvidence('pendingValidation')).toBe('Pendiente de validación')
  })

  it('solo los estatus obligatorios se redactan como requisito', () => {
    for (const status of qhseStatusSchema.options) {
      expect(describeEvidence(status).startsWith('Requisito')).toBe(isMandatoryStatus(status))
    }
  })
})
