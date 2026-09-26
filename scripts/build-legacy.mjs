// Genera el visor V2 de trabajo a partir del ORIGINAL inmutable (reference/legacy/) + parches + módulos legacy-ext/.
//
//   node scripts/build-legacy.mjs                       → escribe public/legacy/TACKER10_Digital_Rig_V2.html
//   node scripts/build-legacy.mjs --out .tmp/x/index.html [--only 10-a.js,20-b.js]
//        → escribe SOLO ese archivo (para probar sin pisar la copia de trabajo).
//        --drops <json> usa otro JSON de datos DROPS (por defecto src/data/qhse/tacker10-drops.json).
//        --only limita los módulos legacy-ext incluidos (siempre entra 00-runtime.js y el bloque de datos).
//
// Cada parche exige EXACTAMENTE 1 coincidencia: si el original cambia, el build falla en vez de corromper.
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const original = path.join(root, 'reference', 'legacy', 'TACKER10_Digital_Rig_V2.html')
const extDir = path.join(root, 'legacy-ext')

const args = process.argv.slice(2)
const argValue = (flag) => {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}
const outArg = argValue('--out')
const dropsJson = argValue('--drops')
  ? path.resolve(root, argValue('--drops'))
  : path.join(root, 'src', 'data', 'qhse', 'tacker10-drops.json')
const only = argValue('--only')?.split(',').filter(Boolean)

/** Helpers del visor (minificados) → nombre legible, expuestos a los módulos en `onPre`. */
const PRE_API = {
  Ot: 'Ot', // registro { id: (group, materials) => void } de las funciones que construyen cada componente
  D: 'D', // (x,y,z) => Vector3
  ni: 'ni', // (t, offsetLateral=0, z=0) => Vector3 sobre el eje inclinado del mástil (t en unidades locales 0..31)
  le: 'le', // box:      (group, mat, w, h, d, x, y, z) => Mesh
  De: 'De', // cilindro: (group, mat, rTop, rBot, h, x, y, z, axis='y'|'x'|'z', segs=12, openEnded=false) => Mesh
  Ne: 'Ne', // tubo entre dos Vector3: (group, mat, p1, p2, radius=.05, segs=6) => Mesh
  vl: 'vl', // baranda: (group, mat, puntos[], altura=1)
  Wd: 'Wd', // reticulado del mástil: (group, mat, y0, y1, halfWidth, bays)
  Ml: 'Ml', // grupo local del mástil (inclinado y escalado): (parent) => Group
  ta: 'ta', // polilínea como tubos: (group, mat, puntos[], radius)
  pn: 'pn', // material PBR: (color, roughness=.6, metalness=.3, extra={}) => MeshStandardMaterial
  ir: 'ir', // activa castShadow/receiveShadow en un mesh
  gt: 'gt', // { bx, by, h, scale, a }: base, largo efectivo, escala local y ángulo del mástil
  Hn: 'Hn', // altura del aparejo (14 m)
  Zt: 'Zt', // posición del tambor del malacate
  mn: 'mn', // posición de la polea de corona
}

/** Clases de three (minificadas) que el visor no expone: se publican en `R.three` (post). */
const THREE_CLASSES = {
  Group: 'tn',
  Mesh: 'et',
  BoxGeometry: 'Ui',
  CylinderGeometry: 'pi',
  SphereGeometry: 'Lr',
  RingGeometry: 'Pr',
  CircleGeometry: 'Gs',
  TorusGeometry: 'Bn',
  MeshBasicMaterial: 'Zn',
  MeshStandardMaterial: 'os',
  LineBasicMaterial: 'Ni',
  Line: 'Vs',
  BufferGeometry: 'Nt',
  Vector3: 'R',
  Color: 'Be',
  Box3: 'On',
  Fog: 'Sr',
  HemisphereLight: 'Fr',
  DirectionalLight: 'Br',
  DoubleSide: 'sn',
  BackSide: 'cn',
}

const obj = (map) =>
  '{' +
  Object.entries(map)
    .map(([k, v]) => `${k}:${v}`)
    .join(',') +
  '}'

