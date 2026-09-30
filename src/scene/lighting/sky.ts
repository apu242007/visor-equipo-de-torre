import { CanvasTexture, EquirectangularReflectionMapping, SRGBColorSpace } from 'three'

/**
 * Cielo procedural para el entorno (reflejos PBR): degradé cenit → horizonte → suelo y un sol suave.
 * Sin HDRI remoto ni archivo. Es un fondo de reflexión ilustrativo, no una condición real de la locación.
 * Se dibuja en un canvas equirectangular; `<Environment map>` lo convierte a PMREM.
 */
export interface SkyStop {
  /** 0 = cenit, 1 = nadir. */
  at: number
  color: string
}

export const SKY_STOPS: readonly SkyStop[] = [
  { at: 0, color: '#2f5f9e' },
  { at: 0.26, color: '#6f9cd0' },
  { at: 0.445, color: '#b9d2e8' },
  { at: 0.488, color: '#e4e6de' },
  { at: 0.5, color: '#d6d2c6' },
  { at: 0.62, color: '#a39a86' },
  { at: 1, color: '#7d7462' },
]

/** Posición del sol en UV equirectangular (u: 0..1 en acimut, v: 0 = cenit). Elevación ≈ 53°, como la luz direccional. */
export const SUN_UV = { u: 0.63, v: 0.5 - 53 / 180 } as const

export function skyStopsAreValid(stops: readonly SkyStop[] = SKY_STOPS): boolean {
  if (stops.length < 2 || stops.at(0)?.at !== 0 || stops.at(-1)?.at !== 1) return false
  return stops.every((s, i) => i === 0 || s.at > (stops[i - 1]?.at ?? Infinity))
}

export function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, height)
  for (const s of SKY_STOPS) g.addColorStop(s.at, s.color)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)

  const sx = SUN_UV.u * width
  const sy = SUN_UV.v * height
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, height * 0.3)
  halo.addColorStop(0, 'rgba(255,248,225,0.9)')
  halo.addColorStop(0.05, 'rgba(255,238,200,0.4)')
  halo.addColorStop(0.22, 'rgba(255,236,205,0.1)')
  halo.addColorStop(1, 'rgba(255,236,205,0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(sx, sy, height * 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function createSkyTexture(width = 1024, height = 512): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (ctx) drawSky(ctx, width, height)
  const texture = new CanvasTexture(canvas)
  texture.mapping = EquirectangularReflectionMapping
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}
