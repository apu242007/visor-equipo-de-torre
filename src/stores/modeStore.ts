import { create } from 'zustand'
import { APP_MODES, DEFAULT_MODE, isAppMode, type AppMode } from '@/types/mode'

export { APP_MODES, DEFAULT_MODE, isAppMode }
export type { AppMode }

export const MODE_LABELS: Record<AppMode, string> = {
  explore: 'EXPLORE',
  operation: 'OPERATION',
  qhse: 'QHSE',
  training: 'TRAINING',
}

/**
 * Qué cambia cada modo en el visor V2 (presets de capas de `legacy-ext/75-mode-presets.js`).
 * Son presets VISUALES sobre capas existentes: no son cálculos ni requisitos operativos.
 */
export const MODE_SUMMARIES: Record<AppMode, string> = {
  explore: 'Vista limpia: inspección libre del modelo, sin capas activas.',
  operation: 'Aparejo y malacate aislados, con cotas.',
  qhse: 'Zonas ilustrativas de riesgo y puntos DROPS (sin validar; no son controles aprobados).',
  training: 'Etiquetas de componentes y despiece.',
}

interface ModeState {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

export const useModeStore = create<ModeState>()((set) => ({
  mode: DEFAULT_MODE,
  setMode: (mode) => set({ mode }),
}))
