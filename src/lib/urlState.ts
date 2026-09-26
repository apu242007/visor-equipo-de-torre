/**
 * Estado compartible en la URL: `?mode=qhse&view=iso&layers=zonas,cotas` (+ `dev=1` para el motor nativo).
 * Puro y sin React: `parseUrlState` / `buildSearch` se prueban sin DOM.
 */
import {
  isLegacyView,
  normalizeLayers,
  type LegacyLayer,
  type LegacyView,
} from '@/lib/legacyBridge'
import { DEFAULT_MODE, isAppMode, type AppMode } from '@/types/mode'

export interface UrlState {
  mode: AppMode
  /** `null` = no viene en la URL (el visor conserva su vista por defecto). */
  view: LegacyView | null
  /** `null` = no viene en la URL (rige el preset del modo). `[]` = explícitamente sin capas. */
  layers: LegacyLayer[] | null
}

export const DEFAULT_VIEW: LegacyView = 'iso'

export function parseUrlState(search: string): UrlState {
  const p = new URLSearchParams(search)
  const mode = p.get('mode')
  const view = p.get('view')
  const layers = p.get('layers')
  return {
    mode: isAppMode(mode) ? mode : DEFAULT_MODE,
    view: isLegacyView(view) ? view : null,
    layers: layers === null ? null : normalizeLayers(layers.split(',').map((s) => s.trim())),
  }
}

/** El motor R3F nativo (sin paridad con V2) solo se ofrece en desarrollo o con `?dev=1`. */
export function isNativeEngineEnabled(search: string, isDev: boolean): boolean {
  return isDev || new URLSearchParams(search).get('dev') === '1'
}

/**
 * Devuelve `search` con los parámetros de estado actualizados, conservando cualquier otro (`dev`, …).
 * Solo se escribe lo que difiere del valor por defecto; `layers=` vacío se conserva cuando el modo no
 * es EXPLORE, para que "todas las capas apagadas" sobreviva a recargar (si no, volvería el preset).
 */
export function buildSearch(search: string, state: UrlState): string {
  const p = new URLSearchParams(search)
  for (const k of ['mode', 'view', 'layers']) p.delete(k)
  if (state.mode !== DEFAULT_MODE) p.set('mode', state.mode)
  if (state.view && state.view !== DEFAULT_VIEW) p.set('view', state.view)
  if (state.layers && (state.layers.length > 0 || state.mode !== DEFAULT_MODE)) {
    p.set('layers', state.layers.join(','))
  }
  const s = p.toString().replace(/%2C/g, ',')
  return s ? `?${s}` : ''
}

let initial: UrlState | null = null

/** Estado que traía la URL al abrir la página (memoizado). Se aplica al visor V2 una sola vez, en `ready`. */
export function getInitialUrlState(): UrlState {
  return (initial ??= parseUrlState(typeof location === 'undefined' ? '' : location.search))
}
