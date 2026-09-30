import { describe, expect, it } from 'vitest'
import { rigSchema } from '../schema'
import { TACKER10_RIG, TACKER10_SCENE } from './tacker10'

describe('TACKER10_RIG', () => {
  it('cumple el schema (fuentes, ids únicos, conflictos, rutas de modelo)', () => {
    expect(rigSchema.safeParse(TACKER10_RIG).success).toBe(true)
  })

  it('ninguna geometría CAD se presenta como as-built (confianza C)', () => {
    for (const c of TACKER10_RIG.components.filter((c) => c.model)) {
      expect(c.confidence).toBe('C')
      expect(c.scope).toBeTruthy()
    }
  })

  it('la escena solo referencia componentes con modelo y no dibuja el mástil sin base documentada', () => {
    const conModelo = new Map(TACKER10_RIG.components.map((c) => [c.id, c.model]))
    for (const m of TACKER10_SCENE) expect(conModelo.get(m.componentId)).toBe(m.url)
    expect(TACKER10_SCENE.map((m) => m.componentId)).not.toContain('mastil')
  })

  it('los conflictos de fuente quedan declarados', () => {
    const piso = TACKER10_RIG.components.find((c) => c.id === 'piso_trabajo')
    expect(piso?.specifications.filter((s) => s.conflicts?.length)).toHaveLength(2)
  })
})
