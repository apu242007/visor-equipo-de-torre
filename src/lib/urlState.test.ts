import { describe, expect, it } from 'vitest'
import { buildSearch, isNativeEngineEnabled, parseUrlState, type UrlState } from './urlState'

describe('parseUrlState', () => {
  it('sin parámetros: modo por defecto, vista y capas desconocidas', () => {
    expect(parseUrlState('')).toEqual({ mode: 'explore', view: null, layers: null })
  })

  it('lee modo, vista y capas', () => {
    expect(parseUrlState('?mode=qhse&view=front&layers=zonas,cotas')).toEqual({
      mode: 'qhse',
      view: 'front',
      layers: ['zonas', 'cotas'],
    })
  })

  it('descarta valores inválidos y capas desconocidas; conserva el orden canónico', () => {
    expect(parseUrlState('?mode=drilling&view=abajo&layers=drops,foo,zonas,zonas')).toEqual({
      mode: 'explore',
      view: null,
      layers: ['zonas', 'drops'],
    })
  })

  it('layers= vacío significa explícitamente sin capas', () => {
    expect(parseUrlState('?layers=').layers).toEqual([])
  })
})

describe('buildSearch', () => {
  it('omite los valores por defecto', () => {
    expect(buildSearch('', { mode: 'explore', view: 'iso', layers: [] })).toBe('')
  })

  it('escribe modo, vista y capas, y conserva otros parámetros', () => {
    expect(buildSearch('?dev=1', { mode: 'qhse', view: 'top', layers: ['zonas', 'cotas'] })).toBe(
      '?dev=1&mode=qhse&view=top&layers=zonas,cotas',
    )
  })

  it('reemplaza lo anterior', () => {
    expect(
      buildSearch('?mode=qhse&layers=zonas', {
        mode: 'training',
        view: null,
        layers: ['etiquetas'],
      }),
    ).toBe('?mode=training&layers=etiquetas')
  })

  it('conserva "sin capas" fuera de EXPLORE para que no vuelva el preset al recargar', () => {
    expect(buildSearch('', { mode: 'qhse', view: null, layers: [] })).toBe('?mode=qhse&layers=')
  })

  it('ida y vuelta', () => {
    const state: UrlState = { mode: 'operation', view: 'side', layers: ['cotas', 'malla'] }
    expect(parseUrlState(buildSearch('', state))).toEqual(state)
  })
})

describe('isNativeEngineEnabled', () => {
  it('en producción solo con ?dev=1', () => {
    expect(isNativeEngineEnabled('', false)).toBe(false)
    expect(isNativeEngineEnabled('?dev=0', false)).toBe(false)
    expect(isNativeEngineEnabled('?dev=1', false)).toBe(true)
  })
  it('en desarrollo siempre', () => {
    expect(isNativeEngineEnabled('', true)).toBe(true)
  })
})
