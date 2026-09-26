import { Button } from '@/components/ui/button'
import { APP_MODES, MODE_LABELS, isAppMode, useModeStore } from '@/stores/modeStore'

export function ModeSwitcher() {
  const mode = useModeStore((s) => s.mode)
  const setMode = useModeStore((s) => s.setMode)

  return (
    <div
      role="group"
      aria-label="Modo de trabajo"
      className="bg-muted inline-flex shrink-0 items-center gap-0.5 rounded-lg p-0.5"
    >
      {APP_MODES.map((m) => {
        const active = mode === m
        return (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={active ? 'secondary' : 'ghost'}
            aria-pressed={active}
            onClick={() => isAppMode(m) && setMode(m)}
            className={active ? 'shadow-sm' : 'text-muted-foreground'}
          >
            {MODE_LABELS[m]}
          </Button>
        )
      })}
    </div>
  )
}
