/** 1 unidad 3D = 1 metro. Conversiones exactas de definición. */
export const FT_TO_M = 0.3048
export const IN_TO_M = 0.0254
export const LB_TO_KG = 0.45359237

export const ftToM = (ft: number): number => ft * FT_TO_M
export const mToFt = (m: number): number => m / FT_TO_M
export const inToM = (inch: number): number => inch * IN_TO_M
export const lbToKg = (lb: number): number => lb * LB_TO_KG
