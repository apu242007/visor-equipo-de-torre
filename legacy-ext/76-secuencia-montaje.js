/*
 * 76-secuencia-montaje.js — secuencia de MONTAJE (rig-up) ilustrativa, paso a paso.
 *
 * Un control de 8 pasos que va armando el equipo: muestra/oculta componentes del visor usando las casillas del árbol (la misma
 * técnica que 75-mode-presets.js) y explica qué pasa en cada paso. NO es una simulación ni un procedimiento: es un recorrido
 * visual y acumulativo.
 *
 * FUENTE Y ESTATUS: la lista de pasos es la "secuencia típica de montaje" aportada por el usuario (docs/secuencia-montaje-tipica.md).
 * NO es el procedimiento de Tacker ni una exigencia de empresa, cliente o norma: estatus `pendingValidation`. La asignación de
 * componentes a cada paso es una lectura visual orientativa del modelo, no una afirmación de ingeniería. Los pasos 1-3 y 8 son en
 * buena parte documentales (reunión, verificaciones, pruebas): no tienen geometría propia y el panel lo dice.
 *
 * NO se anima el izamiento del mástil (no hay secuencia ni ángulos documentados) ni se inventan tiempos, cargas o distancias.
 * Antorcha y separador no están modelados: el panel los marca "sin geometría".
 *
 * Extras para pruebas: `window.__tackerSeq = { steps, go(n), current() }`.
 */
