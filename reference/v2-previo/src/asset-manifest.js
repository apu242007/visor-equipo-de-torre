export const COMPONENT_IDS = Object.freeze([
  'mastil',
  'subestructura',
  'malacate',
  'aparejo',
  'motor',
  'cabina',
  'bop',
  'llave',
  'caballetes',
  'circulacion',
  'vientos',
  'enganche',
  'camion',
]);

// Physical colors observed in the supplied night photograph. These colors are
// intentionally independent from the UI family colors used for learning.
export const EQUIPMENT_PALETTE = Object.freeze({
  mastil: Object.freeze({ main: '#C8C2AE', accent: '#A72A32' }),
  subestructura: Object.freeze({ main: '#A72A32', accent: '#F2B632' }),
  malacate: Object.freeze({ main: '#A72A32', accent: '#A9B0B1' }),
  aparejo: Object.freeze({ main: '#A72A32', accent: '#F2B632' }),
  motor: Object.freeze({ main: '#A72A32', accent: '#A9B0B1' }),
  cabina: Object.freeze({ main: '#A72A32', accent: '#C8C2AE' }),
  bop: Object.freeze({ main: '#3E7896', accent: '#92B4C5' }),
  llave: Object.freeze({ main: '#A72A32', accent: '#F2B632' }),
  caballetes: Object.freeze({ main: '#6F767C', accent: '#C8C2AE' }),
  circulacion: Object.freeze({ main: '#A72A32', accent: '#F2B632' }),
  vientos: Object.freeze({ main: '#747A80', accent: '#C8C2AE' }),
  enganche: Object.freeze({ main: '#F2B632', accent: '#C8C2AE' }),
  camion: Object.freeze({ main: '#A72A32', accent: '#F2B632' }),
});

// Pilot assets stay disabled until a reviewed GLB is placed at the declared URL.
// This keeps the procedural model as a zero-error fallback during migration.
export const ASSET_MANIFEST = Object.freeze({
  mastil: Object.freeze({
    componentId: 'mastil',
    url: './assets/models/mastil.glb',
    enabled: false,
    scale: 1,
  }),
  malacate: Object.freeze({
    componentId: 'malacate',
    url: './assets/models/malacate.glb',
    enabled: false,
    scale: 1,
  }),
  camion: Object.freeze({
    componentId: 'camion',
    url: './assets/models/camion.glb',
    enabled: false,
    scale: 1,
  }),
});
