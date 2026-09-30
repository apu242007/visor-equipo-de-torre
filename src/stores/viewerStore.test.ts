import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_ENGINE,
  ENGINE_LABELS,
  VIEWER_ENGINES,
  isViewerEngine,
  useViewerStore,
} from './viewerStore'

describe('viewerStore', () => {
  beforeEach(() =>
    useViewerStore.setState({
      engine: DEFAULT_ENGINE,
      selectedComponentId: null,
      hoveredComponentId: null,
    }),
  )

  it('arranca en motor legacy y sin selección', () => {
    expect(VIEWER_ENGINES).toEqual(['legacy', 'native'])
    expect(useViewerStore.getState().engine).toBe('legacy')
    expect(useViewerStore.getState().selectedComponentId).toBeNull()
  })

  it('tiene etiqueta para cada motor', () => {
    for (const e of VIEWER_ENGINES) expect(ENGINE_LABELS[e]).toBeTruthy()
  })

  it('cambia de motor', () => {
    useViewerStore.getState().setEngine('native')
    expect(useViewerStore.getState().engine).toBe('native')
  })

  it('selecciona y deselecciona un componente', () => {
    useViewerStore.getState().selectComponent('mast')
    expect(useViewerStore.getState().selectedComponentId).toBe('mast')
    useViewerStore.getState().selectComponent(null)
    expect(useViewerStore.getState().selectedComponentId).toBeNull()
  })

  it('hover es independiente de la selección y se limpia', () => {
    useViewerStore.getState().selectComponent('mastil')
    useViewerStore.getState().hoverComponent('piso_trabajo')
    expect(useViewerStore.getState().hoveredComponentId).toBe('piso_trabajo')
    expect(useViewerStore.getState().selectedComponentId).toBe('mastil')
    useViewerStore.getState().hoverComponent(null)
    expect(useViewerStore.getState().hoveredComponentId).toBeNull()
  })

  it('isViewerEngine rechaza valores inválidos', () => {
    expect(isViewerEngine('native')).toBe(true)
    expect(isViewerEngine('threejs')).toBe(false)
    expect(isViewerEngine(null)).toBe(false)
  })
})
