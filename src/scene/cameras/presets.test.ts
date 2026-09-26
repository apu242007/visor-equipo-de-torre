import { describe, expect, it } from 'vitest'
import { distance } from '@/lib/geometry'
import { CAMERA_PRESETS, DEFAULT_CAMERA_PRESET } from './presets'

describe('camera presets', () => {
  it('define las cinco vistas del visor legacy', () => {
    expect(Object.keys(CAMERA_PRESETS).sort()).toEqual(['front', 'iso', 'side', 'top', 'well'])
    expect(CAMERA_PRESETS[DEFAULT_CAMERA_PRESET]).toBeDefined()
  })

  it('ninguna cámara queda bajo el terreno ni coincide con su objetivo', () => {
    for (const { position, target } of Object.values(CAMERA_PRESETS)) {
      expect(position[1]).toBeGreaterThan(0)
      expect(distance(position, target)).toBeGreaterThan(1)
    }
  })

  it('la vista superior no es exactamente vertical (evita el gimbal de OrbitControls)', () => {
    const { position, target } = CAMERA_PRESETS.top
    expect(position[0] !== target[0] || position[2] !== target[2]).toBe(true)
  })
})
