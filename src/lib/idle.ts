/**
 * Detector de "reposo": avisa `onChange(true)` cuando pasaron `delayMs` sin actividad y `onChange(false)`
 * apenas vuelve a haberla. Sin React ni three: el temporizador se inyecta para poder testearlo.
 * Sirve para encender efectos caros (AO) solo con la cámara quieta.
 */
export interface IdleTimers {
  set: (fn: () => void, ms: number) => unknown
  clear: (handle: unknown) => void
}

const realTimers: IdleTimers = {
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
}

export interface IdleTracker {
  /** Registra actividad (movimiento de cámara, gesto, etc.). */
  activity: () => void
  /** Cancela el temporizador pendiente. */
  dispose: () => void
  readonly idle: boolean
}

export function createIdleTracker(
  delayMs: number,
  onChange: (idle: boolean) => void,
  timers: IdleTimers = realTimers,
): IdleTracker {
  let idle = false
  let handle: unknown = null

  const arm = () => {
    if (handle !== null) timers.clear(handle)
    handle = timers.set(() => {
      handle = null
      if (!idle) {
        idle = true
        onChange(true)
      }
    }, delayMs)
  }

  return {
    activity() {
      if (idle) {
        idle = false
        onChange(false)
      }
      arm()
    },
    dispose() {
      if (handle !== null) timers.clear(handle)
      handle = null
    },
    get idle() {
      return idle
    },
  }
}
