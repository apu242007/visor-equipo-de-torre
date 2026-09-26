/*
 * 40-wellsite.js · TACKER 10 · boca de pozo y locación.
 *
 * Rediseña 5 componentes del visor V2 y agrega el entorno de locación:
 *   - aparejo      → bloque IDECO amarillo con gancho forjado (envuelve el original: conserva sus ramales y el estado interno del visor)
 *   - bop          → BOP Cameron 7 1/16" 5M anular + doble (azul), líneas de matar/ahogar, eslinga de anclaje y acumulador de 5 botellones
 *   - llave        → llave hidráulica de tubing, cuñas, línea de suspensión y poste de retenida (grampas + brazo)
 *   - caballetes   → planchada 12×2,4 m, plano inclinado (bandeja) y caballetes de 2 m con tubing/varillas
 *   - circulacion  → pileta de ensayo 12×2,4 m, cubicador, desgasificador, bomba triplex 6×2,4 m, manifold y cañerías al pozo
 *   - entorno      → Group `locacion_entorno` (fuera de los 13 componentes: ni seleccionable ni en R.pickables): ripio, torres de luz,
 *                    vallado, conos, señalización, tráilers/tanques del LAYOUT TKR-10.
 *
 * Técnica: cada componente se construye con geometrías FUSIONADAS por material (color por vértice), así se agregan pocos meshes y
 * pocos draw calls. Las clases de three no están expuestas en `onPre`: se recuperan de los helpers del visor (ver bootKit).
 *
 * Convención: 1 u = 1 m · origen = boca de pozo · +X hacia el mástil · carrier hacia −X · Z lateral · Y arriba.
 * Datos documentados (FOLLETO TACKER 10 rev. 26/06/2024, LAYOUT TKR-10 11/07/2025, Libro DROPS Rev.03): BOP 7 1/16" 5000 psi anular+doble,
 * acumulador de 5 botellones (8×2,4 m), aparejo IDECO 110 t con 6 líneas, amelas 150 t, elevador 100 t, bomba triplex 6×2,4 m,
 * pileta de ensayo 12×2,4 m (40 m³) con cubicador 3,5 m³, caballetes de 2 m (4,5 t), planchada 12×2,4 m, anclaje de pirosalva a 30 m.
 * Todo lo demás (alturas, colores, detalle de forma) es ESTÉTICO y aproximado; no es as-built ni apto para fabricación.
 *
 * CONFLICTO DOCUMENTAL (aparejo): el folleto y el informe técnico dicen 6 líneas; el Libro DROPS (BP-3) dice "8 líneas de cable
 * 1 1/8"" (probablemente otro equipo Tacker). Se mantienen las 6 líneas del folleto (`vt.reevingLines`) y se registra la discrepancia.
 *
 * Etiquetas DROPS (userData.dropsId + nombre `drops_<ID>`): BP-3, BP-4, PLA-1 (fila incompleta en el Libro: "BANDEJA HCA."),
 * PLA-2, PIL-1, PIL-2, PRL-1, PRL-2, PRL-3. BP-1 (guinche) y BP-2 (power swivel, "NA") no se dibujan aquí.
 */
