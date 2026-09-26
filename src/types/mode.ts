/** Modos de trabajo de la app. Los ids coinciden con los `data-m` del visor V2. */
export const APP_MODES = ['explore', 'operation', 'qhse', 'training'] as const
export type AppMode = (typeof APP_MODES)[number]

export const DEFAULT_MODE: AppMode = 'explore'

export function isAppMode(value: unknown): value is AppMode {
  return typeof value === 'string' && (APP_MODES as readonly string[]).includes(value)
}
