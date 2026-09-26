import { create } from 'zustand'

/** legacy = visor V2 embebido (iframe); native = escena R3F (aún sin paridad). */
export const VIEWER_ENGINES = ['legacy', 'native'] as const
export type ViewerEngine = (typeof VIEWER_ENGINES)[number]

export const DEFAULT_ENGINE: ViewerEngine = 'legacy'

export const ENGINE_LABELS: Record<ViewerEngine, string> = {
  legacy: 'V2 compatible',
  native: 'R3F nativo',
}

export function isViewerEngine(value: unknown): value is ViewerEngine {
  return typeof value === 'string' && (VIEWER_ENGINES as readonly string[]).includes(value)
}

interface ViewerState {
  engine: ViewerEngine
  selectedComponentId: string | null
  setEngine: (engine: ViewerEngine) => void
  selectComponent: (id: string | null) => void
}

export const useViewerStore = create<ViewerState>()((set) => ({
  engine: DEFAULT_ENGINE,
  selectedComponentId: null,
  setEngine: (engine) => set({ engine }),
  selectComponent: (selectedComponentId) => set({ selectedComponentId }),
}))
