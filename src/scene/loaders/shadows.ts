import type { Mesh, Object3D } from 'three'

/**
 * Activa castShadow/receiveShadow en todos los Mesh del árbol (sin tocar materiales).
 * Idempotente: se puede llamar más de una vez sobre el mismo objeto.
 */
export function enableShadows(root: Object3D): void {
  root.traverse((obj) => {
    if ((obj as Mesh).isMesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })
}
