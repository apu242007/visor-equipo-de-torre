import type { Rig } from '@/types'

/**
 * TACKER 10 (Pulling): datos del rig para el motor nativo.
 * Las envolventes 3D salen de `cad/` (CadQuery, confianza C): NO son as-built. Cada cota lleva su
 * fuente; lo que no está acotado en el documento queda fuera de `specifications` (ver `cad/*.meta.json`
 * y `cad/README.md` para los pendientes).
 */
export const TACKER10_RIG: Rig = {
  id: 'TACKER-10',
  name: 'TACKER 10',
  service: 'Pulling',
  sources: [
    {
      id: 'src-folleto',
      kind: 'brochure',
      title: 'Folleto Equipo Tacker 10 Pulling',
      ref: 'docs/fuentes/tacker10/FOLLETO EQUIPO TACKER 10 PULLING REVDJL26062024.pdf, p. 2-3',
      revision: '26/06/2024',
      verified: true,
    },
    {
      id: 'src-layout',
      kind: 'layout',
      title: 'Layout TKR-10',
      ref: 'docs/fuentes/tacker10/LAYOUT - TKR-10.pdf (cotas rotuladas y geometría vectorial)',
      verified: true,
    },
    {
      id: 'src-legacy-v2',
      kind: 'estimate',
      title: 'Visor V2 (legacy-ext/30-carrier.js)',
      ref: 'Altura del piso de trabajo del modelo procedural; no es una fuente documental',
      verified: false,
    },
  ],
  equipment: [
    {
      id: 'tacker10-carrier-mastil',
      rigId: 'TACKER-10',
      name: 'Portaequipo, mástil y piso de trabajo',
      componentIds: ['mastil', 'piso_trabajo', 'carrier_huella'],
    },
    {
      id: 'tacker10-locacion',
      rigId: 'TACKER-10',
      name: 'Locación (layout TKR-10)',
      componentIds: ['layout_tkr10'],
    },
  ],
  components: [
    {
      id: 'mastil',
      rigId: 'TACKER-10',
      name: 'Mástil Service King SK104-330',
      family: 'mast',
      confidence: 'C',
      sourceIds: ['src-folleto'],
      scope:
        'Celosía ILUSTRATIVA de barras tubulares (patas, travesaños y diagonales) con la altura y los tramos documentados. Ancho de base/tope, paneles y diámetros sin plano del fabricante (PENDIENTE); sin corona, poleas ni balcón. No se ubica en la escena hasta fijar su base.',
      model: '/models/tacker10/mastil.glb',
      specifications: [
        {
          key: 'heightM',
          label: 'Altura (104 ft)',
          value: 31.6992,
          unit: 'm',
          confidence: 'A',
          sourceId: 'src-folleto',
        },
        {
          key: 'lowerSectionM',
          label: 'Tramo inferior',
          value: 16.4,
          unit: 'm',
          confidence: 'B',
          sourceId: 'src-folleto',
        },
        {
          key: 'upperSectionM',
          label: 'Tramo superior',
          value: 15.2992,
          unit: 'm',
          confidence: 'B',
          sourceId: 'src-folleto',
        },
        {
          key: 'capacityLb',
          label: 'Capacidad nominal',
          value: 330000,
          unit: 'lb',
          confidence: 'A',
          sourceId: 'src-folleto',
        },
      ],
    },
    {
      id: 'piso_trabajo',
      rigId: 'TACKER-10',
      name: 'Piso de trabajo telescópico',
      family: 'workfloor',
      confidence: 'C',
      sourceIds: ['src-folleto', 'src-layout'],
      scope:
        'Placa maciza a la altura del modelo, ubicada según el layout (medida del vector, no acotada). Sin barandas, telescopio ni escalera.',
      model: '/models/tacker10/piso_trabajo.glb',
      specifications: [
        {
          key: 'sizeM',
          label: 'Largo × ancho',
          value: '2,6 × 3,3 m',
          confidence: 'B',
          sourceId: 'src-folleto',
          conflicts: [{ sourceId: 'src-layout', value: '3 × 3 m (nominal en el layout)' }],
        },
        {
          key: 'heightRangeM',
          label: 'Altura regulable',
          value: '1 a 4 m',
          confidence: 'A',
          sourceId: 'src-folleto',
        },
        {
          key: 'modelHeightM',
          label: 'Altura del modelo',
          value: 3,
          unit: 'm',
          confidence: 'B',
          sourceId: 'src-folleto',
          conflicts: [
            { sourceId: 'src-legacy-v2', value: 2.3, note: 'El V2 procedural mantiene 2,30 m' },
          ],
        },
      ],
    },
    {
      id: 'carrier_huella',
      rigId: 'TACKER-10',
      name: 'Carrier Service King SK-575 (huella)',
      family: 'carrier',
      confidence: 'C',
      sourceIds: ['src-folleto', 'src-layout'],
      scope:
        'Solo la huella en planta de la envolvente operativa. Sin ejes, cabina, tanques ni altura. Desplazamiento lateral medido del vector del layout.',
      model: '/models/tacker10/carrier_huella.glb',
      specifications: [
        {
          key: 'operatingLengthM',
          label: 'Envolvente operativa (largo)',
          value: 18,
          unit: 'm',
          confidence: 'A',
          sourceId: 'src-layout',
        },
        {
          key: 'widthM',
          label: 'Ancho',
          value: 4,
          unit: 'm',
          confidence: 'A',
          sourceId: 'src-layout',
        },
        { key: 'axles', label: 'Ejes', value: 5, confidence: 'A', sourceId: 'src-folleto' },
        {
          key: 'equipoABocaM',
          label: 'Distancia a la boca de pozo',
          value: 1.3,
          unit: 'm',
          confidence: 'A',
          sourceId: 'src-layout',
        },
      ],
    },
    {
      id: 'layout_tkr10',
      rigId: 'TACKER-10',
      name: 'Huellas de locación (acumulador, bomba, pileta, planchada)',
      family: 'auxiliary',
      confidence: 'C',
      sourceIds: ['src-layout'],
      scope:
        'Solo huellas en planta. Tamaños y tres separaciones rotuladas; el resto de las posiciones se midió del vector del PDF. No incluye anclajes (25 ± 3 m en TKR-10 vs 20 m en el folleto: fuente en conflicto).',
      model: '/models/tacker10/layout_tkr10.glb',
      specifications: [
        {
          key: 'accumulatorM',
          label: 'Acumulador BOP',
          value: '8 × 2,4 m',
          confidence: 'A',
          sourceId: 'src-layout',
        },
        {
          key: 'triplexPumpM',
          label: 'Bomba triplex',
          value: '6 × 2,4 m',
          confidence: 'A',
          sourceId: 'src-layout',
        },
        {
          key: 'circulationPitM',
          label: 'Pileta de circulación',
          value: '12 × 2,4 m',
          confidence: 'A',
          sourceId: 'src-layout',
        },
        {
          key: 'catwalkM',
          label: 'Planchada',
          value: '12 × 2,4 m',
          confidence: 'A',
          sourceId: 'src-layout',
        },
        {
          key: 'bombaPiletaM',
          label: 'Separación bomba–pileta',
          value: 5,
          unit: 'm',
          confidence: 'A',
          sourceId: 'src-layout',
        },
        {
          key: 'acumuladorEjeM',
          label: 'Acumulador al eje del pozo',
          value: 3,
          unit: 'm',
          confidence: 'A',
          sourceId: 'src-layout',
        },
      ],
    },
  ],
}

/** Un GLB de la escena nativa. Posición en el marco glTF (m, Y arriba) respecto de la boca de pozo. */
export interface SceneModel {
  componentId: string
  url: string
  position?: readonly [number, number, number]
}

/**
 * Componentes que se dibujan. `carrier_huella` y `layout_tkr10` ya vienen en el marco de la boca de pozo.
 * `piso_trabajo` se centra en el origen del GLB: se ubica con la posición medida del layout (C).
 * `mastil` NO se dibuja: su base en la escena no está documentada y no se inventa (ver cad/README.md).
 */
export const TACKER10_SCENE: readonly SceneModel[] = [
  { componentId: 'carrier_huella', url: '/models/tacker10/carrier_huella.glb' },
  { componentId: 'layout_tkr10', url: '/models/tacker10/layout_tkr10.glb' },
  // CAD (x, y) = (1,95; −1,95) → glTF (x, z, −y): posición medida del layout, confianza C.
  {
    componentId: 'piso_trabajo',
    url: '/models/tacker10/piso_trabajo.glb',
    position: [1.95, 0, 1.95],
  },
]
