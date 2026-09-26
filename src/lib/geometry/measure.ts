export type Vec3 = readonly [number, number, number]

/** Distancia euclídea entre dos puntos (metros). */
export function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])
}

/** Distancia proyectada en el plano horizontal XZ (Y es vertical). */
export function horizontalDistance(a: Vec3, b: Vec3): number {
  return Math.hypot(b[0] - a[0], b[2] - a[2])
}

export function verticalDistance(a: Vec3, b: Vec3): number {
  return Math.abs(b[1] - a[1])
}

export function midpoint(a: Vec3, b: Vec3): Vec3 {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
}
