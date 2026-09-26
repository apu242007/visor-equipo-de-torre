import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Object3D } from 'three'
import { describe, expect, it } from 'vitest'
import { enableShadows } from './shadows'

describe('enableShadows', () => {
  it('activa castShadow/receiveShadow en todos los Mesh anidados y no en otros nodos', () => {
    const material = new MeshStandardMaterial({ color: 0x336699 })
    const root = new Group()
    const child = new Group()
    const a = new Mesh(new BoxGeometry(), material)
    const b = new Mesh(new BoxGeometry(), material)
    const empty = new Object3D()
    root.add(a, child, empty)
    child.add(b)

    enableShadows(root)

    for (const m of [a, b]) {
      expect(m.castShadow).toBe(true)
      expect(m.receiveShadow).toBe(true)
    }
    for (const o of [root, child, empty]) {
      expect(o.castShadow).toBe(false)
      expect(o.receiveShadow).toBe(false)
    }
  })

  it('no muta los materiales', () => {
    const material = new MeshStandardMaterial({ color: 0x336699, roughness: 0.4 })
    const version = material.version
    const mesh = new Mesh(new BoxGeometry(), material)

    enableShadows(mesh)

    expect(mesh.material).toBe(material)
    expect(material.roughness).toBe(0.4)
    expect(material.color.getHex()).toBe(0x336699)
    expect(material.version).toBe(version)
  })
})
