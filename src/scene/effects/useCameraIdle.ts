import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { createIdleTracker } from '@/lib/idle'

/**
 * `true` cuando la cámara lleva `delayMs` sin moverse. Escucha los eventos de OrbitControls (`makeDefault`):
 * con damping, `change` sigue llegando hasta que la cámara se asienta. Al volver a moverse pasa a `false`.
 */
export function useCameraIdle(delayMs = 250): boolean {
  const controls = useThree((s) => s.controls) as {
    addEventListener: (t: string, f: () => void) => void
    removeEventListener: (t: string, f: () => void) => void
  } | null
  const invalidate = useThree((s) => s.invalidate)
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    const tracker = createIdleTracker(delayMs, (v) => {
      setIdle(v)
      invalidate()
    })
    const activity = () => tracker.activity()
    controls?.addEventListener('change', activity)
    controls?.addEventListener('start', activity)
    activity() // arranca contando: si no hay movimiento, pasa a reposo
    return () => {
      controls?.removeEventListener('change', activity)
      controls?.removeEventListener('start', activity)
      tracker.dispose()
    }
  }, [controls, delayMs, invalidate])

  return idle
}
