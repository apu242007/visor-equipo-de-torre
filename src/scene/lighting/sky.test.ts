import { describe, expect, it } from 'vitest'
import { SKY_STOPS, SUN_UV, skyStopsAreValid } from './sky'

describe('cielo procedural', () => {
  it('los stops cubren de 0 a 1 y son estrictamente crecientes', () => {
    expect(skyStopsAreValid()).toBe(true)
    expect(SKY_STOPS.at(0)?.at).toBe(0)
    expect(SKY_STOPS.at(-1)?.at).toBe(1)
  })

  it('rechaza stops fuera de orden o incompletos', () => {
    expect(skyStopsAreValid([{ at: 0, color: '#000' }])).toBe(false)
    expect(
      skyStopsAreValid([
        { at: 0, color: '#000' },
        { at: 0.6, color: '#111' },
        { at: 0.5, color: '#222' },
        { at: 1, color: '#333' },
      ]),
    ).toBe(false)
  })

  it('el sol queda dentro de la textura y por encima del horizonte', () => {
    expect(SUN_UV.u).toBeGreaterThan(0)
    expect(SUN_UV.u).toBeLessThan(1)
    expect(SUN_UV.v).toBeGreaterThan(0)
    expect(SUN_UV.v).toBeLessThan(0.5)
  })
})