;(() => {
  'use strict'

  // ───────────────────────────── paleta (pintura real del equipo) ─────────────────────────────
  const C = {
    RED: '#A72A32', // rojo Tacker
    YEL: '#F2B632', // amarillo seguridad
    BLUE: '#3E7896', // azul BOP
    BLUE_L: '#92B4C5', // acento BOP
    GRAY: '#6F767C',
    GRAY_L: '#A3AAAF',
    DARK: '#2B2F36',
    STEEL: '#B4BABE',
    WHITE: '#E7E9E4',
    HOSE: '#15171C',
    CABLE: '#9AA1A8',
    ORANGE: '#E4702A',
    CONC: '#8C8F89',
    GLASS: '#1B2733',
    SKID: '#4B5159', // patines y bastidores (gris grafito, más claro que DARK para que se lea)
    POWER: '#5C636B',
  }

  // ───────────────────────────── kit de geometría ─────────────────────────────
  /** Clases de three recuperadas de los helpers del visor (en `onPre`) o de `R.three` (en `onPost`). */
  const K = { ready: false, api: null }
  const SINK = { add() {} } // "padre" descartable para reutilizar los helpers del visor y extraer su geometría

  function bootKit(api) {
    if (K.ready) return
    K.api = api
    const box = api.le(SINK, undefined, 1, 1, 1, 0, 0, 0)
    K.Mesh = box.constructor
    K.Box = box.geometry.constructor
    K.BufferGeometry = Object.getPrototypeOf(K.Box)
    K.Attr = box.geometry.getAttribute('position').constructor
    K.Cyl = api.De(SINK, undefined, 1, 1, 1, 0, 0, 0).geometry.constructor
    K.Group = api.Ml(SINK).constructor
    K.Vec = api.D(0, 0, 0).constructor
    K.Color = api.pn('#000000').color.constructor
    K.ready = true
  }

  const rgbCache = new Map()
  function rgb(hex) {
    let c = rgbCache.get(hex)
    if (!c) {
      const col = new K.Color(hex) // ya en espacio lineal (color por vértice se espera lineal)
      c = [col.r, col.g, col.b]
      rgbCache.set(hex, c)
    }
    return c
  }

  /** Fusiona geometrías indexadas (position/normal/uv) en una sola con color RGBA por vértice. */
  function mergeGeometries(parts) {
    let nv = 0
    let ni = 0
    for (const p of parts) {
      nv += p.geo.attributes.position.count
      ni += p.geo.index.count
    }
    const pos = new Float32Array(nv * 3)
    const nor = new Float32Array(nv * 3)
    const uv = new Float32Array(nv * 2)
    const col = new Float32Array(nv * 4)
    const idx = new Array(ni)
    let vo = 0
    let io = 0
    for (const p of parts) {
      const g = p.geo
      const n = g.attributes.position.count
      pos.set(g.attributes.position.array, vo * 3)
      nor.set(g.attributes.normal.array, vo * 3)
      uv.set(g.attributes.uv.array, vo * 2)
      if (p.rgba) col.set(p.rgba, vo * 4)
      else {
        const [r, gg, b] = rgb(p.color || '#ffffff')
        for (let k = 0; k < n; k++) {
          const o = (vo + k) * 4
          col[o] = r
          col[o + 1] = gg
          col[o + 2] = b
          col[o + 3] = 1
        }
      }
      const src = g.index.array
      for (let k = 0; k < src.length; k++) idx[io + k] = src[k] + vo
      vo += n
      io += src.length
      g.dispose()
    }
    const out = new K.BufferGeometry()
    out.setAttribute('position', new K.Attr(pos, 3))
    out.setAttribute('normal', new K.Attr(nor, 3))
    out.setAttribute('uv', new K.Attr(uv, 2))
    out.setAttribute('color', new K.Attr(col, 4))
    out.setIndex(idx)
    return out
  }

  /** Acumula primitivas (con su color) y las emite como UN mesh. */
  class Batch {
    constructor() {
      this.parts = []
    }
    push(geo, x = 0, y = 0, z = 0, color, rgba) {
      if (x || y || z) geo.translate(x, y, z)
      this.parts.push({ geo, color, rgba })
      return this
    }
    box(c, w, h, d, x, y, z, ry = 0, rx = 0) {
      const g = new K.Box(w, h, d)
      if (rx) g.rotateX(rx)
      if (ry) g.rotateY(ry)
      return this.push(g, x, y, z, c)
    }
    /** Cilindro/tronco de cono; eje 'x' | 'y' | 'z' (misma convención que `De` del visor). */
    cyl(c, rt, rb, h, x, y, z, axis = 'y', seg = 10, open = false) {
      const g = new K.Cyl(rt, rb, h, seg, 1, open)
      if (axis === 'x') g.rotateZ(Math.PI / 2)
      else if (axis === 'z') g.rotateX(Math.PI / 2)
      return this.push(g, x, y, z, c)
    }
    /** Barra cilíndrica entre dos puntos [x,y,z]. */
    rod(c, p1, p2, r, seg = 6, open = false) {
      const dx = p2[0] - p1[0]
      const dy = p2[1] - p1[1]
      const dz = p2[2] - p1[2]
      const len = Math.hypot(dx, dy, dz)
      if (len < 1e-6) return this
      const g = new K.Cyl(r, r, len, seg, 1, open)
      g.rotateZ(-Math.acos(Math.max(-1, Math.min(1, dy / len))))
      g.rotateY(-Math.atan2(dz, dx))
      return this.push(g, (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, (p1[2] + p2[2]) / 2, c)
    }
    /** Tubo curvo (Catmull-Rom) por puntos [x,y,z], con el `ta` del visor. */
    tube(c, pts, r) {
      const m = K.api.ta(
        SINK,
        undefined,
        pts.map((p) => K.api.D(p[0], p[1], p[2])),
        r,
      )
      return this.push(m.geometry, 0, 0, 0, c)
    }
    /** Arco/anillo de tubo: plano 'xy' | 'zy' | 'xz', ángulos en rad. */
    loop(c, cx, cy, cz, R, plane, a0, a1, r, n = 14) {
      const pts = []
      for (let k = 0; k <= n; k++) {
        const a = a0 + ((a1 - a0) * k) / n
        const u = R * Math.cos(a)
        const v = R * Math.sin(a)
        pts.push(
          plane === 'xy'
            ? [cx + u, cy + v, cz]
            : plane === 'zy'
              ? [cx, cy + v, cz + u]
              : [cx + u, cy, cz + v],
        )
      }
      return this.tube(c, pts, r)
    }
    /** Baranda con pasamanos, barra media, rodapié y montantes cada ~1,5 m. `pts` = polilínea [[x,z],…]. */
    rail(cPost, pts, y0, h = 1.05, kick = true) {
      for (let s = 1; s < pts.length; s++) {
        const [x1, z1] = pts[s - 1]
        const [x2, z2] = pts[s]
        const len = Math.hypot(x2 - x1, z2 - z1)
        const n = Math.max(1, Math.ceil(len / 1.5))
        for (let k = 0; k <= n; k++) {
          const t = k / n
          this.box(cPost, 0.05, h, 0.05, x1 + (x2 - x1) * t, y0 + h / 2, z1 + (z2 - z1) * t)
        }
        this.rod(cPost, [x1, y0 + h, z1], [x2, y0 + h, z2], 0.024, 6)
        this.rod(cPost, [x1, y0 + h * 0.5, z1], [x2, y0 + h * 0.5, z2], 0.018, 5)
        if (kick)
          this.box(
            cPost,
            len,
            0.1,
            0.015,
            (x1 + x2) / 2,
            y0 + 0.07,
            (z1 + z2) / 2,
            Math.atan2(-(z2 - z1), x2 - x1),
          )
      }
      return this
    }
    /** Emite el lote como un solo mesh en `parent`. */
    flush(parent, mat, name, { cast = true, receive = true } = {}) {
      if (!this.parts.length) return null
      const mesh = new K.Mesh(mergeGeometries(this.parts), mat)
      mesh.name = name || ''
      mesh.castShadow = cast
      mesh.receiveShadow = receive
      parent.add(mesh)
      this.parts.length = 0
      return mesh
    }
  }

  /** Materiales por componente (el visor los clona luego por componente para hover/selección). Color por vértice. */
  const mats = (api) => ({
    paint: api.pn('#ffffff', 0.55, 0.22, { vertexColors: true }),
    metal: api.pn('#ffffff', 0.42, 0.4, { vertexColors: true }),
    rubber: api.pn('#ffffff', 0.85, 0.02, { vertexColors: true }),
  })

  /** Grupo etiquetado para la capa DROPS (nombre `drops_<ID>` + userData.dropsId). */
  function dropsGroup(parent, id, note) {
    const grp = new K.Group()
    grp.name = 'drops_' + id
    grp.userData.dropsId = id
    if (note) grp.userData.dropsNote = note
    parent.add(grp)
    return grp
  }

  const PI = Math.PI

  // ═════════════════════════════════════════ BOP + ACUMULADOR ═════════════════════════════════════════
  function buildBop(g, api) {
    const m = mats(api)
    const P = new Batch() // pintura
    const M = new Batch() // acero / mecanizado
    const H = new Batch() // mangueras

    const bolts = (b, y, r, n) => {
      for (let k = 0; k < n; k++)
        b.cyl(
          C.GRAY,
          0.03,
          0.03,
          0.1,
          r * Math.cos((2 * PI * k) / n),
          y,
          r * Math.sin((2 * PI * k) / n),
          'y',
          6,
        )
    }
    const flange = (y) => {
      M.cyl(C.STEEL, 0.46, 0.46, 0.07, 0, y, 0, 'y', 20)
      bolts(M, y + 0.02, 0.38, 12)
    }

    // losa de boca de pozo + cabezal y carretel (a nivel de terreno)
    P.box(C.CONC, 3.2, 0.06, 3.2, 0, 0.03, 0) // estético
    P.cyl(C.GRAY, 0.3, 0.3, 0.38, 0, 0.19, 0, 'y', 18)
    flange(0.415)
    P.cyl(C.GRAY, 0.28, 0.28, 0.2, 0, 0.55, 0, 'y', 18)
    flange(0.685)

    // BOP doble de ariete (Cameron, cierre parcial y total): cuerpo azul + 2 bonetes con cilindro operador por lado
    P.box(C.BLUE, 0.72, 0.62, 0.62, 0, 1.03, 0)
    for (const s of [-1, 1]) {
      for (const y of [0.87, 1.19]) {
        P.cyl(C.BLUE, 0.15, 0.15, 0.3, s * 0.51, y, 0, 'x', 14) // bonete
        P.cyl(C.BLUE_L, 0.1, 0.1, 0.3, s * 0.81, y, 0, 'x', 12) // cilindro operador hidráulico
        M.cyl(C.STEEL, 0.045, 0.045, 0.14, s * 1.0, y, 0, 'x', 8) // vástago de cierre manual
      }
    }
    flange(1.375)
    P.cyl(C.GRAY, 0.27, 0.27, 0.16, 0, 1.49, 0, 'y', 18)
    flange(1.605)

    // BOP anular (azul) con anillos de acento y cabeza cónica
    P.cyl(C.BLUE, 0.38, 0.38, 0.36, 0, 1.82, 0, 'y', 24)
    P.cyl(C.BLUE_L, 0.395, 0.395, 0.04, 0, 1.68, 0, 'y', 24)
    P.cyl(C.BLUE_L, 0.395, 0.395, 0.04, 0, 1.96, 0, 'y', 24)
    P.cyl(C.BLUE, 0.3, 0.38, 0.1, 0, 2.05, 0, 'y', 24)
    P.cyl(C.BLUE, 0.2, 0.3, 0.07, 0, 2.135, 0, 'y', 20)
    for (let k = 0; k < 8; k++)
      M.cyl(
        C.GRAY,
        0.022,
        0.022,
        0.04,
        0.34 * Math.cos((k * PI) / 4),
        2.09,
        0.34 * Math.sin((k * PI) / 4),
        'y',
        6,
      )

    // salidas laterales: línea de ahogar (x=−0,2, ruedas amarillas) y de matar (x=+0,2, ruedas rojas), 2 válvulas c/u
    const valve = (x, z, wheel) => {
      P.box(C.GRAY, 0.2, 0.26, 0.2, x, 0.6, z)
      M.cyl(C.STEEL, 0.05, 0.05, 0.3, x, 0.86, z, 'y', 8)
      P.cyl(wheel, 0.13, 0.13, 0.03, x, 1.02, z, 'y', 14)
    }
    for (const [x, wheel] of [
      [-0.2, C.YEL],
      [0.2, C.RED],
    ]) {
      M.cyl(C.STEEL, 0.07, 0.07, 0.14, x, 1.03, -0.38, 'z', 8)
      M.cyl(C.STEEL, 0.11, 0.11, 0.04, x, 1.03, -0.46, 'z', 12)
      M.rod(C.STEEL, [x, 1.03, -0.46], [x, 1.03, -0.66], 0.055)
      M.rod(C.STEEL, [x, 1.03, -0.66], [x, 0.6, -0.66], 0.055)
      M.rod(C.STEEL, [x, 0.6, -0.66], [x, 0.6, -2.3], 0.055)
      valve(x, -1.0, wheel)
      valve(x, -1.45, wheel)
      M.cyl(C.STEEL, 0.1, 0.1, 0.08, x, 0.6, -2.34, 'z', 12) // unión de martillo: aquí se conecta la cañería de `circulacion`
    }

    // líneas hidráulicas de control desde el acumulador (cuatro: bonetes izq/der y anular)
    const trunk = [
      [-10.4, 0.9, 3.75],
      [-8, 0.25, 3.3],
      [-3.5, 0.15, 2.6],
      [-1.6, 0.15, 2.3],
      [-0.6, 0.25, 1.9],
      [-0.6, 0.5, 1.0],
    ]
    H.tube(C.HOSE, [...trunk, [-0.8, 0.75, 0.35], [-0.85, 0.87, 0.2]], 0.022)
    H.tube(C.HOSE, [...trunk, [-0.8, 0.95, 0.4], [-0.85, 1.19, 0.2]], 0.022)
    H.tube(C.HOSE, [...trunk, [0, 0.6, 0.7], [0.85, 0.8, 0.4], [0.85, 0.87, 0.2]], 0.022)
    H.tube(C.HOSE, [...trunk, [0, 0.6, 0.7], [0, 1.6, 0.55], [0.25, 1.82, 0.4]], 0.022)

    P.flush(g, m.paint, 'bop_pintura')
    M.flush(g, m.metal, 'bop_acero')
    H.flush(g, m.rubber, 'bop_mangueras', { cast: false })

    // BP-4 · eslinga de sujeción y anclaje (grillete + eslinga 9/16" + eslinga de seguridad 1/2"), sobre la boca de pozo
    const bp4 = dropsGroup(
      g,
      'BP-4',
      'Libro DROPS p.15: grillete y eslinga de seguridad 9/16" + eslinga de seguridad 1/2". Geometría estética.',
    )
    const S4 = new Batch()
    const O4 = new Batch()
    S4.box(C.STEEL, 0.1, 0.12, 0.05, 0, 1.68, 0.41) // oreja de izaje del anular
    S4.loop(C.STEEL, 0, 1.68, 0.5, 0.06, 'zy', 0, 2 * PI, 0.014, 12) // grillete
    S4.cyl(C.STEEL, 0.014, 0.014, 0.16, 0, 1.68, 0.44, 'x', 6) // perno del grillete
    O4.cyl(C.RED, 0.008, 0.008, 0.05, 0.08, 1.68, 0.44, 'x', 5) // seguro del perno (chaveta)
    S4.tube(
      C.STEEL,
      [
        [0, 1.72, 0.55],
        [0.14, 1.82, 0.78],
        [0.42, 2.05, 0.92],
        [0.55, 2.2, 0.84],
      ],
      0.016,
    ) // eslinga 9/16"
    O4.tube(
      C.ORANGE,
      [
        [0.03, 1.72, 0.55],
        [0.2, 1.9, 0.84],
        [0.47, 2.08, 0.95],
        [0.58, 2.2, 0.86],
      ],
      0.012,
    ) // eslinga de seguridad 1/2"
    S4.cyl(C.STEEL, 0.04, 0.04, 0.05, 0.55, 2.22, 0.82, 'y', 8) // cáncamo bajo el piso de trabajo
    S4.flush(bp4, m.metal, 'bp4_acero')
    O4.flush(bp4, m.paint, 'bp4_seguridad')

    // acumulador (8×2,4 m, 5 botellones) — misma posición que el visor: x −18…−10, z=4,2
    const ga = new K.Group()
    ga.name = 'acumulador_5_botellas'
    g.add(ga)
    const AP = new Batch()
    const AM = new Batch()
    const zc = 4.2
    AP.box(C.SKID, 8, 0.18, 2.4, -14, 0.15, zc) // patín 8×2,4 m (LAYOUT TKR-10)
    for (const dz of [-1.1, 1.1]) AM.box(C.GRAY, 8, 0.1, 0.12, -14, 0.27, zc + dz)
    for (let n = 0; n < 5; n++) {
      const x = -16 + n * 0.9
      AP.cyl(C.BLUE, 0.24, 0.24, 1.4, x, 0.95, zc, 'y', 18) // botellón
      AP.cyl(C.BLUE, 0.11, 0.24, 0.14, x, 1.72, zc, 'y', 18)
      AM.cyl(C.STEEL, 0.07, 0.07, 0.16, x, 1.87, zc, 'y', 8)
      for (const y of [0.6, 1.3]) AM.cyl(C.GRAY_L, 0.25, 0.25, 0.05, x, y, zc, 'y', 14)
    }
    AM.rod(C.STEEL, [-16.2, 2.0, zc], [-11.2, 2.0, zc], 0.04)
    AM.rod(C.STEEL, [-11.2, 2.0, zc], [-11.2, 1.5, zc], 0.04)
    AP.box(C.GRAY, 1.3, 1.25, 0.55, -11.4, 0.865, zc) // unidad de control
    AP.box(C.BLUE_L, 1.1, 0.7, 0.03, -11.4, 0.95, zc + 0.29)
    for (const x of [-11.7, -11.4, -11.1])
      AM.cyl(C.WHITE, 0.09, 0.09, 0.03, x, 1.2, zc + 0.32, 'z', 14) // manómetros
    for (const x of [-11.8, -11.6, -11.2, -11.0])
      AM.cyl(C.RED, 0.045, 0.045, 0.06, x, 0.75, zc + 0.33, 'z', 8) // válvulas
    AP.box(C.DARK, 1.3, 0.9, 1.0, -17.3, 0.69, zc) // depósito/bomba de carga
    AM.cyl(C.STEEL, 0.18, 0.18, 0.55, -17.3, 1.4, zc, 'x', 12)
    AP.rail(
      C.YEL,
      [
        [-18, zc - 1.2],
        [-18, zc + 1.2],
        [-10, zc + 1.2],
      ],
      0.24,
      1.0,
      false,
    )
    AP.flush(ga, m.paint, 'acumulador_pintura')
    AM.flush(ga, m.metal, 'acumulador_acero')
  }

  // ═════════════════════════════════════════ APAREJO / GANCHO ═════════════════════════════════════════
  /**
   * Envuelve el aparejo original: éste crea `bloque_viajero` (que el visor anima vía `wh`), las amelas, el elevador y los 6 ramales
   * (`Lh`) — estado interno del visor que no está expuesto. Se conservan las poleas, amelas y ramales; las placas, el vástago y el gancho
   * se reemplazan por un bloque IDECO amarillo con gancho forjado. Las 6 líneas del folleto se mantienen (ver conflicto en cabecera).
   */
  function wrapAparejo(api) {
    const original = api.Ot.aparejo
    api.Ot.aparejo = (g, e) => {
      original(g, e)
      const blk = g.children.find((o) => o.name === 'bloque_viajero')
      if (!blk) return
      const m = mats(api)
      const bp3 = dropsGroup(
        blk,
        'BP-3',
        'Folleto: IDECO 110 t, 6 líneas (Libro DROPS BP-3 dice 8 líneas de 1 1/8": conflicto documental, se mantienen 6).',
      )

      // retira placas, vástago, gancho y pasador originales; las poleas (cilindros/toros de r=.36 y cubos) pasan al grupo BP-3
      for (const ch of [...blk.children]) {
        if (!ch.isMesh) continue
        const t = ch.geometry.type
        const p = ch.geometry.parameters || {}
        const isPlate = t === 'BoxGeometry'
        const isStem =
          t === 'CylinderGeometry' &&
          Math.abs(p.radiusTop - 0.11) < 1e-6 &&
          Math.abs(p.height - 0.7) < 1e-6
        const isPin = t === 'CylinderGeometry' && p.radiusTop < 0.03
        const isHook = t === 'TorusGeometry' && Math.abs(p.radius - 0.26) < 1e-6
        if (isPlate || isStem || isPin || isHook) {
          blk.remove(ch)
          ch.geometry.dispose()
        } else bp3.add(ch)
      }

      const P = new Batch()
      const M = new Batch()
      // placas laterales amarillas (contorno redondeado arriba), eje central, tornillos y travesaño inferior
      for (const s of [-1, 1]) {
        P.box(C.YEL, 0.86, 0.7, 0.1, 0, -0.1, s * 0.33)
        P.cyl(C.YEL, 0.5, 0.5, 0.1, 0, 0.25, s * 0.33, 'z', 24)
        M.cyl(C.STEEL, 0.09, 0.09, 0.04, 0, 0.25, s * 0.4, 'z', 10)
      }
      M.cyl(C.STEEL, 0.06, 0.06, 0.8, 0, 0.25, 0, 'z', 10)
      P.box(C.YEL, 0.6, 0.18, 0.7, 0, -0.54, 0)
      // swivel y vástago del gancho
      P.cyl(C.DARK, 0.13, 0.13, 0.22, 0, -0.72, 0, 'y', 14)
      P.cyl(C.YEL, 0.09, 0.09, 0.32, 0, -0.9, 0, 'y', 12)
      // gancho forjado: arco de 290° abierto arriba a la derecha + orejas donde cuelgan las amelas + pestillo de seguridad
      P.loop(C.YEL, 0, -1.32, 0, 0.29, 'xy', PI / 2, PI / 2 + (290 * PI) / 180, 0.075, 28)
      M.cyl(C.STEEL, 0.05, 0.05, 0.7, 0, -1.62, 0, 'z', 8)
      M.rod(C.DARK, [0.27, -1.2, 0], [0.04, -1.05, 0], 0.016)
      P.flush(bp3, m.paint, 'bloque_pintura')
      M.flush(bp3, m.metal, 'bloque_acero')
    }
  }

  // ═════════════════════════════════════════ LLAVE HIDRÁULICA + POSTE DE RETENIDA ═════════════════════════════════════════
  function buildLlave(g, api) {
    const m = mats(api)
    const P = new Batch()
    const M = new Batch()
    const H = new Batch()
    const FL = 2.36 // cota superior del piso de trabajo (subestructura)

    // cuñas (slips) en el buje del piso + sarta de tubing 2 7/8" (estético: una parada)
    P.cyl(C.DARK, 0.36, 0.48, 0.12, 0, FL + 0.06, 0, 'y', 20)
    for (const [x, z] of [
      [0.09, 0],
      [-0.09, 0],
      [0, 0.09],
      [0, -0.09],
    ])
      M.box(C.STEEL, 0.08, 0.16, 0.05, x, FL + 0.19, z, Math.atan2(x, z))
    M.rod(C.STEEL, [0.1, FL + 0.24, 0], [0.45, FL + 0.3, 0.1], 0.015)
    M.rod(C.STEEL, [-0.1, FL + 0.24, 0], [-0.45, FL + 0.3, -0.1], 0.015)
    M.cyl(C.STEEL, 0.045, 0.045, 1.5, 0, 3.13, 0, 'y', 10)
    M.cyl(C.GRAY_L, 0.062, 0.062, 0.14, 0, 3.74, 0, 'y', 10) // cupla

    // llave de tubing (mordazas 2 3/8"–3 1/2"): cuerpo en "C" abierto hacia +X, con llave de contrafuerza debajo
    P.box(C.YEL, 0.5, 0.24, 0.7, -0.16, 3.0, 0)
    P.box(C.YEL, 0.5, 0.24, 0.2, 0.16, 3.0, 0.25)
    P.box(C.YEL, 0.5, 0.24, 0.2, 0.16, 3.0, -0.25)
    P.cyl(C.DARK, 0.3, 0.3, 0.08, -0.1, 3.16, 0, 'y', 18) // tapa de engranajes
    P.box(C.YEL, 0.5, 0.16, 0.6, -0.16, 2.74, 0) // contrafuerza
    P.box(C.YEL, 0.4, 0.16, 0.16, 0.12, 2.74, 0.22)
    P.box(C.YEL, 0.4, 0.16, 0.16, 0.12, 2.74, -0.22)
    for (const dz of [-0.09, 0.09]) M.box(C.STEEL, 0.12, 0.14, 0.06, 0.03, 3.0, dz) // mordazas
    M.cyl(C.DARK, 0.08, 0.08, 0.34, -0.62, 3.0, 0.15, 'x', 10) // motor hidráulico
    P.box(C.DARK, 0.16, 0.2, 0.2, -0.46, 3.0, 0.15)
    for (const dz of [-0.37, 0.37]) M.cyl(C.STEEL, 0.05, 0.05, 0.5, 0.02, 3.0, dz, 'x', 10) // cilindros de sujeción de mordazas
    M.loop(C.STEEL, -0.3, 3.36, 0, 0.1, 'xy', 0, 2 * PI, 0.018, 12) // aro de suspensión
    M.rod(C.STEEL, [-0.45, 3.0, -0.1], [-0.6, 3.0, -0.75], 0.025) // manija
    P.cyl(C.YEL, 0.04, 0.04, 0.16, -0.6, 3.0, -0.8, 'z', 8)

    // mangueras hidráulicas hacia el equipo
    H.tube(
      C.HOSE,
      [
        [-0.7, 3.0, 0.15],
        [-1.0, 2.7, 0.55],
        [-1.5, 2.45, 1.0],
        [-2.6, 2.42, 1.1],
        [-3.6, 2.4, 1.3],
      ],
      0.03,
    )
    H.tube(
      C.HOSE,
      [
        [-0.7, 2.95, 0.2],
        [-1.05, 2.65, 0.65],
        [-1.55, 2.44, 1.1],
        [-2.6, 2.4, 1.25],
        [-3.6, 2.38, 1.45],
      ],
      0.03,
    )

    // suspensión: cabo doble + línea de suspensión al mástil (~9 m) con contrapeso
    M.rod(C.CABLE, [-0.28, 3.16, 0.3], [-0.35, 3.55, -0.1], 0.012, 5)
    M.rod(C.CABLE, [-0.28, 3.16, -0.3], [-0.35, 3.55, -0.1], 0.012, 5)
    M.rod(C.CABLE, [-0.35, 3.55, -0.1], [-0.92, 9.0, -0.62], 0.012, 5)
    P.cyl(C.DARK, 0.07, 0.07, 0.5, -0.47, 4.7, -0.21, 'y', 8)
    P.box(C.DARK, 0.18, 0.12, 0.18, -0.92, 9.0, -0.62)

    // brazo de reacción hasta el poste de retenida
    M.rod(C.STEEL, [0.35, 3.0, 0.25], [0.93, 3.0, 1.17], 0.04, 8)

    // poste de retenida: columna de apoyo + poste redondo, sujetos con dos grampas
    P.box(C.GRAY, 0.12, 2.6, 0.12, 0.95, FL + 1.3, 1.35)
    M.cyl(C.GRAY_L, 0.05, 0.05, 2.4, 0.95, FL + 1.2, 1.21, 'y', 10)
    P.box(C.GRAY, 0.4, 0.03, 0.4, 0.95, FL + 0.015, 1.3) // placa base

    P.flush(g, m.paint, 'llave_pintura')
    M.flush(g, m.metal, 'llave_acero')
    H.flush(g, m.rubber, 'llave_mangueras', { cast: false })

    // PRL-1 / PRL-2 · grampas superior e inferior ("8 bulones con tuercas autofrenantes": 4 pasantes con cabeza y tuerca = 8 fijaciones)
    const clamp = (id, yc, note) => {
      const grp = dropsGroup(g, id, note)
      const cp = new Batch()
      const cm = new Batch()
      cp.box(C.GRAY, 0.18, 0.24, 0.04, 0.95, yc, 1.44)
      cp.box(C.GRAY, 0.18, 0.24, 0.04, 0.95, yc, 1.13)
      for (const dx of [-0.06, 0.06])
        for (const dy of [-0.08, 0.08]) {
          cm.cyl(C.STEEL, 0.02, 0.02, 0.36, 0.95 + dx, yc + dy, 1.285, 'z', 6)
          cm.cyl(C.DARK, 0.032, 0.032, 0.03, 0.95 + dx, yc + dy, 1.47, 'z', 6)
          cm.cyl(C.DARK, 0.032, 0.032, 0.03, 0.95 + dx, yc + dy, 1.1, 'z', 6)
        }
      cp.flush(grp, m.paint, id + '_grampa')
      cm.flush(grp, m.metal, id + '_bulones')
    }
    clamp(
      'PRL-1',
      4.4,
      'Libro DROPS p.24: grampa superior con 8 bulones y tuercas autofrenantes ([DUDOSO] "8 por bulones").',
    )
    clamp('PRL-2', 2.95, 'Libro DROPS p.25: grampa inferior, igual que PRL-1.')

    // PRL-3 · sujeción del brazo de la llave al poste: perno pasante con cadena y seguro + eslinga con grillete de 4 elementos
    const prl3 = dropsGroup(
      g,
      'PRL-3',
      'Libro DROPS p.25: perno pasante con cadena soldada y seguro; eslinga con grillete de 4 elementos.',
    )
    const pm = new Batch()
    const pc = new Batch()
    pm.cyl(C.STEEL, 0.03, 0.03, 0.22, 0.93, 3.0, 1.17, 'y', 8) // perno pasante
    pm.cyl(C.RED, 0.009, 0.009, 0.06, 0.93, 3.13, 1.17, 'x', 5) // seguro
    pm.loop(C.RED, 0.95, 3.36, 1.3, 0.06, 'xy', 0, 2 * PI, 0.012, 12) // grillete
    pc.tube(
      C.DARK,
      [
        [0.93, 3.11, 1.17],
        [0.98, 3.2, 1.25],
        [0.95, 3.3, 1.3],
      ],
      0.012,
    ) // cadena
    pm.flush(prl3, m.metal, 'PRL-3_perno')
    pc.flush(prl3, m.rubber, 'PRL-3_cadena', { cast: false })
  }

  // ═════════════════════════════════════════ CABALLETES + PLANCHADA + PLANO INCLINADO ═════════════════════════════════════════
  function buildCaballetes(g, api) {
    const m = mats(api)
    const P = new Batch()
    const M = new Batch()

    // PLANCHADA 12×2,4 m (LAYOUT TKR-10): x 3…15, eje del equipo. Altura de cubierta 0,6 m: estético.
    const X0 = 3
    const X1 = 15
    const XC = (X0 + X1) / 2
    const DECK = 0.6
    P.box(C.SKID, 12, 0.06, 2.4, XC, DECK - 0.03, 0) // cubierta
    for (let x = X0 + 0.5; x < X1; x += 0.5) P.box(C.GRAY, 0.04, 0.012, 2.34, x, DECK + 0.004, 0) // antideslizante (listones)
    for (const dz of [-1.15, 1.15]) M.box(C.STEEL, 12, 0.16, 0.1, XC, DECK - 0.14, dz) // largueros perimetrales
    for (let x = X0 + 0.1; x <= X1; x += 1.5) P.box(C.GRAY, 0.1, 0.12, 2.3, x, DECK - 0.12, 0) // vigas transversales
    for (let x = X0 + 0.4; x <= X1; x += 3.6)
      for (const dz of [-1.1, 1.1]) {
        P.box(C.GRAY, 0.12, DECK - 0.2, 0.12, x, (DECK - 0.2) / 2, dz) // patas
        P.box(C.SKID, 0.34, 0.04, 0.34, x, 0.02, dz) // apoyos
      }

    // PLA-2 · barandas de planchada (montante soldado en tintero con perno y seguro; rodapié)
    const pla2 = dropsGroup(
      g,
      'PLA-2',
      'Libro DROPS p.20: baranda en tintero soldado, con perno y seguro. Retención secundaria: no requerida.',
    )
    const RP = new Batch()
    RP.rail(
      C.YEL,
      [
        [X0 + 2.6, -1.2],
        [X1, -1.2],
        [X1, 1.2],
        [X0 + 2.6, 1.2],
      ],
      DECK,
      1.05,
    )
    RP.flush(pla2, m.paint, 'PLA-2_barandas')

    // PLA-1 · plano inclinado (bandeja): del borde del piso de trabajo (y≈2,3) a la planchada; 22°, ancho 1 m. Estético.
    const pla1 = dropsGroup(
      g,
      'PLA-1',
      'Libro DROPS p.20: fila incompleta ("BANDEJA HCA.") [DUDOSO]. Conexión con el piso de trabajo a verificar.',
    )
    const RM = new Batch() // acero: peldaños, pasamanos, patas
    const RPt = new Batch() // pintura: chapa y largueros
    const top = [2.2, 2.3]
    const bot = [6.4, DECK + 0.02]
    const ang = Math.atan2(top[1] - bot[1], bot[0] - top[0]) // pendiente (sube hacia −X)
    const len = Math.hypot(bot[0] - top[0], top[1] - bot[1])
    const along = (u) => [
      top[0] + (u / len) * (bot[0] - top[0]),
      top[1] - (u / len) * (top[1] - bot[1]),
    ] // punto a distancia u desde arriba
    const tilted = (b, c, w, h, d, u, dy, dz = 0) => {
      // caja alineada con la pendiente, centrada a distancia u desde el extremo alto
      const gg = new K.Box(w, h, d)
      gg.rotateZ(-ang)
      const [px, py] = along(u)
      b.push(gg, px, py + dy, dz, c)
    }
    tilted(RPt, C.SKID, len, 0.05, 1.0, len / 2, 0) // chapa
    for (const dz of [-0.5, 0.5]) tilted(RPt, C.YEL, len, 0.14, 0.05, len / 2, 0.07, dz) // largueros laterales
    for (let u = 0.35; u < len; u += 0.5) tilted(RM, C.STEEL, 0.05, 0.03, 0.9, u, 0.04) // travesaños antideslizantes
    for (const dz of [-0.5, 0.5])
      RM.rod(C.YEL, [top[0], top[1] + 0.95, dz], [bot[0], bot[1] + 0.95, dz], 0.024, 6) // pasamanos
    for (const u of [0, len / 2, len])
      for (const dz of [-0.5, 0.5]) {
        const [px, py] = along(u)
        RM.rod(C.YEL, [px, py, dz], [px, py + 0.95, dz], 0.024, 6) // montantes
      }
    for (const u of [len * 0.4, len * 0.85])
      for (const dz of [-0.45, 0.45]) {
        const [px, py] = along(u)
        RM.rod(C.GRAY, [px, py - 0.03, dz], [px, DECK, dz], 0.05, 6) // patas de la bandeja
      }
    RPt.flush(pla1, m.paint, 'PLA-1_bandeja')
    RM.flush(pla1, m.metal, 'PLA-1_pasamanos')

    // CABALLETES de 2 m (acero, 4,5 t c/u): 2 hileras con tubing 2 7/8" (arriba) y varillas (abajo), paralelas a la planchada
    const stand = (b, x, zc, half) => {
      b.box(C.YEL, 0.16, 0.14, half * 2, x, 0.62, zc) // viga
      for (const s of [-1, 1]) {
        b.box(C.YEL, 0.1, 0.6, 0.1, x, 0.3, zc + s * (half - 0.15)) // patas
        b.box(C.GRAY, 0.5, 0.06, 0.14, x, 0.03, zc + s * (half - 0.15)) // patines
        b.box(C.YEL, 0.06, 1.0, 0.06, x, 1.12, zc + s * (half - 0.02)) // topes laterales
      }
      b.rod(C.YEL, [x, 0.08, zc - half + 0.15], [x, 0.62, zc + half - 0.15], 0.022, 5)
    }
    const rows = [
      {
        zc: 5.0,
        half: 1.0,
        x: [4.6, 9.0, 13.4],
        pipes: { r: 0.045, len: 9.4, x0: 4.3, layers: [17, 16, 15] },
      },
      {
        zc: 7.7,
        half: 0.9,
        x: [5.6, 12.4],
        pipes: { r: 0.013, len: 8.0, x0: 5.0, layers: [12, 11] },
      },
    ]
    for (const row of rows) {
      for (const x of row.x) stand(P, x, row.zc, row.half)
      const { r, len: L, x0, layers } = row.pipes
      const pitch = r * 2.5
      layers.forEach((count, li) => {
        for (let k = 0; k < count; k++) {
          const z = row.zc + (k - (count - 1) / 2) * pitch
          const y = 0.7 + r + li * pitch * 0.9
          M.cyl(li % 2 ? C.GRAY_L : C.STEEL, r, r, L, x0 + L / 2, y, z, 'x', 6)
          if (r > 0.03) M.cyl(C.GRAY, r * 1.3, r * 1.3, 0.16, x0 + L - 0.1, y, z, 'x', 6) // cupla
        }
      })
    }
    P.flush(g, m.paint, 'planchada_caballetes_pintura')
    M.flush(g, m.metal, 'tubulares')
  }

  // ═════════════════════════════════════════ SISTEMA DE CIRCULACIÓN ═════════════════════════════════════════
  function buildCirculacion(g, api) {
    const m = mats(api)
    const P = new Batch()
    const M = new Batch()
    const H = new Batch()
    const zc = -14.7 // eje longitudinal de pileta y bomba (lateral del layout ≈ 14,4 m)

    // ── pileta de ensayo 12×2,4 m (40 m³ útiles; altura estética) en x −8…4
    P.box(C.SKID, 12.2, 0.22, 2.5, -2, 0.11, zc) // patín
    P.box(C.WHITE, 12, 1.7, 2.4, -2, 1.1, zc) // cuerpo blanco (Libro p.21: pileta blanca con letras rojas)
    for (const dz of [-1.21, 1.21]) P.box(C.RED, 12.02, 0.3, 0.02, -2, 0.5, zc + dz) // franja roja
    for (let x = -7.5; x < 4; x += 1.5)
      for (const dz of [-1.21, 1.21]) P.box(C.GRAY, 0.08, 1.7, 0.05, x, 1.1, zc + dz) // nervaduras
    P.box(C.GRAY, 12.02, 0.05, 2.42, -2, 1.975, zc) // cubierta
    for (const x of [-6.5, -2, 2.5]) M.cyl(C.STEEL, 0.32, 0.32, 0.1, x, 2.05, zc, 'y', 14) // bocas de inspección
    M.cyl(C.STEEL, 0.05, 0.05, 0.5, -4.2, 2.25, zc + 0.6, 'y', 8) // venteo

    // PIL-2 · barandas y rodapié perimetrales (tintero soldado, perno y seguro)
    const pil2 = dropsGroup(
      g,
      'PIL-2',
      'Libro DROPS p.21: baranda en tintero soldado con perno y seguro; rodapié.',
    )
    const RB = new Batch()
    RB.rail(
      C.YEL,
      [
        [-8, zc - 1.2],
        [4, zc - 1.2],
        [4, zc + 1.2],
        [-8, zc + 1.2],
        [-8, zc - 1.2],
      ],
      2.0,
      1.05,
    )
    RB.flush(pil2, m.paint, 'PIL-2_barandas')

    // escalera de acceso (lado pozo) y pasarela
    for (const dx of [-0.25, 0.25])
      M.rod(C.GRAY_L, [2.8 + dx, 0.22, zc + 1.4], [2.8 + dx, 2.0, zc + 1.25], 0.025)
    for (let y = 0.5; y < 1.95; y += 0.3)
      M.rod(
        C.GRAY_L,
        [2.55, y, zc + 1.38 - (y / 2) * 0.13],
        [3.05, y, zc + 1.38 - (y / 2) * 0.13],
        0.02,
        5,
      )

    // cubicador 3,5 m³ (cilindro vertical) y desgasificador (Cameron "gas buster") junto a la pileta
    P.cyl(C.BLUE_L, 0.65, 0.65, 2.4, 4.9, 1.4, zc, 'y', 20)
    P.cyl(C.BLUE_L, 0.25, 0.65, 0.22, 4.9, 2.71, zc, 'y', 20)
    M.cyl(C.STEEL, 0.05, 0.05, 2.3, 5.6, 1.4, zc + 0.3, 'y', 6) // visor de nivel
    P.cyl(C.RED, 0.3, 0.3, 2.6, -4.5, 1.5, zc - 2.2, 'y', 16)
    P.cyl(C.RED, 0.12, 0.3, 0.2, -4.5, 2.9, zc - 2.2, 'y', 16)
    M.rod(C.STEEL, [-4.5, 0.9, zc - 1.9], [-4.5, 0.9, zc - 1.2], 0.05)

    // ── bomba triplex 6×2,4 m (camisas 5", carrera 8", 3.000 psi, 12 bpm) en x −16…−10
    P.box(C.SKID, 6, 0.22, 2.4, -13, 0.11, zc) // patín
    for (const dz of [-1.1, 1.1]) P.box(C.GRAY, 6, 0.1, 0.12, -13, 0.27, zc + dz)
    // motor diésel Detroit S60 (rojo) con radiador frontal, tapa de válvulas y escape
    P.box(C.RED, 2.0, 1.25, 1.3, -14.9, 0.845, zc)
    P.box(C.DARK, 0.08, 1.0, 1.15, -15.94, 0.85, zc) // radiador
    for (let k = -2; k <= 2; k++) M.box(C.GRAY_L, 0.03, 0.9, 0.03, -15.99, 0.85, zc + k * 0.22) // aletas
    P.box(C.POWER, 1.5, 0.16, 0.9, -14.8, 1.55, zc) // tapa de válvulas
    M.rod(C.STEEL, [-15.6, 1.62, zc + 0.3], [-15.6, 2.7, zc + 0.3], 0.06, 8)
    M.cyl(C.DARK, 0.13, 0.13, 0.55, -15.6, 2.1, zc + 0.3, 'y', 10) // silenciador
    M.cyl(C.STEEL, 0.1, 0.1, 0.06, -15.6, 2.75, zc + 0.3, 'y', 10)
    P.box(C.GRAY, 1.0, 0.95, 0.95, -13.4, 0.695, zc) // caja Allison
    P.box(C.YEL, 0.7, 0.26, 0.5, -12.6, 0.45, zc) // protector de cardán
    M.cyl(C.STEEL, 0.06, 0.06, 0.6, -12.6, 0.7, zc, 'x', 8) // cardán
    // bastidor de fuerza con tapas de cruceta, tornillería y ojal de izaje
    P.box(C.POWER, 1.3, 1.1, 1.5, -11.9, 0.77, zc)
    for (const dz of [-0.42, 0, 0.42]) {
      M.cyl(C.GRAY_L, 0.2, 0.2, 0.1, -11.22, 0.77, zc + dz, 'x', 14) // tapa de cruceta
      M.cyl(C.GRAY_L, 0.05, 0.05, 0.4, -11.4, 0.7, zc + dz, 'x', 8) // émbolo
    }
    M.loop(C.STEEL, -11.9, 1.5, zc, 0.09, 'xy', 0, 2 * PI, 0.018, 10) // ojal de izaje
    // cuerpo de fluido (acero), tapas de válvula y cabezal de descarga
    M.box(C.STEEL, 0.6, 0.55, 1.3, -10.95, 0.7, zc)
    for (const dz of [-0.42, 0, 0.42])
      M.cyl(C.GRAY_L, 0.11, 0.11, 0.25, -10.95, 1.12, zc + dz, 'y', 10)
    M.rod(C.STEEL, [-10.65, 0.9, zc - 0.5], [-10.65, 0.9, zc + 0.5], 0.06)
    M.rod(C.STEEL, [-10.95, 0.35, zc - 0.55], [-10.95, 0.35, zc + 0.55], 0.06) // múltiple de succión
    P.cyl(C.RED, 0.2, 0.2, 0.65, -10.3, 0.55, zc + 0.75, 'y', 14) // amortiguador de pulsaciones
    P.cyl(C.RED, 0.08, 0.2, 0.14, -10.3, 0.94, zc + 0.75, 'y', 14)
    M.cyl(C.WHITE, 0.09, 0.09, 0.05, -10.6, 1.28, zc - 0.1, 'x', 12) // manómetro (tipo Cameron)
    M.cyl(C.RED, 0.05, 0.05, 0.16, -10.65, 1.08, zc + 0.3, 'y', 8) // válvula de seguridad 3.000 psi
    // barandas amarillas del patín (lado exterior y extremos)
    P.rail(
      C.YEL,
      [
        [-16, zc - 1.2],
        [-16, zc - 1.2 + 2.4],
        [-10.05, zc + 1.2],
      ],
      0.22,
      0.95,
      false,
    )

    // PIL-1 · luminarias (soporte abulonado, palmera rebatible con perno y seguro, artefacto con grampa cepo + eslinga de 3 mm)
    const pil1 = dropsGroup(
      g,
      'PIL-1',
      'Libro DROPS p.21: luminarias con eslingas de seguridad de 3 mm (pileta/bomba/generador/depósito/campamento).',
    )
    const LP = new Batch()
    const LM = new Batch()
    for (const [x, y0, z, out] of [
      [3.6, 2.0, zc + 1.0, 1],
      [-10.4, 0.22, zc + 1.1, 1],
      [-8.2, 2.0, zc - 1.0, -1],
    ]) {
      LM.rod(C.GRAY_L, [x, y0, z], [x, y0 + 3.0, z], 0.04, 8) // mástil
      LP.box(C.GRAY, 0.2, 0.05, 0.2, x, y0 + 0.03, z) // base abulonada
      LM.cyl(C.STEEL, 0.045, 0.045, 0.14, x, y0 + 0.5, z, 'x', 8) // perno de palmera rebatible
      LM.rod(C.GRAY_L, [x, y0 + 3.0, z], [x, y0 + 3.15, z + out * 0.55], 0.03, 6) // brazo
      LP.box(C.WHITE, 0.5, 0.1, 0.2, x, y0 + 3.17, z + out * 0.6) // artefacto
      LM.box(C.GLASS, 0.44, 0.02, 0.15, x, y0 + 3.11, z + out * 0.6)
      LM.rod(C.DARK, [x, y0 + 2.95, z], [x + 0.2, y0 + 3.12, z + out * 0.5], 0.008, 4) // eslinga de seguridad 3 mm
    }
    LP.flush(pil1, m.paint, 'PIL-1_luminarias')
    LM.flush(pil1, m.metal, 'PIL-1_soportes')

    // ── manifold de maniobra 2" 5.000 psi junto a la subestructura (x≈3,4, z≈−4,3)
    P.box(C.DARK, 2.8, 0.18, 1.3, 3.4, 0.09, -4.3)
    for (const y of [0.5, 0.82]) M.rod(C.STEEL, [2.3, y, -4.3], [4.5, y, -4.3], 0.07, 8)
    for (const x of [2.6, 3.4, 4.2]) {
      M.rod(C.STEEL, [x, 0.5, -4.3], [x, 0.82, -4.3], 0.06)
      P.box(C.GRAY, 0.22, 0.24, 0.22, x, 1.0, -4.3)
      P.cyl(C.RED, 0.12, 0.12, 0.03, x, 1.27, -4.3, 'y', 12)
    }
    M.cyl(C.WHITE, 0.09, 0.09, 0.05, 3.0, 1.0, -3.9, 'z', 12)

    // ── cañerías al pozo (acero r=5,5 cm) con uniones de martillo y soportes. Todo estético; nomenclatura sin validar.
    const line = (pts) => {
      for (let i = 1; i < pts.length; i++) M.rod(C.GRAY_L, pts[i - 1], pts[i], 0.055, 8)
      pts.slice(1, -1).forEach((p) => M.cyl(C.GRAY_L, 0.07, 0.07, 0.07, p[0], p[1], p[2], 'y', 8)) // codos
    }
    const union = (x, y, z, axis) => M.cyl(C.RED, 0.095, 0.095, 0.1, x, y, z, axis, 10)
    // A · descarga bomba → manifold → línea de matar del BOP
    line([
      [-10.65, 0.9, zc],
      [-9.2, 0.9, zc],
      [-9.2, 0.5, zc],
      [-9.2, 0.5, -12.9],
      [3.4, 0.5, -12.9],
      [3.4, 0.5, -5.0],
    ])
    line([
      [2.3, 0.55, -4.3],
      [0.2, 0.55, -4.3],
      [0.2, 0.6, -2.4],
    ])
    for (const x of [-6, -2.5, 1]) union(x, 0.5, -12.9, 'x')
    union(3.4, 0.5, -8.6, 'z')
    union(1.2, 0.55, -4.3, 'x')
    // B · retorno: línea de ahogar del BOP → pileta (elevada 1,25 m, cruza sobre A)
    line([
      [-0.2, 0.6, -2.4],
      [-0.2, 0.6, -3.0],
      [-0.2, 1.25, -3.0],
      [-0.2, 1.25, -13.5],
    ])
    union(-0.2, 1.25, -5.5, 'z')
    union(-0.2, 1.25, -9.5, 'z')
    for (const z of [-5.5, -8.4, -11.3]) {
      M.rod(C.GRAY, [-0.2, 0, z], [-0.2, 1.2, z], 0.05, 6)
      M.box(C.GRAY, 0.28, 0.04, 0.16, -0.2, 1.19, z)
    }
    // succión pileta → bomba
    line([
      [-8, 0.9, zc],
      [-9.2, 0.9, zc],
    ])
    // mangueras de servicio (goma)
    H.tube(
      C.HOSE,
      [
        [-10.3, 0.4, zc - 0.7],
        [-9.6, 0.2, zc - 1.6],
        [-8.6, 0.2, zc - 2.4],
      ],
      0.05,
    )

    P.flush(g, m.paint, 'circulacion_pintura')
    M.flush(g, m.metal, 'circulacion_acero')
    H.flush(g, m.rubber, 'circulacion_mangueras', { cast: false })
  }

  // ═════════════════════════════════════════ PRE: registro de componentes ═════════════════════════════════════════
  window.__rigExt.onPre((api) => {
    bootKit(api)
    // Se envuelve/reemplaza el registro `Ot` del visor: los componentes se construyen justo después de este hook.
    wrapAparejo(api)
    api.Ot.bop = (g) => buildBop(g, api)
    api.Ot.llave = (g) => buildLlave(g, api)
    api.Ot.caballetes = (g) => buildCaballetes(g, api)
    api.Ot.circulacion = (g) => buildCirculacion(g, api)
  })

  // ═════════════════════════════════════════ POST: entorno de locación + calcomanías ═════════════════════════════════════════
  function rng(seed) {
    // mulberry32 (determinista)
    let a = seed >>> 0
    return () => {
      a = (a + 0x6d2b79f5) >>> 0
      let t = a
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  /** Recupera la clase CanvasTexture desde un mesh existente (el visor no la expone). */
  function findCanvasTextureClass(scene) {
    let cls = null
    scene.traverse((o) => {
      if (!cls && o.isMesh && o.material && o.material.map && o.material.map.isCanvasTexture)
        cls = o.material.map.constructor
    })
    return cls
  }

  function textTexture(w, h, draw) {
    const cv = document.createElement('canvas')
    cv.width = w
    cv.height = h
    const ctx = cv.getContext('2d')
    draw(ctx, w, h)
    const t = new K.CanvasTexture(cv)
    t.colorSpace = K.colorSpace
    t.anisotropy = 4
    return t
  }

  /** Textura de ripio repetible (ruido procedural, sin archivos externos). */
  function gravelTexture() {
    const S = 512
    const rand = rng(7)
    return textTexture(S, S, (ctx) => {
      ctx.fillStyle = '#8b8372'
      ctx.fillRect(0, 0, S, S)
      const speck = (x, y, r, col) => {
        ctx.fillStyle = col
        for (const ox of [0, x < r * 2 ? S : x > S - r * 2 ? -S : 0])
          for (const oy of [0, y < r * 2 ? S : y > S - r * 2 ? -S : 0]) {
            ctx.beginPath()
            ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2)
            ctx.fill()
          }
      }
      const cols = ['#a29a86', '#7a7364', '#6c6558', '#b3ab98', '#5f5a50', '#9b9280']
      for (let i = 0; i < 40; i++)
        speck(
          rand() * S,
          rand() * S,
          18 + rand() * 40,
          `rgba(${(100 + rand() * 40) | 0},${(94 + rand() * 36) | 0},${(80 + rand() * 30) | 0},0.18)`,
        )
      for (let i = 0; i < 9000; i++)
        speck(rand() * S, rand() * S, 0.8 + rand() * 2.6, cols[(rand() * cols.length) | 0])
    })
  }

  function buildEnvironment(R) {
    const T = R.three
    K.Sphere = T.SphereGeometry
    K.Ring = T.RingGeometry
    K.StdMat = T.MeshStandardMaterial
    K.BasicMat = T.MeshBasicMaterial
    K.CanvasTexture = findCanvasTextureClass(R.scene)
    if (K.CanvasTexture) {
      const anyMap = (() => {
        let mp = null
        R.scene.traverse((o) => {
          if (!mp && o.isMesh && o.material && o.material.map) mp = o.material.map
        })
        return mp
      })()
      K.colorSpace = anyMap ? anyMap.colorSpace : undefined
    }

    const env = new K.Group()
    env.name = 'locacion_entorno'
    env.userData.selectable = false // fuera de los 13 componentes: no entra en R.pickables ni en el registro de materiales
    R.scene.add(env)

    const rand = rng(2024)
    const mat = new K.StdMat({ vertexColors: true, roughness: 0.78, metalness: 0.12 })
    const S = new Batch() // estructuras (proyectan sombra)
    const F = new Batch() // vallado y menudencias (sin sombra)

    // ── suelo de ripio: disco de 60 m con borde difuso (alfa por vértice) sobre el suelo y la grilla del visor
    {
      const ring = new K.Ring(0.01, 60, 72, 24)
      ring.rotateX(-PI / 2)
      ring.translate(0, 0.05, 0)
      const pos = ring.attributes.position
      const col = new Float32Array(pos.count * 4)
      for (let i = 0; i < pos.count; i++) {
        const r = Math.hypot(pos.getX(i), pos.getZ(i))
        const a = r < 42 ? 1 : Math.max(0, 1 - (r - 42) / 18)
        col.set([1, 1, 1, a * a * (3 - 2 * a)], i * 4)
      }
      ring.setAttribute('color', new K.Attr(col, 4))
      const uv = ring.attributes.uv
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 20, uv.getY(i) * 20) // repetición del ripio (~6 m por tesela)
      let map = null
      if (K.CanvasTexture) {
        map = gravelTexture()
        map.wrapS = map.wrapT = 1000 // RepeatWrapping
      }
      const padMat = new K.StdMat({
        map,
        color: map ? '#ffffff' : '#7d7463',
        vertexColors: true,
        transparent: true,
        roughness: 1,
        metalness: 0,
      })
      const pad = new K.Mesh(ring, padMat)
      pad.name = 'ripio_locacion'
      pad.receiveShadow = true
      env.add(pad)
    }

    // ── piedras sueltas (una sola malla, ~200 esferas achatadas)
    for (let i = 0; i < 200; i++) {
      const a = rand() * PI * 2
      const r = 4 + Math.sqrt(rand()) * 52
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      if (Math.abs(x) < 14 && Math.abs(z) < 3) continue // sin piedras bajo el carrier
      const s = 0.08 + rand() * 0.22
      const g = new K.Sphere(s, 5, 4)
      g.scale(1 + rand() * 0.6, 0.55 + rand() * 0.3, 1 + rand() * 0.6)
      g.rotateY(rand() * PI)
      const k = 0.35 + rand() * 0.3
      F.push(
        g,
        x,
        s * 0.35 + 0.02,
        z,
        '#' +
          [0.62, 0.58, 0.5]
            .map((v) =>
              Math.round(v * k * 255 * 1.4)
                .toString(16)
                .padStart(2, '0'),
            )
            .join(''),
      )
    }

    // ── tráilers, tanques y usinas según LAYOUT TKR-10 (12×2,4 m; fila a 31,6 m del pozo hacia el carrier; z: izquierda del plano = +z)
    const trailer = (cx, cz, opts = {}) => {
      const {
        len = 12,
        wid = 2.4,
        body = C.WHITE,
        stripe = C.BLUE,
        parts = 1,
        wheels = true,
      } = opts
      S.box('#3a3e45', len + 0.2, 0.25, wid - 0.2, cx, 0.5, cz, PI / 2) // bastidor
      S.box(body, wid, 2.6, len, cx, 1.925, cz) // caja (long. a lo largo de z)
      S.box(stripe, wid + 0.02, 0.32, len + 0.02, cx, 1.15, cz)
      S.box('#7b8087', wid + 0.12, 0.1, len + 0.12, cx, 3.27, cz) // techo
      if (wheels)
        for (const dz of [-3.6, -2.7])
          for (const sx of [-1, 1])
            S.cyl('#15171c', 0.42, 0.42, 0.3, cx + sx * (wid / 2 - 0.05), 0.42, cz + dz, 'x', 12) // ruedas traseras
      for (let k = 0; k < parts; k++) {
        const pz = cz - len / 2 + ((k + 0.5) * len) / parts
        for (const sx of [-1, 1]) {
          S.box(C.GLASS, 0.03, 0.75, 1.1, cx + sx * (wid / 2 + 0.01), 2.2, pz - 0.9)
          S.box('#565b63', 0.03, 1.9, 0.9, cx + sx * (wid / 2 + 0.01), 1.55, pz + 1.0) // puerta
        }
        if (parts === 1 || k === 0) S.box('#4a4f57', 0.8, 0.4, 0.7, cx, 3.5, pz) // equipo de A/A
      }
      if (parts > 1)
        for (let k = 1; k < parts; k++)
          S.box('#2b2f36', wid + 0.04, 2.6, 0.04, cx, 1.925, cz - len / 2 + (k * len) / parts)
    }
    const LX = -31.6
    trailer(LX, 20.9, { stripe: '#9a9d94' }) // jefe de equipo
    trailer(LX, 6.1, { stripe: '#9a9d94' }) // encargado de turno / personal
    trailer(LX - 8.1, 20.9, { stripe: '#9a9d94' }) // descanso CR
    trailer(LX, -23.3, { parts: 4, stripe: C.RED, wheels: false }) // laboratorio · taller · depósito · usinas
    // tanques de combustible (12.465 l) y agua (8.300 l) sobre patín
    S.box('#3a3e45', 12.2, 0.25, 2.2, LX, 0.5, -8.6, PI / 2)
    for (const [dz, r, L, col] of [
      [-3.3, 0.95, 5.4, '#c9cdc8'],
      [2.9, 0.88, 4.2, '#9fb7c7'],
    ]) {
      S.cyl(col, r, r, L, LX, 1.65, -8.6 + dz, 'z', 20)
      S.box(C.RED, 2 * r + 0.02, 0.28, 0.04, LX, 1.65, -8.6 + dz)
      S.cyl('#7b8087', 0.2, 0.2, 0.2, LX, 2.7, -8.6 + dz, 'y', 10)
    }
    // usina (grupo electrógeno John Deere, cabina insonorizada) junto al laboratorio
    S.box('#c5c9c3', 2.0, 2.2, 3.6, LX + 3.6, 1.3, -21.5)
    S.cyl('#3a3e45', 0.08, 0.08, 1.2, LX + 3.0, 3.9, -20.4, 'y', 8)
    for (let k = 0; k < 4; k++)
      S.box('#2b2f36', 0.04, 0.9, 0.12, LX + 4.62, 1.4, -22.9 + k * 0.28 * 2)

    // ── anclaje de pirosalva a 30 m del pozo (LAYOUT TKR-10, eje del equipo hacia el lado de la planchada)
    S.box(C.CONC, 1.2, 0.3, 1.2, 30, 0.17, 0)
    S.loop('#4d5057', 30, 0.5, 0, 0.22, 'zy', 0, PI * 2, 0.03, 14)

    // ── torres de iluminación blancas (estéticas): 4, apuntando al equipo
    const towers = [
      [-24, 9],
      [-24, -9],
      [17, 13],
      [13, -12],
    ]
    const LEN = new Batch() // lentes encendidas
    const LOFF = new Batch() // lentes apagadas
    const halo = []
    for (const [tx, tz] of towers) {
      const face = Math.atan2(-tx, -tz) // yaw hacia el pozo
      S.box('#e8eaea', 2.2, 0.3, 1.4, tx, 0.55, tz, face)
      for (const [dx, dz] of [
        [1.2, 0.85],
        [1.2, -0.85],
        [-1.2, 0.85],
        [-1.2, -0.85],
      ]) {
        const c = Math.cos(face)
        const s = Math.sin(face)
        S.rod(
          '#c9cdd0',
          [tx + dx * c + dz * s, 0.45, tz - dx * s + dz * c],
          [tx + dx * 1.6 * c + dz * 1.3 * s, 0.05, tz - dx * 1.6 * s + dz * 1.3 * c],
          0.04,
          5,
        ) // estabilizadores
      }
      S.cyl('#e8eaea', 0.11, 0.11, 7.2, tx, 4.3, tz, 'y', 10)
      S.cyl('#f4f5f3', 0.08, 0.08, 1.8, tx, 8.7, tz, 'y', 10)
      for (let k = 0; k < 4; k++) {
        const ox = (k - 1.5) * 0.52
        const house = new K.Box(0.48, 0.34, 0.22)
        house.rotateX(0.5)
        house.translate(ox, 0, 0)
        house.rotateY(face)
        S.push(house, tx, 9.75, tz, '#3a3e45')
        for (const B of [LEN, LOFF]) {
          const lens = new K.Box(0.42, 0.28, 0.02)
          lens.translate(0, 0, 0.12)
          lens.rotateX(0.5)
          lens.translate(ox, 0, 0)
          lens.rotateY(face)
          B.push(lens, tx, 9.75, tz, B === LEN ? '#fff3c4' : '#8a9096')
        }
      }
      // pozo de luz en el piso + haz cónico (solo de noche): geometrías con alfa por vértice, mezcla aditiva
      const hd = Math.hypot(tx, tz)
      const hx = tx - (tx / hd) * 11
      const hz = tz - (tz / hd) * 11
      const ringG = new K.Ring(0.01, 13, 28, 6)
      ringG.rotateX(-PI / 2)
      const hp = ringG.attributes.position
      const rgba = new Float32Array(hp.count * 4)
      for (let i = 0; i < hp.count; i++) {
        const r = Math.hypot(hp.getX(i), hp.getZ(i)) / 13
        rgba.set([1, 0.86, 0.5, 0.5 * Math.pow(1 - r, 1.6)], i * 4)
      }
      halo.push({ geo: ringG, x: hx, y: 0.08, z: hz, rgba })
      const dx = tx - hx
      const dy = 9.8
      const dz = tz - hz
      const dl = Math.hypot(dx, dy, dz)
      const beamG = new K.Cyl(0.25, 5.5, dl, 20, 1, true)
      const bp = beamG.attributes.position
      const brgba = new Float32Array(bp.count * 4)
      for (let i = 0; i < bp.count; i++) {
        const t = (bp.getY(i) + dl / 2) / dl // 0 = piso, 1 = lámpara
        brgba.set([1, 0.88, 0.55, 0.2 * t * t], i * 4)
      }
      beamG.rotateZ(-Math.acos(dy / dl))
      beamG.rotateY(-Math.atan2(dz, dx))
      halo.push({ geo: beamG, x: hx + dx / 2, y: 0.08 + dy / 2, z: hz + dz / 2, rgba: brgba })
    }
    const lensOnMat = new K.BasicMat({ vertexColors: true })
    const lensOffMat = new K.StdMat({ vertexColors: true, roughness: 0.3, metalness: 0.2 })
    const lensOn = LEN.flush(env, lensOnMat, 'torres_lentes_on', { cast: false, receive: false })
    const lensOff = LOFF.flush(env, lensOffMat, 'torres_lentes_off', {
      cast: false,
      receive: false,
    })
    const HB = new Batch()
    for (const h of halo) HB.push(h.geo, h.x, h.y, h.z, undefined, h.rgba)
    const haloMat = new K.BasicMat({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: 2,
      side: 2,
    })
    const haloMesh = HB.flush(env, haloMat, 'torres_pozo_de_luz', { cast: false, receive: false })
    if (haloMesh) haloMesh.renderOrder = 3 // después del ripio (ambos transparentes y con la misma posición: sin esto el ripio tapa el resplandor)

    // ── vallado perimetral (estético, con acceso al sur) — postes cada 4 m y dos cabos; NO representa zona de exclusión
    const FX0 = -46
    const FX1 = 34
    const FZ = 31
    const fence = (x1, z1, x2, z2, gap) => {
      const len = Math.hypot(x2 - x1, z2 - z1)
      const n = Math.round(len / 4)
      for (let k = 0; k <= n; k++) {
        const t = k / n
        const x = x1 + (x2 - x1) * t
        const z = z1 + (z2 - z1) * t
        if (gap && x > gap[0] && x < gap[1]) continue
        F.box(k % 2 ? '#d9d6c9' : C.ORANGE, 0.07, 1.25, 0.07, x, 0.62, z)
      }
      for (const y of [0.55, 1.05]) {
        if (!gap) F.rod('#c9c2a8', [x1, y, z1], [x2, y, z2], 0.012, 4)
        else {
          F.rod('#c9c2a8', [x1, y, z1], [gap[0], y, z2], 0.012, 4)
          F.rod('#c9c2a8', [gap[1], y, z1], [x2, y, z2], 0.012, 4)
        }
      }
    }
    fence(FX0, -FZ, FX1, -FZ, [-12, -4]) // sur, con portón entre x −12 y −4
    fence(FX1, -FZ, FX1, FZ)
    fence(FX1, FZ, FX0, FZ)
    fence(FX0, FZ, FX0, -FZ)
    for (const x of [-12, -4]) S.box('#f2b632', 0.16, 2.0, 0.16, x, 1.0, -FZ) // pilares del portón

    // ── conos de tránsito: portón, extremo de planchada y esquinas de equipos (decorativo, sin significado de zona)
    const cone = (x, z) => {
      S.box('#26292f', 0.42, 0.03, 0.42, x, 0.045, z)
      S.cyl(C.ORANGE, 0.03, 0.17, 0.7, x, 0.4, z, 'y', 10)
      S.cyl('#f1f1ee', 0.082, 0.106, 0.12, x, 0.44, z, 'y', 10)
    }
    for (const [x, z] of [
      [-13, -29.5],
      [-3, -29.5],
      [-13, -26.5],
      [-3, -26.5],
      [-8, -22],
      [16.5, 2.1],
      [16.5, -2.1],
      [-9.3, -12.1],
      [-9.3, -17.3],
      [6.6, -3.2],
      [6.6, 3.2],
      [-19, 6.4],
      [-9, 6.4],
    ])
      cone(x, z)

    // ── camioneta de servicio (estética): local → mundo con giro `ry`
    const pickup = (cx, cz, ry, col) => {
      const c = Math.cos(ry)
      const sn = Math.sin(ry)
      const put = (lx, ly, lz, w, h, d, color) =>
        S.box(color, w, h, d, cx + lx * c + lz * sn, ly, cz - lx * sn + lz * c, ry)
      put(0, 0.75, 0, 5.2, 0.7, 1.9, col) // chasis y caja
      put(0.6, 1.4, 0, 1.9, 0.75, 1.8, col) // cabina
      put(0.65, 1.45, 0, 1.75, 0.55, 1.82, C.GLASS) // vidrios
      put(-1.4, 1.15, 0, 2.0, 0.3, 1.86, '#c9cdc8') // caja de carga
      for (const lx of [1.6, -1.6])
        for (const lz of [-0.95, 0.95]) {
          const wx = cx + lx * c + lz * sn
          const wz = cz - lx * sn + lz * c
          S.cyl('#15171c', 0.4, 0.4, 0.3, wx, 0.4, wz, 'z', 12)
        }
    }
    pickup(-24, 26.5, 0.25, '#f1f1ee')
    pickup(-28.5, 27.5, -0.1, '#f1f1ee')

    // ── camino de acceso de ripio oscuro desde el portón (estético)
    F.box('#736d60', 6.0, 0.03, 30, -8, 0.065, -46)
    F.box('#736d60', 12, 0.03, 4, -8, 0.065, -29)

    // ── manga de viento (mástil de 7 m con cuatro tramos alternados) y balizas
    S.cyl('#c9cdd0', 0.06, 0.08, 7, 26, 3.5, -24, 'y', 8)
    for (let k = 0; k < 4; k++)
      S.cyl(
        k % 2 ? '#f1f1ee' : C.ORANGE,
        0.32 - k * 0.055,
        0.37 - k * 0.055,
        0.55,
        26.4 + k * 0.55,
        7.1 - k * 0.03,
        -24,
        'x',
        10,
        true,
      )
    S.loop('#c9cdd0', 26.06, 7.1, -24, 0.38, 'zy', 0, PI * 2, 0.02, 12)

    S.flush(env, mat, 'locacion_estructuras', { cast: true, receive: true })
    F.flush(env, mat, 'locacion_vallado_y_piedras', { cast: false, receive: true })

    // ── señalización (carteles con texto; estético, sin valor de control operacional)
    const signs = []
    if (K.CanvasTexture) {
      const mkSign = (x, z, ry, w, h, txt, bg, fg, sub) => {
        const tex = textTexture(512, Math.round((512 * h) / w), (ctx, cw, ch) => {
          ctx.fillStyle = bg
          ctx.fillRect(0, 0, cw, ch)
          ctx.strokeStyle = fg
          ctx.lineWidth = 8
          ctx.strokeRect(12, 12, cw - 24, ch - 24)
          ctx.fillStyle = fg
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.font = 'bold 56px Arial'
          ctx.fillText(txt, cw / 2, ch * (sub ? 0.4 : 0.5), cw - 50)
          if (sub) {
            ctx.font = '34px Arial'
            ctx.fillText(sub, cw / 2, ch * 0.72, cw - 50)
          }
        })
        const board = new K.Mesh(
          new K.Box(w, h, 0.05),
          new K.StdMat({ map: tex, roughness: 0.6, metalness: 0 }),
        )
        board.position.set(x, 2.2, z)
        board.rotation.y = ry
        board.name = 'cartel_' + txt.toLowerCase().replace(/\W+/g, '_')
        board.castShadow = true
        env.add(board)
        signs.push(board)
        for (const dx of [-w / 2 + 0.1, w / 2 - 0.1]) {
          S.box('#565b63', 0.06, 2.2, 0.06, x + dx * Math.cos(ry), 1.1, z - dx * Math.sin(ry))
        }
      }
      mkSign(-8, -30.6, 0, 1.6, 0.9, 'ACCESO A LOCACIÓN', '#1d4f6b', '#ffffff', 'TACKER 10')
      mkSign(-27, 14.5, PI / 2, 1.3, 0.8, 'PUNTO DE REUNIÓN', '#1f6f43', '#ffffff')
      mkSign(33.4, 7, -PI / 2, 1.3, 0.8, 'EQUIPO EN OPERACIÓN', '#f2b632', '#1b1b1b')
      S.flush(env, mat, 'carteles_postes', { cast: true, receive: true })
    }

    return { env, lensOn, lensOff, haloMesh }
  }

  /** Letreros sobre componentes ya construidos (necesitan CanvasTexture, que sólo existe tras el arranque). */
  function addDecals(R) {
    if (!K.CanvasTexture) return
    const decal = (compId, parent, w, h, x, y, z, ry, tex) => {
      const mat = new K.StdMat({ map: tex, transparent: true, roughness: 0.55, metalness: 0.1 })
      const mesh = new K.Mesh(new K.Box(w, h, 0.006), mat)
      mesh.position.set(x, y, z)
      mesh.rotation.y = ry
      mesh.name = compId + '_letrero'
      mesh.userData.id = compId
      parent.add(mesh)
      R.pickables.push(mesh) // conserva la selección del componente al hacer clic sobre el letrero
      if (R.materials[compId]) R.materials[compId].push(mat) // hover/selección (emissive)
      return mesh
    }
    // pileta: "TACKER" rojo sobre el costado blanco (Libro p.21)
    const tack = textTexture(1024, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = C.RED
      ctx.font = 'italic 900 190px Arial Black, Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('TACKER', w / 2, h * 0.5)
    })
    const circ = R.groups.circulacion
    if (circ) {
      decal('circulacion', circ, 4.6, 1.15, -2, 1.25, -14.7 + 1.222, 0, tack)
      decal('circulacion', circ, 4.6, 1.15, -2, 1.25, -14.7 - 1.222, PI, tack)
    }
    // bloque IDECO: chapa de datos en la mejilla (110 t · 6 líneas según folleto)
    const blk = R.groups.aparejo && R.groups.aparejo.getObjectByName('bloque_viajero')
    if (blk) {
      const plate = textTexture(512, 160, (ctx, w, h) => {
        ctx.fillStyle = '#d9d9d2'
        ctx.fillRect(0, 0, w, h)
        ctx.strokeStyle = '#2b2f36'
        ctx.lineWidth = 6
        ctx.strokeRect(6, 6, w - 12, h - 12)
        ctx.fillStyle = '#1b1b1b'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = 'bold 66px Arial'
        ctx.fillText('IDECO 110 t', w / 2, h * 0.38)
        ctx.font = 'bold 44px Arial'
        ctx.fillText('6 LÍNEAS', w / 2, h * 0.75)
      })
      decal('aparejo', blk, 0.5, 0.16, 0, -0.14, 0.383, 0, plate)
      decal('aparejo', blk, 0.5, 0.16, 0, -0.14, -0.383, PI, plate)
    }
  }

  window.__rigExt.onPost((R) => {
    if (!K.ready) return
    const { env, lensOn, lensOff, haloMesh } = buildEnvironment(R)
    addDecals(R)

    // Vista nocturna: enciende las torres. Aislar: oculta el entorno. Se sincroniza tras cada clic (el handler del botón corre antes).
    const sync = () => {
      const night = !!(R.view && R.view.night)
      if (lensOn) lensOn.visible = night
      if (lensOff) lensOff.visible = !night
      if (haloMesh) haloMesh.visible = night
      env.visible = !(R.view && R.view.isolated)
    }
    document.addEventListener('click', sync)
    sync()
  })
})()
