import { create } from 'zustand'

export const APP_MODES = ['explore', 'operation', 'qhse', 'training'] as const
export type AppMode = (typeof APP_MODES)[number]

export const DEFAULT_MODE: AppMode = 'explore'

export const MODE_LABELS: Record<AppMode, string> = {
  explore: 'EXPLORE',
  operation: 'OPERATION',
  qhse: 'QHSE',
  training: 'TRAINING',
}

export function isAppMode(value: unknown): value is AppMode {
  return typeof value === 'string' && (APP_MODES as readonly string[]).includes(value)
}

interface ModeState {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

export const useModeStore = create<ModeState>()((set) => ({
  mode: DEFAULT_MODE,
  setMode: (mode) => set({ mode }),
}))
