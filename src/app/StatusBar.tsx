import { Badge } from '@/components/ui/badge'
import { MODE_LABELS, useModeStore } from '@/stores/modeStore'
import { ENGINE_LABELS, useViewerStore } from '@/stores/viewerStore'

export function StatusBar() {
  const mode = useModeStore((s) => s.mode)
  const engine = useViewerStore((s) => s.engine)

  return (
    <footer
      aria-label="Barra de estado"
      className="bg-card/60 text-muted-foreground flex items-center gap-x-4 gap-y-1 border-t px-3 py-1.5 text-xs sm:px-4"
    >
      <span className="hidden shrink-0 sm:inline">
        Modo: <span className="text-foreground font-medium">{MODE_LABELS[mode]}</span>
        {/* El modo controla el visor V2 embebido (puente postMessage); el motor nativo aún no lo consume. */}
        {engine === 'native' && <span className="ml-1 italic">(sin efecto visual aún)</span>}
      </span>
      {/* Aviso de confianza: siempre visible, también en pantallas chicas. */}
      <span className="min-w-0 flex-1 truncate sm:flex-none">
        Geometría: referencia digital · no as-built
      </span>
      <span className="hidden shrink-0 md:inline">Escala: 1 unidad = 1 m</span>
      <Badge variant="outline" className="ml-auto shrink-0">
        Motor: {ENGINE_LABELS[engine]}
      </Badge>
    </footer>
  )
}
