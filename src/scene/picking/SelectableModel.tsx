import type { ThreeEvent } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { useViewerStore } from '@/stores/viewerStore'
import { registerComponentObject } from './componentObjects'

interface SelectableModelProps {
  componentId: string
  position?: readonly [number, number, number]
  children: ReactNode
}

/** Envuelve un componente: hover, clic y registro del objeto para el contorno. */
export function SelectableModel({ componentId, position, children }: SelectableModelProps) {
  const hoverComponent = useViewerStore((s) => s.hoverComponent)
  const selectComponent = useViewerStore((s) => s.selectComponent)

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hoverComponent(componentId)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    hoverComponent(null)
    document.body.style.cursor = ''
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectComponent(componentId)
  }

  return (
    <group
      ref={(o) => {
        registerComponentObject(componentId, o)
      }}
      name={`sel_${componentId}`}
      position={position ? [...position] : undefined}
      onPointerOver={over}
      onPointerOut={out}
      onClick={click}
    >
      {children}
    </group>
  )
}