window.__rigExt.onPost(() => {
  const $ = (id) => document.getElementById(id)
  const R = window.__rig
  if (!R || !R.groups) return

  const ALL = Object.keys(R.groups)

  /** `add` = componentes que aparecen EN ese paso (se acumulan). `nota` = lo que el modelo no dibuja. */
  const STEPS = [
    {
      n: 1,
      titulo: 'Reunión pre-tarea, ATS y asignación de responsabilidades',
      add: [],
      geo: false,
      texto: 'Paso documental: no tiene geometría asociada. La locación se ve sin equipo.',
    },
    {
      n: 2,
      titulo: 'Verificación de acceso, nivelación, capacidad portante, drenajes y anclajes',
      add: [],
      geo: false,
      texto:
        'Paso documental: verificaciones de la locación. El modelo no representa capacidad portante ni drenajes; los anclajes de vientos se ven recién al izar el mástil (paso 6).',
    },
    {
      n: 3,
      titulo: 'Descarga y alineación de componentes (plan de izaje y zonas de riesgo)',
      add: ['camion'],
      geo: true,
      texto:
        'Llega el portaequipo. El plan de izaje y las zonas de riesgo son del procedimiento; acá solo se ve el camión.',
    },
    {
      n: 4,
      titulo: 'Posicionamiento y nivelación de la subestructura',
      add: ['subestructura'],
      geo: true,
      texto:
        'Subestructura y piso de trabajo sobre el portaequipo. La nivelación no se representa.',
    },
    {
      n: 5,
      titulo: 'Montaje de malacate, motores, transmisión, cabina, BOP y equipos auxiliares',
      add: ['malacate', 'motor', 'cabina', 'bop', 'llave', 'caballetes'],
      geo: true,
      texto:
        'Se suman malacate, motor y transmisión, cabina, BOP con acumulador y choke manifold, llave y caballetes.',
    },
    {
      n: 6,
      titulo:
        'Izamiento del mástil, con control de plomo, contravientos y verificación estructural',
      add: ['mastil', 'aparejo', 'enganche', 'vientos'],
      geo: true,
      texto:
        'Aparece el mástil con aparejo, piso del enganchador y vientos. El izamiento NO se anima: no hay secuencia ni ángulos documentados. Plomo y verificación estructural no se representan.',
    },
    {
      n: 7,
      titulo:
        'Líneas de circulación, choke manifold, separador/golpeador, líneas de retorno, piletas y antorcha',
      add: ['circulacion'],
      geo: true,
      nota: 'Sin geometría: antorcha y separador.',
      texto:
        'Bomba triplex, pileta de ensayo con golpeador y cañerías al pozo. El choke manifold ya venía con el BOP.',
    },
    {
      n: 8,
      titulo:
        'Pruebas funcionales, prueba de presión cuando corresponda, checklists y liberación para workover',
      add: [],
      geo: false,
      texto: 'Paso documental: pruebas y liberación. El equipo queda completo en el modelo.',
    },
  ]

  const visibleAt = (idx) => {
    const set = new Set()
    for (let i = 0; i <= idx; i++) STEPS[i].add.forEach((c) => ALL.includes(c) && set.add(c))
    return set
  }

  // ───────── UI ─────────
  const style = document.createElement('style')
  style.id = 'seq-style'
  style.textContent = `
    #rig-seq{position:fixed;left:50%;bottom:44px;transform:translateX(-50%);z-index:20;width:min(760px,calc(100vw - 32px));
      background:rgba(20,27,38,.95);border:1px solid #303B4B;border-radius:12px;color:#DDE3EC;font-size:13px;
      box-shadow:0 10px 30px rgba(0,0,0,.45)}
    #rig-seq .sq-head{display:flex;align-items:center;gap:10px;padding:8px 12px}
    #rig-seq .sq-title{font-weight:600;color:#DDBB65;letter-spacing:.02em}
    #rig-seq .sq-tag{font-size:11px;opacity:.75}
    #rig-seq button{font:inherit;color:inherit;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);
      border-radius:8px;padding:4px 10px;cursor:pointer}
    #rig-seq button:hover{background:rgba(255,255,255,.1)}
    #rig-seq button[aria-pressed="true"]{border-color:#DDBB65;color:#DDBB65}
    #rig-seq button:focus-visible,#rig-seq input:focus-visible{outline:none;box-shadow:0 0 0 2px #05060A,0 0 0 4px rgba(139,92,246,.7)}
    #rig-seq .sq-spacer{flex:1}
    #rig-seq .sq-body{padding:0 12px 10px}
    #rig-seq.collapsed .sq-body{display:none}
    #rig-seq input[type=range]{width:100%;margin:4px 0 8px}
    #rig-seq .sq-steps{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
    #rig-seq .sq-steps button{min-width:32px;padding:3px 0}
    #rig-seq .sq-step-title{font-weight:600;margin-bottom:2px}
    #rig-seq .sq-text{opacity:.9;line-height:1.4}
    #rig-seq .sq-meta{margin-top:6px;font-size:12px;opacity:.8;line-height:1.4}
    #rig-seq .sq-warn{margin-top:6px;font-size:11.5px;color:#E0B870}
    body.opts-hidden #rig-seq{display:none}
    @media (max-width:700px){#rig-seq{bottom:38px}}
  `
  document.head.appendChild(style)

  const panel = document.createElement('section')
  panel.id = 'rig-seq'
  panel.setAttribute('aria-label', 'Secuencia de montaje ilustrativa')
  panel.className = window.innerWidth < 1100 ? 'collapsed' : ''
  panel.innerHTML = `
    <div class="sq-head">
      <span class="sq-title">Secuencia de montaje</span>
      <span class="sq-tag">ilustrativa · pendiente de validar</span>
      <span class="sq-spacer"></span>
      <button type="button" id="sq-prev" aria-label="Paso anterior">‹</button>
      <button type="button" id="sq-next" aria-label="Paso siguiente">›</button>
      <button type="button" id="sq-toggle" aria-expanded="${panel_expanded()}" aria-controls="sq-body">Ocultar</button>
    </div>
    <div class="sq-body" id="sq-body">
      <input type="range" id="sq-range" min="0" max="${STEPS.length}" step="1" value="0" aria-label="Paso del montaje (0 = sin secuencia)">
      <div class="sq-steps" id="sq-steps"></div>
      <div id="sq-status" aria-live="polite">
        <div class="sq-step-title">Sin secuencia activa</div>
        <div class="sq-text">Elegí un paso para ir armando el equipo. El 0 deja todos los componentes visibles.</div>
      </div>
    </div>`
  function panel_expanded() {
    return window.innerWidth < 1100 ? 'false' : 'true'
  }
  document.body.appendChild(panel)

  const stepsBox = $('sq-steps')
  STEPS.forEach((s) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = String(s.n)
    b.title = s.titulo
    b.setAttribute('aria-pressed', 'false')
    b.addEventListener('click', () => go(s.n))
    stepsBox.appendChild(b)
  })

  let current = 0

  function setVisible(only) {
    for (const id of ALL) {
      const want = only ? only.has(id) : true
      const box = document.querySelector('.item[data-id="' + id + '"] input')
      if (box && box.checked !== want) box.click()
    }
  }

  function render() {
    $('sq-range').value = String(current)
    Array.from(stepsBox.children).forEach((b, i) =>
      b.setAttribute('aria-pressed', String(i + 1 === current)),
    )
    const status = $('sq-status')
    if (current === 0) {
      status.innerHTML =
        '<div class="sq-step-title">Sin secuencia activa</div><div class="sq-text">Elegí un paso para ir armando el equipo. El 0 deja todos los componentes visibles.</div>'
      return
    }
    const s = STEPS[current - 1]
    const vis = [...visibleAt(current - 1)]
    const names = vis.map((id) => (R.COMPONENTS && R.COMPONENTS[id] && R.COMPONENTS[id].name) || id)
    status.innerHTML =
      `<div class="sq-step-title">${s.n}/8 · ${s.titulo}</div>` +
      `<div class="sq-text">${s.texto}</div>` +
      `<div class="sq-meta">${s.geo ? 'Se suma en este paso: ' + (s.add.join(', ') || '—') : 'Paso documental: sin geometría propia.'}` +
      `${vis.length ? ' · Visibles: ' + names.length + ' de ' + ALL.length : ' · Sin componentes visibles'}${s.nota ? ' · ' + s.nota : ''}</div>` +
      '<div class="sq-warn">Secuencia típica aportada por el usuario: no es el procedimiento de Tacker ni un requisito. Recorrido visual, no simulación.</div>'
    const meta = status.querySelector('.sq-meta')
    if (meta) meta.title = names.join(' · ')
  }

  function go(n) {
    const k = Math.max(0, Math.min(STEPS.length, Number(n) || 0))
    current = k
    setVisible(k === 0 ? null : visibleAt(k - 1))
    render()
  }

  $('sq-range').addEventListener('input', (e) => go(e.target.value))
  $('sq-prev').addEventListener('click', () => go(current - 1))
  $('sq-next').addEventListener('click', () => go(current + 1))
  $('sq-toggle').addEventListener('click', () => {
    const collapsed = panel.classList.toggle('collapsed')
    $('sq-toggle').textContent = collapsed ? 'Mostrar' : 'Ocultar'
    $('sq-toggle').setAttribute('aria-expanded', String(!collapsed))
  })
  $('sq-toggle').textContent = panel.classList.contains('collapsed') ? 'Mostrar' : 'Ocultar'

  // Un cambio de modo aplica su propio preset de componentes: la secuencia deja de mandar.
  document.addEventListener('tacker:mode', () => {
    if (current !== 0) {
      current = 0
      render()
    }
  })

  window.__tackerSeq = { steps: STEPS, go, current: () => current }
})
