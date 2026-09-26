import { beforeEach, describe, expect, it } from 'vitest'
import { APP_MODES, DEFAULT_MODE, MODE_LABELS, isAppMode, useModeStore } from './modeStore'

describe('modeStore', () => {
  beforeEach(() => useModeStore.setState({ mode: DEFAULT_MODE }))

  it('expone exactamente los cuatro modos, con explore por defecto', () => {
    expect(APP_MODES).toEqual(['explore', 'operation', 'qhse', 'training'])
    expect(useModeStore.getState().mode).toBe('explore')
  })

  it('tiene etiqueta para cada modo', () => {
    for (const m of APP_MODES) expect(MODE_LABELS[m]).toBeTruthy()
  })

  it('cambia de modo', () => {
    useModeStore.getState().setMode('qhse')
    expect(useModeStore.getState().mode).toBe('qhse')
  })

  it('isAppMode rechaza valores inválidos', () => {
    expect(isAppMode('training')).toBe(true)
    expect(isAppMode('drilling')).toBe(false)
    expect(isAppMode(undefined)).toBe(false)
  })
})
