import { describe, expect, it } from 'vitest'
import { ftToM, inToM, lbToKg, mToFt } from './index'

describe('units', () => {
  it('mástil SK104-330: 104 ft = 31,6992 m', () => {
    expect(ftToM(104)).toBeCloseTo(31.6992, 4)
  })

  it('ida y vuelta ft↔m', () => {
    expect(mToFt(ftToM(104))).toBeCloseTo(104, 10)
  })

  it('cable de 1 in = 25,4 mm', () => {
    expect(inToM(1)).toBeCloseTo(0.0254, 10)
  })

  it('330.000 lb ≈ 149,7 t', () => {
    expect(lbToKg(330000) / 1000).toBeCloseTo(149.69, 1)
  })
})