const patches = [
  {
    name: 'sombras PCF (PCFSoftShadowMap está deprecado)',
    find: 'ot.shadowMap.type=Mo;',
    replace: 'ot.shadowMap.type=1;',
  },
  {
    name: 'favicon inline',
    find: '<title>TACKER 10',
    replace:
      '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%276%27 fill=%27%230b0d12%27/%3E%3Cpath d=%27M16 4v24M10 28h12M12 10h8M13 16h6%27 stroke=%27%23f2b632%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 fill=%27none%27/%3E%3C/svg%3E">\n<title>TACKER 10',
  },
  {
    name: 'puente de modo embebido (?embedded + postMessage tacker:setMode)',
    find: "mb.addEventListener('click',e=>{const b=e.target.closest('button[data-m]');if(b)setMode(b.dataset.m)});setMode('explore');",
    replace:
      "mb.addEventListener('click',e=>{const b=e.target.closest('button[data-m]');if(b)setMode(b.dataset.m)});setMode('explore');\n    // Modo embebido (iframe de la app TACKER DIGITAL RIG): la app controla el modo por postMessage y se oculta la barra propia.\n    if(new URLSearchParams(location.search).has('embedded')){mb.style.display='none';window.addEventListener('message',e=>{if(e.source!==window.parent)return;const d=e.data;if(d&&d.type==='tacker:setMode'&&Object.prototype.hasOwnProperty.call(MODE,d.mode))setMode(d.mode)})}",
  },
  {
    name: 'hook PRE: antes de construir los componentes',
    find: 'var Jt={},jd={},Tn={},Dh=[],Vx=',
    replace: `window.__rigExt&&window.__rigExt.runPre(${obj(PRE_API)});var Jt={},jd={},Tn={},Dh=[],Vx=`,
  },
  {
    name: 'hook POST: window.__rig ampliado',
    find: 'window.__rig={groups:Jt,COMPONENTS:at,selectComponent:tr,setExplode:Fh,focusOn:ef,state:Me};',
    replace:
      `window.__rig={groups:Jt,COMPONENTS:at,selectComponent:tr,setExplode:Fh,focusOn:ef,state:Me,` +
      `scene:Ft,renderer:ot,camera:()=>wt,pickables:Dh,materials:jd,centers:Tn,explodeOffsets:Vx,view:Pe,families:nr,` +
      `three:${obj(THREE_CLASSES)},mast:gt,hookHeight:Hn,invalidate:At};` +
      `window.__rigExt&&window.__rigExt.runPost(window.__rig);`,
  },
]

const BUNDLE_ANCHOR = '<script>\n(()=>{/**\n * @license\n * Copyright 2010-2026 Three.js Authors'

function readExtModules() {
  const all = fs
    .readdirSync(extDir)
    .filter((f) => /^\d\d-.*\.js$/.test(f))
    .sort()
  const runtime = all.filter((f) => f.startsWith('00-'))
  const rest = all.filter((f) => !f.startsWith('00-') && (!only || only.includes(f)))
  return [...runtime, ...rest]
}

function build() {
  let html = fs.readFileSync(original, 'utf8')

  for (const p of patches) {
    const n = html.split(p.find).length - 1
    if (n !== 1) throw new Error(`Parche "${p.name}": se esperaba 1 coincidencia y hay ${n}`)
    html = html.replace(p.find, () => p.replace)
  }

  const blocks = []
  const runtimeFile = '00-runtime.js'
  blocks.push(`/* ${runtimeFile} */\n` + fs.readFileSync(path.join(extDir, runtimeFile), 'utf8'))

  if (fs.existsSync(dropsJson)) {
    const data = JSON.parse(fs.readFileSync(dropsJson, 'utf8'))
    // `</`, `<!--` y U+2028/9 se escapan para que ningún dato cierre ni altere el <script>.
    const safeJson = JSON.stringify(data)
      .replace(/<\//g, '<\\/')
      .replace(/<!--/g, '<\\!--')
      .replaceAll('\u2028', '\\u2028')
      .replaceAll('\u2029', '\\u2029')
    blocks.push(
      '/* datos DROPS (src/data/qhse/tacker10-drops.json) */\nwindow.__TACKER_DROPS=' +
        safeJson +
        ';',
    )
  }
  for (const f of readExtModules().filter((f) => f !== runtimeFile)) {
    blocks.push(`/* ${f} */\n` + fs.readFileSync(path.join(extDir, f), 'utf8'))
  }

  const ext = `<script id="tacker-ext">\n${blocks.join('\n')}\n</script>\n`
  if (html.split(BUNDLE_ANCHOR).length - 1 !== 1)
    throw new Error('No se encontró el ancla del bundle')
  html = html.replace(BUNDLE_ANCHOR, () => ext + BUNDLE_ANCHOR)
  return html
}

const html = build()
const targets = outArg
  ? [path.resolve(root, outArg)]
  : [path.join(root, 'public', 'legacy', 'TACKER10_Digital_Rig_V2.html')]

for (const t of targets) {
  fs.mkdirSync(path.dirname(t), { recursive: true })
  fs.writeFileSync(t, html)
  console.log('escrito', path.relative(root, t), `(${(html.length / 1024).toFixed(0)} KB)`)
}
