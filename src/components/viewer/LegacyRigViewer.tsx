import { useCallback, useEffect, useRef } from 'react'
import { useModeStore, type AppMode } from '@/stores/modeStore'

/**
 * Ruta del visor V2 autocontenido, servido desde `public/legacy/`.
 * `?embedded` oculta su barra de modos propia: la app controla el modo por postMessage.
 */
export const LEGACY_VIEWER_SRC = `${import.meta.env.BASE_URL}legacy/TACKER10_Digital_Rig_V2.html?embedded`

/** Mensaje app → visor V2. Los ids de modo coinciden con los `data-m` del V2. */
export interface LegacySetModeMessage {
  type: 'tacker:setMode'
  mode: AppMode
}

/**
 * Modo compatibilidad: embebe el visor HTML/Three.js V2 mientras el motor R3F
 * nativo no tiene paridad funcional. Sandbox real: scripts y descargas (PNG/GLB por blob),
 * SIN `allow-same-origin` (con `allow-scripts` lo anularía): el visor corre en origen opaco y
 * no puede tocar el DOM, storage ni cookies de la app anfitriona. El V2 es autocontenido.
 *
 * `modeStore` es la única fuente de verdad del modo; aquí solo se reenvía al iframe.
 */
export function LegacyRigViewer() {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const mode = useModeStore((s) => s.mode)

  const postMode = useCallback((m: AppMode) => {
    const message: LegacySetModeMessage = { type: 'tacker:setMode', mode: m }
    // Origen opaco (sandbox sin allow-same-origin): solo '*' es posible; el mensaje no lleva datos sensibles.
    frameRef.current?.contentWindow?.postMessage(message, '*')
  }, [])

  useEffect(() => {
    postMode(mode)
  }, [mode, postMode])

  return (
    <iframe
      ref={frameRef}
      title="Visor TACKER 10 V2 (modo compatibilidad)"
      src={LEGACY_VIEWER_SRC}
      sandbox="allow-scripts allow-downloads"
      onLoad={() => postMode(useModeStore.getState().mode)}
      className="block h-full w-full border-0"
    />
  )
}
